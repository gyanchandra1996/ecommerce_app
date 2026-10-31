import { create } from "zustand";
import { apiClient } from "../services/api";
import { useToastStore } from "./toastStore";

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: number;
    comparePrice?: number;
    mainImage?: string;
  };
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  couponCode: string | null;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, variantId?: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totalItems: 0,
  subtotal: 0,
  discount: 0,
  couponCode: null,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await apiClient.get("/api/cart");
      if (res.data?.success && res.data?.data) {
        const cart = res.data.data;
        const items = cart.items || [];
        const totalItems = items.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0);
        const subtotal = Number(cart.subtotal || 0);

        set({
          items,
          totalItems,
          subtotal,
          isLoading: false,
        });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addToCart: async (productId: string, variantId?: string, quantity = 1) => {
    try {
      set({ isLoading: true, error: null });
      const res = await apiClient.post("/api/cart", {
        productId,
        variantId,
        quantity,
      });

      if (res.data?.success) {
        await get().fetchCart();
        useToastStore.getState().showToast({
          message: "Added to Cart! 🛍️",
          type: "cart",
          actionText: "View Cart",
          actionUrl: "/(tabs)/cart",
        });
        return true;
      }
      return false;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  updateQuantity: async (productId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await get().removeFromCart(productId);
        return;
      }
      await apiClient.post("/api/cart", { productId, quantity });
      await get().fetchCart();
    } catch {}
  },

  removeFromCart: async (productId: string) => {
    try {
      await apiClient.delete(`/api/cart?productId=${productId}`);
      await get().fetchCart();
      useToastStore.getState().showToast({
        message: "Item removed from cart 🗑️",
        type: "remove",
      });
    } catch {}
  },

  applyCoupon: async (code: string) => {
    try {
      const subtotal = get().subtotal;
      const res = await apiClient.post("/api/coupons/apply", {
        code,
        subtotal,
      });

      if (res.data?.success && res.data?.data) {
        const discount = Number(res.data.data.discountAmount || 0);
        set({ discount, couponCode: code });
        return { success: true, message: `Coupon ${code} applied (-₹${discount.toFixed(2)})` };
      }
      return { success: false, message: res.data?.error || "Invalid coupon" };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to apply coupon" };
    }
  },

  clearCart: async () => {
    try {
      await apiClient.delete("/api/cart");
      set({ items: [], totalItems: 0, subtotal: 0, discount: 0, couponCode: null });
    } catch {}
  },
}));
