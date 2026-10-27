import { NextRequest } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { apiError, apiSuccess } from "@/core/utils/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const role = await DatabaseStore.findRoleById(id);
    if (!role) {
      return apiError("Role not found.", 404);
    }
    return apiSuccess(role);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load role.";
    return apiError(message, 500);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await DatabaseStore.updateRole(id, body);
    if (!updated) {
      return apiError("Role not found.", 404);
    }

    return apiSuccess(updated, "Role updated successfully.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update role.";
    return apiError(message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await DatabaseStore.deleteRole(id);
    if (!deleted) {
      return apiError("System roles cannot be deleted or role not found.", 400);
    }

    return apiSuccess({ deleted: true }, "Role removed successfully.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete role.";
    return apiError(message, 500);
  }
}
