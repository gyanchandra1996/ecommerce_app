import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { APP_CONFIG } from "../config/env";
import { encryptCredentials, decryptCredentials } from "../shipping/encryption";

export type AssetType = "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO" | "OTHER";

export interface StorageSettings {
  provider: "local" | "s3";
  s3Enabled: boolean;
  s3Region?: string;
  s3Bucket?: string;
  s3AccessKeyId?: string;
  s3SecretAccessKey?: string;
  cloudfrontUrl?: string;
  updatedAt?: string;
}

export interface StoredAssetResult {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  storageProvider: "local" | "s3";
  storageKey: string;
  fileType: AssetType;
  extension: string;
}

export class StorageService {
  private static uploadRoot = path.join(process.cwd(), "public", "uploads");

  public static async ensureLocalUploadDir(): Promise<void> {
    try {
      await fs.mkdir(this.uploadRoot, { recursive: true });
    } catch {
      // directory exists or created
    }
  }

  public static detectFileType(mimeType: string, extension: string): AssetType {
    if (mimeType.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "svg", "avif"].includes(extension)) {
      return "IMAGE";
    }
    if (mimeType.startsWith("video/") || ["mp4", "webm", "mov", "avi", "mkv"].includes(extension)) {
      return "VIDEO";
    }
    if (mimeType.startsWith("audio/") || ["mp3", "wav", "ogg", "aac"].includes(extension)) {
      return "AUDIO";
    }
    if (
      mimeType.includes("pdf") ||
      mimeType.includes("document") ||
      mimeType.includes("sheet") ||
      ["pdf", "doc", "docx", "xls", "xlsx", "csv", "txt"].includes(extension)
    ) {
      return "DOCUMENT";
    }
    return "OTHER";
  }

  public static maskSecretKey(secret?: string): string {
    if (!secret || secret.trim() === "") return "";
    if (secret.length <= 8) return "********";
    return secret.substring(0, 4) + "••••••••" + secret.substring(secret.length - 4);
  }

  public static maskSecret(secret?: string): string {
    return this.maskSecretKey(secret);
  }

  public static async testS3Connection(config: StorageSettings): Promise<{ success: boolean; message: string }> {
    return this.testConnection(config);
  }

  public static async getSettings(): Promise<StorageSettings> {
    try {
      const { DatabaseStore } = await import("@/core/db/store");
      const saved = await DatabaseStore.getStorageSettings();
      if (saved) return saved;
    } catch {}

    // Default configuration with environment fallbacks
    return {
      provider: (process.env.STORAGE_PROVIDER as "local" | "s3") || "local",
      s3Enabled: process.env.ENABLE_S3 === "true",
      s3Region: process.env.AWS_REGION || "us-east-1",
      s3Bucket: process.env.AWS_S3_BUCKET || "",
      s3AccessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      s3SecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ? encryptCredentials(process.env.AWS_SECRET_ACCESS_KEY) : "",
      cloudfrontUrl: process.env.AWS_CLOUDFRONT_URL || "",
    };
  }

  private static getS3Client(config: StorageSettings): S3Client {
    const rawSecret = config.s3SecretAccessKey
      ? decryptCredentials<string>(config.s3SecretAccessKey)
      : "";

    return new S3Client({
      region: config.s3Region || "us-east-1",
      credentials: {
        accessKeyId: (config.s3AccessKeyId || "").trim(),
        secretAccessKey: typeof rawSecret === "string" ? rawSecret.trim() : String(rawSecret).trim(),
      },
    });
  }

  public static async testConnection(
    config: StorageSettings
  ): Promise<{ success: boolean; message: string }> {
    if (!config.s3Bucket || !config.s3Bucket.trim()) {
      return { success: false, message: "S3 Bucket Name is required." };
    }
    if (!config.s3AccessKeyId || !config.s3AccessKeyId.trim()) {
      return { success: false, message: "AWS Access Key ID is required." };
    }
    if (!config.s3SecretAccessKey || !config.s3SecretAccessKey.trim()) {
      return { success: false, message: "AWS Secret Access Key is required." };
    }

    try {
      const s3Client = this.getS3Client(config);
      // Attempt ListObjectsV2Command with maxKeys: 1 to verify credentials and bucket existence
      const command = new ListObjectsV2Command({
        Bucket: config.s3Bucket.trim(),
        MaxKeys: 1,
      });

      await s3Client.send(command);
      return {
        success: true,
        message: `Successfully connected to AWS S3 bucket "${config.s3Bucket}" in region "${config.s3Region || "us-east-1"}".`,
      };
    } catch (err: any) {
      console.error("AWS S3 Connection Test failed:", err);
      return {
        success: false,
        message: err.message || "Failed to connect to AWS S3. Please verify bucket name, region, and IAM credentials.",
      };
    }
  }

  public static async uploadFile(
    file: File | { name: string; buffer: Buffer; type?: string; size?: number },
    folder = "assets"
  ): Promise<StoredAssetResult> {
    const originalName = file.name;
    const extension = path.extname(originalName).replace(".", "").toLowerCase();
    const cleanBaseName = path
      .basename(originalName, path.extname(originalName))
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();

    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const finalFileName = `${cleanBaseName}_${uniqueSuffix}.${extension || "bin"}`;
    const mimeType = (file as any).type || "application/octet-stream";
    const fileType = this.detectFileType(mimeType, extension);

    let buffer: Buffer;
    let size = 0;

    if ("arrayBuffer" in file && typeof file.arrayBuffer === "function") {
      const ab = await file.arrayBuffer();
      buffer = Buffer.from(ab);
      size = file.size;
    } else if ("buffer" in file && Buffer.isBuffer(file.buffer)) {
      buffer = file.buffer;
      size = file.size || buffer.length;
    } else {
      throw new Error("Invalid file format provided for storage upload.");
    }

    // Load active storage settings
    const settings = await this.getSettings();
    const useS3 = settings.s3Enabled && settings.provider === "s3" && settings.s3Bucket;

    if (useS3) {
      try {
        const s3Client = this.getS3Client(settings);
        const s3Key = `${folder}/${finalFileName}`.replace(/\/+/g, "/");

        const putCommand = new PutObjectCommand({
          Bucket: settings.s3Bucket,
          Key: s3Key,
          Body: buffer,
          ContentType: mimeType,
        });

        await s3Client.send(putCommand);

        let publicUrl = "";
        if (settings.cloudfrontUrl && settings.cloudfrontUrl.trim()) {
          const cdn = settings.cloudfrontUrl.trim().replace(/\/+$/, "");
          publicUrl = `${cdn}/${s3Key}`;
        } else {
          publicUrl = `https://${settings.s3Bucket}.s3.${settings.s3Region || "us-east-1"}.amazonaws.com/${s3Key}`;
        }

        return {
          fileName: finalFileName,
          originalName,
          mimeType,
          size,
          url: publicUrl,
          storageProvider: "s3",
          storageKey: s3Key,
          fileType,
          extension,
        };
      } catch (s3Error: any) {
        console.error("AWS S3 Upload failed, falling back to local storage:", s3Error);
        // Fall back gracefully to local storage if S3 fails
      }
    }

    // Default Local Storage
    await this.ensureLocalUploadDir();
    const destinationPath = path.join(this.uploadRoot, finalFileName);
    await fs.writeFile(destinationPath, buffer);

    return {
      fileName: finalFileName,
      originalName,
      mimeType,
      size,
      url: `/uploads/${finalFileName}`,
      storageProvider: "local",
      storageKey: finalFileName,
      fileType,
      extension,
    };
  }

  public static async deleteFile(
    storageKey: string,
    storageProvider: "local" | "s3" = "local"
  ): Promise<boolean> {
    if (storageProvider === "s3") {
      try {
        const settings = await this.getSettings();
        if (settings.s3Bucket) {
          const s3Client = this.getS3Client(settings);
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: settings.s3Bucket,
              Key: storageKey,
            })
          );
          return true;
        }
      } catch (err) {
        console.error("Failed to delete object from S3:", err);
      }
      return false;
    }

    // Local file deletion
    try {
      const fileName = path.basename(storageKey);
      const filePath = path.join(this.uploadRoot, fileName);
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
