import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { requireAdminAuth } from "@/core/auth/admin-guard";
import { EmailService } from "@/core/mail/email.service";

export async function POST(req: Request) {
  try {
    const auth = await requireAdminAuth();
    if (!auth.authorized) {
      return auth.response!;
    }

    const body = await req.json();
    const { productId, warehouseId, quantity, notes, referenceId } = body;

    if (!productId || !warehouseId || quantity === undefined || isNaN(Number(quantity))) {
      return NextResponse.json(
        { success: false, error: "Valid productId, warehouseId, and quantity are required." },
        { status: 400 }
      );
    }

    const updated = await DatabaseStore.adjustStock({
      productId,
      warehouseId,
      quantity: Number(quantity),
      notes: notes || "Stock manual adjustment",
      referenceId: referenceId || "MANUAL_ADJUSTMENT",
    });

    // Check if stock fell below reorder level and notify
    if (updated.availableQuantity <= updated.reorderLevel) {
      EmailService.sendLowInventoryEmail({
        productName: updated.productName || "Product",
        sku: updated.productSku || "SKU",
        warehouseName: updated.warehouseName || "Warehouse",
        currentStock: updated.availableQuantity,
        reorderLevel: updated.reorderLevel,
      }).catch((e: any) => console.error("Failed to send low inventory email trigger:", e));
    }

    return NextResponse.json({
      success: true,
      message: "Stock adjusted successfully.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
