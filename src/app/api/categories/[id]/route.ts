import { NextRequest } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { apiError, apiSuccess } from "@/core/utils/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const category = await DatabaseStore.findCategoryById(id);
    if (!category) {
      return apiError("Category not found.", 404);
    }
    return apiSuccess(category);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load category.";
    return apiError(message, 500);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await DatabaseStore.updateCategory(id, body);
    if (!updated) {
      return apiError("Category not found.", 404);
    }

    return apiSuccess(updated, "Category updated successfully.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update category.";
    return apiError(message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await DatabaseStore.deleteCategory(id);
    if (!deleted) {
      return apiError("Category not found.", 404);
    }

    return apiSuccess({ deleted: true }, "Category and its subcategories removed.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete category.";
    return apiError(message, 500);
  }
}
