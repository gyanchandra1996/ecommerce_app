import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/core/auth/admin-guard";
import { EmailService } from "@/core/mail/email.service";
import { DatabaseStore } from "@/core/db/store";

export async function POST(req: Request) {
  try {
    const auth = await requireAdminAuth();
    if (!auth.authorized) {
      return auth.response!;
    }

    const body = await req.json();

    // If password is blank or masked, fallback to saved password
    let password = body.password;
    if (!password || password.includes("••••")) {
      const existing = await DatabaseStore.getMailConfiguration();
      password = existing.password;
    }

    const testResult = await EmailService.testConnection({
      isEnabled: true,
      defaultFromName: body.defaultFromName || "Store Admin",
      defaultFromEmail: body.defaultFromEmail || "admin@example.com",
      transportMethod: body.transportMethod || "SMTP",
      server: body.server || "localhost",
      port: Number(body.port) || 587,
      secureSocketType: body.secureSocketType || "TLS",
      authType: body.authType || "LOGIN",
      username: body.username || "",
      password: password,
      contactUsEmail: body.contactUsEmail || "",
      ccMailOption: false,
      ccEmailAddresses: [],
    });

    if (!testResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: testResult.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: testResult.message,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to test mail connection" },
      { status: 500 }
    );
  }
}
