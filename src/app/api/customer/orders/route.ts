import { NextResponse } from "next/server";
import { AuthService } from "@/modules/auth/services/auth.service";
import { DatabaseStore } from "@/core/db/store";
import { apiError, apiSuccess } from "@/core/utils/api-response";

export async function GET() {
  try {
    const authUser = await AuthService.getCurrentUser();
    if (!authUser) {
      return apiError("Unauthorized", 401);
    }

    const allOrders = await DatabaseStore.findOrders();
    const customerOrders = allOrders.filter(
      (o) =>
        (o.customerEmail && o.customerEmail.toLowerCase() === authUser.email.toLowerCase()) ||
        o.customerName.toLowerCase() === authUser.name.toLowerCase()
    );

    return apiSuccess(customerOrders, "Customer orders retrieved.");
  } catch (error: any) {
    return apiError(error.message || "Failed to retrieve orders.", 500);
  }
}
