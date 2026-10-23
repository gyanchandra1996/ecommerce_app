import { NextRequest } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { apiError, apiSuccess } from "@/core/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return apiError("Product ID is required for Google Merchant sync.", 400);
    }

    const product = await DatabaseStore.findProductById(productId);
    if (!product) {
      return apiError("Product not found.", 404);
    }

    // Validate mandatory Google Merchant fields
    const missingFields: string[] = [];
    if (!product.price) missingFields.push("Price");
    if (!product.sku) missingFields.push("SKU");
    if (!product.brand && !product.googleBrand) missingFields.push("Brand");

    if (missingFields.length > 0) {
      await DatabaseStore.updateProduct(productId, {
        googleSyncStatus: "FAILED",
        googleMerchantSync: true,
      });
      return apiError(
        `Google Merchant sync validation failed. Missing mandatory fields: ${missingFields.join(", ")}`,
        422
      );
    }

    const updated = await DatabaseStore.updateProduct(productId, {
      googleMerchantSync: true,
      googleSyncStatus: "SYNCED",
      googleLastSyncedAt: new Date().toISOString(),
    });

    return apiSuccess(
      updated,
      `Product "${product.name}" successfully synced to Google Merchant Center.`
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Sync failed.";
    return apiError(message, 500);
  }
}
