import axios from "axios";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// If testing on Android Emulator use 10.0.2.2, for iOS Simulator or physical devices use your machine's LAN IP
// Replace with your local machine IP or production domain (e.g. "http://192.168.1.5:3000")
export const API_BASE_URL = Platform.select({
  android: "http://10.0.2.2:3000",
  ios: "http://localhost:3000",
  default: "http://localhost:3000",
});

export const MOBILE_DEV_API_KEY = "gstore_mob_live_98a72b64f";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": MOBILE_DEV_API_KEY,
  },
});

// Request Interceptor: inject Bearer Token and Guest Session ID
apiClient.interceptors.request.use(async (config) => {
  try {
    // 1. Attach JWT Token if user is logged in
    const token = await SecureStore.getItemAsync("gstore_auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Attach persistent Guest Session ID
    let sessionId = await AsyncStorage.getItem("gstore_guest_session_id");
    if (!sessionId) {
      sessionId = `mob_sess_${Math.random().toString(36).substring(2)}_${Date.now()}`;
      await AsyncStorage.setItem("gstore_guest_session_id", sessionId);
    }
    config.headers["x-session-id"] = sessionId;
  } catch (err) {
    // Fail silently in development
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
      "Network connection error.";
    return Promise.reject(new Error(errorMsg));
  }
);
