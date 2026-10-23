import { Asset, AssetFilters } from "../types/asset.types";

export class AssetClientService {
  public static async fetchAssets(filters: Partial<AssetFilters> = {}): Promise<{
    items: Asset[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.fileType && filters.fileType !== "all") params.set("fileType", filters.fileType);
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.page) params.set("page", filters.page.toString());
    if (filters.pageSize) params.set("pageSize", filters.pageSize.toString());

    const res = await fetch(`/api/assets?${params.toString()}`, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to load assets.");

    return {
      items: json.data || [],
      total: json.pagination?.total || 0,
      page: json.pagination?.page || 1,
      pageSize: json.pagination?.pageSize || 24,
      totalPages: json.pagination?.totalPages || 1,
    };
  }

  /**
   * Uploads a file with real-time XMLHttpRequest progress reporting (0% to 100%)
   */
  public static uploadWithProgress(
    file: File,
    metadata: { altText?: string; caption?: string; tags?: string } = {},
    onProgress: (percent: number, loaded: number, total: number) => void
  ): Promise<Asset> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("files", file);
      if (metadata.altText) formData.append("altText", metadata.altText);
      if (metadata.caption) formData.append("caption", metadata.caption);
      if (metadata.tags) formData.append("tags", metadata.tags);

      xhr.open("POST", "/api/assets");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent, event.loaded, event.total);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            const assets: Asset[] = response.data || [];
            if (assets.length > 0) {
              resolve(assets[0]);
            } else {
              reject(new Error("No asset was returned from server."));
            }
          } catch {
            reject(new Error("Invalid response from server."));
          }
        } else {
          try {
            const errResponse = JSON.parse(xhr.responseText);
            reject(new Error(errResponse.message || errResponse.error || "Upload failed."));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error("Network connection error during upload."));
      xhr.onabort = () => reject(new Error("Upload aborted by user."));

      xhr.send(formData);
    });
  }

  public static async deleteAsset(id: string): Promise<void> {
    const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to delete asset.");
  }

  public static async deleteBatch(assetIds: string[]): Promise<number> {
    const res = await fetch(`/api/assets/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", assetIds }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Batch deletion failed.");
    return json.data?.deletedCount || 0;
  }

  public static async updateMetadata(
    id: string,
    data: { name?: string; altText?: string; caption?: string; tags?: string[] }
  ): Promise<Asset> {
    const res = await fetch(`/api/assets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to update asset metadata.");
    return json.data;
  }

  public static async attachToProduct(productId: string, assetId: string, isPrimary = false): Promise<void> {
    const res = await fetch(`/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, assetId, isPrimary }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to attach asset to product.");
  }
}
