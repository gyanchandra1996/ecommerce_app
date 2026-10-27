import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { AuthService } from "@/modules/auth/services/auth.service";
import { validatePostalCode } from "@/core/utils/postal-autofill";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const authUser = await AuthService.getCurrentUser();

    let userId = searchParams.get("userId") || undefined;
    let customerEmail = searchParams.get("customerEmail") || undefined;
    const type = (searchParams.get("type") as "billing" | "shipping") || undefined;

    // If authenticated customer, enforce ownership (prevent accessing another customer's addresses)
    if (authUser && authUser.role !== "ADMIN") {
      userId = authUser.id;
      customerEmail = authUser.email;
    }

    const addresses = await DatabaseStore.findAddresses({ userId, customerEmail, type });

    // Format with both addressLine1/addressLine2 and streetAddress/apartment for convenience
    const formatted = addresses.map((addr) => ({
      ...addr,
      streetAddress: addr.addressLine1 || (addr as any).streetAddress || "",
      apartment: addr.addressLine2 || (addr as any).apartment || "",
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const authUser = await AuthService.getCurrentUser();

    const name = (body.name || "").trim();
    const addressLine1 = (body.addressLine1 || body.streetAddress || "").trim();
    const addressLine2 = (body.addressLine2 || body.apartment || "").trim();
    const country = (body.country || "India").trim();
    const state = (body.state || "").trim();
    const city = (body.city || "").trim();
    const postalCode = (body.postalCode || "").trim();
    const phone = (body.phone || body.mobileNumber || "").trim();
    const type = body.type === "shipping" ? "shipping" : "billing";
    const isDefault = Boolean(body.isDefault);

    // Validation
    if (!name) {
      return NextResponse.json({ success: false, error: "Full recipient name is required." }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ success: false, error: "Contact mobile number is required." }, { status: 400 });
    }
    if (!addressLine1) {
      return NextResponse.json({ success: false, error: "Street address is required." }, { status: 400 });
    }
    if (!city) {
      return NextResponse.json({ success: false, error: "City is required." }, { status: 400 });
    }
    if (!state) {
      return NextResponse.json({ success: false, error: "State/Province is required." }, { status: 400 });
    }
    if (!postalCode) {
      return NextResponse.json({ success: false, error: "Postal/PIN code is required." }, { status: 400 });
    }

    // Associate with authenticated customer
    const assignedUserId = authUser?.id || body.userId || undefined;
    const assignedEmail = authUser?.email || body.customerEmail || "";

    const created = await DatabaseStore.createAddress({
      userId: assignedUserId,
      customerEmail: assignedEmail,
      type,
      name,
      company: (body.company || "").trim(),
      addressLine1,
      addressLine2,
      country,
      state,
      city,
      postalCode,
      phone,
      isDefault,
      status: "Active",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Address saved successfully.",
        data: {
          ...created,
          streetAddress: created.addressLine1,
          apartment: created.addressLine2,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
