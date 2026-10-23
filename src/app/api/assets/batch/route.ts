import { NextRequest } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { FileStorageEngine } from "@/core/storage/file-storage";
import { apiError, apiSuccess } from "@/core/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, assetIds } = body as { action: "delete"; assetIds: string[] };

    if (!Array.isArray(assetIds) || !assetIds.length) {
      return apiError("No assets specified.", 400);
    }

    if (action === "delete") {
      // Find asset filenames to delete from disk
      for (const id of assetIds) {
        const item = await DatabaseStore.findAssetById(id);
        if (item?.fileName) {
          await FileStorageEngine.deleteFile(item.fileName);
        }
      }

      const count = await DatabaseStore.deleteManyAssets(assetIds);
      return apiSuccess({ deletedCount: count }, `Successfully deleted ${count} assets.`);
    }

    return apiError("Unsupported batch action.", 400);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to execute batch operation.";
    return apiError(message, 500);
  }
}
