import { NextResponse } from "next/server";
import { AuthService } from "@/modules/auth/services/auth.service";
import { DatabaseStore } from "@/core/db/store";
import { AuthUser } from "@/modules/auth/types/auth.types";

export interface AdminAuthResult {
  authorized: boolean;
  user?: AuthUser;
  response?: NextResponse;
}

/**
 * Server-side Guard to verify administrator privileges.
 * Verifies JWT token and cross-validates against database store
 * to ensure user is active and has type === 'admin' or role === 'ADMIN'.
 */
export async function requireAdminAuth(): Promise<AdminAuthResult> {
  const adminUser = await AuthService.getCurrentAdminUser();
  if (!adminUser) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Administrator authentication required.",
        },
        { status: 401 }
      ),
    };
  }

  // Cross-verify with database store
  const dbUser = await DatabaseStore.findUserById(adminUser.id);
  if (!dbUser) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Forbidden: Administrator account does not exist.",
        },
        { status: 403 }
      ),
    };
  }

  const isBoth =
    dbUser.type === "both" ||
    dbUser.accountType === "both" ||
    dbUser.customerType === "Both";

  const isAdmin =
    isBoth ||
    dbUser.type === "admin" ||
    dbUser.accountType === "admin" ||
    dbUser.role === "ADMIN" ||
    (dbUser.role !== "CUSTOMER" && dbUser.type !== "customer");

  if (!isAdmin || (dbUser.role === "CUSTOMER" && !isBoth)) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Forbidden: Administrator privileges required (type === 'admin').",
        },
        { status: 403 }
      ),
    };
  }

  if (dbUser.status === "INACTIVE") {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Forbidden: Account has been suspended or deactivated.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: adminUser,
  };
}
