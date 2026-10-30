import { NextResponse } from "next/server";
import { PaymentService } from "@/core/payment/payment.service";
import { DatabaseStore } from "@/core/db/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      customerName = "Valued Customer",
      customerEmail = "customer@eshop.com",
      customerPhone = "+91 98765 43211",
      items = [],
      subtotal,
      shippingCost = 0,
      taxAmount = 0,
      couponDiscount = 0,
      totalPrice,
      description,
    } = body;

    let calculatedTotal = totalPrice ? Number(totalPrice) : 0;

    if (!calculatedTotal && items && items.length > 0) {
      const calcSubtotal = items.reduce(
        (sum: number, it: any) => sum + Number(it.price || 0) * Number(it.quantity || 1),
        0
      );
      calculatedTotal = Number(
        Math.max(0, calcSubtotal + Number(shippingCost) + Number(taxAmount) - Number(couponDiscount)).toFixed(2)
      );
    }

    if (calculatedTotal <= 0) {
      calculatedTotal = 161.10; // Default sample amount if empty
    }

    // Call Razorpay API to generate live official hosted Payment Link
    const paymentLinkResult = await PaymentService.createRazorpayPaymentLink({
      orderNumber,
      amountInRupees: calculatedTotal,
      currency: "INR",
      customerName,
      customerEmail,
      customerPhone,
      description: description || `e-Shop Order #${orderNumber}`,
    });

    // Save order in database with "Pending" status and Razorpay Payment Link ID
    const orderItems = items.length > 0
      ? items.map((it: any, idx: number) => ({
          id: "item_" + Math.random().toString(36).substring(2, 7) + "_" + idx,
          orderId: "",
          productId: it.productId || undefined,
          variantId: it.variantId || undefined,
          itemNo: it.itemNo || it.sku || `SKU-${idx + 1}`,
          name: it.name || "Product",
          price: Number(it.price || calculatedTotal),
          quantity: Number(it.quantity || 1),
          imageUrl: it.imageUrl || it.image || "",
        }))
      : [
          {
            id: "item_sample_1",
            orderId: "",
            name: "e-Shop Order Item",
            price: calculatedTotal,
            quantity: 1,
            imageUrl: "",
          },
        ];

    await DatabaseStore.createOrder({
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      orderDate: new Date().toISOString(),
      gateway: "Razorpay Payment Link",
      gatewayCode: "razorpay_link",
      paymentStatus: "Pending",
      orderStatus: "Processing",
      subtotal: calculatedTotal,
      shippingCost: Number(shippingCost) || 0,
      taxAmount: Number(taxAmount) || 0,
      couponDiscount: Number(couponDiscount) || 0,
      totalPrice: calculatedTotal,
      shippingAddress: body.shippingAddress || "Customer Delivery Address",
      billingAddress: body.billingAddress || "Customer Billing Address",
      items: orderItems,
      gatewayOrderId: paymentLinkResult.paymentLinkId,
    }).catch((dbErr) => {
      console.warn("Could not pre-save link order to DB:", dbErr);
    });

    return NextResponse.json({
      success: true,
      orderNumber,
      paymentLinkId: paymentLinkResult.paymentLinkId,
      shortUrl: paymentLinkResult.shortUrl,
      amount: calculatedTotal,
      currency: paymentLinkResult.currency,
      provider: "Razorpay Standard Hosted Page",
    });
  } catch (error: any) {
    console.error("Payment Link Generation Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate Razorpay Payment Link.",
      },
      { status: 500 }
    );
  }
}
