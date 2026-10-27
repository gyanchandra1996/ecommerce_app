import { NextResponse } from "next/server";
import { ShippingService } from "@/core/shipping/shipping.service";
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

    const tracking = await ShippingService.getTracking(id);

    return NextResponse.json({
      success: true,
      data: {
        ...tracking,
        shipment,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
