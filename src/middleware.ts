import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { APP_CONFIG } from "@/core/config/env";

const secretKey = new TextEncoder().encode(APP_CONFIG.jwtSecret);

interface TokenPayload {
  isValid: boolean;
  role?: string;
  id?: string;
}

async function verifyToken(token: string | undefined): Promise<TokenPayload> {
  if (!token) return { isValid: false };
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      isValid: true,
      role: payload.role ? String(payload.role) : undefined,
      id: payload.sub ? String(payload.sub) : undefined,
    };
  } catch {
    return { isValid: false };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminCookie = request.cookies.get(APP_CONFIG.adminCookieName)?.value;
  const customerCookie = request.cookies.get(APP_CONFIG.customerCookieName)?.value;
  const legacyCookie = request.cookies.get(APP_CONFIG.cookieName)?.value;

  const adminSession = await verifyToken(adminCookie);
  const customerSession = await verifyToken(customerCookie);

  let legacySession: TokenPayload = { isValid: false };
  if (!adminSession.isValid && !customerSession.isValid && legacyCookie) {
    legacySession = await verifyToken(legacyCookie);
  }

  const effectiveAdmin =
    (adminSession.isValid && adminSession.role !== "CUSTOMER") ||
    (legacySession.isValid && legacySession.role !== "CUSTOMER");

  const effectiveCustomer =
    (customerSession.isValid && customerSession.role === "CUSTOMER") ||
    (legacySession.isValid && legacySession.role === "CUSTOMER");

  // 1. Admin login route
  if (pathname === "/admin/login") {
    if (effectiveAdmin) {
      return NextResponse.redirect(new URL("/admin/assets", request.url));
    }
    return NextResponse.next();
  }

  // 2. Protected admin pages: require valid admin session
  if (pathname.startsWith("/admin")) {
    if (!effectiveAdmin) {
      const adminLoginUrl = new URL("/admin/login", request.url);
      adminLoginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(adminLoginUrl);
    }
  }

  // 3. Protected customer dashboard: require valid customer session
  if (pathname.startsWith("/customer")) {
    if (!effectiveCustomer) {
      const customerLoginUrl = new URL("/login", request.url);
      customerLoginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(customerLoginUrl);
    }
  }

  // 4. Customer login and register: redirect to customer dashboard only if customer session active
  if (pathname === "/login" || pathname === "/register") {
    if (effectiveCustomer) {
      return NextResponse.redirect(new URL("/customer/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/customer/:path*", "/login", "/register"],
};
