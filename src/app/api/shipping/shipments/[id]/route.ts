import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shipment = await DatabaseStore.findShipmentByIdOrAwb(id);
    if (!shipment) {
      return NextResponse.json({ success: false, error: "Shipment not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: shipment });
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

    const updated = await DatabaseStore.updateShipment(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Shipment not found" }, { status: 404 });
    }

    // If status changed to Delivered, also update order
    if (body.shipmentStatus === "Delivered" && updated.orderId) {
      await DatabaseStore.updateOrder(updated.orderId, {
        orderStatus: "Delivered",
        shipmentStatus: "Delivered",
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
