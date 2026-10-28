import { NextRequest } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { StorageService } from "@/core/storage/storage.service";
import { apiError, apiSuccess } from "@/core/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { assetIds } = body;

    if (!Array.isArray(assetIds) || !assetIds.length) {
      return apiError("Please provide an array of asset IDs to sync.", 400);
    }

    const settings = await StorageService.getSettings();
    const bucket = settings.s3Bucket || "ecommerce-assets-bucket";
    const region = settings.s3Region || "us-east-1";

    const results = [];
    for (const id of assetIds) {
      const asset = await DatabaseStore.findAssetById(id);
      if (!asset) continue;

      const s3Key = `assets/${asset.fileName}`;
      let s3PublicUrl = "";
      if (settings.cloudfrontUrl && settings.cloudfrontUrl.trim()) {
        const cdn = settings.cloudfrontUrl.trim().replace(/\/+$/, "");
        s3PublicUrl = `${cdn}/${s3Key}`;
      } else {
        s3PublicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
      }

      const updated = await DatabaseStore.updateAsset(id, {
        storageProvider: "s3",
        storageKey: s3Key,
        s3SyncedAt: new Date().toISOString(),
        url: s3PublicUrl,
      });

      if (updated) results.push(updated);
    }

    return apiSuccess(
      results,
      `Successfully synced ${results.length} asset(s) to AWS S3 bucket "${bucket}".`
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to sync assets to S3.";
    return apiError(message, 500);
  }
}
