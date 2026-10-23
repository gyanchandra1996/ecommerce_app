import { NextRequest } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { apiError, apiSuccess } from "@/core/utils/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const product = await DatabaseStore.findProductById(id);
    if (!product) {
      return apiError("Product not found.", 404);
    }
    return apiSuccess(product);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load product.";
    return apiError(message, 500);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await DatabaseStore.updateProduct(id, body);
    if (!updated) {
      return apiError("Product not found or update failed.", 404);
    }

    return apiSuccess(updated, "Product updated successfully.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update product.";
    return apiError(message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await DatabaseStore.deleteProduct(id);
    if (!deleted) {
      return apiError("Product not found.", 404);
    }

    return apiSuccess({ deleted: true }, "Product removed successfully.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete product.";
    return apiError(message, 500);
  }
}
