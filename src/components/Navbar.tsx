import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  History,
  BookOpen,
  Scan,
  Plus,
  Sliders,
  Moon,
  Sun,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  FolderPlus,
  LogOut,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsQuickAddOpen,
    setIsScannerOpen,
    setIsSettingsOpen,
    setIsCategoryManagerOpen,
    settings,
    updateSettings,
    currentUser,
    logout,
  } = useApp();

  const validKeyCount = settings.geminiKeys.filter((k) => k && k.trim().length > 5).length;

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <header className="sticky top-0 z-30 glass-nav border-b border-pink-200/40 dark:border-slate-800/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 via-rose-300 to-purple-400 shadow-sm text-white">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500 bg-clip-text text-transparent">
                  My expenses-L
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-600 dark:text-pink-300 border border-pink-400/30">
                  She Budget Edition
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Rabat Student Edition • Moroccan Dirham (DH)
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-900 text-pink-500 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'transactions'
                  ? 'bg-white dark:bg-slate-900 text-pink-500 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ReceiptText className="w-4 h-4" />
              <span>Transactions</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white dark:bg-slate-900 text-pink-500 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'logs'
                  ? 'bg-white dark:bg-slate-900 text-pink-500 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Logs</span>
            </button>

            {/* Guidebook Navigation Tab */}
            <button
              onClick={() => setActiveTab('guidebook')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'guidebook'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-300 shadow-sm'
                  : 'text-purple-600/80 dark:text-purple-400/80 hover:text-purple-600'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Guidebook</span>
            </button>
          </nav>

          {/* Action Buttons & Quick Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Custom Categories Button */}
            <button
              onClick={() => setIsCategoryManagerOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-2xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-pink-300 shadow-xs"
              title="Add & Manage Custom Categories"
            >
              <FolderPlus className="w-4 h-4 text-pink-500" />
              <span className="hidden md:inline">Categories</span>
            </button>

            {/* Gemini Key Status */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
              style={{
                borderColor: validKeyCount > 0 ? 'rgba(236, 72, 153, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                backgroundColor: validKeyCount > 0 ? 'rgba(236, 72, 153, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                color: validKeyCount > 0 ? '#DB2777' : '#EF4444',
              }}
              title="Gemini 3.6 Flash Multi-Key Rotation Status"
            >
              {validKeyCount > 0 ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Gemini ({validKeyCount}/4 Keys)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 animate-bounce" />
                  <span>Set Keys</span>
                </>
              )}
            </button>

            {/* Scan Receipt Button */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 transition-all shadow-sm"
              title="Scan Moroccan Receipt with Gemini 3.6 Flash"
            >
              <Scan className="w-4 h-4" />
              <span className="hidden sm:inline">Scan Receipt</span>
            </button>

            {/* Quick Add Button */}
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500 hover:opacity-95 shadow-sm transition-all"
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
                <Sun className="w-4 h-4 text-pink-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Application Settings & Custom Colors"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* User Profile / Log Out */}
            {currentUser && (
              <button
                onClick={logout}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-2xl text-xs font-bold bg-pink-500/10 text-pink-600 dark:text-pink-300 border border-pink-400/20 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                title="Click to Sign Out"
              >
                <span className="hidden sm:inline">@{currentUser}</span>
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="flex lg:hidden justify-around py-2 border-t border-slate-200/40 dark:border-slate-800/60">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium ${
              activeTab === 'dashboard' ? 'text-pink-500 font-bold' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium ${
              activeTab === 'transactions' ? 'text-pink-500 font-bold' : 'text-slate-500'
            }`}
          >
            <ReceiptText className="w-4 h-4 mb-0.5" />
            <span>History</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium ${
              activeTab === 'analytics' ? 'text-pink-500 font-bold' : 'text-slate-500'
            }`}
          >
            <PieChart className="w-4 h-4 mb-0.5" />
            <span>Charts</span>
          </button>
          <button
            onClick={() => setActiveTab('guidebook')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium ${
              activeTab === 'guidebook' ? 'text-pink-500 font-bold' : 'text-slate-500'
            }`}
          >
            <BookOpen className="w-4 h-4 mb-0.5" />
            <span>Guidebook</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium ${
              activeTab === 'logs' ? 'text-pink-500 font-bold' : 'text-slate-500'
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
