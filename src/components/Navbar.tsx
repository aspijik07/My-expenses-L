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
  Shield,
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

  const isOwner = currentUser?.toLowerCase() === 'paradox';

  return (
    <>
      <header className="sticky top-0 z-30 glass-nav border-b border-pink-200/40 dark:border-slate-800/80 shadow-xs transition-all w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20 gap-2 sm:gap-4">
            
            {/* Logo & Brand Identity (Unbreakable, Shrink-0, Never Wraps) */}
            <div
              className="flex items-center space-x-2.5 sm:space-x-3.5 shrink-0 cursor-pointer select-none"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-400 to-purple-500 shadow-md shadow-pink-500/20 text-white shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>

              <div className="flex flex-col shrink-0">
                <div className="flex items-center space-x-2 whitespace-nowrap">
                  <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    My Expenses<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">-L</span>
                  </span>
                  <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/10 text-pink-500 border border-pink-400/20 whitespace-nowrap">
                    She Budget
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                  <span className="hidden sm:inline">Rabat Student Edition • Moroccan Dirham (DH)</span>
                  <span className="sm:hidden">Rabat Student • DH</span>
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links (Visible on XL screens to prevent squeezing) */}
            <nav className="hidden xl:flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shrink-0">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white dark:bg-slate-900 text-pink-500 shadow-xs'
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
                    ? 'bg-white dark:bg-slate-900 text-pink-500 shadow-xs'
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
                    ? 'bg-white dark:bg-slate-900 text-pink-500 shadow-xs'
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
                    ? 'bg-white dark:bg-slate-900 text-pink-500 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Logs</span>
              </button>

              <button
                onClick={() => setActiveTab('guidebook')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'guidebook'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-300 shadow-xs'
                    : 'text-purple-600/80 dark:text-purple-400/80 hover:text-purple-600'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Guidebook</span>
              </button>
            </nav>

            {/* Action Buttons & Quick Controls */}
            <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
              
              {/* Custom Categories Button */}
              <button
                onClick={() => setIsCategoryManagerOpen(true)}
                className="hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-2xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-pink-300 shadow-xs"
                title="Add & Manage Custom Categories"
              >
                <FolderPlus className="w-4 h-4 text-pink-500" />
                <span>Categories</span>
              </button>

              {/* Gemini Key Status (only on 2xl to preserve space) */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="hidden 2xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
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
                className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-2 rounded-2xl text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 transition-all shadow-xs"
                title="Scan Moroccan Receipt with Gemini 3.6 Flash"
              >
                <Scan className="w-4 h-4" />
                <span className="hidden sm:inline">Scan Receipt</span>
              </button>

              {/* Quick Add Button */}
              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="flex items-center space-x-1 px-3 sm:px-4 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500 hover:opacity-95 shadow-xs transition-all"
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
                  className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                    isOwner
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/30 hover:bg-purple-500/20'
                      : 'bg-pink-500/10 text-pink-600 dark:text-pink-300 border border-pink-400/20 hover:bg-rose-500/10 hover:text-rose-500'
                  }`}
                  title={isOwner ? 'Master Owner Ghost Mode (Click to Sign Out)' : 'Click to Sign Out'}
                >
                  {isOwner && <Shield className="w-3 h-3 text-purple-500 shrink-0" />}
                  <span className="max-w-[70px] sm:max-w-none truncate font-mono">@{currentUser}</span>
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Fixed Bottom Navigation Bar (iOS & Android Pro Native Style) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-pink-200/50 dark:border-slate-800/80 shadow-2xl xl:hidden safe-area-bottom">
        <div className="max-w-md mx-auto grid grid-cols-5 py-2 px-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              activeTab === 'dashboard'
                ? 'text-pink-500 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              activeTab === 'transactions'
                ? 'text-pink-500 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <ReceiptText className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">History</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              activeTab === 'analytics'
                ? 'text-pink-500 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <PieChart className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Charts</span>
          </button>

          <button
            onClick={() => setActiveTab('guidebook')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              activeTab === 'guidebook'
                ? 'text-purple-500 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              activeTab === 'logs'
                ? 'text-pink-500 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <History className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Logs</span>
          </button>
        </div>
      </nav>
    </>
  );
};
