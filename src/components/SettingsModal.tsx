import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  Download,
  Upload,
  RefreshCw,
  Moon,
  Sun,
  Flame,
  Wallet,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    settings,
    updateSettings,
    exportDataToJson,
    importDataFromJson,
    resetToDemoData,
    addLog,
  } = useApp();

  const [keys, setKeys] = useState<[string, string, string, string]>([...settings.geminiKeys]);
  const [budget, setBudget] = useState<number>(settings.monthlyBudget);
  const [isTestingKeys, setIsTestingKeys] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<{ [index: number]: { ok: boolean; message: string } }>({});
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isSettingsOpen) return null;

  const handleKeyChange = (index: number, val: string) => {
    const next = [...keys] as [string, string, string, string];
    next[index] = val;
    setKeys(next);
  };

  const handleSaveSettings = () => {
    updateSettings({
      geminiKeys: keys,
      monthlyBudget: budget,
    });
    setIsSettingsOpen(false);
  };

  // Live ping test for Gemini 3.6 Flash on each key
  const testAllKeys = async () => {
    setIsTestingKeys(true);
    const results: { [index: number]: { ok: boolean; message: string } } = {};

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i].trim();
      if (!k) {
        results[i] = { ok: false, message: 'Empty key slot' };
        continue;
      }

      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(
          k
        )}`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Ping test. Reply with OK' }] }],
          }),
        });

        if (res.ok) {
          results[i] = { ok: true, message: 'Active & Verified (gemini-3.6-flash)' };
        } else {
          results[i] = { ok: false, message: `HTTP ${res.status}: Quota or invalid` };
        }
      } catch (e: any) {
        results[i] = { ok: false, message: e.message || 'Network error' };
      }
    }

    setTestResults(results);
    setIsTestingKeys(false);
    addLog('SETTINGS_UPDATE', 'Gemini Keys Tested', 'Multi-key ping test completed');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataFromJson(content);
      if (success) {
        setImportStatus('Backup restored successfully!');
      } else {
        setImportStatus('Failed to import backup: Invalid JSON format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-card rounded-3xl p-6 sm:p-8 border border-rosegold-400/30 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rosegold-400 to-lavender-500 text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Application Settings & Preferences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gemini 3.6 Flash Rotation, Monthly Budget, and Local Sync
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {/* Section 1: Gemini 3.6 Flash Multi-Key Rotation System */}
          <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Key className="w-4 h-4 text-rosegold-400" />
                  <span>Gemini 3.6 Flash Multi-Key Rotation (Up to 4 Slots)</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Rotates automatically from Key 1 to 4 with 0ms delay upon HTTP 429 quota or errors.
                </p>
              </div>

              <button
                type="button"
                onClick={testAllKeys}
                disabled={isTestingKeys}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-lavender-500/10 text-lavender-500 hover:bg-lavender-500/20 border border-lavender-500/30 transition-all self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingKeys ? 'animate-spin' : ''}`} />
                <span>{isTestingKeys ? 'Testing...' : 'Test Keys'}</span>
              </button>
            </div>

            <div className="space-y-2.5 pt-1">
              {[0, 1, 2, 3].map((idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    <span>
                      API Key Slot #{idx + 1} {idx === 0 ? '(Primary Default)' : `(Failover #${idx})`}
                    </span>
                    {testResults[idx] && (
                      <span
                        className={`text-[10px] flex items-center space-x-1 ${
                          testResults[idx].ok ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {testResults[idx].ok ? (
                          <CheckCircle2 className="w-3 h-3 inline" />
                        ) : (
                          <AlertCircle className="w-3 h-3 inline" />
                        )}
                        <span>{testResults[idx].message}</span>
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    placeholder={`AIzaSy... (Gemini API Key ${idx + 1})`}
                    value={keys[idx]}
                    onChange={(e) => handleKeyChange(idx, e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-rosegold-400 text-slate-900 dark:text-white"
                  />
                </div>
              ))}
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Don't have a Gemini API key yet?</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-rosegold-500 hover:underline inline-flex items-center space-x-1"
              >
                <span>Get free keys at Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Section 2: Monthly Budget Goal & Currency */}
          <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <Wallet className="w-4 h-4 text-emerald-500" />
              <span>Monthly Budget Goal & Moroccan Currency</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Budget Limit (DH)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="100"
                    min="500"
                    value={budget}
                    onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-rosegold-400 text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-rosegold-400">
                    DH
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Currency Standard
                </label>
                <input
                  type="text"
                  disabled
                  value="Moroccan Dirham (DH)"
                  className="w-full px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Data Backup, Restore & Reset */}
          <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <Database className="w-4 h-4 text-blue-500" />
              <span>Data Management & Backup</span>
            </h3>

            {importStatus && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
                {importStatus}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={exportDataToJson}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-rosegold-400 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-rosegold-400" />
                <span>Export JSON Backup</span>
              </button>

              <label className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-lavender-500 cursor-pointer shadow-sm">
                <Upload className="w-3.5 h-3.5 text-lavender-500" />
                <span>Import JSON Backup</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportFile}
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Restore default Moroccan demo transactions? Your current records will be re-initialized.')) {
                    resetToDemoData();
                  }
                }}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 pt-5 mt-5 border-t border-slate-200/60 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveSettings}
            className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-rosegold-400 via-blush-400 to-lavender-500 hover:shadow-glow-rosegold transition-all"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
