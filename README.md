# G-Store Enterprise E-Commerce & Mobile API Platform

A modern, full-stack, enterprise-grade e-commerce application and REST API built with **Next.js 16 (App Router with Turbopack)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**.

Designed for both the **Storefront web experience**, **Administrator Management Console**, and **Mobile App Development (Flutter, React Native, iOS, Android)**.

---

## ⚡ Quick Start (Project Kaise Chalana Hai)

### 1. Requirements
* **Node.js**: v18.18+ or v20+ (Node v22 / v24 supported)
* **npm**: v9+

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Initialize & Seed Database
Restore all 8 categories, 40 flagship products, 273 variants, studio packshots, admin accounts, sliders, and navigation menus:
```bash
npm run seed
```
*(Alternative command: `node scripts/seed-master.mjs`)*

### 4. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

* **Storefront (Customer Web Portal)**: [http://localhost:3000](http://localhost:3000)
* **Admin Management Console**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
* **Interactive Swagger UI Documentation**: [http://localhost:3000/docs](http://localhost:3000/docs)
* **OpenAPI 3.0.3 Specification (JSON)**: [http://localhost:3000/api/openapi.json](http://localhost:3000/api/openapi.json)

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🔐 Authentication & Role-Based Access Control

The platform enforces strict **separation of roles** between frontend customers and backend administrators:

1. **Customer Accounts (`type: 'customer'`)**:
   - Access only the storefront ([`/`](http://localhost:3000)), customer dashboard ([`/customer/dashboard`](http://localhost:3000/customer/dashboard)), order tracking, and cart.
   - **STRICTLY DENIED from accessing the Administrator Console (`/admin/*`)**. Any attempt to access `/admin` automatically redirects to `/admin/login?error=customer_denied`.

2. **Administrator Accounts (`type: 'admin'`)**:
   - Full access to manage catalog, products, variants, assets, payments, gateways, shipments, warehouses, and settings at [`/admin`](http://localhost:3000/admin/assets).
   - The top header and sidebar clearly display the **logged-in Administrator's Name, Email address, and Administrator badge**.

### 👥 Default Seeded Logins (Password for all: `password123`)

| Role | Name | Email | Login URL | Access Level |
|---|---|---|---|---|
| **Administrator** | Admin Administrator | `admin@tagateway.com` | `/admin/login` | Full Backend Administrator |
| **Administrator** | Gyan Admin | `gyan@gmail.com` | `/admin/login` | Full Backend Administrator |
| **Dual (Both)** | Gyan Dual Account | `gyanboth@gmail.com` | `/admin/login` | Admin Console + Storefront |
| **Customer** | Gyan Chandra | `gyanchandranist@gmail.com` | `/login` | Frontend Store Buyer Only |

---

## 📱 Mobile App Development & Swagger OpenAPI Setup

For mobile developers building iOS, Android, Flutter, or React Native apps, an interactive **Swagger UI** with full **API Key Authentication** is pre-configured:

* **Interactive Swagger Documentation**: [http://localhost:3000/docs](http://localhost:3000/docs)
* **OpenAPI Spec URL**: `http://localhost:3000/api/openapi.json`
* **Swagger Redirects**: `/swagger` and `/api/docs` automatically forward to `/docs`.

### Mobile Authentication Options:
1. **Developer API Key (Recommended for Mobile App Development)**:
   - Pass the header in all mobile network requests:
     ```http
     x-api-key: gstore_mobile_dev_key_2026_x89f
     ```
2. **Bearer JWT Token**:
   - Obtained by calling `POST /api/auth/login` or `POST /api/auth/register`:
     ```http
     Authorization: Bearer <jwt_token>
     ```
3. **Guest Cart Session Persistence**:
   - Send a device UUID to maintain shopping carts across app launches before the user logs in:
     ```http
     x-session-id: <unique_device_uuid>
     ```

---

## 🌐 Complete REST API Route Reference

### 1. Authentication (`/api/auth/*`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login with email & password (returns user + JWT) | None |
| `POST` | `/api/auth/register` | Register new customer account | None |
| `GET` | `/api/auth/me` | Get authenticated profile (supports `?portal=admin` or `customer`) | Bearer / API Key / Cookie |
| `POST` | `/api/auth/logout` | Invalidate session cookies | None |
| `POST` | `/api/auth/forgot-password` | Request password reset token | None |
| `POST` | `/api/auth/reset-password` | Set new password with token | None |

### 2. Catalog & Products (`/api/products/*`)
| Method | Endpoint | Description | Parameters |
|---|---|---|---|
| `GET` | `/api/products` | List products with variants, images, stock & prices | `categoryId`, `search`, `minPrice`, `maxPrice`, `sort`, `page`, `limit` |
| `GET` | `/api/products/[id]` | Get detailed product by ID or slug with full variant matrix | `id` (e.g. `prod_s24_ultra`) |
| `POST` | `/api/products` | Create product (Admin only) | Admin Auth |
| `PUT` | `/api/products/[id]` | Update product specifications and assets | Admin Auth |
| `DELETE` | `/api/products/[id]` | Delete or archive product | Admin Auth |

### 3. Categories (`/api/categories/*`)
| Method | Endpoint | Description | Parameters |
|---|---|---|---|
| `GET` | `/api/categories` | Get active category tree or flat list | `format=tree` or `format=flat` |
| `GET` | `/api/categories/[id]` | Get category by ID or slug | `id` (e.g. `electronics`) |
| `POST` | `/api/categories` | Create new category (Admin only) | Admin Auth |
| `PUT` | `/api/categories/[id]` | Update category name, slug, image | Admin Auth |

### 4. Shopping Cart (`/api/cart/*`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cart` | Get current customer / guest cart items and subtotal |
| `POST` | `/api/cart` | Add product or specific variant (`variantId`) to cart |
| `DELETE` | `/api/cart` | Clear all items from cart |
| `POST` | `/api/cart/merge` | Merge guest cart items into customer cart on login |

### 5. Orders & Checkout (`/api/orders/*`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orders` | List orders for current authenticated customer or admin |
| `POST` | `/api/orders` | Place order with items, shipping address, and payment method |
| `GET` | `/api/orders/[id]` | Get tracking status, items, and invoice breakdown for order |
| `GET` | `/api/customer/orders` | Customer order history list |

### 6. Sliders, Banners & Menus
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/sliders` | Get hero sliders and promo banners (`?position=main\|side\|triple_promo`) |
| `GET` | `/api/menu` | Get header navigation bar links with `/category/[slug]` routes |

### 7. Payments & Gateways (`/api/gateways/*`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/gateways` | List active payment gateways (Razorpay, COD, Paytm, Stripe) |
| `POST` | `/api/payments/razorpay/order` | Create Razorpay order ID |
| `POST` | `/api/payments/razorpay/verify` | Verify Razorpay payment signature |
| `POST` | `/api/payments/paytm/initiate` | Initiate Paytm transaction token |

### 8. Customer Profile & Addresses
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/customer/profile` | Get logged-in customer profile |
| `PUT` | `/api/customer/profile` | Update profile information |
| `GET` | `/api/addresses` | Get saved delivery addresses |
| `POST` | `/api/addresses` | Add new shipping address |
| `DELETE` | `/api/addresses/[id]` | Remove address |

### 9. Coupons & Wishlist
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/coupons/apply` | Validate promo code (`WELCOME10`, `EMOX20`, `FREESHIP`) and compute discount |
| `GET` | `/api/wishlist` | Get user saved items |
| `POST` | `/api/wishlist` | Add or toggle item in wishlist |

---

## 🏷️ The 8 Core Categories & Direct URLs

All 8 categories appear in the storefront navigation bar next to **"All Categories"** and open directly:

1. **Electronics**: [`/category/electronics`](http://localhost:3000/category/electronics)
2. **Fashion**: [`/category/fashion`](http://localhost:3000/category/fashion)
3. **Women's**: [`/category/womens`](http://localhost:3000/category/womens)
4. **Kids' Fashion**: [`/category/kids-fashion`](http://localhost:3000/category/kids-fashion)
5. **Health & Beauty**: [`/category/health-beauty`](http://localhost:3000/category/health-beauty)
6. **Pharmacy**: [`/category/pharmacy`](http://localhost:3000/category/pharmacy)
7. **Groceries**: [`/category/groceries`](http://localhost:3000/category/groceries)
8. **Luxury Item**: [`/category/luxury-item`](http://localhost:3000/category/luxury-item)

---

## 📦 Master Seeder & Data Management

Whenever you need to refresh or restore the database, run:
```bash
npm run seed
```
This restores:
- **8 Categories**: Complete hierarchy with slugs and metadata.
- **40 Products**: Flagship products across all 8 departments with descriptions, pricing, and studio `.webp` packshots.
- **273 Product Variants**: Storage (256GB/512GB/1TB), Colors, Sizes (S/M/L/XL, Shoe US 8-11), Pack sizes, Metals, and Flavors.
- **118 Media Assets**: Local high-resolution WebP images stored in `public/uploads/`.
- **4 Payment Gateways**: Razorpay (default enabled), COD, Paytm, Stripe.
- **4 Fulfillment Warehouses**: Avery Dennison, Nike Oregon, Nike Memphis, Samsung Silicon Valley.
- **4 Discount Coupons**: `WELCOME10`, `EMOX20`, `FREESHIP`, `SUPER15`.

---

## 🛠️ Tech Stack
* **Framework**: Next.js 16.4.2 (App Router, Turbopack, Partial Prefetching)
* **Frontend**: React 19, Tailwind CSS v4, Lucide React Icons
* **Database & ORM**: Local JSON Store + Prisma ORM (PostgreSQL ready)
* **Authentication**: JWT (`jose`) with bcrypt password hashing
* **Documentation**: Swagger UI v5 via OpenAPI 3.0.3 specification
