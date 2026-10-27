import { NextRequest } from "next/server";
import { AuthService } from "@/modules/auth/services/auth.service";
import { apiSuccess } from "@/core/utils/api-response";

export async function POST(req: NextRequest) {
  let portal: "admin" | "customer" | undefined;
  const searchPortal = req.nextUrl.searchParams.get("portal");
  if (searchPortal === "admin" || searchPortal === "customer") {
    portal = searchPortal;
  } else {
    try {
      const body = await req.json();
      if (body.portal === "admin" || body.portal === "customer") {
        portal = body.portal;
      }
    } catch {}
  }

  await AuthService.clearSessionCookie(portal);
  return apiSuccess({ loggedOut: true, portal: portal || "all" }, "Logged out successfully.");
}
