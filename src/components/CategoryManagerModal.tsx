import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TransactionType } from '../types';
import {
  X,
  FolderPlus,
  Plus,
  Trash2,
  Tag,
  Sparkles,
  Check,
} from 'lucide-react';

const PASTEL_COLOR_CHOICES = [
  '#FF85A1', // Baby Pink
  '#FFA8BA', // Soft Blush
  '#FFB4A2', // Peach Cream
  '#E5989B', // Rose Blossom
  '#9D84B7', // Pastel Lilac
  '#B5838D', // Dusty Rose
  '#F28482', // Soft Coral
  '#84DCC6', // Mint Pastel
  '#6B9080', // Sage Green
  '#BDB2FF', // Periwinkle
  '#06D6A0', // Fresh Green
  '#FFD166', // Pastel Gold
];

export const CategoryManagerModal: React.FC = () => {
  const {
    isCategoryManagerOpen,
    setIsCategoryManagerOpen,
    categories,
    addCategory,
    addSubcategory,
    deleteCategory,
  } = useApp();

  const [activeTypeTab, setActiveTypeTab] = useState<TransactionType>('expense');
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(PASTEL_COLOR_CHOICES[0]);
  const [newCatSubcategories, setNewCatSubcategories] = useState('');
  const [activeCategoryForSub, setActiveCategoryForSub] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState('');

  if (!isCategoryManagerOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === activeTypeTab);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const subs = newCatSubcategories
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    addCategory({
      name: newCatName.trim(),
      iconName: 'FolderPlus',
      color: newCatColor,
      type: activeTypeTab,
      subcategories: subs.length > 0 ? subs : ['General'],
    });

    setNewCatName('');
    setNewCatSubcategories('');
  };

  const handleAddSubcategorySubmit = (catName: string) => {
    if (!newSubName.trim()) return;
    addSubcategory(catName, newSubName.trim());
    setNewSubName('');
    setActiveCategoryForSub(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-card rounded-3xl p-6 sm:p-8 border border-pink-300/40 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-400 text-white flex items-center justify-center shadow-sm">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Custom Categories & Subcategories Studio
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize your Moroccan expenses & income with custom tags
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCategoryManagerOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {/* Segmented Type Switch */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setActiveTypeTab('expense')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                activeTypeTab === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-pink-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Expense Categories ({categories.filter((c) => c.type === 'expense').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTypeTab('income')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                activeTypeTab === 'income'
                  ? 'bg-white dark:bg-slate-900 text-emerald-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Income Categories ({categories.filter((c) => c.type === 'income').length})
            </button>
          </div>

          {/* Form to Add New Category */}
          <form
            onSubmit={handleCreateCategory}
            className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3"
          >
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <Plus className="w-4 h-4 text-pink-500" />
              <span>Create New {activeTypeTab === 'expense' ? 'Expense' : 'Income'} Category</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Nails & Spa, Pet Care, Vintage Hauls..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-pink-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Initial Subcategories (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Gel Polish, Nail Art, Acrylics"
                  value={newCatSubcategories}
                  onChange={(e) => setNewCatSubcategories(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-pink-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Pastel Color Swatches */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Pastel Tag Color
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {PASTEL_COLOR_CHOICES.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setNewCatColor(col)}
                    className="w-7 h-7 rounded-xl flex items-center justify-center transition-transform hover:scale-110 border border-white/40"
                    style={{ backgroundColor: col }}
                  >
                    {newCatColor === col && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-400 hover:opacity-95 shadow-sm"
              >
                Add Category
              </button>
            </div>
          </form>

          {/* List of Existing Categories */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Current {activeTypeTab === 'expense' ? 'Expense' : 'Income'} Categories ({filteredCategories.length})
            </h3>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {cat.name}
                      </span>
                      {cat.isCustom && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-pink-500/10 text-pink-500">
                          Custom
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveCategoryForSub(
                            activeCategoryForSub === cat.name ? null : cat.name
                          )
                        }
                        className="text-[11px] font-bold text-pink-500 hover:underline flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Subcategory</span>
                      </button>

                      {cat.isCustom && (
                        <button
                          type="button"
                          onClick={() => deleteCategory(cat.id)}
                          className="p-1 text-slate-400 hover:text-rose-500"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Subcategories tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories.map((sub, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>

                  {/* Inline Subcategory adder if toggled */}
                  {activeCategoryForSub === cat.name && (
                    <div className="pt-2 flex items-center space-x-2 animate-fadeIn">
                      <input
                        type="text"
                        autoFocus
                        placeholder={`New subcategory for ${cat.name}...`}
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSubcategorySubmit(cat.name);
                          }
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-pink-400 text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSubcategorySubmit(cat.name)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-pink-500"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCategoryForSub(null)}
                        className="px-2 py-1.5 text-xs text-slate-400"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-200/60 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => setIsCategoryManagerOpen(false)}
            className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-400"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
