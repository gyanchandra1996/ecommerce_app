import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gateway = await DatabaseStore.setDefaultGateway(id);
    if (!gateway) {
      return NextResponse.json({ success: false, error: "Payment gateway not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: gateway, message: `${gateway.name} is now the default payment method` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
