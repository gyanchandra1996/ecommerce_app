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
    return new SignJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
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
      return {
        id: payload.sub as string,
        email: (payload.email as string) || "",
        name: (payload.name as string) || "",
        role: (payload.role as "ADMIN" | "MANAGER" | "STAFF") || "ADMIN",
        createdAt: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  public static mapToAuthUser(record: UserRecord): AuthUser {
    return {
      id: record.id,
      name: record.name,
      email: record.email,
      role: record.role,
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
    const created = await DatabaseStore.createUser({
      name: credentials.name.trim(),
      email,
      password: hashedPassword,
      role: credentials.role || "ADMIN",
    });

    const user = this.mapToAuthUser(created);
    const token = await this.createToken(user);
    return { user, token };
  }

  public static async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    const email = credentials.email.trim().toLowerCase();
    const userRecord = await DatabaseStore.findUserByEmail(email);

    if (!userRecord) {
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

  public static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(APP_CONFIG.cookieName)?.value;
      if (!token) return null;

      const verified = await this.verifyToken(token);
      if (!verified) return null;

      const record = await DatabaseStore.findUserById(verified.id);
      if (!record) return null;

      return this.mapToAuthUser(record);
    } catch {
      return null;
    }
  }

  public static async setSessionCookie(token: string, rememberMe = true): Promise<void> {
    const cookieStore = await cookies();
    const maxAge = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60;
    cookieStore.set(APP_CONFIG.cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });
  }

  public static async clearSessionCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(APP_CONFIG.cookieName);
  }
}
