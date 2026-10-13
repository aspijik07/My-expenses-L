import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Scan,
  Plus,
  BookOpen,
  Camera,
  Target,
  ArrowUpRight,
  ArrowDownLeft,
  Layers,
  Edit2,
  Trash2,
  PiggyBank,
} from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

export const DashboardOverview: React.FC = () => {
  const {
    transactions,
    settings,
    categories,
    setActiveTab,
    setIsQuickAddOpen,
    setIsScannerOpen,
    setEditingTransaction,
    deleteTransaction,
  } = useApp();

  const currentMonthPrefix = new Date().toISOString().substring(0, 7);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;
  const remainingSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((remainingSavings / totalIncome) * 100)) : 0;

  const monthlyExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonthPrefix))
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyBudget = settings.monthlyBudget || 5000;
  const budgetPercentUsed = Math.min(100, Math.round((monthlyExpenses / monthlyBudget) * 100));
  const remainingBudget = monthlyBudget - monthlyExpenses;

  const expenseTransactions = transactions.filter((t) => t.type === 'expense');

  const cashExpenses = expenseTransactions
    .filter((t) => t.paymentMethod === 'Cash')
    .reduce((sum, t) => sum + t.amount, 0);

  const cardExpenses = expenseTransactions
    .filter((t) => t.paymentMethod === 'Card')
    .reduce((sum, t) => sum + t.amount, 0);

  const transferExpenses = expenseTransactions
    .filter((t) => t.paymentMethod === 'Bank Transfer')
    .reduce((sum, t) => sum + t.amount, 0);

  // Group expenses by category with DISTINCT guaranteed colors
  const categorySpending = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    expenseTransactions.forEach((t) => {
      const existing = map.get(t.category) || { total: 0, count: 0 };
      map.set(t.category, {
        total: existing.total + t.amount,
        count: existing.count + 1,
      });
    });

    const DISTINCT_PALETTE = [
      '#EC4899', // Hot Pink
      '#8B5CF6', // Purple
      '#F59E0B', // Amber Orange
      '#06B6D4', // Cyan Blue
      '#10B981', // Emerald Green
      '#F43F5E', // Rose Coral
      '#3B82F6', // Royal Blue
      '#84CC16', // Lime Green
      '#A855F7', // Violet
      '#14B8A6', // Teal
      '#E11D48', // Crimson Red
      '#6366F1', // Indigo
    ];

    const sorted = Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        total: data.total,
        count: data.count,
        percentage: totalExpense > 0 ? (data.total / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return sorted.map((cat, idx) => {
      const distinctColor = DISTINCT_PALETTE[idx % DISTINCT_PALETTE.length];
      return {
        ...cat,
        color: distinctColor,
      };
    });
  }, [expenseTransactions, totalExpense]);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn relative pb-20">
      {/* 1. TOP HERO CARD: Net Balance + Budget Progress + Payment Pills */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 border border-pink-200/70 dark:border-pink-500/20 bg-white/95 dark:bg-gradient-to-br dark:from-slate-900/95 dark:via-slate-800/90 dark:to-purple-950/40 shadow-xl shadow-pink-500/5 space-y-5">
        {/* Top Net Balance Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[11px] font-extrabold uppercase tracking-wider border border-pink-400/20">
            <Wallet className="w-3.5 h-3.5" />
            <span>Net Balance</span>
          </div>

          <div className="flex items-baseline space-x-2">
            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight ${
                netBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500 dark:text-rose-400'
              }`}
            >
              {netBalance >= 0 ? '+' : ''}
              {netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <span className="text-xl sm:text-2xl font-bold text-pink-500">DH</span>
          </div>

          <p className="text-xs font-semibold">
            {netBalance >= 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400">Positive Liquidity • On Track</span>
            ) : (
              <span className="text-rose-500 dark:text-rose-400">Budget Alert: Deficit</span>
            )}
          </p>
        </div>

        {/* Savings Mazalin men Flous li Dakhlo (Remaining from Income) */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-pink-500/10 to-purple-500/10 border border-emerald-500/20 dark:border-emerald-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-sm">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Savings • Mazal men Flous li Dakhlo
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                    {savingsRate}% Preserved
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {totalExpense.toFixed(2)} DH spent out of {totalIncome.toFixed(2)} DH total income
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <div className="flex items-baseline sm:justify-end space-x-1">
                <span
                  className={`text-lg sm:text-xl font-black ${
                    remainingSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                  }`}
                >
                  {remainingSavings >= 0 ? '+' : ''}
                  {remainingSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">DH</span>
              </div>
              <span className="block text-[10px] font-semibold text-slate-400">
                {remainingSavings >= 0 ? 'Liquid Savings Left' : 'Deficit Exceeded'}
              </span>
            </div>
          </div>

          {/* Mini savings progress indicator */}
          <div className="w-full h-1.5 bg-slate-200/70 dark:bg-slate-700/60 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                remainingSavings < 0
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-emerald-400 via-pink-400 to-purple-400'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }}
            />
          </div>
        </div>

        {/* Monthly Budget Progress Bar inside the Hero Card */}
        <div className="space-y-2 pt-1 border-t border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5 text-pink-500" />
              <span>Monthly Budget: {monthlyBudget.toLocaleString()} DH</span>
            </span>
            <span className="font-bold text-pink-500 dark:text-pink-400">{budgetPercentUsed}% used</span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700/60">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                budgetPercentUsed > 100
                  ? 'bg-rose-500'
                  : budgetPercentUsed > 80
                  ? 'bg-gradient-to-r from-pink-400 to-amber-400'
                  : 'bg-gradient-to-r from-emerald-400 via-pink-400 to-purple-400'
              }`}
              style={{ width: `${Math.min(100, budgetPercentUsed)}%` }}
            />
          </div>
        </div>

        {/* 3 Payment Method Pills inside Hero Card */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
          {/* Cash Pill */}
          <div className="flex flex-col sm:flex-row items-center sm:space-x-2.5 p-2.5 sm:p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 text-center sm:text-left transition-all">
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0 mb-1 sm:mb-0">
              <Banknote className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">Cash</span>
              <span className="block text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                {cashExpenses.toFixed(2)} DH
              </span>
            </div>
          </div>

          {/* Card Pill */}
          <div className="flex flex-col sm:flex-row items-center sm:space-x-2.5 p-2.5 sm:p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 text-center sm:text-left transition-all">
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0 mb-1 sm:mb-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">Card</span>
              <span className="block text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                {cardExpenses.toFixed(2)} DH
              </span>
            </div>
          </div>

          {/* Bank App Pill */}
          <div className="flex flex-col sm:flex-row items-center sm:space-x-2.5 p-2.5 sm:p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 text-center sm:text-left transition-all">
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0 mb-1 sm:mb-0">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">Bank App</span>
              <span className="block text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                {transferExpenses.toFixed(2)} DH
              </span>
            </div>
          </div>
        </div>

        {/* Background ambient glow */}
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* 2. TWO SIDE-BY-SIDE STAT CARDS: Total Income & Total Expenses (Directly like the referenced photo) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        {/* Total Income Card */}
        <div className="glass-card rounded-3xl p-4 sm:p-5 border border-emerald-500/20 bg-white/70 dark:bg-slate-900/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Total Income
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-1">
            <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 truncate">
              +{totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-xs font-bold">DH</span>
            </div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="glass-card rounded-3xl p-4 sm:p-5 border border-pink-400/20 bg-white/70 dark:bg-slate-900/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Total Expenses
            </span>
            <div className="w-7 h-7 rounded-xl bg-pink-500/15 text-pink-500 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-1">
            <div className="text-lg sm:text-2xl font-black text-rose-500 dark:text-pink-400 truncate">
              -{totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-xs font-bold">DH</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SPENDING BY CATEGORY: Donut Ring Chart + Category Breakdown Bars (Exact layout from photo) */}
      <div className="glass-card rounded-3xl p-5 sm:p-7 border border-pink-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Spending by Category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Breakdown across budget categories
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20">
            Total: {totalExpense.toFixed(2)} DH
          </span>
        </div>

        {categorySpending.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No expenses logged yet. Tap "+" or scan a receipt to see your category chart!
          </div>
        ) : (
          <div className="space-y-6">
            {/* Donut Ring Chart in Center */}
            <div className="flex justify-center items-center py-2">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-44 h-44 -rotate-90 transform">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="11"
                    className="text-slate-100 dark:text-slate-800"
                  />
                  {(() => {
                    let accumulated = 0;
                    const circumference = 2 * Math.PI * 38; // ~238.76
                    return categorySpending.map((cat, i) => {
                      const strokeDasharray = `${(cat.percentage * circumference) / 100} ${circumference}`;
                      const strokeDashoffset = -((accumulated * circumference) / 100);
                      accumulated += cat.percentage;
                      return (
                        <circle
                          key={i}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke={cat.color}
                          strokeWidth="11"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-700 ease-out"
                        />
                      );
                    });
                  })()}
                </svg>

                {/* Center Hole Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    TOTAL
                  </span>
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                    {totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] font-bold text-pink-500">DH</span>
                </div>
              </div>
            </div>

            {/* Ranked Category List with Progress Bars */}
            <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
              {categorySpending.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-6 h-6 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${cat.color}18`,
                          borderColor: `${cat.color}35`,
                          color: cat.color,
                        }}
                      >
                        <CategoryIcon category={cat.name} className="w-3.5 h-3.5" color={cat.color} />
                      </div>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">{cat.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {cat.total.toFixed(2)} DH
                      </span>
                      <span className="text-slate-400 text-[11px] font-medium">
                        {cat.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. RECENT TRANSACTIONS (Styled clean with item name, category, and direct actions) */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 border border-pink-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest expense & income entries
            </p>
          </div>
          {transactions.length > 0 && (
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs font-bold text-pink-500 hover:text-pink-600 flex items-center space-x-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Your wallet is fresh and ready! Tap "+" below to add your first transaction.
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentTransactions.map((tx) => {
              const matchedColor =
                categorySpending.find((c) => c.name === tx.category)?.color || '#EC4899';

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:border-pink-300/60 transition-all"
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
                      style={
                        tx.type === 'income'
                          ? {
                              backgroundColor: 'rgba(16, 185, 129, 0.12)',
                              color: '#10B981',
                              borderColor: 'rgba(16, 185, 129, 0.25)',
                            }
                          : {
                              backgroundColor: `${matchedColor}15`,
                              color: matchedColor,
                              borderColor: `${matchedColor}30`,
                            }
                      }
                    >
                      {tx.type === 'income' ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <CategoryIcon category={tx.category} className="w-5 h-5" color={matchedColor} />
                      )}
                    </div>

                  <div className="truncate">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {tx.itemName || tx.merchant || tx.subcategory}
                      </span>
                      {tx.merchant && tx.itemName && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                          {tx.merchant}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {tx.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center space-x-2">
                  <span
                    className={`text-sm sm:text-base font-extrabold ${
                      tx.type === 'income'
                        ? 'text-emerald-500'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {tx.amount.toFixed(2)} DH
                  </span>
                  <button
                    onClick={() => setEditingTransaction(tx)}
                    className="p-1 rounded-lg text-slate-400 hover:text-pink-500 transition-colors cursor-pointer"
                    title="Edit transaction"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Delete transaction"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* 5. FLOATING ACTION BUTTONS DOCK (Matching Bottom-Left buttons in referenced photo) */}
      <div className="fixed bottom-20 sm:bottom-8 left-4 sm:left-8 z-40 flex flex-col items-center space-y-3">
        {/* Floating Scan Button */}
        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          title="Scan Moroccan Receipt with Gemini"
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white/40"
        >
          <Camera className="w-5 h-5" />
        </button>

        {/* Floating Add Transaction Button */}
        <button
          type="button"
          onClick={() => setIsQuickAddOpen(true)}
          title="Quick Add Transaction"
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white shadow-xl shadow-pink-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white/40"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};
