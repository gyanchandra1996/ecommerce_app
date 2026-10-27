import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { encryptCredentials, maskSensitiveCredentials, decryptCredentials } from "@/core/shipping/encryption";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const provider = await DatabaseStore.findShippingProviderById(id);
    if (!provider) {
      return NextResponse.json({ success: false, error: "Shipping provider not found" }, { status: 404 });
    }

    const rawCreds = decryptCredentials(provider.credentials);
    return NextResponse.json({
      success: true,
      data: {
        ...provider,
        credentials: maskSensitiveCredentials(rawCreds),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await DatabaseStore.findShippingProviderById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Shipping provider not found" }, { status: 404 });
    }

    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.apiBaseUrl !== undefined) updates.apiBaseUrl = body.apiBaseUrl.trim();
    if (body.pickupLocation !== undefined) updates.pickupLocation = body.pickupLocation.trim();
    if (body.settings !== undefined) updates.settings = body.settings;
    if (body.isEnabled !== undefined) updates.isEnabled = Boolean(body.isEnabled);
    if (body.isDefault !== undefined) updates.isDefault = Boolean(body.isDefault);

    // If new credentials provided, merge and re-encrypt
    if (body.credentials && typeof body.credentials === "object") {
      const existingRaw = decryptCredentials(existing.credentials);
      const mergedCreds = { ...existingRaw };
      for (const [k, v] of Object.entries(body.credentials)) {
        // If placeholder '••••••••' or empty string was sent, keep existing secret
        if (typeof v === "string" && (v.includes("••••") || v.trim() === "")) {
          continue;
        }
        mergedCreds[k] = v;
      }
      updates.credentials = encryptCredentials(mergedCreds);
    }

    const updated = await DatabaseStore.updateShippingProvider(id, updates);
    return NextResponse.json({
      success: true,
      data: updated
        ? {
            ...updated,
            credentials: maskSensitiveCredentials(decryptCredentials(updated.credentials)),
          }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(req, { params });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await DatabaseStore.deleteShippingProvider(id);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      message: result.message || "Shipping provider deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
