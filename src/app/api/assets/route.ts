import { NextRequest } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { FileStorageEngine } from "@/core/storage/file-storage";
import { apiError, apiSuccess } from "@/core/utils/api-response";
import { AuthService } from "@/modules/auth/services/auth.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const fileType = searchParams.get("fileType") || "all";
    const sort = (searchParams.get("sort") || "recent") as
      | "recent"
      | "oldest"
      | "name_asc"
      | "name_desc"
      | "size_desc";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "24", 10)));

    const { items, total } = await DatabaseStore.findAssets({
      search,
      fileType,
      sort,
      page,
      pageSize,
    });

    const totalPages = Math.ceil(total / pageSize) || 1;

    return apiSuccess(items, undefined, 200, {
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch assets.";
    return apiError(message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser();
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;

    const filesToUpload = files.length > 0 ? files : singleFile ? [singleFile] : [];

    if (!filesToUpload.length) {
      return apiError("No files uploaded.", 400);
    }

    const uploadedAssets = [];

    for (const file of filesToUpload) {
      if (typeof file === "string" || !file.size) continue;

      const stored = await FileStorageEngine.saveFile(file);

      const altText = (formData.get("altText") as string) || "";
      const caption = (formData.get("caption") as string) || "";
      const tagsRaw = (formData.get("tags") as string) || "";
      const tags = tagsRaw
        ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const asset = await DatabaseStore.createAsset({
        name: file.name,
        fileName: stored.fileName,
        originalName: stored.originalName,
        mimeType: stored.mimeType,
        size: stored.size,
        url: stored.url,
        fileType: stored.fileType,
        altText,
        caption,
        tags,
        uploaderId: user?.id,
      });

      uploadedAssets.push(asset);
    }

    return apiSuccess(
      uploadedAssets,
      `Successfully uploaded ${uploadedAssets.length} asset(s).`,
      201
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to upload asset.";
    return apiError(message, 500);
  }
}
