import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mfg = await DatabaseStore.findManufacturerById(id);
    if (!mfg) {
      return NextResponse.json({ success: false, error: "Manufacturer not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: mfg });
  } catch (error: any) {
    const status = error.message?.includes("Cannot delete manufacturer") ? 400 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await DatabaseStore.updateManufacturer(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Manufacturer not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    const status = error.message?.includes("Cannot delete manufacturer") ? 400 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await DatabaseStore.deleteManufacturer(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Manufacturer not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Manufacturer deleted successfully" });
  } catch (error: any) {
    const status = error.message?.includes("Cannot delete manufacturer") ? 400 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
