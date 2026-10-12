import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, AppSettings, ActivityLog, User } from '../types';
import { INITIAL_TRANSACTIONS, INITIAL_ACTIVITY_LOGS } from '../data/mockData';
import {
  initFirebase,
  auth,
  onAuthStateChanged,
  syncTransactionToFirestore,
  deleteTransactionFromFirestore,
  syncLogToFirestore,
  subscribeToTransactions,
  subscribeToActivityLogs,
} from '../services/firebase';

interface AppContextType {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction>;
  updateTransaction: (tx: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  logs: ActivityLog[];
  addLog: (action: ActivityLog['action'], title: string, details?: string, status?: ActivityLog['status']) => void;
  user: User | null;
  activeTab: 'dashboard' | 'transactions' | 'analytics' | 'logs';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'analytics' | 'logs') => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  isScannerOpen: boolean;
  setIsScannerOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;
  exportDataToJson: () => void;
  importDataFromJson: (jsonStr: string) => boolean;
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TRANSACTIONS: 'my_expenses_l_transactions_v1',
  SETTINGS: 'my_expenses_l_settings_v1',
  LOGS: 'my_expenses_l_logs_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  geminiKeys: ['', '', '', ''],
  activeKeyIndex: 0,
  monthlyBudget: 8500, // 8,500 DH typical Moroccan budget target
  currency: 'DH',
  theme: 'dark',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load transactions from localStorage', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  // 2. Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to load settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  });

  // 3. Activity Logs State
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load logs from localStorage', e);
    }
    return INITIAL_ACTIVITY_LOGS;
  });

  // 4. UI Modals and Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'analytics' | 'logs'>('dashboard');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // 5. Auth & Cloud State
  const [user, setUser] = useState<User | null>(null);

  // Synchronize theme to document body
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Persist to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  // Initialize Firebase if configured
  useEffect(() => {
    const isReady = initFirebase(settings.firebaseConfig);
    if (isReady && auth) {
      const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          // Listen to live Cloud Firestore updates
          const unsubTx = subscribeToTransactions(currentUser.uid, (cloudTx) => {
            if (cloudTx.length > 0) {
              setTransactions(cloudTx);
            }
          });
          const unsubLogs = subscribeToActivityLogs(currentUser.uid, (cloudLogs) => {
            if (cloudLogs.length > 0) {
              setLogs(cloudLogs);
            }
          });
          return () => {
            unsubTx();
            unsubLogs();
          };
        }
      });
      return () => unsubscribeAuth();
    }
  }, [settings.firebaseConfig]);

  // Helper to add activity log
  const addLog = (
    action: ActivityLog['action'],
    title: string,
    details?: string,
    status: ActivityLog['status'] = 'success'
  ) => {
    const newLog: ActivityLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      action,
      title,
      details,
      timestamp: Date.now(),
      status,
    };
    setLogs((prev) => [newLog, ...prev]);

    if (user) {
      syncLogToFirestore(user.uid, newLog).catch(console.error);
    }
  };

  // CRUD actions
  const addTransaction = async (
    txData: Omit<Transaction, 'id' | 'createdAt'>
  ): Promise<Transaction> => {
    const newTx: Transaction = {
      ...txData,
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    addLog(
      'CREATE',
      `Added ${newTx.type === 'expense' ? 'Expense' : 'Income'} of ${newTx.amount.toFixed(2)} DH`,
      `${newTx.category} > ${newTx.subcategory} via ${newTx.paymentMethod}${
        newTx.merchant ? ` at ${newTx.merchant}` : ''
      }`
    );

    if (user) {
      await syncTransactionToFirestore(user.uid, newTx);
    }

    return newTx;
  };

  const updateTransaction = async (updatedTx: Transaction) => {
    const finalTx = { ...updatedTx, updatedAt: Date.now() };
    setTransactions((prev) =>
      prev.map((t) => (t.id === finalTx.id ? finalTx : t))
    );
    addLog(
      'UPDATE',
      `Updated ${finalTx.type} transaction #${finalTx.id.substring(0, 8)}`,
      `${finalTx.amount.toFixed(2)} DH (${finalTx.subcategory})`
    );

    if (user) {
      await syncTransactionToFirestore(user.uid, finalTx);
    }
  };

  const deleteTransaction = async (id: string) => {
    const target = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    addLog(
      'DELETE',
      `Deleted ${target?.type || 'record'}`,
      target ? `${target.amount.toFixed(2)} DH (${target.subcategory})` : id,
      'warning'
    );

    if (user) {
      await deleteTransactionFromFirestore(user.uid, id);
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      return merged;
    });
    addLog('SETTINGS_UPDATE', 'Preferences Updated', 'Budget or API key settings modified');
  };

  const exportDataToJson = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      transactions,
      settings: {
        ...settings,
        geminiKeys: ['', '', '', ''], // Redact sensitive keys in public export
      },
      logs,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-expenses-l-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('EXPORT', 'Database Exported', 'Full transaction history saved to JSON file');
  };

  const importDataFromJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
        if (data.settings?.monthlyBudget) {
          setSettings((prev) => ({ ...prev, monthlyBudget: data.settings.monthlyBudget }));
        }
        addLog('IMPORT', 'Data Imported Successfully', `Restored ${data.transactions.length} transactions`);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  const resetToDemoData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setLogs(INITIAL_ACTIVITY_LOGS);
    setSettings(DEFAULT_SETTINGS);
    addLog('UPDATE', 'Reset to Moroccan Demo Data', 'Restored default Casablanca sample transactions');
  };

  return (
    <AppContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        settings,
        updateSettings,
        logs,
        addLog,
        user,
        activeTab,
        setActiveTab,
        isQuickAddOpen,
        setIsQuickAddOpen,
        isScannerOpen,
        setIsScannerOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        editingTransaction,
        setEditingTransaction,
        exportDataToJson,
        importDataFromJson,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
