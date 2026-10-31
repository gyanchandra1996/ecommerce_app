import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const { category, notificationIds, force = false } = body || {};

    // 0. Check Master Switch
    const settings = await DatabaseStore.getNotificationSettings();
    if (!settings.notificationsEnabled && !force) {
      return NextResponse.json(
        {
          success: false,
          error: "Push notifications are currently turned OFF globally in Backend Settings. Please switch Master Notifications ON first.",
        },
        { status: 400 }
      );
    }

    // 1. Fetch notifications from database
    let notifications = await DatabaseStore.findNotifications({
      category: category && category !== "all" ? category : undefined,
    });

    // Filter to active notifications only unless specific IDs are given
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      notifications = notifications.filter((n) => n.isActive !== false);
    } else {
      notifications = notifications.filter((n) => notificationIds.includes(n.id));
    }

    if (notifications.length === 0) {
      return NextResponse.json(
        { success: false, error: "No active notifications found to broadcast." },
        { status: 404 }
      );
    }

    // 2. Fetch registered mobile push tokens
    const tokens = await DatabaseStore.getPushTokens();
    const validExpoTokens = tokens.filter(
      (t) => t.token && (t.token.startsWith("ExponentPushToken") || t.token.startsWith("ExpoPushToken"))
    );

    let totalPushDispatched = 0;

    // 3. If there are registered push tokens, build batches and send via Expo Push API
    if (validExpoTokens.length > 0) {
      const messages: any[] = [];
      for (const notif of notifications) {
        for (const tokenObj of validExpoTokens) {
          messages.push({
            to: tokenObj.token,
            sound: "default",
            title: notif.title,
            body: notif.body,
            data: {
              notificationId: notif.id,
              actionUrl: notif.actionUrl || "/(tabs)/deals",
              category: notif.category,
              badge: notif.badge,
            },
          });
        }
      }

      // Expo accepts chunks of up to 100 messages
      const chunkSize = 100;
      for (let i = 0; i < messages.length; i += chunkSize) {
        const chunk = messages.slice(i, i + chunkSize);
        try {
          await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Accept-Encoding": "gzip, deflate",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(chunk),
          });
          totalPushDispatched += chunk.length;
        } catch (pushErr) {
          console.warn("Error sending push notification batch:", pushErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      broadcastCount: notifications.length,
      deviceCount: validExpoTokens.length,
      totalPushDispatched,
      message: `Successfully pushed ${notifications.length} notification(s) to ${validExpoTokens.length} active device(s).`,
      notifications,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to broadcast notifications." },
      { status: 500 }
    );
  }
}
