import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const manufacturerId = searchParams.get("manufacturerId") || undefined;
    const warehouses = await DatabaseStore.findWarehouses(manufacturerId);
    return NextResponse.json({ success: true, data: warehouses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, error: "Warehouse name is required" }, { status: 400 });
    }

    const created = await DatabaseStore.createWarehouse({
      accountNumber: body.accountNumber || "WH-" + Math.floor(10 + Math.random() * 90),
      name: body.name,
      contactName: body.contactName || "",
      email: body.email || "",
      phone: body.phone || "",
      fax: body.fax || "",
      address: body.address || body.addressLine1 || "",
      addressLine1: body.addressLine1 || body.address || "",
      addressLine2: body.addressLine2 || "",
      city: body.city || "",
      state: body.state || "",
      country: body.country || "United States",
      zipCode: body.zipCode || "",
      shipstationWarehouse: body.shipstationWarehouse || "",
      sellbriteWarehouse: body.sellbriteWarehouse || "",
      isActive: body.isActive !== undefined ? body.isActive : true,
      manufacturerId: body.manufacturerId || undefined,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
