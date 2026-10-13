import { OcrResult, PaymentMethod } from '../types';
import { INITIAL_EXPENSE_CATEGORIES as EXPENSE_CATEGORIES } from '../data/categories';

/**
 * Compresses an image file or Data URL to approximately targetKB (default 80KB)
 * using HTML Canvas for ultra-fast processing and minimal payload.
 */
export async function compressImageTo80KB(
  file: File | string,
  targetKB: number = 80
): Promise<{ base64: string; mimeType: string; sizeKB: number; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    const processImage = async () => {
      try {
        if (img.decode) {
          await img.decode();
        }
      } catch {
        // Fallback if decode is not supported in browser
      }

      // Calculate scaled dimensions to keep aspect ratio while reducing pixel count
      let { width, height } = img;
      if (!width || !height) {
        reject(new Error('Image failed to load: zero dimensions detected'));
        return;
      }

      const MAX_DIM = 1200;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get 2D canvas context'));
        return;
      }

      // Draw white background then image
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Iteratively find quality to fit ~80KB
      let quality = 0.75;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      let sizeKB = Math.round((dataUrl.length * 3) / 4 / 1024);

      if (sizeKB > targetKB) {
        quality = Math.max(0.2, (targetKB / sizeKB) * 0.7);
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        sizeKB = Math.round((dataUrl.length * 3) / 4 / 1024);
      }

      const base64 = dataUrl.split(',')[1];
      if (!base64 || base64.length < 100) {
        reject(new Error('Generated image payload is invalid or empty'));
        return;
      }

      resolve({
        base64,
        mimeType: 'image/jpeg',
        sizeKB,
        dataUrl,
      });
    };

    img.onload = processImage;
    img.onerror = () => reject(new Error('Failed to load image for compression'));

    if (typeof file === 'string') {
      img.src = file;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    }
  });
}

/**
 * Formatted prompt instructing Gemini AI OCR to parse Moroccan receipts.
 */
function buildOcrPrompt(): string {
  const categoriesContext = EXPENSE_CATEGORIES.map(
    (c) => `- ${c.name}: [${c.subcategories.join(', ')}]`
  ).join('\n');

  return `
You are an expert AI OCR financial auditor specialized in Moroccan receipts, supermarket bills, store invoices, and utility notices.
Common merchants and bills in Morocco include:
- Supermarkets & Groceries: BIM, Marjane, Marjane Market, Carrefour, Supeco, Acima, Label'Vie, local neighborhood grocery stores.
- Utilities & Telecoms: Lydec, ONEE, Inwi, Maroc Telecom (IAM), Orange Maroc.
- Beauty & Personal Care: Nocibé, Yan&One, Marionnaud, Yves Rocher, local pharmacies, beauty salons, Sephora.
- Transit & Mobility: ONCF Trains (Al Boraq / TNR), Tramway, InDrive, Heetch, Careem, Bus.

Extract all relevant financial information from this Moroccan receipt/invoice image and return ONLY a valid, raw JSON object (strictly NO markdown formatting, no code blocks, no backticks, no explanations).

Use this exact JSON schema:
{
  "merchant": "Store or Organization Name (e.g., BIM Maarif, Marjane Californie, Lydec, Inwi)",
  "date": "YYYY-MM-DD (if year is missing assume current year 2026, or best estimate)",
  "total": 0.00,
  "paymentMethod": "Cash" | "Card" | "Bank Transfer",
  "suggestedCategory": "One of the Primary Category Names listed below",
  "suggestedSubcategory": "One of the Subcategories under the chosen Category",
  "items": [
    {
      "name": "Item Name",
      "price": 0.00,
      "quantity": 1,
      "category": "Subcategory"
    }
  ]
}

Available Categories & Subcategories:
${categoriesContext}

Notes:
1. Ensure all numeric amounts are in Moroccan Dirhams (DH).
2. If payment method is not clearly marked, default to "Card" if it looks like a POS terminal slip, or "Cash" for supermarket till receipts.
3. If specific items are not distinguishable (e.g. utility invoice), create one item with the invoice description and total.
4. "total" MUST be a positive number representing the final amount paid in DH.
`;
}

export interface FailoverEvent {
  fromKeyIndex: number;
  toKeyIndex: number;
  modelUsed?: string;
  errorCode?: number;
  errorMessage: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Candidate models in priority order: gemini-3.5-flash-lite has lowest token consumption and highest uptime
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.6-flash',
];

/**
 * Scans receipt image using Gemini Vision with intelligent multi-model cascade,
 * 1.5s controlled backoff on 503/429 spikes, and automatic key rotation.
 */
export async function scanReceiptWithRotation(
  base64Image: string,
  mimeType: string,
  keys: [string, string, string, string],
  onFailover?: (event: FailoverEvent) => void
): Promise<OcrResult> {
  const validKeys = keys
    .map((k, index) => ({ key: k.trim(), index }))
    .filter((k) => k.key.length > 5);

  if (validKeys.length === 0) {
    throw new Error(
      'No valid Gemini API Keys found. Please add at least one Gemini API Key in Settings.'
    );
  }

  const prompt = buildOcrPrompt();
  const errors: string[] = [];

  for (let kIdx = 0; kIdx < validKeys.length; kIdx++) {
    const { key, index: keyIndex } = validKeys[kIdx];

    // Try each responsive candidate model for this key
    for (let mIdx = 0; mIdx < CANDIDATE_MODELS.length; mIdx++) {
      const model = CANDIDATE_MODELS[mIdx];
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
        key
      )}`;

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Image,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2048,
            },
          }),
        });

        // 1. Permanent Auth failure (401 or 403) -> Do not waste time trying other models on this invalid key
        if (response.status === 401 || response.status === 403) {
          const errText = await response.text();
          const reason = `Key #${keyIndex + 1} denied access (HTTP ${response.status}): ${errText.substring(0, 90)}`;
          errors.push(reason);

          if (kIdx < validKeys.length - 1) {
            const nextKeyIndex = validKeys[kIdx + 1].index;
            onFailover?.({
              fromKeyIndex: keyIndex,
              toKeyIndex: nextKeyIndex,
              errorCode: response.status,
              errorMessage: `Key #${keyIndex + 1} access denied. Switching to Key #${nextKeyIndex + 1}...`,
            });
          }
          // Break model loop to advance immediately to next key
          break;
        }

        // 2. High demand (503) or Rate Limit (429) -> Controlled delay before fallback
        if (response.status === 503 || response.status === 429) {
          const errText = await response.text();
          const reason = `Key #${keyIndex + 1} (${model}) status ${response.status}: ${errText.substring(0, 90)}`;
          errors.push(reason);

          // If more models exist on this key, wait 1.5 seconds then try next model
          if (mIdx < CANDIDATE_MODELS.length - 1) {
            onFailover?.({
              fromKeyIndex: keyIndex,
              toKeyIndex: keyIndex,
              modelUsed: CANDIDATE_MODELS[mIdx + 1],
              errorCode: response.status,
              errorMessage: `${model} busy (HTTP ${response.status}). Waiting 1.5s for ${CANDIDATE_MODELS[mIdx + 1]}...`,
            });
            await sleep(1500);
            continue;
          }

          // If all models exhausted for this key, wait 1.5s and failover to next key
          if (kIdx < validKeys.length - 1) {
            const nextKeyIndex = validKeys[kIdx + 1].index;
            onFailover?.({
              fromKeyIndex: keyIndex,
              toKeyIndex: nextKeyIndex,
              errorCode: response.status,
              errorMessage: `Key #${keyIndex + 1} temporary limit. Waiting 1.5s to switch to Key #${nextKeyIndex + 1}...`,
            });
            await sleep(1500);
            break;
          }

          throw new Error(`Google Gemini service busy (503/429). Please try retry button in a moment.`);
        }

        // 3. Other HTTP error
        if (!response.ok) {
          const errText = await response.text();
          errors.push(`Key #${keyIndex + 1} (${model}) HTTP ${response.status}: ${errText.substring(0, 80)}`);
          if (mIdx < CANDIDATE_MODELS.length - 1) {
            await sleep(1000);
            continue;
          }
          break;
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (!rawText) {
          throw new Error(`${model} returned an empty response.`);
        }

        // Parse JSON safely from returned content
        const parsed = parseGeminiJsonResponse(rawText);

        return {
          merchant: parsed.merchant || 'Moroccan Merchant',
          date: parsed.date || new Date().toISOString().split('T')[0],
          total: Number(parsed.total) || 0,
          paymentMethod: sanitizePaymentMethod(parsed.paymentMethod),
          suggestedCategory: parsed.suggestedCategory || 'Food & Dining',
          suggestedSubcategory:
            parsed.suggestedSubcategory || 'Groceries (BIM / Marjane / Local Market)',
          items: Array.isArray(parsed.items)
            ? parsed.items.map((it: any) => ({
                name: String(it.name || 'Item'),
                price: Number(it.price) || 0,
                quantity: Number(it.quantity) || 1,
                category: it.category ? String(it.category) : undefined,
              }))
            : [],
          rawText,
          keyUsedIndex: keyIndex,
        };
      } catch (err: any) {
        const errorMsg = err.message || String(err);
        errors.push(`Key #${keyIndex + 1} (${model}): ${errorMsg}`);

        // If models remaining on this key, pause and try next
        if (mIdx < CANDIDATE_MODELS.length - 1) {
          await sleep(1000);
          continue;
        }
        break;
      }
    }
  }

  throw new Error(`Gemini Scanner Failover: ${errors.join(' | ')}`);
}

function parseGeminiJsonResponse(text: string): any {
  // Strip code block fences if present
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```/, '').replace(/```$/, '').trim();
  }

  try {
    return JSON.parse(clean);
  } catch {
    // If there is preamble or postamble, locate the first { and last }
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const extracted = clean.substring(firstBrace, lastBrace + 1);
      return JSON.parse(extracted);
    }
    throw new Error('Could not parse structured JSON from OCR response.');
  }
}

function sanitizePaymentMethod(val: any): PaymentMethod {
  if (val === 'Cash' || val === 'Card' || val === 'Bank Transfer') {
    return val;
  }
  const str = String(val).toLowerCase();
  if (str.includes('card') || str.includes('carte') || str.includes('cmi')) return 'Card';
  if (str.includes('virement') || str.includes('transfer')) return 'Bank Transfer';
  return 'Cash';
}
