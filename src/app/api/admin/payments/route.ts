import { NextRequest, NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { AuthService } from "@/modules/auth/services/auth.service";

export async function GET(req: NextRequest) {
  try {
    const adminUser = await AuthService.getCurrentAdminUser();
    if (!adminUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId") || undefined;
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const gateway = searchParams.get("gateway") || undefined;
    const fromDate = searchParams.get("fromDate") || undefined;
    const toDate = searchParams.get("toDate") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);

    const allPayments = await DatabaseStore.findPayments({
      orderId,
      search,
      status,
      gateway,
      fromDate,
      toDate,
    });

    // Compute stats
    const totalPayments = allPayments.length;
    const paidPayments = allPayments.filter((p) => p.paymentStatus.toLowerCase() === "paid");
    const pendingPayments = allPayments.filter((p) => p.paymentStatus.toLowerCase() === "pending");
    const failedPayments = allPayments.filter((p) => p.paymentStatus.toLowerCase() === "failed");
    const refundedPayments = allPayments.filter(
      (p) => p.paymentStatus.toLowerCase() === "refunded" || (p.refundAmount && p.refundAmount > 0)
    );

    const totalRevenue = paidPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalRefundedAmount = allPayments.reduce((acc, p) => acc + (p.refundAmount || 0), 0);

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginated = allPayments.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      pagination: {
        page,
        limit,
        total: totalPayments,
        totalPages: Math.ceil(totalPayments / limit) || 1,
      },
      stats: {
        totalRevenue,
        totalRefundedAmount,
        totalCount: totalPayments,
        paidCount: paidPayments.length,
        pendingCount: pendingPayments.length,
        failedCount: failedPayments.length,
        refundedCount: refundedPayments.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load payment transactions." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminUser = await AuthService.getCurrentAdminUser();
    if (!adminUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, amount, paymentGateway, transactionId, paymentMethod, paymentStatus } = body;

    if (!orderId || amount === undefined || !paymentGateway) {
      return NextResponse.json(
        { success: false, error: "Order ID, amount, and payment gateway are required." },
        { status: 400 }
      );
    }

    const newPayment = await DatabaseStore.createPayment({
      orderId,
      amount: Number(amount),
      currency: body.currency || "INR",
      paymentGateway,
      transactionId,
      paymentMethod,
      paymentStatus: paymentStatus || "Pending",
    });

    return NextResponse.json({ success: true, data: newPayment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create payment record." },
      { status: 500 }
    );
  }
}
