import axios from "axios";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Detect computer's local Wi-Fi IP address dynamically from Expo development server
export const getDetectedServerIP = (): string => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri && typeof hostUri === "string") {
    const ip = hostUri.split(":")[0];
    if (ip && ip !== "localhost" && ip !== "127.0.0.1") {
      return ip;
    }
  }

  // Current Wi-Fi LAN IP of development machine
  return "10.196.90.130";
};

export const DEFAULT_HOST_IP = getDetectedServerIP();

// Next.js dev server runs on port 3001 (or 3000 if 3000 is free)
let currentActivePort = "3001";

export const getActivePort = (): string => currentActivePort;
export const setActivePort = (port: string) => {
  currentActivePort = port;
};

export const API_BASE_URL = `http://${DEFAULT_HOST_IP}:${currentActivePort}`;
export const MOBILE_DEV_API_KEY = "gstore_mob_live_98a72b64f";

export const getActiveBaseUrl = async (): Promise<string> => {
  try {
    const custom = await AsyncStorage.getItem("gstore_custom_api_url");
    if (custom && custom.trim().startsWith("http")) {
      return custom.trim().replace(/\/$/, "");
    }
  } catch {}
  return `http://${getDetectedServerIP()}:${currentActivePort}`;
};

export const getFullImageUrl = (path?: string): string => {
  if (!path) return "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=300";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = `http://${getDetectedServerIP()}:${currentActivePort}`;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
};

export const apiClient = axios.create({
  baseURL: `http://${DEFAULT_HOST_IP}:${currentActivePort}`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": MOBILE_DEV_API_KEY,
  },
});

// Request Interceptor: update base URL, attach Bearer Token and Guest Session ID
apiClient.interceptors.request.use(async (config) => {
  try {
    const activeUrl = await getActiveBaseUrl();
    config.baseURL = activeUrl;

    // 1. Attach JWT Token if user is logged in
    const token = await SecureStore.getItemAsync("gstore_auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Attach persistent Guest Session ID for cart persistence
    let sessionId = await AsyncStorage.getItem("gstore_guest_session_id");
    if (!sessionId) {
      sessionId = `mob_sess_${Math.random().toString(36).substring(2)}_${Date.now()}`;
      await AsyncStorage.setItem("gstore_guest_session_id", sessionId);
    }
    config.headers["x-session-id"] = sessionId;
  } catch (err) {
    // Continue with default config
  }
  return config;
});

// Response Interceptor: auto-switch between ports 3001 & 3000 if connection fails, and retry once
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isConnError =
      error.code === "ECONNREFUSED" ||
      error.code === "ERR_NETWORK" ||
      (error.message && error.message.toLowerCase().includes("network error")) ||
      (error.message && error.message.toLowerCase().includes("timeout"));

    if (originalRequest && !originalRequest._retried && isConnError) {
      originalRequest._retried = true;
      const altPort = currentActivePort === "3001" ? "3000" : "3001";
      currentActivePort = altPort;
      const ip = getDetectedServerIP();
      const newBase = `http://${ip}:${altPort}`;
      originalRequest.baseURL = newBase;
      if (typeof originalRequest.url === "string" && originalRequest.url.startsWith("http")) {
        originalRequest.url = originalRequest.url.replace(/:300[01]/, `:${altPort}`);
      }
      try {
        return await axios(originalRequest);
      } catch (retryErr) {
        // Fall back to original error
      }
    }

    const errorMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Unable to connect to server. Check Wi-Fi connection.";
    return Promise.reject(new Error(errorMsg));
  }
);
