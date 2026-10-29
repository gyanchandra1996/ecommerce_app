import { NextRequest, NextResponse } from "next/server";
import { FileStorageEngine } from "@/core/storage/file-storage";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;

    const filesToUpload = files.length > 0 ? files : singleFile ? [singleFile] : [];

    if (!filesToUpload.length) {
      return NextResponse.json({ success: false, error: "No media files uploaded." }, { status: 400 });
    }

    const uploadedMedia = [];

    for (const file of filesToUpload) {
      if (!file || typeof file.arrayBuffer !== "function") continue;

      // Allow image and video formats
      const mime = file.type?.toLowerCase() || "";
      const isImage = mime.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name);
      const isVideo = mime.startsWith("video/") || /\.(mp4|webm|mov|mkv)$/i.test(file.name);

      if (!isImage && !isVideo) {
        return NextResponse.json(
          {
            success: false,
            error: `File format of "${file.name}" is not supported. Please upload images (JPG, PNG, WEBP) or videos (MP4, WEBM).`,
          },
          { status: 400 }
        );
      }

      // Max file size: 25MB for videos, 10MB for images
      const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" exceeds maximum allowed size (${isVideo ? "50MB for videos" : "10MB for images"}).`,
          },
          { status: 400 }
        );
      }

      const stored = await FileStorageEngine.saveFile(file, "reviews");

      uploadedMedia.push({
        id: "rmed_" + Math.random().toString(36).substring(2, 9),
        url: stored.url,
        type: isVideo ? ("VIDEO" as const) : ("IMAGE" as const),
        name: file.name,
        size: file.size,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully uploaded ${uploadedMedia.length} review media file(s).`,
        data: uploadedMedia,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload review media." },
      { status: 500 }
    );
  }
}
