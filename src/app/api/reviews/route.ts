import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rating = searchParams.get("rating") ? Number(searchParams.get("rating")) : undefined;
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const productId = searchParams.get("productId") || undefined;

    const reviews = await DatabaseStore.findReviews({ rating, search, status, productId });
    return NextResponse.json({ success: true, data: reviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.itemNo || !body.review || body.rating === undefined) {
      return NextResponse.json(
        { success: false, error: "Item No, review text, and rating are required" },
        { status: 400 }
      );
    }

    const created = await DatabaseStore.createReview({
      productId: body.productId || undefined,
      itemNo: body.itemNo,
      productName: body.productName || body.itemNo,
      userName: body.userName || "Verified Buyer",
      userEmail: body.userEmail || "customer@example.com",
      rating: Number(body.rating),
      review: body.review,
      media: Array.isArray(body.media) ? body.media : [],
      comments: Array.isArray(body.comments) ? body.comments : [],
      commentCount: Number(body.commentCount || (Array.isArray(body.comments) ? body.comments.length : 0)),
      status: body.status || "Active",
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
