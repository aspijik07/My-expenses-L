export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'Cash' | 'Card' | 'Bank Transfer';

// Dedicated exclusively to Banque Populaire (Chaabi Bank) as requested
export type MoroccanBank = 'Banque Populaire (Chaabi Bank)';

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
  itemName?: string; // Individual scanned item name (e.g. Eau Sidi Ali, Halls Cherry)
  batchId?: string; // Unique ID linking items scanned from the same physical receipt
  batchColor?: string; // Distinct theme color for this specific receipt scan batch
  batchName?: string; // Name of the receipt/merchant for grouping
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
  isCustom?: boolean;
}

export type GirlyThemePreset = 
  | 'coquette-pink' 
  | 'strawberry-milk' 
  | 'lavender-pastel' 
  | 'peach-blossom' 
  | 'cherry-glam' 
  | 'custom';

export interface CustomColors {
  primary: string;     // e.g. #FF85A1
  secondary: string;   // e.g. #FFC2D1
  accent: string;      // e.g. #E05780
  backgroundTint: string; // e.g. #FFF0F5
}

export interface AppSettings {
  geminiKeys: [string, string, string, string];
  activeKeyIndex: number;
  monthlyBudget: number; // in DH
  currency: string;
  theme: 'dark' | 'light';
  themePreset: GirlyThemePreset;
  customColors: CustomColors;
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
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SCAN_RECEIPT' | 'IMPORT' | 'EXPORT' | 'SETTINGS_UPDATE' | 'LOGIN';
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
