import { NextRequest } from "next/server";
import { AuthService } from "@/modules/auth/services/auth.service";
import { apiError, apiSuccess } from "@/core/utils/api-response";

export async function GET(req: NextRequest) {
  const portalParam = req.nextUrl.searchParams.get("portal");
  const portal = portalParam === "admin" || portalParam === "customer" ? portalParam : undefined;

  const user = await AuthService.getCurrentUser(portal);
  if (!user) {
    return apiError("Unauthorized", 401);
  }
  return apiSuccess({ user });
}
