import { NextRequest, NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { AuthService } from "@/modules/auth/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const customer = await AuthService.getCurrentCustomerUser();
    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Must be logged in to merge cart." },
        { status: 401 }
      );
    }

    const guestSessionId = req.cookies.get("guest_session_id")?.value;
    if (!guestSessionId) {
      const existing = await DatabaseStore.getOrCreateCart(customer.id);
      return NextResponse.json({ success: true, data: existing });
    }

    const merged = await DatabaseStore.mergeGuestCartIntoUserCart(guestSessionId, customer.id);

    const res = NextResponse.json({
      success: true,
      message: "Guest cart merged successfully into customer account.",
      data: merged,
    });

    res.cookies.delete("guest_session_id");
    return res;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
