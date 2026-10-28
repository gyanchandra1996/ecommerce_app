import { StorageService, StoredAssetResult, AssetType } from "./storage.service";

export type { AssetType };

export interface StoredFileInfo {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  fileType: AssetType;
  extension: string;
  storageProvider?: "local" | "s3";
  storageKey?: string;
}

export class FileStorageEngine {
  public static async ensureUploadDir(): Promise<void> {
    await StorageService.ensureLocalUploadDir();
  }

  public static detectFileType(mimeType: string, extension: string): AssetType {
    return StorageService.detectFileType(mimeType, extension);
  }

  public static async saveFile(file: File, folder = "assets"): Promise<StoredFileInfo> {
    const result = await StorageService.uploadFile(file, folder);
    return {
      fileName: result.fileName,
      originalName: result.originalName,
      mimeType: result.mimeType,
      size: result.size,
      url: result.url,
      fileType: result.fileType,
      extension: result.extension,
      storageProvider: result.storageProvider,
      storageKey: result.storageKey,
    };
  }

  public static async deleteFile(fileName: string, provider: "local" | "s3" = "local"): Promise<boolean> {
    return StorageService.deleteFile(fileName, provider);
  }
}
