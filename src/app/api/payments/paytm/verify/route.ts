import { NextResponse } from "next/server";
import { PaymentService } from "@/core/payment/payment.service";
import { DatabaseStore } from "@/core/db/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderNumber,
      txnToken,
      paytmTxnId,
      status,
      checksum,
      responseBody,
    } = body;

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: "Order number is required for verification." },
        { status: 400 }
      );
    }

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

    // Call verification service
    const verifyResult = await PaymentService.verifyPaytmPayment({
      orderNumber,
      txnToken,
      paytmTxnId,
      status: status || "TXN_SUCCESS",
      checksum,
      responseBody,
    });

    if (!verifyResult.isValid) {
      await DatabaseStore.updateOrderPayment(orderNumber, {
        paymentStatus: verifyResult.paymentStatus,
        paymentTransactionId: verifyResult.transactionId,
        notes: `Paytm payment verification failed: ${verifyResult.message}`,
      });

      return NextResponse.json(
        { success: false, error: verifyResult.message },
        { status: 400 }
      );
    }

    // Payment is valid! Update order
    const updatedOrder = await DatabaseStore.updateOrderPayment(orderNumber, {
      paymentStatus: "Paid",
      orderStatus: "Processing",
      paymentTransactionId: verifyResult.transactionId,
      gatewayOrderId: orderNumber,
      paidAt: new Date().toISOString(),
      notes: `Paytm payment verified successfully. Transaction ID: ${verifyResult.transactionId}`,
      paymentDetails: {
        txnId: verifyResult.transactionId,
        txnToken,
        status: "TXN_SUCCESS",
        verifiedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Paytm payment verified successfully.",
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error("Paytm verification error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify Paytm payment." },
      { status: 500 }
    );
  }
}
