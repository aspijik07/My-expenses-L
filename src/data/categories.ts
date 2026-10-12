import { CategoryDefinition } from '../types';

export const EXPENSE_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'beauty-personal-care',
    name: 'Beauty & Personal Care',
    iconName: 'Sparkles',
    color: '#E0A96D', // Rose Gold
    type: 'expense',
    subcategories: [
      'Skincare',
      'Makeup & Cosmetics',
      'Haircare & Salon',
      'Perfumes & Fragrances',
      'Spa & Nails',
      'Hygiene',
    ],
  },
  {
    id: 'fashion-shopping',
    name: 'Fashion & Shopping',
    iconName: 'ShoppingBag',
    color: '#D78DA6', // Soft Blush
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
    color: '#F59E0B', // Amber
    type: 'expense',
    subcategories: [
      'Groceries (BIM / Marjane / Hanout)',
      'Cafes & Coffee Shops',
      'Restaurants & Dinners',
      'Fast Food',
      'Bakery & Sweets',
    ],
  },
  {
    id: 'utilities-home',
    name: 'Utilities & Home',
    iconName: 'Home',
    color: '#3B82F6', // Blue
    type: 'expense',
    subcategories: [
      'Rent',
      'Water & Electricity (Lydec / RADEEJ / ONEE)',
      'Internet & Wi-Fi (Inwi / Maroc Telecom / Orange)',
      'Home Decor',
      'Cleaning Supplies',
    ],
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    iconName: 'HeartPulse',
    color: '#EC4899', // Pink
    type: 'expense',
    subcategories: [
      'Pharmacy & Medicines',
      'Doctor Consultations',
      'Skincare Treatments',
      'Fitness & Gym Membership',
    ],
  },
  {
    id: 'transport-mobility',
    name: 'Transport & Mobility',
    iconName: 'Car',
    color: '#06B6D4', // Cyan
    type: 'expense',
    subcategories: [
      'Taxi & InDrive / Heetch',
      'Gasoline & Fuel',
      'Public Bus / Tramway',
      'Car Maintenance & Parking',
    ],
  },
  {
    id: 'subscriptions-entertainment',
    name: 'Subscriptions & Entertainment',
    iconName: 'Tv',
    color: '#6C5CE7', // Lavender Purple
    type: 'expense',
    subcategories: [
      'Streaming Services (Netflix, Spotify, YouTube Premium)',
      'Cinema & Outings',
      'Books & Hobbies',
    ],
  },
  {
    id: 'gifts-social',
    name: 'Gifts & Social',
    iconName: 'Gift',
    color: '#A855F7', // Purple
    type: 'expense',
    subcategories: [
      'Family Gifts',
      'Friend Birthdays',
      'Celebrations',
      'Charity & Sadaqah',
    ],
  },
  {
    id: 'education-growth',
    name: 'Education & Growth',
    iconName: 'GraduationCap',
    color: '#10B981', // Emerald
    type: 'expense',
    subcategories: [
      'Online Courses',
      'Books & Stationery',
      'Workshop Fees',
    ],
  },
  {
    id: 'miscellaneous',
    name: 'Miscellaneous',
    iconName: 'MoreHorizontal',
    color: '#94A3B8', // Slate
    type: 'expense',
    subcategories: [
      'General Expense',
      'Uncategorized',
    ],
  },
];

export const INCOME_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'income-sources',
    name: 'Income Sources',
    iconName: 'TrendingUp',
    color: '#10B981', // Emerald
    type: 'income',
    subcategories: [
      'Salary / Job Income',
      'Freelance / Side Hustle',
      'Family Allowance',
      'Gift Received',
      'Investment Returns',
      'Other Income',
    ],
  },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const MOROCCAN_BANKS = [
  'CIH Bank',
  'Attijariwafa Bank',
  'BMCE Bank of Africa',
  'Banque Populaire BCP',
  'SGMB',
  'Other',
] as const;
