export interface StoreProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  comparePrice?: number;
  rating: number;
  reviewsCount: number;
  brand?: string;
  category: string;
  categoryIds?: string[];
  categoryNames?: string[];
  image: string;
  images?: string[];
  sku?: string;
  isDeal?: boolean;
  discountPercent?: number;
  currentStock?: number;
  isSoldOut?: boolean;
  hasVariants?: boolean;
  variantAttributes?: Array<{ name: string; values: string[] }>;
  variants?: Array<{
    id: string;
    productId: string;
    sku: string;
    price: number;
    comparePrice?: number | null;
    costPrice?: number | null;
    currentStock: number;
    isActive: boolean;
    image?: string | null;
    attributes: Record<string, string>;
  }>;
}

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  level?: number;
  productCount?: number;
  children?: StoreCategory[];
  subcategories?: StoreCategory[];
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string | null;
  variantAttributes?: Record<string, string>;
  sku?: string;
  name: string;
  price: number;
  comparePrice?: number;
  image: string;
  quantity: number;
  maxStock?: number;
}
