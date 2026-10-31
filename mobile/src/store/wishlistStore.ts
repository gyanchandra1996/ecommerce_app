import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToastStore } from "./toastStore";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  discountPercentage?: number;
  image: string;
  mainImage?: string;
  category?: string;
  brand?: string;
  rating?: number;
}

interface WishlistState {
  items: WishlistItem[];
  loadWishlist: () => Promise<void>;
  toggleWishlist: (item: any) => Promise<boolean>;
  isInWishlist: (id: string) => boolean;
  removeItem: (id: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
}

const STORAGE_KEY = "eshop_mobile_wishlist_v1";

const resolveItemImage = (raw: any): string => {
  if (!raw) return "";
  if (typeof raw.image === "string" && raw.image.trim()) return raw.image.trim();
  if (typeof raw.mainImage === "string" && raw.mainImage.trim()) return raw.mainImage.trim();
  if (Array.isArray(raw.images) && raw.images.length > 0 && typeof raw.images[0] === "string") return raw.images[0].trim();
  if (Array.isArray(raw.assets) && raw.assets.length > 0 && typeof raw.assets[0]?.url === "string") return raw.assets[0].url.trim();
  if (Array.isArray(raw.variants) && raw.variants.length > 0 && typeof raw.variants[0]?.image === "string") return raw.variants[0].image.trim();
  return "";
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],

  loadWishlist: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Self-heal and normalize legacy saved items that lacked `image`
          const normalized: WishlistItem[] = parsed.map((item: any) => {
            const img = resolveItemImage(item);
            return {
              ...item,
              image: img,
              mainImage: img,
            };
          });
          set({ items: normalized });
        }
      }
    } catch (e) {
      console.warn("Failed to load wishlist from storage", e);
    }
  },

  toggleWishlist: async (rawItem: any) => {
    const { items } = get();
    const itemId = String(rawItem.id);
    const exists = items.some((i) => String(i.id) === itemId);
    let updated: WishlistItem[];

    if (exists) {
      updated = items.filter((i) => String(i.id) !== itemId);
      useToastStore.getState().showToast({
        message: "Removed from Wishlist 🤍",
        type: "wishlist",
      });
    } else {
      const resolvedImg = resolveItemImage(rawItem);
      const normalizedItem: WishlistItem = {
        id: itemId,
        name: rawItem.name || "Product",
        price: Number(rawItem.price) || 0,
        comparePrice: rawItem.comparePrice ? Number(rawItem.comparePrice) : undefined,
        discountPercentage: rawItem.discountPercentage,
        image: resolvedImg,
        mainImage: resolvedImg,
        category:
          rawItem.category ||
          (Array.isArray(rawItem.categoryNames) ? rawItem.categoryNames[0] : rawItem.categoryName),
        brand: rawItem.brand,
        rating: rawItem.rating,
      };

      updated = [normalizedItem, ...items];
      const shortName = normalizedItem.name
        ? normalizedItem.name.length > 22
          ? normalizedItem.name.substring(0, 22) + "..."
          : normalizedItem.name
        : "Item";

      useToastStore.getState().showToast({
        message: `${shortName} added to Wishlist! ❤️`,
        type: "wishlist",
      });
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
    return get().items.some((i) => String(i.id) === String(id));
  },

  removeItem: async (id: string) => {
    const updated = get().items.filter((i) => String(i.id) !== String(id));
    set({ items: updated });
    useToastStore.getState().showToast({
      message: "Removed from Wishlist 🤍",
      type: "wishlist",
    });
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
