import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activated = await DatabaseStore.activateTheme(id);
    if (!activated) {
      return NextResponse.json({ success: false, error: "Theme not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: activated,
      message: `Theme "${activated.name}" activated successfully! Presentation layer updated.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
