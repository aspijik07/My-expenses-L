import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Transaction,
  AppSettings,
  ActivityLog,
  User,
  CategoryDefinition,
  GirlyThemePreset,
  CustomColors,
} from '../types';
import { INITIAL_EXPENSE_CATEGORIES, INITIAL_INCOME_CATEGORIES } from '../data/categories';
import { GIRLY_THEME_PRESETS } from '../data/themes';
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
  setThemePreset: (presetId: GirlyThemePreset) => void;
  setCustomColor: (key: keyof CustomColors, value: string) => void;
  categories: CategoryDefinition[];
  addCategory: (newCat: Omit<CategoryDefinition, 'id'>) => void;
  addSubcategory: (categoryName: string, subName: string) => void;
  deleteCategory: (categoryId: string) => void;
  logs: ActivityLog[];
  addLog: (action: ActivityLog['action'], title: string, details?: string, status?: ActivityLog['status']) => void;
  user: User | null;
  activeTab: 'dashboard' | 'transactions' | 'analytics' | 'logs' | 'guidebook';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'analytics' | 'logs' | 'guidebook') => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  isScannerOpen: boolean;
  setIsScannerOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isCategoryManagerOpen: boolean;
  setIsCategoryManagerOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;
  exportDataToJson: () => void;
  importDataFromJson: (jsonStr: string) => boolean;
  clearAllData: () => void;
  loadDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TRANSACTIONS: 'my_expenses_l_transactions_v2',
  SETTINGS: 'my_expenses_l_settings_v2',
  LOGS: 'my_expenses_l_logs_v2',
  CATEGORIES: 'my_expenses_l_categories_v2',
};

const DEFAULT_SETTINGS: AppSettings = {
  geminiKeys: ['', '', '', ''],
  activeKeyIndex: 0,
  monthlyBudget: 8500, // 8,500 DH typical Moroccan budget target
  currency: 'DH',
  theme: 'dark',
  themePreset: 'coquette-pink',
  customColors: {
    primary: '#FF85A1',       // Girly Pinterest Baby Pink
    secondary: '#FFC2D1',     // Soft Strawberry Cream
    accent: '#E05780',        // Vibrant Berry Pink
    backgroundTint: '#FFF0F5',// Soft Coquette White Pink
  },
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Transactions State - 100% EMPTY BY DEFAULT per user instruction!
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load transactions from localStorage', e);
    }
    return []; // Clean slate, empty data!
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

  // 3. Dynamic Categories State (Pre-loaded with deep taxonomy, fully customizable)
  const [categories, setCategories] = useState<CategoryDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load categories', e);
    }
    return [...INITIAL_EXPENSE_CATEGORIES, ...INITIAL_INCOME_CATEGORIES];
  });

  // 4. Activity Logs State
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load logs', e);
    }
    return [
      {
        id: 'welcome-log',
        action: 'SETTINGS_UPDATE',
        title: 'App Initialized (Clean Slate)',
        details: 'Ready to log your first Banque Populaire (Chaabi Bank) expense or scan Moroccan receipts.',
        timestamp: Date.now(),
        status: 'success',
      },
    ];
  });

  // 5. UI Modals and Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'analytics' | 'logs' | 'guidebook'>('dashboard');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // 6. Auth & Cloud State
  const [user, setUser] = useState<User | null>(null);

  // Apply Theme & Dynamic CSS variables to :root for Pinterest Colors
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Inject dynamic CSS custom properties for custom user-selected colors
    const root = document.documentElement;
    root.style.setProperty('--color-girly-primary', settings.customColors.primary);
    root.style.setProperty('--color-girly-secondary', settings.customColors.secondary);
    root.style.setProperty('--color-girly-accent', settings.customColors.accent);
    root.style.setProperty('--color-girly-tint', settings.customColors.backgroundTint);
  }, [settings.theme, settings.customColors]);

  // Persist to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

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

  // Activity Log helper
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
      `Updated ${finalTx.type} transaction`,
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
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addLog('SETTINGS_UPDATE', 'Preferences Updated', 'Budget or API key settings modified');
  };

  const setThemePreset = (presetId: GirlyThemePreset) => {
    const found = GIRLY_THEME_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setSettings((prev) => ({
        ...prev,
        themePreset: presetId,
        customColors: { ...found.colors },
      }));
      addLog('SETTINGS_UPDATE', 'Girly Theme Preset Changed', `Switched to "${found.name}"`);
    } else if (presetId === 'custom') {
      setSettings((prev) => ({
        ...prev,
        themePreset: 'custom',
      }));
    }
  };

  const setCustomColor = (key: keyof CustomColors, value: string) => {
    setSettings((prev) => ({
      ...prev,
      themePreset: 'custom',
      customColors: {
        ...prev.customColors,
        [key]: value,
      },
    }));
  };

  // Category & Subcategory Management
  const addCategory = (newCat: Omit<CategoryDefinition, 'id'>) => {
    const id = 'cat-' + Date.now();
    const created: CategoryDefinition = {
      ...newCat,
      id,
      isCustom: true,
    };
    setCategories((prev) => [...prev, created]);
    addLog('SETTINGS_UPDATE', 'New Category Created', `${created.name} (${created.type})`);
  };

  const addSubcategory = (categoryName: string, subName: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.name === categoryName) {
          if (cat.subcategories.includes(subName.trim())) return cat;
          return {
            ...cat,
            subcategories: [...cat.subcategories, subName.trim()],
          };
        }
        return cat;
      })
    );
    addLog('SETTINGS_UPDATE', 'Subcategory Added', `Added "${subName}" to ${categoryName}`);
  };

  const deleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    addLog('SETTINGS_UPDATE', 'Category Removed', `Deleted category #${categoryId}`);
  };

  const exportDataToJson = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      version: '2.0',
      transactions,
      categories,
      settings: {
        ...settings,
        geminiKeys: ['', '', '', ''],
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
        if (Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
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

  const clearAllData = () => {
    setTransactions([]);
    addLog('DELETE', 'All Transactions Cleared', 'Reset to empty clean slate');
  };

  const loadDemoData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setLogs(INITIAL_ACTIVITY_LOGS);
    addLog('CREATE', 'Sample Moroccan Demo Data Loaded', 'Populated sample transactions for testing');
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
        setThemePreset,
        setCustomColor,
        categories,
        addCategory,
        addSubcategory,
        deleteCategory,
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
        isCategoryManagerOpen,
        setIsCategoryManagerOpen,
        editingTransaction,
        setEditingTransaction,
        exportDataToJson,
        importDataFromJson,
        clearAllData,
        loadDemoData,
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
