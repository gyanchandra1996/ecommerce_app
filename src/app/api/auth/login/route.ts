import { NextRequest } from "next/server";
import { AuthService } from "@/modules/auth/services/auth.service";
import { apiError, apiSuccess } from "@/core/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return apiError("Email and password are required.", 400);
    }

    const { user, token } = await AuthService.login({
      email,
      password,
      rememberMe: Boolean(rememberMe),
    });

    await AuthService.setSessionCookie(token, Boolean(rememberMe));

    return apiSuccess({ user }, "Login successful!", 200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Authentication failed.";
    return apiError(message, 401);
  }
}
