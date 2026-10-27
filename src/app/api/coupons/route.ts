import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET() {
  try {
    const coupons = await DatabaseStore.findCoupons();
    return NextResponse.json({ success: true, data: coupons });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.code || !body.couponType) {
      return NextResponse.json(
        { success: false, error: "Coupon Code and Coupon Type are required" },
        { status: 400 }
      );
    }

    const created = await DatabaseStore.createCoupon({
      code: body.code,
      couponType: body.couponType,
      discountPercentage: Number(body.discountPercentage || 0),
      discountAmount: Number(body.discountAmount || 0),
      minAmount: Number(body.minAmount || 0),
      expiryDate: body.expiryDate || undefined,
      usageLimit: Number(body.usageLimit || 0),
      usageLimitPerCustomer: Number(body.usageLimitPerCustomer || 1),
      selectedUsers: Array.isArray(body.selectedUsers) ? body.selectedUsers : [],
      selectedTemplate: body.selectedTemplate || "",
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
