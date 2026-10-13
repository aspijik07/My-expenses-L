import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction, PaymentMethod } from '../types';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Receipt,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Calendar,
  Layers,
  ArrowUpDown,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

export const TransactionHistory: React.FC = () => {
  const { transactions, deleteTransaction, setEditingTransaction, categories } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentMethod>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | 'this_month' | 'last_30_days' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Current month prefix (YYYY-MM)
  const currentMonth = new Date().toISOString().substring(0, 7);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  // Filtering and sorting logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type match
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // Payment method match
      if (paymentFilter !== 'all' && tx.paymentMethod !== paymentFilter) return false;

      // Category match
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;

      // Date range match
      if (dateRange === 'this_month' && !tx.date.startsWith(currentMonth)) return false;
      if (dateRange === 'last_30_days' && tx.date < thirtyDaysAgo) return false;
      if (dateRange === 'custom') {
        if (customStartDate && tx.date < customStartDate) return false;
        if (customEndDate && tx.date > customEndDate) return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesItemName = tx.itemName?.toLowerCase().includes(query);
        const matchesMerchant = tx.merchant?.toLowerCase().includes(query);
        const matchesNotes = tx.notes?.toLowerCase().includes(query);
        const matchesCategory = tx.category.toLowerCase().includes(query);
        const matchesSubcategory = tx.subcategory.toLowerCase().includes(query);
        const matchesAmount = tx.amount.toString().includes(query);

        if (
          !matchesItemName &&
          !matchesMerchant &&
          !matchesNotes &&
          !matchesCategory &&
          !matchesSubcategory &&
          !matchesAmount
        ) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
      if (sortBy === 'date_asc') return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, searchQuery, typeFilter, paymentFilter, categoryFilter, dateRange, customStartDate, customEndDate, sortBy]);

  // Export filtered to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Item Name', 'Amount (DH)', 'Category', 'Subcategory', 'Payment Method', 'Bank', 'Merchant', 'Batch Color', 'Notes'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.date,
      t.type,
      `"${t.itemName || ''}"`,
      t.amount.toFixed(2),
      `"${t.category}"`,
      `"${t.subcategory}"`,
      t.paymentMethod,
      t.bankName || '',
      `"${t.merchant || ''}"`,
      t.batchColor || '',
      `"${t.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `my-expenses-l-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allCategoryNames = Array.from(new Set(categories.map((c) => c.name)));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Transaction History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {filteredTransactions.length} of {transactions.length} records matching filters
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-pink-300 shadow-sm transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-pink-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-3xl p-5 border border-pink-200/50 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by merchant (BIM, Marjane, Zara), subcategory, notes, or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-pink-500 text-slate-900 dark:text-white transition-all"
          />
        </div>

        {/* Filter Chips & Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
          {/* Type */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
              Payment
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Categories</option>
              {allCategoryNames.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
              Time Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Time</option>
              <option value="this_month">This Month</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="date_desc">Date (Newest)</option>
              <option value="date_asc">Date (Oldest)</option>
              <option value="amount_desc">Amount (Highest)</option>
              <option value="amount_asc">Amount (Lowest)</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Picker (From / To) */}
        {dateRange === 'custom' && (
          <div className="p-3.5 rounded-2xl bg-pink-500/5 dark:bg-slate-800/60 border border-pink-300/30 dark:border-slate-700 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-pink-600 dark:text-pink-300 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Select Custom Date Interval</span>
              </span>
              {(customStartDate || customEndDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className="text-[10px] font-semibold text-slate-400 hover:text-rose-500 transition-colors"
                >
                  Clear Custom Filter
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  From Date (Start)
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-pink-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  To Date (End)
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-pink-400"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700">
            <Receipt className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              No transactions found
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search filters or click "Add" to create a new record.
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isExpanded = expandedTxId === tx.id;
            const hasItems = tx.items && tx.items.length > 0;

            return (
              <div
                key={tx.id}
                style={tx.batchColor ? { borderLeft: `4px solid ${tx.batchColor}` } : undefined}
                className="glass-card rounded-3xl p-4 sm:p-5 border border-slate-200/60 dark:border-slate-800/80 hover:border-rosegold-400/40 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  {/* Left: Icon & Info */}
                  <div className="flex items-center space-x-3.5">
                    <div
                      style={
                        tx.batchColor
                          ? {
                              backgroundColor: `${tx.batchColor}18`,
                              color: tx.batchColor,
                              borderColor: `${tx.batchColor}40`,
                            }
                          : undefined
                      }
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold flex-shrink-0 border ${
                        !tx.batchColor
                          ? tx.type === 'income'
                            ? 'bg-emerald-500/10 text-emerald-500 border-transparent'
                            : 'bg-rosegold-400/10 text-rosegold-500 border-transparent'
                          : ''
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <CategoryIcon category={tx.category} className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {tx.itemName || tx.merchant || tx.subcategory}
                        </span>

                        {tx.batchColor && tx.merchant && (
                          <span
                            style={{
                              backgroundColor: `${tx.batchColor}18`,
                              color: tx.batchColor,
                              borderColor: `${tx.batchColor}40`,
                            }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                          >
                            {tx.merchant}
                          </span>
                        )}

                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {tx.category}
                        </span>

                        {tx.bankName && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-lavender-500/10 text-lavender-500 border border-lavender-500/20">
                            {tx.bankName}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {tx.itemName && tx.merchant && (
                          <>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              From {tx.merchant}
                            </span>
                            <span>•</span>
                          </>
                        )}
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {tx.subcategory}
                        </span>
                        <span>•</span>
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span>{tx.paymentMethod}</span>
                        {tx.notes && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-400 truncate max-w-xs">"{tx.notes}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="text-right">
                      <span
                        className={`text-base sm:text-lg font-extrabold ${
                          tx.type === 'income' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {tx.amount.toFixed(2)}{' '}
                        <span className="text-xs font-semibold text-rosegold-400">DH</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {hasItems && (
                        <button
                          onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rosegold-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View Scanned Itemized List"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}

                      <button
                        onClick={() => setEditingTransaction(tx)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rosegold-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Transaction"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete transaction of ${tx.amount.toFixed(2)} DH?`)) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Itemized Receipt Drawer */}
                {isExpanded && hasItems && (
                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 animate-fadeIn">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center space-x-1.5">
                      <Receipt className="w-3.5 h-3.5 text-lavender-500" />
                      <span>Itemized Receipt Details ({tx.items!.length} items)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {tx.items!.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-700/40"
                        >
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                            {it.name} {it.quantity && it.quantity > 1 ? `(x${it.quantity})` : ''}
                          </span>
                          <span className="font-bold text-rosegold-500">
                            {it.price.toFixed(2)} DH
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
