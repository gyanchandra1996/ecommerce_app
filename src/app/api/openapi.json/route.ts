import { NextResponse } from "next/server";
import { APP_CONFIG } from "@/core/config/env";

export async function GET() {
  const spec = {
    openapi: "3.0.3",
    info: {
      title: "G-Store E-Commerce REST API",
      version: "2.0.0",
      description: `
### Complete REST API Specification for Mobile & Storefront Applications
This API powers the G-Store e-commerce application, mobile apps (Flutter, React Native, iOS, Android), and administrative dashboard.

#### 🔑 Authentication Options:
1. **API Key Authentication** (Best for Mobile Client App Initial Access):
   - Header: \`x-api-key: ${APP_CONFIG.apiKey}\`
2. **Bearer Token Authentication** (Best for Authenticated Customer / Admin Users):
   - Header: \`Authorization: Bearer <jwt_token>\`
   - Obtained via \`POST /api/auth/login\` or \`POST /api/auth/register\`
3. **Session Cookies** (Used for web browsers)

#### 📱 Mobile App Development Notes:
- To maintain guest cart sessions across app launches, pass \`x-session-id: <uuid>\` header.
- Images are served with relative paths (e.g., \`/uploads/prod_s24_ultra_deal.webp\`). Prepend the base server URL for full asset resolution.
      `,
      contact: {
        name: "G-Store API Support",
        email: "gyanwork1996@gmail.com",
      },
    },
    servers: [
      {
        url: "/",
        description: "Current Server Environment",
      },
      {
        url: "http://localhost:3000",
        description: "Local Development Server (Port 3000)",
      },
      {
        url: "http://localhost:3001",
        description: "Local Development Server (Port 3001)",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: `Enter the Mobile Developer API Key: \`${APP_CONFIG.apiKey}\``,
        },
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token received from /api/auth/login or /api/auth/register",
        },
      },
      schemas: {
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { type: "object" },
            error: { type: "string" },
          },
        },
        AuthUser: {
          type: "object",
          properties: {
            id: { type: "string", example: "usr_cust_gyanchandra" },
            name: { type: "string", example: "Gyanchandra" },
            email: { type: "string", example: "gyanchandranist@gmail.com" },
            role: { type: "string", enum: ["CUSTOMER", "ADMIN", "MANAGER", "STAFF"], example: "CUSTOMER" },
            type: { type: "string", enum: ["customer", "admin", "both"], example: "customer" },
            avatar: { type: "string", nullable: true },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "string", example: "cat_electronics" },
            name: { type: "string", example: "Electronics" },
            slug: { type: "string", example: "electronics" },
            description: { type: "string", example: "Cutting edge smartphones, gadgets, and computers" },
            image: { type: "string", example: "/uploads/category_electronics.webp" },
            parentId: { type: "string", nullable: true },
            level: { type: "integer", example: 0 },
            isActive: { type: "boolean", example: true },
            productCount: { type: "integer", example: 5 },
            subcategories: {
              type: "array",
              items: { $ref: "#/components/schemas/Category" },
            },
          },
        },
        ProductVariant: {
          type: "object",
          properties: {
            id: { type: "string", example: "var_prod_s24_ultra_512gb_gry" },
            productId: { type: "string", example: "prod_s24_ultra" },
            sku: { type: "string", example: "SAM-S24U-512GB-GRY" },
            price: { type: "number", example: 1349.99 },
            comparePrice: { type: "number", example: 1499.00 },
            costPrice: { type: "number", example: 877.49 },
            currentStock: { type: "integer", example: 35 },
            isActive: { type: "boolean", example: true },
            image: { type: "string", example: "/uploads/prod_s24_ultra_deal.webp" },
            attributes: {
              type: "object",
              additionalProperties: { type: "string" },
              example: { Storage: "512 GB", Color: "Titanium Gray" },
            },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "string", example: "prod_s24_ultra" },
            name: { type: "string", example: "Samsung Galaxy S24 Ultra 12+GB Titanium Gray" },
            slug: { type: "string", example: "samsung-galaxy-s24-ultra" },
            sku: { type: "string", example: "SAM-S24U-TITANIUM" },
            description: { type: "string", example: "Flagship smartphone featuring Galaxy AI, Snapdragon 8 Gen 3, and 200MP camera." },
            price: { type: "number", example: 1199.99 },
            comparePrice: { type: "number", example: 1399.00 },
            costPrice: { type: "number", example: 780.00 },
            currentStock: { type: "integer", example: 65 },
            status: { type: "string", enum: ["ACTIVE", "DRAFT", "ARCHIVED"], example: "ACTIVE" },
            brand: { type: "string", example: "Samsung" },
            categoryIds: {
              type: "array",
              items: { type: "string" },
              example: ["cat_electronics"],
            },
            mainImage: { type: "string", example: "/uploads/prod_s24_ultra_deal.webp" },
            hasVariants: { type: "boolean", example: true },
            variantAttributes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Storage" },
                  values: { type: "array", items: { type: "string" }, example: ["256 GB", "512 GB", "1 TB"] },
                },
              },
            },
            variants: {
              type: "array",
              items: { $ref: "#/components/schemas/ProductVariant" },
            },
          },
        },
        CartItem: {
          type: "object",
          properties: {
            id: { type: "string", example: "ci_179328" },
            cartId: { type: "string", example: "cart_guest123" },
            productId: { type: "string", example: "prod_s24_ultra" },
            variantId: { type: "string", nullable: true, example: "var_prod_s24_ultra_512gb_gry" },
            quantity: { type: "integer", example: 1 },
            selectedAttributes: {
              type: "object",
              additionalProperties: { type: "string" },
              example: { Storage: "512 GB", Color: "Titanium Gray" },
            },
            product: { $ref: "#/components/schemas/Product" },
          },
        },
        Cart: {
          type: "object",
          properties: {
            id: { type: "string", example: "cart_guest123" },
            userId: { type: "string", nullable: true },
            guestSessionId: { type: "string", nullable: true },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/CartItem" },
            },
            totalItems: { type: "integer", example: 2 },
            subtotal: { type: "number", example: 1267.49 },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "string", example: "ord_17932890" },
            orderNumber: { type: "string", example: "ORD-2026-9042" },
            customerName: { type: "string", example: "Gyanchandra" },
            customerEmail: { type: "string", example: "gyanchandranist@gmail.com" },
            totalAmount: { type: "number", example: 1267.49 },
            status: { type: "string", enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"], example: "PROCESSING" },
            paymentStatus: { type: "string", enum: ["PENDING", "PAID", "FAILED", "REFUNDED"], example: "PAID" },
            paymentMethod: { type: "string", example: "Razorpay / UPI" },
            items: { type: "array", items: { type: "object" } },
            shippingAddress: { type: "object" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ReviewMedia: {
          type: "object",
          properties: {
            id: { type: "string", example: "rmed_1_1" },
            url: { type: "string", example: "/uploads/prod_airpods_1.webp" },
            type: { type: "string", enum: ["IMAGE", "VIDEO"], example: "IMAGE" },
            name: { type: "string", example: "earbuds_unboxing.webp" },
            size: { type: "integer", example: 128450 },
          },
        },
        ReviewComment: {
          type: "object",
          properties: {
            id: { type: "string", example: "rcmt_1_1" },
            reviewId: { type: "string", example: "rev_1" },
            userName: { type: "string", example: "G-Store Support Team" },
            userEmail: { type: "string", example: "support@gstore.com" },
            comment: { type: "string", example: "Thank you for the review, Johnathan! Firmware update rolling out soon." },
            isAdmin: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Review: {
          type: "object",
          properties: {
            id: { type: "string", example: "rev_1" },
            productId: { type: "string", example: "prod_wireless_earbuds" },
            itemNo: { type: "string", example: "z2216" },
            productName: { type: "string", example: "wireless-earbuds-z2216" },
            userName: { type: "string", example: "Johnathan Smith" },
            userEmail: { type: "string", example: "john.smith@gmail.com" },
            rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
            review: { type: "string", example: "Outstanding sound quality, crisp highs and deep bass!" },
            commentCount: { type: "integer", example: 1 },
            media: {
              type: "array",
              items: { $ref: "#/components/schemas/ReviewMedia" },
            },
            comments: {
              type: "array",
              items: { $ref: "#/components/schemas/ReviewComment" },
            },
            status: { type: "string", enum: ["Active", "Inactive", "Pending"], example: "Active" },
            postedOn: { type: "string", example: "2026-10-22" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    security: [
      { ApiKeyAuth: [] },
      { BearerAuth: [] },
    ],
    paths: {
      "/api/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "Customer / Admin Login",
          description: "Authenticate with email and password. Returns JWT token for mobile header Authorization: Bearer <token>.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", example: "gyanchandranist@gmail.com" },
                    password: { type: "string", example: "password123" },
                    portal: { type: "string", enum: ["customer", "admin"], example: "customer" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          user: { $ref: "#/components/schemas/AuthUser" },
                          token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Invalid credentials" },
          },
        },
      },
      "/api/auth/register": {
        post: {
          tags: ["Authentication"],
          summary: "Register New Customer Account",
          description: "Register a customer account. Automatically issues JWT token.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string", example: "Rahul Sharma" },
                    email: { type: "string", example: "rahul@example.com" },
                    password: { type: "string", example: "Password@123" },
                    mobileNumber: { type: "string", example: "9876543210" },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Customer created successfully",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
            },
          },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Authentication"],
          summary: "Get Current Authenticated User",
          description: "Retrieves the authenticated profile using Bearer JWT, API Key, or session cookie.",
          parameters: [
            {
              name: "portal",
              in: "query",
              required: false,
              schema: { type: "string", enum: ["customer", "admin"] },
            },
          ],
          responses: {
            200: {
              description: "Profile retrieved",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          user: { $ref: "#/components/schemas/AuthUser" },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/auth/logout": {
        post: {
          tags: ["Authentication"],
          summary: "User Logout",
          description: "Clears session cookies and invalidates mobile session.",
          responses: {
            200: { description: "Logged out successfully" },
          },
        },
      },
      "/api/categories": {
        get: {
          tags: ["Categories"],
          summary: "List Categories",
          description: "Get all active categories. Supports hierarchical tree or flat list format.",
          parameters: [
            {
              name: "format",
              in: "query",
              required: false,
              description: "Use 'tree' for nested hierarchy or 'flat' for flat list",
              schema: { type: "string", enum: ["tree", "flat"], default: "tree" },
            },
          ],
          responses: {
            200: {
              description: "List of categories",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Category" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/categories/{id}": {
        get: {
          tags: ["Categories"],
          summary: "Get Category By ID or Slug",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", example: "electronics" },
            },
          ],
          responses: {
            200: {
              description: "Category details",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
            },
            404: { description: "Category not found" },
          },
        },
      },
      "/api/products": {
        get: {
          tags: ["Products"],
          summary: "List Products with Filtering & Search",
          description: "Fetch products with pagination, category filtering, search keywords, price ranges, and sorting.",
          parameters: [
            {
              name: "categoryId",
              in: "query",
              required: false,
              description: "Filter by category ID or slug (e.g. 'cat_electronics' or 'electronics')",
              schema: { type: "string", example: "cat_electronics" },
            },
            {
              name: "search",
              in: "query",
              required: false,
              description: "Search keyword matching name, sku, or description",
              schema: { type: "string", example: "Galaxy S24" },
            },
            {
              name: "minPrice",
              in: "query",
              required: false,
              schema: { type: "number", example: 100 },
            },
            {
              name: "maxPrice",
              in: "query",
              required: false,
              schema: { type: "number", example: 2000 },
            },
            {
              name: "sort",
              in: "query",
              required: false,
              schema: { type: "string", enum: ["price_asc", "price_desc", "newest", "featured"], default: "featured" },
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", default: 20 },
            },
            {
              name: "page",
              in: "query",
              required: false,
              schema: { type: "integer", default: 1 },
            },
          ],
          responses: {
            200: {
              description: "Products list with variants populated",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Product" },
                      },
                      pagination: {
                        type: "object",
                        properties: {
                          total: { type: "integer" },
                          page: { type: "integer" },
                          limit: { type: "integer" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/products/{id}": {
        get: {
          tags: ["Products"],
          summary: "Get Product Details with Variants",
          description: "Fetch full product specifications, image gallery assets, and variant options for mobile detail screens.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "Product ID or slug",
              schema: { type: "string", example: "prod_s24_ultra" },
            },
          ],
          responses: {
            200: {
              description: "Detailed product object with variants",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/Product" },
                    },
                  },
                },
              },
            },
            404: { description: "Product not found" },
          },
        },
      },
      "/api/cart": {
        get: {
          tags: ["Cart"],
          summary: "Get User / Guest Cart",
          description: "Retrieves the active cart for the customer or guest. Supports x-session-id header for mobile devices.",
          responses: {
            200: {
              description: "Cart content",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/Cart" },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Cart"],
          summary: "Add or Update Cart Item",
          description: "Add a product or specific variant to the shopping cart.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["productId"],
                  properties: {
                    productId: { type: "string", example: "prod_s24_ultra" },
                    variantId: { type: "string", example: "var_prod_s24_ultra_512gb_gry" },
                    quantity: { type: "integer", example: 1, default: 1 },
                    selectedAttributes: {
                      type: "object",
                      example: { Storage: "512 GB", Color: "Titanium Gray" },
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Item added successfully",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
            },
          },
        },
        delete: {
          tags: ["Cart"],
          summary: "Clear Shopping Cart",
          responses: {
            200: { description: "Cart cleared" },
          },
        },
      },
      "/api/orders": {
        get: {
          tags: ["Orders & Checkout"],
          summary: "List Orders",
          description: "Returns list of orders for the current user or customer.",
          responses: {
            200: {
              description: "Orders list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Order" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Orders & Checkout"],
          summary: "Create Order (Checkout)",
          description: "Place an order with shipping address and selected payment gateway.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["customerName", "customerEmail", "items"],
                  properties: {
                    customerName: { type: "string", example: "Gyanchandra" },
                    customerEmail: { type: "string", example: "gyanwork1996@gmail.com" },
                    customerPhone: { type: "string", example: "+91 98765 43210" },
                    shippingAddress: {
                      type: "object",
                      properties: {
                        street: { type: "string", example: "Hill Road, Suite 402" },
                        city: { type: "string", example: "Mumbai" },
                        state: { type: "string", example: "Maharashtra" },
                        postalCode: { type: "string", example: "400050" },
                        country: { type: "string", example: "India" },
                      },
                    },
                    paymentMethod: { type: "string", example: "COD", enum: ["COD", "UPI", "Razorpay", "Paytm", "Stripe"] },
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          productId: { type: "string", example: "prod_s24_ultra" },
                          variantId: { type: "string", example: "var_prod_s24_ultra_512gb_gry" },
                          quantity: { type: "integer", example: 1 },
                          price: { type: "number", example: 1199.99 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Order placed successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/Order" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/orders/{id}": {
        get: {
          tags: ["Orders & Checkout"],
          summary: "Get Order Details by ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Order details",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
            },
          },
        },
      },
      "/api/sliders": {
        get: {
          tags: ["Storefront & Banners"],
          summary: "Get Sliders & Promotional Banners",
          description: "Fetch promotional banners and hero sliders for mobile home screens.",
          parameters: [
            {
              name: "position",
              in: "query",
              required: false,
              schema: { type: "string", enum: ["main", "side", "triple_promo"], example: "main" },
            },
          ],
          responses: {
            200: {
              description: "Slider banners array",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
            },
          },
        },
      },
      "/api/menu": {
        get: {
          tags: ["Storefront & Banners"],
          summary: "Get Navigation Menu Items",
          description: "Get header navigation links including the 8 top categories with /category/[slug] routing.",
          responses: {
            200: {
              description: "Menu items array",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
            },
          },
        },
      },
      "/api/gateways": {
        get: {
          tags: ["Payment Gateways"],
          summary: "Get Enabled Payment Gateways",
          description: "Returns active payment methods: Cash On Delivery, Razorpay, Paytm, Stripe.",
          parameters: [
            {
              name: "activeOnly",
              in: "query",
              schema: { type: "boolean", default: true },
            },
          ],
          responses: {
            200: {
              description: "List of gateways",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
            },
          },
        },
      },
      "/api/coupons/apply": {
        post: {
          tags: ["Coupons & Discounts"],
          summary: "Validate & Apply Promo Code",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["code", "cartTotal"],
                  properties: {
                    code: { type: "string", example: "SAVE20" },
                    cartTotal: { type: "number", example: 1200 },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Coupon discount calculation",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
            },
          },
        },
      },
      "/api/wishlist": {
        get: {
          tags: ["Wishlist"],
          summary: "Get Customer Wishlist",
          responses: {
            200: {
              description: "Wishlist items",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
            },
          },
        },
        post: {
          tags: ["Wishlist"],
          summary: "Add / Remove Item from Wishlist",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["productId"],
                  properties: {
                    productId: { type: "string", example: "prod_s24_ultra" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Wishlist updated" },
          },
        },
      },
      "/api/settings": {
        get: {
          tags: ["Storefront & Banners"],
          summary: "Get Public Store Configuration",
          description: "Get site name, logo, currency code, contact details, and default delivery locations.",
          responses: {
            200: {
              description: "Store settings",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
            },
          },
        },
      },
      "/api/reviews": {
        get: {
          tags: ["Product Reviews & Comments"],
          summary: "List Customer Reviews with Media & Comments",
          description: "Fetch customer reviews filtered by rating, search keyword, product ID, or status.",
          parameters: [
            { name: "productId", in: "query", schema: { type: "string" }, description: "Filter reviews for a specific product ID or SKU" },
            { name: "rating", in: "query", schema: { type: "integer" }, description: "Filter by star rating (1-5)" },
            { name: "search", in: "query", schema: { type: "string" }, description: "Search keyword in review text or reviewer name" },
            { name: "status", in: "query", schema: { type: "string", enum: ["All", "Active", "Pending", "Inactive"] }, description: "Review approval status" },
          ],
          responses: {
            200: {
              description: "Array of customer reviews with attached media and comments",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Review" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Product Reviews & Comments"],
          summary: "Submit Customer Review with Media",
          description: "Submit a new customer review with rating, review text, and optional media packshots/videos.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["itemNo", "review", "rating"],
                  properties: {
                    productId: { type: "string", example: "prod_s24_ultra" },
                    itemNo: { type: "string", example: "z2216" },
                    productName: { type: "string", example: "Wireless Earbuds z2216" },
                    userName: { type: "string", example: "Johnathan Smith" },
                    userEmail: { type: "string", example: "john.smith@gmail.com" },
                    rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
                    review: { type: "string", example: "Outstanding sound quality, crisp highs and deep bass!" },
                    media: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ReviewMedia" },
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Review created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/Review" },
                    },
                  },
                },
              },
            },
            400: { description: "Missing required fields" },
          },
        },
      },
      "/api/reviews/upload": {
        post: {
          tags: ["Product Reviews & Comments"],
          summary: "Upload Review Media (Photos & Videos)",
          description: "Upload customer review photos (JPG, PNG, WEBP) or review videos (MP4, WEBM). Returns media items with URLs.",
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    files: {
                      type: "array",
                      items: { type: "string", format: "binary" },
                      description: "One or more photo or video files to upload",
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Media files uploaded successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/ReviewMedia" },
                      },
                    },
                  },
                },
              },
            },
            400: { description: "Unsupported file format or file size exceeded" },
          },
        },
      },
      "/api/reviews/{id}/comments": {
        get: {
          tags: ["Product Reviews & Comments"],
          summary: "Get All Comments / Replies for a Review",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Review ID (e.g. rev_1)" },
          ],
          responses: {
            200: {
              description: "List of comments on review",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/ReviewComment" },
                      },
                      commentCount: { type: "integer", example: 2 },
                    },
                  },
                },
              },
            },
            404: { description: "Review not found" },
          },
        },
        post: {
          tags: ["Product Reviews & Comments"],
          summary: "Add a Comment or Store Admin Reply on Review",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Review ID (e.g. rev_1)" },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["comment"],
                  properties: {
                    userName: { type: "string", example: "G-Store Support Team" },
                    userEmail: { type: "string", example: "support@gstore.com" },
                    comment: { type: "string", example: "Thank you for the review, Johnathan! Firmware update rolling out soon." },
                    isAdmin: { type: "boolean", example: true, description: "Set to true for official store/admin reply" },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Comment posted successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/Review" },
                      comment: { $ref: "#/components/schemas/ReviewComment" },
                    },
                  },
                },
              },
            },
            400: { description: "Empty comment text" },
            404: { description: "Review not found" },
          },
        },
      },
      "/api/reviews/{id}/comments/{commentId}": {
        delete: {
          tags: ["Product Reviews & Comments"],
          summary: "Delete Review Comment (Admin Moderation)",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Review ID" },
            { name: "commentId", in: "path", required: true, schema: { type: "string" }, description: "Comment ID to delete" },
          ],
          responses: {
            200: {
              description: "Comment deleted successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Comment deleted successfully." },
                    },
                  },
                },
              },
            },
            404: { description: "Review or comment not found" },
          },
        },
      },
    },
  };

  return NextResponse.json(spec, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
