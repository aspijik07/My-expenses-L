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
  UtensilsCrossed,
  Home,
  Scan,
  Plus,
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

  // Current month filter (YYYY-MM)
  const currentMonthPrefix = new Date().toISOString().substring(0, 7);

  // Financial calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Monthly Budget calculations
  const monthlyExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonthPrefix))
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyBudget = settings.monthlyBudget || 8500;
  const budgetPercentUsed = Math.min(100, Math.round((monthlyExpenses / monthlyBudget) * 100));
  const remainingBudget = monthlyBudget - monthlyExpenses;

  // Payment Method Distributions (for Expenses)
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

  // Bank breakdown
  const bankCardCounts = expenseTransactions
    .filter((t) => t.paymentMethod === 'Card' && t.bankName)
    .reduce((acc, t) => {
      const b = t.bankName || 'Other';
      acc[b] = (acc[b] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner with Moroccan Touch */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-6 sm:p-8 border border-rosegold-400/20 bg-gradient-to-r from-rosegold-100/40 via-blush-100/50 to-lavender-100/30 dark:from-slate-900/90 dark:via-slate-800/80 dark:to-slate-900/90">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rosegold-400/10 text-rosegold-500 dark:text-rosegold-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Moroccan Dirham (DH) Expense & Budget Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Marhaban! Ready to master your finances?
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl">
              Track your beauty care, shopping, Casablanca & Rabat living expenses, and automate receipt entry with our Gemini 3.6 Flash scanner.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-rosegold-400 to-blush-500 hover:shadow-glow-rosegold transition-all"
            >
              <Scan className="w-4 h-4" />
              <span>Scan Receipt (BIM / Marjane / Bills)</span>
            </button>
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-rosegold-400 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-rosegold-400" />
              <span>Quick Add Entry</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow circle */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-rosegold-400/15 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Income */}
        <div className="glass-card rounded-3xl p-5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all glow-card">
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
              <span className="text-sm font-semibold text-rosegold-400">DH</span>
            </div>
            <p className="mt-1 text-xs text-emerald-500 font-medium flex items-center space-x-1">
              <span>Salary & Freelance Cashflow</span>
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="glass-card rounded-3xl p-5 border border-blush-400/30 hover:border-blush-400/50 transition-all glow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blush-400/15 text-blush-500 dark:text-blush-300 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <span className="text-sm font-semibold text-rosegold-400">DH</span>
            </div>
            <p className="mt-1 text-xs text-blush-500 font-medium">
              Across all categories
            </p>
          </div>
        </div>

        {/* Net Balance */}
        <div className="glass-card rounded-3xl p-5 border border-lavender-500/20 hover:border-lavender-500/40 transition-all glow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Net Balance
            </span>
            <div className="w-10 h-10 rounded-2xl bg-lavender-500/15 text-lavender-500 flex items-center justify-center">
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
              <span className="text-sm font-semibold text-rosegold-400">DH</span>
            </div>
            <p className="mt-1 text-xs text-lavender-500 dark:text-lavender-400 font-medium">
              {netBalance >= 0 ? 'Healthy Liquidity' : 'Attention: Deficit'}
            </p>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="glass-card rounded-3xl p-5 border border-rosegold-400/20 hover:border-rosegold-400/40 transition-all glow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Savings Rate
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rosegold-400/15 text-rosegold-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0}%
            </div>
            <p className="mt-1 text-xs text-rosegold-500 font-medium">
              Saved from total earnings
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Budget Limit Progress Bar */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-rosegold-400/20 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-rosegold-400/10 text-rosegold-500 border border-rosegold-400/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Budget Goal ({new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Limit set to {monthlyBudget.toLocaleString()} DH / month
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

        {/* Visual Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-3.5 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                budgetPercentUsed > 100
                  ? 'bg-rose-500'
                  : budgetPercentUsed > 80
                  ? 'bg-gradient-to-r from-rosegold-400 to-amber-500'
                  : 'bg-gradient-to-r from-emerald-400 via-rosegold-400 to-lavender-500'
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
                  <span>{budgetPercentUsed}% utilized • Nearing limit</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 inline text-emerald-500" />
                  <span>{budgetPercentUsed}% utilized • Within budget</span>
                </>
              )}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Target: {monthlyBudget.toLocaleString()} DH
            </span>
          </div>
        </div>
      </div>

      {/* Payment Methods Breakdown Cards (Cash, Card with Moroccan Banks, Bank Transfer) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Payment Methods Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribution of your Moroccan expenses by payment channel
            </p>
          </div>
          <span className="text-xs font-semibold text-rosegold-500">
            Total {totalExpense.toFixed(2)} DH
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Cash (Espèces) */}
          <div className="glass-card rounded-3xl p-5 border border-amber-500/20 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Cash (Espèces)
                  </h4>
                  <span className="text-[11px] text-slate-500">Hanout, Taxi, Local Groceries</span>
                </div>
              </div>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {cashPercent}%
              </span>
            </div>

            <div className="mt-4">
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                {cashExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                <span className="text-xs font-semibold text-rosegold-400">DH</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {expenseTransactions.filter((t) => t.paymentMethod === 'Cash').length} transactions recorded
              </p>
            </div>
          </div>

          {/* 2. Card (CIH, Attijariwafa, BMCE, BCP, SGMB) */}
          <div className="glass-card rounded-3xl p-5 border border-lavender-500/20 hover:border-lavender-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-lavender-500/10 text-lavender-500 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Bank Card
                  </h4>
                  <span className="text-[11px] text-slate-500">CIH, Attijariwafa, BMCE, BCP</span>
                </div>
              </div>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-lavender-500/10 text-lavender-600 dark:text-lavender-400">
                {cardPercent}%
              </span>
            </div>

            <div className="mt-4">
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                {cardExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                <span className="text-xs font-semibold text-rosegold-400">DH</span>
              </div>

              {/* Moroccan Bank Chips */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {Object.entries(bankCardCounts).map(([bank, amount]) => (
                  <span
                    key={bank}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {bank}: {amount.toFixed(0)} DH
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Bank Transfer (Virement) */}
          <div className="glass-card rounded-3xl p-5 border border-rosegold-400/20 hover:border-rosegold-400/40 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rosegold-400/10 text-rosegold-500 flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Bank Transfer (Virement)
                  </h4>
                  <span className="text-[11px] text-slate-500">Rent, High value bills</span>
                </div>
              </div>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-rosegold-400/10 text-rosegold-600 dark:text-rosegold-300">
                {transferPercent}%
              </span>
            </div>

            <div className="mt-4">
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                {transferExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                <span className="text-xs font-semibold text-rosegold-400">DH</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {expenseTransactions.filter((t) => t.paymentMethod === 'Bank Transfer').length} transactions recorded
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions & Quick Categorization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions list (2 cols) */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-rosegold-400/20">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Transactions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest 5 expense & income operations
              </p>
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs font-bold text-rosegold-500 hover:text-rosegold-400 flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setEditingTransaction(tx)}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 hover:border-rosegold-400/40 transition-all cursor-pointer shadow-sm"
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                      tx.type === 'income'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-rosegold-400/10 text-rosegold-500'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <ShoppingBag className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {tx.merchant || tx.subcategory}
                      </span>
                      {tx.items && tx.items.length > 0 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-lavender-500/10 text-lavender-500 border border-lavender-500/20">
                          {tx.items.length} items scanned
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{tx.subcategory}</span>
                      <span>•</span>
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {tx.paymentMethod} {tx.bankName ? `(${tx.bankName})` : ''}
                      </span>
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
        </div>

        {/* She Budget Lifestyle Insights (1 col) */}
        <div className="glass-card rounded-3xl p-6 border border-rosegold-400/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="p-2 rounded-xl bg-rosegold-400/15 text-rosegold-500">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                She Budget Moroccan Tips
              </h3>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-2xl bg-rosegold-400/5 border border-rosegold-400/15">
                <span className="font-bold text-rosegold-500 block mb-1">
                  BIM & Marjane Grocery Optimization
                </span>
                Bulk buying essentials like olive oil, dairy, and coffee at BIM saves an estimated 15% to 20% compared to daily corner Hanout purchases.
              </div>

              <div className="p-3 rounded-2xl bg-lavender-500/5 border border-lavender-500/15">
                <span className="font-bold text-lavender-500 block mb-1">
                  Beauty & Skincare Routine
                </span>
                Plan your cosmetics & pharmacy treatments around monthly salary payout (1st-5th) to protect month-end liquidity.
              </div>

              <div className="p-3 rounded-2xl bg-blush-400/5 border border-blush-400/15">
                <span className="font-bold text-blush-500 block mb-1">
                  Utilities Auto-Sync
                </span>
                Always keep PDF or paper receipts from Lydec, RADEEJ, or Inwi. You can snap them directly in the Gemini OCR scanner!
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-500">Need deep analytics?</span>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs font-bold text-lavender-500 hover:text-lavender-400 flex items-center space-x-1"
            >
              <span>Explore Charts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
