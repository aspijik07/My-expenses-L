import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  History,
  Scan,
  Plus,
  Sliders,
  Moon,
  Sun,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsQuickAddOpen,
    setIsScannerOpen,
    setIsSettingsOpen,
    settings,
    updateSettings,
    user,
  } = useApp();

  const validKeyCount = settings.geminiKeys.filter((k) => k && k.trim().length > 5).length;

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <header className="sticky top-0 z-30 glass-nav border-b border-rosegold-400/20 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-rosegold-400 via-blush-400 to-lavender-500 shadow-glow-rosegold text-white">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-rosegold-400 via-blush-500 to-lavender-500 bg-clip-text text-transparent">
                  My expenses-L
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rosegold-400/10 text-rosegold-500 dark:text-rosegold-300 border border-rosegold-400/30">
                  She Budget Edition
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Morocco Expense Tracker • Moroccan Dirham (DH)
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-900 text-rosegold-500 dark:text-rosegold-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'transactions'
                  ? 'bg-white dark:bg-slate-900 text-rosegold-500 dark:text-rosegold-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ReceiptText className="w-4 h-4" />
              <span>Transactions</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white dark:bg-slate-900 text-rosegold-500 dark:text-rosegold-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'logs'
                  ? 'bg-white dark:bg-slate-900 text-rosegold-500 dark:text-rosegold-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Logs</span>
            </button>
          </nav>

          {/* Action Buttons & Quick Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Gemini Key Status Indicator */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={{
                borderColor: validKeyCount > 0 ? 'rgba(108, 92, 231, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                backgroundColor: validKeyCount > 0 ? 'rgba(108, 92, 231, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                color: validKeyCount > 0 ? '#6C5CE7' : '#EF4444',
              }}
              title="Gemini 3.6 Flash Multi-Key Rotation Status"
            >
              {validKeyCount > 0 ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Gemini 3.6 Flash ({validKeyCount}/4 Keys)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 animate-bounce" />
                  <span>Setup Gemini Keys</span>
                </>
              )}
            </button>

            {/* Scan Receipt Button */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold bg-lavender-500/10 hover:bg-lavender-500/20 text-lavender-600 dark:text-lavender-300 border border-lavender-500/30 transition-all shadow-sm"
              title="Scan Moroccan Receipt with Gemini 3.6 Flash"
            >
              <Scan className="w-4 h-4" />
              <span className="hidden sm:inline">Scan Receipt</span>
            </button>

            {/* Quick Add Button */}
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-semibold text-white bg-gradient-to-r from-rosegold-400 via-blush-400 to-lavender-500 hover:opacity-95 shadow-glow-rosegold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Dark / Light Mode"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-rosegold-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Application Settings & Keys"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* User status */}
            {user && (
              <div
                className="w-8 h-8 rounded-full bg-rosegold-400/20 text-rosegold-500 border border-rosegold-400 flex items-center justify-center text-xs font-bold"
                title={user.email || 'Cloud Synced'}
              >
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="flex md:hidden justify-around py-2 border-t border-slate-200/40 dark:border-slate-800/60">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium ${
              activeTab === 'dashboard' ? 'text-rosegold-400' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium ${
              activeTab === 'transactions' ? 'text-rosegold-400' : 'text-slate-500'
            }`}
          >
            <ReceiptText className="w-4 h-4 mb-0.5" />
            <span>History</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium ${
              activeTab === 'analytics' ? 'text-rosegold-400' : 'text-slate-500'
            }`}
          >
            <PieChart className="w-4 h-4 mb-0.5" />
            <span>Charts</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium ${
              activeTab === 'logs' ? 'text-rosegold-400' : 'text-slate-500'
            }`}
          >
            <History className="w-4 h-4 mb-0.5" />
            <span>Logs</span>
          </button>
        </div>
      </div>
    </header>
  );
};
