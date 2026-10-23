import { AuthService } from "@/modules/auth/services/auth.service";
import { apiError, apiSuccess } from "@/core/utils/api-response";

export async function GET() {
  const user = await AuthService.getCurrentUser();
  if (!user) {
    return apiError("Unauthorized", 401);
  }
  return apiSuccess({ user });
}
