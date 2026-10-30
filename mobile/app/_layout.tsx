import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../src/store/authStore";
import { useLocationStore } from "../src/store/locationStore";
import { useCartStore } from "../src/store/cartStore";
import { useWishlistStore } from "../src/store/wishlistStore";
import { useNotificationStore } from "../src/store/notificationStore";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { NotificationBanner } from "../src/components/NotificationBanner";
import {
  registerForPushNotifications,
  setupNotificationListeners,
} from "../src/services/notificationService";

export default function RootLayout() {
  const loadStoredSession = useAuthStore((s) => s.loadStoredSession);
  const loadStoredLocation = useLocationStore((s) => s.loadStoredLocation);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const loadWishlist = useWishlistStore((s) => s.loadWishlist);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const showBanner = useNotificationStore((s) => s.showBanner);

  useEffect(() => {
    try {
      loadStoredSession();
      loadStoredLocation();
      fetchCart();
      loadWishlist();
      fetchNotifications();
      registerForPushNotifications();
      const cleanupListeners = setupNotificationListeners((content) => {
        // When notification arrives in foreground, also display our custom floating banner
        if (content?.title) {
          showBanner({
            id: "push_" + Date.now(),
            title: content.title,
            body: content.body || "",
            category: (content.data?.category as any) || "deal",
            badge: "NEW",
            icon: "🔔",
            actionUrl: content.data?.actionUrl as string,
            createdAt: new Date().toISOString(),
          });
        }
      });
      return cleanupListeners;
    } catch (e) {
      console.warn("Init session load error:", e);
    }
  }, []);

  return (
    <ErrorBoundary>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(auth)/login"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="(auth)/register"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="products/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="category/[slug]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="checkout/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="orders/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="orders/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="addresses/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="notifications/index"
          options={{ headerShown: false }}
        />
      </Stack>
      <NotificationBanner />
    </ErrorBoundary>
  );
}
