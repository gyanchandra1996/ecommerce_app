import { NextRequest } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { apiError, apiSuccess } from "@/core/utils/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const employee = await DatabaseStore.findRoleEmployeeById(id);
    if (!employee) {
      return apiError("Employee not found.", 404);
    }
    return apiSuccess(employee);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load employee.";
    return apiError(message, 500);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { assignedRoles } = body;

    if (!Array.isArray(assignedRoles)) {
      return apiError("assignedRoles must be an array of role names.", 400);
    }

    const updated = await DatabaseStore.updateEmployeeRoles(id, assignedRoles);
    if (!updated) {
      return apiError("Employee not found.", 404);
    }

    return apiSuccess(updated, "Employee roles updated successfully.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update employee roles.";
    return apiError(message, 500);
  }
}
