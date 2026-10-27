import { NextResponse } from "next/server";
import { PaymentService } from "@/core/payment/payment.service";
import { DatabaseStore } from "@/core/db/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderNumber,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!orderNumber || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required Razorpay payment response parameters for verification.",
        },
        { status: 400 }
      );
    }

    // 1. Check existing order
    const order = await DatabaseStore.findOrderById(orderNumber);
    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order #${orderNumber} not found.` },
        { status: 404 }
      );
    }

    // Prevent duplicate payment processing if already paid
    if (order.paymentStatus === "Paid") {
      return NextResponse.json({
        success: true,
        message: "Order has already been verified and marked as Paid.",
        data: order,
      });
    }

    // 2. Cryptographically verify signature on backend
    const verification = await PaymentService.verifyRazorpayPayment({
      orderNumber,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    if (!verification.isValid) {
      // Mark as Failed if signature does not match
      await DatabaseStore.updateOrderPayment(orderNumber, {
        paymentStatus: "Failed",
        notes: `Razorpay signature verification failed. Details: ${verification.error || "Signature mismatch"}`,
      });

      return NextResponse.json(
        { success: false, error: verification.error || "Payment verification failed." },
        { status: 400 }
      );
    }

    // 3. Signature is valid! Update order to Paid and record transaction details
    const updatedOrder = await DatabaseStore.updateOrderPayment(orderNumber, {
      paymentStatus: "Paid",
      orderStatus: "Processing",
      paymentTransactionId: razorpay_payment_id,
      gatewayOrderId: razorpay_order_id,
      paidAt: new Date().toISOString(),
      notes: `Razorpay payment verified successfully. Payment ID: ${razorpay_payment_id}`,
      paymentDetails: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        verifiedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and recorded.",
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error("Razorpay payment verification error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred during payment verification." },
      { status: 500 }
    );
  }
}
