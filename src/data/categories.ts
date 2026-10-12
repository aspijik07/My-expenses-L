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
      'Hygiene',
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
    color: '#9D84B7', // Pastel Lilac
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
    id: 'transport-mobility',
    name: 'Transport & Mobility',
    iconName: 'Car',
    color: '#84DCC6', // Mint Pastel
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
    color: '#B5838D', // Dusty Rose
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
    color: '#E5989B', // Rose Blossom
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
    color: '#6B9080', // Sage Green Pastel
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
      'Salary / Job Income',
      'Freelance / Side Hustle',
      'Family Allowance',
      'Gift Received',
      'Investment Returns',
      'Other Income',
    ],
  },
];

// Single dedicated bank as strictly requested
export const MOROCCAN_BANKS = [
  'Banque Populaire (Chaabi Bank)',
] as const;
