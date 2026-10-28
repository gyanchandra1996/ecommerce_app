import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { APP_CONFIG } from "@/core/config/env";
import { DatabaseStore, UserRecord } from "@/core/db/store";
import { AuthUser, LoginCredentials, RegisterCredentials } from "../types/auth.types";

const secretKey = new TextEncoder().encode(APP_CONFIG.jwtSecret);

export class AuthService {
  public static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  public static async verifyPassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  public static async createToken(user: AuthUser, expiresIn = "7d"): Promise<string> {
    const expirationSeconds = expiresIn === "7d" ? 7 * 24 * 60 * 60 : 24 * 60 * 60;
    const type = user.type || (user.role === "ADMIN" ? "admin" : "customer");
    return new SignJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      type,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + expirationSeconds)
      .sign(secretKey);
  }

  public static async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      if (!payload.sub) return null;
      const role = (payload.role as "ADMIN" | "MANAGER" | "STAFF" | "CUSTOMER") || "CUSTOMER";
      const type = (payload.type as "admin" | "customer") || (role === "ADMIN" ? "admin" : "customer");
      return {
        id: payload.sub as string,
        email: (payload.email as string) || "",
        name: (payload.name as string) || "",
        role,
        type,
        createdAt: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  public static mapToAuthUser(record: UserRecord): AuthUser {
    const isAdmin =
      record.type === "admin" ||
      record.accountType === "admin" ||
      record.role === "ADMIN" ||
      (record.role !== "CUSTOMER" && record.accountType !== "customer");
    return {
      id: record.id,
      name: record.name,
      email: record.email,
      role: record.role || (isAdmin ? "ADMIN" : "CUSTOMER"),
      type: isAdmin ? "admin" : "customer",
      accountType: record.accountType || (isAdmin ? "admin" : "customer"),
      avatar: record.avatar,
      createdAt: record.createdAt,
    };
  }

  public static async register(credentials: RegisterCredentials): Promise<{ user: AuthUser; token: string }> {
    const email = credentials.email.trim().toLowerCase();
    const existing = await DatabaseStore.findUserByEmail(email);
    if (existing) {
      throw new Error("An account with this email address already exists.");
    }

    if (credentials.password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    if (credentials.confirmPassword && credentials.password !== credentials.confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    const hashedPassword = await this.hashPassword(credentials.password);

    // Strict security: Public registration is strictly customer only!
    // Cannot be escalated via client request or body parameters.
    const created = await DatabaseStore.createUser({
      name: credentials.name.trim(),
      email,
      password: hashedPassword,
      role: "CUSTOMER",
      accountType: "customer",
      mobileNumber: credentials.mobileNumber,
      countryCode: credentials.countryCode,
      phone: credentials.phone || credentials.mobileNumber,
      country: credentials.country,
      state: credentials.state,
      city: credentials.city,
      postalCode: credentials.postalCode,
      streetAddress: credentials.streetAddress,
      apartment: credentials.apartment,
    });

    const user = this.mapToAuthUser(created);
    const token = await this.createToken(user);
    return { user, token };
  }

  public static async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    const email = credentials.email.trim().toLowerCase();
    const userRecord = await DatabaseStore.findUserByEmail(email);

    if (!userRecord || !userRecord.password) {
      throw new Error("Invalid email or password.");
    }

    const isValid = await this.verifyPassword(credentials.password, userRecord.password);
    if (!isValid) {
      throw new Error("Invalid email or password.");
    }

    const user = this.mapToAuthUser(userRecord);
    const token = await this.createToken(user, credentials.rememberMe ? "7d" : "1d");
    return { user, token };
  }

  public static async getCurrentUser(portal?: "admin" | "customer"): Promise<AuthUser | null> {
    try {
      const cookieStore = await cookies();
      let token: string | undefined;

      if (portal === "admin") {
        token = cookieStore.get(APP_CONFIG.adminCookieName)?.value;
        if (!token) {
          // Check legacy cookie only if it holds an admin
          const leg = cookieStore.get(APP_CONFIG.cookieName)?.value;
          if (leg) {
            const v = await this.verifyToken(leg);
            if (v && v.role !== "CUSTOMER" && v.type === "admin") {
              token = leg;
            }
          }
        }
      } else if (portal === "customer") {
        token = cookieStore.get(APP_CONFIG.customerCookieName)?.value;
        if (!token) {
          // Check legacy cookie only if it holds a customer
          const leg = cookieStore.get(APP_CONFIG.cookieName)?.value;
          if (leg) {
            const v = await this.verifyToken(leg);
            if (v && v.role === "CUSTOMER") {
              token = leg;
            }
          }
        }
      } else {
        token =
          cookieStore.get(APP_CONFIG.customerCookieName)?.value ||
          cookieStore.get(APP_CONFIG.adminCookieName)?.value ||
          cookieStore.get(APP_CONFIG.cookieName)?.value;
      }

      if (!token) return null;

      const verified = await this.verifyToken(token);
      if (!verified) return null;

      const record = await DatabaseStore.findUserById(verified.id);
      if (!record) return null;

      const isDbAdmin =
        record.type === "admin" ||
        record.accountType === "admin" ||
        record.role === "ADMIN" ||
        (record.role !== "CUSTOMER" && record.accountType !== "customer");

      if (portal === "admin" && (!isDbAdmin || record.role === "CUSTOMER")) {
        return null;
      }

      const permissions = await DatabaseStore.getUserPermissions(record.id);
      return {
        ...this.mapToAuthUser(record),
        roleId: (record as unknown as { roleId?: string }).roleId,
        permissions,
      };
    } catch {
      return null;
    }
  }

  public static async getCurrentAdminUser(): Promise<AuthUser | null> {
    return this.getCurrentUser("admin");
  }

  public static async getCurrentCustomerUser(): Promise<AuthUser | null> {
    return this.getCurrentUser("customer");
  }

  public static async setSessionCookie(
    token: string,
    portalOrRememberMe: "admin" | "customer" | boolean = "customer",
    rememberMe = true
  ): Promise<void> {
    const cookieStore = await cookies();
    let portal: "admin" | "customer" = "customer";
    let isRemember = true;

    if (typeof portalOrRememberMe === "boolean") {
      isRemember = portalOrRememberMe;
    } else if (typeof portalOrRememberMe === "string") {
      portal = portalOrRememberMe;
      isRemember = rememberMe;
    }

    const maxAge = isRemember ? 7 * 24 * 60 * 60 : 24 * 60 * 60;
    const cookieName =
      portal === "admin" ? APP_CONFIG.adminCookieName : APP_CONFIG.customerCookieName;

    // Set isolated portal cookie
    cookieStore.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    // Handle legacy auth_token without overwriting other active portal sessions
    const legacyToken = cookieStore.get(APP_CONFIG.cookieName)?.value;
    if (!legacyToken) {
      cookieStore.set(APP_CONFIG.cookieName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge,
      });
    } else {
      const verified = await this.verifyToken(legacyToken);
      const isLegacyAdmin = verified && (verified.role !== "CUSTOMER" && verified.type === "admin");
      if (portal === "admin" && (isLegacyAdmin || !verified)) {
        cookieStore.set(APP_CONFIG.cookieName, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge,
        });
      }
      if (portal === "customer" && (!isLegacyAdmin || !verified)) {
        cookieStore.set(APP_CONFIG.cookieName, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge,
        });
      }
    }
  }

  public static async clearSessionCookie(portal?: "admin" | "customer" | "all"): Promise<void> {
    const cookieStore = await cookies();
    if (portal === "admin") {
      cookieStore.delete(APP_CONFIG.adminCookieName);
      cookieStore.delete("admin_token");
      const legacyToken = cookieStore.get(APP_CONFIG.cookieName)?.value;
      if (legacyToken) {
        const verified = await this.verifyToken(legacyToken);
        if (verified && (verified.role !== "CUSTOMER" || verified.type === "admin")) {
          cookieStore.delete(APP_CONFIG.cookieName);
        }
      }
    } else if (portal === "customer") {
      cookieStore.delete(APP_CONFIG.customerCookieName);
      cookieStore.delete("customer_token");
      const legacyToken = cookieStore.get(APP_CONFIG.cookieName)?.value;
      if (legacyToken) {
        const verified = await this.verifyToken(legacyToken);
        if (verified && (verified.role === "CUSTOMER" || verified.type === "customer")) {
          cookieStore.delete(APP_CONFIG.cookieName);
        }
      }
    } else {
      cookieStore.delete(APP_CONFIG.adminCookieName);
      cookieStore.delete(APP_CONFIG.customerCookieName);
      cookieStore.delete(APP_CONFIG.cookieName);
      cookieStore.delete("admin_token");
      cookieStore.delete("customer_token");
    }
  }
}
