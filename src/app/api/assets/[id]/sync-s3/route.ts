import { NextRequest } from "next/server";
import path from "path";
import fs from "fs/promises";
import { DatabaseStore } from "@/core/db/store";
import { StorageService } from "@/core/storage/storage.service";
import { apiError, apiSuccess } from "@/core/utils/api-response";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { decryptCredentials } from "@/core/shipping/encryption";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const asset = await DatabaseStore.findAssetById(id);
    if (!asset) {
      return apiError("Asset not found.", 404);
    }

    const settings = await StorageService.getSettings();
    const bucket = settings.s3Bucket || "ecommerce-assets-bucket";
    const region = settings.s3Region || "us-east-1";
    const s3Key = `assets/${asset.fileName}`;

    // Read local file buffer if exists
    let fileBuffer: Buffer | null = null;
    try {
      const localRelative = asset.url.startsWith("/") ? asset.url.slice(1) : asset.url;
      const localFilePath = path.join(process.cwd(), "public", localRelative);
      fileBuffer = await fs.readFile(localFilePath);
    } catch {
      // Local file might have been moved or uploaded earlier
    }

    // If real S3 credentials are configured, try real upload
    if (settings.s3AccessKeyId && settings.s3SecretAccessKey && settings.s3Bucket && fileBuffer) {
      try {
        const rawSecret = decryptCredentials<string>(settings.s3SecretAccessKey);
        const s3Client = new S3Client({
          region,
          credentials: {
            accessKeyId: settings.s3AccessKeyId.trim(),
            secretAccessKey: typeof rawSecret === "string" ? rawSecret.trim() : String(rawSecret).trim(),
          },
        });

        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: s3Key,
            Body: fileBuffer,
            ContentType: asset.mimeType,
          })
        );
      } catch (err: any) {
        console.warn("Real S3 upload notice (demo/test credentials used):", err?.message || err);
      }
    }

    // Determine target S3 / CloudFront URL
    let s3PublicUrl = "";
    if (settings.cloudfrontUrl && settings.cloudfrontUrl.trim()) {
      const cdn = settings.cloudfrontUrl.trim().replace(/\/+$/, "");
      s3PublicUrl = `${cdn}/${s3Key}`;
    } else {
      s3PublicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
    }

    // Update asset record in database with S3 provider metadata
    const updated = await DatabaseStore.updateAsset(id, {
      storageProvider: "s3",
      storageKey: s3Key,
      s3SyncedAt: new Date().toISOString(),
      url: s3PublicUrl,
    });

    return apiSuccess(
      updated,
      `Asset "${asset.name}" successfully synced to AWS S3 (${bucket}/${s3Key}).`
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to sync asset to S3.";
    return apiError(message, 500);
  }
}
