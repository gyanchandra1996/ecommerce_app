import fs from "fs/promises";
import path from "path";
import { APP_CONFIG } from "../config/env";

export type AssetType = "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO" | "OTHER";

export interface StoredFileInfo {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  fileType: AssetType;
  extension: string;
}

export class FileStorageEngine {
  private static uploadRoot = path.join(process.cwd(), "public", "uploads");

  public static async ensureUploadDir(): Promise<void> {
    try {
      await fs.mkdir(this.uploadRoot, { recursive: true });
    } catch {
      // directory already exists or created
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

  public static async saveFile(file: File): Promise<StoredFileInfo> {
    await this.ensureUploadDir();

    const originalName = file.name;
    const extension = path.extname(originalName).replace(".", "").toLowerCase();
    const cleanBaseName = path
      .basename(originalName, path.extname(originalName))
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();

    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const finalFileName = `${cleanBaseName}_${uniqueSuffix}.${extension || "bin"}`;
    const destinationPath = path.join(this.uploadRoot, finalFileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(destinationPath, buffer);

    const mimeType = file.type || "application/octet-stream";
    const fileType = this.detectFileType(mimeType, extension);

    return {
      fileName: finalFileName,
      originalName,
      mimeType,
      size: file.size,
      url: `/uploads/${finalFileName}`,
      fileType,
      extension,
    };
  }

  public static async deleteFile(fileName: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadRoot, fileName);
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
