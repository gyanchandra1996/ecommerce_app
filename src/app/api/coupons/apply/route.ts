import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, subtotal, shippingCost } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: "Coupon code is required" }, { status: 400 });
    }

    const result = await DatabaseStore.validateAndApplyCoupon(
      code,
      Number(subtotal || 0),
      Number(shippingCost || 0)
    );

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error, data: result },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
