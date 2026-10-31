import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET() {
  try {
    const settings = await DatabaseStore.getNotificationSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load notification settings." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updated = await DatabaseStore.updateNotificationSettings(body);
    return NextResponse.json({
      success: true,
      data: updated,
      message: updated.notificationsEnabled
        ? "Push Notifications turned ON successfully."
        : "Push Notifications turned OFF successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update notification settings." },
      { status: 500 }
    );
  }
}
