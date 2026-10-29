import { NextRequest, NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { AuthService } from "@/modules/auth/services/auth.service";

export async function GET() {
  try {
    const authUser = await AuthService.getCurrentUser("admin");
    const settings = await DatabaseStore.getSocialAuthSettings();

    // If an admin requests it, return full settings including secrets
    if (authUser && (authUser.role === "ADMIN" || authUser.type === "admin" || authUser.type === "both")) {
      return NextResponse.json({
        success: true,
        data: settings,
        context: "auth_oauth",
      });
    }

    // Public / Storefront safe view (no secrets exposed)
    return NextResponse.json({
      success: true,
      data: {
        google: {
          enabled: Boolean(settings.google?.enabled),
          clientId: settings.google?.clientId || "",
        },
        github: {
          enabled: Boolean(settings.github?.enabled),
          clientId: settings.github?.clientId || "",
        },
        facebook: {
          enabled: Boolean(settings.facebook?.enabled),
          clientId: settings.facebook?.clientId || "",
        },
      },
      context: "auth_oauth",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch OAuth settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await AuthService.getCurrentUser("admin");
    if (!authUser || (authUser.role !== "ADMIN" && authUser.type !== "admin" && authUser.type !== "both")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Administrator rights required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = await DatabaseStore.saveSocialAuthSettings(body);

    return NextResponse.json({
      success: true,
      message: "OAuth settings updated successfully in Setting table (context: auth_oauth).",
      data: updated,
      context: "auth_oauth",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update OAuth settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
