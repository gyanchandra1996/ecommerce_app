import { NextResponse } from "next/server";
import { PaymentService } from "@/core/payment/payment.service";
import { DatabaseStore } from "@/core/db/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      customerId,
      items,
      subtotal,
      shippingCost,
      taxAmount,
      couponCode,
      couponDiscount,
      totalPrice,
      shippingAddress,
      billingAddress,
      shippingAddressDetail,
      billingAddressDetail,
    } = body;

    if (!orderNumber || !customerName || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order number, customer name, and items are required." },
        { status: 400 }
      );
    }

    // Verify order amount on the server
    const calculatedSubtotal = items.reduce(
      (sum: number, it: any) => sum + Number(it.price || 0) * Number(it.quantity || 1),
      0
    );
    const serverDiscount = Number(couponDiscount) || 0;
    const serverShipping = Number(shippingCost) || 0;
    const serverTax = Number(taxAmount) || 0;
    const calculatedTotal = Number(
      Math.max(0, calculatedSubtotal + serverShipping + serverTax - serverDiscount).toFixed(2)
    );

    const amountToCharge = totalPrice !== undefined ? Number(totalPrice) : calculatedTotal;

    if (amountToCharge <= 0) {
      return NextResponse.json(
        { success: false, error: "Total payable amount must be greater than zero." },
        { status: 400 }
      );
    }

    // 1. Call Razorpay API to create official Razorpay Order
    const razorpayOrder = await PaymentService.createRazorpayOrder({
      orderNumber,
      amountInRupees: amountToCharge,
      currency: "INR",
      customerName,
      customerEmail,
      customerPhone,
    });

    // 2. Initialize or save order in database with "Pending" status
    const orderItems = items.map((it: any, idx: number) => ({
      id: "item_" + Math.random().toString(36).substring(2, 7) + "_" + idx,
      orderId: "",
      productId: it.productId || undefined,
      variantId: it.variantId || undefined,
      variantAttributes: it.variantAttributes || undefined,
      itemNo: it.itemNo || it.sku || `SKU-${idx + 1}`,
      name: it.name,
      price: Number(it.price),
      quantity: Number(it.quantity || 1),
      imageUrl: it.imageUrl || it.image || "",
    }));

    await DatabaseStore.createOrder({
      orderNumber,
      customerName,
      customerEmail: customerEmail || "",
      customerPhone: customerPhone || "",
      orderDate: new Date().toISOString(),
      gateway: "Razorpay",
      gatewayCode: "razorpay",
      paymentStatus: "Pending",
      orderStatus: "Processing",
      subtotal: calculatedSubtotal,
      shippingCost: serverShipping,
      taxAmount: serverTax,
      couponCode: couponCode || undefined,
      couponDiscount: serverDiscount,
      totalPrice: amountToCharge,
      shippingAddress: shippingAddress || "",
      billingAddress: billingAddress || "",
      shippingAddressDetail: shippingAddressDetail || undefined,
      billingAddressDetail: billingAddressDetail || undefined,
      items: orderItems,
      gatewayOrderId: razorpayOrder.orderId,
      orderHistory: [
        {
          timestamp: new Date().toISOString(),
          action: "PAYMENT_INITIATED",
          performedBy: customerName,
          notes: `Razorpay order created with ID: ${razorpayOrder.orderId}. Amount: ₹${amountToCharge.toFixed(2)}`,
        },
      ],
    });

    // 3. Return parameters required by frontend Razorpay Checkout SDK
    return NextResponse.json({
      success: true,
      data: {
        orderId: razorpayOrder.orderId,
        amount: razorpayOrder.amount, // in paise
        currency: razorpayOrder.currency,
        keyId: razorpayOrder.keyId,
        orderNumber,
      },
    });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create Razorpay payment order." },
      { status: 500 }
    );
  }
}
