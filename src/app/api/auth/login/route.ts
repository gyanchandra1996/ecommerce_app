import { NextRequest } from "next/server";
import { AuthService } from "@/modules/auth/services/auth.service";
import { apiError, apiSuccess } from "@/core/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, rememberMe, portal } = body;

    if (!email || !password) {
      return apiError("Email and password are required.", 400);
    }

    const { user, token } = await AuthService.login({
      email,
      password,
      rememberMe: Boolean(rememberMe),
    });

    // Enforce role separation for admin portal logins
    if (portal === "admin" && user.role === "CUSTOMER") {
      return apiError(
        "Access Denied: Customer accounts cannot access the Administrator Console. Please use the customer login.",
        403
      );
    }

    const targetPortal: "admin" | "customer" =
      portal === "admin" ? "admin" : "customer";
    await AuthService.setSessionCookie(token, targetPortal, Boolean(rememberMe));

    // If customer, merge any active guest cart
    const guestSessionId = req.cookies.get("guest_session_id")?.value;
    if (guestSessionId && user.id) {
      try {
        const { DatabaseStore } = await import("@/core/db/store");
        await DatabaseStore.mergeGuestCartIntoUserCart(guestSessionId, user.id);
      } catch {}
    }

    return apiSuccess({ user, portal: targetPortal }, "Login successful!", 200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Authentication failed.";
    return apiError(message, 401);
  }
}
