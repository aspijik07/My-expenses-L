import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Cloud,
  Check,
  RefreshCw,
  ExternalLink,
  Save,
  Database,
  ArrowRightLeft,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CloudSyncModal: React.FC = () => {
  const {
    isCloudSyncOpen,
    setIsCloudSyncOpen,
    settings,
    updateSettings,
    transactions,
    syncLocalToCloud,
    isCloudConnected,
    addTransactionsBatch,
    addLog,
  } = useApp();

  const [copiedSyncCode, setCopiedSyncCode] = useState(false);
  const [pasteSyncCode, setPasteSyncCode] = useState('');
  const [mergeNotice, setMergeNotice] = useState<string | null>(null);
  const [cloudConfigStr, setCloudConfigStr] = useState(() =>
    JSON.stringify(
      settings.firebaseConfig || {
        apiKey: 'AIzaSyCbD0qRAUCDbaNR8JTK069g6FiT-7vrBzU',
        authDomain: 'she-budget.firebaseapp.com',
        projectId: 'she-budget',
        storageBucket: 'she-budget.firebasestorage.app',
        messagingSenderId: '',
        appId: '',
      },
      null,
      2
    )
  );
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  if (!isCloudSyncOpen) return null;

  const handleCopyDeviceSyncCode = () => {
    try {
      const payload = JSON.stringify({
        source: 'SheBudget-Sync',
        version: 1,
        timestamp: Date.now(),
        transactions,
      });
      const encoded = btoa(unescape(encodeURIComponent(payload)));
      navigator.clipboard.writeText(encoded);
      setCopiedSyncCode(true);
      setTimeout(() => setCopiedSyncCode(false), 3000);
      addLog('EXPORT', 'Sync Code Copied', `Copied ${transactions.length} items`);
    } catch (e) {
      console.error(e);
      alert('Could not copy sync code. Check browser permissions.');
    }
  };

  const handleMergeSyncCode = async () => {
    if (!pasteSyncCode.trim()) return;
    try {
      const decoded = decodeURIComponent(escape(atob(pasteSyncCode.trim())));
      const parsed = JSON.parse(decoded);
      if (!parsed.transactions || !Array.isArray(parsed.transactions)) {
        throw new Error('Invalid wallet data structure');
      }

      const existingIds = new Set(transactions.map((t) => t.id));
      const incomingTxs = parsed.transactions.filter((t: any) => !existingIds.has(t.id));

      if (incomingTxs.length === 0) {
        setMergeNotice('All records are already present in your wallet!');
        setTimeout(() => setMergeNotice(null), 3500);
        return;
      }

      await addTransactionsBatch(incomingTxs);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FF85A1', '#06D6A0', '#BDB2FF'],
      });

      setMergeNotice(`Successfully merged +${incomingTxs.length} records!`);
      setPasteSyncCode('');
      setTimeout(() => setMergeNotice(null), 4000);
      addLog('IMPORT', 'Wallet Merged', `Added ${incomingTxs.length} items from device code`);
    } catch (err: any) {
      alert(`Invalid or corrupted sync code: ${err.message || 'Check the code'}`);
    }
  };

  const handleSaveCloudConfig = async () => {
    try {
      const parsed = JSON.parse(cloudConfigStr);
      updateSettings({ firebaseConfig: parsed });
      setSyncStatusMsg('Configuration saved! Re-connecting to cloud...');
      setTimeout(() => setSyncStatusMsg(null), 3000);
    } catch {
      alert('Invalid JSON format. Please paste valid configuration JSON.');
    }
  };

  const handleManualCloudPush = async () => {
    setIsSyncingCloud(true);
    try {
      await syncLocalToCloud();
      setSyncStatusMsg(`Cloud synced successfully (${transactions.length} items)!`);
      setTimeout(() => setSyncStatusMsg(null), 3500);
    } catch (err: any) {
      setSyncStatusMsg(`Sync error: ${err.message || 'Network error'}`);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-card rounded-3xl p-6 sm:p-8 border border-pink-300/40 shadow-2xl overflow-y-auto max-h-[92vh] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 text-white flex items-center justify-center shadow-md">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Database & Cloud Sync
                </h2>
                {isCloudConnected ? (
                  <span className="inline-flex items-center space-x-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Cloud Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    <span>Local Mode</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Shared database and wallet connection across your devices
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCloudSyncOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Direct Transfer Code */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 space-y-3">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-4 h-4 text-pink-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Direct Wallet Transfer
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Export a transfer code on one device and paste it on another device to merge items.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-slate-500">
                Generate transfer code:
              </label>
              <button
                type="button"
                onClick={handleCopyDeviceSyncCode}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 border border-pink-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {copiedSyncCode ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>✓ Copied ({transactions.length} items)!</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Copy Transfer Code ({transactions.length} items)</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-slate-500">
                Paste transfer code:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Paste transfer code here..."
                  value={pasteSyncCode}
                  onChange={(e) => setPasteSyncCode(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleMergeSyncCode}
                  disabled={!pasteSyncCode.trim()}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-400 text-white disabled:opacity-50 hover:opacity-90 transition-all cursor-pointer"
                >
                  Merge
                </button>
              </div>
            </div>
          </div>

          {mergeNotice && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{mergeNotice}</span>
            </div>
          )}
        </div>

        {/* Section 2: Firebase Firestore Database */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-purple-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Real-Time Cloud Database
              </h3>
            </div>
            <a
              href="https://console.firebase.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-pink-500 hover:text-pink-600 flex items-center space-x-1"
            >
              <span>Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Connects to your Firestore cloud database to sync updates automatically.
          </p>

          <textarea
            rows={4}
            value={cloudConfigStr}
            onChange={(e) => setCloudConfigStr(e.target.value)}
            className="w-full p-3 font-mono text-[11px] rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 resize-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={handleSaveCloudConfig}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-pink-500/10 text-pink-600 dark:text-pink-300 hover:bg-pink-500/20 border border-pink-500/20 flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </button>

            <button
              type="button"
              onClick={handleManualCloudPush}
              disabled={isSyncingCloud}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:opacity-95 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
              <span>{isSyncingCloud ? 'Syncing...' : 'Sync Items to Cloud Now'}</span>
            </button>
          </div>

          {syncStatusMsg && (
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs font-semibold">
              {syncStatusMsg}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => setIsCloudSyncOpen(false)}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
