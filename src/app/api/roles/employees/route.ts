import { NextRequest } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { apiError, apiSuccess } from "@/core/utils/api-response";
import { requireAdminAuth } from "@/core/auth/admin-guard";

export async function GET() {
  try {
    const auth = await requireAdminAuth();
    if (!auth.authorized) {
      return auth.response!;
    }

    const data = await DatabaseStore.findRoleEmployees();
    return apiSuccess(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load employees for roles.";
    return apiError(message, 500);
  }
}
