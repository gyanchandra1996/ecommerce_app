import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { apiClient } from "./api";
import { router } from "expo-router";

// Configure how notifications are presented when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  } as any),
});

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#2563EB",
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync().catch(() => null);
    const token = tokenData?.data;

    if (token) {
      await apiClient
        .post("/api/notifications/register", {
          token,
          platform: Platform.OS,
        })
        .catch(() => {});
      return token;
    }
    return null;
  } catch {
    // Graceful fallback for emulator or local test runs
    return null;
  }
}

export function setupNotificationListeners(onNewNotification?: (data: any) => void) {
  const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
    if (onNewNotification) {
      onNewNotification(notification.request.content);
    }
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    if (data?.actionUrl) {
      try {
        router.push(data.actionUrl as any);
      } catch {}
    }
  });

  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}
