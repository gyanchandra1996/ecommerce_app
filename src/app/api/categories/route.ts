import { NextRequest } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { apiError, apiSuccess } from "@/core/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const format = searchParams.get("format") || "tree"; // "tree" or "flat"

    if (format === "tree" && !search) {
      const tree = await DatabaseStore.findCategoryTree();
      return apiSuccess(tree);
    }

    const categories = await DatabaseStore.findCategories(search);
    return apiSuccess(categories);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load categories.";
    return apiError(message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, parentId, image } = body;

    if (!name || !name.trim()) {
      return apiError("Category name is required.", 400);
    }

    const created = await DatabaseStore.createCategory({
      name: name.trim(),
      description: description?.trim(),
      parentId: parentId || null,
      image: image?.trim() || null,
    });

    return apiSuccess(created, "Category created successfully.", 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create category.";
    return apiError(message, 500);
  }
}
