import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const productId = searchParams.get("productId") || undefined;

    const qna = await DatabaseStore.findQna({ search, status, productId });
    return NextResponse.json({ success: true, data: qna });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.itemNo || !body.question) {
      return NextResponse.json(
        { success: false, error: "Item No and Question are required" },
        { status: 400 }
      );
    }

    const created = await DatabaseStore.createQna({
      productId: body.productId || undefined,
      itemNo: body.itemNo,
      productName: body.productName || body.itemNo,
      userName: body.userName || "Customer",
      userEmail: body.userEmail || "customer@example.com",
      question: body.question,
      rating: Number(body.rating || 5),
      status: body.status || "Active",
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
