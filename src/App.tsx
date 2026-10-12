import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { TransactionHistory } from './components/TransactionHistory';
import { AnalyticsView } from './components/AnalyticsView';
import { ActivityLogsView } from './components/ActivityLogsView';
import { QuickAddModal } from './components/QuickAddModal';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { SettingsModal } from './components/SettingsModal';
import { Sparkles, Scan, Plus } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    setIsScannerOpen,
    setIsQuickAddOpen,
  } = useApp();

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-rosegold-400 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardOverview />}
        {activeTab === 'transactions' && <TransactionHistory />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'logs' && <ActivityLogsView />}
      </main>

      {/* Modals */}
      <QuickAddModal />
      <ReceiptScannerModal />
      <SettingsModal />

      {/* Modern Feminine Footer */}
      <footer className="mt-16 border-t border-slate-200/50 dark:border-slate-800/80 py-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold bg-gradient-to-r from-rosegold-400 to-lavender-500 bg-clip-text text-transparent">
              My expenses-L
            </span>
            <span>•</span>
            <span>She Budget Edition</span>
            <span>•</span>
            <span className="text-slate-400">Moroccan Dirham (DH)</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-rosegold-400" />
              <span>Gemini 3.6 Flash Multi-Key Rotation</span>
            </span>
            <span>•</span>
            <span className="text-slate-400">Cloud Firestore Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
