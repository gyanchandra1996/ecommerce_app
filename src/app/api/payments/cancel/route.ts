import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderNumber, gateway, reason } = body;

    if (!orderNumber) {
      return NextResponse.json({ success: false, error: "Order number is required." }, { status: 400 });
    }

    const updated = await DatabaseStore.updateOrderPayment(orderNumber, {
      paymentStatus: "Cancelled",
      orderStatus: "Cancelled By System",
      notes: `Customer cancelled payment checkout on ${gateway || "gateway"}. Reason: ${reason || "User dismissed modal"}`,
      performedBy: "Customer",
    });

    return NextResponse.json({ success: true, message: "Payment marked as cancelled.", data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
