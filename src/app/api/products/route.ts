import { NextRequest } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { apiError, apiSuccess } from "@/core/utils/api-response";

export async function GET() {
  try {
    await DatabaseStore.seedInitialData();
    const products = await DatabaseStore.getProductsWithAssets();
    return apiSuccess(products);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load products.";
    return apiError(message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, assetId, isPrimary } = body;

    if (!productId || !assetId) {
      return apiError("Product ID and Asset ID are required.", 400);
    }

    await DatabaseStore.attachAssetToProduct(productId, assetId, Boolean(isPrimary));
    return apiSuccess({ attached: true }, "Asset linked to product successfully.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to attach asset.";
    return apiError(message, 500);
  }
}
