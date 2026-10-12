import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { Transaction, ActivityLog, AppSettings } from '../types';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export const googleProvider = new GoogleAuthProvider();

export function isFirebaseConfigured(): boolean {
  return app !== null && db !== null;
}

export function initFirebase(config?: AppSettings['firebaseConfig']): boolean {
  try {
    // Check if configuration exists either via parameter or environment variables
    const finalConfig = config || {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };

    if (!finalConfig.apiKey || !finalConfig.projectId) {
      console.info('Firebase credentials not set. Running in resilient LocalStorage mode.');
      return false;
    }

    if (getApps().length === 0) {
      app = initializeApp(finalConfig);
    } else {
      app = getApp();
    }

    auth = getAuth(app);
    db = getFirestore(app);
    return true;
  } catch (err) {
    console.warn('Firebase initialization error, continuing in local mode:', err);
    return false;
  }
}

export {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  fbSignOut,
  onAuthStateChanged,
};

export type { User };

// Firestore CRUD operations
export async function syncTransactionToFirestore(
  userId: string,
  transaction: Transaction
): Promise<void> {
  if (!db) return;
  const docRef = doc(db, `users/${userId}/transactions`, transaction.id);
  await setDoc(docRef, transaction, { merge: true });
}

export async function deleteTransactionFromFirestore(
  userId: string,
  transactionId: string
): Promise<void> {
  if (!db) return;
  const docRef = doc(db, `users/${userId}/transactions`, transactionId);
  await deleteDoc(docRef);
}

export async function syncLogToFirestore(
  userId: string,
  log: ActivityLog
): Promise<void> {
  if (!db) return;
  const docRef = doc(db, `users/${userId}/activity_logs`, log.id);
  await setDoc(docRef, log, { merge: true });
}

export function subscribeToTransactions(
  userId: string,
  onUpdate: (transactions: Transaction[]) => void
): () => void {
  if (!db) return () => {};
  const q = query(
    collection(db, `users/${userId}/transactions`),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const items: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Transaction);
      });
      onUpdate(items);
    },
    (err) => {
      console.error('Firestore transactions subscription error:', err);
    }
  );
}

export function subscribeToActivityLogs(
  userId: string,
  onUpdate: (logs: ActivityLog[]) => void
): () => void {
  if (!db) return () => {};
  const q = query(
    collection(db, `users/${userId}/activity_logs`),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const items: ActivityLog[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ActivityLog);
      });
      onUpdate(items);
    },
    (err) => {
      console.error('Firestore activity logs subscription error:', err);
    }
  );
}
