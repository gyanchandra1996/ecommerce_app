import { NextRequest, NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const items = await DatabaseStore.findMenuItems(includeInactive);
    return NextResponse.json({ success: true, data: items });
  } catch (err: any) {
    console.error("GET /api/menu error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { label, url, icon, badge, displayOrder, isActive, isHighlight } = body;

    if (!label?.trim() || !url?.trim()) {
      return NextResponse.json(
        { success: false, error: "Label and URL are required" },
        { status: 400 }
      );
    }

    const newItem = await DatabaseStore.createMenuItem({
      label: label.trim(),
      url: url.trim(),
      icon: icon?.trim() || undefined,
      badge: badge?.trim() || undefined,
      displayOrder: typeof displayOrder === "number" ? displayOrder : 1,
      isActive: isActive !== false,
      isHighlight: Boolean(isHighlight),
    });

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/menu error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create menu item" },
      { status: 500 }
    );
  }
}
