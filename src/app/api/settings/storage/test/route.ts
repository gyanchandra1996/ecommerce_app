import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/core/auth/admin-guard";
import { StorageService } from "@/core/storage/storage.service";
import { DatabaseStore } from "@/core/db/store";

export async function POST(req: Request) {
  try {
    const auth = await requireAdminAuth();
    if (!auth.authorized) {
      return auth.response!;
    }

    const body = await req.json();

    // If secret key is masked (••••••••) or empty, fetch existing stored secret
    let secretKey = body.s3SecretAccessKey;
    if (!secretKey || secretKey.includes("••••")) {
      const existing = await DatabaseStore.getStorageSettings();
      secretKey = existing.s3SecretAccessKey;
    }

    const testResult = await StorageService.testS3Connection({
      provider: "s3",
      s3Enabled: true,
      s3Region: body.s3Region || "us-east-1",
      s3Bucket: body.s3Bucket,
      s3AccessKeyId: body.s3AccessKeyId,
      s3SecretAccessKey: secretKey,
      cloudfrontUrl: body.cloudfrontUrl,
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
      { success: false, error: error.message || "Failed to test S3 connection" },
      { status: 500 }
    );
  }
}
