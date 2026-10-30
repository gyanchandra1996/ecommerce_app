import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../services/api";

export interface NotificationItem {
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

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  activeBanner: NotificationItem | null;
  fetchNotifications: (category?: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendCustomNotification: (payload: {
    title: string;
    body: string;
    category?: "deal" | "offer" | "order" | "system";
    badge?: string;
    actionUrl?: string;
    actionText?: string;
  }) => Promise<NotificationItem | null>;
  showBanner: (notif: NotificationItem) => void;
  hideBanner: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  activeBanner: null,

  fetchNotifications: async (category?: string) => {
    try {
      set({ isLoading: true });
      const query = category && category !== "all" ? `?category=${category}` : "";
      const res = await apiClient.get(`/api/notifications${query}`);
      if (res.data?.success && Array.isArray(res.data?.data)) {
        const items: NotificationItem[] = res.data.data;
        const unread = items.filter((n) => !n.isRead).length;
        set({ notifications: items, unreadCount: unread, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await apiClient.patch("/api/notifications", { id });
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        };
      });
    } catch {}
  },

  markAllAsRead: async () => {
    try {
      await apiClient.patch("/api/notifications", { id: "ALL" });
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {}
  },

  sendCustomNotification: async (payload) => {
    try {
      const res = await apiClient.post("/api/notifications", payload);
      if (res.data?.success && res.data?.data) {
        const newNotif: NotificationItem = res.data.data;
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
        // Show real-time banner alert on phone!
        get().showBanner(newNotif);
        return newNotif;
      }
      return null;
    } catch {
      return null;
    }
  },

  showBanner: (notif: NotificationItem) => {
    set({ activeBanner: notif });
  },

  hideBanner: () => {
    set({ activeBanner: null });
  },
}));
