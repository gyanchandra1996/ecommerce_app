import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET() {
  try {
    const settings = await DatabaseStore.getPricingSettings();
    const productsResult = await DatabaseStore.findProducts({});
    const categoriesResult = await DatabaseStore.findCategories();

    return NextResponse.json({
      success: true,
      data: {
        settings,
        products: productsResult,
        categories: categoriesResult,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = await DatabaseStore.updatePricingSettings(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "adjust") {
      const { adjustmentType, adjustmentValue, categoryId } = body;
      const res = await DatabaseStore.applyGlobalPriceAdjustment(
        adjustmentType || "%",
        Number(adjustmentValue || 0),
        categoryId
      );
      return NextResponse.json({ success: true, data: res });
    }

    if (action === "batch") {
      const { updates } = body;
      if (!Array.isArray(updates)) {
        return NextResponse.json({ success: false, error: "updates must be an array" }, { status: 400 });
      }
      const res = await DatabaseStore.batchUpdateProductPrices(updates);
      return NextResponse.json({ success: true, data: res });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
