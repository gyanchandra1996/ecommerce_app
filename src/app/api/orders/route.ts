import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { AuthService } from "@/modules/auth/services/auth.service";
import { EmailService } from "@/core/mail/email.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const fromOrderNo = searchParams.get("fromOrderNo") || undefined;
    const toOrderNo = searchParams.get("toOrderNo") || undefined;
    const fromDate = searchParams.get("fromDate") || undefined;
    const toDate = searchParams.get("toDate") || undefined;
    const gateway = searchParams.get("gateway") || undefined;
    const shipmentStatus = searchParams.get("shipmentStatus") || undefined;
    const carrier = searchParams.get("carrier") || undefined;

    const orders = await DatabaseStore.findOrders({
      status,
      search,
      fromOrderNo,
      toOrderNo,
      fromDate,
      toDate,
      gateway,
      shipmentStatus,
      carrier,
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const authUser = await AuthService.getCurrentUser();

    if (!body.customerName || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Customer name and at least one item are required" },
        { status: 400 }
      );
    }

    // Validate saved address ownership if selected from customer's saved addresses
    if (authUser && authUser.role !== "ADMIN") {
      if (body.savedShippingId) {
        const addr = await DatabaseStore.findAddressById(body.savedShippingId);
        if (
          addr &&
          addr.userId &&
          addr.userId !== authUser.id &&
          addr.customerEmail?.toLowerCase() !== authUser.email.toLowerCase()
        ) {
          return NextResponse.json(
            { success: false, error: "Invalid shipping address selection: ownership mismatch." },
            { status: 403 }
          );
        }
      }
      if (body.savedBillingId) {
        const addr = await DatabaseStore.findAddressById(body.savedBillingId);
        if (
          addr &&
          addr.userId &&
          addr.userId !== authUser.id &&
          addr.customerEmail?.toLowerCase() !== authUser.email.toLowerCase()
        ) {
          return NextResponse.json(
            { success: false, error: "Invalid billing address selection: ownership mismatch." },
            { status: 403 }
          );
        }
      }
    }

    const orderNumber = body.orderNumber || "tags" + Math.floor(100 + Math.random() * 900);
    const subtotal = body.items.reduce(
      (sum: number, it: any) => sum + Number(it.price || 0) * Number(it.quantity || 1),
      0
    );
    const shippingCost = body.shippingCost !== undefined ? Number(body.shippingCost) : 0;
    const handlingCharge = body.handlingCharge !== undefined ? Number(body.handlingCharge) : 0;
    const adjustmentPrice = body.adjustmentPrice !== undefined ? Number(body.adjustmentPrice) : 0;
    const taxAmount = body.taxAmount !== undefined ? Number(body.taxAmount) : 0;
    const couponDiscount = body.couponDiscount !== undefined ? Number(body.couponDiscount) : 0;

    const calculatedTotal = Math.max(
      0,
      Number((subtotal + adjustmentPrice + handlingCharge + shippingCost + taxAmount - couponDiscount).toFixed(2))
    );
    const totalPrice = body.totalPrice !== undefined ? Number(body.totalPrice) : calculatedTotal;

    const items = body.items.map((it: any, idx: number) => ({
      id: "item_" + Math.random().toString(36).substring(2, 7) + "_" + idx,
      orderId: "",
      productId: it.productId || undefined,
      variantId: it.variantId || undefined,
      variantAttributes: it.variantAttributes || undefined,
      itemNo: it.itemNo || it.sku || "SKU-" + idx,
      name: it.name,
      price: Number(it.price),
      quantity: Number(it.quantity || 1),
      imageUrl: it.imageUrl || "",
    }));

    const history = [
      {
        timestamp: new Date().toISOString(),
        action: "CREATE",
        performedBy: body.createdBy || authUser?.name || "Customer",
        notes: "Order created",
      },
    ];

    const gatewayCode = (body.gatewayCode || body.gateway?.toLowerCase() || "authorizenet").toLowerCase();
    // Do not mark Razorpay or Paytm orders as Paid until payment verification completes
    let paymentStatus: "Paid" | "Pending" | "Failed" | "Cancelled" = body.paymentStatus || "Pending";
    if ((gatewayCode === "razorpay" || gatewayCode === "paytm") && body.paymentStatus !== "Paid") {
      paymentStatus = "Pending";
    }

    const created = await DatabaseStore.createOrder({
      orderNumber,
      customerName: body.customerName,
      customerEmail: body.customerEmail || authUser?.email || "",
      customerPhone: body.customerPhone || "",
      orderDate: body.orderDate || new Date().toISOString(),
      gateway: body.gateway || "Razorpay",
      gatewayCode,
      paymentStatus,
      orderStatus: body.orderStatus || (paymentStatus === "Paid" ? "Processing" : "Pending"),
      subtotal,
      shippingCost,
      handlingCharge,
      adjustmentPrice,
      taxAmount,
      couponCode: body.couponCode || undefined,
      couponDiscount,
      totalPrice,
      shippingAddress: body.shippingAddress || "",
      billingAddress: body.billingAddress || "",
      shippingAddressDetail: body.shippingAddressDetail || undefined,
      billingAddressDetail: body.billingAddressDetail || undefined,
      items,
      orderHistory: history,
      trackingNumber: body.trackingNumber || undefined,
      carrier: body.carrier || undefined,
      shipmentStatus: body.shipmentStatus || (body.orderStatus === "Shipped" ? "Shipped" : body.orderStatus === "Delivered" ? "Delivered" : "Pending"),
      shippedAt: body.shippedAt || undefined,
      estimatedDelivery: body.estimatedDelivery || undefined,
    });

    // 1. Reserve stock in Warehouse Inventory
    if (created.items && created.items.length > 0) {
      const reserveItems = created.items
        .filter((it: any) => Boolean(it.productId))
        .map((it: any) => ({
          productId: it.productId!,
          quantity: it.quantity,
          warehouseId: body.warehouseId || undefined,
        }));
      if (reserveItems.length > 0) {
        await DatabaseStore.reserveStock(created.id, reserveItems);
      }
    }

    // 2. Trigger Order Confirmation Email
    if (created.customerEmail) {
      EmailService.sendOrderConfirmedEmail({
        id: created.id,
        orderNumber: created.orderNumber,
        customerName: created.customerName,
        customerEmail: created.customerEmail,
        totalPrice: created.totalPrice,
        items: created.items.map((it: any) => ({
          name: it.name,
          quantity: it.quantity,
          price: it.price,
        })),
        shippingAddress: created.shippingAddress,
      }).catch((e) => console.error("Failed to trigger order confirmation email:", e));
    }

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
