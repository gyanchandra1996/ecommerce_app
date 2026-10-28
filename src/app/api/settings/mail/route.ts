import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { requireAdminAuth } from "@/core/auth/admin-guard";
import { EmailService } from "@/core/mail/email.service";

export async function GET() {
  try {
    const auth = await requireAdminAuth();
    if (!auth.authorized) {
      return auth.response!;
    }

    const config = await DatabaseStore.getMailConfiguration();
    return NextResponse.json({
      success: true,
      data: {
        ...config,
        password: EmailService.maskPassword(config.password || undefined),
      },
    });
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
    const updated = await DatabaseStore.saveMailConfiguration({
      isEnabled: Boolean(body.isEnabled),
      defaultFromName: body.defaultFromName || "Store Admin",
      defaultFromEmail: body.defaultFromEmail || "admin@example.com",
      defaultReplyName: body.defaultReplyName || "",
      defaultReplyTo: body.defaultReplyTo || "",
      transportMethod: body.transportMethod || "SMTP",
      server: body.server || "smtp.gmail.com",
      port: Number(body.port) || 587,
      secureSocketType: body.secureSocketType || "TLS",
      authType: body.authType || "LOGIN",
      username: body.username || "",
      password: body.password,
      contactUsEmail: body.contactUsEmail || "",
      ccMailOption: Boolean(body.ccMailOption),
      ccEmailAddresses: Array.isArray(body.ccEmailAddresses)
        ? body.ccEmailAddresses
        : typeof body.ccEmailAddresses === "string"
        ? body.ccEmailAddresses.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [],
    });

    return NextResponse.json({
      success: true,
      message: "Mail configuration updated successfully.",
      data: {
        ...updated,
        password: EmailService.maskPassword(updated.password || undefined),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
