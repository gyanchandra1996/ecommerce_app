import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET() {
  try {
    const zones = await DatabaseStore.getShippingZones();
    return NextResponse.json({ success: true, data: zones });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, error: "Zone name is required." }, { status: 400 });
    }
    const created = await DatabaseStore.saveShippingZone(body);
    return NextResponse.json({ success: true, data: created, message: "Zone created successfully." }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
