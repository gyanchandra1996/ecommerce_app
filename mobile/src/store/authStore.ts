import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { apiClient } from "../services/api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
  type?: string;
  avatar?: string;
  phone?: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  loadStoredSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (email: string, name?: string, googleId?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  error: null,

  loadStoredSession: async () => {
    try {
      set({ isLoading: true, error: null });
      const token = await SecureStore.getItemAsync("gstore_auth_token");
      if (!token) {
        set({ user: null, token: null, isLoading: false });
        return;
      }

      // Validate token with backend
      const res = await apiClient.get("/api/auth/me?portal=customer");
      if (res.data?.success && res.data?.data?.user) {
        set({
          user: res.data.data.user,
          token,
          isLoading: false,
        });
      } else {
        await SecureStore.deleteItemAsync("gstore_auth_token");
        set({ user: null, token: null, isLoading: false });
      }
    } catch {
      await SecureStore.deleteItemAsync("gstore_auth_token");
      set({ user: null, token: null, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const res = await apiClient.post("/api/auth/login", {
        email: email.trim().toLowerCase(),
        password,
        portal: "customer",
      });

      if (res.data?.success && res.data?.data) {
        const { token, user } = res.data.data;
        if (token) {
          await SecureStore.setItemAsync("gstore_auth_token", token);
        }
        set({ user, token: token || null, isLoading: false, error: null });

        // Trigger cart merge on backend
        try {
          await apiClient.post("/api/cart/merge");
        } catch {}

        return true;
      }
      throw new Error(res.data?.error || res.data?.message || "Login failed");
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const res = await apiClient.post("/api/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.data?.success && res.data?.data) {
        const { token, user } = res.data.data;
        if (token) {
          await SecureStore.setItemAsync("gstore_auth_token", token);
        }
        set({ user, token: token || null, isLoading: false, error: null });

        // Trigger cart merge on backend
        try {
          await apiClient.post("/api/cart/merge");
        } catch {}

        return true;
      }
      throw new Error(res.data?.error || res.data?.message || "Registration failed");
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  loginWithGoogle: async (email: string, name?: string, googleId?: string) => {
    try {
      set({ isLoading: true, error: null });
      const res = await apiClient.post("/api/auth/oauth/google", {
        email,
        name: name || email.split("@")[0],
        googleId: googleId || `g_${Date.now()}`,
      });

      if (res.data?.success && res.data?.data?.token) {
        const { token, user } = res.data.data;
        await SecureStore.setItemAsync("gstore_auth_token", token);
        set({ user, token, isLoading: false });

        // Merge cart
        try {
          await apiClient.post("/api/cart/merge");
        } catch {}

        return true;
      }
      throw new Error(res.data?.error || "Google login failed");
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync("gstore_auth_token");
      await apiClient.post("/api/auth/logout").catch(() => {});
      set({ user: null, token: null });
    } catch {}
  },
}));
