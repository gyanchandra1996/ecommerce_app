import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gateway = await DatabaseStore.findGatewayById(id);
    if (!gateway) {
      return NextResponse.json({ success: false, error: "Payment gateway not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: gateway });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await DatabaseStore.updateGateway(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Payment gateway not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(req, { params });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await DatabaseStore.deleteGateway(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Payment gateway not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Payment gateway deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
