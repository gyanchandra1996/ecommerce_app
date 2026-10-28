import { NextRequest } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { apiError, apiSuccess } from "@/core/utils/api-response";
import { requireAdminAuth } from "@/core/auth/admin-guard";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdminAuth();
    if (!auth.authorized) {
      return auth.response!;
    }

    const { id } = await params;
    const customer = await DatabaseStore.findCustomerById(id);
    if (!customer) {
      return apiError("Customer not found.", 404);
    }
    return apiSuccess(customer);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load customer.";
    return apiError(message, 500);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdminAuth();
    if (!auth.authorized) {
      return auth.response!;
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await DatabaseStore.updateCustomer(id, body);
    if (!updated) {
      return apiError("Customer not found.", 404);
    }

    return apiSuccess(updated, "Customer updated successfully.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update customer.";
    return apiError(message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdminAuth();
    if (!auth.authorized) {
      return auth.response!;
    }

    const { id } = await params;
    const deleted = await DatabaseStore.deleteCustomer(id);
    if (!deleted) {
      return apiError("Customer not found.", 404);
    }

    return apiSuccess({ deleted: true }, "Customer account removed successfully.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete customer.";
    return apiError(message, 500);
  }
}
