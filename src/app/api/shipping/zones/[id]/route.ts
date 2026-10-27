import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await DatabaseStore.saveShippingZone({ ...body, id });
    return NextResponse.json({ success: true, data: updated, message: "Zone updated successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await DatabaseStore.deleteShippingZone(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Zone not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Shipping zone deleted successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
