import { NextRequest, NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { AuthService } from "@/modules/auth/services/auth.service";

export async function POST(
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
    const { refundAmount, reason, refundReference } = body;

    const payment = await DatabaseStore.findPaymentById(id);
    if (!payment) {
      return NextResponse.json(
        { success: false, error: `Payment #${id} not found.` },
        { status: 404 }
      );
    }

    const amount = Number(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "A valid positive refund amount is required." },
        { status: 400 }
      );
    }

    const maxRefundable = payment.amount - (payment.refundAmount || 0);
    if (amount > maxRefundable) {
      return NextResponse.json(
        {
          success: false,
          error: `Refund amount (${payment.currency} ${amount.toFixed(2)}) exceeds maximum remaining refundable balance of ${payment.currency} ${maxRefundable.toFixed(2)}.`,
        },
        { status: 400 }
      );
    }

    const updated = await DatabaseStore.recordPaymentRefund(
      id,
      amount,
      reason,
      refundReference
    );

    return NextResponse.json({
      success: true,
      message: `Successfully processed refund of ${payment.currency} ${amount.toFixed(2)}.`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process refund." },
      { status: 500 }
    );
  }
}
