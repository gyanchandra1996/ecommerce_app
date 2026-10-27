import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { encryptCredentials, maskSensitiveCredentials, decryptCredentials } from "@/core/shipping/encryption";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly") === "true";
    const providers = await DatabaseStore.findShippingProviders(activeOnly);

    // Sanitize credentials for frontend display
    const sanitized = providers.map((p) => {
      const rawCreds = decryptCredentials(p.credentials);
      return {
        ...p,
        credentials: maskSensitiveCredentials(rawCreds),
        rawConfigured: Boolean(rawCreds && Object.keys(rawCreds).length > 0),
      };
    });

    return NextResponse.json({ success: true, data: sanitized });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.code) {
      return NextResponse.json(
        { success: false, error: "Provider Name and Provider Code are required." },
        { status: 400 }
      );
    }

    const cleanCode = body.code.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");

    // Check for duplicate code
    const existing = await DatabaseStore.findShippingProviderByCode(cleanCode);
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Shipping provider with code '${cleanCode}' already exists.` },
        { status: 400 }
      );
    }

    // Encrypt sensitive credentials before saving at rest
    const encryptedCreds = encryptCredentials(body.credentials || {});

    const created = await DatabaseStore.createShippingProvider({
      name: body.name.trim(),
      code: cleanCode,
      apiBaseUrl: body.apiBaseUrl?.trim() || "https://api.example.com/v1",
      credentials: encryptedCreds,
      settings: body.settings || {},
      isEnabled: body.isEnabled !== undefined ? Boolean(body.isEnabled) : true,
      isDefault: Boolean(body.isDefault),
      pickupLocation: body.pickupLocation || body.settings?.pickupLocation || "Main Hub",
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...created,
          credentials: maskSensitiveCredentials(body.credentials || {}),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
