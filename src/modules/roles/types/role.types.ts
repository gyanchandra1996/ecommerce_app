export interface PermissionSet {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canReport?: boolean;
  canOpenScreen?: boolean;
  approve?: boolean;
  export?: boolean;
  manage_settings?: boolean;
}

export type PageModuleId =
  | "dashboard"
  | "assets"
  | "customers"
  | "accessMgmt"
  | "roles"
  | "manufacturers"
  | "products"
  | "categories"
  | "discounts"
  | "reviews"
  | "qna"
  | "wishlist"
  | "inventory"
  | "pricing"
  | "orders"
  | "payments"
  | "marketing"
  | "sliders"
  | "menu"
  | "coupons"
  | "campaigns"
  | "themes"
  | "gateways"
  | "shipping"
  | "settings";

export interface PageModuleInfo {
  id: PageModuleId;
  name: string;
  description: string;
  route: string;
}

export const ADMIN_PAGES: PageModuleInfo[] = [
  { id: "dashboard", name: "Dashboard", description: "Overview stats & KPI metrics", route: "/admin/dashboard" },
  { id: "assets", name: "Assets Management", description: "Media library, images & videos", route: "/admin/assets" },
  { id: "customers", name: "Customers & Roles", description: "User accounts, addresses & permissions", route: "/admin/customers" },
  { id: "roles", name: "Access Management", description: "Customer roles & access groups", route: "/admin/roles" },
  { id: "manufacturers", name: "Manufacturers", description: "Brand manufacturers & warehouses", route: "/admin/manufacturers" },
  { id: "products", name: "Manage Products", description: "Catalog items, pricing & Google Merchant", route: "/admin/products" },
  { id: "categories", name: "Manage Categories", description: "Category, subcategory & hierarchy", route: "/admin/categories" },
  { id: "inventory", name: "Manage Inventory", description: "Stock counts & warehouse tracking", route: "/admin/inventory" },
  { id: "pricing", name: "Manage Pricing", description: "Discounts, wholesale & tiered pricing", route: "/admin/pricing" },
  { id: "orders", name: "Orders & Shipping", description: "Customer purchases & fulfillment", route: "/admin/orders" },
  { id: "payments", name: "Payments", description: "Payment records, gateways & transactions", route: "/admin/payments" },
  { id: "marketing", name: "Marketing", description: "Sliders, coupons & navigation menu", route: "/admin/marketing" },
  { id: "themes", name: "Themes & Layout", description: "Storefront customization & themes", route: "/admin/themes" },
  { id: "gateways", name: "Payment Gateways", description: "Razorpay, PayPal, Paytm & COD", route: "/admin/gateways" },
  { id: "shipping", name: "Shipping Management", description: "Carriers, providers, zones & tracking", route: "/admin/shipping/providers" },
  { id: "settings", name: "Settings", description: "Store config, APIs & delivery settings", route: "/admin/settings" },
];

export type PermissionActionType =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "export"
  | "manage_settings"
  | "add"
  | "report"
  | "openScreen";

export interface ScreenPermission {
  view?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
  approve?: boolean;
  export?: boolean;
  manage_settings?: boolean;
  // Compatibility aliases
  add?: boolean;
  report?: boolean;
  openScreen?: boolean;
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface ScreenDefinition {
  id: string;
  name: string;
  actions: PermissionActionType[];
  route?: string;
  badge?: string;
}

export interface SubModuleDefinition {
  id: string;
  name: string;
  screens: ScreenDefinition[];
}

export interface ModuleDefinition {
  id: string;
  name: string;
  iconName: string;
  color: string;
  badgeText: string;
  infoText: string;
  subModules: SubModuleDefinition[];
}

/**
 * EXACT MODULE HIERARCHY MATCHING THE ADMIN SIDEBAR NAVIGATION STRUCTURE
 */
export const MODULE_HIERARCHY: ModuleDefinition[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    iconName: "LayoutDashboard",
    color: "bg-blue-600 text-white",
    badgeText: "MAIN",
    infoText: "Overview metrics, KPIs, quick stats, and performance graphs",
    subModules: [
      {
        id: "dashboard_sub",
        name: "Dashboard",
        screens: [
          {
            id: "dashboard",
            name: "Dashboard Overview",
            route: "/admin/dashboard",
            actions: ["view", "export"],
          },
        ],
      },
    ],
  },
  {
    id: "assets",
    name: "Assets",
    iconName: "ImageIcon",
    color: "bg-teal-600 text-white",
    badgeText: "MEDIA",
    infoText: "Central media asset manager, modal uploads, banners and product assets",
    subModules: [
      {
        id: "assets_sub",
        name: "Media Library",
        screens: [
          {
            id: "assets",
            name: "Assets Management",
            route: "/admin/assets",
            actions: ["view", "create", "edit", "delete"],
          },
        ],
      },
    ],
  },
  {
    id: "customers",
    name: "Customers",
    iconName: "Users",
    color: "bg-emerald-600 text-white",
    badgeText: "USERS",
    infoText: "Customer directory, address management, activation/deactivation, and credit",
    subModules: [
      {
        id: "customers_sub",
        name: "Customer Accounts",
        screens: [
          {
            id: "customers",
            name: "Manage Customers",
            route: "/admin/customers",
            actions: ["view", "create", "edit", "delete", "approve", "export"],
          },
        ],
      },
    ],
  },
  {
    id: "accessMgmt",
    name: "Access Management",
    iconName: "ShieldCheck",
    color: "bg-indigo-600 text-white",
    badgeText: "SECURITY",
    infoText: "Assign customer security roles, create access groups, and granular permissions",
    subModules: [
      {
        id: "access_sub",
        name: "Customer Role Privileges",
        screens: [
          {
            id: "roles_assign",
            name: "Assign Customer Role",
            route: "/admin/roles/assign",
            actions: ["view", "edit"],
          },
          {
            id: "roles_groups",
            name: "Access Groups",
            route: "/admin/roles",
            actions: ["view", "create", "edit", "delete"],
          },
          {
            id: "roles_create",
            name: "Create Role",
            route: "/admin/roles/create",
            actions: ["view", "create", "edit"],
          },
        ],
      },
    ],
  },
  {
    id: "manufacturers",
    name: "Manufacturers",
    iconName: "Factory",
    color: "bg-amber-600 text-white",
    badgeText: "VENDORS",
    infoText: "Manage brand manufacturers, supplier contacts, and warehouse mappings",
    subModules: [
      {
        id: "manufacturers_sub",
        name: "Manufacturers & Suppliers",
        screens: [
          {
            id: "manufacturers",
            name: "Manage Manufacturers",
            route: "/admin/manufacturers",
            actions: ["view", "create", "edit", "delete"],
          },
        ],
      },
    ],
  },
  {
    id: "products",
    name: "Products",
    iconName: "Package",
    color: "bg-violet-600 text-white",
    badgeText: "CATALOG",
    infoText: "Manage products, categories, discounts, customer reviews, Q&A, and wishlists",
    subModules: [
      {
        id: "products_sub",
        name: "Catalog Modules",
        screens: [
          {
            id: "products",
            name: "Manage Products",
            route: "/admin/products",
            actions: ["view", "create", "edit", "delete", "export"],
          },
          {
            id: "categories",
            name: "Manage Categories",
            route: "/admin/categories",
            actions: ["view", "create", "edit", "delete"],
          },
          {
            id: "discounts",
            name: "Manage Discount",
            route: "/admin/discounts",
            actions: ["view", "create", "edit", "delete"],
          },
          {
            id: "reviews",
            name: "Manage Review",
            route: "/admin/reviews",
            actions: ["view", "edit", "delete", "approve"],
          },
          {
            id: "qna",
            name: "Manage Q&A",
            route: "/admin/qna",
            actions: ["view", "edit", "delete", "approve"],
          },
          {
            id: "wishlist",
            name: "Manage Wishlist",
            route: "/admin/wishlist",
            actions: ["view", "delete"],
          },
        ],
      },
    ],
  },
  {
    id: "inventory",
    name: "Manage Inventory",
    iconName: "Boxes",
    color: "bg-orange-600 text-white",
    badgeText: "LOGISTICS",
    infoText: "Warehouse stock levels, inventory adjustments, and backorder tracking",
    subModules: [
      {
        id: "inventory_sub",
        name: "Inventory Tracking",
        screens: [
          {
            id: "inventory",
            name: "Inventory Management",
            route: "/admin/inventory",
            actions: ["view", "create", "edit", "export"],
          },
        ],
      },
    ],
  },
  {
    id: "pricing",
    name: "Manage Pricing",
    iconName: "DollarSign",
    color: "bg-emerald-600 text-white",
    badgeText: "FINANCE",
    infoText: "Price adjustments, bulk discounts, wholesale margins, and flash sale pricing",
    subModules: [
      {
        id: "pricing_sub",
        name: "Pricing Rules",
        screens: [
          {
            id: "pricing",
            name: "Manage Pricing",
            route: "/admin/pricing",
            actions: ["view", "edit"],
          },
        ],
      },
    ],
  },
  {
    id: "orders",
    name: "Orders",
    iconName: "ShoppingCart",
    color: "bg-blue-700 text-white",
    badgeText: "SALES",
    infoText: "Order fulfillment, shipments, packing slips, address verification, and pending orders",
    subModules: [
      {
        id: "orders_sub",
        name: "Order Processing",
        screens: [
          {
            id: "orders",
            name: "All Orders",
            route: "/admin/orders",
            actions: ["view", "edit", "delete", "export"],
          },
          {
            id: "orders_create",
            name: "Add Order",
            route: "/admin/orders/create",
            actions: ["view", "create"],
          },
          {
            id: "orders_pending",
            name: "Pending Orders",
            route: "/admin/orders/pending",
            actions: ["view", "edit", "approve"],
          },
          {
            id: "orders_shipments",
            name: "Shipments",
            route: "/admin/orders/shipments",
            actions: ["view", "edit", "export"],
          },
        ],
      },
    ],
  },
  {
    id: "marketing",
    name: "Marketing",
    iconName: "Megaphone",
    color: "bg-pink-600 text-white",
    badgeText: "PROMO",
    infoText: "Manage promotional sliders, navigation menus, coupons, and email campaigns",
    subModules: [
      {
        id: "marketing_sub",
        name: "Promotions & Content",
        screens: [
          {
            id: "sliders",
            name: "Manage Sliders",
            route: "/admin/sliders",
            actions: ["view", "create", "edit", "delete"],
          },
          {
            id: "menu",
            name: "Navigation Menu",
            route: "/admin/menu",
            actions: ["view", "create", "edit", "delete"],
          },
          {
            id: "coupons",
            name: "Coupons",
            route: "/admin/coupons",
            actions: ["view", "create", "edit", "delete"],
          },
          {
            id: "campaigns",
            name: "Email Campaigns",
            route: "/admin/campaigns",
            actions: ["view", "create", "delete"],
          },
        ],
      },
    ],
  },
  {
    id: "themes",
    name: "Themes & Layout",
    iconName: "Palette",
    color: "bg-purple-700 text-white",
    badgeText: "STOREFRONT",
    infoText: "Theme ZIP upload, live layout customizer, banner arrangement, and previews",
    subModules: [
      {
        id: "themes_sub",
        name: "Store Themes",
        screens: [
          {
            id: "themes",
            name: "Theme Customizer",
            route: "/admin/themes",
            actions: ["view", "edit", "manage_settings"],
          },
        ],
      },
    ],
  },
  {
    id: "gateways",
    name: "Payment Gateways",
    iconName: "CreditCard",
    color: "bg-emerald-700 text-white",
    badgeText: "PAYMENTS",
    infoText: "Configure Razorpay, PayPal, Paytm, COD and default payment methods",
    subModules: [
      {
        id: "gateways_sub",
        name: "Payment Gateways",
        screens: [
          {
            id: "gateways",
            name: "Payment Gateways",
            route: "/admin/gateways",
            actions: ["view", "edit", "manage_settings"],
          },
        ],
      },
    ],
  },
  {
    id: "settings",
    name: "Settings",
    iconName: "Settings",
    color: "bg-slate-700 text-white",
    badgeText: "CONFIG",
    infoText: "System defaults, currency (INR), GST tax, delivery settings, and store profile",
    subModules: [
      {
        id: "settings_sub",
        name: "General Configuration",
        screens: [
          {
            id: "settings",
            name: "System Settings",
            route: "/admin/settings",
            actions: ["view", "edit", "manage_settings"],
          },
        ],
      },
    ],
  },
];

export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isSystem: boolean;
  status?: "Active" | "Inactive";
  screenPrivilegesCount?: number;
  permissions: Record<string, ScreenPermission | PermissionSet>;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
}

export interface RoleEmployee {
  id: string;
  empId?: string;
  name: string;
  email: string;
  phone?: string;
  mobileNumber?: string;
  department?: string;
  designation?: string;
  joinedDate?: string;
  avatarColor?: string;
  avatarText?: string;
  isAdminBadge?: boolean;
  accountType?: string;
  customerType?: string;
  roleId?: string;
  role?: string;
  status: "ACTIVE" | "INACTIVE";
  assignedRoles: string[]; // Names of roles, e.g. ["Admin", "Store Manager"]
  assignedRoleIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}
