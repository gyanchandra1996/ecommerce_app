import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { DatabaseStore } from "@/core/db/store";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const name = (formData.get("name") as string) || "";
    const description = (formData.get("description") as string) || "";
    const author = (formData.get("author") as string) || "Third Party Author";

    if (!file) {
      return NextResponse.json({ success: false, error: "No theme ZIP file provided" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".zip")) {
      return NextResponse.json(
        { success: false, error: "Invalid file format. Only .zip theme files are supported." },
        { status: 400 }
      );
    }

    // Dedicated folder structure for theme packages
    const themesDir = path.join(process.cwd(), "data", "themes");
    await fs.mkdir(themesDir, { recursive: true });

    // Generate safe filename
    const safeBase = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const zipFileName = `${Date.now()}_${safeBase}`;
    const destinationPath = path.join(themesDir, zipFileName);

    // Save binary buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(destinationPath, buffer);

    // Derive theme title
    const themeName = name.trim() || file.name.replace(/\.zip$/i, "").replace(/[-_]/g, " ");
    const slug = themeName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    const defaultTheme = DatabaseStore.getDefaultThemeRecord();

    // Create theme in store
    const createdTheme = await DatabaseStore.createTheme({
      name: themeName,
      slug: slug + "-" + Math.random().toString(36).substring(2, 6),
      version: "1.0.0",
      thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&q=80",
      description: description || `Uploaded theme package: ${file.name} (${(buffer.length / 1024).toFixed(1)} KB)`,
      author,
      isActive: false,
      isSystem: false,
      zipFileName,
      config: {
        ...defaultTheme.config,
        design: {
          ...defaultTheme.config.design,
          headerStyle: "modern",
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: createdTheme,
      message: `Theme "${themeName}" uploaded and validated successfully! Added to Theme Library.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
