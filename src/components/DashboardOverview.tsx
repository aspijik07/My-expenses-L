import React from 'react';
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
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const {
    transactions,
    settings,
    setActiveTab,
    setIsQuickAddOpen,
    setIsScannerOpen,
    setEditingTransaction,
  } = useApp();

  const currentMonthPrefix = new Date().toISOString().substring(0, 7);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const monthlyExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonthPrefix))
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyBudget = settings.monthlyBudget || 8500;
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

  const cashPercent = totalExpense > 0 ? Math.round((cashExpenses / totalExpense) * 100) : 0;
  const cardPercent = totalExpense > 0 ? Math.round((cardExpenses / totalExpense) * 100) : 0;
  const transferPercent = totalExpense > 0 ? Math.round((transferExpenses / totalExpense) * 100) : 0;

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner - Pinterest Aesthetic */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-6 sm:p-8 border border-pink-200/50 bg-gradient-to-r from-pink-100/50 via-rose-100/40 to-purple-100/30 dark:from-slate-900/90 dark:via-slate-800/80 dark:to-slate-900/90">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Moroccan Dirham (DH) • Banque Populaire Edition</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Marhaban! Your Personal She Budget
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl">
              Track your daily beauty, lifestyle, and Chaabi Bank expenses. Scan receipts with Gemini 3.6 Flash for instant sub-second entry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-400 hover:opacity-95 shadow-sm transition-all"
            >
              <Scan className="w-4 h-4" />
              <span>Scan Receipt (BIM / Marjane)</span>
            </button>
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-pink-300 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-pink-500" />
              <span>Quick Add Entry</span>
            </button>
            <button
              onClick={() => setActiveTab('guidebook')}
              className="flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl text-xs font-bold text-purple-600 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-all"
              title="Open Complete User Guidebook"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Guidebook</span>
            </button>
          </div>
        </div>

        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-pink-400/15 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Income */}
        <div className="glass-card rounded-3xl p-5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Income
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-sm font-semibold text-pink-500">DH</span>
            </div>
            <p className="mt-1 text-xs text-emerald-500 font-medium">
              Salary, allowances & freelance
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="glass-card rounded-3xl p-5 border border-pink-300/30 hover:border-pink-300/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-sm font-semibold text-pink-500">DH</span>
            </div>
            <p className="mt-1 text-xs text-pink-500 font-medium">
              Across all categories
            </p>
          </div>
        </div>

        {/* Net Balance */}
        <div className="glass-card rounded-3xl p-5 border border-purple-400/20 hover:border-purple-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Net Balance
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div
              className={`text-2xl sm:text-3xl font-extrabold ${
                netBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'
              }`}
            >
              {netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-sm font-semibold text-pink-500">DH</span>
            </div>
            <p className="mt-1 text-xs text-purple-500 dark:text-purple-400 font-medium">
              {netBalance >= 0 ? 'Positive Liquidity' : 'Notice: Over Budget'}
            </p>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="glass-card rounded-3xl p-5 border border-pink-200 hover:border-pink-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Savings Rate
            </span>
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0}%
            </div>
            <p className="mt-1 text-xs text-pink-500 font-medium">
              Saved from earnings
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Budget Progress Bar */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-pink-200/50 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Budget Goal ({new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Target set to {monthlyBudget.toLocaleString()} DH / month
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-right">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Spent This Month</span>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Remaining</span>
              <p
                className={`text-lg font-bold ${
                  remainingBudget < 0 ? 'text-rose-500' : 'text-emerald-500'
                }`}
              >
                {remainingBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-3.5 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                budgetPercentUsed > 100
                  ? 'bg-rose-500'
                  : budgetPercentUsed > 80
                  ? 'bg-gradient-to-r from-pink-400 to-amber-500'
                  : 'bg-gradient-to-r from-emerald-400 via-pink-400 to-purple-400'
              }`}
              style={{ width: `${Math.min(100, budgetPercentUsed)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs font-semibold">
            <span
              className={
                budgetPercentUsed > 90
                  ? 'text-rose-500 flex items-center space-x-1'
                  : 'text-slate-600 dark:text-slate-400 flex items-center space-x-1'
              }
            >
              {budgetPercentUsed > 90 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 inline" />
                  <span>{budgetPercentUsed}% used • Nearing limit</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 inline text-emerald-500" />
                  <span>{budgetPercentUsed}% used • On track</span>
                </>
              )}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Budget: {monthlyBudget.toLocaleString()} DH
            </span>
          </div>
        </div>
      </div>

      {/* Payment Methods Breakdown Cards (Featuring Chaabi Bank BCP exclusively) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Payment Methods Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Moroccan spending split between Cash, Banque Populaire, and Transfers
            </p>
          </div>
          <span className="text-xs font-semibold text-pink-500">
            Total {totalExpense.toFixed(2)} DH
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Cash (Espèces) */}
          <div className="glass-card rounded-3xl p-5 border border-pink-200 hover:border-pink-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Cash (Espèces)
                  </h4>
                  <span className="text-[11px] text-slate-500">ATM Withdrawals, Taxi, Hanout</span>
                </div>
              </div>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400">
                {cashPercent}%
              </span>
            </div>

            <div className="mt-4">
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                {cashExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                <span className="text-xs font-semibold text-pink-500">DH</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {expenseTransactions.filter((t) => t.paymentMethod === 'Cash').length} records logged
              </p>
            </div>
          </div>

          {/* 2. Banque Populaire (Chaabi Bank) Card */}
          <div className="glass-card rounded-3xl p-5 border border-amber-500/30 hover:border-amber-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1">
                    <span>Banque Populaire</span>
                  </h4>
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    Chaabi Bank Card (BCP)
                  </span>
                </div>
              </div>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
                {cardPercent}%
              </span>
            </div>

            <div className="mt-4">
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                {cardExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                <span className="text-xs font-semibold text-pink-500">DH</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {expenseTransactions.filter((t) => t.paymentMethod === 'Card').length} Chaabi Card POS payments
              </p>
            </div>
          </div>

          {/* 3. Bank Transfer (Virement) */}
          <div className="glass-card rounded-3xl p-5 border border-purple-400/20 hover:border-purple-400/40 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Bank Transfer
                  </h4>
                  <span className="text-[11px] text-slate-500">Chaabi Net Virement, Studio Rent</span>
                </div>
              </div>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                {transferPercent}%
              </span>
            </div>

            <div className="mt-4">
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                {transferExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                <span className="text-xs font-semibold text-pink-500">DH</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {expenseTransactions.filter((t) => t.paymentMethod === 'Bank Transfer').length} bank wires
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions / Empty Slate View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-pink-200/50">
          <div className="flex items-center justify-between mb-5">
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
                className="text-xs font-bold text-pink-500 hover:text-pink-600 flex items-center space-x-1"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Empty Slate when transactions === 0 */}
          {transactions.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                Your wallet is fresh and ready!
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No transactions yet. Click "+ Add" to log your first coffee, beauty buy, or salary, or scan a Moroccan receipt.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => setIsQuickAddOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-pink-500 shadow-sm"
                >
                  + Add First Entry
                </button>
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  Scan Receipt
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => setEditingTransaction(tx)}
                  className="group flex items-center justify-between p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 hover:border-pink-300/60 transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                        tx.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-pink-500/10 text-pink-500'
                      }`}
                    >
                      {tx.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {tx.merchant || tx.subcategory}
                        </span>
                        {tx.paymentMethod === 'Card' && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                            Chaabi Bank
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{tx.subcategory}</span>
                        <span>•</span>
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span>{tx.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm sm:text-base font-extrabold ${
                        tx.type === 'income' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {tx.amount.toFixed(2)} DH
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Moroccan She Budget Smart Tips */}
        <div className="glass-card rounded-3xl p-6 border border-pink-200/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Chaabi Bank Tips & Guide
              </h3>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="font-bold text-amber-700 dark:text-amber-300 block mb-1">
                  Banque Populaire (Chaabi Bank)
                </span>
                Pay with your Chaabi card at BIM, Marjane, and cosmetics stores to keep track of exact transaction totals.
              </div>

              <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20">
                <span className="font-bold text-pink-600 dark:text-pink-300 block mb-1">
                  Gemini 3.6 Flash Scanner
                </span>
                Take a quick photo of paper supermarket receipts. Gemini compresses the image on canvas to ~80KB for instant extraction!
              </div>

              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <span className="font-bold text-purple-600 dark:text-purple-300 block mb-1">
                  Custom Categories
                </span>
                Need a category for "Nail Salon", "Thrifting", or "Pet Care"? Tap "Categories" in the top bar to create one freely.
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-500">Need full instructions?</span>
            <button
              onClick={() => setActiveTab('guidebook')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center space-x-1"
            >
              <span>Open Guidebook</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
