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

    const processImage = () => {
      // Calculate scaled dimensions to keep aspect ratio while reducing pixel count
      let { width, height } = img;
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
 * Formatted prompt instructing Gemini 3.6 Flash to parse Moroccan receipts.
 */
function buildOcrPrompt(): string {
  const categoriesContext = EXPENSE_CATEGORIES.map(
    (c) => `- ${c.name}: [${c.subcategories.join(', ')}]`
  ).join('\n');

  return `
You are an expert AI OCR financial auditor specialized in Moroccan receipts, supermarket bills, store invoices, and utility notices.
Common merchants and bills in Morocco include:
- Supermarkets & Groceries: BIM, Marjane, Marjane Market, Carrefour, Carrefour Market, Supeco, Acima, Label'Vie, BIM Stores, Hanout / local épicerie.
- Utilities & Telecoms: Lydec, RADEEJ, SRM, ONEE, Redal, Amendis, Inwi, Maroc Telecom (IAM), Orange Maroc.
- Beauty & Personal Care: Nocibé, Yan&One, Marionnaud, Yves Rocher, local pharmacies, beauty salons, Sephora.
- Mobility: InDrive, Heetch, Careem, Tramway Rabat/Casablanca, Afriquia, Shell, TotalEnergies, Winxo.

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
  errorCode?: number;
  errorMessage: string;
}

/**
 * Scans receipt image using Gemini 3.6 Flash with automatic 0ms failover
 * across up to 4 configured API Keys.
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

  for (let i = 0; i < validKeys.length; i++) {
    const { key, index } = validKeys[i];
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(
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

      // Handle Quota Limit (429), Server Busy (503), Auth (400/401/403) or generic errors
      if (!response.ok) {
        const errorText = await response.text();
        const reason = `Key #${index + 1} failed with HTTP ${response.status}: ${errorText.substring(0, 120)}`;
        errors.push(reason);

        // If there's another key available, trigger failover callback with 0ms delay
        if (i < validKeys.length - 1) {
          const nextIndex = validKeys[i + 1].index;
          onFailover?.({
            fromKeyIndex: index,
            toKeyIndex: nextIndex,
            errorCode: response.status,
            errorMessage: `HTTP ${response.status} error on Key ${index + 1}. Instant failover to Key ${nextIndex + 1}...`,
          });
          continue; // 0ms delay immediately to next key
        } else {
          throw new Error(
            `All configured Gemini API Keys failed. Last error: ${response.status}`
          );
        }
      }

      const data = await response.json();
      const rawText =
        data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!rawText) {
        throw new Error('Gemini 3.6 Flash returned an empty response.');
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
          parsed.suggestedSubcategory || 'Groceries (BIM / Marjane / Hanout)',
        items: Array.isArray(parsed.items)
          ? parsed.items.map((it: any) => ({
              name: String(it.name || 'Item'),
              price: Number(it.price) || 0,
              quantity: Number(it.quantity) || 1,
              category: it.category ? String(it.category) : undefined,
            }))
          : [],
        rawText,
        keyUsedIndex: index,
      };
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      errors.push(`Key #${index + 1} Exception: ${errorMsg}`);

      if (i < validKeys.length - 1) {
        const nextIndex = validKeys[i + 1].index;
        onFailover?.({
          fromKeyIndex: index,
          toKeyIndex: nextIndex,
          errorMessage: `Network/API exception on Key ${index + 1}. Auto-switching to Key ${nextIndex + 1}...`,
        });
        continue;
      } else {
        throw new Error(`Gemini Scanner Failover exhausted. ${errors.join(' | ')}`);
      }
    }
  }

  throw new Error(`Failed to scan receipt with all keys: ${errors.join(' | ')}`);
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
