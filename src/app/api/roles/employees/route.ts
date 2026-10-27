import { NextRequest } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { apiError, apiSuccess } from "@/core/utils/api-response";

export async function GET() {
  try {
    const data = await DatabaseStore.findRoleEmployees();
    return apiSuccess(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load employees for roles.";
    return apiError(message, 500);
  }
}
