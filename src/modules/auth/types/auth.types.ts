import { PermissionSet } from "@/modules/roles/types/role.types";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "STAFF" | string;
  type?: "admin" | "customer" | "both";
  accountType?: "admin" | "customer" | "both" | "manager" | "staff";
  roleId?: string;
  avatar?: string | null;
  createdAt: string;
  permissions?: Record<string, PermissionSet>;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: "ADMIN" | "MANAGER" | "STAFF" | "CUSTOMER" | string;
  mobileNumber?: string;
  countryCode?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  streetAddress?: string;
  apartment?: string;
  accountType?: "admin" | "customer" | "both" | "manager" | "staff";
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: number;
}
