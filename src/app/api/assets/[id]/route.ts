import { NextRequest } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { FileStorageEngine } from "@/core/storage/file-storage";
import { apiError, apiSuccess } from "@/core/utils/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const asset = await DatabaseStore.findAssetById(id);
    if (!asset) {
      return apiError("Asset not found.", 404);
    }
    return apiSuccess(asset);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load asset.";
    return apiError(message, 500);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, altText, caption, tags } = body;

    const updated = await DatabaseStore.updateAsset(id, {
      name,
      altText,
      caption,
      tags,
    });

    if (!updated) {
      return apiError("Asset not found or failed to update.", 404);
    }

    return apiSuccess(updated, "Asset updated successfully.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update asset.";
    return apiError(message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await DatabaseStore.deleteAsset(id);
    if (!deleted) {
      return apiError("Asset not found.", 404);
    }

    // Remove file from disk
    if (deleted.fileName) {
      await FileStorageEngine.deleteFile(deleted.fileName);
    }

    return apiSuccess({ deleted: true }, "Asset deleted successfully.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete asset.";
    return apiError(message, 500);
  }
}
