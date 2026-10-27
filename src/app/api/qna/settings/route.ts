import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET() {
  try {
    const autoApprove = await DatabaseStore.getQnaAutoApprove();
    return NextResponse.json({ success: true, autoApprove });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updated = await DatabaseStore.setQnaAutoApprove(Boolean(body.autoApprove));
    return NextResponse.json({ success: true, autoApprove: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
