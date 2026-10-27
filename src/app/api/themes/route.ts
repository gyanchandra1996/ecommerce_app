import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET() {
  try {
    const themes = await DatabaseStore.findThemes();
    return NextResponse.json({ success: true, data: themes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, error: "Theme name is required" }, { status: 400 });
    }

    const defaultTheme = DatabaseStore.getDefaultThemeRecord();
    const slug = (body.slug || body.name.toLowerCase().replace(/[^a-z0-9]/g, "-")).trim();

    const created = await DatabaseStore.createTheme({
      name: body.name,
      slug,
      version: body.version || "1.0.0",
      thumbnail: body.thumbnail || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80",
      description: body.description || "Custom installed e-commerce theme",
      author: body.author || "Admin",
      isActive: Boolean(body.isActive),
      isSystem: false,
      zipFileName: body.zipFileName,
      config: body.config || defaultTheme.config,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
