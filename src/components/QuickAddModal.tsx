import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TransactionType, PaymentMethod, MoroccanBank } from '../types';
import confetti from 'canvas-confetti';
import {
  X,
  Plus,
  Edit2,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface SessionAddedItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  amount: number;
}

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    editingTransaction,
    setEditingTransaction,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    categories,
  } = useApp();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [categoryName, setCategoryName] = useState<string>('Beauty & Self-Care');
  const [subcategoryName, setSubcategoryName] = useState<string>('Skincare & Sunscreen');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const bankName: MoroccanBank = 'Banque Populaire (Chaabi Bank)';
  const [merchant, setMerchant] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  const currentCategories = categories.filter((c) => c.type === type);
  const currentCategoryDef =
    currentCategories.find((c) => c.name === categoryName) || currentCategories[0];

  const [batchCount, setBatchCount] = useState<number>(0);
  const [justSavedNotice, setJustSavedNotice] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sessionItems, setSessionItems] = useState<SessionAddedItem[]>([]);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setItemName(editingTransaction.itemName || '');
      setCategoryName(editingTransaction.category);
      setSubcategoryName(editingTransaction.subcategory);
      setPaymentMethod(editingTransaction.paymentMethod);
      setMerchant(editingTransaction.merchant || '');
      setDate(editingTransaction.date);
      setNotes(editingTransaction.notes || '');
    } else {
      setType('expense');
      setAmount('');
      setItemName('');
      const firstExp = categories.find((c) => c.type === 'expense');
      if (firstExp) {
        setCategoryName(firstExp.name);
        setSubcategoryName(firstExp.subcategories[0] || 'General');
      }
      setPaymentMethod('Cash'); // Always default to Cash per user instruction!
      setMerchant('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [editingTransaction, isQuickAddOpen, categories]);

  const handleCategoryChange = (newCatName: string) => {
    setCategoryName(newCatName);
    const cat = currentCategories.find((c) => c.name === newCatName);
    if (cat && cat.subcategories.length > 0) {
      setSubcategoryName(cat.subcategories[0]);
    } else {
      setSubcategoryName('General');
    }
  };

  const handleClose = () => {
    setIsQuickAddOpen(false);
    setEditingTransaction(null);
    setBatchCount(0);
    setJustSavedNotice(false);
    setIsSubmitting(false);
    setSessionItems([]);
  };

  const handleSaveAndContinue = async () => {
    if (isSubmitting) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount in DH');
      return;
    }

    setIsSubmitting(true);
    try {
      const createdTx = await addTransaction({
        type,
        amount: numAmount,
        itemName: itemName.trim() || undefined,
        category: categoryName,
        subcategory: subcategoryName,
        paymentMethod,
        bankName: paymentMethod === 'Card' ? bankName : undefined,
        merchant: merchant.trim() || undefined,
        date,
        notes: notes.trim() || undefined,
      });

      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#FF85A1', '#FFC2D1', '#9D84B7', '#06D6A0'],
      });

      setSessionItems((prev) => [
        ...prev,
        {
          id: createdTx.id,
          name: itemName.trim() || subcategoryName,
          category: categoryName,
          subcategory: subcategoryName,
          amount: numAmount,
        },
      ]);

      setBatchCount((prev) => prev + 1);
      setJustSavedNotice(true);
      setTimeout(() => setJustSavedNotice(false), 2000);

      // Clear transaction-specific fields for immediate next entry
      setAmount('');
      setItemName('');
      setMerchant('');
      setNotes('');
    } catch (err) {
      console.warn('Batch add notice:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount in DH');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTransaction) {
        await updateTransaction({
          ...editingTransaction,
          type,
          amount: numAmount,
          itemName: itemName.trim() || undefined,
          category: categoryName,
          subcategory: subcategoryName,
          paymentMethod,
          bankName: paymentMethod === 'Card' ? bankName : undefined,
          merchant: merchant.trim() || undefined,
          date,
          notes: notes.trim() || undefined,
        });
      } else {
        await addTransaction({
          type,
          amount: numAmount,
          itemName: itemName.trim() || undefined,
          category: categoryName,
          subcategory: subcategoryName,
          paymentMethod,
          bankName: paymentMethod === 'Card' ? bankName : undefined,
          merchant: merchant.trim() || undefined,
          date,
          notes: notes.trim() || undefined,
        });

        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#FF85A1', '#FFC2D1', '#9D84B7', '#06D6A0'],
        });
      }
    } catch (err) {
      console.warn('Submit transaction notice:', err);
    } finally {
      setIsSubmitting(false);
      handleClose();
    }
  };

  if (!isQuickAddOpen && !editingTransaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 border border-pink-300/40 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 text-white flex items-center justify-center shadow-sm">
              {editingTransaction ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingTransaction ? 'Edit Transaction' : 'Quick Add Transaction'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Moroccan Dirhams (DH) • She Budget
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Segmented Type Toggle (Expense vs Income) */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const firstExp = categories.find((c) => c.type === 'expense');
                if (firstExp) {
                  setCategoryName(firstExp.name);
                  setSubcategoryName(firstExp.subcategories[0] || 'General');
                }
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-pink-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                const firstInc = categories.find((c) => c.type === 'income');
                if (firstInc) {
                  setCategoryName(firstInc.name);
                  setSubcategoryName(firstInc.subcategories[0] || 'General');
                }
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                type === 'income'
                  ? 'bg-white dark:bg-slate-900 text-emerald-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Income (+)
            </button>
          </div>

          {/* Amount Input in Moroccan Dirhams */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Amount (in DH)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-4 pr-16 py-3.5 rounded-2xl text-2xl font-extrabold bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-pink-500 text-slate-900 dark:text-white transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-base font-extrabold text-pink-500">
                DH
              </div>
            </div>
          </div>

          {/* Category & Subcategory Selection (Dynamic with user-created categories) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={categoryName}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-pink-500 text-slate-900 dark:text-white"
              >
                {currentCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name} {cat.isCustom ? '(Custom)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Subcategory
              </label>
              <select
                value={subcategoryName}
                onChange={(e) => setSubcategoryName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-pink-500 text-slate-900 dark:text-white"
              >
                {(currentCategoryDef?.subcategories || ['General']).map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method Picker (Cash, Card, Transfer) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                  paymentMethod === 'Cash'
                    ? 'border-pink-400 bg-pink-500/10 text-pink-600 dark:text-pink-300 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-pink-300/40'
                }`}
              >
                <Banknote className="w-4 h-4 mb-1" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                  paymentMethod === 'Card'
                    ? 'border-pink-400 bg-pink-500/10 text-pink-600 dark:text-pink-300 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-pink-300/40'
                }`}
              >
                <CreditCard className="w-4 h-4 mb-1" />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Bank Transfer')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                  paymentMethod === 'Bank Transfer'
                    ? 'border-pink-400 bg-pink-500/10 text-pink-600 dark:text-pink-300 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-pink-300/40'
                }`}
              >
                <ArrowRightLeft className="w-4 h-4 mb-1" />
                <span>Transfer</span>
              </button>
            </div>
          </div>

          {/* Item Name & Merchant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Item / Product Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Eau Sidi Ali, Lipgloss, Notebook"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-pink-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Merchant / Store / Payee
              </label>
              <input
                type="text"
                placeholder="e.g., Hanout, BIM, Marjane, Nocibé, Zara, Inwi"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-pink-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-pink-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Skincare haul, snacks with friends, study materials..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-pink-500 text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Live Items Added In This Session */}
          {sessionItems.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/90 border border-pink-300/40 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  <span>Added In This Session ({sessionItems.length} items)</span>
                </span>
                <span className="font-extrabold text-pink-500 bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/20">
                  Total: {sessionItems.reduce((acc, it) => acc + it.amount, 0).toFixed(2)} DH
                </span>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {sessionItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 text-xs transition-all hover:border-pink-300/50"
                  >
                    <div className="flex items-center space-x-2 min-w-0 pr-2">
                      <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1.5 font-medium">
                          ({item.category})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {item.amount.toFixed(2)} DH
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteTransaction(item.id);
                          setSessionItems((prev) => prev.filter((it) => it.id !== item.id));
                          setBatchCount((prev) => Math.max(0, prev - 1));
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete item from this list"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {batchCount > 0 ? `Done (${batchCount} saved)` : 'Cancel'}
              </button>
              {justSavedNotice && (
                <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 animate-fadeIn">
                  ✓ Saved! Add next below
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {!editingTransaction && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSaveAndContinue}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-pink-600 dark:text-pink-300 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-400/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save & Add Next (+)
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-400 hover:opacity-95 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
              >
                <span>{isSubmitting ? 'Saving...' : editingTransaction ? 'Save Changes' : 'Confirm & Save'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
