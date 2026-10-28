import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { requireAdminAuth } from "@/core/auth/admin-guard";
import { StorageService } from "@/core/storage/storage.service";

export async function GET() {
  try {
    const auth = await requireAdminAuth();
    if (!auth.authorized) {
      return auth.response!;
    }

    const settings = await DatabaseStore.getStorageSettings();
    return NextResponse.json({
      success: true,
      data: {
        ...settings,
        s3SecretAccessKey: StorageService.maskSecretKey(settings.s3SecretAccessKey),
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
    const updated = await DatabaseStore.saveStorageSettings({
      provider: body.provider === "s3" ? "s3" : "local",
      s3Enabled: Boolean(body.s3Enabled),
      s3Region: body.s3Region || "us-east-1",
      s3Bucket: body.s3Bucket || "",
      s3AccessKeyId: body.s3AccessKeyId || "",
      s3SecretAccessKey: body.s3SecretAccessKey,
      cloudfrontUrl: body.cloudfrontUrl || "",
    });

    return NextResponse.json({
      success: true,
      message: "Asset storage settings updated successfully.",
      data: {
        ...updated,
        s3SecretAccessKey: StorageService.maskSecretKey(updated.s3SecretAccessKey),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
