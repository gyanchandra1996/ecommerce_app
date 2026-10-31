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

    // Enforce role separation for admin and customer portal logins
    const isBoth =
      user.type === "both" ||
      user.accountType === "both" ||
      (user as any).customerType === "Both";

    if (portal === "admin") {
      const isAdmin =
        isBoth ||
        user.type === "admin" ||
        user.accountType === "admin" ||
        user.role === "ADMIN" ||
        (user.role !== "CUSTOMER" && user.type !== "customer");

      if (!isAdmin || (user.type === "customer" && !isBoth)) {
        return apiError(
          "Access Denied: Customer accounts cannot access the Administrator Console. Please use the customer login.",
          403
        );
      }
    } else {
      // Customer Portal Login (or public customer storefront)
      const isPureAdmin =
        !isBoth &&
        (user.type === "admin" || user.accountType === "admin" || user.role === "ADMIN") &&
        user.type !== "customer" &&
        user.role !== "CUSTOMER";

      if (isPureAdmin) {
        return apiError(
          "Access Denied: Administrator accounts cannot access the Customer Storefront. Please use the Administrator Console (/admin/login).",
          403
        );
      }
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

    return apiSuccess({ user, token, portal: targetPortal }, "Login successful!", 200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Authentication failed.";
    return apiError(message, 401);
  }
}
