import { NextResponse } from "next/server";
import { ShippingService } from "@/core/shipping/shipping.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      providerId,
      code,
      origin = { pincode: "400050" },
      destination,
      packageDetails = { weightKg: 1.0 },
      compareAll = false,
    } = body;

    if (!destination || !destination.pincode) {
      return NextResponse.json(
        { success: false, error: "Destination pincode is required." },
        { status: 400 }
      );
    }

    if (compareAll || (!providerId && !code)) {
      const estimates = await ShippingService.compareAllRates(
        origin,
        destination,
        packageDetails
      );
      return NextResponse.json({ success: true, data: estimates });
    }

    const estimate = await ShippingService.calculateRate(
      providerId || code,
      origin,
      destination,
      packageDetails
    );

    return NextResponse.json({ success: true, data: estimate });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
