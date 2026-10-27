import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/core/payment/payment.service";
import { DatabaseStore } from "@/core/db/store";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    const orderId = params.ORDERID || params.orderId || req.nextUrl.searchParams.get("orderNumber");
    const txnId = params.TXNID || params.txnId;
    const status = params.STATUS || params.status;
    const checksum = params.CHECKSUMHASH;

    if (!orderId) {
      return NextResponse.redirect(new URL("/checkout?error=MissingOrderNumber", req.url));
    }

    const verification = await PaymentService.verifyPaytmPayment({
      orderNumber: orderId,
      paytmTxnId: txnId,
      status,
      checksum,
      responseBody: params,
    });

    if (verification.isValid) {
      await DatabaseStore.updateOrderPayment(orderId, {
        paymentStatus: "Paid",
        orderStatus: "Processing",
        paymentTransactionId: verification.transactionId,
        gatewayOrderId: orderId,
        paidAt: new Date().toISOString(),
        notes: `Paytm callback verified: ${verification.message}`,
      });
      return NextResponse.redirect(new URL(`/order-success/${orderId}`, req.url));
    } else {
      await DatabaseStore.updateOrderPayment(orderId, {
        paymentStatus: "Failed",
        paymentTransactionId: verification.transactionId,
        notes: `Paytm callback declined: ${verification.message}`,
      });
      return NextResponse.redirect(
        new URL(`/checkout?error=${encodeURIComponent(verification.message)}`, req.url)
      );
    }
  } catch (error: any) {
    console.error("Paytm callback exception:", error);
    return NextResponse.redirect(
      new URL(`/checkout?error=${encodeURIComponent("Paytm callback error")}`, req.url)
    );
  }
}

export async function GET(req: NextRequest) {
  const orderNumber = req.nextUrl.searchParams.get("orderNumber");
  if (orderNumber) {
    return NextResponse.redirect(new URL(`/order-success/${orderNumber}`, req.url));
  }
  return NextResponse.redirect(new URL("/checkout", req.url));
}
