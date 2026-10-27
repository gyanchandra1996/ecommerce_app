import { NextResponse } from "next/server";
import { ShippingService } from "@/core/shipping/shipping.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const result = await ShippingService.testConnection(
      id,
      body.credentials,
      body.settings,
      body.apiBaseUrl
    );

    return NextResponse.json({
      success: result.success,
      message: result.message,
      details: result.details,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
