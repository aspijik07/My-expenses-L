import { CategoryDefinition } from '../types';

export const INITIAL_EXPENSE_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'beauty-self-care',
    name: 'Beauty & Self-Care',
    iconName: 'Sparkles',
    color: '#FF85A1', // Girly Baby Pink
    type: 'expense',
    subcategories: [
      'Skincare & Sunscreen',
      'Makeup & Lip Gloss',
      'Haircare & Salon',
      'Perfumes & Bodymist',
      'Nails & Manicure',
      'Hammam & Moroccan Care',
      'Personal Hygiene & Body',
    ],
  },
  {
    id: 'fashion-style',
    name: 'Fashion & Style',
    iconName: 'ShoppingBag',
    color: '#FFA8BA', // Soft Blush Pink
    type: 'expense',
    subcategories: [
      'Clothes & Cute Outfits',
      'Shoes & Sneakers',
      'Bags & Backpacks',
      'Hijabs & Shawls',
      'Jewelry & Rings',
      'Thrift & Fripe Hauls',
      'Pajamas & Loungewear',
    ],
  },
  {
    id: 'food-snacks-cafes',
    name: 'Food, Snacks & Cafes',
    iconName: 'UtensilsCrossed',
    color: '#FFB4A2', // Peach Cream
    type: 'expense',
    subcategories: [
      'Hanout & Daily Snacks',
      'Cafes, Boba & Smoothies',
      'Tacos, Pizza & Fast Food',
      'Crepes, Waffles & Ice Cream',
      'Bakery, Croissants & Sweets',
      'Groceries & BIM Hauls',
      'Dining Out with Friends',
    ],
  },
  {
    id: 'studies-highschool',
    name: 'Studies & Stationery',
    iconName: 'GraduationCap',
    color: '#6B9080', // Sage Green Pastel
    type: 'expense',
    subcategories: [
      'Notebooks & Cute Stationery',
      'Highlighters, Pens & Art Tools',
      'School Books & Summaries',
      'Printing & Photocopies',
      'Tutoring & Prep Classes',
      'School Bag & Supplies',
      'Exam Fees & Certificates',
    ],
  },
  {
    id: 'phone-digital',
    name: 'Phone & Digital',
    iconName: 'Smartphone',
    color: '#BDB2FF', // Pastel Periwinkle
    type: 'expense',
    subcategories: [
      'Phone Recharge (Inwi / IAM / Orange)',
      'Pass Internet & 4G/5G Recharge',
      'Spotify, Netflix & Subscriptions',
      'Phone Cases & Charms',
      'Earphones & Chargers',
    ],
  },
  {
    id: 'transit-mobility',
    name: 'Daily Transit & Mobility',
    iconName: 'Train',
    color: '#84DCC6', // Mint Pastel
    type: 'expense',
    subcategories: [
      'Petit Taxi & Rides',
      'Tramway & Card Recharge',
      'Bus & Daily Commute',
      'Train & Family Visits',
      'Daily Transit Stash',
    ],
  },
  {
    id: 'social-hobbies-gifts',
    name: 'Social, Hobbies & Gifts',
    iconName: 'Gift',
    color: '#E5989B', // Rose Blossom
    type: 'expense',
    subcategories: [
      'Hangouts & Outings with Friends',
      'Friends Birthday Gifts',
      'Cinema & Fun Activities',
      'Novels & Manga Reading',
      'Room Decor & Fairy Lights',
      'DIY, Crafts & Journals',
    ],
  },
  {
    id: 'secret-savings',
    name: 'Secret Savings & Emergency',
    iconName: 'Wallet',
    color: '#9D84B7', // Pastel Lilac
    type: 'expense',
    subcategories: [
      'Secret Savings (Tirroir / Chaye9)',
      'Emergency Cash Stash',
      'Special Goal Savings',
    ],
  },
  {
    id: 'miscellaneous',
    name: 'Other Expenses',
    iconName: 'MoreHorizontal',
    color: '#F28482', // Soft Coral
    type: 'expense',
    subcategories: [
      'Pharmacy & First Aid',
      'General Expense',
      'Uncategorized',
    ],
  },
];

export const INITIAL_INCOME_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'income-sources',
    name: 'Income & Pocket Money',
    iconName: 'TrendingUp',
    color: '#06D6A0', // Fresh Mint Green
    type: 'income',
    subcategories: [
      'Weekly Masrouf',
      'Monthly Masrouf',
      'Parents Allowance',
      'Family & Grandparents Eid Gifts',
      'Savings Withdrawal (Tirroir Cash)',
      'Small Gigs & Tutoring Kids',
      'Reselling Clothes / Thrift',
      'Other Income',
    ],
  },
];

export const MOROCCAN_BANKS = [
  'Banque Populaire (Chaabi Bank)',
] as const;
