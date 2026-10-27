import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const provider = await DatabaseStore.findShippingProviderById(id);
    if (!provider) {
      return NextResponse.json({ success: false, error: "Shipping provider not found" }, { status: 404 });
    }

    const newStatus = body.isEnabled !== undefined ? Boolean(body.isEnabled) : !provider.isEnabled;
    const updated = await DatabaseStore.updateShippingProvider(id, { isEnabled: newStatus });

    return NextResponse.json({
      success: true,
      message: `${provider.name} is now ${newStatus ? "Enabled" : "Disabled"}`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
