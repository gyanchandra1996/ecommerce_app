import { NextRequest } from "next/server";
import { AuthService } from "@/modules/auth/services/auth.service";
import { apiError, apiSuccess } from "@/core/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, confirmPassword, role } = body;

    if (!name || !email || !password) {
      return apiError("Name, email, and password are required.", 400);
    }

    const { user, token } = await AuthService.register({
      name,
      email,
      password,
      confirmPassword,
      role: role || "ADMIN",
    });

    await AuthService.setSessionCookie(token, true);

    return apiSuccess({ user }, "Registration successful!", 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to register user.";
    return apiError(message, 400);
  }
}
