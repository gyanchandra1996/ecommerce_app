# Tagateway Enterprise E-Commerce Admin & Asset Management Platform

An enterprise-grade, modular e-commerce management platform built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM with PostgreSQL**, and **Docker**.

Matches the administrative UI design featuring **Authentication (Login & Register)**, **Live Asset Management** with multi-file and video support with **upload progress tracking**, **Inventory Management**, and **Settings**.

---

## 🚀 Key Features

### 1. Module-Wise Maintainable Architecture
- **Auth Module (`src/modules/auth`)**:
  - Secure Registration & Login with password hashing (`bcryptjs`)
  - Stateless JWT Session Authentication (`jose`)
  - Route protection middleware (`/admin/*`)
  - Role management (Admin, Manager, Staff)
- **Asset Management Module (`src/modules/assets`)**:
  - Upload Images (`.jpg`, `.png`, `.webp`, `.svg`, `.gif`) and Videos (`.mp4`, `.webm`, `.mov`)
  - **Live Upload Progress Indicators**: Real-time progress bar (0% to 100%) showing upload state, speed, and file size
  - Dual View Modes: Grid Card View (matches tag31 media library) and Detailed Table List View
  - Filter by asset type (*All*, *Images*, *Videos*, *Documents*, *Audio*)
  - Sort by *Recent*, *Oldest*, *Name (A-Z)*, *Name (Z-A)*, *File Size*
  - Multiselect toggle for bulk deletion and batch operations
  - Full Asset Preview Drawer with high-res image zoom and HTML5 video player
  - **Product Attachment**: Directly link any asset to one or more e-commerce products
- **Dashboard & Shell (`src/modules/dashboard`)**:
  - Responsive dark navy sidebar matching screenshot
  - Quick Links with notification badge, global search, and user dropdown
- **Inventory Management (`/admin/inventory`)**:
  - Product stock tracking, warehouse filtering, and Sellbrite status banner
- **Settings (`/admin/settings`)**:
  - Categorized settings panel for Payment Gateways, API keys, Email, Shipping, and system configs

---

## 📁 Modular Directory Structure

```
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (auth)/                  # Auth route group
│   │   │   ├── login/page.tsx       # Sign In page
│   │   │   └── register/page.tsx    # Registration page
│   │   ├── admin/                   # Admin console routes
│   │   │   ├── assets/page.tsx      # Media Library (Image 1)
│   │   │   ├── dashboard/page.tsx   # Dashboard overview
│   │   │   ├── inventory/page.tsx   # Manage Inventory (Image 2)
│   │   │   ├── settings/page.tsx    # Settings panel (Image 3)
│   │   │   └── layout.tsx           # Admin shell with header & sidebar
│   │   ├── api/                     # REST API Endpoints
│   │   │   ├── auth/                # Login, Register, Logout, Me
│   │   │   ├── assets/              # Upload, List, Filter, Update, Delete, Batch
│   │   │   └── products/            # Products and asset attachment
│   │   ├── globals.css              # Custom styling
│   │   └── layout.tsx               # Root layout
│   │
│   ├── core/                        # Core Foundation
│   │   ├── config/env.ts            # Environment constants
│   │   ├── db/prisma.ts             # Prisma client singleton
│   │   ├── db/store.ts              # Data layer with PostgreSQL & local fallback
│   │   ├── storage/file-storage.ts  # Media storage engine (images, videos, documents)
│   │   └── utils/api-response.ts    # Standardized API response formatters
│   │
│   ├── modules/                     # Domain Feature Modules
│   │   ├── auth/                    # Auth components, services, validations, types
│   │   ├── assets/                  # Media library components, uploaders, cards, modals
│   │   ├── dashboard/               # Sidebar, Header, Footer components
│   │   └── products/                # Product interfaces & media linkage
│   │
│   └── middleware.ts                # Route protection middleware
│
├── prisma/
│   └── schema.prisma                # PostgreSQL schema (User, Asset, Product, ProductAsset)
│
├── public/
│   └── uploads/                     # Uploaded media storage
│
├── Dockerfile                       # Multi-stage production container build
├── docker-compose.yml               # PostgreSQL 16 + Next.js App compose setup
└── package.json
```

---

## 🛠️ Quickstart

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm 9+
- (Optional) Docker & Docker Compose

### Option A: Local Development
```bash
# 1. Install dependencies
npm install

# 2. Seed default admin and sample assets
npm run db:seed

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Option B: Run with Docker & PostgreSQL

The project includes an optimized multi-stage `Dockerfile` and a `docker-compose.yml` that provisions **PostgreSQL 16** and the **Next.js Web Service** with persistent volumes:

```bash
# Start PostgreSQL database and Next.js container
docker compose up -d

# Check running containers
docker compose ps

# View container logs
docker compose logs -f web
```

To stop containers:
```bash
docker compose down
```

---

## 🔑 Default Administrator Credentials

Upon running `npm run db:seed` or opening the app, you can use the default administrator credentials:

- **Email**: `admin@tagateway.com`
- **Password**: `Admin123!`

*(You can also register a new admin or manager account anytime on the `/register` page).*

---

## 🗄️ PostgreSQL Database Migration

To apply Prisma schema changes directly to your PostgreSQL database:

```bash
# Push schema to PostgreSQL
npm run db:push

# Open Prisma Studio to inspect tables
npx prisma studio
```
