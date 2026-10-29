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
export const API_BASE_URL = `http://${DEFAULT_HOST_IP}:3000`;
export const MOBILE_DEV_API_KEY = "gstore_mob_live_98a72b64f";

export const getActiveBaseUrl = async (): Promise<string> => {
  try {
    const custom = await AsyncStorage.getItem("gstore_custom_api_url");
    if (custom && custom.trim().startsWith("http")) {
      return custom.trim().replace(/\/$/, "");
    }
  } catch {}
  return `http://${getDetectedServerIP()}:3000`;
};

export const getFullImageUrl = (path?: string): string => {
  if (!path) return "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=300";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = `http://${getDetectedServerIP()}:3000`;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
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

// Response Interceptor: extract data cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Unable to connect to server. Check Wi-Fi connection.";
    return Promise.reject(new Error(errorMsg));
  }
);
