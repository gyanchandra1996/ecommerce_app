import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;

    const notifications = await DatabaseStore.findNotifications({ category });
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch notifications." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, body: notifBody, category, badge, icon, imageUrl, actionUrl, actionText } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Notification title is required." },
        { status: 400 }
      );
    }

    const created = await DatabaseStore.createNotification({
      title,
      body: notifBody,
      category: category || "deal",
      badge: badge || "DEAL",
      icon: icon || "🔥",
      imageUrl: imageUrl || "",
      actionUrl: actionUrl || "/(tabs)/deals",
      actionText: actionText || "View Deal",
    });

    // Broadcast push notification to registered devices via Expo Push Service
    let pushSentCount = 0;
    try {
      const tokens = await DatabaseStore.getPushTokens();
      const validExpoTokens = tokens.filter(
        (t) => t.token && (t.token.startsWith("ExponentPushToken") || t.token.startsWith("ExpoPushToken"))
      );

      if (validExpoTokens.length > 0) {
        const pushPayload = validExpoTokens.map((t) => ({
          to: t.token,
          sound: "default",
          title,
          body: notifBody || "New update from e-Shop",
          data: {
            notificationId: created.id,
            actionUrl: actionUrl || "/(tabs)/deals",
            category: category || "deal",
          },
        }));

        await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pushPayload),
        });
        pushSentCount = validExpoTokens.length;
      }
    } catch (pushErr) {
      console.warn("Expo Push Notification broadcast error:", pushErr);
    }

    return NextResponse.json({
      success: true,
      data: created,
      pushSentCount,
      message: "Notification created & broadcasted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create notification." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id = "ALL" } = body;

    const marked = await DatabaseStore.markNotificationRead(id);
    return NextResponse.json({
      success: true,
      marked,
      message: id === "ALL" ? "All notifications marked as read." : "Notification marked as read.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update notification status." },
      { status: 500 }
    );
  }
}
