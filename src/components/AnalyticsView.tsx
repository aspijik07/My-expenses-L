import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EXPENSE_CATEGORIES } from '../data/categories';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Calendar,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { transactions } = useApp();

  const [activeCategoryHover, setActiveCategoryHover] = useState<string | null>(null);

  const expenses = transactions.filter((t) => t.type === 'expense');
  const incomes = transactions.filter((t) => t.type === 'income');

  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);

  // Group expenses by Category
  const categoryTotals = EXPENSE_CATEGORIES.map((cat) => {
    const amount = expenses
      .filter((t) => t.category === cat.name)
      .reduce((sum, t) => sum + t.amount, 0);

    const percent = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;

    return {
      name: cat.name,
      amount,
      percent,
      color: cat.color,
    };
  })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // Payment methods breakdown
  const paymentTotals = {
    Cash: expenses.filter((t) => t.paymentMethod === 'Cash').reduce((s, t) => s + t.amount, 0),
    Card: expenses.filter((t) => t.paymentMethod === 'Card').reduce((s, t) => s + t.amount, 0),
    'Bank Transfer': expenses.filter((t) => t.paymentMethod === 'Bank Transfer').reduce((s, t) => s + t.amount, 0),
  };

  // Group by Month (Last 6 Months)
  const monthMap = new Map<string, { income: number; expense: number }>();
  transactions.forEach((tx) => {
    const month = tx.date.substring(0, 7); // YYYY-MM
    if (!monthMap.has(month)) {
      monthMap.set(month, { income: 0, expense: 0 });
    }
    const current = monthMap.get(month)!;
    if (tx.type === 'income') {
      current.income += tx.amount;
    } else {
      current.expense += tx.amount;
    }
  });

  const sortedMonths = Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6);

  const maxMonthValue = Math.max(
    ...sortedMonths.map(([_, v]) => Math.max(v.income, v.expense)),
    1000
  );

  // SVG Donut Chart Calculation
  let cumulativePercent = 0;
  const donutSlices = categoryTotals.map((cat) => {
    const startAngle = (cumulativePercent / 100) * 360;
    cumulativePercent += cat.percent;
    const endAngle = (cumulativePercent / 100) * 360;

    // SVG arc coordinates
    const radius = 80;
    const innerRadius = 55;
    const centerX = 100;
    const centerY = 100;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    const pathData = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;

    return {
      ...cat,
      pathData,
    };
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Financial Analytics & Charts
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Visual spending breakdowns in Moroccan Dirhams (DH)
        </p>
      </div>

      {/* Top 2 Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Spending Donut Chart */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 border border-rosegold-400/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-2xl bg-rosegold-400/10 text-rosegold-500">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Expense Category Distribution
                </h3>
                <span className="text-xs text-slate-500">Share of total monthly spend</span>
              </div>
            </div>
            <span className="text-xs font-extrabold text-rosegold-500">
              {totalExpense.toFixed(2)} DH
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
            {/* Donut SVG */}
            <div className="relative w-52 h-52 flex-shrink-0">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                {donutSlices.map((slice, i) => (
                  <path
                    key={i}
                    d={slice.pathData}
                    fill={slice.color}
                    className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    onMouseEnter={() => setActiveCategoryHover(slice.name)}
                    onMouseLeave={() => setActiveCategoryHover(null)}
                  />
                ))}
              </svg>

              {/* Center Donut Hole Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  {Math.round(totalExpense).toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-rosegold-400">DH</span>
              </div>
            </div>

            {/* Category Legend list */}
            <div className="w-full space-y-2 max-h-56 overflow-y-auto pr-2 text-xs">
              {categoryTotals.map((cat, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                    activeCategoryHover === cat.name ? 'bg-rosegold-400/10 font-bold' : ''
                  }`}
                  onMouseEnter={() => setActiveCategoryHover(cat.name)}
                  onMouseLeave={() => setActiveCategoryHover(null)}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-slate-700 dark:text-slate-300 truncate">
                      {cat.name}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {cat.amount.toFixed(0)} DH
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5">
                      ({cat.percent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Expenses vs Income Bar Chart */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 border border-rosegold-400/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 rounded-2xl bg-lavender-500/10 text-lavender-500">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Monthly Cashflow Trends
                </h3>
                <span className="text-xs text-slate-500">Income vs Expenses over time</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs font-semibold">
              <span className="flex items-center space-x-1 text-emerald-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Income</span>
              </span>
              <span className="flex items-center space-x-1 text-rosegold-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rosegold-400 inline-block" />
                <span>Expense</span>
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2">
            {sortedMonths.map(([month, data]) => {
              const incomeHeight = Math.max(8, Math.round((data.income / maxMonthValue) * 180));
              const expenseHeight = Math.max(8, Math.round((data.expense / maxMonthValue) * 180));

              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-48">
                    {/* Income Bar */}
                    <div
                      className="w-1/2 max-w-[24px] bg-emerald-500/80 hover:bg-emerald-500 rounded-t-lg transition-all relative"
                      style={{ height: `${incomeHeight}px` }}
                      title={`Income: ${data.income.toFixed(2)} DH`}
                    />
                    {/* Expense Bar */}
                    <div
                      className="w-1/2 max-w-[24px] bg-rosegold-400 hover:bg-rosegold-500 rounded-t-lg transition-all relative"
                      style={{ height: `${expenseHeight}px` }}
                      title={`Expense: ${data.expense.toFixed(2)} DH`}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Spending Categories Leaderboard */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-rosegold-400/20">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Top Spending Categories Leaderboard
        </h3>

        <div className="space-y-4">
          {categoryTotals.map((cat, index) => (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center space-x-2">
                  <span className="w-5 text-slate-400 font-bold">#{index + 1}</span>
                  <span className="text-slate-800 dark:text-slate-200">{cat.name}</span>
                </div>
                <div className="text-slate-900 dark:text-white font-extrabold">
                  {cat.amount.toFixed(2)} DH ({cat.percent.toFixed(1)}%)
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${cat.percent}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
