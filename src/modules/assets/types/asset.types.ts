export type AssetType = "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO" | "OTHER";

export interface Asset {
  id: string;
  name: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string | null;
  fileType: AssetType;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  altText?: string | null;
  caption?: string | null;
  folder?: string | null;
  tags: string[];
  uploaderId?: string | null;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
}

export interface AssetUploadItem {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
  errorMessage?: string;
  uploadedAsset?: Asset;
}

export interface AssetFilters {
  search: string;
  fileType: "all" | "image" | "video" | "document" | "audio";
  sort: "recent" | "oldest" | "name_asc" | "name_desc" | "size_desc";
  page: number;
  pageSize: number;
}
