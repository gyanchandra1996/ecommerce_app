import { NextRequest } from "next/server";
import crypto from "crypto";
import { DatabaseStore } from "@/core/db/store";
import { apiError, apiSuccess } from "@/core/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.trim()) {
      return apiError("Please provide an email address.", 400);
    }

    const user = await DatabaseStore.findUserByEmail(email.trim().toLowerCase());
    if (!user) {
      // Security best practice: don't reveal if user does not exist
      return apiSuccess(
        { sent: true },
        "If an account exists with this email, instructions have been sent."
      );
    }

    // Generate secure token valid for 1 hour
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await DatabaseStore.updateUser(user.id, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });

    const resetUrl = `/reset-password?token=${token}`;

    return apiSuccess(
      {
        sent: true,
        resetToken: token,
        resetUrl,
      },
      "Password reset link generated successfully."
    );
  } catch (error: any) {
    return apiError(error.message || "Failed to process forgot password request.", 500);
  }
}
