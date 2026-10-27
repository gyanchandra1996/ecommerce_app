import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const manufacturers = await DatabaseStore.findManufacturers(search);
    return NextResponse.json({ success: true, data: manufacturers });
  } catch (error: any) {
    console.error("Error fetching manufacturers:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch manufacturers" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: "Name and Email are required" },
        { status: 400 }
      );
    }

    const created = await DatabaseStore.createManufacturer({
      accountNumber: body.accountNumber || "ac" + Math.floor(1000 + Math.random() * 9000),
      name: body.name,
      contactName: body.contactName || body.name,
      email: body.email,
      phone: body.phone || "",
      fax: body.fax || "",
      website: body.website || "",
      addressLine1: body.addressLine1 || "",
      addressLine2: body.addressLine2 || "",
      country: body.country || "United States",
      state: body.state || "",
      city: body.city || "",
      zipCode: body.zipCode || "",
      isActive: body.isActive !== undefined ? body.isActive : true,
      showAdvanced: body.showAdvanced || false,
      advancedOptions: body.advancedOptions || {},
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating manufacturer:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create manufacturer" },
      { status: 500 }
    );
  }
}
