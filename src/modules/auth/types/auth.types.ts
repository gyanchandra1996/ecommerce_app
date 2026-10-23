export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "STAFF";
  avatar?: string | null;
  createdAt: string;
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
  role?: "ADMIN" | "MANAGER" | "STAFF";
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: number;
}
