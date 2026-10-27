import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET() {
  try {
    const discounts = await DatabaseStore.findDiscounts();
    return NextResponse.json({ success: true, data: discounts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.itemNo || !body.productName || body.discountValue === undefined) {
      return NextResponse.json(
        { success: false, error: "Item No, Product Name, and Discount Value are required" },
        { status: 400 }
      );
    }

    const created = await DatabaseStore.createDiscount({
      itemNo: body.itemNo,
      productId: body.productId || undefined,
      productName: body.productName,
      discountType: body.discountType || "%",
      discountValue: Number(body.discountValue),
      startDate: body.startDate || new Date().toISOString().split("T")[0],
      endDate: body.endDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0],
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
