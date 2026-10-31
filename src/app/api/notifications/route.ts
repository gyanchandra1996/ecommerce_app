import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const activeOnly = searchParams.get("activeOnly") === "true";

    let notifications = await DatabaseStore.findNotifications({ category });
    if (activeOnly) {
      notifications = notifications.filter((n) => n.isActive !== false);
    }
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const settings = await DatabaseStore.getNotificationSettings();

    return NextResponse.json({
      success: true,
      data: notifications,
      settings,
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
    const {
      title,
      body: notifBody,
      category,
      badge,
      icon,
      imageUrl,
      actionUrl,
      actionText,
      isActive = true,
      broadcastPush = true,
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Notification title is required." },
        { status: 400 }
      );
    }

    const settings = await DatabaseStore.getNotificationSettings();

    const created = await DatabaseStore.createNotification({
      title,
      body: notifBody,
      category: category || "deal",
      badge: badge || "DEAL",
      icon: icon || "🔥",
      imageUrl: imageUrl || "",
      actionUrl: actionUrl || "/(tabs)/deals",
      actionText: actionText || "View Deal",
      isActive: isActive !== false,
    });

    // Broadcast push notification if notifications are globally enabled AND broadcastPush is true
    let pushSentCount = 0;
    let pushWarning: string | null = null;

    if (!settings.notificationsEnabled) {
      pushWarning = "Notifications are currently turned OFF globally in Backend Settings. Notification was saved, but push alerts are paused.";
    } else if (!isActive) {
      pushWarning = "Notification saved as Inactive/Draft. Push broadcast was skipped.";
    } else if (broadcastPush !== false) {
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
    }

    return NextResponse.json({
      success: true,
      data: created,
      pushSentCount,
      warning: pushWarning,
      message: pushWarning
        ? `Notification created successfully. (${pushWarning})`
        : `Notification created & pushed to ${pushSentCount} devices.`,
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

    // 1. Update Global Settings (Master ON/OFF switch)
    if (body.settings) {
      const updatedSettings = await DatabaseStore.updateNotificationSettings(body.settings);
      return NextResponse.json({
        success: true,
        settings: updatedSettings,
        message: updatedSettings.notificationsEnabled
          ? "Master Push Notification Switch is now ON (Active)."
          : "Master Push Notification Switch is now OFF (Paused globally).",
      });
    }

    // 2. Toggle or Edit Single Notification
    if (body.id && (body.updates || body.isActive !== undefined)) {
      const updates = body.updates || {};
      if (body.isActive !== undefined) {
        updates.isActive = Boolean(body.isActive);
      }
      const updated = await DatabaseStore.updateNotification(body.id, updates);
      if (!updated) {
        return NextResponse.json({ success: false, error: "Notification not found." }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: updated,
        message: updated.isActive !== false ? "Notification turned ON (Active)." : "Notification turned OFF (Inactive).",
      });
    }

    // 3. Mark Read
    const { id = "ALL" } = body;
    const marked = await DatabaseStore.markNotificationRead(id);
    return NextResponse.json({
      success: true,
      marked,
      message: id === "ALL" ? "All notifications marked as read." : "Notification marked as read.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update notification." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Notification ID is required." }, { status: 400 });
    }

    const deleted = await DatabaseStore.deleteNotification(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Notification not found or already deleted." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      deleted: true,
      message: "Notification removed successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete notification." },
      { status: 500 }
    );
  }
}
