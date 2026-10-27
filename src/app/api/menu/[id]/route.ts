import { NextRequest, NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await DatabaseStore.findMenuItemById(id);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Menu item not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: item });
  } catch (err: any) {
    console.error("GET /api/menu/[id] error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch menu item" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await DatabaseStore.updateMenuItem(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Menu item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("PATCH /api/menu/[id] error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update menu item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await DatabaseStore.deleteMenuItem(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Menu item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Menu item deleted" });
  } catch (err: any) {
    console.error("DELETE /api/menu/[id] error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
