import fs from "fs/promises";
import path from "path";
import os from "os";
import { prisma } from "./prisma";
import { AssetType } from "../storage/file-storage";

export interface UserRecord {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  role: string;
  roleId?: string;
  avatar?: string | null;
  type?: "admin" | "customer" | "both";
  accountType?: "admin" | "customer" | "both" | "manager" | "staff";
  customerType?: "Customer" | "Admin" | "Both" | "Customer (Guest)" | string;
  address?: string | null;
  shippingAddress?: string | null;
  lastLogin?: string | null;
  credit?: number;
  status?: "ACTIVE" | "INACTIVE" | "PENDING_APPROVAL";
  ordersCount?: number;
  wishlistCount?: number;
  empId?: string;
  department?: string;
  designation?: string;
  phone?: string;
  joinedDate?: string;
  avatarColor?: string;
  avatarText?: string;
  isAdminBadge?: boolean;
  assignedRoles?: string[];
  assignedRoleIds?: string[];
  mobileNumber?: string;
  countryCode?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  streetAddress?: string;
  apartment?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionSet {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canReport?: boolean;
  canOpenScreen?: boolean;
}

export interface RoleRecord {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isSystem: boolean;
  status?: "Active" | "Inactive";
  screenPrivilegesCount?: number;
  permissions: Record<string, PermissionSet | any>;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
}

export interface AssetRecord {
  id: string;
  name: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  fileUrl?: string;
  thumbnailUrl?: string | null;
  fileType: AssetType;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  altText?: string | null;
  caption?: string | null;
  folder?: string | null;
  tags: string[];
  uploaderId?: string | null;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
  storageProvider?: "local" | "s3";
  storageKey?: string;
  s3SyncedAt?: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  level: number; // 0: Root, 1: Subcategory, 2: Sub-subcategory
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  productCount?: number; // TP: X
  children?: CategoryRecord[];
  subcategories?: CategoryRecord[];
}

export interface VariantAttributeOption {
  name: string; // e.g. "Color", "Size", "Storage", "Weight"
  values: string[]; // e.g. ["Black", "White", "Blue"]
}

export interface ProductVariantRecord {
  id: string;
  productId: string;
  sku: string;
  price: number;
  comparePrice?: number | null;
  costPrice?: number | null;
  currentStock: number;
  isActive: boolean;
  image?: string | null;
  attributes: Record<string, string>; // e.g. { "Color": "Black", "Size": "M" }
  createdAt: string;
  updatedAt: string;
}

export interface ProductRecord {
  id: string;
  sku: string;
  upc?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  comparePrice?: number | null;
  costPrice?: number | null;
  currentStock: number;
  minStock: number;
  warehouse?: string | null;
  warehouseId?: string | null;
  manufacturerId?: string | null;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  isSoldOut: boolean;
  rating?: number;
  reviewsCount?: number;
  brand?: string | null;

  // Google Merchant Center Integration
  googleMerchantSync: boolean;
  googleCategory?: string | null;
  googleCondition?: string | null;
  googleBrand?: string | null;
  googleGtin?: string | null;
  googleMpn?: string | null;
  googleSyncStatus?: "READY" | "SYNCED" | "FAILED";
  googleLastSyncedAt?: string | null;

  createdAt: string;
  updatedAt: string;

  // Product Variants
  hasVariants?: boolean;
  variantAttributes?: VariantAttributeOption[];
  variants?: ProductVariantRecord[];

  // Populated relations
  categoryIds?: string[];
  categoryNames?: string[];
  assetIds?: string[];
  mainImage?: string | null;
  assets?: { id: string; url: string; name: string; isPrimary: boolean }[];
}

export interface SliderRecord {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  tag?: string;
  buttonText: string;
  buttonLink: string;
  imageUrl?: string;
  bgGradient?: string;
  textColor?: string;
  position: "main" | "side" | "triple_promo";
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemRecord {
  id: string;
  label: string;
  url: string;
  icon?: string;
  badge?: string;
  displayOrder: number;
  isActive: boolean;
  isHighlight?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FooterLinkItem {
  id: string;
  label: string;
  url: string;
  displayOrder: number;
  isActive: boolean;
  section: "shop" | "customer_service" | "about" | "legal";
}

export interface SiteSettingsRecord {
  id: string;
  // General & Theme
  themeName: string; // Dynamic theme name shown in header / navbar
  siteTitle: string; // Store title / metadata
  tagline: string;
  uniqueTitle: string;
  alternateTitle: string;
  orderPrefix: string;
  defaultCurrency: string;
  deliveryLocation: string;
  timeZone: string;
  supportEmail: string;
  supportPhone: string;

  // Footer Content & Dynamic Reorderable Links
  footerCopyrightText: string;
  footerAboutText: string;
  footerLinks: FooterLinkItem[];

  // Social Media Links
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
  };

  // Execution & Cron settings matching screenshot
  numberOfMailsForExecution: number;
  reviewFeedCronDays: number;
  googleMerchantCronDays: number;
  mailPerExecutionFrequency: number;
  unpaidOrderEmailDailyCount: number;
  unpaidOrderEmailTimeLapseMinutes: number;
  numberOfSmsForExecution: number;
  debugModeEnabled: boolean;
  emailVerificationEnabled: boolean;
  autoCancelDays: number;
  handlingCharge: number;
  freeShippingThreshold: number;

  updatedAt: string;
}

export interface ManufacturerRecord {
  id: string;
  accountNumber: string;
  name: string;
  companyName?: string;
  contactName: string;
  email: string;
  phone?: string;
  fax?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  showAdvanced?: boolean;
  advancedOptions?: {
    leadTimeDays?: number;
    taxId?: string;
    defaultWarehouse?: string;
    shippingNotes?: string;
  };
  warehouses?: WarehouseRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseRecord {
  id: string;
  accountNumber: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  fax?: string;
  shipstationWarehouse?: string;
  sellbriteWarehouse?: string;
  isActive: boolean;
  manufacturerId?: string;
  createdAt: string;
  updatedAt: string;
}


export interface StorageSettingsRecord {
  provider: "local" | "s3";
  s3Enabled: boolean;
  s3Region?: string;
  s3Bucket?: string;
  s3AccessKeyId?: string;
  s3SecretAccessKey?: string;
  cloudfrontUrl?: string;
  updatedAt?: string;
}

export interface WarehouseInventoryRecord {
  id: string;
  productId: string;
  warehouseId: string;
  productName?: string;
  productSku?: string;
  warehouseName?: string;
  availableQuantity: number;
  reservedQuantity: number;
  reorderLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovementRecord {
  id: string;
  productId: string;
  warehouseId: string;
  productName?: string;
  warehouseName?: string;
  type: "STOCK_ADD" | "RESERVATION" | "DISPATCH" | "RETURN" | "ADJUSTMENT" | "RELEASE";
  quantity: number;
  previousAvailable: number;
  newAvailable: number;
  previousReserved: number;
  newReserved: number;
  referenceId?: string; // orderId, shipmentId, manual
  notes?: string;
  createdAt: string;
}

export interface MailConfigurationRecord {
  id?: string;
  isEnabled: boolean;
  defaultFromName: string;
  defaultFromEmail: string;
  defaultReplyName?: string | null;
  defaultReplyTo?: string | null;
  transportMethod: "SMTP" | "SENDMAIL" | "SES" | "SIMULATED";
  server: string;
  port: number;
  secureSocketType: "TLS" | "SSL" | "NONE";
  authType: "LOGIN" | "PLAIN" | "CRAM-MD5";
  username: string;
  password?: string | null;
  contactUsEmail: string;
  ccMailOption: boolean;
  ccEmailAddresses: string[];
  updatedAt?: string;
}

export interface EmailTemplateRecord {
  id: string;
  code: string;
  title: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string | null;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountRecord {
  id: string;
  itemNo: string; // SKU
  productId?: string;
  productName: string;
  discountType: "%" | "$" | "PERCENT" | "FIXED";
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemRecord {
  id: string;
  orderId: string;
  productId?: string;
  variantId?: string | null;
  variantAttributes?: Record<string, string>;
  itemNo: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface AddressRecord {
  id: string;
  userId?: string;
  customerEmail?: string;
  type: "billing" | "shipping";
  name: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  warehouseId?: string | null;
  orderDate: string;
  gateway: string; // "Razorpay" | "PayPal" | "Paytm" | "Stripe" | "Authorize.net" | "Braintree" | "COD"
  gatewayCode?: string;
  paymentStatus: "Paid" | "Pending" | "Failed" | "Cancelled";
  orderStatus: "Cancelled By System" | "Paid" | "Delivered" | "Pending" | "Shipped" | "Processing";
  totalPrice: number;
  subtotal: number;
  shippingCost: number;
  taxAmount?: number;
  handlingCharge?: number;
  adjustmentPrice?: number;
  couponCode?: string;
  couponDiscount?: number;
  shippingAddress?: string;
  billingAddress?: string;
  shippingAddressDetail?: AddressRecord;
  billingAddressDetail?: AddressRecord;
  items: OrderItemRecord[];
  orderHistory?: {
    timestamp: string;
    action: string;
    performedBy: string;
    notes?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  paymentTransactionId?: string;
  gatewayOrderId?: string;
  paidAt?: string;
  paymentDetails?: any;
  trackingNumber?: string;
  carrier?: string;
  shipmentStatus?: "Pending" | "Ready to Ship" | "Shipped" | "In Transit" | "Out for Delivery" | "Delivered" | "Cancelled" | "Returned";
  shippedAt?: string;
  estimatedDelivery?: string;
}

export interface PaymentGatewayRecord {
  id: string;
  name: string;
  code: string; // razorpay, paypal, paytm, authorizenet, braintree, stripe, cod
  cardTypes: string[]; // ["VISA", "Mastercard", "AMEX", "Discover", "Diners Club", "JCB", "enRoute"]
  isDefault: boolean;
  isCreditCard: boolean;
  isActive: boolean;
  environment: "sandbox" | "live";
  credentials: Record<string, string>; // apiKey, secretKey, merchantId, keyId, etc.
  description?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  category: "deal" | "offer" | "order" | "system";
  badge?: string;
  icon?: string;
  imageUrl?: string;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  isRead?: boolean;
}


export interface ShippingProviderRecord {
  id: string;
  name: string;
  code: string; // shiprocket, nimbuspost, delhivery, or custom
  apiBaseUrl: string;
  credentials: Record<string, any> | string;
  settings: Record<string, any>;
  isEnabled: boolean;
  isDefault: boolean;
  pickupLocation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentRecord {
  id: string;
  orderId: string;
  orderNumber?: string;
  shippingProviderId?: string;
  shippingProviderName?: string;
  shippingProviderCode?: string;
  providerShipmentId?: string;
  awbNumber?: string;
  trackingUrl?: string;
  shippingCharge: number;
  shipmentStatus:
    | "Pending"
    | "Ready to Ship"
    | "Shipped"
    | "In Transit"
    | "Out for Delivery"
    | "Delivered"
    | "Cancelled"
    | "Returned";
  shippingLabelPath?: string;
  recipientName?: string;
  recipientPhone?: string;
  shippingAddress?: string;
  warehouseId?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  carrier?: string;
  shippedAt?: string;
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingSettingsRecord {
  defaultProviderId?: string;
  defaultProviderCode?: string;
  autoDispatch: boolean;
  allowManualDispatch: boolean;
  freeShippingThreshold: number;
  defaultWeightKg: number;
  senderAddress: {
    contactName: string;
    companyName: string;
    addressLine: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
  };
  trackingNotificationEmail: boolean;
  trackingNotificationSms: boolean;
  codAvailability: boolean;
  codExtraCharge: number;
  updatedAt: string;
}

export interface ShippingZoneRecord {
  id: string;
  name: string;
  zoneType: "local" | "regional" | "national" | "special";
  pincodePrefixes: string[];
  baseRate: number;
  additionalPerKg: number;
  estimatedDeliveryDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeDesignSettings {
  storeName?: string;
  storeTagline?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  headingFont: string;
  headerStyle: "modern" | "classic" | "minimal";
  footerStyle: "standard" | "compact" | "detailed";
  announcementBar: {
    enabled: boolean;
    text: string;
    link?: string;
    bgColor: string;
    textColor: string;
  };
}

export interface ThemeSectionsOrder {
  heroSlider: boolean;
  popularCategories: boolean;
  todaysDeals: boolean;
  promoBanners: boolean;
  winterWear: boolean;
  recentlyViewed: boolean;
  order: string[];
}

export interface ThemeIntegrations {
  captchaEnabled: boolean;
  microsoftUetTag?: string;
  metaPixelId?: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
}

export interface ThemeConfigRecord {
  design: ThemeDesignSettings;
  sections: ThemeSectionsOrder;
  integrations: ThemeIntegrations;
  customCss?: string;
}

export interface ThemeRecord {
  id: string;
  name: string;
  slug: string;
  version: string;
  thumbnail: string;
  description: string;
  author: string;
  isActive: boolean;
  isSystem: boolean;
  zipFileName?: string;
  config: ThemeConfigRecord;
  createdAt: string;
  updatedAt: string;
}

export interface PricingSettingsRecord {
  strikeThroughPricing: boolean;
  priceSync: boolean;
  priceRounding: boolean;
  defaultAdjustmentType: "%" | "$";
  defaultAdjustmentValue: number;
  updatedAt: string;
}

export interface ReviewMediaItem {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  name?: string;
  size?: number;
}

export interface ReviewCommentRecord {
  id: string;
  reviewId: string;
  userName: string;
  userEmail: string;
  comment: string;
  isAdmin?: boolean;
  createdAt: string;
}

export interface ReviewRecord {
  id: string;
  productId?: string;
  itemNo: string;
  productName: string;
  userName: string;
  userEmail: string;
  rating: number; // 1 - 5
  review: string;
  commentCount: number;
  media?: ReviewMediaItem[];
  comments?: ReviewCommentRecord[];
  status: "Active" | "Inactive" | "Pending";
  postedOn: string;
  createdAt: string;
  updatedAt: string;
}

export interface QnaAnswerRecord {
  id: string;
  qnaId: string;
  userName: string;
  userEmail: string;
  answer: string;
  isOfficial: boolean;
  createdAt: string;
}

export interface QnaRecord {
  id: string;
  productId?: string;
  itemNo: string;
  productName: string;
  userName: string;
  userEmail: string;
  question: string;
  rating: number; // 1 - 5
  answersCount: number;
  answers?: QnaAnswerRecord[];
  status: "Active" | "Inactive";
  postedOn: string;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistRecord {
  id: string;
  productId?: string;
  itemNo: string;
  name: string;
  productImage?: string;
  totalQuantity: number;
  wishlistCount: number;
  userIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CouponRecord {
  id: string;
  code: string;
  couponType: string;
  discountPercentage: number;
  discountAmount: number;
  minAmount: number;
  expiryDate?: string;
  usageLimit: number;
  usedCount: number;
  usageLimitPerCustomer: number;
  selectedUsers?: string[];
  selectedTemplate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  orderNumber?: string;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  paymentGateway: string; // Razorpay, Paytm, PayPal, COD, etc.
  gatewayOrderId?: string;
  transactionId?: string;
  paymentMethod?: string; // Card, UPI, NetBanking, Wallet, COD, etc.
  amount: number;
  currency: string;
  paymentStatus: "Pending" | "Processing" | "Paid" | "Failed" | "Cancelled" | "Refunded";
  gatewayResponse?: Record<string, any>;
  failureReason?: string;
  refundAmount?: number;
  refundReference?: string;
  refundReason?: string;
  refundedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartRecord {
  id: string;
  userId?: string;
  sessionId?: string;
  status: "active" | "merged" | "ordered" | "abandoned";
  createdAt: string;
  updatedAt: string;
}

export interface CartItemRecord {
  id: string;
  cartId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  selectedAttributes?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface SettingItemRecord {
  id: string;
  key: string;
  context?: string | null;
  value: any;
  createdAt: string;
  updatedAt: string;
}

export interface SocialAuthSettings {
  google: {
    enabled: boolean;
    clientId: string;
    clientSecret?: string;
    redirectUri?: string;
  };
  github: {
    enabled: boolean;
    clientId: string;
    clientSecret?: string;
    redirectUri?: string;
  };
  facebook: {
    enabled: boolean;
    clientId: string;
    appSecret?: string;
    redirectUri?: string;
  };
}

interface LocalDatabaseSchema {
  users: UserRecord[];
  assets: AssetRecord[];
  categories: CategoryRecord[];
  products: ProductRecord[];
  variants?: ProductVariantRecord[];
  roles: RoleRecord[];
  sliders: SliderRecord[];
  menuItems: MenuItemRecord[];
  settings?: SiteSettingsRecord;
  manufacturers?: ManufacturerRecord[];
  warehouses?: WarehouseRecord[];
  discounts?: DiscountRecord[];
  orders?: OrderRecord[];
  payments?: PaymentRecord[];
  carts?: CartRecord[];
  cartItems?: CartItemRecord[];
  pricingSettings?: PricingSettingsRecord;
  reviews?: ReviewRecord[];
  qna?: QnaRecord[];
  wishlist?: WishlistRecord[];
  coupons?: CouponRecord[];
  gateways?: PaymentGatewayRecord[];
  notifications?: NotificationRecord[];
  shippingProviders?: ShippingProviderRecord[];
  shipments?: ShipmentRecord[];
  shippingSettings?: ShippingSettingsRecord;
  shippingZones?: ShippingZoneRecord[];
  warehouseInventory?: WarehouseInventoryRecord[];
  inventoryMovements?: InventoryMovementRecord[];
  storageSettings?: StorageSettingsRecord | null;
  mailConfig?: MailConfigurationRecord | null;
  emailTemplates?: EmailTemplateRecord[];
  themes?: ThemeRecord[];
  addresses?: AddressRecord[];
  reviewAutoApprove?: boolean;
  qnaAutoApprove?: boolean;
  appSettings?: SettingItemRecord[];
  productCategories: { productId: string; categoryId: string; isMain: boolean }[];
  productAssets: { productId: string; assetId: string; isPrimary: boolean; displayOrder?: number }[];
}

export class DatabaseStore {
  private static localDbFile = path.join(process.cwd(), "data", "local-db.json");
  private static isPgAvailable: boolean | null = null;
  private static checkedPg = false;
  private static memoryCache: LocalDatabaseSchema | null = null;
  private static lastMtime = 0;
  private static isSeeded = false;

  private static async testPostgres(): Promise<boolean> {
    if (this.checkedPg && this.isPgAvailable !== null) {
      return this.isPgAvailable;
    }
    try {
      await prisma.$queryRaw`SELECT 1`;
      this.isPgAvailable = true;
    } catch {
      this.isPgAvailable = false;
    }
    this.checkedPg = true;
    return this.isPgAvailable;
  }

  private static async readLocalDb(): Promise<LocalDatabaseSchema> {
    try {
      const stat = await fs.stat(this.localDbFile);
      if (this.memoryCache && stat.mtimeMs <= this.lastMtime) {
        return this.memoryCache;
      }
      this.lastMtime = stat.mtimeMs;
    } catch {
      if (this.memoryCache) return this.memoryCache;
    }

    try {
      const data = await fs.readFile(this.localDbFile, "utf-8");
      const parsed = JSON.parse(data);
      this.memoryCache = {
        users: (parsed.users || []).map((u: any) => {
          if (!u.type) {
            u.type = (u.accountType === "admin" || u.role === "ADMIN" || (u.role && u.role !== "CUSTOMER" && u.accountType !== "customer")) ? "admin" : "customer";
          }
          return u;
        }),
        assets: parsed.assets || [],
        categories: parsed.categories || [],
        products: parsed.products || [],
        variants: parsed.variants || [],
        roles: parsed.roles || [],
        sliders: parsed.sliders || [],
        menuItems: parsed.menuItems || [],
        settings: parsed.settings || this.getDefaultSettings(),
        manufacturers: parsed.manufacturers || [],
        warehouses: parsed.warehouses || [],
        discounts: parsed.discounts || [],
        orders: parsed.orders || [],
        payments: parsed.payments || [],
        carts: parsed.carts || [],
        cartItems: parsed.cartItems || [],
        pricingSettings: parsed.pricingSettings || undefined,
        reviews: parsed.reviews || [],
        qna: parsed.qna || [],
        wishlist: parsed.wishlist || [],
        coupons: parsed.coupons || [],
        gateways: parsed.gateways || [],
        shippingProviders: parsed.shippingProviders || [],
        shipments: parsed.shipments || [],
        shippingSettings: parsed.shippingSettings || null,
        shippingZones: parsed.shippingZones || [],
        warehouseInventory: parsed.warehouseInventory || [],
        inventoryMovements: parsed.inventoryMovements || [],
        storageSettings: parsed.storageSettings || null,
        mailConfig: parsed.mailConfig || null,
        emailTemplates: parsed.emailTemplates || [],
        themes: parsed.themes || [],
        addresses: parsed.addresses || [],
        reviewAutoApprove: parsed.reviewAutoApprove ?? true,
        qnaAutoApprove: parsed.qnaAutoApprove ?? true,
        appSettings: parsed.appSettings || [],
        productCategories: parsed.productCategories || [],
        productAssets: parsed.productAssets || [],
      };
      return this.memoryCache!;
    } catch {
      try {
        const tmpFile = path.join(os.tmpdir(), "ecommerce-local-db.json");
        const data = await fs.readFile(tmpFile, "utf-8");
        const parsed = JSON.parse(data);
        this.memoryCache = {
          users: (parsed.users || []).map((u: UserRecord) => {
            if (!u.type) {
              u.type = (u.accountType === "admin" || u.role === "ADMIN" || (u.role && u.role !== "CUSTOMER" && u.accountType !== "customer")) ? "admin" : "customer";
            }
            return u;
          }),
          assets: parsed.assets || [],
          categories: parsed.categories || [],
          products: parsed.products || [],
          variants: parsed.variants || [],
          roles: parsed.roles || [],
          sliders: parsed.sliders || [],
          menuItems: parsed.menuItems || [],
          settings: parsed.settings || this.getDefaultSettings(),
          manufacturers: parsed.manufacturers || [],
          warehouses: parsed.warehouses || [],
          discounts: parsed.discounts || [],
          orders: parsed.orders || [],
          payments: parsed.payments || [],
          carts: parsed.carts || [],
          cartItems: parsed.cartItems || [],
          pricingSettings: parsed.pricingSettings || undefined,
          reviews: parsed.reviews || [],
          qna: parsed.qna || [],
          wishlist: parsed.wishlist || [],
          coupons: parsed.coupons || [],
          gateways: parsed.gateways || [],
          shippingProviders: parsed.shippingProviders || [],
          shipments: parsed.shipments || [],
          shippingSettings: parsed.shippingSettings || null,
          shippingZones: parsed.shippingZones || [],
          warehouseInventory: parsed.warehouseInventory || [],
          inventoryMovements: parsed.inventoryMovements || [],
          storageSettings: parsed.storageSettings || null,
          mailConfig: parsed.mailConfig || null,
          emailTemplates: parsed.emailTemplates || [],
          themes: parsed.themes || [],
          addresses: parsed.addresses || [],
          reviewAutoApprove: parsed.reviewAutoApprove ?? true,
          qnaAutoApprove: parsed.qnaAutoApprove ?? true,
          appSettings: parsed.appSettings || [],
          productCategories: parsed.productCategories || [],
          productAssets: parsed.productAssets || [],
        };
        return this.memoryCache!;
      } catch {
        const initial: LocalDatabaseSchema = {
          users: [],
          assets: [],
          categories: [],
          products: [],
          variants: [],
          roles: [],
          sliders: [],
          menuItems: [],
          settings: this.getDefaultSettings(),
          manufacturers: [],
          warehouses: [],
          discounts: [],
          orders: [],
          payments: [],
          carts: [],
          cartItems: [],
          reviews: [],
          qna: [],
          wishlist: [],
          coupons: [],
          gateways: [],
          themes: [],
          addresses: [],
          appSettings: [],
          productCategories: [],
          productAssets: [],
        };
        this.memoryCache = initial;
        await this.writeLocalDb(initial);
        return initial;
      }
    }
  }

  private static async writeLocalDb(data: LocalDatabaseSchema): Promise<void> {
    this.memoryCache = data;

    try {
      await fs.mkdir(path.dirname(this.localDbFile), { recursive: true });
      await fs.writeFile(this.localDbFile, JSON.stringify(data, null, 2), "utf-8");
      try { const stat = await fs.stat(this.localDbFile); this.lastMtime = stat.mtimeMs; } catch {}
      return;
    } catch {
      try {
        const tmpFile = path.join(os.tmpdir(), "ecommerce-local-db.json");
        await fs.writeFile(tmpFile, JSON.stringify(data, null, 2), "utf-8");
      } catch {
        // kept in memoryCache safely
      }
    }
  }

  // ================= USERS =================

  public static async findUserByEmail(email: string): Promise<UserRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    const localUser = (db.users || []).find((u) => u.email.toLowerCase() === email.toLowerCase());

    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const u = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (u) {
          return {
            ...(localUser || {}),
            ...u,
            role: localUser?.role || (typeof u.role === "string" ? u.role : "ADMIN"),
            type: localUser?.type || (u.role === "ADMIN" ? "admin" : "customer"),
            accountType: localUser?.accountType || (u.role === "ADMIN" ? "admin" : "customer"),
            customerType: localUser?.customerType || (u.role === "ADMIN" ? "Admin" : "Customer"),
            createdAt: u.createdAt.toISOString(),
            updatedAt: u.updatedAt.toISOString(),
          };
        }
      } catch {
        // Fall back
      }
    }
    return localUser || null;
  }

  public static async findUserById(id: string): Promise<UserRecord | null> {
    const db = await this.readLocalDb();
    const localUser = (db.users || []).find((u) => u.id === id || u.email.toLowerCase() === id.toLowerCase());

    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const u = await prisma.user.findUnique({ where: { id } });
        if (u) {
          return {
            ...(localUser || {}),
            ...u,
            role: localUser?.role || (typeof u.role === "string" ? u.role : "ADMIN"),
            type: localUser?.type || (u.role === "ADMIN" ? "admin" : "customer"),
            accountType: localUser?.accountType || (u.role === "ADMIN" ? "admin" : "customer"),
            customerType: localUser?.customerType || (u.role === "ADMIN" ? "Admin" : "Customer"),
            createdAt: u.createdAt.toISOString(),
            updatedAt: u.updatedAt.toISOString(),
          };
        }
      } catch {
        // Fall back
      }
    }
    return localUser || null;
  }

  public static async createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    mobileNumber?: string;
    countryCode?: string;
    phone?: string;
    country?: string;
    state?: string;
    city?: string;
    postalCode?: string;
    streetAddress?: string;
    apartment?: string;
    accountType?: "admin" | "customer" | "both" | "manager" | "staff";
    customerType?: "Customer" | "Admin" | "Both" | "Customer (Guest)" | "Wholesale" | "VIP";
    type?: "admin" | "customer" | "both";
  }): Promise<UserRecord> {
    const db = await this.readLocalDb();
    const isBoth = (data as any).type === "both" || data.accountType === "both" || data.customerType === "Both";
    const isCustomer = !isBoth && ((data.role || "").toUpperCase() === "CUSTOMER" || data.accountType === "customer" || (data as any).type === "customer");
    const newUser: UserRecord = {
      id: "usr_" + Math.random().toString(36).substring(2, 11),
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      role: data.role || (isBoth ? "ADMIN" : isCustomer ? "CUSTOMER" : "ADMIN"),
      type: isBoth ? "both" : isCustomer ? "customer" : "admin",
      avatar: null,
      accountType: data.accountType || (isBoth ? "both" : isCustomer ? "customer" : "admin"),
      customerType: data.customerType || (isBoth ? "Both" : isCustomer ? "Customer" : "Admin"),
      mobileNumber: data.mobileNumber || data.phone || "",
      phone: data.phone || data.mobileNumber || "",
      countryCode: data.countryCode || "+1",
      country: data.country || "",
      state: data.state || "",
      city: data.city || "",
      postalCode: data.postalCode || "",
      streetAddress: data.streetAddress || "",
      apartment: data.apartment || "",
      address: data.streetAddress ? `${data.streetAddress}${data.apartment ? ", " + data.apartment : ""}, ${data.city || ""}, ${data.state || ""}` : "",
      shippingAddress: data.streetAddress ? `${data.streetAddress}${data.apartment ? ", " + data.apartment : ""}, ${data.city || ""}, ${data.state || ""}` : "",
      credit: 0,
      status: "ACTIVE",
      ordersCount: 0,
      wishlistCount: 0,
      emailVerified: true,
      phoneVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.users.push(newUser);

    // If customer registration included an address, also auto-create default shipping & billing address records!
    if (data.streetAddress && data.city) {
      if (!db.addresses) db.addresses = [];
      const primaryAddress: AddressRecord = {
        id: "addr_" + Math.random().toString(36).substring(2, 9),
        userId: newUser.id,
        customerEmail: newUser.email,
        type: "shipping",
        name: newUser.name,
        addressLine1: data.streetAddress,
        addressLine2: data.apartment || "",
        country: data.country || "India",
        state: data.state || "Maharashtra",
        city: data.city || "Mumbai",
        postalCode: data.postalCode || "400001",
        phone: data.mobileNumber || data.phone || "",
        isDefault: true,
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.addresses.push(primaryAddress);

      const billingAddr: AddressRecord = {
        ...primaryAddress,
        id: "addr_" + Math.random().toString(36).substring(2, 9),
        type: "billing",
      };
      db.addresses.push(billingAddr);
    }

    await this.writeLocalDb(db);
    return newUser;
  }

  public static async updateUser(
    id: string,
    data: Partial<Omit<UserRecord, "id" | "createdAt" | "updatedAt">>
  ): Promise<UserRecord | null> {
    const db = await this.readLocalDb();
    const index = db.users.findIndex((u) => u.id === id || u.email.toLowerCase() === id.toLowerCase());
    if (index === -1) return null;

    db.users[index] = {
      ...db.users[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.writeLocalDb(db);
    return db.users[index];
  }

  public static async findUserByResetToken(token: string): Promise<UserRecord | null> {
    const db = await this.readLocalDb();
    const now = new Date().toISOString();
    return (
      db.users.find(
        (u) =>
          u.resetPasswordToken === token &&
          u.resetPasswordExpires &&
          u.resetPasswordExpires > now
      ) || null
    );
  }

  // ================= ASSETS =================

  public static async findAssets(params: {
    search?: string;
    fileType?: string;
    storage?: string;
    folder?: string;
    sort?: "recent" | "oldest" | "name_asc" | "name_desc" | "size_desc";
    page?: number;
    pageSize?: number;
  }): Promise<{ items: AssetRecord[]; total: number }> {
    const { search = "", fileType = "all", storage = "all", sort = "recent", page = 1, pageSize = 24 } = params;

    const db = await this.readLocalDb();
    let filtered = [...db.assets];

    if (fileType && fileType !== "all") {
      filtered = filtered.filter((a) => a.fileType.toLowerCase() === fileType.toLowerCase());
    }

    if (storage && storage !== "all") {
      if (storage === "s3") {
        filtered = filtered.filter((a) => a.storageProvider === "s3");
      } else if (storage === "local") {
        filtered = filtered.filter((a) => a.storageProvider !== "s3");
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.originalName.toLowerCase().includes(q) ||
          a.fileName.toLowerCase().includes(q)
      );
    }

    if (sort === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === "name_asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "name_desc") {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sort === "size_desc") {
      filtered.sort((a, b) => b.size - a.size);
    }

    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    return {
      items: paginated.map((item) => {
        const isS3 = item.storageProvider === "s3" || (item.url && (item.url.includes("s3") || item.url.includes("cloudfront")));
        return {
          ...item,
          storageProvider: isS3 ? ("s3" as const) : ("local" as const),
          productCount: db.productAssets.filter((pa) => pa.assetId === item.id).length,
        };
      }),
      total,
    };
  }

  public static async findAssetById(id: string): Promise<AssetRecord | null> {
    const db = await this.readLocalDb();
    const item = db.assets.find((a) => a.id === id);
    if (!item) return null;
    const isS3 = item.storageProvider === "s3" || (item.url && (item.url.includes("s3") || item.url.includes("cloudfront")));
    return {
      ...item,
      storageProvider: isS3 ? ("s3" as const) : ("local" as const),
      productCount: db.productAssets.filter((pa) => pa.assetId === id).length,
    };
  }

  public static async createAsset(data: {
    name: string;
    fileName: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    fileType: AssetType;
    thumbnailUrl?: string;
    altText?: string;
    caption?: string;
    uploaderId?: string;
    tags?: string[];
    storageProvider?: "local" | "s3";
    storageKey?: string;
    s3SyncedAt?: string;
  }): Promise<AssetRecord> {
    const db = await this.readLocalDb();
    const newAsset: AssetRecord = {
      id: "ast_" + Math.random().toString(36).substring(2, 11),
      name: data.name,
      fileName: data.fileName,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
      url: data.url,
      thumbnailUrl: data.thumbnailUrl || null,
      fileType: data.fileType,
      altText: data.altText || null,
      caption: data.caption || null,
      folder: "default",
      tags: data.tags || [],
      uploaderId: data.uploaderId || null,
      storageProvider: data.storageProvider || "local",
      storageKey: data.storageKey || undefined,
      s3SyncedAt: data.s3SyncedAt || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      productCount: 0,
    };

    db.assets.unshift(newAsset);
    await this.writeLocalDb(db);
    return newAsset;
  }

  public static async updateAsset(
    id: string,
    data: Partial<Pick<AssetRecord, "name" | "altText" | "caption" | "tags" | "url" | "storageProvider" | "storageKey" | "s3SyncedAt">>
  ): Promise<AssetRecord | null> {
    const db = await this.readLocalDb();
    const index = db.assets.findIndex((a) => a.id === id);
    if (index === -1) return null;

    db.assets[index] = {
      ...db.assets[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await this.writeLocalDb(db);
    return db.assets[index];
  }

  public static async deleteAsset(id: string): Promise<AssetRecord | null> {
    const db = await this.readLocalDb();
    const index = db.assets.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const [deleted] = db.assets.splice(index, 1);
    db.productAssets = db.productAssets.filter((pa) => pa.assetId !== id);
    await this.writeLocalDb(db);
    return deleted;
  }

  public static async deleteManyAssets(ids: string[]): Promise<number> {
    if (!ids.length) return 0;
    const db = await this.readLocalDb();
    const countBefore = db.assets.length;
    db.assets = db.assets.filter((a) => !ids.includes(a.id));
    db.productAssets = db.productAssets.filter((pa) => !ids.includes(pa.assetId));
    await this.writeLocalDb(db);
    return countBefore - db.assets.length;
  }

  // ================= CATEGORIES =================

  public static async findCategories(search?: string): Promise<CategoryRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    let list = [...(db.categories || [])];

    if (search?.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }

    const allProducts = db.products || [];
    const allProductCats = db.productCategories || [];

    // Map children for hierarchical count rollup
    const childrenMap = new Map<string, string[]>();
    (db.categories || []).forEach((cat) => {
      if (cat.parentId) {
        if (!childrenMap.has(cat.parentId)) childrenMap.set(cat.parentId, []);
        childrenMap.get(cat.parentId)!.push(cat.id);
      }
    });

    const getDescendantCategoryIds = (catId: string): Set<string> => {
      const result = new Set<string>([catId]);
      const queue = [catId];
      while (queue.length > 0) {
        const cur = queue.shift()!;
        const kids = childrenMap.get(cur) || [];
        for (const kid of kids) {
          if (!result.has(kid)) {
            result.add(kid);
            queue.push(kid);
          }
        }
      }
      return result;
    };

    return list.map((c) => {
      const catAndDescendantIds = getDescendantCategoryIds(c.id);
      const matchedProductIds = new Set<string>();

      // 1. Direct mapping table
      allProductCats.forEach((pc) => {
        if (catAndDescendantIds.has(pc.categoryId)) {
          matchedProductIds.add(pc.productId);
        }
      });

      // 2. Product categoryIds or categoryNames
      allProducts.forEach((p) => {
        if (p.categoryIds && Array.isArray(p.categoryIds)) {
          if (p.categoryIds.some((cid) => catAndDescendantIds.has(cid) || cid === c.slug)) {
            matchedProductIds.add(p.id);
          }
        }
        if (p.categoryNames && Array.isArray(p.categoryNames)) {
          if (p.categoryNames.some((cn) => cn.toLowerCase() === c.name.toLowerCase())) {
            matchedProductIds.add(p.id);
          }
        }
      });

      return {
        ...c,
        productCount: matchedProductIds.size,
      };
    });
  }

  public static async findCategoryTree(search?: string): Promise<CategoryRecord[]> {
    const flat = await this.findCategories(search);
    if (search?.trim()) return flat;

    const roots: CategoryRecord[] = [];
    const map = new Map<string, CategoryRecord>();

    flat.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    map.forEach((cat) => {
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId)!.children!.push(cat);
      } else {
        roots.push(cat);
      }
    });

    return roots;
  }

  public static async createCategory(data: {
    name: string;
    description?: string;
    parentId?: string | null;
    image?: string | null;
  }): Promise<CategoryRecord> {
    const db = await this.readLocalDb();
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + "-" + Date.now().toString(36);

    let level = 0;
    if (data.parentId) {
      const parent = (db.categories || []).find((c) => c.id === data.parentId);
      if (parent) {
        level = Math.min(2, (parent.level || 0) + 1);
      }
    }

    const newCategory: CategoryRecord = {
      id: "cat_" + Math.random().toString(36).substring(2, 11),
      name: data.name,
      slug,
      description: data.description || null,
      parentId: data.parentId || null,
      image: data.image || null,
      level,
      isActive: true,
      displayOrder: (db.categories || []).length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      productCount: 0,
      children: [],
    };

    if (!db.categories) db.categories = [];
    db.categories.push(newCategory);
    await this.writeLocalDb(db);

    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        await prisma.category.create({
          data: {
            id: newCategory.id,
            name: newCategory.name,
            slug: newCategory.slug,
            description: newCategory.description,
            image: newCategory.image,
            parentId: newCategory.parentId,
            level: newCategory.level,
            isActive: newCategory.isActive,
            displayOrder: newCategory.displayOrder,
          },
        });
      } catch {}
    }

    return newCategory;
  }

  public static async findCategoryById(id: string): Promise<CategoryRecord | null> {
    const db = await this.readLocalDb();
    return (db.categories || []).find((c) => c.id === id) || null;
  }

  public static async updateCategory(
    id: string,
    data: Partial<Pick<CategoryRecord, "name" | "slug" | "description" | "parentId" | "isActive" | "image" | "displayOrder">>
  ): Promise<CategoryRecord | null> {
    const db = await this.readLocalDb();
    const idx = (db.categories || []).findIndex((c) => c.id === id);
    if (idx === -1) return null;

    let level = db.categories[idx].level;
    if (data.parentId !== undefined) {
      if (data.parentId) {
        if (data.parentId === id) {
          throw new Error("A category cannot be its own parent.");
        }
        // Check cycle in descendants
        const getDescendants = (currId: string): string[] => {
          const res: string[] = [];
          (db.categories || []).forEach((c) => {
            if (c.parentId === currId) {
              res.push(c.id, ...getDescendants(c.id));
            }
          });
          return res;
        };
        const descendants = getDescendants(id);
        if (descendants.includes(data.parentId)) {
          throw new Error("Cannot select a descendant subcategory as the parent.");
        }

        const parent = db.categories.find((c) => c.id === data.parentId);
        level = parent ? Math.min(2, (parent.level || 0) + 1) : 0;
      } else {
        level = 0;
      }
    }

    // Auto-update slug if name changed and slug not explicitly provided
    let slug = data.slug !== undefined ? data.slug : db.categories[idx].slug;
    if (data.name && !data.slug && data.name !== db.categories[idx].name) {
      slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }

    db.categories[idx] = {
      ...db.categories[idx],
      ...data,
      slug,
      level,
      updatedAt: new Date().toISOString(),
    };

    await this.writeLocalDb(db);

    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        await prisma.category.update({
          where: { id },
          data: {
            name: db.categories[idx].name,
            slug: db.categories[idx].slug,
            description: db.categories[idx].description,
            parentId: db.categories[idx].parentId,
            image: db.categories[idx].image,
            isActive: db.categories[idx].isActive,
            level: db.categories[idx].level,
          },
        });
      } catch {}
    }

    return db.categories[idx];
  }

  public static async deleteCategory(id: string): Promise<boolean> {
    const db = await this.readLocalDb();
    if (!db.categories) return false;

    const idsToRemove = new Set<string>([id]);
    let addedMore = true;
    while (addedMore) {
      addedMore = false;
      db.categories.forEach((c) => {
        if (c.parentId && idsToRemove.has(c.parentId) && !idsToRemove.has(c.id)) {
          idsToRemove.add(c.id);
          addedMore = true;
        }
      });
    }

    db.categories = db.categories.filter((c) => !idsToRemove.has(c.id));
    db.productCategories = (db.productCategories || []).filter((pc) => !idsToRemove.has(pc.categoryId));

    await this.writeLocalDb(db);
    return true;
  }

  // ================= PRODUCTS =================

  public static async findProducts(params: {
    search?: string;
    categoryId?: string;
    status?: string;
    warehouse?: string;
  } = {}): Promise<ProductRecord[]> {
    await this.seedInitialData();
    const { search = "", categoryId, status, warehouse } = params;

    const db = await this.readLocalDb();
    let list = [...(db.products || [])];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.upc && p.upc.toLowerCase().includes(q))
      );
    }

    if (status && status !== "All") {
      list = list.filter((p) => p.status.toLowerCase() === status.toLowerCase());
    }

    if (warehouse && warehouse !== "all") {
      list = list.filter((p) => p.warehouse === warehouse);
    }

    if (categoryId && categoryId !== "all") {
      const targetCat = (db.categories || []).find(
        (c) => c.id === categoryId || c.slug === categoryId
      );
      const targetCatId = targetCat ? targetCat.id : categoryId;
      const targetCatSlug = targetCat ? targetCat.slug : categoryId;

      const childrenMap = new Map<string, string[]>();
      (db.categories || []).forEach((cat) => {
        if (cat.parentId) {
          if (!childrenMap.has(cat.parentId)) childrenMap.set(cat.parentId, []);
          childrenMap.get(cat.parentId)!.push(cat.id);
        }
      });
      const catIdsToMatch = new Set<string>([targetCatId]);
      const queue = [targetCatId];
      while (queue.length > 0) {
        const cur = queue.shift()!;
        const kids = childrenMap.get(cur) || [];
        for (const k of kids) {
          if (!catIdsToMatch.has(k)) {
            catIdsToMatch.add(k);
            queue.push(k);
          }
        }
      }

      const matchingProductIds = new Set(
        (db.productCategories || [])
          .filter((pc) => catIdsToMatch.has(pc.categoryId))
          .map((pc) => pc.productId)
      );

      list = list.filter(
        (p) =>
          matchingProductIds.has(p.id) ||
          (p.categoryIds && p.categoryIds.some((cid) => catIdsToMatch.has(cid) || cid === targetCatSlug)) ||
          (p.categoryNames &&
            targetCat &&
            p.categoryNames.some((cn) => cn.toLowerCase() === targetCat.name.toLowerCase()))
      );
    }

    const categoryMap = new Map((db.categories || []).map((c) => [c.id, c.name]));
    const assetMap = new Map((db.assets || []).map((a) => [a.id, a]));
    const manufacturerMap = new Map((db.manufacturers || []).map((m) => [m.id, m]));
    const warehouseMap = new Map((db.warehouses || []).map((w) => [w.id, w]));

    return list.map((p) => {
      const pCatLinks = (db.productCategories || []).filter((pc) => pc.productId === p.id);
      const catIds = pCatLinks.map((pc) => pc.categoryId);
      const catNames = catIds.map((cid) => categoryMap.get(cid) || cid);

      const pAssetLinks = (db.productAssets || []).filter((pa) => pa.productId === p.id);
      const pAssets = pAssetLinks
        .map((pa) => {
          const a = assetMap.get(pa.assetId);
          if (!a) return null;
          return {
            id: a.id,
            url: a.url || a.fileUrl || "",
            name: a.name,
            isPrimary: Boolean(pa.isPrimary),
          };
        })
        .filter(Boolean) as { id: string; url: string; name: string; isPrimary: boolean }[];

      const primaryAsset = pAssets.find((a) => a.isPrimary) || pAssets[0];
      const mfg = p.manufacturerId ? manufacturerMap.get(p.manufacturerId) : null;
      const wh = p.warehouseId ? warehouseMap.get(p.warehouseId) : null;
      const pVariants = (db.variants || []).filter((v: ProductVariantRecord) => v.productId === p.id);

      return {
        ...p,
        categoryIds: catIds,
        categoryNames: catNames.length > 0 ? catNames : ["other"],
        assetIds: pAssetLinks.map((pa) => pa.assetId),
        assets: pAssets,
        mainImage: primaryAsset ? primaryAsset.url : (p.mainImage || null),
        manufacturer: mfg || null,
        manufacturerName: mfg ? mfg.name : null,
        warehouseName: wh ? wh.name : (p.warehouse || null),
        hasVariants: pVariants.length > 0 || Boolean(p.hasVariants),
        variants: pVariants.length > 0 ? pVariants : (p.variants || []),
      };
    });
  }

  public static async findProductById(idOrSlug: string): Promise<ProductRecord | null> {
    if (!idOrSlug) return null;
    const products = await this.findProducts();
    const query = idOrSlug.toLowerCase().trim();
    return (
      products.find(
        (p) =>
          (p.id && p.id.toLowerCase() === query) ||
          (p.slug && p.slug.toLowerCase() === query) ||
          (p.sku && p.sku.toLowerCase() === query)
      ) || null
    );
  }

  public static async createProduct(data: {
    sku: string;
    upc?: string;
    name: string;
    description?: string;
    price: number;
    comparePrice?: number;
    costPrice?: number;
    currentStock?: number;
    minStock?: number;
    warehouse?: string;
    warehouseId?: string;
    manufacturerId?: string;
    status?: "ACTIVE" | "DRAFT" | "ARCHIVED";
    brand?: string;
    categoryIds?: string[];
    assetIds?: string[];
    primaryAssetId?: string;

    googleMerchantSync?: boolean;
    googleCategory?: string;
    googleCondition?: string;
    googleBrand?: string;
    googleGtin?: string;
    googleMpn?: string;
    hasVariants?: boolean;
    variantAttributes?: any[];
    variants?: any[];
  }): Promise<ProductRecord> {
    const db = await this.readLocalDb();
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);

    const newProd: ProductRecord = {
      id: "prod_" + Math.random().toString(36).substring(2, 11),
      sku: data.sku,
      upc: data.upc || null,
      name: data.name,
      slug,
      description: data.description || null,
      price: Number(data.price) || 0,
      comparePrice: data.comparePrice ? Number(data.comparePrice) : null,
      costPrice: data.costPrice ? Number(data.costPrice) : null,
      currentStock: data.currentStock !== undefined ? Number(data.currentStock) : 10,
      minStock: data.minStock !== undefined ? Number(data.minStock) : 5,
      warehouse: data.warehouse || "gyanwarehouse",
      warehouseId: data.warehouseId || null,
      manufacturerId: data.manufacturerId || null,
      status: data.status || "ACTIVE",
      isSoldOut: Number(data.currentStock) === 0,
      brand: data.brand || null,

      googleMerchantSync: Boolean(data.googleMerchantSync),
      googleCategory: data.googleCategory || null,
      googleCondition: data.googleCondition || "new",
      googleBrand: data.googleBrand || data.brand || null,
      googleGtin: data.googleGtin || data.upc || null,
      googleMpn: data.googleMpn || data.sku || null,
      googleSyncStatus: data.googleMerchantSync ? "READY" : undefined,
      googleLastSyncedAt: data.googleMerchantSync ? new Date().toISOString() : null,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!db.products) db.products = [];
    db.products.unshift(newProd);

    if (data.categoryIds && data.categoryIds.length) {
      if (!db.productCategories) db.productCategories = [];
      data.categoryIds.forEach((catId, idx) => {
        db.productCategories.push({
          productId: newProd.id,
          categoryId: catId,
          isMain: idx === 0,
        });
      });
    }

    if (data.assetIds && data.assetIds.length) {
      if (!db.productAssets) db.productAssets = [];
      data.assetIds.forEach((astId) => {
        db.productAssets.push({
          productId: newProd.id,
          assetId: astId,
          isPrimary: astId === data.primaryAssetId || (!data.primaryAssetId && astId === data.assetIds![0]),
        });
      });
    }

    await this.writeLocalDb(db);
    return (await this.findProductById(newProd.id))!;
  }

  public static async updateProduct(
    id: string,
    data: Partial<ProductRecord> & {
      categoryIds?: string[];
      assetIds?: string[];
      primaryAssetId?: string;
    }
  ): Promise<ProductRecord | null> {
    const db = await this.readLocalDb();
    const idx = (db.products || []).findIndex((p) => p.id === id);
    if (idx === -1) return null;

    db.products[idx] = {
      ...db.products[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (data.categoryIds !== undefined) {
      db.productCategories = (db.productCategories || []).filter((pc) => pc.productId !== id);
      data.categoryIds.forEach((catId, i) => {
        db.productCategories.push({
          productId: id,
          categoryId: catId,
          isMain: i === 0,
        });
      });
    }

    if (data.assetIds !== undefined) {
      db.productAssets = (db.productAssets || []).filter((pa) => pa.productId !== id);
      data.assetIds.forEach((astId) => {
        db.productAssets.push({
          productId: id,
          assetId: astId,
          isPrimary: astId === data.primaryAssetId || (!data.primaryAssetId && astId === data.assetIds![0]),
        });
      });
    }

    await this.writeLocalDb(db);
    return this.findProductById(id);
  }

  public static async deleteProduct(id: string): Promise<boolean> {
    const db = await this.readLocalDb();
    if (!db.products) return false;

    db.products = db.products.filter((p) => p.id !== id);
    db.productCategories = (db.productCategories || []).filter((pc) => pc.productId !== id);
    db.productAssets = (db.productAssets || []).filter((pa) => pa.productId !== id);

    await this.writeLocalDb(db);
    return true;
  }

  public static async generateGoogleMerchantFeed(): Promise<{
    title: string;
    link: string;
    items: Array<{
      id: string;
      title: string;
      description: string;
      link: string;
      image_link: string;
      availability: string;
      price: string;
      google_product_category: string;
      brand: string;
      gtin: string;
      mpn: string;
      condition: string;
    }>;
  }> {
    const products = await this.findProducts();
    const syncable = products.filter((p) => p.googleMerchantSync);

    return {
      title: "emox Google Merchant Product Feed",
      link: "https://emox.in",
      items: syncable.map((p) => ({
        id: p.sku,
        title: p.name,
        description: p.description || p.name,
        link: `https://emox.in/products/${p.slug}`,
        image_link: p.mainImage || "https://emox.in/placeholder-product.png",
        availability: p.currentStock > 0 && !p.isSoldOut ? "in_stock" : "out_of_stock",
        price: `${p.price.toFixed(2)} USD`,
        google_product_category: p.googleCategory || "Apparel & Accessories > Clothing",
        brand: p.googleBrand || p.brand || "emox",
        gtin: p.googleGtin || p.upc || "",
        mpn: p.googleMpn || p.sku,
        condition: p.googleCondition || "new",
      })),
    };
  }

  // ================= ROLES & PERMISSIONS =================

  public static async findRoles(): Promise<RoleRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    const users = db.users || [];
    return (db.roles || []).map((role) => {
      const userCount = users.filter((u) => {
        if (u.assignedRoles && Array.isArray(u.assignedRoles)) {
          return u.assignedRoles.some(
            (ar) =>
              ar.toLowerCase() === role.name.toLowerCase() ||
              ar.toLowerCase() === role.slug.toLowerCase()
          );
        }
        return (
          u.roleId === role.id ||
          u.role?.toLowerCase() === role.slug.toLowerCase()
        );
      }).length;

      return {
        ...role,
        status: role.status || "Active",
        screenPrivilegesCount:
          role.screenPrivilegesCount ||
          Object.keys(role.permissions || {}).length ||
          1,
        userCount,
      };
    });
  }

  public static async findRoleById(id: string): Promise<RoleRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    const role = (db.roles || []).find((r) => r.id === id || r.slug === id);
    if (!role) return null;

    const users = db.users || [];
    const userCount = users.filter((u) => {
      if (u.assignedRoles && Array.isArray(u.assignedRoles)) {
        return u.assignedRoles.some(
          (ar) =>
            ar.toLowerCase() === role.name.toLowerCase() ||
            ar.toLowerCase() === role.slug.toLowerCase()
        );
      }
      return (
        u.roleId === role.id ||
        u.role?.toLowerCase() === role.slug.toLowerCase()
      );
    }).length;

    return {
      ...role,
      status: role.status || "Active",
      screenPrivilegesCount:
        role.screenPrivilegesCount ||
        Object.keys(role.permissions || {}).length ||
        1,
      userCount,
    };
  }

  public static async createRole(data: {
    name: string;
    description?: string;
    status?: "Active" | "Inactive";
    screenPrivilegesCount?: number;
    permissions: Record<string, any>;
  }): Promise<RoleRecord> {
    const db = await this.readLocalDb();
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const newRole: RoleRecord = {
      id: "role_" + Math.random().toString(36).substring(2, 9),
      name: data.name,
      slug,
      description: data.description || "",
      isSystem: false,
      status: data.status || "Active",
      screenPrivilegesCount: data.screenPrivilegesCount || Object.keys(data.permissions || {}).length || 1,
      permissions: data.permissions || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!db.roles) db.roles = [];
    db.roles.push(newRole);
    await this.writeLocalDb(db);
    return newRole;
  }

  public static async updateRole(
    id: string,
    data: Partial<Pick<RoleRecord, "name" | "description" | "permissions" | "status" | "screenPrivilegesCount">>
  ): Promise<RoleRecord | null> {
    const db = await this.readLocalDb();
    const index = (db.roles || []).findIndex((r) => r.id === id);
    if (index === -1) return null;

    db.roles[index] = {
      ...db.roles[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.writeLocalDb(db);
    return db.roles[index];
  }

  public static async deleteRole(id: string): Promise<boolean> {
    const db = await this.readLocalDb();
    if (!db.roles) return false;

    const role = db.roles.find((r) => r.id === id);
    if (!role || role.isSystem) return false;

    db.roles = db.roles.filter((r) => r.id !== id);
    await this.writeLocalDb(db);
    return true;
  }

  public static async findRoleEmployees(): Promise<{
    employees: UserRecord[];
    stats: {
      totalEmployees: number;
      rolesConfigured: number;
      unassigned: number;
      availableRoles: number;
    };
  }> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    const allUsers = db.users || [];

    // Return users (customers & staff) for Customer Role assignment
    const employees = allUsers;

    const roles = await this.findRoles();
    const activeRoles = roles.filter((r) => (r.status || "Active") === "Active");

    const rolesConfigured = employees.filter(
      (e) => (e.assignedRoles && e.assignedRoles.length > 0) || (e.roleId && e.roleId.trim() !== "")
    ).length;
    const unassigned = employees.filter(
      (e) => (!e.assignedRoles || e.assignedRoles.length === 0) && (!e.roleId || e.roleId.trim() === "")
    ).length;

    return {
      employees,
      stats: {
        totalEmployees: employees.length,
        rolesConfigured,
        unassigned,
        availableRoles: activeRoles.length || 9,
      },
    };
  }

  public static async findRoleEmployeeById(id: string): Promise<UserRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    const employee = (db.users || []).find(
      (u) => u.id === id || u.empId?.toLowerCase() === id.toLowerCase() || u.email?.toLowerCase() === id.toLowerCase()
    );
    return employee || null;
  }

  public static async updateEmployeeRoles(
    id: string,
    assignedRoles: string[]
  ): Promise<UserRecord | null> {
    const db = await this.readLocalDb();
    const index = (db.users || []).findIndex(
      (u) => u.id === id || u.empId?.toLowerCase() === id.toLowerCase() || u.email?.toLowerCase() === id.toLowerCase()
    );
    if (index === -1) return null;

    db.users[index] = {
      ...db.users[index],
      assignedRoles,
      updatedAt: new Date().toISOString(),
    };

    await this.writeLocalDb(db);
    return db.users[index];
  }

  public static async getUserPermissions(userId: string): Promise<Record<string, PermissionSet>> {
    const db = await this.readLocalDb();
    const user = (db.users || []).find((u) => u.id === userId);
    if (!user) return {};

    const roles = db.roles || [];
    const role = roles.find((r) => r.id === user.roleId || r.slug.toLowerCase() === user.role?.toLowerCase());
    return role ? role.permissions : {};
  }

  // ================= CUSTOMERS & USERS =================

  public static async findCustomers(params: {
    search?: string;
    accountType?: string;
    customerType?: string;
    status?: string;
  } = {}): Promise<UserRecord[]> {
    await this.seedInitialData();
    const { search = "", accountType = "All", customerType = "All", status = "All" } = params;
    const db = await this.readLocalDb();
    let list = [...(db.users || [])];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.name.toLowerCase().includes(q) ||
          (u.firstName && u.firstName.toLowerCase().includes(q)) ||
          (u.lastName && u.lastName.toLowerCase().includes(q)) ||
          (u.mobileNumber && u.mobileNumber.toLowerCase().includes(q)) ||
          (u.phone && u.phone.toLowerCase().includes(q))
      );
    }

    if (accountType && accountType !== "All") {
      list = list.filter((u) => (u.accountType || u.role?.toLowerCase()) === accountType.toLowerCase());
    }

    if (customerType && customerType !== "All") {
      list = list.filter((u) => u.customerType?.toLowerCase() === customerType.toLowerCase());
    }

    if (status && status !== "All") {
      list = list.filter((u) => u.status === status);
    }

    const allOrders = db.orders || [];
    const allAddresses = db.addresses || [];

    // Attach addresses and orders count
    return list.map((u) => {
      const userOrders = allOrders.filter(
        (o) => o.customerEmail?.toLowerCase() === u.email?.toLowerCase() || (o as any).userId === u.id
      );
      const userAddresses = allAddresses.filter(
        (a) => a.userId === u.id || a.customerEmail?.toLowerCase() === u.email?.toLowerCase()
      );
      return {
        ...u,
        phone: u.phone || u.mobileNumber || "",
        mobileNumber: u.mobileNumber || u.phone || "",
        ordersCount: userOrders.length,
        addresses: userAddresses,
      } as UserRecord;
    });
  }

  public static async findCustomerById(id: string): Promise<(UserRecord & { addresses?: AddressRecord[]; orders?: OrderRecord[] }) | null> {
    const db = await this.readLocalDb();
    const user = (db.users || []).find((u) => u.id === id || u.email?.toLowerCase() === id.toLowerCase());
    if (!user) return null;

    const userOrders = (db.orders || []).filter(
      (o) => o.customerEmail?.toLowerCase() === user.email?.toLowerCase() || (o as any).userId === user.id
    );
    const userAddresses = (db.addresses || []).filter(
      (a) => a.userId === user.id || a.customerEmail?.toLowerCase() === user.email?.toLowerCase()
    );

    return {
      ...user,
      phone: user.phone || user.mobileNumber || "",
      mobileNumber: user.mobileNumber || user.phone || "",
      ordersCount: userOrders.length,
      addresses: userAddresses,
      orders: userOrders,
    };
  }

  public static async createCustomer(data: {
    email: string;
    firstName: string;
    lastName?: string;
    name?: string;
    phone?: string;
    mobileNumber?: string;
    password?: string;
    accountType?: "admin" | "customer" | "both" | "manager" | "staff";
    customerType?: "Customer" | "Admin" | "Both" | "Customer (Guest)" | "Wholesale" | "VIP";
    type?: "admin" | "customer" | "both";
    country?: string;
    countryCode?: string;
    state?: string;
    city?: string;
    postalCode?: string;
    streetAddress?: string;
    apartment?: string;
    address?: string;
    shippingAddress?: string;
    billingAddressDetail?: Partial<AddressRecord>;
    shippingAddressDetail?: Partial<AddressRecord>;
    credit?: number;
    roleId?: string;
    assignedRoles?: string[];
    status?: "ACTIVE" | "INACTIVE" | "PENDING_APPROVAL";
  }): Promise<UserRecord> {
    const db = await this.readLocalDb();
    const fullName = data.name || `${data.firstName} ${data.lastName || ""}`.trim();
    const phone = data.mobileNumber || data.phone || "";

    const rawType = ((data as any).type || data.accountType || data.customerType || "customer").toString().toLowerCase();
    let computedType: "admin" | "customer" | "both" = "customer";
    let computedAccountType: "admin" | "customer" | "both" = "customer";
    let computedCustomerType = data.customerType || "Customer";
    let computedRole = "CUSTOMER";
    let computedRoleId = data.roleId || "";
    let computedAssignedRoles = data.assignedRoles || (data.roleId ? [data.roleId] : []);

    if (rawType === "both" || data.customerType === "Both") {
      computedType = "both";
      computedAccountType = "both";
      computedCustomerType = "Both";
      computedRole = "ADMIN";
    } else if (rawType === "admin" || data.customerType === "Admin" || data.accountType === "admin") {
      computedType = "admin";
      computedAccountType = "admin";
      computedCustomerType = "Admin";
      computedRole = "ADMIN";
    } else {
      computedType = "customer";
      computedAccountType = "customer";
      computedCustomerType = "Customer";
      computedRole = "CUSTOMER";
      computedRoleId = "";
      computedAssignedRoles = [];
    }

    const newCustomer: UserRecord = {
      id: "usr_" + Math.random().toString(36).substring(2, 10),
      email: data.email.toLowerCase().trim(),
      name: fullName,
      firstName: data.firstName || fullName.split(" ")[0] || "Customer",
      lastName: data.lastName || fullName.split(" ").slice(1).join(" ") || "",
      phone: phone,
      mobileNumber: phone,
      country: data.country || "India",
      countryCode: data.countryCode || "IN",
      state: data.state || "Maharashtra",
      city: data.city || "Mumbai",
      postalCode: data.postalCode || "400001",
      streetAddress: data.streetAddress || "",
      apartment: data.apartment || "",
      password: data.password || "",
      role: computedRole,
      roleId: computedRoleId,
      assignedRoles: computedAssignedRoles,
      accountType: computedAccountType,
      type: computedType,
      customerType: computedCustomerType,
      address: data.address || data.streetAddress || null,
      shippingAddress: data.shippingAddress || data.streetAddress || null,
      lastLogin: "Just now",
      credit: data.credit !== undefined ? Number(data.credit) : 0,
      status: data.status || "ACTIVE",
      ordersCount: 0,
      wishlistCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!db.users) db.users = [];
    db.users.unshift(newCustomer);

    // Save Billing Address into db.addresses
    if (!db.addresses) db.addresses = [];
    const bDetail = data.billingAddressDetail;
    const bLine1 = bDetail?.addressLine1 || data.streetAddress || data.address;
    if (bLine1) {
      db.addresses.push({
        id: "addr_" + Math.random().toString(36).substring(2, 9),
        userId: newCustomer.id,
        customerEmail: newCustomer.email,
        type: "billing",
        name: bDetail?.name || fullName,
        company: bDetail?.company || "",
        addressLine1: bLine1,
        addressLine2: bDetail?.addressLine2 || data.apartment || "",
        country: bDetail?.country || data.country || "India",
        state: bDetail?.state || data.state || "Maharashtra",
        city: bDetail?.city || data.city || "Mumbai",
        postalCode: bDetail?.postalCode || data.postalCode || "400001",
        phone: bDetail?.phone || phone,
        isDefault: true,
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Save Shipping Address into db.addresses
    const sDetail = data.shippingAddressDetail;
    const sLine1 = sDetail?.addressLine1 || data.shippingAddress || data.streetAddress || bLine1;
    if (sLine1) {
      db.addresses.push({
        id: "addr_" + Math.random().toString(36).substring(2, 9),
        userId: newCustomer.id,
        customerEmail: newCustomer.email,
        type: "shipping",
        name: sDetail?.name || fullName,
        company: sDetail?.company || "",
        addressLine1: sLine1,
        addressLine2: sDetail?.addressLine2 || data.apartment || "",
        country: sDetail?.country || data.country || "India",
        state: sDetail?.state || data.state || "Maharashtra",
        city: sDetail?.city || data.city || "Mumbai",
        postalCode: sDetail?.postalCode || data.postalCode || "400001",
        phone: sDetail?.phone || phone,
        isDefault: true,
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    await this.writeLocalDb(db);
    return newCustomer;
  }

  public static async updateCustomer(
    id: string,
    data: Partial<UserRecord> & {
      billingAddressDetail?: Partial<AddressRecord>;
      shippingAddressDetail?: Partial<AddressRecord>;
    }
  ): Promise<UserRecord | null> {
    const db = await this.readLocalDb();
    const index = (db.users || []).findIndex((u) => u.id === id);
    if (index === -1) return null;

    const existingUser = db.users[index];
    const updatedUser: UserRecord = {
      ...existingUser,
      ...data,
      phone: data.mobileNumber || data.phone || existingUser.phone || existingUser.mobileNumber,
      mobileNumber: data.mobileNumber || data.phone || existingUser.mobileNumber || existingUser.phone,
      updatedAt: new Date().toISOString(),
    };
    const rawType = ((data as any).type || data.accountType || data.customerType || existingUser.type || existingUser.accountType || existingUser.customerType || "customer").toString().toLowerCase();
    if (rawType === "both" || data.customerType === "Both") {
      updatedUser.type = "both";
      updatedUser.accountType = "both";
      updatedUser.customerType = "Both";
      updatedUser.role = "ADMIN";
    } else if (rawType === "admin" || data.customerType === "Admin" || data.accountType === "admin") {
      updatedUser.type = "admin";
      updatedUser.accountType = "admin";
      updatedUser.customerType = "Admin";
      updatedUser.role = "ADMIN";
    } else if (rawType === "customer" || data.customerType === "Customer" || data.accountType === "customer") {
      updatedUser.type = "customer";
      updatedUser.accountType = "customer";
      updatedUser.customerType = "Customer";
      updatedUser.role = "CUSTOMER";
      updatedUser.roleId = "";
      updatedUser.assignedRoles = [];
    }
    db.users[index] = updatedUser;

    // Synchronize addresses if details were provided
    if (!db.addresses) db.addresses = [];

    if (data.billingAddressDetail) {
      const existingB = db.addresses.find(
        (a) => (a.userId === id || a.customerEmail?.toLowerCase() === updatedUser.email.toLowerCase()) && a.type === "billing" && a.isDefault
      );
      if (existingB) {
        Object.assign(existingB, data.billingAddressDetail, { updatedAt: new Date().toISOString() });
      } else if (data.billingAddressDetail.addressLine1) {
        db.addresses.push({
          id: "addr_" + Math.random().toString(36).substring(2, 9),
          userId: id,
          customerEmail: updatedUser.email,
          type: "billing",
          name: data.billingAddressDetail.name || updatedUser.name,
          addressLine1: data.billingAddressDetail.addressLine1,
          addressLine2: data.billingAddressDetail.addressLine2 || "",
          country: data.billingAddressDetail.country || updatedUser.country || "India",
          state: data.billingAddressDetail.state || updatedUser.state || "Maharashtra",
          city: data.billingAddressDetail.city || updatedUser.city || "Mumbai",
          postalCode: data.billingAddressDetail.postalCode || updatedUser.postalCode || "400001",
          phone: data.billingAddressDetail.phone || updatedUser.phone || "",
          isDefault: true,
          status: "Active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    if (data.shippingAddressDetail) {
      const existingS = db.addresses.find(
        (a) => (a.userId === id || a.customerEmail?.toLowerCase() === updatedUser.email.toLowerCase()) && a.type === "shipping" && a.isDefault
      );
      if (existingS) {
        Object.assign(existingS, data.shippingAddressDetail, { updatedAt: new Date().toISOString() });
      } else if (data.shippingAddressDetail.addressLine1) {
        db.addresses.push({
          id: "addr_" + Math.random().toString(36).substring(2, 9),
          userId: id,
          customerEmail: updatedUser.email,
          type: "shipping",
          name: data.shippingAddressDetail.name || updatedUser.name,
          addressLine1: data.shippingAddressDetail.addressLine1,
          addressLine2: data.shippingAddressDetail.addressLine2 || "",
          country: data.shippingAddressDetail.country || updatedUser.country || "India",
          state: data.shippingAddressDetail.state || updatedUser.state || "Maharashtra",
          city: data.shippingAddressDetail.city || updatedUser.city || "Mumbai",
          postalCode: data.shippingAddressDetail.postalCode || updatedUser.postalCode || "400001",
          phone: data.shippingAddressDetail.phone || updatedUser.phone || "",
          isDefault: true,
          status: "Active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    await this.writeLocalDb(db);
    return updatedUser;
  }

  public static async deleteCustomer(id: string): Promise<boolean> {
    const db = await this.readLocalDb();
    if (!db.users) return false;
    db.users = db.users.filter((u) => u.id !== id);
    await this.writeLocalDb(db);
    return true;
  }

  public static async adjustCustomerCredit(id: string, amount: number): Promise<UserRecord | null> {
    const db = await this.readLocalDb();
    const user = (db.users || []).find((u) => u.id === id);
    if (!user) return null;

    user.credit = Math.max(0, (user.credit || 0) + amount);
    user.updatedAt = new Date().toISOString();
    await this.writeLocalDb(db);
    return user;
  }

  public static async getPendingCustomersCount(): Promise<number> {
    const db = await this.readLocalDb();
    return (db.users || []).filter((u) => u.status === "PENDING_APPROVAL").length;
  }

  // ================= SLIDERS & BANNERS =================

  public static async findSliders(params: {
    position?: "main" | "side" | "triple_promo";
    includeInactive?: boolean;
  } = {}): Promise<SliderRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    let sliders = db.sliders || [];

    if (!params.includeInactive) {
      sliders = sliders.filter((s) => s.isActive !== false);
    }

    if (params.position) {
      sliders = sliders.filter((s) => s.position === params.position);
    }

    return sliders.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  public static async findSliderById(id: string): Promise<SliderRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return (db.sliders || []).find((s) => s.id === id) || null;
  }

  public static async createSlider(
    data: Omit<SliderRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<SliderRecord> {
    const db = await this.readLocalDb();
    const newSlider: SliderRecord = {
      id: "slider_" + Math.random().toString(36).substring(2, 9),
      ...data,
      displayOrder: data.displayOrder ?? (db.sliders ? db.sliders.length + 1 : 1),
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!db.sliders) db.sliders = [];
    db.sliders.push(newSlider);
    await this.writeLocalDb(db);
    return newSlider;
  }

  public static async updateSlider(
    id: string,
    data: Partial<Omit<SliderRecord, "id" | "createdAt" | "updatedAt">>
  ): Promise<SliderRecord | null> {
    const db = await this.readLocalDb();
    if (!db.sliders) db.sliders = [];
    const index = db.sliders.findIndex((s) => s.id === id);
    if (index === -1) return null;

    db.sliders[index] = {
      ...db.sliders[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.writeLocalDb(db);
    return db.sliders[index];
  }

  public static async deleteSlider(id: string): Promise<boolean> {
    const db = await this.readLocalDb();
    if (!db.sliders) return false;
    db.sliders = db.sliders.filter((s) => s.id !== id);
    await this.writeLocalDb(db);
    return true;
  }

  // ================= MENU NAVIGATION =================

  public static async findMenuItems(includeInactive: boolean = false): Promise<MenuItemRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    let items = db.menuItems || [];
    if (!includeInactive) {
      items = items.filter((m) => m.isActive !== false);
    }
    return items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  public static async findMenuItemById(id: string): Promise<MenuItemRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return (db.menuItems || []).find((m) => m.id === id) || null;
  }

  public static async createMenuItem(
    data: Omit<MenuItemRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<MenuItemRecord> {
    const db = await this.readLocalDb();
    const newItem: MenuItemRecord = {
      id: "menu_" + Math.random().toString(36).substring(2, 9),
      ...data,
      displayOrder: data.displayOrder ?? (db.menuItems ? db.menuItems.length + 1 : 1),
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!db.menuItems) db.menuItems = [];
    db.menuItems.push(newItem);
    await this.writeLocalDb(db);
    return newItem;
  }

  public static async updateMenuItem(
    id: string,
    data: Partial<Omit<MenuItemRecord, "id" | "createdAt" | "updatedAt">>
  ): Promise<MenuItemRecord | null> {
    const db = await this.readLocalDb();
    if (!db.menuItems) db.menuItems = [];
    const index = db.menuItems.findIndex((m) => m.id === id);
    if (index === -1) return null;

    db.menuItems[index] = {
      ...db.menuItems[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.writeLocalDb(db);
    return db.menuItems[index];
  }

  public static async deleteMenuItem(id: string): Promise<boolean> {
    const db = await this.readLocalDb();
    if (!db.menuItems) return false;
    db.menuItems = db.menuItems.filter((m) => m.id !== id);
    await this.writeLocalDb(db);
    return true;
  }

  // ================= SETTINGS =================

  public static async getSettings(): Promise<SiteSettingsRecord> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    if (!db.settings) {
      db.settings = this.getDefaultSettings();
      await this.writeLocalDb(db);
    }
    return db.settings;
  }

  public static async updateSettings(data: Partial<SiteSettingsRecord>): Promise<SiteSettingsRecord> {
    const db = await this.readLocalDb();
    const current = db.settings || this.getDefaultSettings();
    db.settings = {
      ...current,
      ...data,
      socialLinks: {
        ...current.socialLinks,
        ...(data.socialLinks || {}),
      },
      updatedAt: new Date().toISOString(),
    };
    await this.writeLocalDb(db);
    return db.settings;
  }

  public static getDefaultSettings(): SiteSettingsRecord {
    return {
      id: "site_settings_main",
      themeName: "e-Shop",
      siteTitle: "e-Shop | Online Shopping for Electronics, Fashion, Deals & More in India",
      tagline: "Superstore • Express Delivery across India",
      uniqueTitle: "e-Shop",
      alternateTitle: "e-Shop",
      orderPrefix: "tags",
      defaultCurrency: "INR",
      deliveryLocation: "Delivering to India",
      timeZone: "Asia/Kolkata",
      supportEmail: "support@e-shop.in",
      supportPhone: "+91 1800 123 4567",
      footerCopyrightText: "© 2026 e-Shop India Pvt Ltd. All rights reserved.",
      footerAboutText: "Your one-stop destination for authentic electronics, top fashion labels, and household essentials across India with 100% buyer protection.",
      footerLinks: [
        { id: "fl_1", label: "Today's Best Deals", url: "/#deals", displayOrder: 1, isActive: true, section: "shop" },
        { id: "fl_2", label: "Electronics Hub", url: "/#deals", displayOrder: 2, isActive: true, section: "shop" },
        { id: "fl_3", label: "Winter Clearance 60% Off", url: "/#winter", displayOrder: 3, isActive: true, section: "shop" },
        { id: "fl_4", label: "Trending Collections", url: "/#deals", displayOrder: 4, isActive: true, section: "shop" },

        { id: "fl_5", label: "Track Your Order", url: "/#deals", displayOrder: 1, isActive: true, section: "customer_service" },
        { id: "fl_6", label: "Returns & Refund Policy", url: "/#deals", displayOrder: 2, isActive: true, section: "customer_service" },
        { id: "fl_7", label: "Shipping & Delivery Rates", url: "/#deals", displayOrder: 3, isActive: true, section: "customer_service" },
        { id: "fl_8", label: "Help Center / FAQs", url: "/#deals", displayOrder: 4, isActive: true, section: "customer_service" },

        { id: "fl_9", label: "About Our Story", url: "/#deals", displayOrder: 1, isActive: true, section: "about" },
        { id: "fl_10", label: "Sell on G-store", url: "/#deals", displayOrder: 2, isActive: true, section: "about" },
        { id: "fl_11", label: "Careers", url: "/#deals", displayOrder: 3, isActive: true, section: "about" },
        { id: "fl_12", label: "Press & Media", url: "/#deals", displayOrder: 4, isActive: true, section: "about" },

        { id: "fl_13", label: "Privacy Policy", url: "/#deals", displayOrder: 1, isActive: true, section: "legal" },
        { id: "fl_14", label: "Terms & Conditions", url: "/#deals", displayOrder: 2, isActive: true, section: "legal" },
        { id: "fl_15", label: "Consumer Rights (India)", url: "/#deals", displayOrder: 3, isActive: true, section: "legal" },
        { id: "fl_16", label: "Security & Fraud Notice", url: "/#deals", displayOrder: 4, isActive: true, section: "legal" },
      ],
      socialLinks: {
        facebook: "https://facebook.com/g-store",
        instagram: "https://instagram.com/emox",
        twitter: "https://twitter.com/emox",
        youtube: "https://youtube.com/@emox",
        linkedin: "https://linkedin.com/company/emox",
      },
      numberOfMailsForExecution: 100,
      reviewFeedCronDays: 0,
      googleMerchantCronDays: 0,
      mailPerExecutionFrequency: 0,
      unpaidOrderEmailDailyCount: 10,
      unpaidOrderEmailTimeLapseMinutes: 40,
      numberOfSmsForExecution: 75,
      debugModeEnabled: false,
      emailVerificationEnabled: true,
      autoCancelDays: 7,
      handlingCharge: 5,
      freeShippingThreshold: 200,
      updatedAt: new Date().toISOString(),
    };
  }

  // ================= GENERAL / CONTEXT-BASED SETTINGS =================

  public static async getSettingByKey(key: string): Promise<SettingItemRecord | null> {
    try {
      if (await this.testPostgres()) {
        const found = await (prisma as any).setting.findUnique({ where: { key } });
        if (found) {
          return {
            id: found.id,
            key: found.key,
            context: found.context,
            value: found.value,
            createdAt: found.createdAt instanceof Date ? found.createdAt.toISOString() : String(found.createdAt),
            updatedAt: found.updatedAt instanceof Date ? found.updatedAt.toISOString() : String(found.updatedAt),
          };
        }
      }
    } catch {
      // Fallback
    }

    const db = await this.readLocalDb();
    const item = (db.appSettings || []).find((s) => s.key === key);
    return item || null;
  }

  public static async getSettingByContext(context: string): Promise<SettingItemRecord | null> {
    try {
      if (await this.testPostgres()) {
        const found = await (prisma as any).setting.findUnique({ where: { context } });
        if (found) {
          return {
            id: found.id,
            key: found.key,
            context: found.context,
            value: found.value,
            createdAt: found.createdAt instanceof Date ? found.createdAt.toISOString() : String(found.createdAt),
            updatedAt: found.updatedAt instanceof Date ? found.updatedAt.toISOString() : String(found.updatedAt),
          };
        }
      }
    } catch {
      // Fallback
    }

    const db = await this.readLocalDb();
    const item = (db.appSettings || []).find((s) => s.context === context);
    return item || null;
  }

  public static async saveSetting(data: { key: string; context?: string | null; value: any }): Promise<SettingItemRecord> {
    const now = new Date().toISOString();
    try {
      if (await this.testPostgres()) {
        const upserted = await (prisma as any).setting.upsert({
          where: data.context ? { context: data.context } : { key: data.key },
          update: {
            key: data.key,
            context: data.context || null,
            value: data.value,
            updatedAt: new Date(),
          },
          create: {
            key: data.key,
            context: data.context || null,
            value: data.value,
            updatedAt: new Date(),
          },
        });
        return {
          id: upserted.id,
          key: upserted.key,
          context: upserted.context,
          value: upserted.value,
          createdAt: upserted.createdAt instanceof Date ? upserted.createdAt.toISOString() : String(upserted.createdAt),
          updatedAt: upserted.updatedAt instanceof Date ? upserted.updatedAt.toISOString() : String(upserted.updatedAt),
        };
      }
    } catch {
      // Fallback
    }

    const db = await this.readLocalDb();
    if (!db.appSettings) db.appSettings = [];
    const idx = db.appSettings.findIndex((s) => (data.context && s.context === data.context) || s.key === data.key);
    let record: SettingItemRecord;
    if (idx >= 0) {
      record = {
        ...db.appSettings[idx],
        key: data.key,
        context: data.context || null,
        value: data.value,
        updatedAt: now,
      };
      db.appSettings[idx] = record;
    } else {
      record = {
        id: `set_${Math.random().toString(36).substring(2, 9)}`,
        key: data.key,
        context: data.context || null,
        value: data.value,
        createdAt: now,
        updatedAt: now,
      };
      db.appSettings.push(record);
    }
    await this.writeLocalDb(db);
    return record;
  }

  public static getDefaultSocialAuthSettings(): SocialAuthSettings {
    return {
      google: {
        enabled: true,
        clientId: "987654321000-samplegoogleoauthclientid.apps.googleusercontent.com",
        clientSecret: "GOCSPX-SampleSecretKeyForGoogleOAuth",
        redirectUri: "/api/auth/oauth/google/callback",
      },
      github: {
        enabled: false,
        clientId: "",
        clientSecret: "",
        redirectUri: "/api/auth/oauth/github/callback",
      },
      facebook: {
        enabled: false,
        clientId: "",
        appSecret: "",
        redirectUri: "/api/auth/oauth/facebook/callback",
      },
    };
  }

  public static async getSocialAuthSettings(): Promise<SocialAuthSettings> {
    const existing = await this.getSettingByContext("auth_oauth");
    if (existing && existing.value) {
      const val = typeof existing.value === "string" ? JSON.parse(existing.value) : existing.value;
      const defaults = this.getDefaultSocialAuthSettings();
      return {
        google: { ...defaults.google, ...(val.google || {}) },
        github: { ...defaults.github, ...(val.github || {}) },
        facebook: { ...defaults.facebook, ...(val.facebook || {}) },
      };
    }

    // Initialize with default social auth settings
    const defaults = this.getDefaultSocialAuthSettings();
    await this.saveSetting({
      key: "auth_oauth",
      context: "auth_oauth",
      value: defaults,
    });
    return defaults;
  }

  public static async saveSocialAuthSettings(data: Partial<SocialAuthSettings>): Promise<SocialAuthSettings> {
    const current = await this.getSocialAuthSettings();
    const updated: SocialAuthSettings = {
      google: {
        ...current.google,
        ...(data.google || {}),
      },
      github: {
        ...current.github,
        ...(data.github || {}),
      },
      facebook: {
        ...current.facebook,
        ...(data.facebook || {}),
      },
    };

    await this.saveSetting({
      key: "auth_oauth",
      context: "auth_oauth",
      value: updated,
    });
    return updated;
  }

  // ================= MANUFACTURERS =================
  public static async findManufacturers(search?: string): Promise<ManufacturerRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    const mfgList = db.manufacturers || [];
    const warehouses = db.warehouses || [];

    let result = mfgList.map((m) => ({
      ...m,
      warehouses: warehouses.filter((w) => w.manufacturerId === m.id),
    }));

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.accountNumber.toLowerCase().includes(q) ||
          m.contactName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static async findManufacturerById(id: string): Promise<ManufacturerRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    const m = (db.manufacturers || []).find((x) => x.id === id);
    if (!m) return null;
    const warehouses = (db.warehouses || []).filter((w) => w.manufacturerId === m.id);
    return { ...m, warehouses };
  }

  public static async createManufacturer(
    data: Omit<ManufacturerRecord, "id" | "createdAt" | "updatedAt" | "warehouses">
  ): Promise<ManufacturerRecord> {
    const db = await this.readLocalDb();
    const newMfg: ManufacturerRecord = {
      id: "mfg_" + Math.random().toString(36).substring(2, 9),
      ...data,
      accountNumber: data.accountNumber || "ac" + Math.floor(1000 + Math.random() * 9000),
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!db.manufacturers) db.manufacturers = [];
    db.manufacturers.unshift(newMfg);
    await this.writeLocalDb(db);
    return newMfg;
  }

  public static async updateManufacturer(
    id: string,
    data: Partial<Omit<ManufacturerRecord, "id" | "createdAt" | "updatedAt" | "warehouses">>
  ): Promise<ManufacturerRecord | null> {
    const db = await this.readLocalDb();
    if (!db.manufacturers) db.manufacturers = [];
    const index = db.manufacturers.findIndex((m) => m.id === id);
    if (index === -1) return null;

    db.manufacturers[index] = {
      ...db.manufacturers[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.writeLocalDb(db);
    const warehouses = (db.warehouses || []).filter((w) => w.manufacturerId === id);
    return { ...db.manufacturers[index], warehouses };
  }

  public static async deleteManufacturer(id: string): Promise<boolean> {
    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const prodCount = await prisma.product.count({ where: { manufacturerId: id } });
        if (prodCount > 0) {
          throw new Error(`Cannot delete manufacturer: it is linked to ${prodCount} product(s). Please reassign products first.`);
        }
        await prisma.manufacturer.delete({ where: { id } });
        return true;
      } catch (err: any) {
        if (err.message && err.message.includes("Cannot delete manufacturer")) throw err;
        // fallback to local db
      }
    }

    const db = await this.readLocalDb();
    if (!db.manufacturers) return false;
    const linkedProducts = (db.products || []).filter((p) => p.manufacturerId === id);
    if (linkedProducts.length > 0) {
      throw new Error(`Cannot delete manufacturer: it is linked to ${linkedProducts.length} product(s). Please reassign products first.`);
    }
    db.manufacturers = db.manufacturers.filter((m) => m.id !== id);
    if (db.warehouses) {
      db.warehouses = db.warehouses.filter((w) => w.manufacturerId !== id);
    }
    await this.writeLocalDb(db);
    return true;
  }

  // ================= WAREHOUSES =================
  public static async findWarehouses(manufacturerId?: string): Promise<WarehouseRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    let warehouses = db.warehouses || [];
    if (manufacturerId) {
      warehouses = warehouses.filter((w) => w.manufacturerId === manufacturerId);
    }
    return warehouses;
  }

  public static async findWarehouseById(id: string): Promise<WarehouseRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return (db.warehouses || []).find((w) => w.id === id) || null;
  }

  public static async createWarehouse(
    data: Omit<WarehouseRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<WarehouseRecord> {
    const db = await this.readLocalDb();
    const newWh: WarehouseRecord = {
      id: "wh_" + Math.random().toString(36).substring(2, 9),
      ...data,
      accountNumber: data.accountNumber || "WH-" + Math.floor(10 + Math.random() * 90),
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!db.warehouses) db.warehouses = [];
    db.warehouses.push(newWh);
    await this.writeLocalDb(db);
    return newWh;
  }

  public static async updateWarehouse(
    id: string,
    data: Partial<Omit<WarehouseRecord, "id" | "createdAt" | "updatedAt">>
  ): Promise<WarehouseRecord | null> {
    const db = await this.readLocalDb();
    if (!db.warehouses) db.warehouses = [];
    const index = db.warehouses.findIndex((w) => w.id === id);
    if (index === -1) return null;

    db.warehouses[index] = {
      ...db.warehouses[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.writeLocalDb(db);
    return db.warehouses[index];
  }

  public static async deleteWarehouse(id: string): Promise<boolean> {
    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const prodCount = await prisma.product.count({ where: { warehouseId: id } });
        if (prodCount > 0) {
          throw new Error(`Cannot delete warehouse: it is assigned to ${prodCount} product(s).`);
        }
        const invCount = await prisma.warehouseInventory.count({
          where: {
            warehouseId: id,
            OR: [{ availableQuantity: { gt: 0 } }, { reservedQuantity: { gt: 0 } }],
          },
        });
        if (invCount > 0) {
          throw new Error("Cannot delete warehouse: it currently holds stock records.");
        }
        const shipmentCount = await prisma.shipment.count({ where: { warehouseId: id } });
        if (shipmentCount > 0) {
          throw new Error("Cannot delete warehouse: order fulfillment records depend on it.");
        }
        await prisma.warehouse.delete({ where: { id } });
        return true;
      } catch (err: any) {
        if (err.message && err.message.includes("Cannot delete warehouse")) throw err;
        // fallback
      }
    }

    const db = await this.readLocalDb();
    if (!db.warehouses) return false;
    const linkedProducts = (db.products || []).filter((p) => p.warehouseId === id);
    if (linkedProducts.length > 0) {
      throw new Error(`Cannot delete warehouse: it is assigned to ${linkedProducts.length} product(s).`);
    }
    const hasStock = (db.warehouseInventory || []).some(
      (inv) => inv.warehouseId === id && (inv.availableQuantity > 0 || inv.reservedQuantity > 0)
    );
    if (hasStock) {
      throw new Error("Cannot delete warehouse: it currently holds available or reserved stock.");
    }
    const hasShipment = (db.shipments || []).some((s) => s.warehouseId === id);
    if (hasShipment) {
      throw new Error("Cannot delete warehouse: order shipments depend on it.");
    }

    db.warehouses = db.warehouses.filter((w) => w.id !== id);
    await this.writeLocalDb(db);
    return true;
  }

  // ================= DISCOUNTS =================
  public static async findDiscounts(): Promise<DiscountRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return (db.discounts || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public static async findDiscountById(id: string): Promise<DiscountRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return (db.discounts || []).find((d) => d.id === id) || null;
  }

  public static async createDiscount(
    data: Omit<DiscountRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<DiscountRecord> {
    const db = await this.readLocalDb();
    const newDiscount: DiscountRecord = {
      id: "disc_" + Math.random().toString(36).substring(2, 9),
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!db.discounts) db.discounts = [];
    db.discounts.unshift(newDiscount);

    // Synchronize product comparePrice / price
    if (newDiscount.isActive && db.products) {
      const prod = db.products.find(
        (p) => p.sku === newDiscount.itemNo || p.name === newDiscount.productName
      );
      if (prod) {
        if (!prod.comparePrice || prod.comparePrice <= prod.price) {
          prod.comparePrice = prod.price;
        }
        if (newDiscount.discountType === "%" || newDiscount.discountType === "PERCENT") {
          const discountAmt = (prod.comparePrice * newDiscount.discountValue) / 100;
          prod.price = Math.max(0.99, Number((prod.comparePrice - discountAmt).toFixed(2)));
        } else {
          prod.price = Math.max(0.99, Number((prod.comparePrice - newDiscount.discountValue).toFixed(2)));
        }
        prod.updatedAt = new Date().toISOString();
      }
    }

    await this.writeLocalDb(db);
    return newDiscount;
  }

  public static async updateDiscount(
    id: string,
    data: Partial<Omit<DiscountRecord, "id" | "createdAt" | "updatedAt">>
  ): Promise<DiscountRecord | null> {
    const db = await this.readLocalDb();
    if (!db.discounts) db.discounts = [];
    const index = db.discounts.findIndex((d) => d.id === id);
    if (index === -1) return null;

    db.discounts[index] = {
      ...db.discounts[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const d = db.discounts[index];
    if (db.products) {
      const prod = db.products.find((p) => p.sku === d.itemNo || p.name === d.productName);
      if (prod) {
        if (d.isActive) {
          if (!prod.comparePrice || prod.comparePrice <= prod.price) {
            prod.comparePrice = prod.price;
          }
          if (d.discountType === "%" || d.discountType === "PERCENT") {
            const discountAmt = (prod.comparePrice * d.discountValue) / 100;
            prod.price = Math.max(0.99, Number((prod.comparePrice - discountAmt).toFixed(2)));
          } else {
            prod.price = Math.max(0.99, Number((prod.comparePrice - d.discountValue).toFixed(2)));
          }
        }
        prod.updatedAt = new Date().toISOString();
      }
    }

    await this.writeLocalDb(db);
    return db.discounts[index];
  }

  public static async deleteDiscount(id: string): Promise<boolean> {
    const db = await this.readLocalDb();
    if (!db.discounts) return false;
    const item = db.discounts.find((d) => d.id === id);
    db.discounts = db.discounts.filter((d) => d.id !== id);

    if (item && db.products) {
      const prod = db.products.find((p) => p.sku === item.itemNo);
      if (prod && prod.comparePrice && prod.comparePrice > prod.price) {
        prod.price = prod.comparePrice;
        prod.comparePrice = undefined;
        prod.updatedAt = new Date().toISOString();
      }
    }

    await this.writeLocalDb(db);
    return true;
  }

  // ================= ORDERS =================
  public static async findOrders(filters?: {
    status?: string;
    search?: string;
    fromOrderNo?: string;
    toOrderNo?: string;
    fromDate?: string;
    toDate?: string;
    gateway?: string;
    shipmentStatus?: string;
    carrier?: string;
  }): Promise<OrderRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    let orders = db.orders || [];

    if (filters) {
      if (filters.status && filters.status !== "All") {
        orders = orders.filter((o) => o.orderStatus.toLowerCase() === filters.status!.toLowerCase());
      }
      if (filters.gateway && filters.gateway !== "All") {
        orders = orders.filter((o) => o.gateway.toLowerCase() === filters.gateway!.toLowerCase());
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        orders = orders.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            (o.customerEmail && o.customerEmail.toLowerCase().includes(q))
        );
      }
      if (filters.fromOrderNo && filters.fromOrderNo.trim()) {
        const fromVal = filters.fromOrderNo.toLowerCase().trim();
        orders = orders.filter((o) => o.orderNumber.toLowerCase() >= fromVal);
      }
      if (filters.toOrderNo && filters.toOrderNo.trim()) {
        const toVal = filters.toOrderNo.toLowerCase().trim();
        orders = orders.filter((o) => o.orderNumber.toLowerCase() <= toVal);
      }
      if (filters.fromDate) {
        const fromTs = new Date(filters.fromDate).getTime();
        orders = orders.filter((o) => new Date(o.orderDate).getTime() >= fromTs);
      }
      if (filters.toDate) {
        const toTs = new Date(filters.toDate).getTime();
        orders = orders.filter((o) => new Date(o.orderDate).getTime() <= toTs);
      }
    }

    return orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }

  public static async findOrderById(id: string): Promise<OrderRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return (db.orders || []).find((o) => o.id === id || o.orderNumber === id) || null;
  }

  public static async createOrder(
    data: Omit<OrderRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<OrderRecord> {
    const db = await this.readLocalDb();
    if (!db.orders) db.orders = [];

    // Check if order with orderNumber already exists (idempotent order initialization)
    if (data.orderNumber) {
      const existingIdx = db.orders.findIndex((o) => o.orderNumber === data.orderNumber);
      if (existingIdx > -1) {
        db.orders[existingIdx] = {
          ...db.orders[existingIdx],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        await this.writeLocalDb(db);
        return db.orders[existingIdx];
      }
    }

    const newOrder: OrderRecord = {
      id: "ord_" + Math.random().toString(36).substring(2, 9),
      ...data,
      orderNumber: data.orderNumber || "tags" + Math.floor(100 + Math.random() * 900),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);

    // Automatically create linked payment record in dedicated payments table
    if (!db.payments) db.payments = [];
    const paymentRecord: PaymentRecord = {
      id: "pay_" + Math.random().toString(36).substring(2, 9),
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      customerName: newOrder.customerName,
      customerEmail: newOrder.customerEmail,
      paymentGateway: newOrder.gateway || "COD",
      gatewayOrderId: newOrder.gatewayOrderId,
      transactionId: newOrder.paymentTransactionId,
      amount: newOrder.totalPrice,
      currency: "INR",
      paymentStatus: newOrder.paymentStatus === "Paid" ? "Paid" : "Pending",
      paidAt: newOrder.paymentStatus === "Paid" ? (newOrder.paidAt || newOrder.createdAt) : undefined,
      createdAt: newOrder.createdAt,
      updatedAt: newOrder.updatedAt,
    };
    db.payments.unshift(paymentRecord);

    await this.writeLocalDb(db);
    return newOrder;
  }

  public static async updateOrderPayment(
    orderNumberOrId: string,
    data: {
      paymentStatus: "Paid" | "Pending" | "Failed" | "Cancelled";
      orderStatus?: OrderRecord["orderStatus"];
      paymentTransactionId?: string;
      gatewayOrderId?: string;
      paymentDetails?: any;
      paidAt?: string;
      notes?: string;
      performedBy?: string;
    }
  ): Promise<OrderRecord | null> {
    const db = await this.readLocalDb();
    if (!db.orders) return null;
    const index = db.orders.findIndex((o) => o.id === orderNumberOrId || o.orderNumber === orderNumberOrId);
    if (index === -1) return null;

    const existing = db.orders[index];
    const history = existing.orderHistory ? [...existing.orderHistory] : [];
    history.push({
      timestamp: new Date().toISOString(),
      action: "PAYMENT_" + data.paymentStatus.toUpperCase(),
      performedBy: data.performedBy || "PaymentGateway",
      notes: data.notes || `Payment status updated to ${data.paymentStatus}. Transaction ID: ${data.paymentTransactionId || "N/A"}`,
    });

    db.orders[index] = {
      ...existing,
      paymentStatus: data.paymentStatus,
      orderStatus: data.orderStatus || (data.paymentStatus === "Paid" ? "Processing" : existing.orderStatus),
      paymentTransactionId: data.paymentTransactionId || existing.paymentTransactionId,
      gatewayOrderId: data.gatewayOrderId || existing.gatewayOrderId,
      paymentDetails: data.paymentDetails !== undefined ? data.paymentDetails : existing.paymentDetails,
      paidAt: data.paidAt || (data.paymentStatus === "Paid" ? new Date().toISOString() : existing.paidAt),
      orderHistory: history,
      updatedAt: new Date().toISOString(),
    };

    // Also synchronize the dedicated payments table
    if (!db.payments) db.payments = [];
    const paymentIndex = db.payments.findIndex(
      (p) => p.orderId === existing.id || p.orderNumber === existing.orderNumber
    );
    if (paymentIndex > -1) {
      db.payments[paymentIndex] = {
        ...db.payments[paymentIndex],
        paymentStatus: data.paymentStatus,
        transactionId: data.paymentTransactionId || db.payments[paymentIndex].transactionId,
        gatewayOrderId: data.gatewayOrderId || db.payments[paymentIndex].gatewayOrderId,
        gatewayResponse: data.paymentDetails || db.payments[paymentIndex].gatewayResponse,
        paidAt:
          data.paidAt ||
          (data.paymentStatus === "Paid" ? new Date().toISOString() : db.payments[paymentIndex].paidAt),
        updatedAt: new Date().toISOString(),
      };
    } else {
      db.payments.unshift({
        id: "pay_" + Math.random().toString(36).substring(2, 9),
        orderId: existing.id,
        orderNumber: existing.orderNumber,
        customerName: existing.customerName,
        customerEmail: existing.customerEmail,
        paymentGateway: existing.gateway || "Online",
        gatewayOrderId: data.gatewayOrderId,
        transactionId: data.paymentTransactionId,
        amount: existing.totalPrice,
        currency: "INR",
        paymentStatus: data.paymentStatus,
        gatewayResponse: data.paymentDetails,
        paidAt: data.paidAt || (data.paymentStatus === "Paid" ? new Date().toISOString() : undefined),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    await this.writeLocalDb(db);
    return db.orders[index];
  }

  public static async updateOrderStatus(
    id: string,
    orderStatus: OrderRecord["orderStatus"]
  ): Promise<OrderRecord | null> {
    const db = await this.readLocalDb();
    if (!db.orders) return null;
    const index = db.orders.findIndex((o) => o.id === id || o.orderNumber === id);
    if (index === -1) return null;

    db.orders[index] = {
      ...db.orders[index],
      orderStatus,
      updatedAt: new Date().toISOString(),
    };

    await this.writeLocalDb(db);
    return db.orders[index];
  }

  public static async updateOrder(
    id: string,
    data: Partial<Omit<OrderRecord, "id" | "createdAt" | "updatedAt">>,
    performedBy = "Admin"
  ): Promise<OrderRecord | null> {
    const db = await this.readLocalDb();
    if (!db.orders) return null;
    const index = db.orders.findIndex((o) => o.id === id || o.orderNumber === id);
    if (index === -1) return null;

    const existing = db.orders[index];
    const history = existing.orderHistory ? [...existing.orderHistory] : [];

    let note = "Order details updated";
    if (data.orderStatus && data.orderStatus !== existing.orderStatus) {
      note = `Status changed: ${existing.orderStatus} -> ${data.orderStatus}`;
    } else if (data.paymentStatus && data.paymentStatus !== existing.paymentStatus) {
      note = `Payment status: ${existing.paymentStatus} -> ${data.paymentStatus}`;
    }
    history.push({
      timestamp: new Date().toISOString(),
      action: "UPDATE",
      performedBy,
      notes: note,
    });

    db.orders[index] = {
      ...existing,
      ...data,
      orderHistory: history,
      updatedAt: new Date().toISOString(),
    };

    await this.writeLocalDb(db);
    return db.orders[index];
  }

  public static async deleteOrder(id: string): Promise<boolean> {
    const db = await this.readLocalDb();
    if (!db.orders) return false;
    db.orders = db.orders.filter((o) => o.id !== id && o.orderNumber !== id);
    await this.writeLocalDb(db);
    return true;
  }

  // ================= PAYMENTS =================
  public static async createPayment(
    data: Omit<PaymentRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<PaymentRecord> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    if (!db.payments) db.payments = [];

    const order = (db.orders || []).find((o) => o.id === data.orderId || o.orderNumber === data.orderId);

    const newPayment: PaymentRecord = {
      id: "pay_" + Math.random().toString(36).substring(2, 9),
      ...data,
      orderNumber: data.orderNumber || order?.orderNumber,
      customerName: data.customerName || order?.customerName,
      customerEmail: data.customerEmail || order?.customerEmail,
      currency: data.currency || "INR",
      paymentStatus: data.paymentStatus || "Pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.payments.unshift(newPayment);
    await this.writeLocalDb(db);
    return newPayment;
  }

  public static async findPayments(filter?: {
    orderId?: string;
    userId?: string;
    status?: string;
    gateway?: string;
    search?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<PaymentRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    let payments = db.payments || [];

    if (filter) {
      if (filter.orderId) {
        payments = payments.filter(
          (p) => p.orderId === filter.orderId || p.orderNumber === filter.orderId
        );
      }
      if (filter.userId) {
        payments = payments.filter((p) => p.userId === filter.userId);
      }
      if (filter.status && filter.status !== "all") {
        payments = payments.filter(
          (p) => p.paymentStatus.toLowerCase() === filter.status!.toLowerCase()
        );
      }
      if (filter.gateway && filter.gateway !== "all") {
        payments = payments.filter(
          (p) => p.paymentGateway.toLowerCase() === filter.gateway!.toLowerCase()
        );
      }
      if (filter.fromDate) {
        const from = new Date(filter.fromDate).getTime();
        payments = payments.filter((p) => new Date(p.createdAt).getTime() >= from);
      }
      if (filter.toDate) {
        const to = new Date(filter.toDate).getTime();
        payments = payments.filter((p) => new Date(p.createdAt).getTime() <= to);
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        payments = payments.filter(
          (p) =>
            p.id.toLowerCase().includes(q) ||
            (p.orderNumber && p.orderNumber.toLowerCase().includes(q)) ||
            (p.orderId && p.orderId.toLowerCase().includes(q)) ||
            (p.transactionId && p.transactionId.toLowerCase().includes(q)) ||
            (p.gatewayOrderId && p.gatewayOrderId.toLowerCase().includes(q)) ||
            (p.customerName && p.customerName.toLowerCase().includes(q)) ||
            (p.customerEmail && p.customerEmail.toLowerCase().includes(q)) ||
            p.paymentGateway.toLowerCase().includes(q)
        );
      }
    }

    return payments;
  }

  public static async findPaymentById(id: string): Promise<PaymentRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return (
      (db.payments || []).find(
        (p) => p.id === id || p.transactionId === id || p.gatewayOrderId === id
      ) || null
    );
  }

  public static async findPaymentsByOrderId(orderId: string): Promise<PaymentRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return (db.payments || []).filter((p) => p.orderId === orderId || p.orderNumber === orderId);
  }

  public static async updatePayment(
    idOrTransactionId: string,
    updates: Partial<PaymentRecord>
  ): Promise<PaymentRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    if (!db.payments) return null;

    const index = db.payments.findIndex(
      (p) =>
        p.id === idOrTransactionId ||
        p.transactionId === idOrTransactionId ||
        p.gatewayOrderId === idOrTransactionId
    );
    if (index === -1) return null;

    db.payments[index] = {
      ...db.payments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.paymentStatus === "Paid") {
      const orderId = db.payments[index].orderId;
      await this.updateOrderPayment(orderId, {
        paymentStatus: "Paid",
        orderStatus: "Paid",
        paymentTransactionId: db.payments[index].transactionId,
        gatewayOrderId: db.payments[index].gatewayOrderId,
        paidAt: db.payments[index].paidAt || new Date().toISOString(),
      });
    }

    await this.writeLocalDb(db);
    return db.payments[index];
  }

  public static async recordPaymentRefund(
    id: string,
    refundAmount: number,
    refundReason?: string,
    refundReference?: string
  ): Promise<PaymentRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    if (!db.payments) return null;

    const index = db.payments.findIndex((p) => p.id === id || p.transactionId === id);
    if (index === -1) return null;

    const existing = db.payments[index];
    const totalRefunded = (existing.refundAmount || 0) + refundAmount;
    const isFullRefund = totalRefunded >= existing.amount;

    db.payments[index] = {
      ...existing,
      refundAmount: totalRefunded,
      refundReason: refundReason || existing.refundReason,
      refundReference:
        refundReference || "REF_" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      refundedAt: new Date().toISOString(),
      paymentStatus: isFullRefund ? "Refunded" : existing.paymentStatus,
      updatedAt: new Date().toISOString(),
    };

    const orderIndex = (db.orders || []).findIndex(
      (o) => o.id === existing.orderId || o.orderNumber === existing.orderNumber
    );
    if (orderIndex > -1) {
      const order = db.orders![orderIndex];
      const history = order.orderHistory || [];
      history.push({
        timestamp: new Date().toISOString(),
        action: "PAYMENT_REFUND",
        performedBy: "Admin",
        notes: `Refunded ${existing.currency} ${refundAmount.toFixed(2)}. Reason: ${
          refundReason || "N/A"
        }. Ref: ${db.payments[index].refundReference}`,
      });
      db.orders![orderIndex] = {
        ...order,
        orderHistory: history,
        orderStatus: isFullRefund ? "Cancelled By System" : order.orderStatus,
        updatedAt: new Date().toISOString(),
      };
    }

    await this.writeLocalDb(db);
    return db.payments[index];
  }

  // ================= CARTS & CART ITEMS =================
  public static async getOrCreateCart(
    userId?: string,
    sessionId?: string,
    persistNewCart: boolean = false
  ): Promise<{ cart: CartRecord; items: (CartItemRecord & { product: any; variant?: any })[] }> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    if (!db.carts) db.carts = [];
    if (!db.cartItems) db.cartItems = [];

    let cart: CartRecord | undefined;

    if (userId) {
      cart = db.carts.find((c) => c.userId === userId && c.status === "active");
    } else if (sessionId) {
      cart = db.carts.find((c) => c.sessionId === sessionId && c.status === "active");
    }

    if (!cart) {
      cart = {
        id: "cart_" + (sessionId ? sessionId.replace(/[^a-zA-Z0-9]/g, "") : Math.random().toString(36).substring(2, 9)),
        userId,
        sessionId,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (persistNewCart) {
        db.carts.push(cart);
        await this.writeLocalDb(db);
      }
    }

    const rawItems = db.cartItems.filter((i) => i.cartId === cart!.id);
    const products = db.products || [];

    const enrichedItems: (CartItemRecord & { product: any; variant?: any })[] = [];
    for (const item of rawItems) {
      const product = products.find((p) => p.id === item.productId || p.slug === item.productId);
      if (product) {
        let variant = null;
        if (item.variantId && Array.isArray(product.variants)) {
          variant = product.variants.find((v) => v.id === item.variantId);
        }
        enrichedItems.push({
          ...item,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: variant?.price ?? product.price,
            comparePrice: variant?.comparePrice ?? product.comparePrice,
            mainImage: variant?.image || product.mainImage || "/placeholder-product.png",
            currentStock: variant?.currentStock ?? product.currentStock,
            sku: variant?.sku || product.sku,
            brand: product.brand,
          },
          variant,
        });
      }
    }

    return { cart, items: enrichedItems };
  }

  public static async saveCartItem(
    cartId: string,
    itemData: {
      productId: string;
      variantId?: string;
      quantity: number;
      selectedAttributes?: Record<string, string>;
    }
  ): Promise<CartItemRecord> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    if (!db.cartItems) db.cartItems = [];

    const product = (db.products || []).find(
      (p) => p.id === itemData.productId || p.slug === itemData.productId
    );
    const maxStock = product?.currentStock ?? 999;
    const clampedQuantity = Math.max(1, Math.min(itemData.quantity, maxStock > 0 ? maxStock : 1));

    const existingIdx = db.cartItems.findIndex(
      (i) =>
        i.cartId === cartId &&
        i.productId === (product?.id || itemData.productId) &&
        (i.variantId || null) === (itemData.variantId || null)
    );

    if (existingIdx > -1) {
      db.cartItems[existingIdx].quantity = clampedQuantity;
      if (itemData.selectedAttributes) {
        db.cartItems[existingIdx].selectedAttributes = itemData.selectedAttributes;
      }
      db.cartItems[existingIdx].updatedAt = new Date().toISOString();
      await this.writeLocalDb(db);
      return db.cartItems[existingIdx];
    } else {
      const newItem: CartItemRecord = {
        id: "ci_" + Math.random().toString(36).substring(2, 9),
        cartId,
        productId: product?.id || itemData.productId,
        variantId: itemData.variantId,
        quantity: clampedQuantity,
        selectedAttributes: itemData.selectedAttributes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.cartItems.push(newItem);
      await this.writeLocalDb(db);
      return newItem;
    }
  }

  public static async updateCartItemQuantity(
    cartId: string,
    itemIdOrProductId: string,
    quantity: number,
    variantId?: string
  ): Promise<boolean> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    if (!db.cartItems) return false;

    const index = db.cartItems.findIndex(
      (i) =>
        i.cartId === cartId &&
        (i.id === itemIdOrProductId ||
          (i.productId === itemIdOrProductId && (!variantId || i.variantId === variantId)))
    );

    if (index === -1) return false;

    if (quantity <= 0) {
      db.cartItems.splice(index, 1);
    } else {
      db.cartItems[index].quantity = quantity;
      db.cartItems[index].updatedAt = new Date().toISOString();
    }

    await this.writeLocalDb(db);
    return true;
  }

  public static async removeCartItem(
    cartId: string,
    itemIdOrProductId: string,
    variantId?: string
  ): Promise<boolean> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    if (!db.cartItems) return false;

    const initialLen = db.cartItems.length;
    db.cartItems = db.cartItems.filter(
      (i) =>
        !(
          i.cartId === cartId &&
          (i.id === itemIdOrProductId ||
            (i.productId === itemIdOrProductId && (!variantId || i.variantId === variantId)))
        )
    );

    await this.writeLocalDb(db);
    return db.cartItems.length < initialLen;
  }

  public static async clearCart(cartId: string): Promise<boolean> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    if (!db.cartItems) return false;

    db.cartItems = db.cartItems.filter((i) => i.cartId !== cartId);

    if (db.carts) {
      const cart = db.carts.find((c) => c.id === cartId);
      if (cart) {
        cart.updatedAt = new Date().toISOString();
      }
    }

    await this.writeLocalDb(db);
    return true;
  }

  public static async mergeGuestCartIntoUserCart(
    guestSessionId: string,
    userId: string
  ): Promise<{ cart: CartRecord; items: (CartItemRecord & { product: any; variant?: any })[] }> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    if (!db.carts) db.carts = [];
    if (!db.cartItems) db.cartItems = [];

    const guestCart = db.carts.find((c) => c.sessionId === guestSessionId && c.status === "active");
    const userCartResult = await this.getOrCreateCart(userId);
    const userCart = userCartResult.cart;

    if (guestCart && guestCart.id !== userCart.id) {
      const guestItems = db.cartItems.filter((i) => i.cartId === guestCart.id);

      for (const gItem of guestItems) {
        const existingIdx = db.cartItems.findIndex(
          (u) =>
            u.cartId === userCart.id &&
            u.productId === gItem.productId &&
            (u.variantId || null) === (gItem.variantId || null)
        );

        if (existingIdx > -1) {
          const prod = (db.products || []).find((p) => p.id === gItem.productId);
          const maxStock = prod?.currentStock ?? 999;
          const mergedQty = Math.min(db.cartItems[existingIdx].quantity + gItem.quantity, maxStock);
          db.cartItems[existingIdx].quantity = mergedQty;
          db.cartItems[existingIdx].updatedAt = new Date().toISOString();
        } else {
          db.cartItems.push({
            id: "ci_" + Math.random().toString(36).substring(2, 9),
            cartId: userCart.id,
            productId: gItem.productId,
            variantId: gItem.variantId,
            quantity: gItem.quantity,
            selectedAttributes: gItem.selectedAttributes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      guestCart.status = "merged";
      guestCart.updatedAt = new Date().toISOString();
      db.cartItems = db.cartItems.filter((i) => i.cartId !== guestCart.id);
      await this.writeLocalDb(db);
    }

    return await this.getOrCreateCart(userId);
  }

  // ================= PRICING =================
  public static async getPricingSettings(): Promise<PricingSettingsRecord> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    if (!db.pricingSettings) {
      db.pricingSettings = {
        strikeThroughPricing: true,
        priceSync: true,
        priceRounding: false,
        defaultAdjustmentType: "%",
        defaultAdjustmentValue: 10,
        updatedAt: new Date().toISOString(),
      };
      await this.writeLocalDb(db);
    }
    return db.pricingSettings;
  }

  public static async updatePricingSettings(
    data: Partial<PricingSettingsRecord>
  ): Promise<PricingSettingsRecord> {
    const db = await this.readLocalDb();
    db.pricingSettings = {
      ...(db.pricingSettings || {
        strikeThroughPricing: true,
        priceSync: true,
        priceRounding: false,
        defaultAdjustmentType: "%",
        defaultAdjustmentValue: 10,
      }),
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await this.writeLocalDb(db);
    return db.pricingSettings;
  }

  public static async batchUpdateProductPrices(
    updates: { id: string; actualPrice: number; specialPrice?: number }[]
  ): Promise<{ success: boolean; updatedCount: number }> {
    const db = await this.readLocalDb();
    if (!db.products) return { success: false, updatedCount: 0 };

    let count = 0;
    const now = new Date().toISOString();

    for (const item of updates) {
      const p = db.products.find((prod) => prod.id === item.id || prod.sku === item.id);
      if (p) {
        if (item.specialPrice !== undefined && item.specialPrice > 0 && item.specialPrice < item.actualPrice) {
          p.comparePrice = item.actualPrice;
          p.price = item.specialPrice;
        } else {
          p.price = item.actualPrice;
          p.comparePrice = item.specialPrice || undefined;
        }
        p.updatedAt = now;
        count++;
      }
    }

    await this.writeLocalDb(db);
    return { success: true, updatedCount: count };
  }

  public static async applyGlobalPriceAdjustment(
    type: "%" | "$",
    value: number,
    categoryId?: string
  ): Promise<{ success: boolean; count: number }> {
    const db = await this.readLocalDb();
    if (!db.products) return { success: false, count: 0 };

    let count = 0;
    const now = new Date().toISOString();

    for (const prod of db.products) {
      if (categoryId && categoryId !== "all") {
        if (!prod.categoryIds || !prod.categoryIds.includes(categoryId)) {
          continue;
        }
      }

      const basePrice = prod.comparePrice || prod.price;
      let newPrice = prod.price;

      if (type === "%") {
        const diff = (basePrice * value) / 100;
        newPrice = Math.max(0.99, Number((basePrice - diff).toFixed(2)));
      } else {
        newPrice = Math.max(0.99, Number((basePrice - value).toFixed(2)));
      }

      prod.comparePrice = basePrice;
      prod.price = newPrice;
      prod.updatedAt = now;
      count++;
    }

    await this.writeLocalDb(db);
    return { success: true, count };
  }

  // ================= REVIEWS =================
  public static async findReviews(filters?: {
    rating?: number;
    search?: string;
    status?: string;
    productId?: string;
  }): Promise<ReviewRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    let reviews = db.reviews || [];

    if (filters) {
      if (filters.rating && filters.rating > 0) {
        reviews = reviews.filter((r) => r.rating === filters.rating);
      }
      if (filters.status && filters.status !== "All") {
        reviews = reviews.filter((r) => r.status.toLowerCase() === filters.status!.toLowerCase());
      }
      if (filters.productId) {
        reviews = reviews.filter((r) => r.productId === filters.productId || r.itemNo === filters.productId);
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        reviews = reviews.filter(
          (r) =>
            r.itemNo.toLowerCase().includes(q) ||
            r.productName.toLowerCase().includes(q) ||
            r.userEmail.toLowerCase().includes(q) ||
            r.review.toLowerCase().includes(q)
        );
      }
    }

    return reviews
      .map((r) => ({
        ...r,
        media: r.media || [],
        comments: r.comments || [],
        commentCount: r.comments ? r.comments.length : (r.commentCount || 0),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static async createReview(
    data: Omit<ReviewRecord, "id" | "createdAt" | "updatedAt" | "postedOn">
  ): Promise<ReviewRecord> {
    const db = await this.readLocalDb();
    const autoApprove = db.reviewAutoApprove !== false;
    const now = new Date().toISOString();

    const newRev: ReviewRecord = {
      id: "rev_" + Math.random().toString(36).substring(2, 9),
      ...data,
      status: autoApprove ? "Active" : "Pending",
      postedOn: now.split("T")[0],
      commentCount: data.comments ? data.comments.length : (data.commentCount || 0),
      media: data.media || [],
      comments: data.comments || [],
      createdAt: now,
      updatedAt: now,
    };

    if (!db.reviews) db.reviews = [];
    db.reviews.unshift(newRev);

    // Update Product's overall rating and reviewCount
    if (db.products) {
      const prod = db.products.find(
        (p) => p.id === newRev.productId || p.sku === newRev.itemNo
      );
      if (prod) {
        const activeProdReviews = db.reviews.filter(
          (r) => (r.productId === prod.id || r.itemNo === prod.sku) && r.status === "Active"
        );
        const totalRating = activeProdReviews.reduce((sum, r) => sum + r.rating, 0);
        prod.reviewsCount = activeProdReviews.length;
        prod.rating = activeProdReviews.length > 0 ? Number((totalRating / activeProdReviews.length).toFixed(1)) : 5.0;
        prod.updatedAt = now;
      }
    }

    await this.writeLocalDb(db);
    return newRev;
  }

  public static async addReviewComment(
    reviewId: string,
    data: { userName: string; userEmail: string; comment: string; isAdmin?: boolean }
  ): Promise<ReviewRecord | null> {
    const db = await this.readLocalDb();
    if (!db.reviews) return null;
    const review = db.reviews.find((r) => r.id === reviewId);
    if (!review) return null;

    if (!review.comments) review.comments = [];
    const newComment: ReviewCommentRecord = {
      id: "rcmt_" + Math.random().toString(36).substring(2, 9),
      reviewId,
      userName: data.userName,
      userEmail: data.userEmail,
      comment: data.comment,
      isAdmin: data.isAdmin !== undefined ? data.isAdmin : false,
      createdAt: new Date().toISOString(),
    };

    review.comments.push(newComment);
    review.commentCount = review.comments.length;
    review.updatedAt = new Date().toISOString();

    await this.writeLocalDb(db);
    return review;
  }

  public static async deleteReviewComment(
    reviewId: string,
    commentId: string
  ): Promise<ReviewRecord | null> {
    const db = await this.readLocalDb();
    if (!db.reviews) return null;
    const review = db.reviews.find((r) => r.id === reviewId);
    if (!review) return null;

    if (review.comments) {
      review.comments = review.comments.filter((c) => c.id !== commentId);
      review.commentCount = review.comments.length;
      review.updatedAt = new Date().toISOString();
      await this.writeLocalDb(db);
    }
    return review;
  }

  public static async updateReview(
    id: string,
    data: Partial<Omit<ReviewRecord, "id" | "createdAt" | "updatedAt">>
  ): Promise<ReviewRecord | null> {
    const db = await this.readLocalDb();
    if (!db.reviews) return null;
    const index = db.reviews.findIndex((r) => r.id === id);
    if (index === -1) return null;

    db.reviews[index] = {
      ...db.reviews[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.writeLocalDb(db);
    return db.reviews[index];
  }

  public static async deleteReview(id: string): Promise<boolean> {
    const db = await this.readLocalDb();
    if (!db.reviews) return false;
    db.reviews = db.reviews.filter((r) => r.id !== id);
    await this.writeLocalDb(db);
    return true;
  }

  public static async getReviewAutoApprove(): Promise<boolean> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return db.reviewAutoApprove !== false;
  }

  public static async setReviewAutoApprove(val: boolean): Promise<boolean> {
    const db = await this.readLocalDb();
    db.reviewAutoApprove = val;
    await this.writeLocalDb(db);
    return val;
  }

  // ================= Q&A =================
  public static async findQna(filters?: {
    search?: string;
    status?: string;
    productId?: string;
  }): Promise<QnaRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    let qnaList = db.qna || [];

    if (filters) {
      if (filters.status && filters.status !== "All") {
        qnaList = qnaList.filter((q) => q.status.toLowerCase() === filters.status!.toLowerCase());
      }
      if (filters.productId) {
        qnaList = qnaList.filter((q) => q.productId === filters.productId || q.itemNo === filters.productId);
      }
      if (filters.search && filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        qnaList = qnaList.filter(
          (q) =>
            q.itemNo.toLowerCase().includes(query) ||
            q.productName.toLowerCase().includes(query) ||
            q.userEmail.toLowerCase().includes(query) ||
            q.question.toLowerCase().includes(query)
        );
      }
    }

    return qnaList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static async createQna(
    data: Omit<QnaRecord, "id" | "createdAt" | "updatedAt" | "postedOn" | "answersCount" | "answers">
  ): Promise<QnaRecord> {
    const db = await this.readLocalDb();
    const autoApprove = db.qnaAutoApprove !== false;
    const now = new Date().toISOString();

    const newQna: QnaRecord = {
      id: "qna_" + Math.random().toString(36).substring(2, 9),
      ...data,
      rating: data.rating || 5,
      answersCount: 0,
      answers: [],
      status: autoApprove ? "Active" : "Inactive",
      postedOn: now.split("T")[0],
      createdAt: now,
      updatedAt: now,
    };

    if (!db.qna) db.qna = [];
    db.qna.unshift(newQna);
    await this.writeLocalDb(db);
    return newQna;
  }

  public static async updateQna(
    id: string,
    data: Partial<Omit<QnaRecord, "id" | "createdAt" | "updatedAt">>
  ): Promise<QnaRecord | null> {
    const db = await this.readLocalDb();
    if (!db.qna) return null;
    const index = db.qna.findIndex((q) => q.id === id);
    if (index === -1) return null;

    db.qna[index] = {
      ...db.qna[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.writeLocalDb(db);
    return db.qna[index];
  }

  public static async addQnaAnswer(
    qnaId: string,
    data: { userName: string; userEmail: string; answer: string; isOfficial?: boolean }
  ): Promise<QnaRecord | null> {
    const db = await this.readLocalDb();
    if (!db.qna) return null;
    const qna = db.qna.find((q) => q.id === qnaId);
    if (!qna) return null;

    if (!qna.answers) qna.answers = [];
    const newAnswer: QnaAnswerRecord = {
      id: "ans_" + Math.random().toString(36).substring(2, 9),
      qnaId,
      userName: data.userName,
      userEmail: data.userEmail,
      answer: data.answer,
      isOfficial: data.isOfficial !== undefined ? data.isOfficial : true,
      createdAt: new Date().toISOString(),
    };

    qna.answers.push(newAnswer);
    qna.answersCount = qna.answers.length;
    qna.updatedAt = new Date().toISOString();

    await this.writeLocalDb(db);
    return qna;
  }

  public static async deleteQna(id: string): Promise<boolean> {
    const db = await this.readLocalDb();
    if (!db.qna) return false;
    db.qna = db.qna.filter((q) => q.id !== id);
    await this.writeLocalDb(db);
    return true;
  }

  public static async getQnaAutoApprove(): Promise<boolean> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return db.qnaAutoApprove !== false;
  }

  public static async setQnaAutoApprove(val: boolean): Promise<boolean> {
    const db = await this.readLocalDb();
    db.qnaAutoApprove = val;
    await this.writeLocalDb(db);
    return val;
  }

  // ================= WISHLIST =================
  public static async findWishlist(search?: string): Promise<WishlistRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    let items = db.wishlist || [];

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      items = items.filter(
        (w) => w.itemNo.toLowerCase().includes(q) || w.name.toLowerCase().includes(q)
      );
    }

    return items.sort((a, b) => b.wishlistCount - a.wishlistCount);
  }

  public static async toggleWishlistProduct(
    productId: string,
    userId: string = "guest_user"
  ): Promise<{ wishlisted: boolean; count: number }> {
    const db = await this.readLocalDb();
    if (!db.wishlist) db.wishlist = [];

    // Find the product
    const prod = (db.products || []).find((p) => p.id === productId || p.sku === productId);
    let item = db.wishlist.find((w) => w.productId === productId || w.itemNo === productId);

    if (!item && prod) {
      item = {
        id: "wl_" + Math.random().toString(36).substring(2, 9),
        productId: prod.id,
        itemNo: prod.sku,
        name: prod.name,
        productImage: prod.mainImage || undefined,
        totalQuantity: prod.currentStock,
        wishlistCount: 0,
        userIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.wishlist.push(item);
    }

    if (!item) return { wishlisted: false, count: 0 };

    if (!item.userIds) item.userIds = [];
    const userIndex = item.userIds.indexOf(userId);
    let wishlisted = false;

    if (userIndex > -1) {
      item.userIds.splice(userIndex, 1);
      item.wishlistCount = Math.max(0, item.wishlistCount - 1);
      wishlisted = false;
    } else {
      item.userIds.push(userId);
      item.wishlistCount += 1;
      wishlisted = true;
    }

    if (prod) {
      item.totalQuantity = prod.currentStock;
    }

    item.updatedAt = new Date().toISOString();
    await this.writeLocalDb(db);
    return { wishlisted, count: item.wishlistCount };
  }

  // ================= COUPONS =================
  public static async findCoupons(): Promise<CouponRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return (db.coupons || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public static async findCouponByCode(code: string): Promise<CouponRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return (db.coupons || []).find((c) => c.code.toUpperCase() === code.toUpperCase().trim()) || null;
  }

  public static async createCoupon(
    data: Omit<CouponRecord, "id" | "createdAt" | "updatedAt" | "usedCount">
  ): Promise<CouponRecord> {
    const db = await this.readLocalDb();
    const newCoupon: CouponRecord = {
      id: "cpn_" + Math.random().toString(36).substring(2, 9),
      ...data,
      code: data.code.toUpperCase().trim(),
      usedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!db.coupons) db.coupons = [];
    db.coupons.unshift(newCoupon);
    await this.writeLocalDb(db);
    return newCoupon;
  }

  public static async updateCoupon(
    id: string,
    data: Partial<Omit<CouponRecord, "id" | "createdAt" | "updatedAt">>
  ): Promise<CouponRecord | null> {
    const db = await this.readLocalDb();
    if (!db.coupons) return null;
    const index = db.coupons.findIndex((c) => c.id === id);
    if (index === -1) return null;

    db.coupons[index] = {
      ...db.coupons[index],
      ...data,
      ...(data.code ? { code: data.code.toUpperCase().trim() } : {}),
      updatedAt: new Date().toISOString(),
    };

    await this.writeLocalDb(db);
    return db.coupons[index];
  }

  public static async deleteCoupon(id: string): Promise<boolean> {
    const db = await this.readLocalDb();
    if (!db.coupons) return false;
    db.coupons = db.coupons.filter((c) => c.id !== id);
    await this.writeLocalDb(db);
    return true;
  }

  public static async validateAndApplyCoupon(
    code: string,
    subtotal: number,
    shippingCost: number = 0
  ): Promise<{
    valid: boolean;
    error?: string;
    discountAmount: number;
    freeShipping: boolean;
    finalTotal: number;
    coupon?: CouponRecord;
  }> {
    const coupon = await this.findCouponByCode(code);
    if (!coupon) {
      return { valid: false, error: "Invalid coupon code", discountAmount: 0, freeShipping: false, finalTotal: subtotal + shippingCost };
    }

    if (!coupon.isActive) {
      return { valid: false, error: "This coupon is currently inactive", discountAmount: 0, freeShipping: false, finalTotal: subtotal + shippingCost };
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
      return { valid: false, error: "This coupon has expired", discountAmount: 0, freeShipping: false, finalTotal: subtotal + shippingCost };
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: "This coupon has reached its maximum usage limit", discountAmount: 0, freeShipping: false, finalTotal: subtotal + shippingCost };
    }

    if (coupon.minAmount > 0 && subtotal < coupon.minAmount) {
      return {
        valid: false,
        error: `Order subtotal must be at least $${coupon.minAmount.toFixed(2)} to use this coupon`,
        discountAmount: 0,
        freeShipping: false,
        finalTotal: subtotal + shippingCost,
      };
    }

    let discount = 0;
    let freeShip = false;

    if (coupon.couponType.includes("Free shipping") || coupon.couponType.includes("Free Shipping")) {
      freeShip = true;
    }

    if (coupon.discountPercentage > 0) {
      discount = (subtotal * coupon.discountPercentage) / 100;
    } else if (coupon.discountAmount > 0) {
      discount = coupon.discountAmount;
    }

    discount = Math.min(discount, subtotal);
    const finalShip = freeShip ? 0 : shippingCost;
    const finalTotal = Math.max(0, Number((subtotal - discount + finalShip).toFixed(2)));

    return {
      valid: true,
      discountAmount: Number(discount.toFixed(2)),
      freeShipping: freeShip,
      finalTotal,
      coupon,
    };
  }

  // ================= PAYMENT GATEWAYS =================
  public static async findGateways(activeOnly = false): Promise<PaymentGatewayRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    let list = db.gateways || [];
    if (activeOnly) {
      list = list.filter((g) => g.isActive);
    }
    return list.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public static async findGatewayById(id: string): Promise<PaymentGatewayRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return (
      (db.gateways || []).find(
        (g) => g.id === id || g.code.toLowerCase() === id.toLowerCase()
      ) || null
    );
  }

  public static async createGateway(
    data: Omit<PaymentGatewayRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<PaymentGatewayRecord> {
    const db = await this.readLocalDb();
    if (!db.gateways) db.gateways = [];

    if (data.isDefault) {
      db.gateways.forEach((g) => {
        g.isDefault = false;
      });
    }

    const newGateway: PaymentGatewayRecord = {
      id: "gw_" + Math.random().toString(36).substring(2, 9),
      ...data,
      displayOrder: data.displayOrder ?? (db.gateways.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.gateways.push(newGateway);
    await this.writeLocalDb(db);
    return newGateway;
  }

  public static async updateGateway(
    id: string,
    data: Partial<Omit<PaymentGatewayRecord, "id" | "createdAt" | "updatedAt">>
  ): Promise<PaymentGatewayRecord | null> {
    const db = await this.readLocalDb();
    if (!db.gateways) db.gateways = [];
    const index = db.gateways.findIndex((g) => g.id === id);
    if (index === -1) return null;

    if (data.isDefault) {
      db.gateways.forEach((g) => {
        g.isDefault = false;
      });
    }

    db.gateways[index] = {
      ...db.gateways[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.writeLocalDb(db);
    return db.gateways[index];
  }

  public static async setDefaultGateway(id: string): Promise<PaymentGatewayRecord | null> {
    const db = await this.readLocalDb();
    if (!db.gateways) return null;
    const target = db.gateways.find((g) => g.id === id);
    if (!target) return null;

    db.gateways.forEach((g) => {
      g.isDefault = g.id === id;
      g.updatedAt = new Date().toISOString();
    });

    await this.writeLocalDb(db);
    return target;
  }

  public static async deleteGateway(id: string): Promise<boolean> {
    const db = await this.readLocalDb();
    if (!db.gateways) return false;
    db.gateways = db.gateways.filter((g) => g.id !== id);
    await this.writeLocalDb(db);
    return true;
  }


  // ================= SHIPPING PROVIDERS & SHIPMENTS =================
  public static async findShippingProviders(activeOnly = false): Promise<ShippingProviderRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    let list = db.shippingProviders || [];
    if (activeOnly) {
      list = list.filter((p) => p.isEnabled);
    }
    return list;
  }

  public static async findShippingProviderById(id: string): Promise<ShippingProviderRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return (
      (db.shippingProviders || []).find(
        (p) => p.id === id || p.code.toLowerCase() === id.toLowerCase()
      ) || null
    );
  }

  public static async findShippingProviderByCode(code: string): Promise<ShippingProviderRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return (
      (db.shippingProviders || []).find(
        (p) => p.code.toLowerCase() === code.toLowerCase()
      ) || null
    );
  }

  public static async createShippingProvider(
    data: Omit<ShippingProviderRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<ShippingProviderRecord> {
    const db = await this.readLocalDb();
    if (!db.shippingProviders) db.shippingProviders = [];

    if (data.isDefault) {
      db.shippingProviders.forEach((p) => {
        p.isDefault = false;
      });
    }

    const newProvider: ShippingProviderRecord = {
      id: "sp_" + Math.random().toString(36).substring(2, 9),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.shippingProviders.push(newProvider);
    await this.writeLocalDb(db);
    return newProvider;
  }

  public static async updateShippingProvider(
    id: string,
    data: Partial<Omit<ShippingProviderRecord, "id" | "createdAt" | "updatedAt">>
  ): Promise<ShippingProviderRecord | null> {
    const db = await this.readLocalDb();
    if (!db.shippingProviders) db.shippingProviders = [];
    const index = db.shippingProviders.findIndex(
      (p) => p.id === id || p.code.toLowerCase() === id.toLowerCase()
    );
    if (index === -1) return null;

    if (data.isDefault) {
      db.shippingProviders.forEach((p) => {
        p.isDefault = false;
      });
    }

    db.shippingProviders[index] = {
      ...db.shippingProviders[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.writeLocalDb(db);
    return db.shippingProviders[index];
  }

  public static async setDefaultShippingProvider(id: string): Promise<ShippingProviderRecord | null> {
    const db = await this.readLocalDb();
    if (!db.shippingProviders) return null;
    const target = db.shippingProviders.find(
      (p) => p.id === id || p.code.toLowerCase() === id.toLowerCase()
    );
    if (!target) return null;

    db.shippingProviders.forEach((p) => {
      p.isDefault = p.id === target.id;
      p.updatedAt = new Date().toISOString();
    });

    await this.writeLocalDb(db);
    return target;
  }

  public static async deleteShippingProvider(
    id: string
  ): Promise<{ success: boolean; message?: string }> {
    const db = await this.readLocalDb();
    if (!db.shippingProviders) return { success: false, message: "No shipping providers found" };

    const hasShipments = (db.shipments || []).some((s) => s.shippingProviderId === id);
    if (hasShipments) {
      const target = db.shippingProviders.find((p) => p.id === id);
      if (target) {
        target.isEnabled = false;
        target.updatedAt = new Date().toISOString();
        await this.writeLocalDb(db);
        return {
          success: true,
          message:
            "Provider has linked shipment records. It has been disabled to preserve historical tracking records.",
        };
      }
    }

    db.shippingProviders = db.shippingProviders.filter((p) => p.id !== id);
    await this.writeLocalDb(db);
    return { success: true };
  }

  // ================= SHIPMENTS =================
  public static async findShipments(filter?: {
    orderId?: string;
    search?: string;
    status?: string;
    providerId?: string;
  }): Promise<ShipmentRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    let list = db.shipments || [];

    if (filter?.orderId) {
      list = list.filter((s) => s.orderId === filter.orderId || s.orderNumber === filter.orderId);
    }
    if (filter?.status && filter.status !== "All") {
      list = list.filter((s) => s.shipmentStatus?.toLowerCase() === filter.status?.toLowerCase());
    }
    if (filter?.providerId && filter.providerId !== "All") {
      list = list.filter(
        (s) =>
          s.shippingProviderId === filter.providerId ||
          s.shippingProviderCode?.toLowerCase() === filter.providerId?.toLowerCase()
      );
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.awbNumber?.toLowerCase().includes(q) ||
          s.orderNumber?.toLowerCase().includes(q) ||
          s.recipientName?.toLowerCase().includes(q) ||
          s.shippingAddress?.toLowerCase().includes(q) ||
          s.carrier?.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static async findShipmentById(id: string): Promise<ShipmentRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return (db.shipments || []).find((s) => s.id === id) || null;
  }

  public static async findShipmentByIdOrAwb(idOrAwb: string): Promise<ShipmentRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return (
      (db.shipments || []).find(
        (s) => s.id === idOrAwb || s.awbNumber?.toLowerCase() === idOrAwb.toLowerCase()
      ) || null
    );
  }

  public static async createShipment(
    data: Omit<ShipmentRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<ShipmentRecord> {
    const db = await this.readLocalDb();
    if (!db.shipments) db.shipments = [];

    const newShipment: ShipmentRecord = {
      id: "shp_" + Math.random().toString(36).substring(2, 9),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.shipments.push(newShipment);
    await this.writeLocalDb(db);
    return newShipment;
  }

  public static async updateShipment(
    id: string,
    updates: Partial<ShipmentRecord>
  ): Promise<ShipmentRecord | null> {
    const db = await this.readLocalDb();
    if (!db.shipments) db.shipments = [];
    const index = db.shipments.findIndex(
      (s) => s.id === id || s.awbNumber?.toLowerCase() === id.toLowerCase()
    );
    if (index === -1) return null;

    db.shipments[index] = {
      ...db.shipments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.writeLocalDb(db);
    return db.shipments[index];
  }

  // ================= SHIPPING SETTINGS & ZONES =================
  public static async getShippingSettings(): Promise<ShippingSettingsRecord> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    if (!db.shippingSettings) {
      return {
        defaultProviderCode: "shiprocket",
        autoDispatch: false,
        allowManualDispatch: true,
        freeShippingThreshold: 500,
        defaultWeightKg: 0.5,
        senderAddress: {
          contactName: "Logistics Manager",
          companyName: "emox Store Hub",
          addressLine: "Unit 14, Prime Industrial Area",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400050",
          country: "India",
          phone: "+91 98200 12345",
          email: "dispatch@store.com",
        },
        trackingNotificationEmail: true,
        trackingNotificationSms: true,
        codAvailability: true,
        codExtraCharge: 40,
        updatedAt: new Date().toISOString(),
      };
    }
    return db.shippingSettings;
  }

  public static async updateShippingSettings(
    updates: Partial<ShippingSettingsRecord>
  ): Promise<ShippingSettingsRecord> {
    const db = await this.readLocalDb();
    const current = await this.getShippingSettings();
    const updated: ShippingSettingsRecord = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    db.shippingSettings = updated;
    await this.writeLocalDb(db);
    return updated;
  }

  public static async getShippingZones(): Promise<ShippingZoneRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return db.shippingZones || [];
  }

  public static async saveShippingZone(
    data: Partial<ShippingZoneRecord>
  ): Promise<ShippingZoneRecord> {
    const db = await this.readLocalDb();
    if (!db.shippingZones) db.shippingZones = [];

    if (data.id) {
      const idx = db.shippingZones.findIndex((z) => z.id === data.id);
      if (idx !== -1) {
        db.shippingZones[idx] = {
          ...db.shippingZones[idx],
          ...data,
          updatedAt: new Date().toISOString(),
        } as ShippingZoneRecord;
        await this.writeLocalDb(db);
        return db.shippingZones[idx];
      }
    }

    const newZone: ShippingZoneRecord = {
      id: "zone_" + Math.random().toString(36).substring(2, 9),
      name: data.name || "Standard Zone",
      zoneType: data.zoneType || "regional",
      pincodePrefixes: data.pincodePrefixes || [],
      baseRate: Number(data.baseRate) || 50,
      additionalPerKg: Number(data.additionalPerKg) || 25,
      estimatedDeliveryDays: Number(data.estimatedDeliveryDays) || 3,
      isActive: data.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.shippingZones.push(newZone);
    await this.writeLocalDb(db);
    return newZone;
  }

  public static async deleteShippingZone(id: string): Promise<boolean> {
    const db = await this.readLocalDb();
    if (!db.shippingZones) return false;
    db.shippingZones = db.shippingZones.filter((z) => z.id !== id);
    await this.writeLocalDb(db);
    return true;
  }

  // ================= THEMES & PREVIEWS =================
  public static getDefaultThemeRecord(): ThemeRecord {
    return {
      id: "thm_flone",
      name: "Flone",
      slug: "flone",
      version: "2.4.0",
      thumbnail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80",
      description: "Clean, ultra-responsive modern e-commerce storefront with multi-section layout and high-conversion product showcases.",
      author: "ThemeCraft",
      isActive: true,
      isSystem: true,
      config: {
        design: {
          primaryColor: "#2563eb",
          secondaryColor: "#1e293b",
          accentColor: "#f59e0b",
          backgroundColor: "#ffffff",
          textColor: "#0f172a",
          fontFamily: "Inter, sans-serif",
          headingFont: "Inter, sans-serif",
          headerStyle: "modern",
          footerStyle: "standard",
          announcementBar: {
            enabled: true,
            text: "Note: Limited time offer - Get free express delivery on all orders over $50!",
            link: "/#deals",
            bgColor: "#1e293b",
            textColor: "#ffffff",
          },
        },
        sections: {
          heroSlider: true,
          popularCategories: true,
          todaysDeals: true,
          promoBanners: true,
          winterWear: true,
          recentlyViewed: true,
          order: ["heroSlider", "popularCategories", "todaysDeals", "promoBanners", "winterWear", "recentlyViewed"],
        },
        integrations: {
          captchaEnabled: false,
          microsoftUetTag: "TAG-98234-MS",
          metaPixelId: "PIXEL-4492019",
          maintenanceMode: false,
          maintenanceMessage: "We are currently performing scheduled maintenance. Please check back shortly.",
        },
        customCss: "",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  public static async findThemes(): Promise<ThemeRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return db.themes || [];
  }

  public static async getActiveTheme(): Promise<ThemeRecord> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    const active = (db.themes || []).find((t) => t.isActive);
    if (active) return active;
    if (db.themes && db.themes.length > 0) return db.themes[0];
    return this.getDefaultThemeRecord();
  }

  public static async findThemeById(id: string): Promise<ThemeRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return (db.themes || []).find((t) => t.id === id || t.slug === id) || null;
  }

  public static async activateTheme(id: string): Promise<ThemeRecord | null> {
    const db = await this.readLocalDb();
    if (!db.themes) return null;
    const target = db.themes.find((t) => t.id === id || t.slug === id);
    if (!target) return null;

    db.themes.forEach((t) => {
      t.isActive = t.id === target.id;
      t.updatedAt = new Date().toISOString();
    });

    if (db.settings) {
      db.settings.themeName = target.name;
      db.settings.updatedAt = new Date().toISOString();
    }

    await this.writeLocalDb(db);
    return target;
  }

  public static async updateThemeConfig(
    id: string,
    config: Partial<ThemeConfigRecord>
  ): Promise<ThemeRecord | null> {
    const db = await this.readLocalDb();
    if (!db.themes) return null;
    const index = db.themes.findIndex((t) => t.id === id || t.slug === id);
    if (index === -1) return null;

    const existing = db.themes[index];
    db.themes[index] = {
      ...existing,
      config: {
        ...existing.config,
        ...config,
        design: {
          ...existing.config.design,
          ...(config.design || {}),
        },
        sections: {
          ...existing.config.sections,
          ...(config.sections || {}),
        },
        integrations: {
          ...existing.config.integrations,
          ...(config.integrations || {}),
        },
      },
      updatedAt: new Date().toISOString(),
    };

    await this.writeLocalDb(db);
    return db.themes[index];
  }

  public static async createTheme(
    data: Omit<ThemeRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<ThemeRecord> {
    const db = await this.readLocalDb();
    if (!db.themes) db.themes = [];

    if (data.isActive) {
      db.themes.forEach((t) => {
        t.isActive = false;
      });
    }

    const newTheme: ThemeRecord = {
      id: "thm_" + Math.random().toString(36).substring(2, 9),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.themes.push(newTheme);
    await this.writeLocalDb(db);
    return newTheme;
  }

  public static async deleteTheme(id: string): Promise<boolean> {
    const db = await this.readLocalDb();
    if (!db.themes) return false;
    const target = db.themes.find((t) => t.id === id);
    if (!target || target.isSystem || target.isActive) {
      return false;
    }
    db.themes = db.themes.filter((t) => t.id !== id);
    await this.writeLocalDb(db);
    return true;
  }

  // ================= ADDRESSES =================
  public static async findAddresses(query?: {
    userId?: string;
    customerEmail?: string;
    type?: "billing" | "shipping";
  }): Promise<AddressRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    let list = db.addresses || [];
    if (query) {
      if (query.userId) {
        list = list.filter((a) => a.userId === query.userId);
      }
      if (query.customerEmail) {
        list = list.filter(
          (a) => a.customerEmail?.toLowerCase() === query.customerEmail?.toLowerCase()
        );
      }
      if (query.type) {
        list = list.filter((a) => a.type === query.type);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static async findAddressById(id: string): Promise<AddressRecord | null> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    return (db.addresses || []).find((a) => a.id === id) || null;
  }

  public static async createAddress(
    data: Omit<AddressRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<AddressRecord> {
    const db = await this.readLocalDb();
    if (!db.addresses) db.addresses = [];

    if (data.isDefault) {
      db.addresses.forEach((a) => {
        if (
          a.type === data.type &&
          ((data.userId && a.userId === data.userId) ||
            (data.customerEmail &&
              a.customerEmail?.toLowerCase() === data.customerEmail.toLowerCase()))
        ) {
          a.isDefault = false;
        }
      });
    }

    const newAddr: AddressRecord = {
      id: "addr_" + Math.random().toString(36).substring(2, 9),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addresses.unshift(newAddr);
    await this.writeLocalDb(db);
    return newAddr;
  }

  public static async updateAddress(
    id: string,
    data: Partial<Omit<AddressRecord, "id" | "createdAt" | "updatedAt">>
  ): Promise<AddressRecord | null> {
    const db = await this.readLocalDb();
    if (!db.addresses) return null;
    const index = db.addresses.findIndex((a) => a.id === id);
    if (index === -1) return null;

    if (data.isDefault) {
      const targetType = data.type || db.addresses[index].type;
      const targetEmail = data.customerEmail || db.addresses[index].customerEmail;
      const targetUserId = data.userId || db.addresses[index].userId;
      db.addresses.forEach((a) => {
        if (
          a.id !== id &&
          a.type === targetType &&
          ((targetUserId && a.userId === targetUserId) ||
            (targetEmail && a.customerEmail?.toLowerCase() === targetEmail.toLowerCase()))
        ) {
          a.isDefault = false;
        }
      });
    }

    db.addresses[index] = {
      ...db.addresses[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.writeLocalDb(db);
    return db.addresses[index];
  }

  public static async deleteAddress(
    id: string,
    userId?: string,
    userEmail?: string
  ): Promise<{ success: boolean; error?: string }> {
    const db = await this.readLocalDb();
    if (!db.addresses) return { success: false, error: "No addresses found." };
    const address = db.addresses.find((a) => a.id === id);
    if (!address) return { success: false, error: "Address not found." };

    // Validate ownership if userId or userEmail is provided
    if (userId && address.userId && address.userId !== userId) {
      return { success: false, error: "You do not have permission to delete this address." };
    }
    if (userEmail && address.customerEmail && address.customerEmail.toLowerCase() !== userEmail.toLowerCase()) {
      return { success: false, error: "You do not have permission to delete this address." };
    }

    // Check if the address is currently used in an active uncompleted order
    const hasActiveOrder = (db.orders || []).some(
      (o) =>
        (o.orderStatus === "Pending" || o.orderStatus === "Processing") &&
        o.paymentStatus === "Pending" &&
        (o.shippingAddressDetail?.id === id || o.billingAddressDetail?.id === id)
    );
    if (hasActiveOrder) {
      return {
        success: false,
        error: "Cannot delete this address because it is associated with an active in-progress checkout operation.",
      };
    }

    db.addresses = db.addresses.filter((a) => a.id !== id);
    await this.writeLocalDb(db);
    return { success: true };
  }

  // ================= INITIAL SEED DATA =================

  public static async seedInitialData(): Promise<void> {
    if (this.isSeeded) return;
    this.isSeeded = true;
    const db = await this.readLocalDb();
    let hasChanges = false;

    // 0. Seed Settings if missing
    if (!db.settings) {
      db.settings = this.getDefaultSettings();
      hasChanges = true;
    }

    // 1. Seed Categories matching Image 3 if empty
    if (!db.categories || db.categories.length === 0) {
      db.categories = [
        {
          id: "cat_root_1",
          name: "yatdfya wdyawcd yatwdc aywdcw aywtdca wydtacwd ...",
          slug: "yatdfya-root",
          level: 0,
          isActive: true,
          displayOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "cat_root_us1",
          name: "us1",
          slug: "us1",
          level: 0,
          isActive: true,
          displayOrder: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "cat_sub_laptops",
          name: "laptops",
          slug: "us1-laptops",
          parentId: "cat_root_us1",
          level: 1,
          isActive: true,
          displayOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "cat_sub_gaming_laptops",
          name: "gaming-laptops",
          slug: "us1-laptops-gaming",
          parentId: "cat_sub_laptops",
          level: 2,
          isActive: true,
          displayOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "cat_root_uk1",
          name: "uk1",
          slug: "uk1",
          level: 0,
          isActive: true,
          displayOrder: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "cat_root_microsoft",
          name: "microsoft",
          slug: "microsoft",
          level: 0,
          isActive: true,
          displayOrder: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "cat_root_multisite",
          name: "multisite",
          slug: "multisite",
          level: 0,
          isActive: true,
          displayOrder: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "cat_other",
          name: "other",
          slug: "other",
          level: 0,
          isActive: true,
          displayOrder: 6,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "cat_grocery",
          name: "grocery",
          slug: "grocery",
          level: 0,
          isActive: true,
          displayOrder: 7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "cat_sportshoes",
          name: "sportshoes",
          slug: "sportshoes",
          level: 0,
          isActive: true,
          displayOrder: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    // 2. Seed Products matching Image 2
    if (!db.products || db.products.length <= 3) {
      db.products = [
        {
          id: "prod_mar2832023",
          sku: "mar2832023",
          upc: "UPC:992817264101",
          name: "mar2832023",
          slug: "mar2832023",
          description: "Festival ceremonial showpiece crafted with intricate detailing",
          price: 149.99,
          comparePrice: 199.99,
          costPrice: 90.0,
          currentStock: 25,
          minStock: 5,
          warehouse: "gyanwarehouse",
          status: "ACTIVE",
          isSoldOut: false,
          brand: "Heritage Art",
          googleMerchantSync: true,
          googleCategory: "Home & Garden > Decor > Statues",
          googleCondition: "new",
          googleBrand: "Heritage Art",
          googleGtin: "992817264101",
          googleMpn: "MAR2832023",
          googleSyncStatus: "SYNCED",
          googleLastSyncedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "prod_t210",
          sku: "t210",
          upc: "UPC:854632148711",
          name: "tablet-t210",
          slug: "tablet-t210",
          description: "Compact 8-inch Android tablet with vibrant HD display and quad-core CPU",
          price: 199.99,
          comparePrice: 249.99,
          costPrice: 130.0,
          currentStock: 50,
          minStock: 10,
          warehouse: "gyanwarehouse",
          status: "ACTIVE",
          isSoldOut: false,
          brand: "emox Tech",
          googleMerchantSync: true,
          googleCategory: "Electronics > Computers > Tablets",
          googleCondition: "new",
          googleBrand: "emox",
          googleGtin: "854632148711",
          googleMpn: "T210-TAB",
          googleSyncStatus: "READY",
          googleLastSyncedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "prod_l2150",
          sku: "l2150",
          upc: "UPC:854632148716",
          name: "laptop-l2150",
          slug: "laptop-l2150",
          description: "Ultra-slim 15.6 inch high efficiency productivity laptop",
          price: 699.99,
          comparePrice: 849.99,
          costPrice: 500.0,
          currentStock: 30,
          minStock: 8,
          warehouse: "gyanwarehouse",
          status: "ACTIVE",
          isSoldOut: false,
          brand: "emox Tech",
          googleMerchantSync: true,
          googleCategory: "Electronics > Computers > Laptops",
          googleCondition: "new",
          googleBrand: "emox",
          googleGtin: "854632148716",
          googleMpn: "L2150-PRO",
          googleSyncStatus: "SYNCED",
          googleLastSyncedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      if (!db.productCategories) db.productCategories = [];
      const defaultCatIds = ["cat_other", "cat_grocery", "cat_sportshoes"];
      ["prod_mar2832023", "prod_t210", "prod_l2150"].forEach((pid) => {
        defaultCatIds.forEach((cid, idx) => {
          if (!db.productCategories.some((pc) => pc.productId === pid && pc.categoryId === cid)) {
            db.productCategories.push({ productId: pid, categoryId: cid, isMain: idx === 0 });
          }
        });
      });
    }

    // 3. Seed Clean Standard Roles if empty
    if (!db.roles || db.roles.length === 0) {
      db.roles = [
        {
          id: "role_admin",
          name: "Super Administrator",
          slug: "super-admin",
          description: "Full system access to entire eCommerce platform, configurations, and operations",
          screenPrivilegesCount: 85,
          status: "Active",
          isSystem: true,
          permissions: {
            dashboard: { canView: true, canCreate: true, canEdit: true, canDelete: true },
            assets: { canView: true, canCreate: true, canEdit: true, canDelete: true },
            customers: { canView: true, canCreate: true, canEdit: true, canDelete: true },
            roles: { canView: true, canCreate: true, canEdit: true, canDelete: true },
            manufacturers: { canView: true, canCreate: true, canEdit: true, canDelete: true },
            products: { canView: true, canCreate: true, canEdit: true, canDelete: true },
            inventory: { canView: true, canCreate: true, canEdit: true, canDelete: true },
            pricing: { canView: true, canCreate: true, canEdit: true, canDelete: true },
            orders: { canView: true, canCreate: true, canEdit: true, canDelete: true },
            shipping: { canView: true, canCreate: true, canEdit: true, canDelete: true },
            settings: { canView: true, canCreate: true, canEdit: true, canDelete: true },
            marketing: { canView: true, canCreate: true, canEdit: true, canDelete: true },
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "role_store_manager",
          name: "Store Manager",
          slug: "store-manager",
          description: "Catalog, inventory management, shipments, and customer order processing",
          screenPrivilegesCount: 45,
          status: "Active",
          isSystem: false,
          permissions: {
            dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
            products: { canView: true, canCreate: true, canEdit: true, canDelete: false },
            inventory: { canView: true, canCreate: true, canEdit: true, canDelete: false },
            orders: { canView: true, canCreate: true, canEdit: true, canDelete: false },
            shipping: { canView: true, canCreate: true, canEdit: true, canDelete: false },
            customers: { canView: true, canCreate: false, canEdit: false, canDelete: false },
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "role_editor",
          name: "Content Editor",
          slug: "content-editor",
          description: "Product descriptions, media assets, marketing sliders, and promotional banners",
          screenPrivilegesCount: 25,
          status: "Active",
          isSystem: false,
          permissions: {
            dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
            assets: { canView: true, canCreate: true, canEdit: true, canDelete: false },
            products: { canView: true, canCreate: true, canEdit: true, canDelete: false },
            marketing: { canView: true, canCreate: true, canEdit: true, canDelete: false },
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "role_support",
          name: "Customer Support",
          slug: "customer-support",
          description: "Order status inquiries, customer address updates, and product reviews/Q&A",
          screenPrivilegesCount: 20,
          status: "Active",
          isSystem: false,
          permissions: {
            dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
            customers: { canView: true, canCreate: false, canEdit: true, canDelete: false },
            orders: { canView: true, canCreate: false, canEdit: true, canDelete: false },
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    // 4. Seed Clean Users if empty
    if (!db.users || db.users.length === 0) {
      db.users = [
        {
          id: "usr_admin_gyan",
          name: "Gyan Admin",
          firstName: "Gyan",
          lastName: "Admin",
          email: "gyan@gmail.com",
          password: "$2b$10$ZcPqhhBeLxemam7v/EATFOFjAztyjOp917S7gDQQmYpcJG.080cli", // gyan@123
          role: "ADMIN",
          roleId: "role_admin",
          assignedRoles: ["role_admin"],
          accountType: "admin",
          type: "admin",
          customerType: "Admin",
          country: "India",
          countryCode: "IN",
          state: "Haryana",
          city: "Gurugram",
          postalCode: "122015",
          phone: "+91 9876543210",
          mobileNumber: "+91 9876543210",
          status: "ACTIVE",
          credit: 0,
          ordersCount: 0,
          wishlistCount: 0,
          lastLogin: "Just now",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "usr_cust_gyanchandra",
          name: "Gyan Chandra",
          firstName: "Gyan",
          lastName: "Chandra",
          email: "gyanchandranist@gmail.com",
          password: "$2b$10$ZcPqhhBeLxemam7v/EATFOFjAztyjOp917S7gDQQmYpcJG.080cli", // gyan@123
          role: "CUSTOMER",
          roleId: "",
          assignedRoles: [],
          accountType: "customer",
          type: "customer",
          customerType: "Customer",
          country: "India",
          countryCode: "IN",
          state: "Haryana",
          city: "Gurugram",
          postalCode: "122015",
          address: "DLF Phase 3, Cyber City",
          shippingAddress: "DLF Phase 3, Cyber City",
          phone: "+91 9876543211",
          mobileNumber: "+91 9876543211",
          status: "ACTIVE",
          credit: 500.0,
          ordersCount: 3,
          wishlistCount: 2,
          lastLogin: "Just now",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "usr_admin_default",
          name: "Admin Administrator",
          firstName: "Admin",
          lastName: "Administrator",
          email: "admin@tagateway.com",
          password: "$2b$10$eE99Q4e4K0B1N03B2zZ.7eLkW2lK5wN3z2tNl/lM61gP4vT/Vb4b2", // AdminPassword123!
          role: "ADMIN",
          roleId: "role_admin",
          assignedRoles: ["role_admin"],
          accountType: "admin",
          type: "admin",
          customerType: "Admin",
          country: "India",
          countryCode: "IN",
          state: "Delhi",
          city: "New Delhi",
          postalCode: "110001",
          phone: "+91 9876543200",
          mobileNumber: "+91 9876543200",
          status: "ACTIVE",
          credit: 0,
          ordersCount: 0,
          wishlistCount: 0,
          lastLogin: "Just now",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "usr_both_gyan",
          name: "Gyan Dual Account",
          firstName: "Gyan",
          lastName: "Dual",
          email: "gyanboth@gmail.com",
          password: "$2b$10$ZcPqhhBeLxemam7v/EATFOFjAztyjOp917S7gDQQmYpcJG.080cli", // gyan@123
          role: "ADMIN",
          roleId: "role_admin",
          assignedRoles: ["role_admin"],
          accountType: "both",
          type: "both",
          customerType: "Both",
          country: "India",
          countryCode: "IN",
          state: "Haryana",
          city: "Gurugram",
          postalCode: "122015",
          address: "Golf Course Road",
          shippingAddress: "Golf Course Road",
          phone: "+91 9876543212",
          mobileNumber: "+91 9876543212",
          status: "ACTIVE",
          credit: 1000.0,
          ordersCount: 5,
          wishlistCount: 4,
          lastLogin: "Just now",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    // 7. Seed Sliders matching Frontend Design
    if (!db.sliders || db.sliders.length === 0) {
      db.sliders = [
        {
          id: "slider_hero_1",
          title: "iPhone 16 Pro Max",
          subtitle: "From ₹ 50,769*",
          description: "A18 Pro chip, Superfast, Supersmart, Biggest Price Drop",
          tag: "*Incl. All Offers",
          buttonText: "Shop Now",
          buttonLink: "/category/electronics",
          imageUrl: "/uploads/hero_iphone16_banner.webp",
          bgGradient: "from-[#091124] via-[#1a233d] to-[#0c142b]",
          textColor: "text-white",
          position: "main",
          displayOrder: 1,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "slider_hero_2",
          title: "Samsung Galaxy S24 Ultra",
          subtitle: "Titanium Evolution with Galaxy AI",
          description: "Circle to Search, Live Translate & 100x Space Zoom",
          tag: "Free Galaxy Buds 2 Pro Included",
          buttonText: "Order Now",
          buttonLink: "/#deals",
          imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80",
          bgGradient: "from-[#0f172a] via-[#1e1b4b] to-[#1e293b]",
          textColor: "text-white",
          position: "main",
          displayOrder: 2,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "slider_hero_3",
          title: "Sony WH-1000XM5 Headset",
          subtitle: "Pure Silence, Immersive Sound",
          description: "Industry-leading noise cancellation with auto NC optimizer",
          tag: "Special Launch Price 1,199 AED",
          buttonText: "Explore Now",
          buttonLink: "/#deals",
          imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
          bgGradient: "from-[#18181b] via-[#27272a] to-[#09090b]",
          textColor: "text-white",
          position: "main",
          displayOrder: 3,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "slider_side_1",
          title: "SALE UP TO 50% OFF",
          subtitle: "Puma Nitro Pro Velocity",
          description: "Lightweight, nitrogen-infused foam for maximum energy return",
          buttonText: "Shop Puma",
          buttonLink: "/#deals",
          imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
          bgGradient: "from-[#0284c7] via-[#0ea5e9] to-[#38bdf8]",
          textColor: "text-white",
          position: "side",
          displayOrder: 1,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "slider_promo_1",
          badge: "50% SAVE",
          tag: "FREE DELIVERY",
          title: "FRESH AND HEALTHY VEGETABLE",
          subtitle: "Farm-fresh organic greens, crisp carrots & tomatoes delivered daily",
          buttonText: "Shop now",
          buttonLink: "/#deals",
          imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80",
          bgGradient: "from-[#881337] via-[#9f1239] to-[#be123c]",
          textColor: "text-white",
          position: "triple_promo",
          displayOrder: 1,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "slider_promo_2",
          badge: "SAMSUNG",
          tag: "GALAXY AI IS HERE",
          title: "Galaxy S24 FE",
          subtitle: "Flagship cameras, ProVisual Engine & all-day battery life",
          buttonText: "Shop now",
          buttonLink: "/#deals",
          imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
          bgGradient: "from-[#bfdbfe] via-[#dbeafe] to-[#eff6ff]",
          textColor: "text-slate-900",
          position: "triple_promo",
          displayOrder: 2,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "slider_promo_3",
          badge: "قبل نفاد المخزون",
          tag: "EMOX SPECIAL OFFER",
          title: "عرض إيموكس المميز",
          subtitle: "Organic mountain honey, imported pantry staples, dates & oils",
          buttonText: "Shop now",
          buttonLink: "/#deals",
          imageUrl: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80",
          bgGradient: "from-[#b91c1c] via-[#dc2626] to-[#ea580c]",
          textColor: "text-white",
          position: "triple_promo",
          displayOrder: 3,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    // 8. Seed Frontend Popular Categories matching User Screenshot (8 Categories)
    if (!db.categories) db.categories = [];
    const popularCategories: CategoryRecord[] = [
      {
        id: "cat_electronics",
        name: "Electronics",
        slug: "electronics",
        description: "Smartphones, Laptops, Audio, Displays & Smart Accessories",
        image: "/uploads/category_electronics.webp",
        level: 0,
        isActive: true,
        displayOrder: 1,
        productCount: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "cat_fashion",
        name: "Fashion",
        slug: "fashion",
        description: "Men's Apparel, Denim Jackets, Sneakers & Streetwear",
        image: "/uploads/category_fashion.webp",
        level: 0,
        isActive: true,
        displayOrder: 2,
        productCount: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "cat_womens",
        name: "Women's",
        slug: "womens",
        description: "Dresses, Trench Coats, Silk Blouses & Leather Handbags",
        image: "/uploads/category_womens.webp",
        level: 0,
        isActive: true,
        displayOrder: 3,
        productCount: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "cat_kids_fashion",
        name: "Kids' Fashion",
        slug: "kids-fashion",
        description: "Kids' Hoodies, Winter Puffers, Party Dresses & Sneakers",
        image: "/uploads/category_kids_fashion.webp",
        level: 0,
        isActive: true,
        displayOrder: 4,
        productCount: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "cat_health_beauty",
        name: "Health & Beauty",
        slug: "health-beauty",
        description: "Skincare Serums, Barrier Moisturizers, Sunscreens & Hair Oils",
        image: "/uploads/category_health_beauty.webp",
        level: 0,
        isActive: true,
        displayOrder: 5,
        productCount: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "cat_pharmacy",
        name: "Pharmacy",
        slug: "pharmacy",
        description: "Daily Multivitamins, Omega-3 Fish Oil, Whey Protein & First Aid",
        image: "/uploads/category_pharmacy.webp",
        level: 0,
        isActive: true,
        displayOrder: 6,
        productCount: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "cat_groceries",
        name: "Groceries",
        slug: "groceries",
        description: "Organic Honey, Cold Pressed Olive Oil, Espresso Beans & Dates",
        image: "/uploads/category_groceries.webp",
        level: 0,
        isActive: true,
        displayOrder: 7,
        productCount: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "cat_luxury_item",
        name: "Luxury Item",
        slug: "luxury-item",
        description: "Automatic Chronographs, Italian Leather Bags & 18K Solid Gold",
        image: "/uploads/category_luxury_item.webp",
        level: 0,
        isActive: true,
        displayOrder: 8,
        productCount: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    popularCategories.forEach((pc) => {
      const idx = db.categories.findIndex((c) => c.slug === pc.slug || c.id === pc.id);
      if (idx === -1) {
        db.categories.push(pc);
        hasChanges = true;
      } else if (!db.categories[idx].image && pc.image) {
        db.categories[idx].image = pc.image;
        hasChanges = true;
      }
    });

    // 9. Seed Catalog Products (Managed via seed-8-categories-and-products.mjs)
    if (!db.products) db.products = [];
    const sampleProducts: ProductRecord[] = [];

    sampleProducts.forEach((sp) => {
      const existingIdx = db.products.findIndex((p) => p.sku === sp.sku || p.slug === sp.slug);
      if (existingIdx === -1) {
        db.products.push(sp);
        hasChanges = true;
      } else {
        let changed = false;
        if (!db.products[existingIdx].mainImage && sp.mainImage) {
          db.products[existingIdx].mainImage = sp.mainImage;
          changed = true;
        }
        if (db.products[existingIdx].rating === undefined && sp.rating) {
          db.products[existingIdx].rating = sp.rating;
          changed = true;
        }
        if (db.products[existingIdx].reviewsCount === undefined && sp.reviewsCount) {
          db.products[existingIdx].reviewsCount = sp.reviewsCount;
          changed = true;
        }
        if (changed) hasChanges = true;
      }
    });

    // 10. Seed Storefront Navigation Menu Items matching Screenshot
    if (!db.menuItems || db.menuItems.length === 0) {
      db.menuItems = [
        { id: "menu_elec", label: "Electronics", url: "/#deals", displayOrder: 1, isActive: true, isHighlight: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "menu_fashion", label: "Fashion", url: "/#deals", displayOrder: 2, isActive: true, isHighlight: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "menu_women", label: "Women's", url: "/#deals", displayOrder: 3, isActive: true, isHighlight: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "menu_kids", label: "Kids' Fashion", url: "/#deals", displayOrder: 4, isActive: true, isHighlight: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "menu_beauty", label: "Health & Beauty", url: "/#deals", displayOrder: 5, isActive: true, isHighlight: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "menu_pharmacy", label: "Pharmacy", url: "/#deals", displayOrder: 6, isActive: true, isHighlight: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "menu_groceries", label: "Groceries", url: "/#deals", displayOrder: 7, isActive: true, isHighlight: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "menu_luxury", label: "Luxury Item", url: "/#deals", displayOrder: 8, isActive: true, isHighlight: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "menu_deals", label: "Best Deals", url: "/#deals", badge: "Hot", displayOrder: 9, isActive: true, isHighlight: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "menu_live", label: "emox Live", url: "/#deals", badge: "Live", displayOrder: 10, isActive: true, isHighlight: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      hasChanges = true;
    }

    // 11. Seed Manufacturers & Warehouses matching Screenshot 2 (media_1792862846917_de406b27.png)
    if (!db.manufacturers || db.manufacturers.length === 0) {
      db.manufacturers = [
        {
          id: "mfg_avery",
          accountNumber: "ac9638",
          name: "Avery Dennison",
          contactName: "Avery Dennison",
          email: "info@averydennison.com",
          phone: "0302-3929000",
          fax: "0302-3929001",
          website: "https://averydennison.com",
          addressLine1: "8080 Norton Pkwy",
          country: "United States",
          state: "Ohio",
          city: "Mentor",
          zipCode: "44060",
          isActive: true,
          createdAt: "2024-03-12T10:00:00Z",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "mfg_nike",
          accountNumber: "ac3814",
          name: "Nike Global Operations",
          contactName: "Mark Parker",
          email: "supplier@nike.com",
          phone: "+1 503 671 6453",
          website: "https://nike.com",
          addressLine1: "One Bowerman Dr",
          country: "United States",
          state: "Oregon",
          city: "Beaverton",
          zipCode: "97005",
          isActive: true,
          createdAt: "2024-04-10T12:00:00Z",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "mfg_samsung",
          accountNumber: "ac7721",
          name: "Samsung Electronics",
          contactName: "K. H. Lee",
          email: "partner@samsung.com",
          phone: "+82 2 2255 0114",
          website: "https://samsung.com",
          addressLine1: "129 Samsung-ro",
          country: "South Korea",
          state: "Gyeonggi-do",
          city: "Suwon-si",
          zipCode: "16677",
          isActive: true,
          createdAt: "2024-05-18T08:30:00Z",
          updatedAt: new Date().toISOString(),
        },
      ];
      hasChanges = true;
    }

    if (!db.warehouses || db.warehouses.length === 0) {
      db.warehouses = [
        {
          id: "wh_avery_1",
          accountNumber: "11",
          name: "Avery Dennison",
          contactName: "Avery Dennison",
          email: "info@averydennison.com",
          phone: "0302-3929000",
          address: "8080 Norton Pkwy",
          city: "Mentor",
          state: "Ohio",
          country: "United States",
          zipCode: "44060",
          isActive: true,
          manufacturerId: "mfg_avery",
          createdAt: "2024-03-12T10:15:00Z",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "wh_nike_1",
          accountNumber: "WH-01",
          name: "Nike Oregon Hub",
          contactName: "John Reynolds",
          email: "oregon-hub@nike.com",
          phone: "+1 503 555 0192",
          address: "1400 Northwest 167th Pl",
          city: "Beaverton",
          state: "Oregon",
          country: "United States",
          zipCode: "97006",
          isActive: true,
          manufacturerId: "mfg_nike",
          createdAt: "2024-04-10T14:00:00Z",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "wh_nike_2",
          accountNumber: "WH-02",
          name: "Nike Memphis Logistics Depot",
          contactName: "Linda Vance",
          email: "memphis-wh@nike.com",
          phone: "+1 901 555 4321",
          address: "3155 Frisco Ave",
          city: "Memphis",
          state: "Tennessee",
          country: "United States",
          zipCode: "38118",
          isActive: true,
          manufacturerId: "mfg_nike",
          createdAt: "2024-04-15T09:00:00Z",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "wh_samsung_1",
          accountNumber: "WH-03",
          name: "Samsung Silicon Valley Center",
          contactName: "David Chen",
          email: "sanjose@samsungwh.com",
          phone: "+1 408 555 8899",
          address: "3655 N First St",
          city: "San Jose",
          state: "California",
          country: "United States",
          zipCode: "95134",
          isActive: true,
          manufacturerId: "mfg_samsung",
          createdAt: "2024-05-18T11:00:00Z",
          updatedAt: new Date().toISOString(),
        },
      ];
      hasChanges = true;
    }

    // 12. Seed Discounts matching Screenshot 3 (media_1792862916109_f3d05549.png)
    if (!db.discounts || db.discounts.length === 0) {
      db.discounts = [
        {
          id: "disc_1",
          itemNo: "z2216",
          productName: "wireless-earbuds-z2216",
          discountType: "%",
          discountValue: 15,
          startDate: "2026-10-01",
          endDate: "2026-12-31",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "disc_2",
          itemNo: "zolo3",
          productName: "zoloChip",
          discountType: "$",
          discountValue: 5,
          startDate: "2026-10-15",
          endDate: "2026-11-30",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "disc_3",
          itemNo: "p_winter_1",
          productName: "Winter Down Puffer Jacket",
          discountType: "%",
          discountValue: 25,
          startDate: "2026-10-10",
          endDate: "2026-11-20",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      hasChanges = true;
    }

    // 13. Seed Orders matching Screenshot 4 (media_1792863091964_670bc464.png)
    if (!db.orders || db.orders.length === 0) {
      db.orders = [
        {
          id: "ord_546",
          orderNumber: "tags546",
          customerName: "Johnathan Smith",
          customerEmail: "john.smith@gmail.com",
          customerPhone: "+1 (555) 234-5678",
          orderDate: "2026-10-24T18:30:00Z",
          gateway: "PayPal",
          paymentStatus: "Paid",
          orderStatus: "Delivered",
          totalPrice: 149.99,
          subtotal: 139.99,
          shippingCost: 10.0,
          shippingAddress: "742 Evergreen Terrace, Springfield, OR 97477",
          items: [
            {
              id: "item_546_1",
              orderId: "ord_546",
              itemNo: "z2216",
              name: "wireless-earbuds-z2216",
              price: 76.49,
              quantity: 1,
              imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200",
            },
            {
              id: "item_546_2",
              orderId: "ord_546",
              itemNo: "zolo",
              name: "zoloChip Fast Microprocessor",
              price: 19.99,
              quantity: 2,
              imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200",
            },
          ],
          createdAt: "2026-10-24T18:30:00Z",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "ord_545",
          orderNumber: "tags545",
          customerName: "Sophia Garcia",
          customerEmail: "sophia.g@yahoo.com",
          customerPhone: "+1 (555) 987-6543",
          orderDate: "2026-10-23T14:15:00Z",
          gateway: "Stripe",
          paymentStatus: "Paid",
          orderStatus: "Paid",
          totalPrice: 89.99,
          subtotal: 89.99,
          shippingCost: 0,
          shippingAddress: "123 Ocean Blvd, Miami, FL 33139",
          items: [
            {
              id: "item_545_1",
              orderId: "ord_545",
              itemNo: "p_winter_1",
              name: "Winter Down Puffer Jacket",
              price: 89.99,
              quantity: 1,
              imageUrl: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=200",
            },
          ],
          createdAt: "2026-10-23T14:15:00Z",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "ord_544",
          orderNumber: "tags544",
          customerName: "David Miller",
          customerEmail: "dmiller@outlook.com",
          customerPhone: "+1 (555) 456-7890",
          orderDate: "2026-10-21T09:45:00Z",
          gateway: "Credit Card",
          paymentStatus: "Pending",
          orderStatus: "Pending",
          totalPrice: 34.99,
          subtotal: 29.99,
          shippingCost: 5.0,
          shippingAddress: "456 Oak Street, Denver, CO 80203",
          items: [
            {
              id: "item_544_1",
              orderId: "ord_544",
              itemNo: "zolo3",
              name: "zoloChip Extreme edition",
              price: 29.99,
              quantity: 1,
              imageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200",
            },
          ],
          createdAt: "2026-10-21T09:45:00Z",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "ord_543",
          orderNumber: "tags543",
          customerName: "Emma Watson",
          customerEmail: "emma.w@gmail.com",
          customerPhone: "+1 (555) 321-0987",
          orderDate: "2026-10-18T11:20:00Z",
          gateway: "PayPal",
          paymentStatus: "Cancelled",
          orderStatus: "Cancelled By System",
          totalPrice: 129.5,
          subtotal: 129.5,
          shippingCost: 0,
          shippingAddress: "89 King St, Boston, MA 02110",
          items: [
            {
              id: "item_543_1",
              orderId: "ord_543",
              itemNo: "p_winter_2",
              name: "Cashmere Wool Knit Sweater",
              price: 129.5,
              quantity: 1,
              imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200",
            },
          ],
          createdAt: "2026-10-18T11:20:00Z",
          updatedAt: new Date().toISOString(),
        },
      ];
      hasChanges = true;
    }

    // 14. Seed Pricing Settings matching Screenshot 5 (media_1792863218200_fbd11349.png)
    if (!db.pricingSettings) {
      db.pricingSettings = {
        strikeThroughPricing: true,
        priceSync: true,
        priceRounding: false,
        defaultAdjustmentType: "%",
        defaultAdjustmentValue: 10,
        updatedAt: new Date().toISOString(),
      };
      hasChanges = true;
    }

    // 15. Seed Reviews matching Screenshot 1 (media_1792902787251_f2d565c9.png)
    if (!db.reviews || db.reviews.length === 0) {
      db.reviews = [
        {
          id: "rev_1",
          itemNo: "z2216",
          productName: "wireless-earbuds-z2216",
          userName: "Johnathan Smith",
          userEmail: "john.smith@gmail.com",
          rating: 5,
          review: "Outstanding sound quality, crisp highs and deep bass. Battery easily lasts 8+ hours on single charge!",
          commentCount: 1,
          status: "Active",
          postedOn: "2026-10-22",
          createdAt: "2026-10-22T14:20:00Z",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "rev_2",
          itemNo: "polo",
          productName: "men-s-polo-t-shirts",
          userName: "Sarah Connor",
          userEmail: "sarah.c@yahoo.com",
          rating: 4,
          review: "Very comfortable combed cotton fabric. Fits nicely around the shoulders and breathable in hot weather.",
          commentCount: 2,
          status: "Active",
          postedOn: "2026-10-20",
          createdAt: "2026-10-20T11:00:00Z",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "rev_3",
          itemNo: "s23",
          productName: "samsung-galaxy-s23-ultra-5g-green-12gb-256gb-storage",
          userName: "David Miller",
          userEmail: "dmiller@outlook.com",
          rating: 5,
          review: "Superb 200MP camera and ultra-fast Snapdragon processor. Night photography is world class.",
          commentCount: 0,
          status: "Active",
          postedOn: "2026-10-18",
          createdAt: "2026-10-18T09:30:00Z",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "rev_4",
          itemNo: "p_winter_1",
          productName: "Winter Down Puffer Jacket",
          userName: "Emma Watson",
          userEmail: "emma.w@gmail.com",
          rating: 5,
          review: "Keeps warm in sub-zero winter winds. Premium fleece lining and waterproof outer shell.",
          commentCount: 3,
          status: "Active",
          postedOn: "2026-10-15",
          createdAt: "2026-10-15T16:45:00Z",
          updatedAt: new Date().toISOString(),
        },
      ];
      db.reviewAutoApprove = true;
      hasChanges = true;
    }

    // 16. Seed Q&A matching Screenshot 2 (media_1792902820606_52e86e7a.png)
    if (!db.qna || db.qna.length === 0) {
      db.qna = [
        {
          id: "qna_1",
          itemNo: "polo",
          productName: "men-s-polo-t-shirts",
          userName: "Tag Customer",
          userEmail: "admin@tag.com",
          question: "Is this 100% pre-shrunk cotton fabric?",
          postedOn: "08-02-24",
          rating: 5,
          answersCount: 2,
          answers: [
            {
              id: "ans_1_1",
              qnaId: "qna_1",
              userName: "emox Official Support",
              userEmail: "support@emox.ae",
              answer: "Yes, it is manufactured with 100% combed pre-shrunk cotton.",
              isOfficial: true,
              createdAt: "2024-08-02T12:00:00Z",
            },
            {
              id: "ans_1_2",
              qnaId: "qna_1",
              userName: "Verified Buyer",
              userEmail: "customer@gmail.com",
              answer: "Doesn't shrink even after machine wash in cold water.",
              isOfficial: false,
              createdAt: "2024-08-03T15:30:00Z",
            },
          ],
          status: "Active",
          createdAt: "2024-08-02T10:00:00Z",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "qna_2",
          itemNo: "puma",
          productName: "puma-shoes",
          userName: "Tag Customer",
          userEmail: "admin@tag.com",
          question: "Are these true to size for jogging and running?",
          postedOn: "08-02-24",
          rating: 5,
          answersCount: 1,
          answers: [
            {
              id: "ans_2_1",
              qnaId: "qna_2",
              userName: "emox Footwear Team",
              userEmail: "support@emox.ae",
              answer: "Yes, choose your regular standard EU/UK athletic shoe size.",
              isOfficial: true,
              createdAt: "2024-08-02T14:00:00Z",
            },
          ],
          status: "Active",
          createdAt: "2024-08-02T11:00:00Z",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "qna_3",
          itemNo: "coconut",
          productName: "coconut-water-organic",
          userName: "Tag Customer",
          userEmail: "admin@tag.com",
          question: "Is there any added sugar or artificial preservatives?",
          postedOn: "09-27-24",
          rating: 5,
          answersCount: 1,
          answers: [
            {
              id: "ans_3_1",
              qnaId: "qna_3",
              userName: "NutriStore Specialist",
              userEmail: "nutrition@emox.ae",
              answer: "100% pure tender coconut water with zero added sugars or preservatives.",
              isOfficial: true,
              createdAt: "2024-09-27T16:00:00Z",
            },
          ],
          status: "Active",
          createdAt: "2024-09-27T13:00:00Z",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "qna_4",
          itemNo: "s23",
          productName: "samsung-galaxy-s23-ultra-5g-green-12gb-256gb-storage",
          userName: "Tag Customer",
          userEmail: "admin@tag.com",
          question: "Does this include official Samsung Gulf warranty?",
          postedOn: "03-26-25",
          rating: 5,
          answersCount: 1,
          answers: [
            {
              id: "ans_4_1",
              qnaId: "qna_4",
              userName: "Samsung Authorized Partner",
              userEmail: "samsung@emox.ae",
              answer: "Yes, covered by 1-year official Samsung Gulf warranty.",
              isOfficial: true,
              createdAt: "2025-03-26T18:00:00Z",
            },
          ],
          status: "Inactive",
          createdAt: "2025-03-26T15:00:00Z",
          updatedAt: new Date().toISOString(),
        },
        {
          id: "qna_5",
          itemNo: "realme",
          productName: "realme Buds Wireless 3 In Ear Bluetooth",
          userName: "Tag Customer",
          userEmail: "admin@tag.com",
          question: "Does it support active noise cancellation (ANC)?",
          postedOn: "07-23-25",
          rating: 5,
          answersCount: 1,
          answers: [
            {
              id: "ans_5_1",
              qnaId: "qna_5",
              userName: "Realme Tech Care",
              userEmail: "tech@emox.ae",
              answer: "Yes, it features 30dB Active Noise Cancellation with dual mics.",
              isOfficial: true,
              createdAt: "2025-07-23T11:00:00Z",
            },
          ],
          status: "Active",
          createdAt: "2025-07-23T09:00:00Z",
          updatedAt: new Date().toISOString(),
        },
      ];
      db.qnaAutoApprove = true;
      hasChanges = true;
    }

    // 17. Seed Wishlist Items matching Screenshot 3 (media_1792902839085_11e92fe4.png)
    if (!db.wishlist || db.wishlist.length === 0) {
      db.wishlist = [
        {
          id: "wl_1",
          itemNo: "boat",
          name: "boat Rockerz 450 Wireless Headphone",
          productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200",
          totalQuantity: 302,
          wishlistCount: 1,
          userIds: ["user_guest_1"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "wl_2",
          itemNo: "coconut",
          name: "Organic Raw Tender Coconut Drink 500ml",
          productImage: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=200",
          totalQuantity: 300,
          wishlistCount: 1,
          userIds: ["user_guest_2"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "wl_3",
          itemNo: "guqawd358awe",
          name: "drt498fyt Wireless Gaming Controller",
          productImage: undefined,
          totalQuantity: 50,
          wishlistCount: 1,
          userIds: ["user_guest_3"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "wl_4",
          itemNo: "s23",
          name: "samsung-galaxy-s23-ultra-5g-green-12gb-256gb-storage",
          productImage: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200",
          totalQuantity: 24,
          wishlistCount: 1,
          userIds: ["user_guest_4"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      hasChanges = true;
    }

    // 18. Seed Coupons matching Screenshot 4 & 5 (media_1792902901561_8b4f4de3.png & media_1792902938147_af17aa79.png)
    if (!db.coupons || db.coupons.length === 0) {
      db.coupons = [
        {
          id: "cpn_welcome10",
          code: "WELCOME10",
          couponType: "%Off Total Order",
          discountPercentage: 10,
          discountAmount: 0,
          minAmount: 50,
          expiryDate: "2026-12-31",
          usageLimit: 500,
          usedCount: 42,
          usageLimitPerCustomer: 1,
          selectedTemplate: "Welcome New Customers",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "cpn_emox20",
          code: "EMOX20",
          couponType: "%Off Total Order > Amount specified",
          discountPercentage: 20,
          discountAmount: 0,
          minAmount: 150,
          expiryDate: "2026-11-30",
          usageLimit: 200,
          usedCount: 18,
          usageLimitPerCustomer: 1,
          selectedTemplate: "VIP Mega Discount",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "cpn_freeship",
          code: "FREESHIP",
          couponType: "Free shipping for the order",
          discountPercentage: 0,
          discountAmount: 0,
          minAmount: 30,
          expiryDate: "2026-12-31",
          usageLimit: 1000,
          usedCount: 88,
          usageLimitPerCustomer: 3,
          selectedTemplate: "Free Shipping Banner",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "cpn_flat15",
          code: "SUPER15",
          couponType: "$Discount on Total Order",
          discountPercentage: 0,
          discountAmount: 15,
          minAmount: 80,
          expiryDate: "2026-12-31",
          usageLimit: 150,
          usedCount: 29,
          usageLimitPerCustomer: 1,
          selectedTemplate: "Flash Sale Voucher",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      hasChanges = true;
    }

    // 19. Seed Payment Gateways matching Screenshot 1 (media_1792903420020_4ddf5077.png)
    if (!db.gateways || db.gateways.length === 0) {
      db.gateways = [
        {
          id: "gw_authorizenet",
          name: "Authorize.Net",
          code: "authorizenet",
          cardTypes: ["VISA", "Mastercard", "AMEX", "Discover", "Diners Club", "JCB", "enRoute"],
          isDefault: true,
          isCreditCard: true,
          isActive: true,
          environment: "sandbox",
          credentials: {
            apiLoginId: "5k92Xp8TAG",
            transactionKey: "8d9f482a9f01bc32",
            sandboxMode: "true",
          },
          description: "Accept credit cards directly through Authorize.Net with secure tokenization",
          displayOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "gw_braintree",
          name: "Braintree",
          code: "braintree",
          cardTypes: ["VISA", "Mastercard", "AMEX", "Discover"],
          isDefault: false,
          isCreditCard: true,
          isActive: true,
          environment: "sandbox",
          credentials: {
            merchantId: "bm798234",
            publicKey: "pub_live_920",
            privateKey: "priv_sec_920_tag",
          },
          description: "Global credit card processing powered by PayPal's Braintree platform",
          displayOrder: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "gw_paypal",
          name: "PayPal Express",
          code: "paypal",
          cardTypes: ["PayPal Balance", "Pay in 4", "Cards"],
          isDefault: false,
          isCreditCard: false,
          isActive: true,
          environment: "sandbox",
          credentials: {
            clientId: "sb-paypal-client-id-tags",
            clientSecret: "sb-paypal-secret-key-live",
          },
          description: "Safe and familiar one-click checkout with buyer protection",
          displayOrder: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "gw_razorpay",
          name: "Razorpay",
          code: "razorpay",
          cardTypes: ["VISA", "Mastercard", "UPI", "NetBanking", "RuPay"],
          isDefault: false,
          isCreditCard: true,
          isActive: true,
          environment: "sandbox",
          credentials: {
            keyId: "rzp_test_1DP5mmOlF5G5ag",
            keySecret: "s9x8f7s6d5f4rzpsecret",
          },
          description: "Seamless instant UPI, QR code, debit cards, and Indian banking rails",
          displayOrder: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "gw_paytm",
          name: "Paytm Payments",
          code: "paytm",
          cardTypes: ["Paytm Wallet", "UPI", "Cards", "Postpaid"],
          isDefault: false,
          isCreditCard: true,
          isActive: true,
          environment: "sandbox",
          credentials: {
            merchantId: "DIY12386817555501617",
            merchantKey: "bKMfNxPPf_QdZppa",
            website: "WEBSTAGING",
          },
          description: "India's favorite digital wallet and QR payments ecosystem",
          displayOrder: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "gw_stripe",
          name: "Stripe",
          code: "stripe",
          cardTypes: ["VISA", "Mastercard", "AMEX", "Apple Pay", "Google Pay"],
          isDefault: false,
          isCreditCard: true,
          isActive: true,
          environment: "sandbox",
          credentials: {
            publishableKey: "pk_test_TYooMQauvdEDq54NiTphI7jx",
            secretKey: "sk_test_4eC39HqLyjWDarjtT1zdp7dc",
          },
          description: "Modern global payments with Apple Pay, Google Pay and card 3DS security",
          displayOrder: 6,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "gw_cod",
          name: "Cash On Delivery (COD)",
          code: "cod",
          cardTypes: ["Cash"],
          isDefault: false,
          isCreditCard: false,
          isActive: true,
          environment: "live",
          credentials: {
            instructions: "Pay upon delivery with cash or mobile card terminal",
          },
          description: "Pay in cash directly to courier at the time of delivery",
          displayOrder: 7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      hasChanges = true;
    }

    // 20. Seed Themes matching Screenshot 2 & 3 (media_1792903681572_9a830ebd.png & media_1792903848971_8bfb3ece.png)
    if (!db.themes || db.themes.length === 0) {
      db.themes = [
        this.getDefaultThemeRecord(),
        {
          id: "thm_unishop1",
          name: "Unishop1",
          slug: "unishop1",
          version: "1.8.2",
          thumbnail: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80",
          description: "Feature-rich electronics and multi-vendor tech mega store theme with high-density grids and dark-accented UI.",
          author: "Rokaux Studio",
          isActive: false,
          isSystem: true,
          config: {
            design: {
              primaryColor: "#0284c7",
              secondaryColor: "#0f172a",
              accentColor: "#ef4444",
              backgroundColor: "#f8fafc",
              textColor: "#1e293b",
              fontFamily: "Roboto, sans-serif",
              headingFont: "Roboto, sans-serif",
              headerStyle: "classic",
              footerStyle: "detailed",
              announcementBar: {
                enabled: true,
                text: "Unishop Mega Electronics Sale — Up to 50% Off Smart Gadgets!",
                link: "/#deals",
                bgColor: "#0284c7",
                textColor: "#ffffff",
              },
            },
            sections: {
              heroSlider: true,
              popularCategories: true,
              todaysDeals: true,
              promoBanners: true,
              winterWear: true,
              recentlyViewed: true,
              order: ["heroSlider", "todaysDeals", "popularCategories", "promoBanners", "winterWear", "recentlyViewed"],
            },
            integrations: {
              captchaEnabled: false,
              microsoftUetTag: "TAG-UNISHOP-UET",
              metaPixelId: "PIXEL-UNISHOP-88",
              maintenanceMode: false,
              maintenanceMessage: "Store undergoing updates.",
            },
            customCss: "",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "thm_bootstrap0",
          name: "Bootstrap0",
          slug: "bootstrap0",
          version: "3.1.0",
          thumbnail: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500&q=80",
          description: "Lightweight, blazing-fast minimalist retail theme engineered for high conversion rates and simple typography.",
          author: "FrontendHub",
          isActive: false,
          isSystem: true,
          config: {
            design: {
              primaryColor: "#10b981",
              secondaryColor: "#18181b",
              accentColor: "#6366f1",
              backgroundColor: "#ffffff",
              textColor: "#27272a",
              fontFamily: "Inter, sans-serif",
              headingFont: "Inter, sans-serif",
              headerStyle: "minimal",
              footerStyle: "compact",
              announcementBar: {
                enabled: true,
                text: "Welcome to our store! Free shipping on all international orders over $100.",
                link: "/#deals",
                bgColor: "#10b981",
                textColor: "#ffffff",
              },
            },
            sections: {
              heroSlider: true,
              popularCategories: true,
              todaysDeals: true,
              promoBanners: false,
              winterWear: true,
              recentlyViewed: true,
              order: ["heroSlider", "popularCategories", "todaysDeals", "winterWear", "recentlyViewed"],
            },
            integrations: {
              captchaEnabled: false,
              microsoftUetTag: "",
              metaPixelId: "",
              maintenanceMode: false,
              maintenanceMessage: "Store is currently in maintenance mode.",
            },
            customCss: "",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      hasChanges = true;
    }

    // 21. Seed Addresses matching Screenshot 4 (media_1792904487463_d402c920.png)
    if (!db.addresses || db.addresses.length === 0) {
      db.addresses = [
        {
          id: "addr_gyan_bill_1",
          userId: "emp_gyan",
          customerEmail: "gyanwork1996@gmail.com",
          type: "billing",
          name: "Gyanchandra",
          company: "Emox Technologies LLC",
          addressLine1: "Al Barsha 1, Suite 402, Golden Tower",
          addressLine2: "Opposite Mall of the Emirates",
          country: "United Arab Emirates",
          state: "Dubai",
          city: "Dubai",
          postalCode: "12345",
          phone: "+971 50 123 4567",
          isDefault: true,
          status: "Active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "addr_gyan_ship_1",
          userId: "emp_gyan",
          customerEmail: "gyanwork1996@gmail.com",
          type: "shipping",
          name: "Gyanchandra",
          company: "Emox Technologies LLC",
          addressLine1: "Villa 14B, Street 22A, Al Safa 2",
          addressLine2: "Near Safa Park Gate 3",
          country: "United Arab Emirates",
          state: "Dubai",
          city: "Dubai",
          postalCode: "12345",
          phone: "+971 50 123 4567",
          isDefault: true,
          status: "Active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "addr_john_bill_1",
          customerEmail: "john@example.com",
          type: "billing",
          name: "John Doe",
          company: "Acme Corp",
          addressLine1: "742 Evergreen Terrace",
          addressLine2: "Apt 4B",
          country: "United States",
          state: "California",
          city: "San Francisco",
          postalCode: "94103",
          phone: "+1 415 555 0192",
          isDefault: true,
          status: "Active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "addr_john_ship_1",
          customerEmail: "john@example.com",
          type: "shipping",
          name: "John Doe",
          company: "Acme Corp",
          addressLine1: "742 Evergreen Terrace",
          addressLine2: "Apt 4B",
          country: "United States",
          state: "California",
          city: "San Francisco",
          postalCode: "94103",
          phone: "+1 415 555 0192",
          isDefault: true,
          status: "Active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      hasChanges = true;
    }

    // 22. Seed Payments matching existing orders if empty
    if (!db.payments || db.payments.length === 0) {
      db.payments = [
        {
          id: "pay_546_1",
          orderId: "ord_546",
          orderNumber: "tags546",
          customerName: "Johnathan Smith",
          customerEmail: "john.smith@gmail.com",
          paymentGateway: "PayPal",
          gatewayOrderId: "PAYID-MN7643A",
          transactionId: "TXN_PAYPAL_9812401",
          paymentMethod: "PayPal Wallet",
          amount: 149.99,
          currency: "USD",
          paymentStatus: "Paid",
          paidAt: "2026-10-24T18:31:00Z",
          createdAt: "2026-10-24T18:30:00Z",
          updatedAt: "2026-10-24T18:31:00Z",
        },
        {
          id: "pay_545_1",
          orderId: "ord_545",
          orderNumber: "tags545",
          customerName: "Sophia Garcia",
          customerEmail: "sophia.g@yahoo.com",
          paymentGateway: "Stripe",
          gatewayOrderId: "pi_3MtwBwLkdIwHu7ix28q31KzL",
          transactionId: "ch_3MtwBwLkdIwHu7ix28q31KzL",
          paymentMethod: "Visa Card (ending 4242)",
          amount: 89.99,
          currency: "USD",
          paymentStatus: "Paid",
          paidAt: "2026-10-23T14:16:00Z",
          createdAt: "2026-10-23T14:15:00Z",
          updatedAt: "2026-10-23T14:16:00Z",
        },
        {
          id: "pay_544_1",
          orderId: "ord_544",
          orderNumber: "tags544",
          customerName: "David Miller",
          customerEmail: "dmiller@outlook.com",
          paymentGateway: "Authorize.Net",
          gatewayOrderId: "AUTH-ORDER-88231",
          transactionId: "TRANS-600214890",
          paymentMethod: "Mastercard",
          amount: 34.99,
          currency: "USD",
          paymentStatus: "Pending",
          createdAt: "2026-10-21T09:45:00Z",
          updatedAt: "2026-10-21T09:45:00Z",
        },
        {
          id: "pay_543_1",
          orderId: "ord_543",
          orderNumber: "tags543",
          customerName: "Emma Watson",
          customerEmail: "emma.w@gmail.com",
          paymentGateway: "PayPal",
          gatewayOrderId: "PAYID-CANCELLED-991",
          transactionId: "TXN_FAILED_091",
          paymentMethod: "PayPal",
          amount: 129.5,
          currency: "USD",
          paymentStatus: "Cancelled",
          failureReason: "Payment cancelled by customer at gateway",
          createdAt: "2026-10-18T11:20:00Z",
          updatedAt: "2026-10-18T11:25:00Z",
        },
      ];
      hasChanges = true;
    }

    
    // 20. Seed Shipping Providers (Shiprocket, NimbusPost, Delhivery)
    if (!db.shippingProviders || db.shippingProviders.length === 0) {
      db.shippingProviders = [
        {
          id: "sp_shiprocket",
          name: "Shiprocket",
          code: "shiprocket",
          apiBaseUrl: "https://apiv2.shiprocket.in/v1/external",
          credentials: {
            email: "merchant@ecommerce.com",
            password: "demo_shiprocket_secret",
            apiKey: "sr_live_api_token_7721",
          },
          settings: {
            pickupLocation: "Primary Warehouse Mumbai (Hub 1)",
            defaultCourier: "BlueDart Express Air",
            autoLabelGenerate: true,
          },
          isEnabled: true,
          isDefault: true,
          pickupLocation: "Primary Warehouse Mumbai",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "sp_nimbuspost",
          name: "NimbusPost",
          code: "nimbuspost",
          apiBaseUrl: "https://api.nimbuspost.com/v1",
          credentials: {
            email: "logistics@ecommerce.com",
            apiKey: "np_live_token_884920",
          },
          settings: {
            pickupLocation: "Bandra Warehouse Hub",
            defaultCourier: "NimbusPost Priority Network",
            autoLabelGenerate: false,
          },
          isEnabled: true,
          isDefault: false,
          pickupLocation: "Bandra Warehouse Hub",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "sp_delhivery",
          name: "Delhivery",
          code: "delhivery",
          apiBaseUrl: "https://track.delhivery.com/api/",
          credentials: {
            apiToken: "delhivery_api_token_live_992",
            clientId: "DELHIVERY_MERCHANT_101",
          },
          settings: {
            pickupLocation: "Delhivery Central Hub Mumbai",
            expressDelivery: true,
            autoLabelGenerate: true,
          },
          isEnabled: true,
          isDefault: false,
          pickupLocation: "Delhivery Central Hub Mumbai",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      hasChanges = true;
    }

    // 21. Seed Shipping Settings
    if (!db.shippingSettings) {
      db.shippingSettings = {
        defaultProviderCode: "shiprocket",
        autoDispatch: false,
        allowManualDispatch: true,
        freeShippingThreshold: 500,
        defaultWeightKg: 0.5,
        senderAddress: {
          contactName: "Logistics Manager",
          companyName: "emox Store Logistics",
          addressLine: "Unit 14, Prime Industrial Area, Bandra West",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400050",
          country: "India",
          phone: "+91 98200 12345",
          email: "dispatch@store.com",
        },
        trackingNotificationEmail: true,
        trackingNotificationSms: true,
        codAvailability: true,
        codExtraCharge: 40,
        updatedAt: new Date().toISOString(),
      };
      hasChanges = true;
    }

    // 22. Seed Shipping Zones
    if (!db.shippingZones || db.shippingZones.length === 0) {
      db.shippingZones = [
        {
          id: "zone_local",
          name: "Intra-City Local (Mumbai MMR)",
          zoneType: "local",
          pincodePrefixes: ["400", "401"],
          baseRate: 35,
          additionalPerKg: 15,
          estimatedDeliveryDays: 1,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "zone_regional",
          name: "Regional (Maharashtra & Goa)",
          zoneType: "regional",
          pincodePrefixes: ["41", "42", "43", "44", "403"],
          baseRate: 48,
          additionalPerKg: 20,
          estimatedDeliveryDays: 2,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "zone_metro",
          name: "Metro to Metro (Delhi, BLR, HYD, MAA, CCU)",
          zoneType: "national",
          pincodePrefixes: ["110", "560", "500", "600", "700"],
          baseRate: 65,
          additionalPerKg: 25,
          estimatedDeliveryDays: 3,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "zone_roi",
          name: "Rest of India (Tier 2/3 Cities)",
          zoneType: "national",
          pincodePrefixes: [],
          baseRate: 85,
          additionalPerKg: 35,
          estimatedDeliveryDays: 4,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      hasChanges = true;
    }


    // 24. Seed Warehouses if empty (Matching Screenshot 2)
    if (!db.warehouses || db.warehouses.length === 0) {
      db.warehouses = [
        {
          id: "wh_gyan",
          accountNumber: "45",
          name: "gyanwarehouse",
          contactName: "Gyan",
          email: "kaucrutelsicro-4756@yopmail.com",
          phone: "8957058666",
          fax: "(222) 223-3333",
          address: "address1",
          addressLine1: "address1",
          addressLine2: "",
          city: "Floral Park",
          state: "New York",
          country: "United States",
          zipCode: "11005",
          isActive: true,
          shipstationWarehouse: "624047",
          sellbriteWarehouse: "04816333-dfbe-49e4-9769-f4bd6b972f21",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "wh_mumbai",
          accountNumber: "WH-101",
          name: "Mumbai West Fulfillment Center",
          contactName: "Kamlesh Patel",
          email: "mumbai.wh@emox.store",
          phone: "+91 98200 44556",
          fax: "+91 22 2844 1122",
          address: "Bandra Kurla Complex, Plot 14, Mumbai",
          addressLine1: "Bandra Kurla Complex, Plot 14",
          addressLine2: "Industrial Wing B",
          city: "Mumbai",
          state: "Maharashtra",
          country: "India",
          zipCode: "400051",
          isActive: true,
          shipstationWarehouse: "882109",
          sellbriteWarehouse: "99120-mumbai-hub",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "wh_delhi",
          accountNumber: "WH-102",
          name: "Delhi NCR Hub",
          contactName: "Sunil Verma",
          email: "delhi.wh@emox.store",
          phone: "+91 98111 22334",
          fax: "",
          address: "Sector 18, Udyog Vihar, Gurugram",
          addressLine1: "Sector 18, Udyog Vihar",
          addressLine2: "Phase 4",
          city: "Gurugram",
          state: "Haryana",
          country: "India",
          zipCode: "122015",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      hasChanges = true;
    }

    // 25. Seed Warehouse Inventory for all existing products if empty
    if (!db.warehouseInventory || db.warehouseInventory.length === 0) {
      const primaryWh = (db.warehouses || [])[0] || { id: "wh_gyan", name: "gyanwarehouse" };
      db.warehouseInventory = (db.products || []).map((p) => ({
        id: "winv_" + p.id + "_" + primaryWh.id,
        productId: p.id,
        warehouseId: primaryWh.id,
        productName: p.name,
        productSku: p.sku,
        warehouseName: primaryWh.name,
        availableQuantity: p.currentStock || 50,
        reservedQuantity: 0,
        reorderLevel: p.minStock || 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      hasChanges = true;
    }

    // 26. Seed Storage Settings if missing
    if (!db.storageSettings) {
      db.storageSettings = {
        provider: "local",
        s3Enabled: false,
        s3Region: "us-east-1",
        s3Bucket: "",
        s3AccessKeyId: "",
        s3SecretAccessKey: "",
        cloudfrontUrl: "",
        updatedAt: new Date().toISOString(),
      };
      hasChanges = true;
    }

    // 27. Seed Mail Configuration (Matching Screenshot 2)
    if (!db.mailConfig) {
      db.mailConfig = {
        isEnabled: true,
        defaultFromName: "QAReply",
        defaultFromEmail: "qaadmin@example.com",
        defaultReplyName: "tag31",
        defaultReplyTo: "tag31@example.com",
        transportMethod: "SENDMAIL",
        server: "smtp.gmail.com",
        port: 25,
        secureSocketType: "TLS",
        authType: "LOGIN",
        username: "admin@tag.com",
        password: "",
        contactUsEmail: "test2xuark@gmail.com",
        ccMailOption: true,
        ccEmailAddresses: ["dup@example.com", "cc2@example.com"],
        updatedAt: new Date().toISOString(),
      };
      hasChanges = true;
    }

    // 28. Seed Email Templates (Matching all 16 rows in Screenshot 1)
    if (!db.emailTemplates || db.emailTemplates.length === 0) {
      db.emailTemplates = [
        {
          id: "tpl_user_reg",
          code: "USER_REGISTRATION",
          title: "User RegistrationAug22title",
          subject: "[EMAIL]User RegistrationAug22title[PHONE]",
          bodyHtml: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #2563eb; margin-top: 0;">Welcome to emox Store, {userName}!</h2>
              <p>Thank you for creating an account. Your customer account is now active and ready for express checkout.</p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 4px 0;"><strong>Email:</strong> {email}</p>
                <p style="margin: 4px 0;"><strong>Phone:</strong> {phone}</p>
              </div>
              <p>Explore exclusive seasonal deals and track your shipments directly from your Customer Dashboard.</p>
              <p style="color: #64748b; font-size: 12px; margin-top: 30px;">emox Store • Automated System Notification</p>
            </div>
          `,
          bodyText: "Welcome to emox Store, {userName}! Your account ({email}) is now active.",
          variables: ["userName", "email", "phone"],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "tpl_forgot_pwd",
          code: "FORGET_PASSWORD",
          title: "Forget Password",
          subject: "Forget Password",
          bodyHtml: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #0f172a;">Password Reset Request</h2>
              <p>We received a request to reset your emox account password.</p>
              <p>Click the link below or copy it to your browser to set a new password:</p>
              <p><a href="{resetLink}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
              <p style="color: #64748b; font-size: 12px;">If you did not request this, please ignore this email.</p>
            </div>
          `,
          variables: ["resetLink", "userName", "email"],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "tpl_order_confirm",
          code: "ORDER_CONFIRMATION",
          title: "Order Confirmation",
          subject: "Order Confirmation",
          bodyHtml: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #16a34a;">Thank You for Your Order!</h2>
              <p>Hi {userName}, your order <strong>#{orderNumber}</strong> has been received and confirmed.</p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 4px 0;"><strong>Order Total:</strong> {totalAmount}</p>
                <p style="margin: 4px 0;"><strong>Shipping Address:</strong> {shippingAddress}</p>
                <p style="margin: 4px 0;"><strong>Items:</strong> {items}</p>
              </div>
              <p>Our warehouse team is preparing your package for dispatch.</p>
            </div>
          `,
          variables: ["userName", "orderNumber", "totalAmount", "shippingAddress", "items"],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "tpl_bulk_order",
          code: "BULK_ORDER_CONFIRMATION",
          title: "Bulk Order Confirmation",
          subject: "New Bulk Order Email from Metalxplus !!",
          bodyHtml: `<p>Bulk order inquiry received for #{orderNumber}. Total: {totalAmount}.</p>`,
          variables: ["orderNumber", "totalAmount", "userName"],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "tpl_custom_shipping",
          code: "CUSTOM_SHIPPING_ORDER",
          title: "Custom Shipping Order",
          subject: "Custom Shipping Order user [ORDERID]",
          bodyHtml: `<p>Custom shipping arranged for order #[ORDERID]. Carrier: {carrier}.</p>`,
          variables: ["orderId", "carrier", "userName"],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "tpl_revised_order",
          code: "REVISED_ORDER",
          title: "Revised Order",
          subject: "Revised Order Details from Metalxplus !!",
          bodyHtml: `<p>Your order #{orderNumber} has been revised. New Total: {totalAmount}.</p>`,
          variables: ["orderNumber", "totalAmount", "items"],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "tpl_low_inv",
          code: "LOW_INVENTORY",
          title: "Low Inventory Notification",
          subject: "Update the Stock for the testing",
          bodyHtml: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #fecaca; background: #fff1f2; border-radius: 8px;">
              <h3 style="color: #dc2626;">⚠️ Low Stock Alert: {productName}</h3>
              <p>Warehouse: <strong>{warehouse}</strong></p>
              <p>SKU: <strong>{sku}</strong></p>
              <p>Current Available Stock: <strong>{currentStock}</strong> units (Reorder Level: {reorderLevel})</p>
              <p>Please reorder stock promptly to prevent fulfillment delays.</p>
            </div>
          `,
          variables: ["productName", "sku", "warehouse", "currentStock", "reorderLevel"],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "tpl_unsub_news",
          code: "UNSUBSCRIBE_NEWSLETTER",
          title: "Unsubscribe Newsletter Footer",
          subject: "Unsubscribe Link Newsletter Footer",
          bodyHtml: `<p>You have successfully unsubscribed from marketing emails.</p>`,
          variables: ["email"],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "tpl_news_sub",
          code: "NEWSLETTER_SUBSCRIBER",
          title: "Newsletter Subscriber Confirmation",
          subject: "Newsletter Subscriber Confirmation",
          bodyHtml: `<p>Welcome! Thank you for subscribing to our newsletter updates.</p>`,
          variables: ["email"],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "tpl_news_remind",
          code: "NEWSLETTER_REMINDER",
          title: "Newsletter Subscriber Confirmation Reminder",
          subject: "Newsletter Subscriber Confirmation Reminder",
          bodyHtml: `<p>Reminder: Confirm your newsletter subscription to receive exclusive promo codes.</p>`,
          variables: ["email", "confirmLink"],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "tpl_mfg_created",
          code: "MANUFACTURER_CREATED",
          title: "Manufacturer Created",
          subject: "Manufacturer Created",
          bodyHtml: `<p>New manufacturer <strong>{mfgName}</strong> has been registered in the system. Contact: {contactName} ({email}).</p>`,
          variables: ["mfgName", "contactName", "email"],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "tpl_wh_created",
          code: "WAREHOUSE_CREATED",
          title: "Warehouse Created",
          subject: "Warehouse Created",
          bodyHtml: `<p>New warehouse <strong>{warehouseName}</strong> has been successfully configured and activated.</p>`,
          variables: ["warehouseName", "contactName"],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "tpl_unpaid_order",
          code: "UNPAID_ORDER_DETAILS",
          title: "Pay Button Click - Unpaid Order Details",
          subject: "Pay Button Click - Unpaid Order Details",
          bodyHtml: `<p>Order #{orderNumber} is pending payment. Click here to complete checkout: <a href="{checkoutUrl}">Complete Payment</a></p>`,
          variables: ["orderNumber", "checkoutUrl", "totalAmount"],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "tpl_new_review",
          code: "NEW_REVIEW_RECEIVED",
          title: "New Review Received",
          subject: "New Review Received",
          bodyHtml: `<p>New product review submitted by {userName} for {productName}. Rating: {rating}/5 stars.</p>`,
          variables: ["userName", "productName", "rating"],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "tpl_user_approval",
          code: "REQUEST_USER_APPROVAL",
          title: "Request for User Approval",
          subject: "New Registration At Metalxplus - Need to Approve",
          bodyHtml: `<p>A new customer account {email} requires administrative verification.</p>`,
          variables: ["email", "name"],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "tpl_wh_packing",
          code: "WAREHOUSE_PACKING_LIST",
          title: "Warehouse Packing List",
          subject: "Warehouse Packing List",
          bodyHtml: `<p>Packing list generated for order #{orderNumber}. Fulfilling Warehouse: {warehouse}. Items: {items}</p>`,
          variables: ["orderNumber", "warehouse", "items"],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "tpl_order_dispatched",
          code: "ORDER_DISPATCHED",
          title: "Order Dispatched / Shipped",
          subject: "Order Dispatched - Tracking #[TRACKINGNUMBER]",
          bodyHtml: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #2563eb;">Your Package is on the Way! 🚚</h2>
              <p>Hi {userName}, your order <strong>#{orderNumber}</strong> has been dispatched from <strong>{warehouse}</strong>.</p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 4px 0;"><strong>Logistics Carrier:</strong> {carrier}</p>
                <p style="margin: 4px 0;"><strong>Tracking Number:</strong> {trackingNumber}</p>
              </div>
              <p><a href="{trackingUrl}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px;">Track Your Shipment</a></p>
            </div>
          `,
          variables: ["userName", "orderNumber", "trackingNumber", "carrier", "warehouse", "trackingUrl"],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      hasChanges = true;
    }

    // 23. Seed Shipments for existing orders if empty
    if (!db.shipments || db.shipments.length === 0) {
      db.shipments = (db.orders || []).slice(0, 5).map((o, idx) => {
        const prov = idx % 2 === 0 ? "shiprocket" : "delhivery";
        const awb = prov === "shiprocket" ? "SR-88921" + idx : "DEL-77291" + idx;
        return {
          id: "shp_" + o.id,
          orderId: o.id,
          orderNumber: o.orderNumber,
          shippingProviderId: prov === "shiprocket" ? "sp_shiprocket" : "sp_delhivery",
          shippingProviderName: prov === "shiprocket" ? "Shiprocket" : "Delhivery",
          shippingProviderCode: prov,
          providerShipmentId: "PRV-SHP-" + (1000 + idx),
          awbNumber: o.trackingNumber || awb,
          trackingUrl:
            prov === "shiprocket"
              ? "https://shiprocket.co/tracking/" + awb
              : "https://www.delhivery.com/track/package/" + awb,
          shippingCharge: o.shippingCost || 45,
          shipmentStatus: o.orderStatus === "Delivered" ? "Delivered" : "Shipped",
          recipientName: o.customerName,
          shippingAddress: o.shippingAddress,
          carrier: o.carrier || (prov === "shiprocket" ? "BlueDart Express" : "Delhivery Surface"),
          shippedAt: o.shippedAt || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
      hasChanges = true;
    }


    if (hasChanges) {
      await this.writeLocalDb(db);
    }
  }

  // ================= STORAGE SETTINGS =================

  public static async getStorageSettings(): Promise<StorageSettingsRecord> {
    await this.seedInitialData();
    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const s = await prisma.setting.findUnique({ where: { key: "asset_storage_settings" } });
        if (s && s.value) {
          return s.value as unknown as StorageSettingsRecord;
        }
      } catch {}
    }

    const db = await this.readLocalDb();
    if (db.storageSettings) {
      return db.storageSettings;
    }

    const defaultSettings: StorageSettingsRecord = {
      provider: "local",
      s3Enabled: false,
      s3Region: "us-east-1",
      s3Bucket: "",
      s3AccessKeyId: "",
      s3SecretAccessKey: "",
      cloudfrontUrl: "",
      updatedAt: new Date().toISOString(),
    };
    db.storageSettings = defaultSettings;
    await this.writeLocalDb(db);
    return defaultSettings;
  }

  public static async saveStorageSettings(settings: Partial<StorageSettingsRecord>): Promise<StorageSettingsRecord> {
    const existing = await this.getStorageSettings();
    const updated: StorageSettingsRecord = {
      ...existing,
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        await prisma.setting.upsert({
          where: { key: "asset_storage_settings" },
          create: { key: "asset_storage_settings", value: updated as any },
          update: { value: updated as any },
        });
      } catch {}
    }

    const db = await this.readLocalDb();
    db.storageSettings = updated;
    await this.writeLocalDb(db);
    return updated;
  }

  // ================= MAIL CONFIGURATION =================

  public static async getMailConfiguration(): Promise<MailConfigurationRecord> {
    await this.seedInitialData();
    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const config = await prisma.mailConfiguration.findFirst();
        if (config) {
          return {
            ...config,
            transportMethod: config.transportMethod as any,
            secureSocketType: config.secureSocketType as any,
            authType: config.authType as any,
            updatedAt: config.updatedAt.toISOString(),
          };
        }
      } catch {}
    }

    const db = await this.readLocalDb();
    if (db.mailConfig) {
      return db.mailConfig;
    }

    const defaultConfig: MailConfigurationRecord = {
      isEnabled: true,
      defaultFromName: "QAReply",
      defaultFromEmail: "qaadmin@example.com",
      defaultReplyName: "tag31",
      defaultReplyTo: "tag31@example.com",
      transportMethod: "SENDMAIL",
      server: "smtp.gmail.com",
      port: 25,
      secureSocketType: "TLS",
      authType: "LOGIN",
      username: "admin@tag.com",
      password: "",
      contactUsEmail: "test2xuark@gmail.com",
      ccMailOption: true,
      ccEmailAddresses: ["dup@example.com", "cc2@example.com"],
      updatedAt: new Date().toISOString(),
    };
    db.mailConfig = defaultConfig;
    await this.writeLocalDb(db);
    return defaultConfig;
  }

  public static async saveMailConfiguration(data: Partial<MailConfigurationRecord>): Promise<MailConfigurationRecord> {
    const existing = await this.getMailConfiguration();
    const updated: MailConfigurationRecord = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const first = await prisma.mailConfiguration.findFirst();
        if (first) {
          await prisma.mailConfiguration.update({
            where: { id: first.id },
            data: {
              isEnabled: updated.isEnabled,
              defaultFromName: updated.defaultFromName,
              defaultFromEmail: updated.defaultFromEmail,
              defaultReplyName: updated.defaultReplyName,
              defaultReplyTo: updated.defaultReplyTo,
              transportMethod: updated.transportMethod,
              server: updated.server,
              port: updated.port,
              secureSocketType: updated.secureSocketType,
              authType: updated.authType,
              username: updated.username,
              password: updated.password || "",
              contactUsEmail: updated.contactUsEmail,
              ccMailOption: updated.ccMailOption,
              ccEmailAddresses: updated.ccEmailAddresses,
            },
          });
        } else {
          await prisma.mailConfiguration.create({
            data: {
              isEnabled: updated.isEnabled,
              defaultFromName: updated.defaultFromName,
              defaultFromEmail: updated.defaultFromEmail,
              defaultReplyName: updated.defaultReplyName,
              defaultReplyTo: updated.defaultReplyTo,
              transportMethod: updated.transportMethod,
              server: updated.server,
              port: updated.port,
              secureSocketType: updated.secureSocketType,
              authType: updated.authType,
              username: updated.username,
              password: updated.password || "",
              contactUsEmail: updated.contactUsEmail,
              ccMailOption: updated.ccMailOption,
              ccEmailAddresses: updated.ccEmailAddresses,
            },
          });
        }
      } catch {}
    }

    const db = await this.readLocalDb();
    db.mailConfig = updated;
    await this.writeLocalDb(db);
    return updated;
  }

  // ================= EMAIL TEMPLATES =================

  public static async findEmailTemplates(search?: string): Promise<EmailTemplateRecord[]> {
    await this.seedInitialData();
    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const list = await prisma.emailTemplate.findMany({
          orderBy: { createdAt: "asc" },
        });
        if (list && list.length > 0) {
          let mapped = list.map((t) => ({
            ...t,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
          }));
          if (search?.trim()) {
            const q = search.toLowerCase().trim();
            mapped = mapped.filter((t) => t.title.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q));
          }
          return mapped;
        }
      } catch {}
    }

    const db = await this.readLocalDb();
    let templates = db.emailTemplates || [];
    if (search?.trim()) {
      const q = search.toLowerCase().trim();
      templates = templates.filter((t) => t.title.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q));
    }
    return templates;
  }

  public static async findEmailTemplateById(id: string): Promise<EmailTemplateRecord | null> {
    await this.seedInitialData();
    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const t = await prisma.emailTemplate.findUnique({ where: { id } });
        if (t) return { ...t, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() };
      } catch {}
    }
    const db = await this.readLocalDb();
    return (db.emailTemplates || []).find((t) => t.id === id) || null;
  }

  public static async findEmailTemplateByCode(code: string): Promise<EmailTemplateRecord | null> {
    await this.seedInitialData();
    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const t = await prisma.emailTemplate.findUnique({ where: { code } });
        if (t) return { ...t, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() };
      } catch {}
    }
    const db = await this.readLocalDb();
    return (db.emailTemplates || []).find((t) => t.code === code) || null;
  }

  public static async updateEmailTemplate(
    id: string,
    data: Partial<EmailTemplateRecord>
  ): Promise<EmailTemplateRecord | null> {
    const usePg = await this.testPostgres();
    if (usePg) {
      try {
        const updated = await prisma.emailTemplate.update({
          where: { id },
          data: {
            title: data.title,
            subject: data.subject,
            bodyHtml: data.bodyHtml,
            bodyText: data.bodyText,
            isActive: data.isActive,
          },
        });
        if (updated) {
          return {
            ...updated,
            createdAt: updated.createdAt.toISOString(),
            updatedAt: updated.updatedAt.toISOString(),
          };
        }
      } catch {}
    }

    const db = await this.readLocalDb();
    if (!db.emailTemplates) db.emailTemplates = [];
    const idx = db.emailTemplates.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    db.emailTemplates[idx] = {
      ...db.emailTemplates[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await this.writeLocalDb(db);
    return db.emailTemplates[idx];
  }

  // ================= WAREHOUSE INVENTORY & MOVEMENTS =================

  public static async findWarehouseInventory(params?: {
    productId?: string;
    warehouseId?: string;
    search?: string;
  }): Promise<WarehouseInventoryRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    let list = db.warehouseInventory || [];

    if (params?.productId) {
      list = list.filter((i) => i.productId === params.productId);
    }
    if (params?.warehouseId) {
      list = list.filter((i) => i.warehouseId === params.warehouseId);
    }
    if (params?.search?.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (i) =>
          (i.productName || "").toLowerCase().includes(q) ||
          (i.productSku || "").toLowerCase().includes(q) ||
          (i.warehouseName || "").toLowerCase().includes(q)
      );
    }

    return list;
  }

  public static async findInventoryMovements(params?: {
    productId?: string;
    warehouseId?: string;
    type?: string;
    limit?: number;
  }): Promise<InventoryMovementRecord[]> {
    await this.seedInitialData();
    const db = await this.readLocalDb();
    let list = db.inventoryMovements || [];

    if (params?.productId) {
      list = list.filter((m) => m.productId === params.productId);
    }
    if (params?.warehouseId) {
      list = list.filter((m) => m.warehouseId === params.warehouseId);
    }
    if (params?.type) {
      list = list.filter((m) => m.type === params.type);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (params?.limit) {
      list = list.slice(0, params.limit);
    }
    return list;
  }

  public static async adjustStock(data: {
    productId: string;
    warehouseId: string;
    quantity: number;
    notes?: string;
    referenceId?: string;
  }): Promise<WarehouseInventoryRecord> {
    const db = await this.readLocalDb();
    if (!db.warehouseInventory) db.warehouseInventory = [];
    if (!db.inventoryMovements) db.inventoryMovements = [];

    const product = (db.products || []).find((p) => p.id === data.productId);
    const warehouse = (db.warehouses || []).find((w) => w.id === data.warehouseId);

    let inv = db.warehouseInventory.find(
      (i) => i.productId === data.productId && i.warehouseId === data.warehouseId
    );

    const prevAvail = inv ? inv.availableQuantity : 0;
    const prevReserved = inv ? inv.reservedQuantity : 0;
    const newAvail = Math.max(0, prevAvail + data.quantity);

    if (inv) {
      inv.availableQuantity = newAvail;
      inv.updatedAt = new Date().toISOString();
    } else {
      inv = {
        id: "winv_" + Math.random().toString(36).substring(2, 9),
        productId: data.productId,
        warehouseId: data.warehouseId,
        productName: product?.name || "Product",
        productSku: product?.sku || "SKU",
        warehouseName: warehouse?.name || "Warehouse",
        availableQuantity: newAvail,
        reservedQuantity: 0,
        reorderLevel: product?.minStock || 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.warehouseInventory.push(inv);
    }

    // Sync product total stock across warehouses
    if (product) {
      const allProductInv = db.warehouseInventory.filter((i) => i.productId === data.productId);
      product.currentStock = allProductInv.reduce((sum, i) => sum + i.availableQuantity, 0);
    }

    // Record movement
    const movement: InventoryMovementRecord = {
      id: "mov_" + Math.random().toString(36).substring(2, 9),
      productId: data.productId,
      warehouseId: data.warehouseId,
      productName: product?.name || "Product",
      warehouseName: warehouse?.name || "Warehouse",
      type: data.quantity >= 0 ? "STOCK_ADD" : "ADJUSTMENT",
      quantity: data.quantity,
      previousAvailable: prevAvail,
      newAvailable: newAvail,
      previousReserved: prevReserved,
      newReserved: prevReserved,
      referenceId: data.referenceId || "MANUAL_ADJUSTMENT",
      notes: data.notes || "Stock manual adjustment",
      createdAt: new Date().toISOString(),
    };
    db.inventoryMovements.unshift(movement);

    await this.writeLocalDb(db);
    return inv;
  }

  public static async reserveStock(
    orderId: string,
    items: Array<{ productId: string; quantity: number; warehouseId?: string }>
  ): Promise<boolean> {
    const db = await this.readLocalDb();
    if (!db.warehouseInventory) db.warehouseInventory = [];
    if (!db.inventoryMovements) db.inventoryMovements = [];

    for (const item of items) {
      // Find suitable warehouse inventory record
      let inv = item.warehouseId
        ? db.warehouseInventory.find((i) => i.productId === item.productId && i.warehouseId === item.warehouseId)
        : db.warehouseInventory.find((i) => i.productId === item.productId && i.availableQuantity >= item.quantity);

      if (!inv) {
        inv = db.warehouseInventory.find((i) => i.productId === item.productId);
      }

      if (inv) {
        const prevAvail = inv.availableQuantity;
        const prevReserved = inv.reservedQuantity;
        const qtyToReserve = Math.min(prevAvail, item.quantity);

        inv.availableQuantity = Math.max(0, prevAvail - qtyToReserve);
        inv.reservedQuantity = prevReserved + qtyToReserve;
        inv.updatedAt = new Date().toISOString();

        db.inventoryMovements.unshift({
          id: "mov_" + Math.random().toString(36).substring(2, 9),
          productId: item.productId,
          warehouseId: inv.warehouseId,
          productName: inv.productName,
          warehouseName: inv.warehouseName,
          type: "RESERVATION",
          quantity: qtyToReserve,
          previousAvailable: prevAvail,
          newAvailable: inv.availableQuantity,
          previousReserved: prevReserved,
          newReserved: inv.reservedQuantity,
          referenceId: orderId,
          notes: "Stock reserved for order #" + orderId,
          createdAt: new Date().toISOString(),
        });
      }
    }

    await this.writeLocalDb(db);
    return true;
  }

  public static async releaseStock(
    orderId: string,
    items: Array<{ productId: string; quantity: number; warehouseId?: string }>
  ): Promise<boolean> {
    const db = await this.readLocalDb();
    if (!db.warehouseInventory) return false;
    if (!db.inventoryMovements) db.inventoryMovements = [];

    for (const item of items) {
      let inv = item.warehouseId
        ? db.warehouseInventory.find((i) => i.productId === item.productId && i.warehouseId === item.warehouseId)
        : db.warehouseInventory.find((i) => i.productId === item.productId && i.reservedQuantity >= item.quantity);

      if (!inv) {
        inv = db.warehouseInventory.find((i) => i.productId === item.productId);
      }

      if (inv) {
        const prevAvail = inv.availableQuantity;
        const prevReserved = inv.reservedQuantity;
        const qtyToRelease = Math.min(prevReserved, item.quantity);

        inv.availableQuantity = prevAvail + qtyToRelease;
        inv.reservedQuantity = Math.max(0, prevReserved - qtyToRelease);
        inv.updatedAt = new Date().toISOString();

        db.inventoryMovements.unshift({
          id: "mov_" + Math.random().toString(36).substring(2, 9),
          productId: item.productId,
          warehouseId: inv.warehouseId,
          productName: inv.productName,
          warehouseName: inv.warehouseName,
          type: "RELEASE",
          quantity: qtyToRelease,
          previousAvailable: prevAvail,
          newAvailable: inv.availableQuantity,
          previousReserved: prevReserved,
          newReserved: inv.reservedQuantity,
          referenceId: orderId,
          notes: "Reserved stock released due to order cancellation #" + orderId,
          createdAt: new Date().toISOString(),
        });
      }
    }

    await this.writeLocalDb(db);
    return true;
  }

  public static async dispatchStock(
    shipmentId: string,
    orderId: string,
    items: Array<{ productId: string; quantity: number; warehouseId?: string }>
  ): Promise<boolean> {
    const db = await this.readLocalDb();
    if (!db.warehouseInventory) return false;
    if (!db.inventoryMovements) db.inventoryMovements = [];

    for (const item of items) {
      let inv = item.warehouseId
        ? db.warehouseInventory.find((i) => i.productId === item.productId && i.warehouseId === item.warehouseId)
        : db.warehouseInventory.find((i) => i.productId === item.productId);

      if (inv) {
        const prevAvail = inv.availableQuantity;
        const prevReserved = inv.reservedQuantity;
        const qtyToDispatch = Math.min(prevReserved, item.quantity);

        inv.reservedQuantity = Math.max(0, prevReserved - qtyToDispatch);
        inv.updatedAt = new Date().toISOString();

        db.inventoryMovements.unshift({
          id: "mov_" + Math.random().toString(36).substring(2, 9),
          productId: item.productId,
          warehouseId: inv.warehouseId,
          productName: inv.productName,
          warehouseName: inv.warehouseName,
          type: "DISPATCH",
          quantity: qtyToDispatch,
          previousAvailable: prevAvail,
          newAvailable: inv.availableQuantity,
          previousReserved: prevReserved,
          newReserved: inv.reservedQuantity,
          referenceId: shipmentId || orderId,
          notes: "Stock dispatched from warehouse for shipment #" + shipmentId,
          createdAt: new Date().toISOString(),
        });
      }
    }

    await this.writeLocalDb(db);
    return true;
  }

  public static async findNotifications(filter?: { category?: string }): Promise<NotificationRecord[]> {
    const db = await this.readLocalDb();
    if (!db.notifications || db.notifications.length === 0) {
      db.notifications = [
        {
          id: "notif_deal_1",
          title: "🔥 Flash Deal: Flagship Mobiles Up to 40% OFF",
          body: "Limited time festive offer on iPhone 16 Pro & Top Smartphones. Grab yours before stocks run out!",
          category: "deal",
          badge: "40% OFF",
          icon: "🔥",
          imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=300",
          actionUrl: "/(tabs)/deals",
          actionText: "View Deals",
          createdAt: new Date().toISOString(),
          isRead: false,
        },
        {
          id: "notif_offer_2",
          title: "🎁 Mega Offer: Flat ₹200 OFF on First Order",
          body: "Use promo coupon code WELCOME200 at checkout to claim instant flat discount.",
          category: "offer",
          badge: "FLAT ₹200",
          icon: "🎁",
          imageUrl: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=300",
          actionUrl: "/(tabs)/cart",
          actionText: "Shop Now",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          isRead: false,
        },
        {
          id: "notif_deal_3",
          title: "⚡ Lightning Deal: Nike Air Max 270 React Sneakers",
          body: "Premium running shoes back in stock with exclusive festive price drop. Free shipping included!",
          category: "deal",
          badge: "POPULAR",
          icon: "⚡",
          imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300",
          actionUrl: "/products/prod_nike_af1",
          actionText: "Grab Deal",
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          isRead: false,
        },
        {
          id: "notif_sys_4",
          title: "📦 Express Delivery Free Across India",
          body: "Get free guaranteed delivery on all orders this week. Verified by Razorpay Secure Payments.",
          category: "system",
          badge: "FREE SHIPPING",
          icon: "📦",
          actionUrl: "/(tabs)",
          actionText: "Explore Products",
          createdAt: new Date(Date.now() - 14400000).toISOString(),
          isRead: true,
        },
      ];
      await this.writeLocalDb(db);
    }

    if (filter?.category && filter.category !== "all") {
      return db.notifications.filter((n: any) => n.category === filter.category);
    }
    return db.notifications;
  }

  public static async createNotification(data: Partial<NotificationRecord>): Promise<NotificationRecord> {
    const db = await this.readLocalDb();
    if (!db.notifications) db.notifications = [];
    const newNotif: NotificationRecord = {
      id: "notif_" + Math.random().toString(36).substring(2, 9),
      title: data.title || "Special Offer Announcement",
      body: data.body || "New top deals and discounts available now!",
      category: data.category || "deal",
      badge: data.badge || "NEW",
      icon: data.icon || (data.category === "offer" ? "🎁" : "🔥"),
      imageUrl: data.imageUrl || "",
      actionUrl: data.actionUrl || "/(tabs)/deals",
      actionText: data.actionText || "View Now",
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    db.notifications.unshift(newNotif);
    await this.writeLocalDb(db);
    return newNotif;
  }

  public static async markNotificationRead(id: string): Promise<boolean> {
    const db = await this.readLocalDb();
    if (!db.notifications) return false;
    let found = false;
    db.notifications = db.notifications.map((n: any) => {
      if (n.id === id || id === "ALL") {
        found = true;
        return { ...n, isRead: true };
      }
      return n;
    });
    if (found) await this.writeLocalDb(db);
    return found;
  }
}
