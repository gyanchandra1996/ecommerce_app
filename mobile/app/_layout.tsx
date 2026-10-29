import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../src/store/authStore";
import { useLocationStore } from "../src/store/locationStore";
import { useCartStore } from "../src/store/cartStore";

export default function RootLayout() {
  const loadStoredSession = useAuthStore((s) => s.loadStoredSession);
  const loadStoredLocation = useLocationStore((s) => s.loadStoredLocation);
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    loadStoredSession();
    loadStoredLocation();
    fetchCart();
  }, []);

  return (
    <>
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
          options={{ headerShown: true, title: "Product Details" }}
        />
        <Stack.Screen
          name="category/[slug]"
          options={{ headerShown: true, title: "Category Products" }}
        />
        <Stack.Screen
          name="checkout/index"
          options={{ headerShown: true, title: "Express Checkout" }}
        />
      </Stack>
    </>
  );
}
