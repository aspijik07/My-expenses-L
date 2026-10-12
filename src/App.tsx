import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { TransactionHistory } from './components/TransactionHistory';
import { AnalyticsView } from './components/AnalyticsView';
import { ActivityLogsView } from './components/ActivityLogsView';
import { GuidebookView } from './components/GuidebookView';
import { LoginScreen } from './components/LoginScreen';
import { QuickAddModal } from './components/QuickAddModal';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { SettingsModal } from './components/SettingsModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { Sparkles } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeTab, currentUser } = useApp();

  // If user is not signed in with Username & Password, display Login Gate
  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-pink-400 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardOverview />}
        {activeTab === 'transactions' && <TransactionHistory />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'logs' && <ActivityLogsView />}
        {activeTab === 'guidebook' && <GuidebookView />}
      </main>

      {/* Modals */}
      <QuickAddModal />
      <ReceiptScannerModal />
      <SettingsModal />
      <CategoryManagerModal />

      {/* Modern Pinterest Feminine Footer */}
      <footer className="mt-16 border-t border-pink-200/50 dark:border-slate-800/80 py-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              My expenses-L
            </span>
            <span>•</span>
            <span>She Budget Edition</span>
            <span>•</span>
            <span className="text-pink-500 font-semibold">Moroccan Dirham (DH)</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>Gemini 3.6 Flash Multi-Key Rotation</span>
            </span>
            <span>•</span>
            <span className="text-slate-400">Rabat Student Edition</span>
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
