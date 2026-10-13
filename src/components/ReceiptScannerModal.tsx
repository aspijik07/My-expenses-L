import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  compressImageTo80KB,
  scanReceiptWithRotation,
  FailoverEvent,
} from '../services/geminiOcr';
import { OcrResult } from '../types';
import { getNextReceiptBatchColor, BatchColorDefinition } from '../utils/batchColors';
import confetti from 'canvas-confetti';
import {
  X,
  Camera,
  UploadCloud,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Layers,
  FileCheck,
  Sliders,
  DollarSign,
  Calendar,
  Store,
  Tag,
  CheckSquare,
  Square,
  Trash2,
  Plus,
  Palette,
  Split,
  Receipt,
} from 'lucide-react';

export interface EditableReceiptItem {
  id: string;
  name: string;
  price: number;
  checked: boolean;
  category?: string;
}

export const ReceiptScannerModal: React.FC = () => {
  const {
    isScannerOpen,
    setIsScannerOpen,
    settings,
    setIsSettingsOpen,
    transactions,
    addTransaction,
    addTransactionsBatch,
    addLog,
  } = useApp();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalSizeKB, setOriginalSizeKB] = useState<number>(0);
  const [compressedSizeKB, setCompressedSizeKB] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<OcrResult | null>(null);
  const [editableItems, setEditableItems] = useState<EditableReceiptItem[]>([]);
  const [activeBatchColor, setActiveBatchColor] = useState<BatchColorDefinition | null>(null);
  const [failoverLogs, setFailoverLogs] = useState<FailoverEvent[]>([]);
  const [activeKeyAttempt, setActiveKeyAttempt] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const configuredKeys = settings.geminiKeys.map((k, idx) => ({
    index: idx,
    hasKey: k && k.trim().length > 5,
  }));

  const handleClose = () => {
    setIsScannerOpen(false);
    setImagePreview(null);
    setScanResult(null);
    setEditableItems([]);
    setActiveBatchColor(null);
    setFailoverLogs([]);
    setErrorMessage(null);
  };

  const processAndScanImage = async (file: File) => {
    setErrorMessage(null);
    setFailoverLogs([]);
    setScanResult(null);
    setActiveKeyAttempt(0);

    const origKB = Math.round(file.size / 1024);
    setOriginalSizeKB(origKB);
    setIsCompressing(true);

    try {
      // 1. Canvas Compression to ~80KB
      const { base64, mimeType, sizeKB, dataUrl } = await compressImageTo80KB(file, 80);
      setCompressedSizeKB(sizeKB);
      setImagePreview(dataUrl);
      setIsCompressing(false);

      // 2. Scan with Gemini 3.6 Flash and 4-Key rotation
      setIsScanning(true);

      const result = await scanReceiptWithRotation(
        base64,
        mimeType,
        settings.geminiKeys,
        (failover) => {
          setActiveKeyAttempt(failover.toKeyIndex);
          setFailoverLogs((prev) => [...prev, failover]);
          addLog(
            'SCAN_RECEIPT',
            `Key #${failover.fromKeyIndex + 1} Failover`,
            failover.errorMessage,
            'warning'
          );
        }
      );

      setScanResult(result);
      setActiveKeyAttempt(result.keyUsedIndex);
      setIsScanning(false);

      // Determine unique batches and assign distinct batch color
      const uniqueBatches = new Set(transactions.map((t) => t.batchId).filter(Boolean));
      const chosenColor = getNextReceiptBatchColor(uniqueBatches.size);
      setActiveBatchColor(chosenColor);

      // Populate items
      const rawItems = result.items || [];
      const populatedItems: EditableReceiptItem[] = rawItems.map((it, idx) => ({
        id: `it-${Date.now()}-${idx}`,
        name: it.name,
        price: it.price,
        checked: true,
        category: it.category || result.suggestedCategory,
      }));

      // If items sum is less than total (e.g., tax/timbre fiscal of 0.15 DH on Marjane ticket), include difference line
      const itemsSum = populatedItems.reduce((s, it) => s + it.price, 0);
      const remainingDiff = Math.round((result.total - itemsSum) * 100) / 100;
      if (remainingDiff > 0.05) {
        populatedItems.push({
          id: `it-${Date.now()}-timbre`,
          name: 'Stamp Duty / Timbre Fiscal & Fees',
          price: remainingDiff,
          checked: true,
          category: result.suggestedCategory,
        });
      }
      setEditableItems(populatedItems);

      addLog(
        'SCAN_RECEIPT',
        `Receipt Scanned: ${result.merchant}`,
        `Total: ${result.total.toFixed(2)} DH via Key #${result.keyUsedIndex + 1} (${populatedItems.length} items parsed)`
      );
    } catch (err: any) {
      setIsCompressing(false);
      setIsScanning(false);
      const msg = err.message || 'Failed to scan receipt';
      setErrorMessage(msg);
      addLog('SCAN_RECEIPT', 'Scan Failed', msg, 'error');
    }
  };

  // Moroccan Sample Receipts for instant test
  const loadSampleReceipt = async (sampleType: 'bim' | 'marjane' | 'redal' | 'oncf' | 'inwi') => {
    // Generate a simulated realistic Moroccan receipt on canvas
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Receipt paper background
    ctx.fillStyle = '#FAFAF8';
    ctx.fillRect(0, 0, 600, 800);

    // Decorative receipt header
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';

    let merchantName = 'BIM SUPERMARKET';
    let totalText = 'TOTAL: 185.50 DH';
    let dateText = `DATE: ${new Date().toISOString().split('T')[0]}`;
    let items = [
      '1. UHT Semi-Skimmed Milk 6L   54.00 DH',
      '2. Pasta & Tomato Sauce       38.50 DH',
      '3. Yogurt & Fresh Cheese      44.00 DH',
      '4. Cookies & Instant Coffee   49.00 DH',
    ];

    if (sampleType === 'marjane') {
      merchantName = 'MARJANE MARKET';
      totalText = 'TOTAL: 340.00 DH';
      items = [
        '1. Fresh Fruits & Vegetables 120.00 DH',
        '2. Laundry Detergent Pods    95.00 DH',
        '3. Shampoo & Body Wash        85.00 DH',
        '4. Dark Chocolate & Tea       40.00 DH',
      ];
    } else if (sampleType === 'redal') {
      merchantName = 'CARREFOUR MARKET';
      totalText = 'AMOUNT: 215.40 DH';
      items = [
        '1. Olive Oil & Moroccan Tea   145.20 DH',
        '2. Snacks & Juices             55.20 DH',
        '3. Paper Towels & Cleaners     15.00 DH',
      ];
    } else if (sampleType === 'oncf') {
      merchantName = 'ONCF TRAIN EXPRESS';
      totalText = 'TICKET PRICE: 149.00 DH';
      items = [
        '1. Al Boraq High Speed Train 149.00 DH',
      ];
    } else if (sampleType === 'inwi') {
      merchantName = 'INWI FIBRE DAR';
      totalText = 'MONTHLY BILL: 249.00 DH';
      items = [
        '1. High Speed Home Fibre 50M 249.00 DH',
      ];
    }

    ctx.fillText(merchantName, 300, 70);
    ctx.font = '16px monospace';
    ctx.fillText('MAROC', 300, 100);
    ctx.fillText(dateText, 300, 130);
    ctx.fillText('--------------------------------', 300, 160);

    ctx.textAlign = 'left';
    let y = 210;
    for (const item of items) {
      ctx.fillText(item, 80, y);
      y += 45;
    }

    ctx.textAlign = 'center';
    ctx.fillText('--------------------------------', 300, y + 20);
    ctx.font = 'bold 22px monospace';
    ctx.fillText(totalText, 300, y + 70);
    ctx.font = '14px monospace';
    ctx.fillText('PAIEMENT: CARTE BANCAIRE CMI', 300, y + 110);
    ctx.fillText('MERCI DE VOTRE VISITE', 300, y + 150);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${sampleType}-receipt.jpg`, { type: 'image/jpeg' });
        processAndScanImage(file);
      }
    }, 'image/jpeg', 0.8);
  };

  const handleToggleItem = (id: string) => {
    setEditableItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it))
    );
  };

  const handleUpdateItem = (id: string, updates: Partial<EditableReceiptItem>) => {
    setEditableItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...updates } : it))
    );
  };

  const handleDeleteItem = (id: string) => {
    setEditableItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleAddItem = () => {
    setEditableItems((prev) => [
      ...prev,
      {
        id: `it-${Date.now()}`,
        name: 'Extra Item',
        price: 5.0,
        checked: true,
        category: scanResult?.suggestedCategory,
      },
    ]);
  };

  const handleToggleAllItems = () => {
    const allChecked = editableItems.every((it) => it.checked);
    setEditableItems((prev) => prev.map((it) => ({ ...it, checked: !allChecked })));
  };

  // 1. Split individual items into their own transaction entries (Recommended by user)
  const handleConfirmSplitItems = async () => {
    if (!scanResult) return;
    const checkedItems = editableItems.filter((it) => it.checked && it.price > 0);
    if (checkedItems.length === 0) return;

    const batchId = 'batch-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const batchColorHex = activeBatchColor?.hex || '#A78BFA';

    const txsToCreate = checkedItems.map((it) => ({
      type: 'expense' as const,
      amount: it.price,
      itemName: it.name,
      category: it.category || scanResult.suggestedCategory,
      subcategory: scanResult.suggestedSubcategory,
      paymentMethod: scanResult.paymentMethod,
      bankName: scanResult.paymentMethod === 'Card' ? ('Banque Populaire (Chaabi Bank)' as const) : undefined,
      merchant: scanResult.merchant,
      date: scanResult.date,
      notes: `Receipt item from ${scanResult.merchant}`,
      batchId,
      batchColor: batchColorHex,
      batchName: scanResult.merchant,
      receiptThumbnail: imagePreview || undefined,
    }));

    await addTransactionsBatch(txsToCreate);

    confetti({
      particleCount: 65,
      spread: 75,
      origin: { y: 0.6 },
      colors: [batchColorHex, '#FF85A1', '#FFC2D1', '#06D6A0'],
    });

    handleClose();
  };

  // 2. Import as single lump-sum receipt
  const handleConfirmSingleReceipt = async () => {
    if (!scanResult) return;
    const batchId = 'batch-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const batchColorHex = activeBatchColor?.hex || '#A78BFA';

    await addTransaction({
      type: 'expense',
      amount: scanResult.total,
      category: scanResult.suggestedCategory,
      subcategory: scanResult.suggestedSubcategory,
      paymentMethod: scanResult.paymentMethod,
      bankName: scanResult.paymentMethod === 'Card' ? 'Banque Populaire (Chaabi Bank)' : undefined,
      merchant: scanResult.merchant,
      date: scanResult.date,
      notes: 'Scanned receipt ticket',
      items: scanResult.items,
      batchId,
      batchColor: batchColorHex,
      batchName: scanResult.merchant,
      receiptThumbnail: imagePreview || undefined,
    });

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: [batchColorHex, '#FF85A1', '#FFC2D1', '#06D6A0'],
    });

    handleClose();
  };

  if (!isScannerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-card rounded-3xl p-6 sm:p-8 border border-rosegold-400/30 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 text-white flex items-center justify-center shadow-md">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Receipt Scanner
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instant smart scan for Moroccan store & supermarket tickets
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => {
                setIsScannerOpen(false);
                setIsSettingsOpen(true);
              }}
              className="text-xs font-bold underline ml-2"
            >
              Add API Key
            </button>
          </div>
        )}

        {/* Upload & Capture Zone - Split into 2 stylish cards */}
        {!scanResult && (
          <div className="mt-5 space-y-4">
            {isScanning || isCompressing ? (
              <div className="border-2 border-pink-400/40 rounded-3xl p-10 text-center bg-pink-500/5 space-y-3">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-pink-500/15 text-pink-500 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 animate-spin" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  {isCompressing
                    ? 'Optimizing image...'
                    : 'Analyzing ticket details...'}
                </p>
                <p className="text-xs text-slate-400">
                  Reading store name, date, items, and total DH...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Direct Camera Scan Card */}
                <div
                  onClick={() => cameraInputRef.current?.click()}
                  className="group relative flex flex-col items-center justify-center p-7 rounded-3xl border-2 border-dashed border-pink-400/50 hover:border-pink-500 bg-pink-500/5 hover:bg-pink-500/10 transition-all cursor-pointer text-center space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Scan with Camera
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Snap photo directly with your camera
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-pink-500/15 text-pink-600 dark:text-pink-300 border border-pink-500/20">
                    Open Camera
                  </span>
                </div>

                {/* 2. Upload / Drag Ticket Card */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) processAndScanImage(e.dataTransfer.files[0]);
                  }}
                  className="group relative flex flex-col items-center justify-center p-7 rounded-3xl border-2 border-dashed border-purple-400/50 hover:border-purple-500 bg-purple-500/5 hover:bg-purple-500/10 transition-all cursor-pointer text-center space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Upload or Drag Ticket
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Choose receipt image from gallery or files
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                    Browse Files
                  </span>
                </div>
              </div>
            )}

            {/* Hidden native inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) processAndScanImage(e.target.files[0]);
              }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) processAndScanImage(e.target.files[0]);
              }}
            />

            {/* Quick Sample Receipts for testing */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Quick Test Sample:</span>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => loadSampleReceipt('bim')}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-300 border border-pink-400/20 cursor-pointer"
                >
                  BIM
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleReceipt('marjane')}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-400/20 cursor-pointer"
                >
                  Marjane
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleReceipt('redal')}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-400/20 cursor-pointer"
                >
                  Carrefour
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleReceipt('oncf')}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-300 border border-teal-400/20 cursor-pointer"
                >
                  Train
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleReceipt('inwi')}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-400/20 cursor-pointer"
                >
                  Inwi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OCR Result Review & Confirmation Screen */}
        {scanResult && (
          <div className="mt-5 space-y-5 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Extracted Successfully • Ready to review and save</span>
              </div>
              <button
                onClick={() => {
                  setScanResult(null);
                  setImagePreview(null);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline"
              >
                Scan Another
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Merchant & Date */}
              <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center space-x-2">
                  <Store className="w-4 h-4 text-rosegold-400" />
                  <span className="text-xs font-semibold text-slate-500">Merchant / Store</span>
                </div>
                <input
                  type="text"
                  value={scanResult.merchant}
                  onChange={(e) => setScanResult({ ...scanResult, merchant: e.target.value })}
                  className="w-full text-base font-bold bg-transparent text-slate-900 dark:text-white border-b border-dashed border-slate-300 dark:border-slate-600 pb-1 focus:border-rosegold-400"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500">Date</span>
                  <input
                    type="date"
                    value={scanResult.date}
                    onChange={(e) => setScanResult({ ...scanResult, date: e.target.value })}
                    className="text-xs font-bold bg-transparent text-slate-900 dark:text-white border-b border-slate-300 dark:border-slate-600"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500">Payment</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                    {scanResult.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Detected Total & Auto-Category */}
              <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Total in Moroccan Dirhams</span>
                  <span className="text-xs font-bold text-rosegold-400">DH</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={scanResult.total}
                    onChange={(e) => setScanResult({ ...scanResult, total: parseFloat(e.target.value) || 0 })}
                    className="w-full text-3xl font-extrabold text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 pb-1 focus:border-rosegold-400"
                  />
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Auto-Classified Category
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-rosegold-400/10 text-rosegold-500 border border-rosegold-400/20">
                      {scanResult.suggestedCategory}
                    </span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-xl bg-lavender-500/10 text-lavender-500 border border-lavender-500/20">
                      {scanResult.suggestedSubcategory}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Receipt Batch Color Group */}
            {activeBatchColor && (
              <div
                style={{
                  borderColor: `${activeBatchColor.hex}50`,
                  backgroundColor: `${activeBatchColor.hex}10`,
                }}
                className="p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center space-x-3">
                  <div
                    style={{ backgroundColor: activeBatchColor.hex }}
                    className="w-4 h-4 rounded-full ring-4 ring-white/30 shadow-xs flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Receipt Batch Theme:
                      </span>
                      <span
                        style={{ color: activeBatchColor.hex }}
                        className="text-xs font-extrabold"
                      >
                        {activeBatchColor.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      All items from this receipt will be color-coded together with this color on your dashboard.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 self-end sm:self-auto">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  <span
                    style={{
                      color: activeBatchColor.hex,
                      backgroundColor: `${activeBatchColor.hex}20`,
                      borderColor: `${activeBatchColor.hex}40`,
                    }}
                    className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border"
                  >
                    Ticket Batch
                  </span>
                </div>
              </div>
            )}

            {/* Itemized List with Individual Select & Edit */}
            {editableItems.length > 0 && (
              <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center space-x-2">
                    <FileCheck className="w-4 h-4 text-pink-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Individual Ticket Items ({editableItems.length})
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      • {editableItems.filter((it) => it.checked).length} selected ({editableItems.filter((it) => it.checked).reduce((s, it) => s + it.price, 0).toFixed(2)} DH)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleToggleAllItems}
                      className="text-[11px] font-semibold text-pink-500 hover:text-pink-600 underline"
                    >
                      {editableItems.every((it) => it.checked) ? 'Deselect All' : 'Select All'}
                    </button>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-[11px] font-semibold text-lavender-500 hover:text-lavender-600 flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Item</span>
                    </button>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {editableItems.map((it) => (
                    <div
                      key={it.id}
                      style={{
                        borderColor: it.checked && activeBatchColor ? `${activeBatchColor.hex}40` : undefined,
                      }}
                      className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-all ${
                        it.checked
                          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                          : 'bg-slate-50/50 dark:bg-slate-900/30 opacity-60 border-dashed border-slate-300 dark:border-slate-800'
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleItem(it.id)}
                        className="p-1 text-slate-400 hover:text-pink-500 transition-colors flex-shrink-0"
                      >
                        {it.checked ? (
                          <CheckSquare className="w-4 h-4 text-pink-500" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      {/* Item Name Input */}
                      <input
                        type="text"
                        value={it.name}
                        onChange={(e) => handleUpdateItem(it.id, { name: e.target.value })}
                        placeholder="Item name"
                        className="flex-1 text-xs font-semibold bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none focus:border-b focus:border-pink-400 min-w-0"
                      />

                      {/* Price Input in DH */}
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <input
                          type="number"
                          step="0.01"
                          value={it.price}
                          onChange={(e) => handleUpdateItem(it.id, { price: parseFloat(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 text-right text-xs font-extrabold text-pink-500 bg-slate-100 dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-400"
                        />
                        <span className="text-[10px] font-bold text-slate-400">DH</span>
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(it.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0"
                        title="Remove line"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions: Split into Individual Items vs Single Total */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 self-center sm:self-auto"
              >
                Discard
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Option 2: Lump Sum */}
                <button
                  type="button"
                  onClick={handleConfirmSingleReceipt}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-pink-300 transition-all flex items-center justify-center space-x-1.5"
                >
                  <Receipt className="w-3.5 h-3.5 text-slate-400" />
                  <span>Import as 1 Total ({scanResult.total.toFixed(2)} DH)</span>
                </button>

                {/* Option 1: Split individual items (Recommended!) */}
                <button
                  type="button"
                  onClick={handleConfirmSplitItems}
                  disabled={editableItems.filter((it) => it.checked && it.price > 0).length === 0}
                  style={
                    activeBatchColor
                      ? {
                          boxShadow: `0 8px 20px -6px ${activeBatchColor.hex}60`,
                        }
                      : undefined
                  }
                  className="px-6 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Split className="w-4 h-4" />
                  <span>
                    Import {editableItems.filter((it) => it.checked && it.price > 0).length} Items (
                    {editableItems.filter((it) => it.checked).reduce((s, it) => s + it.price, 0).toFixed(2)} DH)
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
