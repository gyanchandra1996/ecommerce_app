import { NextRequest, NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET() {
  try {
    const settings = await DatabaseStore.getSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (err: any) {
    console.error("GET /api/settings error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await DatabaseStore.updateSettings(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("POST /api/settings error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await DatabaseStore.updateSettings(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("PATCH /api/settings error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
