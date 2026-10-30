import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, platform = "android", customerId } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: "A valid push token is required." },
        { status: 400 }
      );
    }

    await DatabaseStore.registerPushToken(token, platform, customerId);

    return NextResponse.json({
      success: true,
      message: "Push token registered successfully.",
      data: { token, platform, customerId },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register push token." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tokens = await DatabaseStore.getPushTokens();
    return NextResponse.json({
      success: true,
      totalRegistered: tokens.length,
      data: tokens,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch push tokens." },
      { status: 500 }
    );
  }
}
