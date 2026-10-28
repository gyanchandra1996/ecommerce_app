import { NextRequest } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { apiError, apiSuccess } from "@/core/utils/api-response";
import { requireAdminAuth } from "@/core/auth/admin-guard";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminAuth();
    if (!auth.authorized) {
      return auth.response!;
    }

    const view = req.nextUrl?.searchParams?.get("view") || new URL(req.url).searchParams.get("view");
    if (view === "employees") {
      const data = await DatabaseStore.findRoleEmployees();
      return apiSuccess(data);
    }

    const roles = await DatabaseStore.findRoles();
    return apiSuccess(roles);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load roles.";
    return apiError(message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminAuth();
    if (!auth.authorized) {
      return auth.response!;
    }

    const body = await req.json();
    const { name, description, status, screenPrivilegesCount, permissions } = body;

    if (!name || !name.trim()) {
      return apiError("Role name is required.", 400);
    }

    const created = await DatabaseStore.createRole({
      name: name.trim(),
      description: description?.trim(),
      status: status || "Active",
      screenPrivilegesCount: typeof screenPrivilegesCount === "number" ? screenPrivilegesCount : undefined,
      permissions: permissions || {},
    });

    return apiSuccess(created, "Role created successfully.", 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create role.";
    return apiError(message, 500);
  }
}
