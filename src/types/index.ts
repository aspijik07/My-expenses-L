export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'Cash' | 'Card' | 'Bank Transfer';

export type MoroccanBank = 
  | 'CIH Bank' 
  | 'Attijariwafa Bank' 
  | 'BMCE Bank of Africa' 
  | 'Banque Populaire BCP' 
  | 'SGMB' 
  | 'Other';

export interface ReceiptItem {
  name: string;
  price: number;
  quantity?: number;
  category?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // in Moroccan Dirhams (DH)
  category: string;
  subcategory: string;
  paymentMethod: PaymentMethod;
  bankName?: MoroccanBank;
  merchant?: string;
  date: string; // YYYY-MM-DD
  notes?: string;
  receiptThumbnail?: string;
  items?: ReceiptItem[];
  createdAt: number;
  updatedAt?: number;
}

export interface SubCategory {
  id: string;
  name: string;
}

export interface CategoryDefinition {
  id: string;
  name: string;
  iconName: string;
  color: string;
  type: TransactionType;
  subcategories: string[];
}

export interface AppSettings {
  geminiKeys: [string, string, string, string];
  activeKeyIndex: number;
  monthlyBudget: number; // in DH
  currency: string;
  theme: 'dark' | 'light';
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

export interface ActivityLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SCAN_RECEIPT' | 'IMPORT' | 'EXPORT' | 'SETTINGS_UPDATE';
  title: string;
  details?: string;
  timestamp: number;
  status: 'success' | 'warning' | 'error';
}

export interface OcrResult {
  merchant: string;
  date: string;
  total: number;
  paymentMethod: PaymentMethod;
  suggestedCategory: string;
  suggestedSubcategory: string;
  items: ReceiptItem[];
  rawText?: string;
  keyUsedIndex: number;
}

export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
}
