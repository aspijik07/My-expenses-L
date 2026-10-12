import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  compressImageTo80KB,
  scanReceiptWithRotation,
  FailoverEvent,
} from '../services/geminiOcr';
import { OcrResult } from '../types';
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
} from 'lucide-react';

export const ReceiptScannerModal: React.FC = () => {
  const {
    isScannerOpen,
    setIsScannerOpen,
    settings,
    setIsSettingsOpen,
    addTransaction,
    addLog,
  } = useApp();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalSizeKB, setOriginalSizeKB] = useState<number>(0);
  const [compressedSizeKB, setCompressedSizeKB] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<OcrResult | null>(null);
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

      addLog(
        'SCAN_RECEIPT',
        `Receipt Scanned: ${result.merchant}`,
        `Total: ${result.total.toFixed(2)} DH via Key #${result.keyUsedIndex + 1} (Compressed from ${origKB}KB to ${sizeKB}KB)`
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
  const loadSampleReceipt = async (sampleType: 'bim' | 'marjane' | 'lydec' | 'inwi') => {
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

    let merchantName = 'BIM STORES MAARIF';
    let totalText = 'TOTAL: 310.50 DH';
    let dateText = `DATE: ${new Date().toISOString().split('T')[0]}`;
    let items = [
      '1. Lait Demi Ecreme 6L       54.00 DH',
      '2. Huile Olive Vierge 1L     95.00 DH',
      '3. Fromage & Yaourt          72.50 DH',
      '4. Cafe Moulu & Biscuits     89.00 DH',
    ];

    if (sampleType === 'marjane') {
      merchantName = 'MARJANE CALIFORNIE';
      totalText = 'TOTAL TTC: 620.00 DH';
      items = [
        '1. Saumon Frais 500g        140.00 DH',
        '2. Fruits & Legumes Frais   185.00 DH',
        '3. Detergent & Lessive      165.00 DH',
        '4. Chocolat & Desserts      130.00 DH',
      ];
    } else if (sampleType === 'lydec') {
      merchantName = 'LYDEC CASABLANCA';
      totalText = 'NET A PAYER: 285.40 DH';
      items = [
        '1. Consommation Electricite  190.20 DH',
        '2. Consommation Eau Potable   75.20 DH',
        '3. Taxes & Redevances         20.00 DH',
      ];
    } else if (sampleType === 'inwi') {
      merchantName = 'INWI FIBRE DAR';
      totalText = 'MONTANT: 249.00 DH';
      items = [
        '1. Abonnement Fibre 50M      249.00 DH',
      ];
    }

    ctx.fillText(merchantName, 300, 70);
    ctx.font = '16px monospace';
    ctx.fillText('CASABLANCA, MAROC', 300, 100);
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

  const handleConfirmAdd = async () => {
    if (!scanResult) return;

    await addTransaction({
      type: 'expense',
      amount: scanResult.total,
      category: scanResult.suggestedCategory,
      subcategory: scanResult.suggestedSubcategory,
      paymentMethod: scanResult.paymentMethod,
      merchant: scanResult.merchant,
      date: scanResult.date,
      notes: `Scanned via Gemini 3.6 Flash (Key #${scanResult.keyUsedIndex + 1})`,
      items: scanResult.items,
      receiptThumbnail: imagePreview || undefined,
    });

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#E0A96D', '#6C5CE7', '#10B981'],
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
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-lavender-500 to-rosegold-400 text-white flex items-center justify-center shadow-glow-lavender">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Gemini 3.6 Flash OCR Scanner
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-lavender-500/10 text-lavender-500 border border-lavender-500/30">
                  Model: gemini-3.6-flash
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Moroccan Supermarkets (BIM, Marjane, Carrefour) & Utilities (Lydec, Inwi, ONEE)
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

        {/* 4 API Key Failover Rotation Visual Status Bar */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-lavender-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Dynamic 4-Key Failover Engine (0ms Delay)
              </span>
            </div>
            <button
              onClick={() => {
                setIsScannerOpen(false);
                setIsSettingsOpen(true);
              }}
              className="text-[11px] font-bold text-rosegold-500 hover:text-rosegold-400 flex items-center space-x-1"
            >
              <Sliders className="w-3 h-3" />
              <span>Manage Keys</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {configuredKeys.map(({ index, hasKey }) => {
              const isCurrent = isScanning && activeKeyAttempt === index;
              const isSuccess = scanResult && scanResult.keyUsedIndex === index;

              return (
                <div
                  key={index}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    isSuccess
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold'
                      : isCurrent
                      ? 'border-lavender-500 bg-lavender-500/10 text-lavender-500 font-bold animate-pulse'
                      : hasKey
                      ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      : 'border-dashed border-slate-300 dark:border-slate-700 opacity-40 text-slate-400'
                  }`}
                >
                  <span className="block text-[11px] font-extrabold">Slot #{index + 1}</span>
                  <span className="block text-[9px] truncate">
                    {isSuccess
                      ? 'Processed ✓'
                      : isCurrent
                      ? 'Active...'
                      : hasKey
                      ? 'Standby'
                      : 'Unconfigured'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Failover Alert Banner */}
        {failoverLogs.length > 0 && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs space-y-1">
            {failoverLogs.map((log, i) => (
              <div key={i} className="flex items-center space-x-1.5 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin inline flex-shrink-0" />
                <span>
                  Key #{log.fromKeyIndex + 1} quota/auth fail. Instant 0ms failover to Key #{log.toKeyIndex + 1}...
                </span>
              </div>
            ))}
          </div>
        )}

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
              Add Gemini Key
            </button>
          </div>
        )}

        {/* Upload & Capture Zone */}
        {!scanResult && (
          <div className="mt-5 space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group border-2 border-dashed border-rosegold-400/40 hover:border-rosegold-400 rounded-3xl p-8 text-center cursor-pointer bg-rosegold-400/5 hover:bg-rosegold-400/10 transition-all"
            >
              <div className="mx-auto w-14 h-14 rounded-2xl bg-rosegold-400/15 text-rosegold-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                {isScanning || isCompressing ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <UploadCloud className="w-7 h-7" />
                )}
              </div>
              <p className="mt-3 text-sm font-bold text-slate-800 dark:text-white">
                {isCompressing
                  ? 'Compressing to 80KB on Canvas...'
                  : isScanning
                  ? 'Gemini 3.6 Flash analyzing receipt...'
                  : 'Click or drag Moroccan receipt photo here'}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Supports BIM, Marjane, Carrefour receipts & utility invoices (JPG, PNG)
              </p>

              {/* Canvas Compression Info */}
              {compressedSizeKB > 0 && (
                <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    Canvas Compressed: {originalSizeKB} KB → {compressedSizeKB} KB (Sub-second payload)
                  </span>
                </div>
              )}
            </div>

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

            {/* Quick Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-rosegold-400 transition-all shadow-sm"
              >
                <Camera className="w-4 h-4 text-rosegold-400" />
                <span>Snap with Camera</span>
              </button>

              {/* Quick Sample Receipts */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Quick Test:</span>
                <button
                  type="button"
                  onClick={() => loadSampleReceipt('bim')}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rosegold-400/10 hover:bg-rosegold-400/20 text-rosegold-500 border border-rosegold-400/20"
                >
                  BIM
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleReceipt('marjane')}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-lavender-500/10 hover:bg-lavender-500/20 text-lavender-500 border border-lavender-500/20"
                >
                  Marjane
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleReceipt('lydec')}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20"
                >
                  Lydec
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleReceipt('inwi')}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border border-purple-500/20"
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
                <span>Extracted Successfully via Gemini 3.6 Flash (Key Slot #{scanResult.keyUsedIndex + 1})</span>
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

            {/* Itemized List with Sub-prices */}
            {scanResult.items.length > 0 && (
              <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                    <FileCheck className="w-4 h-4 text-lavender-500" />
                    <span>Scanned Itemized Receipt Items ({scanResult.items.length})</span>
                  </span>
                  <span className="text-[11px] text-slate-500">Unit sub-prices</span>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {scanResult.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
                        {it.name} {it.quantity && it.quantity > 1 ? `(x${it.quantity})` : ''}
                      </span>
                      <span className="font-bold text-rosegold-500">
                        {it.price.toFixed(2)} DH
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm & Save Button */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-rosegold-400 via-blush-400 to-lavender-500 hover:shadow-glow-rosegold transition-all"
              >
                Confirm & Add to Expenses
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
