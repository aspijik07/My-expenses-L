# My expenses-L — She Budget Edition (Morocco 🇲🇦)

A modern, high-converting, feminine Personal Expense & Budget Management web application tailored specifically for Moroccan young professionals and students managing finances in **Moroccan Dirhams (DH)**.

Built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Firebase Firestore / Local Storage Hybrid Sync**.

---

## 🌟 Key Features

### 1. 🌸 Modern Feminine Aesthetics
- **Curated Palette**: Rose Gold (`#E0A96D`), Soft Blush Pink (`#F8E8EE`), Lavender Purple (`#6C5CE7`), Pearl White (`#FFFFFF`), and Deep Slate/Navy (`#1E293B`) for Dark Mode.
- **Glassmorphism**: Glass cards with subtle glows (`shadow-glow-rosegold`, `shadow-glow-lavender`).
- **Icons**: Clean inline SVG icons via Lucide (zero unicode emojis).
- **Responsive & Dark Mode**: Seamless toggle between Dark and Light themes.

### 2. 🧾 Gemini 3.6 Flash Multimodal Receipt Scanner
- **Model**: Exclusively powered by `gemini-3.6-flash`.
- **4-Key Rotation & 0ms Dynamic Failover**:
  - Provides 4 API key slots in Settings.
  - Automatically and silently fails over to the next key (Key 1 → Key 2 → Key 3 → Key 4) with **0ms delay** if a quota limit (`HTTP 429`), server busy (`HTTP 503`), or authentication error is received.
- **Canvas Compression**: Automatically compresses captured receipts and photos to **~80KB** on HTML Canvas before uploading, ensuring sub-second OCR responses.
- **Moroccan Receipts Parser**: Specialized recognition for:
  - Supermarkets: **BIM**, **Marjane**, **Carrefour**, **Supeco**, **Acima**, **Label'Vie**, and local épiceries (Hanout).
  - Moroccan Utilities: **Lydec**, **RADEEJ**, **SRM**, **ONEE**, **Redal**, **Amendis**.
  - Telecoms: **Inwi**, **Maroc Telecom (IAM)**, **Orange Maroc**.
- **Itemized Breakdown**: Extracts store/merchant name, transaction date, payment method, total in DH, itemized products with sub-prices, and automatic category categorization.

### 3. 💳 Moroccan Currency & Banking Support
- **Default Currency**: Moroccan Dirham (`DH`).
- **Payment Methods Breakdown**:
  - **Cash (Espèces)**: Groceries at Hanout, small taxis, cash expenses.
  - **Card**: Integrated Moroccan banking options (**CIH Bank**, **Attijariwafa Bank**, **BMCE Bank of Africa**, **Banque Populaire BCP**, **SGMB**).
  - **Bank Transfer (Virement)**: Rent, tuition, high-value transfers.
- **Summary Cards**: Real-time distribution and percentage of spend per payment method.

### 4. 🗂️ Rich Category Architecture (with Deep Subcategories)
- **Beauty & Personal Care**: Skincare, Makeup & Cosmetics, Haircare & Salon, Perfumes & Fragrances, Spa & Nails, Hygiene.
- **Fashion & Shopping**: Clothing & Apparel, Shoes & Footwear, Bags & Accessories, Jewelry & Watches.
- **Food & Dining**: Groceries (BIM / Marjane / Hanout), Cafes & Coffee Shops, Restaurants & Dinners, Fast Food, Bakery & Sweets.
- **Utilities & Home**: Rent, Water & Electricity (Lydec / RADEEJ / ONEE), Internet & Wi-Fi (Inwi / Maroc Telecom / Orange), Home Decor, Cleaning Supplies.
- **Health & Wellness**: Pharmacy & Medicines, Doctor Consultations, Skincare Treatments, Fitness & Gym Membership.
- **Transport & Mobility**: Taxi & InDrive / Heetch, Gasoline & Fuel, Public Bus / Tramway, Car Maintenance & Parking.
- **Subscriptions & Entertainment**: Streaming (Netflix, Spotify, YouTube Premium), Cinema & Outings, Books & Hobbies.
- **Gifts & Social**: Family Gifts, Friend Birthdays, Celebrations, Charity & Sadaqah.
- **Education & Growth**: Online Courses, Books & Stationery, Workshop Fees.
- **Income Sources**: Salary / Job Income, Freelance / Side Hustle, Family Allowance, Gift Received, Investment Returns, Other Income.

### 5. 📊 Analytics, Charts & Audit Logs
- **Category Donut Chart**: Interactive SVG donut chart showing breakdown by expense group.
- **Monthly Cashflow Trends**: Side-by-side comparison bar chart of Monthly Income vs Expenses.
- **Activity Logs**: Full audit trail recording scans, additions, edits, and deletions with timestamps.
- **CSV Data Export & JSON Backups**: Full data portability.

### 6. ☁️ Cloud Firestore & LocalStorage Resilient Mode
- Works 100% offline or in guest mode out of the box using LocalStorage.
- Connect your Firebase configuration in Settings for multi-device live sync.

---

## 🚀 Cloudflare Pages Deployment Guide

### Option A: Automatic Git Deployment (Recommended)
1. Push this repository to GitHub (connected to `aspijik07/My-expenses-L`).
2. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Select `My-expenses-L`.
4. Configure Build Settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **Save and Deploy**. Cloudflare Pages will build and deploy your app with a free `*.pages.dev` subdomain and free SSL!

### Option B: Cloudflare Wrangler CLI Direct Deployment
```bash
# 1. Build the production files
npm run build

# 2. Deploy directly with Wrangler
npx wrangler pages deploy dist --project-name=my-expenses-l
```

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build for production
npm run build
```
