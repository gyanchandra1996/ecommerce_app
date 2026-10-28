import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { APP_CONFIG } from "@/core/config/env";

const secretKey = new TextEncoder().encode(APP_CONFIG.jwtSecret);

interface TokenPayload {
  isValid: boolean;
  role?: string;
  type?: string;
  id?: string;
}

async function verifyToken(token: string | undefined): Promise<TokenPayload> {
  if (!token) return { isValid: false };
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      isValid: true,
      role: payload.role ? String(payload.role) : undefined,
      type: payload.type ? String(payload.type) : undefined,
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

  const isAdminSession = (session: TokenPayload) =>
    session.isValid &&
    (session.type === "admin" ||
      session.role === "ADMIN" ||
      (session.role && session.role !== "CUSTOMER" && session.type !== "customer"));

  const isCustomerSession = (session: TokenPayload) =>
    session.isValid &&
    (session.type === "customer" || session.role === "CUSTOMER");

  const effectiveAdmin = isAdminSession(adminSession) || isAdminSession(legacySession);
  const effectiveCustomer = isCustomerSession(customerSession) || isCustomerSession(legacySession);

  // 1. Admin login route
  if (pathname === "/admin/login") {
    if (effectiveAdmin) {
      return NextResponse.redirect(new URL("/admin/assets", request.url));
    }
    return NextResponse.next();
  }

  // 2. Protected Admin API routes: require active admin authorization (type === 'admin')
  if (
    pathname.startsWith("/api/admin/") ||
    pathname.startsWith("/api/roles") ||
    pathname.startsWith("/api/customers")
  ) {
    if (!effectiveAdmin) {
      const status = adminSession.isValid || customerSession.isValid ? 403 : 401;
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: Administrator privileges required (type === 'admin').",
        },
        { status }
      );
    }
    return NextResponse.next();
  }

  // 3. Protected admin pages: require valid admin session
  if (pathname.startsWith("/admin")) {
    if (!effectiveAdmin) {
      const adminLoginUrl = new URL("/admin/login", request.url);
      adminLoginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(adminLoginUrl);
    }
  }

  // 4. Protected customer dashboard: require valid customer session
  if (pathname.startsWith("/customer")) {
    if (!effectiveCustomer) {
      const customerLoginUrl = new URL("/login", request.url);
      customerLoginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(customerLoginUrl);
    }
  }

  // 5. Customer login and register: redirect to customer dashboard only if customer session active
  if (pathname === "/login" || pathname === "/register") {
    if (effectiveCustomer) {
      return NextResponse.redirect(new URL("/customer/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/customer/:path*",
    "/login",
    "/register",
    "/api/admin/:path*",
    "/api/roles/:path*",
    "/api/customers/:path*",
  ],
};
