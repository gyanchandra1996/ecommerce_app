import { create } from "zustand";

export interface ToastOptions {
  id?: string;
  message: string;
  type?: "cart" | "wishlist" | "remove" | "success" | "error" | "info";
  icon?: string;
  actionText?: string;
  actionUrl?: string;
  duration?: number;
}

interface ToastState {
  currentToast: ToastOptions | null;
  showToast: (options: ToastOptions | string) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  currentToast: null,
  showToast: (options) => {
    const toast: ToastOptions =
      typeof options === "string"
        ? { message: options, type: "success" }
        : options;
    set({ currentToast: { ...toast, id: String(Date.now()) } });
  },
  hideToast: () => set({ currentToast: null }),
}));
