import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { requireAdminAuth } from "@/core/auth/admin-guard";

export async function GET(req: Request) {
  try {
    const auth = await requireAdminAuth();
    if (!auth.authorized) {
      return auth.response!;
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const templates = await DatabaseStore.findEmailTemplates(search);

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
