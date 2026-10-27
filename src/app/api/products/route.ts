import { NextRequest } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { apiError, apiSuccess } from "@/core/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "all";
    const status = searchParams.get("status") || "All";
    const warehouse = searchParams.get("warehouse") || "all";

    const products = await DatabaseStore.findProducts({
      search,
      categoryId,
      status,
      warehouse,
    });

    return apiSuccess(products);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load products.";
    return apiError(message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sku,
      upc,
      name,
      description,
      price,
      comparePrice,
      costPrice,
      currentStock,
      minStock,
      warehouse,
      status,
      brand,
      categoryIds,
      assetIds,
      primaryAssetId,
      hasVariants,
      variantAttributes,
      variants,
      googleMerchantSync,
      googleCategory,
      googleCondition,
      googleBrand,
      googleGtin,
      googleMpn,
    } = body;

    if (!sku || !sku.trim()) {
      return apiError("SKU / Item No. is required.", 400);
    }

    if (!name || !name.trim()) {
      return apiError("Product Name is required.", 400);
    }

    const created = await DatabaseStore.createProduct({
      sku: sku.trim(),
      upc: upc ? upc.trim() : undefined,
      name: name.trim(),
      description,
      price: Number(price) || 0,
      comparePrice: comparePrice ? Number(comparePrice) : undefined,
      costPrice: costPrice ? Number(costPrice) : undefined,
      currentStock: currentStock !== undefined ? Number(currentStock) : 10,
      minStock: minStock !== undefined ? Number(minStock) : 5,
      warehouse: warehouse || "gyanwarehouse",
      status: status || "ACTIVE",
      brand,
      categoryIds: Array.isArray(categoryIds) ? categoryIds : [],
      assetIds: Array.isArray(assetIds) ? assetIds : [],
      primaryAssetId,
      hasVariants: Boolean(hasVariants),
      variantAttributes: Array.isArray(variantAttributes) ? variantAttributes : [],
      variants: Array.isArray(variants) ? variants : [],
      googleMerchantSync: Boolean(googleMerchantSync),
      googleCategory,
      googleCondition: googleCondition || "new",
      googleBrand,
      googleGtin: googleGtin || upc,
      googleMpn: googleMpn || sku,
    });

    return apiSuccess(created, "Product created successfully.", 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create product.";
    return apiError(message, 500);
  }
}
