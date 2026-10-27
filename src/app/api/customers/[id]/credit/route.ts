import { NextRequest } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { apiError, apiSuccess } from "@/core/utils/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { amount } = body;

    if (amount === undefined || isNaN(Number(amount))) {
      return apiError("Valid credit amount is required.", 400);
    }

    const updated = await DatabaseStore.adjustCustomerCredit(id, Number(amount));
    if (!updated) {
      return apiError("Customer not found.", 404);
    }

    return apiSuccess(
      updated,
      `Customer store credit adjusted. New balance: $${updated.credit?.toFixed(2)}`
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Credit update failed.";
    return apiError(message, 500);
  }
}
