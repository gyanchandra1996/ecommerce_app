"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CartItem, StoreProduct } from "@/modules/storefront/types/storefront.types";

export interface AppliedCouponState {
  code: string;
  name?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  discountAmount: number;
  freeShipping: boolean;
  coupon?: any;
}

interface CartContextType {
  items: CartItem[];
  isInitialized: boolean;
  totalCount: number;
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  coupon: AppliedCouponState | null;
  couponError: string | null;
  couponLoading: boolean;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addItem: (product: StoreProduct | any, quantity?: number, variant?: any) => void;
  updateQuantity: (idOrProductId: string, quantity: number) => void;
  adjustQuantity: (idOrProductId: string, delta: number) => void;
  removeItem: (idOrProductId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message?: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "emox_cart_items_v1";
const COUPON_STORAGE_KEY = "emox_applied_coupon_v1";
const FREE_SHIPPING_THRESHOLD = 499; // Free delivery above ₹499 in India
const STANDARD_SHIPPING_FEE = 49; // ₹49 standard shipping across India
const TAX_RATE = 0.18; // 18% GST in India

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<AppliedCouponState | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Synchronize cart with persistent database cart (for logged-in customers and guest sessions)
  const syncWithServer = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      const json = await res.json();
      if (json.success && json.data?.items) {
        const dbItems: CartItem[] = json.data.items.map((i: any) => ({
          id: i.id,
          productId: i.productId,
          variantId: i.variantId || undefined,
          variantAttributes: i.selectedAttributes,
          sku: i.product?.sku || i.sku || "SKU",
          name: i.product?.name || i.name,
          price: i.product?.price !== undefined ? Number(i.product.price) : Number(i.price) || 0,
          comparePrice: i.product?.comparePrice,
          image: i.product?.mainImage || i.image || "/placeholder-product.png",
          quantity: i.quantity,
          maxStock: i.product?.currentStock ?? 999,
        }));
        if (dbItems.length > 0) {
          setItems(dbItems);
        }
      }
    } catch (e) {
      console.warn("Failed to synchronize cart with server", e);
    }
  }, []);

  // Load from localStorage on client mount, then reconcile with database
  useEffect(() => {
    try {
      const storedItems = localStorage.getItem(CART_STORAGE_KEY);
      if (storedItems) {
        const parsed = JSON.parse(storedItems);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }

      const storedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (storedCoupon) {
        const parsedCoupon = JSON.parse(storedCoupon);
        if (parsedCoupon && parsedCoupon.code) {
          setCoupon(parsedCoupon);
        }
      }
    } catch (e) {
      console.warn("Failed to read cart from localStorage", e);
    } finally {
      setIsInitialized(true);
      syncWithServer();
    }
  }, [syncWithServer]);

  // Listen for login/sync events to refresh cart from server
  useEffect(() => {
    const handleCartSync = () => syncWithServer();
    window.addEventListener("cart_sync_requested", handleCartSync);
    window.addEventListener("user_logged_in", handleCartSync);
    return () => {
      window.removeEventListener("cart_sync_requested", handleCartSync);
      window.removeEventListener("user_logged_in", handleCartSync);
    };
  }, [syncWithServer]);

  // Save items to localStorage whenever they change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to persist cart items", e);
    }
  }, [items, isInitialized]);

  // Save coupon to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (coupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Failed to persist coupon", e);
    }
  }, [coupon, isInitialized]);

  // Listen for storage events across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY && e.newValue) {
        try {
          setItems(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === COUPON_STORAGE_KEY) {
        try {
          setCoupon(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Recalculate totals
  const totalCount = items.reduce((acc, it) => acc + (it.quantity || 0), 0);
  const subtotal = items.reduce((acc, it) => acc + (Number(it.price) || 0) * (it.quantity || 1), 0);

  // Re-verify coupon discount if subtotal changes
  const discountAmount = coupon ? Math.min(subtotal, Number(coupon.discountAmount) || 0) : 0;
  const isFreeShipping = coupon?.freeShipping || (subtotal > 0 && subtotal >= FREE_SHIPPING_THRESHOLD);
  const shippingFee = subtotal === 0 || isFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number((taxableAmount * TAX_RATE).toFixed(2));
  const grandTotal = Number((taxableAmount + shippingFee + taxAmount).toFixed(2));

  const addItem = useCallback(
    (product: StoreProduct | any, quantity: number = 1, variant?: any) => {
      setItems((prev) => {
        const pId = product.id || product.productId;
        const selectedVariant = variant || product.selectedVariant;
        const variantId = selectedVariant ? selectedVariant.id : (product.variantId || null);
        const variantAttributes = selectedVariant
          ? selectedVariant.attributes
          : product.variantAttributes;
        const price = selectedVariant && selectedVariant.price !== undefined
          ? Number(selectedVariant.price)
          : Number(product.price) || 0;
        const comparePrice = selectedVariant && selectedVariant.comparePrice !== undefined
          ? selectedVariant.comparePrice
          : product.comparePrice;
        const sku = selectedVariant?.sku || product.sku;
        const image =
          selectedVariant?.image ||
          product.image ||
          product.mainImage ||
          product.thumbnail ||
          product.images?.[0] ||
          "/placeholder-product.png";
        const maxStock =
          selectedVariant?.currentStock !== undefined
            ? Number(selectedVariant.currentStock)
            : product.currentStock !== undefined
            ? Number(product.currentStock)
            : 999;

        const existingIndex = prev.findIndex(
          (it) => it.productId === pId && (it.variantId || null) === (variantId || null)
        );

        if (existingIndex > -1) {
          const updated = [...prev];
          const curr = updated[existingIndex];
          const newQty = Math.min(maxStock, curr.quantity + quantity);
          updated[existingIndex] = {
            ...curr,
            quantity: newQty,
            price,
            image,
            sku: sku || curr.sku,
            maxStock,
          };
          return updated;
        }

        const newItem: CartItem = {
          id: "ci_" + Math.random().toString(36).substring(2, 9),
          productId: pId,
          variantId,
          variantAttributes,
          sku,
          name: product.name,
          price,
          comparePrice: comparePrice || undefined,
          image,
          quantity: Math.min(maxStock, Math.max(1, quantity)),
          maxStock,
        };
        return [...prev, newItem];
      });

      // Persist to server database cart
      const pId = product.id || product.productId;
      const vId = variant ? variant.id : product.variantId;
      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: pId,
          variantId: vId,
          quantity,
          selectedAttributes: variant?.attributes || product.variantAttributes,
        }),
      }).catch(() => {});
    },
    []
  );

  const removeItem = useCallback((idOrProductId: string) => {
    setItems((prev) => {
      const hasDirectIdMatch = prev.some((it) => it.id === idOrProductId);
      return prev.filter((it) =>
        hasDirectIdMatch ? it.id !== idOrProductId : it.productId !== idOrProductId
      );
    });

    fetch(`/api/cart?productId=${encodeURIComponent(idOrProductId)}`, {
      method: "DELETE",
    }).catch(() => {});
  }, []);

  const updateQuantity = useCallback((idOrProductId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(idOrProductId);
      return;
    }
    setItems((prev) => {
      const hasDirectIdMatch = prev.some((it) => it.id === idOrProductId);
      return prev.map((it) => {
        const matches = hasDirectIdMatch
          ? it.id === idOrProductId
          : it.productId === idOrProductId;
        if (matches) {
          const max = it.maxStock || 999;
          return { ...it, quantity: Math.min(max, quantity) };
        }
        return it;
      });
    });

    fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: idOrProductId, quantity }),
    }).catch(() => {});
  }, [removeItem]);

  const adjustQuantity = useCallback((idOrProductId: string, delta: number) => {
    setItems((prev) => {
      const hasDirectIdMatch = prev.some((it) => it.id === idOrProductId);
      return prev
        .map((it) => {
          const matches = hasDirectIdMatch
            ? it.id === idOrProductId
            : it.productId === idOrProductId;
          if (matches) {
            const nextQty = it.quantity + delta;
            const max = it.maxStock || 999;
            return nextQty > 0 ? { ...it, quantity: Math.min(max, nextQty) } : null;
          }
          return it;
        })
        .filter(Boolean) as CartItem[];
    });

    fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: idOrProductId, delta }),
    }).catch(() => {});
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
    setCouponError(null);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch {}

    fetch("/api/cart?clear=true", { method: "DELETE" }).catch(() => {});
  }, []);

  const applyCoupon = useCallback(async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setCouponError("Please enter a valid coupon code");
      return { success: false, message: "Please enter a coupon code" };
    }

    setCouponLoading(true);
    setCouponError(null);

    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cleanCode,
          subtotal,
          shippingCost: subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        const errorMsg = json.error || "Invalid coupon code";
        setCouponError(errorMsg);
        setCoupon(null);
        return { success: false, message: errorMsg };
      }

      const couponData: AppliedCouponState = {
        code: json.data.coupon?.code || cleanCode,
        name: json.data.coupon?.name,
        discountType: json.data.coupon?.discountType || "PERCENTAGE",
        discountAmount: json.data.discountAmount || 0,
        freeShipping: Boolean(json.data.freeShipping),
        coupon: json.data.coupon,
      };

      setCoupon(couponData);
      setCouponError(null);
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.message || "Failed to validate coupon";
      setCouponError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setCouponLoading(false);
    }
  }, [subtotal]);

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    setCouponError(null);
    try {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch {}
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        isInitialized,
        totalCount,
        subtotal,
        shippingFee,
        taxAmount,
        discountAmount,
        grandTotal,
        coupon,
        couponError,
        couponLoading,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addItem,
        updateQuantity,
        adjustQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
