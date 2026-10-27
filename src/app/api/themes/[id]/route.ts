import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const theme = await DatabaseStore.findThemeById(id);
    if (!theme) {
      return NextResponse.json({ success: false, error: "Theme not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: theme });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await DatabaseStore.updateThemeConfig(id, body.config || body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Theme not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated, message: "Theme configuration updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(req, { params });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await DatabaseStore.deleteTheme(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Cannot delete active or system protected theme" },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, message: "Theme deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
