import { NextRequest, NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { AuthService } from "@/modules/auth/services/auth.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await AuthService.getCurrentAdminUser();
    if (!adminUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const payment = await DatabaseStore.findPaymentById(id);

    if (!payment) {
      return NextResponse.json(
        { success: false, error: `Payment #${id} not found.` },
        { status: 404 }
      );
    }

    // Attach order details and other payment attempts for this order
    const order = await DatabaseStore.findOrderById(payment.orderId);
    const relatedPayments = await DatabaseStore.findPaymentsByOrderId(payment.orderId);

    return NextResponse.json({
      success: true,
      data: {
        payment,
        order,
        relatedPayments: relatedPayments.filter((p) => p.id !== payment.id),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch payment details." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await AuthService.getCurrentAdminUser();
    if (!adminUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await DatabaseStore.updatePayment(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Payment #${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update payment." },
      { status: 500 }
    );
  }
}
