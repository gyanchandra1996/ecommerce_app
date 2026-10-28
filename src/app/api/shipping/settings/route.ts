import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { requireAdminAuth } from "@/core/auth/admin-guard";

export async function GET() {
  try {
    const settings = await DatabaseStore.getShippingSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await requireAdminAuth();
    if (!auth.authorized) {
      return auth.response!;
    }

    const body = await req.json();
    const updated = await DatabaseStore.updateShippingSettings(body);
    return NextResponse.json({ success: true, data: updated, message: "Shipping settings updated successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  return PUT(req);
}
