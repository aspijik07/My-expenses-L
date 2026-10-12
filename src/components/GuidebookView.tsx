import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Search,
  Sparkles,
  CreditCard,
  PlusCircle,
  Scan,
  Palette,
  FolderPlus,
  PieChart,
  Database,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Key,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const GuidebookView: React.FC = () => {
  const {
    setIsQuickAddOpen,
    setIsScannerOpen,
    setIsSettingsOpen,
    setIsCategoryManagerOpen,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const sections = [
    {
      id: 'quickstart',
      title: 'Quick Start & Daily Workflow',
      icon: Sparkles,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      badge: 'Start Here',
      steps: [
        {
          title: '1. Welcome to your Fresh Slate',
          text: 'Your app starts with 100% clean data so you have full control over your personal wallet. You can enter your first transaction manually or scan a receipt.',
        },
        {
          title: '2. Daily Entry Routine',
          text: 'Whenever you buy a coffee, pay rent, restock skincare, or receive salary, tap the "+ Add" button at the top-right to log it in under 5 seconds.',
        },
        {
          title: '3. Track Your Monthly Budget Goal',
          text: 'Check the Dashboard progress bar to see how much of your monthly budget (default 8,500 DH) is remaining before month-end.',
        },
      ],
    },
    {
      id: 'chaabi-bank',
      title: 'Banque Populaire (Chaabi Bank) Integration',
      icon: CreditCard,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      badge: 'Exclusive Bank',
      steps: [
        {
          title: '1. Why Banque Populaire (Chaabi Bank)?',
          text: 'The app is exclusively mapped to your Banque Populaire account. Whenever you choose "Bank Card", your transaction is registered under Chaabi Bank BCP.',
        },
        {
          title: '2. Card Expenses vs. Cash',
          text: 'Use "Bank Card" for TPE terminal payments (BIM, Marjane, Zara, Nocibé) and "Cash" when you withdraw money from a Chaabi Bank ATM to pay local taxis or corner shops.',
        },
        {
          title: '3. Bank Transfer',
          text: 'For studio rent, university tuition, or monthly bills, select "Bank Transfer" to keep your wire transfers organized.',
        },
      ],
    },
    {
      id: 'transactions',
      title: 'Adding, Editing & Deleting Transactions',
      icon: PlusCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      badge: 'Core Feature',
      steps: [
        {
          title: 'How to Add a Transaction (+ Add)',
          text: 'Click "+ Add" in the top bar. Pick "Expense (-)" or "Income (+)". Enter the amount in Moroccan Dirhams (DH). Choose Category and Subcategory. Select Cash, Card (Chaabi Bank), or Bank Transfer. Enter merchant name and optional notes, then tap "Confirm & Save".',
          action: () => setIsQuickAddOpen(true),
          actionLabel: 'Open Quick Add Modal',
        },
        {
          title: 'How to Edit a Transaction',
          text: 'Go to the "Transactions" tab. Find the transaction you wish to edit and click the pencil (Edit) icon. Change the amount, category, date, or notes, and save.',
          action: () => setActiveTab('transactions'),
          actionLabel: 'Go to Transactions',
        },
        {
          title: 'How to Delete a Record',
          text: 'In the "Transactions" tab, click the red Trash icon on any entry and confirm. The record is instantly removed and an audit log is stored in the Logs tab.',
        },
      ],
    },
    {
      id: 'scanner',
      title: 'Gemini 3.6 Flash 4-Key Scanner Engine',
      icon: Scan,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      badge: 'AI Powered',
      steps: [
        {
          title: '1. Model: gemini-3.6-flash Exclusive',
          text: 'The scanner is strictly locked to Google Gemini 3.6 Flash multimodal API for ultra-high accuracy and speed on Moroccan bills.',
        },
        {
          title: '2. Dynamic 4-Key Rotation & 0ms Failover',
          text: 'In Settings, you can add up to 4 Gemini API keys. When you scan a receipt, the app sends it to Key #1. If Key #1 hits a quota limit (HTTP 429) or busy server (HTTP 503), it immediately and silently switches to Key #2, then #3, then #4 with 0ms delay until successful!',
          action: () => setIsSettingsOpen(true),
          actionLabel: 'Configure Gemini API Keys',
        },
        {
          title: '3. Canvas 80KB Compression',
          text: 'Before uploading, your receipt image is automatically scaled and compressed on an invisible HTML Canvas down to ~80KB. This turns a 5MB phone photo into a featherweight sub-second upload!',
        },
        {
          title: '4. Moroccan Receipts Recognition',
          text: 'Trained to recognize Moroccan supermarkets (BIM, Marjane, Carrefour, Supeco, Acima, Label\'Vie) and invoices (Lydec, RADEEJ, ONEE, Inwi, Maroc Telecom, Orange). It extracts the merchant, date, total in DH, and an itemized breakdown with sub-prices!',
          action: () => setIsScannerOpen(true),
          actionLabel: 'Try Receipt Scanner',
        },
      ],
    },
    {
      id: 'pinterest-colors',
      title: 'Pinterest Girly Colors & Custom Studio',
      icon: Palette,
      color: 'text-pink-600',
      bgColor: 'bg-pink-600/10',
      badge: 'Aesthetic Studio',
      steps: [
        {
          title: '1. Switching Girly Presets',
          text: 'Open Settings (sliders icon in the header) → choose from Pinterest presets like "Coquette Baby Pink", "Strawberry Milk Shake", "Pastel Lavender Dream", "Peach Bellini", or "Cherry Blossom Glam".',
          action: () => setIsSettingsOpen(true),
          actionLabel: 'Open Color Studio',
        },
        {
          title: '2. Custom Hex Color Pickers',
          text: 'Want your own exact colors? In Settings under "Custom Color Studio", you can pick any Primary, Secondary, and Accent color using interactive color pickers or hex codes. The entire UI updates in real-time!',
        },
        {
          title: '3. Dark Mode & Light Mode',
          text: 'Tap the Moon/Sun icon in the navigation bar to toggle between dark aesthetic mode and radiant light mode.',
        },
      ],
    },
    {
      id: 'custom-categories',
      title: 'Custom Categories & Subcategories Manager',
      icon: FolderPlus,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      badge: 'Full Freedom',
      steps: [
        {
          title: '1. Adding Your Own Category',
          text: 'Tap "+ Custom Categories" in the header or in Settings. Enter your category name (e.g., "Nail Art Studio", "Thrifting & Vintage", "Cat & Pet Care"), pick a color, and specify if it is an Expense or Income.',
          action: () => setIsCategoryManagerOpen(true),
          actionLabel: 'Open Category Manager',
        },
        {
          title: '2. Adding Subcategories',
          text: 'Under any category, click "+ Add Subcategory" to add specific tags like "Gel Polish", "Nail Extensions", or "Acrylic Tips".',
        },
        {
          title: '3. Automatic Integration',
          text: 'All custom categories instantly appear in the Quick Add dropdown, Gemini OCR auto-tagging, and the Analytics visual charts!',
        },
      ],
    },
    {
      id: 'analytics',
      title: 'Analytics, Charts & Budget Tracking',
      icon: PieChart,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      badge: 'Insights',
      steps: [
        {
          title: '1. Interactive Donut Chart',
          text: 'Hover over or tap any slice in the category donut chart to see how many Moroccan Dirhams you have spent and its exact percentage of your monthly outflow.',
          action: () => setActiveTab('analytics'),
          actionLabel: 'View Analytics',
        },
        {
          title: '2. Monthly Income vs Expenses Bar Chart',
          text: 'Compares your side-by-side earnings against expenses across the last 6 months to help you maintain a positive savings rate.',
        },
        {
          title: '3. Payment Distribution',
          text: 'Check the Dashboard to see your balance split between Cash, Banque Populaire Card, and Wire Transfers.',
        },
      ],
    },
    {
      id: 'backup-sync',
      title: 'Data Backup, Privacy & Cloud Firestore',
      icon: Database,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
      badge: 'Security',
      steps: [
        {
          title: '1. 100% Private Offline Mode',
          text: 'Your transactions are stored securely in your browser\'s local storage. Nobody else has access to your private financial numbers.',
        },
        {
          title: '2. Export JSON & CSV Backups',
          text: 'You can download a complete JSON backup or export your transactions to an Excel-friendly CSV spreadsheet anytime with one click in the Transactions tab.',
        },
        {
          title: '3. Cloud Firestore Multi-Device Sync',
          text: 'If you want to sync your expenses seamlessly between your phone, laptop, and iPad, paste your Firebase config in Settings to enable real-time cloud sync.',
        },
      ],
    },
  ];

  const faqs = [
    {
      q: 'How do I add my Gemini API key to use the receipt scanner?',
      a: 'Go to Settings (sliders icon in the top header). Under "Gemini 3.6 Flash Multi-Key Rotation", paste your free API key into Slot #1. You can get a free key anytime from Google AI Studio (aistudio.google.com). You can also add up to 3 backup keys into Slots 2, 3, and 4!',
    },
    {
      q: 'Why does the app only mention Banque Populaire (Chaabi Bank)?',
      a: 'Per your customized setup, the app is dedicated specifically to Banque Populaire (Chaabi Bank BCP), eliminating other banks so your records match your actual Moroccan bank card and ATM withdrawals.',
    },
    {
      q: 'Can I change the pastel pink colors if I want another vibe?',
      a: 'Yes! Open Settings and select any of the Pinterest presets (like Strawberry Milk, Pastel Lavender, Peach Blossom, or Cherry Glam), or use the custom color pickers to choose any hex color you love.',
    },
    {
      q: 'Why are all transactions empty at the beginning?',
      a: 'The app is designed with a clean slate so you can enter your real numbers without dummy mock data cluttering your wallet. If you want to test the charts, you can click "Load Sample Data" in Settings anytime.',
    },
    {
      q: 'What if I scan a blurry or torn receipt?',
      a: 'Gemini 3.6 Flash is multimodal and can read crumpled paper or faint thermal ink. Once scanned, the app lets you review and edit the merchant name, date, total DH, and items before saving.',
    },
  ];

  const filteredSections = sections.filter((sec) => {
    if (activeSection !== 'all' && sec.id !== activeSection) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = sec.title.toLowerCase().includes(q);
      const matchSteps = sec.steps.some(
        (s) => s.title.toLowerCase().includes(q) || s.text.toLowerCase().includes(q)
      );
      return matchTitle || matchSteps;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-6 sm:p-10 border border-pink-300/30 bg-gradient-to-r from-pink-100/50 via-rose-100/40 to-purple-100/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-300 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Complete In-App User Manual & Guidebook</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            How to Master My expenses-L (She Budget Edition)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
            Everything you need to know about managing your Moroccan Dirhams (DH), tracking Banque Populaire (Chaabi Bank) expenses, scanning receipts with Gemini 3.6 Flash, and customizing your Pinterest aesthetic.
          </p>
        </div>

        {/* Search within Guidebook */}
        <div className="mt-6 relative max-w-xl">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search guidebook (e.g., 'Chaabi bank', 'scan receipt', 'custom colors', 'add category')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl text-xs sm:text-sm bg-white/90 dark:bg-slate-800/90 border border-pink-200 dark:border-slate-700 focus:border-pink-500 shadow-sm text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
        <button
          onClick={() => setActiveSection('all')}
          className={`px-3.5 py-2 rounded-2xl whitespace-nowrap transition-all ${
            activeSection === 'all'
              ? 'bg-pink-500 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          All Topics ({sections.length})
        </button>
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`px-3.5 py-2 rounded-2xl whitespace-nowrap transition-all ${
              activeSection === sec.id
                ? 'bg-pink-500 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {sec.title}
          </button>
        ))}
      </div>

      {/* Sections List */}
      <div className="space-y-6">
        {filteredSections.map((sec) => {
          const IconComponent = sec.icon;
          return (
            <div
              key={sec.id}
              className="glass-card rounded-3xl p-6 sm:p-8 border border-pink-200/50 dark:border-slate-800 space-y-6"
            >
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/50 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className={`w-11 h-11 rounded-2xl ${sec.bgColor} ${sec.color} flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {sec.title}
                      </h2>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-300">
                        {sec.badge}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step by Step list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sec.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{step.title}</span>
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                        {step.text}
                      </p>
                    </div>

                    {step.action && (
                      <button
                        onClick={step.action}
                        className="mt-3 inline-flex items-center space-x-1.5 text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline self-start"
                      >
                        <span>{step.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Frequently Asked Questions (FAQ) Accordion */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-pink-200/50 dark:border-slate-800 space-y-4">
        <div className="flex items-center space-x-2.5 mb-2">
          <HelpCircle className="w-5 h-5 text-pink-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions (FAQ)
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : index)}
                  className="w-full p-4 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {isExpanded && (
                  <div className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/40 dark:border-slate-700/40 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
