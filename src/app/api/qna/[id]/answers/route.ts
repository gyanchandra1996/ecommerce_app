import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (!body.answer || !body.answer.trim()) {
      return NextResponse.json({ success: false, error: "Answer text is required" }, { status: 400 });
    }

    const updated = await DatabaseStore.addQnaAnswer(id, {
      userName: body.userName || "emox Official Team",
      userEmail: body.userEmail || "support@emox.ae",
      answer: body.answer.trim(),
      isOfficial: body.isOfficial !== undefined ? Boolean(body.isOfficial) : true,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
