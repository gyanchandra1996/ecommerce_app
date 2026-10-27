import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const provider = await DatabaseStore.setDefaultShippingProvider(id);
    if (!provider) {
      return NextResponse.json({ success: false, error: "Shipping provider not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: `${provider.name} set as default shipping provider`,
      data: provider,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
