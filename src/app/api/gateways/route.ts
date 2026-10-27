import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly") === "true";
    const gateways = await DatabaseStore.findGateways(activeOnly);

    // If requested for storefront checkout (activeOnly=true), sanitize secret keys
    const sanitized = activeOnly
      ? gateways.map((gw) => {
          const publicCreds: Record<string, string> = {};
          if (gw.credentials) {
            // Include only safe public identifiers, NEVER secrets
            if (gw.credentials.keyId) publicCreds.keyId = gw.credentials.keyId;
            if (gw.credentials.publishableKey) publicCreds.publishableKey = gw.credentials.publishableKey;
            if (gw.credentials.clientId) publicCreds.clientId = gw.credentials.clientId;
            if (gw.credentials.merchantId) publicCreds.merchantId = gw.credentials.merchantId;
            if (gw.credentials.apiLoginId) publicCreds.apiLoginId = gw.credentials.apiLoginId;
            if (gw.credentials.instructions) publicCreds.instructions = gw.credentials.instructions;
          }
          return {
            ...gw,
            credentials: publicCreds,
          };
        })
      : gateways;

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
        { success: false, error: "Gateway name and code are required" },
        { status: 400 }
      );
    }

    const created = await DatabaseStore.createGateway({
      name: body.name,
      code: body.code.toLowerCase().trim(),
      cardTypes: Array.isArray(body.cardTypes) ? body.cardTypes : ["VISA", "Mastercard"],
      isDefault: Boolean(body.isDefault),
      isCreditCard: body.isCreditCard !== undefined ? Boolean(body.isCreditCard) : true,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      environment: body.environment || "sandbox",
      credentials: body.credentials || {},
      description: body.description || "",
      displayOrder: Number(body.displayOrder) || 1,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
