import { CategoryDefinition } from '../types';

export const INITIAL_EXPENSE_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'beauty-personal-care',
    name: 'Beauty & Personal Care',
    iconName: 'Sparkles',
    color: '#FF85A1', // Girly Baby Pink
    type: 'expense',
    subcategories: [
      'Skincare',
      'Makeup & Cosmetics',
      'Haircare & Salon',
      'Perfumes & Fragrances',
      'Spa & Nails',
      'Hygiene & Body Care',
    ],
  },
  {
    id: 'fashion-shopping',
    name: 'Fashion & Shopping',
    iconName: 'ShoppingBag',
    color: '#FFA8BA', // Soft Blush Pink
    type: 'expense',
    subcategories: [
      'Clothing & Apparel',
      'Shoes & Footwear',
      'Bags & Accessories',
      'Jewelry & Watches',
    ],
  },
  {
    id: 'food-dining',
    name: 'Food & Dining',
    iconName: 'UtensilsCrossed',
    color: '#FFB4A2', // Peach Cream
    type: 'expense',
    subcategories: [
      'Groceries (BIM / Marjane / Local Market)',
      'Campus & Agdal Cafes',
      'Restaurants & Dinners',
      'Fast Food & Snacks',
      'Bakery & Pastries',
    ],
  },
  {
    id: 'transport-mobility',
    name: 'Transport & Mobility',
    iconName: 'Train',
    color: '#84DCC6', // Mint Pastel
    type: 'expense',
    subcategories: [
      'ONCF Train (Al Boraq / TNR Rabat)',
      'Tramway (Rabat-Salé Lines 1 & 2)',
      'Taxi & InDrive / Heetch',
      'Public Bus (Alsa Rabat)',
    ],
  },
  {
    id: 'education-growth',
    name: 'Education & Growth',
    iconName: 'GraduationCap',
    color: '#6B9080', // Sage Green Pastel
    type: 'expense',
    subcategories: [
      'University & Institute Fees',
      'Textbooks & Photocopying',
      'Online Courses & Certifications',
      'Notebooks & Study Stationery',
      'Student Workshop Fees',
    ],
  },
  {
    id: 'utilities-home',
    name: 'Utilities & Living',
    iconName: 'Home',
    color: '#9D84B7', // Pastel Lilac
    type: 'expense',
    subcategories: [
      'Student Studio Rent',
      'Water & Electricity (Redal / ONEE)',
      'Internet & Wi-Fi (Inwi / Maroc Telecom / Orange)',
      'Room Decor',
      'Cleaning Supplies',
    ],
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    iconName: 'HeartPulse',
    color: '#F28482', // Soft Coral Pink
    type: 'expense',
    subcategories: [
      'Pharmacy & Medicines',
      'Doctor Consultations',
      'Skincare Treatments',
      'Fitness & Gym Membership',
    ],
  },
  {
    id: 'subscriptions-entertainment',
    name: 'Subscriptions & Entertainment',
    iconName: 'Tv',
    color: '#B5838D', // Dusty Rose
    type: 'expense',
    subcategories: [
      'Streaming Services (Netflix, Spotify, YouTube)',
      'Cinema & Outings',
      'Books & Hobbies',
    ],
  },
  {
    id: 'gifts-social',
    name: 'Gifts & Social',
    iconName: 'Gift',
    color: '#E5989B', // Rose Blossom
    type: 'expense',
    subcategories: [
      'Family Gifts',
      'Friend Birthdays',
      'Celebrations & Gatherings',
      'Charity & Donations',
    ],
  },
  {
    id: 'miscellaneous',
    name: 'Miscellaneous',
    iconName: 'MoreHorizontal',
    color: '#BDB2FF', // Pastel Periwinkle
    type: 'expense',
    subcategories: [
      'General Expense',
      'Uncategorized',
    ],
  },
];

export const INITIAL_INCOME_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'income-sources',
    name: 'Income Sources',
    iconName: 'TrendingUp',
    color: '#06D6A0', // Fresh Mint Green
    type: 'income',
    subcategories: [
      'Monthly Allowance',
      'Internship Stipend / Salary',
      'Freelance / Side Projects',
      'Family Support',
      'Gifts Received',
      'Other Income',
    ],
  },
];

export const MOROCCAN_BANKS = [
  'Banque Populaire (Chaabi Bank)',
] as const;
