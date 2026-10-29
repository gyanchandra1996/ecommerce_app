import { NextRequest, NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { AuthService } from "@/modules/auth/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    // 1. Verify that Google Login is enabled in Settings (context = auth_oauth)
    const oauthSettings = await DatabaseStore.getSocialAuthSettings();
    if (!oauthSettings.google?.enabled) {
      return NextResponse.json(
        {
          success: false,
          error: "Google Sign-In is currently disabled by administrator in Settings table (context: auth_oauth).",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const name = (body.name || "").trim() || (email ? email.split("@")[0] : "Google User");
    const googleId = body.googleId || body.sub || `g_${Date.now()}`;
    const avatar = body.avatar || body.picture || "";

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Valid email address required from Google account." },
        { status: 400 }
      );
    }

    // 2. Check if user already exists
    let user = await DatabaseStore.findUserByEmail(email);

    if (!user) {
      // Auto-register customer with Google profile
      user = await DatabaseStore.createUser({
        email,
        name,
        password: `OAuthGoogle_${Math.random().toString(36).substring(2)}_${Date.now()}`,
        role: "CUSTOMER",
        type: "customer",
        accountType: "customer",
      });
    }

    // 3. Issue JWT Token & Set session cookie for customer storefront
    const authUser = (AuthService as any).mapToAuthUser(user);
    const token = await AuthService.createToken(authUser, "7d");
    await AuthService.setSessionCookie(token, "customer", true);

    return NextResponse.json({
      success: true,
      message: "Successfully signed in with Google.",
      data: {
        user: authUser,
        token,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process Google login." },
      { status: 500 }
    );
  }
}
