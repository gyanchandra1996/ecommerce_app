import { NextRequest } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { AuthService } from "@/modules/auth/services/auth.service";
import { apiError, apiSuccess } from "@/core/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword, confirmPassword } = await req.json();

    if (!token) {
      return apiError("Reset token is missing or invalid.", 400);
    }
    if (!newPassword || newPassword.length < 6) {
      return apiError("New password must be at least 6 characters long.", 400);
    }
    if (newPassword !== confirmPassword) {
      return apiError("Passwords do not match.", 400);
    }

    const user = await DatabaseStore.findUserByResetToken(token);
    if (!user) {
      return apiError("Password reset token is invalid or has expired.", 400);
    }

    const hashedPassword = await AuthService.hashPassword(newPassword);

    await DatabaseStore.updateUser(user.id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });

    return apiSuccess(
      { success: true },
      "Your password has been successfully reset! You can now log in with your new password."
    );
  } catch (error: any) {
    return apiError(error.message || "Failed to reset password.", 500);
  }
}
