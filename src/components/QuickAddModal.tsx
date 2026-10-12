import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, MOROCCAN_BANKS } from '../data/categories';
import { TransactionType, PaymentMethod, MoroccanBank } from '../types';
import confetti from 'canvas-confetti';
import {
  X,
  Plus,
  Edit2,
  DollarSign,
  Calendar,
  Store,
  FileText,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Sparkles,
} from 'lucide-react';

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    editingTransaction,
    setEditingTransaction,
    addTransaction,
    updateTransaction,
  } = useApp();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [categoryName, setCategoryName] = useState<string>('Beauty & Personal Care');
  const [subcategoryName, setSubcategoryName] = useState<string>('Skincare');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [bankName, setBankName] = useState<MoroccanBank>('CIH Bank');
  const [merchant, setMerchant] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  // Handle Editing mode
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setCategoryName(editingTransaction.category);
      setSubcategoryName(editingTransaction.subcategory);
      setPaymentMethod(editingTransaction.paymentMethod);
      setBankName(editingTransaction.bankName || 'CIH Bank');
      setMerchant(editingTransaction.merchant || '');
      setDate(editingTransaction.date);
      setNotes(editingTransaction.notes || '');
    } else {
      // Default reset
      setType('expense');
      setAmount('');
      setCategoryName('Beauty & Personal Care');
      setSubcategoryName('Skincare');
      setPaymentMethod('Card');
      setBankName('CIH Bank');
      setMerchant('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [editingTransaction, isQuickAddOpen]);

  // When type changes, update default categories
  const categoriesList = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const currentCategoryDef = categoriesList.find((c) => c.name === categoryName) || categoriesList[0];

  const handleCategoryChange = (newCatName: string) => {
    setCategoryName(newCatName);
    const cat = categoriesList.find((c) => c.name === newCatName);
    if (cat && cat.subcategories.length > 0) {
      setSubcategoryName(cat.subcategories[0]);
    }
  };

  const handleClose = () => {
    setIsQuickAddOpen(false);
    setEditingTransaction(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount in DH');
      return;
    }

    if (editingTransaction) {
      await updateTransaction({
        ...editingTransaction,
        type,
        amount: numAmount,
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
        category: categoryName,
        subcategory: subcategoryName,
        paymentMethod,
        bankName: paymentMethod === 'Card' ? bankName : undefined,
        merchant: merchant.trim() || undefined,
        date,
        notes: notes.trim() || undefined,
      });

      // Feminine confetti celebratory burst
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#E0A96D', '#F8E8EE', '#6C5CE7', '#10B981'],
      });
    }

    handleClose();
  };

  if (!isQuickAddOpen && !editingTransaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 border border-rosegold-400/30 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rosegold-400 to-blush-400 text-white flex items-center justify-center shadow-sm">
              {editingTransaction ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingTransaction ? 'Edit Transaction' : 'Quick Add Transaction'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Moroccan Dirhams (DH) record
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
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategoryName(EXPENSE_CATEGORIES[0].name);
                setSubcategoryName(EXPENSE_CATEGORIES[0].subcategories[0]);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-rosegold-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategoryName(INCOME_CATEGORIES[0].name);
                setSubcategoryName(INCOME_CATEGORIES[0].subcategories[0]);
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
                className="w-full pl-4 pr-16 py-3.5 rounded-2xl text-2xl font-extrabold bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-rosegold-400 focus:ring-2 focus:ring-rosegold-400/20 text-slate-900 dark:text-white transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-base font-extrabold text-rosegold-400">
                DH
              </div>
            </div>
          </div>

          {/* Category & Subcategory Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Category
              </label>
              <select
                value={categoryName}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-rosegold-400 text-slate-900 dark:text-white transition-all"
              >
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
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
                className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-rosegold-400 text-slate-900 dark:text-white transition-all"
              >
                {currentCategoryDef.subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method Picker (Cash, Card with Moroccan Banks, Bank Transfer) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-semibold transition-all ${
                  paymentMethod === 'Cash'
                    ? 'border-rosegold-400 bg-rosegold-400/10 text-rosegold-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Banknote className="w-4 h-4 mb-1" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-semibold transition-all ${
                  paymentMethod === 'Card'
                    ? 'border-lavender-500 bg-lavender-500/10 text-lavender-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <CreditCard className="w-4 h-4 mb-1" />
                <span>Bank Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Bank Transfer')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-semibold transition-all ${
                  paymentMethod === 'Bank Transfer'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowRightLeft className="w-4 h-4 mb-1" />
                <span>Transfer</span>
              </button>
            </div>

            {/* If Card is selected, allow choosing Moroccan Bank */}
            {paymentMethod === 'Card' && (
              <div className="pt-2 animate-fadeIn">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Moroccan Bank Provider
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value as MoroccanBank)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-lavender-500 text-slate-900 dark:text-white"
                >
                  {MOROCCAN_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Date & Merchant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-rosegold-400 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Merchant / Store / Payee
              </label>
              <input
                type="text"
                placeholder="e.g., BIM, Marjane, Nocibé, Inwi, Zara"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-rosegold-400 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Notes / Descriptions (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Skincare sunscreen restock or monthly apartment fibre..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-rosegold-400 text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-rosegold-400 via-blush-400 to-lavender-500 hover:shadow-glow-rosegold transition-all"
            >
              {editingTransaction ? 'Save Changes' : 'Confirm & Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
