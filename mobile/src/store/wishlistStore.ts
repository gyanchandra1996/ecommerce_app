import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  discountPercentage?: number;
  image: string;
  category?: string;
  brand?: string;
  rating?: number;
}

interface WishlistState {
  items: WishlistItem[];
  loadWishlist: () => Promise<void>;
  toggleWishlist: (item: WishlistItem) => Promise<boolean>;
  isInWishlist: (id: string) => boolean;
  removeItem: (id: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
}

const STORAGE_KEY = "eshop_mobile_wishlist_v1";

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],

  loadWishlist: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          set({ items: parsed });
        }
      }
    } catch (e) {
      console.warn("Failed to load wishlist from storage", e);
    }
  },

  toggleWishlist: async (item: WishlistItem) => {
    const { items } = get();
    const exists = items.some((i) => i.id === item.id);
    let updated: WishlistItem[];

    if (exists) {
      updated = items.filter((i) => i.id !== item.id);
    } else {
      updated = [item, ...items];
    }

    set({ items: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to persist wishlist", e);
    }
    return !exists;
  },

  isInWishlist: (id: string) => {
    return get().items.some((i) => i.id === id);
  },

  removeItem: async (id: string) => {
    const updated = get().items.filter((i) => i.id !== id);
    set({ items: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  },

  clearWishlist: async () => {
    set({ items: [] });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {}
  },
}));
