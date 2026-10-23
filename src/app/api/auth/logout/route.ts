import { AuthService } from "@/modules/auth/services/auth.service";
import { apiSuccess } from "@/core/utils/api-response";

export async function POST() {
  await AuthService.clearSessionCookie();
  return apiSuccess({ loggedOut: true }, "Logged out successfully.");
}
