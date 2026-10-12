import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GIRLY_THEME_PRESETS } from '../data/themes';
import { GirlyThemePreset, CustomColors } from '../types';
import {
  X,
  Key,
  Palette,
  FolderPlus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Download,
  Upload,
  CreditCard,
  Sparkles,
  ExternalLink,
  Wallet,
  Check,
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Cloud,
  Copy,
  Share2,
  Radio,
  ArrowRight,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    settings,
    updateSettings,
    setThemePreset,
    setCustomColor,
    setIsCategoryManagerOpen,
    transactions,
    isCloudConnected,
    syncLocalToCloud,
    exportDataToJson,
    importDataFromJson,
    clearAllData,
    loadDemoData,
    addLog,
    authCredentials,
    updateAuthCredentials,
  } = useApp();

  const [keys, setKeys] = useState<[string, string, string, string]>([...settings.geminiKeys]);
  const [budget, setBudget] = useState<number>(settings.monthlyBudget);
  const [isTestingKeys, setIsTestingKeys] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<{ [index: number]: { ok: boolean; message: string } }>({});
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Cloud sync state
  const [firebaseJsonInput, setFirebaseJsonInput] = useState<string>(() => {
    return settings.firebaseConfig ? JSON.stringify(settings.firebaseConfig, null, 2) : '';
  });
  const [cloudConnectMsg, setCloudConnectMsg] = useState<string | null>(null);
  const [copiedSyncCode, setCopiedSyncCode] = useState<boolean>(false);
  const [syncCodeInput, setSyncCodeInput] = useState<string>('');
  const [directMergeMsg, setDirectMergeMsg] = useState<string | null>(null);

  // Auth credentials form state
  const [usernameInput, setUsernameInput] = useState(authCredentials.username);
  const [passwordInput, setPasswordInput] = useState(authCredentials.password);
  const [showPassword, setShowPassword] = useState(false);
  const [credSuccessMsg, setCredSuccessMsg] = useState(false);

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

  // 1. Connect or update Firebase Cloud Hub
  const handleConnectFirebase = () => {
    try {
      if (!firebaseJsonInput.trim()) {
        updateSettings({ firebaseConfig: undefined });
        setCloudConnectMsg('Switched to local browser mode.');
        setTimeout(() => setCloudConnectMsg(null), 3000);
        return;
      }

      let parsed: any;
      if (firebaseJsonInput.includes('{')) {
        const sanitized = firebaseJsonInput
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
          .replace(/'/g, '"');
        parsed = JSON.parse(sanitized);
      } else {
        throw new Error('Please enter a valid JSON configuration object');
      }

      if (!parsed.apiKey || !parsed.projectId) {
        throw new Error('Missing apiKey or projectId in Firebase configuration');
      }

      updateSettings({ firebaseConfig: parsed });
      setCloudConnectMsg('✓ Cloud Hub Connected! Real-time multi-device sync activated.');
      setTimeout(() => setCloudConnectMsg(null), 4000);
    } catch (e: any) {
      setCloudConnectMsg(`Error: ${e.message}`);
    }
  };

  // 2. Direct Peer Sync: Copy all records as an instant transfer code
  const handleCopyDeviceSyncCode = () => {
    try {
      const dataPayload = {
        tx: transactions,
        ts: Date.now(),
      };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(dataPayload))));
      navigator.clipboard.writeText(encoded);
      setCopiedSyncCode(true);
      setTimeout(() => setCopiedSyncCode(false), 3000);
    } catch {
      alert('Failed to copy to clipboard');
    }
  };

  // 3. Direct Peer Sync: Paste transfer code from another device and merge
  const handleMergeDeviceSyncCode = () => {
    try {
      if (!syncCodeInput.trim()) return;
      const decoded = decodeURIComponent(escape(atob(syncCodeInput.trim())));
      const parsed = JSON.parse(decoded);
      if (!parsed.tx || !Array.isArray(parsed.tx)) {
        throw new Error('Invalid code format');
      }

      const existingIds = new Set(transactions.map((t) => t.id));
      const newItems = parsed.tx.filter((t: any) => !existingIds.has(t.id));

      if (newItems.length > 0) {
        const mergedList = [...transactions, ...newItems];
        importDataFromJson(JSON.stringify({ transactions: mergedList }));
        setDirectMergeMsg(`✓ Merged ${newItems.length} new records! Both devices now have all items.`);
      } else {
        setDirectMergeMsg('All records from this code are already in your wallet!');
      }
      setSyncCodeInput('');
      setTimeout(() => setDirectMergeMsg(null), 4000);
    } catch (e: any) {
      setDirectMergeMsg(`Merge Error: ${e.message}`);
    }
  };

  const testAllKeys = async () => {
    setIsTestingKeys(true);
    const results: { [index: number]: { ok: boolean; message: string } } = {};

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i].trim();
      if (!k) {
        results[i] = { ok: false, message: 'Empty slot' };
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
            contents: [{ parts: [{ text: 'Ping test' }] }],
          }),
        });

        if (res.ok) {
          results[i] = { ok: true, message: 'Verified (gemini-3.6-flash)' };
        } else {
          results[i] = { ok: false, message: `HTTP ${res.status}: Quota or key error` };
        }
      } catch (e: any) {
        results[i] = { ok: false, message: e.message || 'Network error' };
      }
    }

    setTestResults(results);
    setIsTestingKeys(false);
    addLog('SETTINGS_UPDATE', 'Gemini Keys Tested', 'Multi-key verification completed');
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
        setImportStatus('Failed to import backup: Invalid JSON');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl glass-card rounded-3xl p-6 sm:p-8 border border-pink-300/40 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Personalization & Application Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pinterest Aesthetics, Security, Gemini 3.6 Flash, and Categories
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
          {/* Section 1: Pinterest Aesthetic Presets & Custom Color Studio */}
          <div className="p-5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-pink-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Palette className="w-4 h-4 text-pink-500" />
                  <span>Pinterest Girly Color Presets</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select a curated pastel aesthetic or customize your own palette below
                </p>
              </div>

              {settings.themePreset === 'custom' && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20">
                  Custom Palette Active
                </span>
              )}
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {GIRLY_THEME_PRESETS.map((preset) => {
                const isSelected = settings.themePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setThemePreset(preset.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-pink-500 bg-pink-50/80 dark:bg-pink-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:border-pink-300 bg-white/40 dark:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {preset.name}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-pink-500" />}
                    </div>

                    <p className="text-[10px] text-slate-500 mb-2.5 line-clamp-1">
                      {preset.description}
                    </p>

                    {/* Color Swatch Dots */}
                    <div className="flex items-center space-x-1.5">
                      <span
                        className="w-4 h-4 rounded-full border border-white/60 shadow-xs"
                        style={{ backgroundColor: preset.colors.primary }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white/60 shadow-xs"
                        style={{ backgroundColor: preset.colors.secondary }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white/60 shadow-xs"
                        style={{ backgroundColor: preset.colors.accent }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Color Pickers Studio */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-3">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Custom Palette Studio (Pick Your Own Hex Colors)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Primary Color */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={settings.customColors.primary}
                      onChange={(e) => setCustomColor('primary', e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.customColors.primary}
                      onChange={(e) => setCustomColor('primary', e.target.value)}
                      className="w-full text-xs font-mono uppercase bg-transparent text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Secondary Soft
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={settings.customColors.secondary}
                      onChange={(e) => setCustomColor('secondary', e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.customColors.secondary}
                      onChange={(e) => setCustomColor('secondary', e.target.value)}
                      className="w-full text-xs font-mono uppercase bg-transparent text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* Accent Color */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Vibrant Accent
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={settings.customColors.accent}
                      onChange={(e) => setCustomColor('accent', e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.customColors.accent}
                      onChange={(e) => setCustomColor('accent', e.target.value)}
                      className="w-full text-xs font-mono uppercase bg-transparent text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* Background Tint */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Background Tint
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={settings.customColors.backgroundTint}
                      onChange={(e) => setCustomColor('backgroundTint', e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.customColors.backgroundTint}
                      onChange={(e) => setCustomColor('backgroundTint', e.target.value)}
                      className="w-full text-xs font-mono uppercase bg-transparent text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Banque Populaire (Chaabi Bank) Integration */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  Banque Populaire (Chaabi Bank) Sole Banking Provider
                </h4>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  All card transactions & payments are strictly linked to your Chaabi Bank account.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
              Active & Default
            </span>
          </div>

          {/* Section 2.5: Mobile Login Gate & Security Credentials */}
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-pink-200/80 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Login Gate Credentials (Mobile & Web)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Simple Username + Password authentication (Android & iPhone ready, no email needed).
                  </p>
                </div>
              </div>
              {credSuccessMsg && (
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center space-x-1 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3 inline" />
                  <span>Saved!</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Login Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="shebudget"
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Login Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full pl-9 pr-9 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">
                Current active user: <strong className="text-pink-500 font-mono">@{authCredentials.username}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  if (usernameInput.trim() && passwordInput.trim()) {
                    updateAuthCredentials(usernameInput.trim(), passwordInput);
                    setCredSuccessMsg(true);
                    setTimeout(() => setCredSuccessMsg(false), 2500);
                  }
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 transition-all cursor-pointer"
              >
                Update Credentials
              </button>
            </div>
          </div>

          {/* Section 3: Custom Categories Manager Launcher */}
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Categories & Subcategories Manager
                </h4>
                <p className="text-[11px] text-slate-500">
                  Add custom expense or income categories, create subcategories, and customize colors.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSettingsOpen(false);
                setIsCategoryManagerOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all"
            >
              Manage Categories
            </button>
          </div>

          {/* Section 4: Gemini 3.6 Flash Multi-Key Rotation System */}
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Key className="w-4 h-4 text-pink-500" />
                  <span>Gemini 3.6 Flash Multi-Key Rotation (4 Slots)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  0ms instant failover if any key reaches quota (429) or is busy (503).
                </p>
              </div>

              <button
                type="button"
                onClick={testAllKeys}
                disabled={isTestingKeys}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border border-purple-500/30 self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingKeys ? 'animate-spin' : ''}`} />
                <span>{isTestingKeys ? 'Verifying...' : 'Test Keys'}</span>
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {[0, 1, 2, 3].map((idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    <span>
                      API Key Slot #{idx + 1} {idx === 0 ? '(Primary)' : `(Failover #${idx})`}
                    </span>
                    {testResults[idx] && (
                      <span
                        className={`text-[10px] flex items-center space-x-1 ${
                          testResults[idx].ok ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {testResults[idx].ok ? <CheckCircle2 className="w-3 h-3 inline" /> : <AlertCircle className="w-3 h-3 inline" />}
                        <span>{testResults[idx].message}</span>
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    placeholder={`AIzaSy... (Gemini API Key ${idx + 1})`}
                    value={keys[idx]}
                    onChange={(e) => handleKeyChange(idx, e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              ))}
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Need a free Gemini key?</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-pink-500 hover:underline inline-flex items-center space-x-1"
              >
                <span>Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Section 5: Monthly Budget Goal & Data Control */}
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <Wallet className="w-4 h-4 text-emerald-500" />
              <span>Budget Goal & Clean Data Control</span>
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
                    className="w-full px-3.5 py-2 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-pink-500">
                    DH
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Moroccan Bank
                </label>
                <input
                  type="text"
                  disabled
                  value="Banque Populaire (Chaabi Bank)"
                  className="w-full px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Clean Data & Backup */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={exportDataToJson}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-pink-500" />
                <span>Export JSON</span>
              </button>

              <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer shadow-sm">
                <Upload className="w-3.5 h-3.5 text-purple-500" />
                <span>Import JSON</span>
                <input type="file" accept=".json" className="hidden" onChange={handleImportFile} />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear all recorded transactions and reset to an empty slate?')) {
                    clearAllData();
                  }
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10"
              >
                <span>Clear All Data (Empty Slate)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Load sample Moroccan transactions to test charts?')) {
                    loadDemoData();
                  }
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-500 hover:bg-indigo-500/10"
              >
                <span>Load Sample Data</span>
              </button>
            </div>
          </div>

          {/* Section 6: Universal Multi-Device Cloud Sync */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-pink-50/50 via-white to-purple-50/50 dark:from-slate-800/80 dark:via-slate-900/80 dark:to-purple-950/20 border border-pink-200/60 dark:border-slate-700 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-pink-100 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Multi-Device Cloud Sync (Phone & PC Shared Hub)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Shared database: Whatever you add on PC or scan on Phone stays synchronized.
                  </p>
                </div>
              </div>

              {/* Status Pill */}
              <div className="flex items-center space-x-1.5 self-start sm:self-auto">
                {isCloudConnected ? (
                  <span className="inline-flex items-center space-x-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Live Cloud Sync Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>Local Mode (Device Only)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick 1-Click Peer Transfer: Merge PC & Phone right now */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <Share2 className="w-3.5 h-3.5 text-pink-500" />
                  <span>Instant Device Merge (Copy & Paste Code)</span>
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  Combine Phone & PC data instantly
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Copy from this device */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-slate-500">
                    Step 1: On device with items (e.g. Phone or PC)
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyDeviceSyncCode}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 border border-pink-500/20 transition-all flex items-center justify-center space-x-2"
                  >
                    {copiedSyncCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>✓ Copied {transactions.length} records code!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy My Wallet Code ({transactions.length} items)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Paste and merge on other device */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-slate-500">
                    Step 2: On the other device, paste and merge
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Paste wallet code here..."
                      value={syncCodeInput}
                      onChange={(e) => setSyncCodeInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-pink-500 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleMergeDeviceSyncCode}
                      disabled={!syncCodeInput.trim()}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-400 text-white disabled:opacity-50 transition-all"
                    >
                      Merge
                    </button>
                  </div>
                </div>
              </div>

              {directMergeMsg && (
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-fadeIn">
                  {directMergeMsg}
                </p>
              )}
            </div>

            {/* Permanent Firebase Cloud Hub Setup */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5 text-purple-500" />
                  <span>Permanent Real-Time Cloud Hub (Firebase)</span>
                </span>
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-bold text-purple-600 hover:underline flex items-center space-x-1"
                >
                  <span>Firebase Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Connect your free Google Firebase Firestore configuration. Once connected, changes update immediately on all screens with zero manual steps.
              </p>

              <textarea
                rows={3}
                placeholder='Paste your Firebase config JSON: { "apiKey": "...", "projectId": "...", ... }'
                value={firebaseJsonInput}
                onChange={(e) => setFirebaseJsonInput(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white resize-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleConnectFirebase}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-all"
                  >
                    {isCloudConnected ? 'Update Cloud Config' : 'Connect Cloud Hub'}
                  </button>

                  {isCloudConnected && (
                    <button
                      type="button"
                      onClick={syncLocalToCloud}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 transition-all"
                    >
                      Sync Local Items to Cloud Now
                    </button>
                  )}
                </div>

                {cloudConnectMsg && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {cloudConnectMsg}
                  </span>
                )}
              </div>
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
            className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-400 shadow-sm"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
