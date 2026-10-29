# 🛍️ G-Store Enterprise E-Commerce & Mobile API Platform

A modern, full-stack, enterprise-grade e-commerce application and developer-ready REST API built with **Next.js 16 (App Router + Turbopack)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**.

Designed simultaneously for:
1. **Desktop & Mobile Web Storefront**: High-converting consumer shopping experience.
2. **Administrator Console**: Unified back-office operations for products, inventory, orders, reviews, settings, and shipping.
3. **Mobile App Development**: Clean REST API with Swagger OpenAPI 3.0.3 specification ready for **Flutter, React Native, iOS (Swift), and Android (Kotlin)**.

---

## 📑 Table of Contents
- [⚡ Quick Start & Important Commands](#-quick-start--important-commands)
- [📁 Project Architecture & Directory Structure](#-project-architecture--directory-structure)
- [✨ Core Features Overview (Kya Kya Feature Hai)](#-core-features-overview-kya-kya-feature-hai)
  - [1. Storefront & Customer Features](#1-storefront--customer-features)
  - [2. Flipkart-Style Delivery Location Drawer](#2-flipkart-style-delivery-location-drawer)
  - [3. Dynamic Social Login & OAuth (Setting Table)](#3-dynamic-social-login--oauth-setting-table)
  - [4. Customer Reviews with Media & Moderated Comments](#4-customer-reviews-with-media--moderated-comments)
  - [5. Admin Back-Office Management Console](#5-admin-back-office-management-console)
  - [6. Multi-Gateway Checkout & Payments](#6-multi-gateway-checkout--payments)
  - [7. Inventory & Multi-Warehouse Fulfillment](#7-inventory--multi-warehouse-fulfillment)
- [🔐 Role-Based Access Control (RBAC) & Default Credentials](#-role-based-access-control-rbac--default-credentials)
- [📱 Mobile App Developer Guide & Swagger UI](#-mobile-app-developer-guide--swagger-ui)
- [🌐 Complete REST API Endpoint Directory](#-complete-rest-api-endpoint-directory)
- [🛠️ Tech Stack & Dependencies](#️-tech-stack--dependencies)

---

## ⚡ Quick Start & Important Commands

### 1. System Requirements
* **Node.js**: `v20.x` or `v24.x` (LTS recommended)
* **npm**: `v9+` or `v10+`
* **OS**: Windows, macOS, or Linux

### 2. Installation
Clone repository and install dependencies:
```bash
npm install
```

### 3. Master Database Seeding
To initialize or restore the entire database (8 categories, 40 products, 273 variants, studio packshots, admin accounts, gateways, warehouses, sliders, and menus):
```bash
npm run seed
# Or manually run:
node scripts/seed-master.mjs
```

### 4. Running the Development Server
Starts the Next.js dev server with Turbopack fast refresh:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser:
* **Customer Storefront**: [http://localhost:3000](http://localhost:3000)
* **Administrator Portal**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
* **Interactive Swagger UI Docs**: [http://localhost:3000/docs](http://localhost:3000/docs)
* **Raw OpenAPI Specification**: [http://localhost:3000/api/openapi.json](http://localhost:3000/api/openapi.json)

### 5. Production Build & Deployment
```bash
# Type check and build optimized bundle
npm run build

# Start production server
npm run start
```

### 6. Useful Maintenance Commands
| Command | Action |
|---|---|
| `npx tsc --noEmit` | Run TypeScript compiler type-check across all modules |
| `npm run lint` | Run ESLint syntax verification |
| `npx prisma db push` | Push `prisma/schema.prisma` changes to PostgreSQL database |
| `npx prisma studio` | Open visual Prisma Studio database GUI |
| `node scripts/seed-master.mjs` | Restore factory demo data without overwriting credentials |

---

## 📁 Project Architecture & Directory Structure

The project follows a clean **modular domain-driven architecture**, strictly decoupling presentation, business services, and database persistence:

```text
ecommerce/
├── data/
│   └── local-db.json            # Persistent JSON document store fallback
├── prisma/
│   └── schema.prisma            # Prisma schema (PostgreSQL ready, Setting with unique context)
├── public/
│   ├── uploads/                 # Local image and media assets (products, categories, reviews)
│   └── icons/                   # Brand icons and vector assets
├── scripts/
│   └── seed-master.mjs          # Master seeder with flagship products, variants, and categories
├── src/
│   ├── app/                     # Next.js App Router (pages and API endpoints)
│   │   ├── (auth)/              # Customer auth pages (/login, /register, /forgot-password)
│   │   ├── (storefront)/        # Public store pages (/, /category/[slug], /products/[slug])
│   │   ├── admin/               # Administrator portal pages (/admin/*)
│   │   │   ├── assets/          # Digital media asset library
│   │   │   ├── customers/       # Customer directory and access management
│   │   │   ├── inventory/       # Stock tracking and stock movement audits
│   │   │   ├── orders/          # Order fulfillment and processing
│   │   │   ├── payments/        # Gateway transaction logs and refunds
│   │   │   ├── products/        # Catalog management and variant builder
│   │   │   ├── reviews/         # Review moderation & comment replies
│   │   │   ├── settings/        # System configuration and OAuth
│   │   │   └── shipping/        # Shipping zones, providers, and labels
│   │   ├── api/                 # REST API routes consumed by Web & Mobile Apps
│   │   │   ├── addresses/       # Customer delivery address management
│   │   │   ├── admin/           # Administrative operations
│   │   │   ├── assets/          # Media upload and S3 synchronization
│   │   │   ├── auth/            # Auth, Login, Register, Google OAuth, Passwords
│   │   │   ├── cart/            # Shopping cart and cart merging
│   │   │   ├── categories/      # Category taxonomy endpoints
│   │   │   ├── customer/        # Customer profile and personal order history
│   │   │   ├── gateways/        # Active payment gateway configurations
│   │   │   ├── openapi.json/    # OpenAPI 3.0.3 specification generator
│   │   │   ├── orders/          # Order placement and tracking
│   │   │   ├── payments/        # Razorpay, Paytm, and Stripe webhook flows
│   │   │   ├── products/        # Product queries, filters, and variants
│   │   │   ├── qna/             # Community Product Q&A
│   │   │   ├── reviews/         # Reviews with media uploads and replies
│   │   │   └── settings/        # System settings and OAuth settings
│   │   └── docs/                # Interactive Swagger UI page
│   ├── core/                    # Core infrastructure and utilities
│   │   ├── db/
│   │   │   └── store.ts         # Unified DatabaseStore engine (PostgreSQL + JSON fallback)
│   │   ├── payment/             # Payment provider integration services
│   │   └── utils/
│   │       ├── api-response.ts  # Standardized API response wrappers
│   │       ├── file-storage.ts  # Dual Local/S3 media storage engine
│   │       └── postal-autofill.ts # Indian PIN code and city knowledge base
│   └── modules/                 # Modular domain components
│       ├── auth/                # Login, Register, RBAC guards
│       ├── cart/                # Cart context, drawer, and state
│       ├── catalog/             # Category filters and catalog views
│       ├── products/            # Product cards, detail modals, reviews, lightbox
│       ├── settings/            # AllSettingsView, OAuth, storage, mail
│       └── storefront/          # StoreHeader, DeliveryLocationDrawer, Sliders, Footer
└── README.md                    # Project documentation
```

---

## ✨ Core Features Overview (Kya Kya Feature Hai)

### 1. Storefront & Customer Features
* **Dynamic Header & Navigation**:
  * Store logo with configurable brand name from Settings.
  * **Top 8 Category Navigation Bar**: Direct one-click routing to `/category/electronics`, `/category/fashion`, `/category/womens`, `/category/kids-fashion`, `/category/health-beauty`, `/category/pharmacy`, `/category/groceries`, and `/category/luxury-item`.
  * Multi-currency switcher (Default: **INR ₹** with Indian Tricolor Flag).
  * Real-time search with auto-suggest and instant deals navigation.
* **Hero Sliders & Deals**:
  * Multi-panel hero slider with responsive touch gestures and timer controls.
  * Live Deals and discounts section with countdown badges.
* **Product Detail Page & Interactive Modal**:
  * High-resolution studio zoom and image switcher.
  * Dynamic variant selection: real-time SKU, price, compare price, and stock adjustments based on selected attributes (Storage, Color, Size, etc.).
  * Tabbed product info: Description, Technical Specs, Customer Reviews, and Community Q&A.

### 2. Flipkart-Style Delivery Location Drawer
* **Visual Match**: Inspired directly by Flipkart's delivery address selector drawer.
* **Slide-over Drawer**: Slides in from right on desktop, smooth bottom sheet on mobile.
* **Live PIN Code Autocomplete**: Typing PIN codes or city names (e.g. `400001`, `110001`, `Bengaluru`) shows matching Indian hubs.
* **🎯 Use My Current Location**: Utilizes browser Geolocation API and reverse geocoding to detect location and fill Indian PIN codes automatically.
* **Saved Addresses Section**:
  * Shows **"Login to see saved addresses"** for guest shoppers.
  * Shows radio-selectable saved addresses for logged-in customers.
  * In-drawer **"+ Add New Address"** form.
* **Popular Delivery Hubs**: Quick-select buttons for New Delhi, Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad, Pune, Ahmedabad, Jaipur, and Lucknow.
* **State Persistence**: Selected delivery location persists in `localStorage` and header displays `Deliver to Mumbai - 400001`.

### 3. Dynamic Social Login & OAuth (Setting Table)
* **`Setting` Table Architecture**:
  * Added `context String? @unique` to `model Setting` in `prisma/schema.prisma`.
  * Preserves existing site settings while allowing structured, unique context queries.
* **Dynamic OAuth Status**:
  * Social login configuration is read from `context = "auth_oauth"` in the `setting` table.
  * If Google login is enabled in Settings, the **"Continue with Google"** button appears on `/login` and `/register`.
  * If disabled by administrator, the button is dynamically hidden.
* **Admin OAuth Console**:
  * Accessible at `/admin/settings` under **"OAuth & Social Login"** tab.
  * Configure Google Client ID, Client Secret, Callback URI, GitHub, and Facebook.
* **Google 1-Click Sign-In**:
  * Backend route `POST /api/auth/oauth/google` creates or signs in customer accounts, returning JWT token and session cookies.

### 4. Customer Reviews with Media & Moderated Comments
* **Photo & Video Reviews**: Customers can upload product unboxing photos and videos (`POST /api/reviews/upload`).
* **Interactive Media Lightbox**: Embedded gallery allowing buyers to inspect customer images full-screen.
* **Public & Admin Comment Threading**:
  * Customers and administrators can comment/reply to any published review (`/api/reviews/[id]/comments`).
  * Administrator replies carry a distinctive **Verified Admin** badge.
* **Admin Review Management**:
  * Moderate reviews (Active / Pending / Inactive).
  * Direct "Reply to Review" modal in `/admin/reviews` with instant moderation and comment counter.

### 5. Admin Back-Office Management Console
* **Role-Based Access Control**: Strict segregation preventing customer accounts from accessing `/admin/*`.
* **Administrator Identity**: Top bar and sidebar show logged-in Admin's name, email, and Admin badge.
* **Catalog & Variant Matrix Builder**:
  * Create products with unlimited attribute combinations (Size, Color, Storage, etc.).
  * Individual SKU, barcode, price, cost price, and stock levels per variant.
* **Customer Directory**:
  * Manage customer accounts, address book, role permissions, and store credits.
* **Asset Storage Engine**:
  * Upload and manage assets locally (`public/uploads`) or sync to **AWS S3 / Cloudflare R2**.
  * S3 icons and sync options dynamically show only when S3 storage is enabled.
* **Shipping & Warehousing**:
  * Configure shipping providers (Delhivery, Shiprocket, BlueDart, FedEx).
  * Multi-warehouse inventory allocation (assign products to specific fulfillment hubs).
  * Real-time stock movement audits.

### 6. Multi-Gateway Checkout & Payments
* Supported Gateways:
  * **Razorpay** (UPI, Credit/Debit Cards, NetBanking, Wallets)
  * **Cash on Delivery (COD)**
  * **Paytm**
  * **Stripe**
* Server-side price calculation, coupon discounts, and tamper-proof HMAC signature verification.

---

## 🔐 Role-Based Access Control (RBAC) & Default Credentials

Password for all pre-seeded demo accounts: `password123`

| Role | Name | Email | Login URL | Permissions |
|---|---|---|---|---|
| **Super Admin** | Admin Administrator | `admin@tagateway.com` | `/admin/login` | Full system administrator access |
| **Store Admin** | Gyan Admin | `gyan@gmail.com` | `/admin/login` | Full management console access |
| **Dual Account** | Gyan Dual Account | `gyanboth@gmail.com` | `/admin/login` | Can access both Admin & Storefront |
| **Customer Buyer** | Gyan Chandra | `gyanchandranist@gmail.com` | `/login` | Frontend shopper only (Blocked from `/admin`) |

---

## 📱 Mobile App Developer Guide & Swagger UI

If you are developing a native or cross-platform mobile app (Flutter, React Native, iOS, Android), use our interactive Swagger documentation:

* **Interactive Swagger UI**: [http://localhost:3000/docs](http://localhost:3000/docs)
* **OpenAPI 3.0.3 JSON Specification**: [http://localhost:3000/api/openapi.json](http://localhost:3000/api/openapi.json)

### Mobile Authentication Headers:
1. **Developer API Key (Quick Testing)**:
   ```http
   x-api-key: gstore_mob_live_98a72b64f
   ```
2. **Bearer JWT Token (After Login)**:
   ```http
   Authorization: Bearer <jwt_token_from_login_response>
   ```
3. **Guest Session ID (Cart Persistence across App Launches)**:
   ```http
   x-session-id: <uuid_device_identifier>
   ```

---

## 🌐 Complete REST API Endpoint Directory

All endpoints return standardized JSON envelopes: `{ success: boolean, data?: any, error?: string, message?: string }`.

### 1. Authentication & Accounts (`/api/auth/*`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Email & password login (returns AuthUser + JWT token) | None |
| `POST` | `/api/auth/register` | Register new customer account | None |
| `POST` | `/api/auth/oauth/google` | Google 1-click OAuth login and auto-registration | None |
| `GET` | `/api/auth/me` | Get profile for currently authenticated token/session | Bearer / API Key |
| `POST` | `/api/auth/logout` | Clear session cookies | None |
| `POST` | `/api/auth/forgot-password` | Request password reset token via email | None |
| `POST` | `/api/auth/reset-password` | Reset password using verified token | None |

### 2. Customer Profile & Addresses (`/api/addresses/*`, `/api/customer/*`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/customer/profile` | Get customer profile, default addresses, and store credits | Bearer / API Key |
| `PUT` | `/api/customer/profile` | Update customer contact information and address | Bearer / API Key |
| `GET` | `/api/customer/orders` | Customer's personal order history and live shipment tracking | Bearer / API Key |
| `GET` | `/api/addresses` | Fetch saved shipping and billing addresses | Bearer / API Key |
| `POST` | `/api/addresses` | Add new address with Indian PIN code auto-fill | Bearer / API Key |
| `PUT` | `/api/addresses/[id]` | Update existing address | Bearer / API Key |
| `DELETE` | `/api/addresses/[id]` | Remove address from address book | Bearer / API Key |

### 3. Catalog, Categories & Products (`/api/products/*`, `/api/categories/*`)
| Method | Endpoint | Description | Parameters |
|---|---|---|---|
| `GET` | `/api/categories` | Get category hierarchy tree or flat listing | `format=tree\|flat` |
| `GET` | `/api/categories/[id]` | Get category by ID or slug (e.g. `electronics`) | `id` |
| `GET` | `/api/products` | Filter products with full variant matrix and stock | `categoryId`, `search`, `minPrice`, `maxPrice`, `sort`, `page`, `limit` |
| `GET` | `/api/products/[id]` | Detailed product data by ID or slug with all variants | `id` |
| `POST` | `/api/products` | Create product (Admin only) | Admin Auth |
| `PUT` | `/api/products/[id]` | Update product and variants | Admin Auth |
| `DELETE` | `/api/products/[id]` | Archive or delete product | Admin Auth |

### 4. Shopping Cart & Checkout (`/api/cart/*`, `/api/orders/*`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/cart` | Get current cart items, subtotal, and stock validation | Guest / Customer |
| `POST` | `/api/cart` | Add product or variant (`variantId`) to cart | Guest / Customer |
| `DELETE` | `/api/cart` | Clear all items from cart | Guest / Customer |
| `POST` | `/api/cart/merge` | Merge anonymous guest cart into user account on app login | Customer Auth |
| `GET` | `/api/orders` | List orders (filtered by customer ownership or admin) | Bearer / API Key |
| `POST` | `/api/orders` | Place new order with items, shipping, and payment method | Guest / Customer |
| `GET` | `/api/orders/[id]` | Get detailed order invoice, items, and status tracking | Guest / Customer |

### 5. Payments & Gateways (`/api/gateways/*`, `/api/payments/*`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/gateways` | List active payment gateways (Razorpay, COD, Paytm, Stripe) |
| `POST` | `/api/payments/razorpay/order` | Create server-validated Razorpay order ID for mobile SDK |
| `POST` | `/api/payments/razorpay/verify` | Verify Razorpay HMAC signature and mark order as Paid |
| `POST` | `/api/payments/paytm/initiate` | Initiate Paytm transaction token |

### 6. Customer Reviews & Community Q&A (`/api/reviews/*`, `/api/qna/*`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reviews` | List customer reviews with ratings, media, and comments (`?productId=...`) |
| `POST` | `/api/reviews` | Submit new customer review |
| `POST` | `/api/reviews/upload` | Upload review photos or videos |
| `GET` | `/api/reviews/[id]/comments` | Get comment and reply thread for a review |
| `POST` | `/api/reviews/[id]/comments` | Post reply to review (supports verified Admin replies) |
| `DELETE` | `/api/reviews/[id]/comments/[commentId]` | Delete comment (Admin only) |
| `GET` | `/api/qna` | Get product questions and answers (`?productId=...`) |
| `POST` | `/api/qna` | Post a customer question about a product |
| `POST` | `/api/qna/[id]/answers` | Submit verified answer to a product question |

### 7. Coupons, Banners & Settings (`/api/coupons/*`, `/api/settings/*`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/coupons` | List valid promo discount coupons |
| `POST` | `/api/coupons/apply` | Validate coupon code (`WELCOME10`, `EMOX20`, etc.) and calculate discount |
| `GET` | `/api/sliders` | Get homepage banners and hero sliders (`?position=main\|side`) |
| `GET` | `/api/menu` | Get header navigation categories |
| `GET` | `/api/settings` | Get public site configuration (store name, currency, contact) |
| `GET` | `/api/settings/auth/oauth` | Get public OAuth status (Google enabled/disabled) |
| `PUT` | `/api/settings/auth/oauth` | Update OAuth credentials and toggles (Admin only, Setting table `context = auth_oauth`) |

---

## 🛠️ Tech Stack & Dependencies

* **Framework**: Next.js 16.4.2 (App Router, Turbopack, React Server Components)
* **Runtime**: Node.js v20+ / v24+
* **Language**: TypeScript 5.9
* **UI & Styling**: React 19, Tailwind CSS v4, Lucide React Icons
* **Database & ORM**: Prisma ORM 6.4 + PostgreSQL + Local JSON store fallback
* **Authentication**: JWT signing via `jose`, bcryptjs password hashing
* **Payment Gateways**: Razorpay SDK, Paytm, Stripe
* **API Documentation**: OpenAPI 3.0.3, Swagger UI v5
* **Media Storage**: Local file storage (`public/uploads`) + AWS S3 / Cloudflare R2 engine

---

## 🤝 Support & Contribution
* Developer: **Gyanchandra**
* Email: [gyanwork1996@gmail.com](mailto:gyanwork1996@gmail.com)
* Repository: [ecommerce](https://github.com/gyanchandra1996)
