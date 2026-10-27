import { NextResponse } from "next/server";
import { ShippingService } from "@/core/shipping/shipping.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { providerId, code, credentials, settings, apiBaseUrl } = body;

    const identifier = providerId || code;
    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Provider ID or Provider Code is required for test connection." },
        { status: 400 }
      );
    }

    const result = await ShippingService.testConnection(
      identifier,
      credentials,
      settings,
      apiBaseUrl
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
