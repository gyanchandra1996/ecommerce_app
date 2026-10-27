import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { ShippingService } from "@/core/shipping/shipping.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const orderId = searchParams.get("orderId") || undefined;
    const status = searchParams.get("status") || undefined;
    const providerId = searchParams.get("providerId") || undefined;

    const shipments = await DatabaseStore.findShipments({
      search,
      orderId,
      status,
      providerId,
    });

    return NextResponse.json({ success: true, data: shipments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, shippingProviderId, weightKg, carrierService, customAwb, notes } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required to create a shipment." },
        { status: 400 }
      );
    }

    const result = await ShippingService.dispatchOrder({
      orderId,
      shippingProviderId,
      weightKg: Number(weightKg) || 1.0,
      carrierService,
      customAwb,
      notes,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Shipment created successfully for Order #${result.shipment.orderNumber}. AWB: ${result.shipment.awbNumber}`,
        data: result.shipment,
        trackingUrl: result.trackingUrl,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
