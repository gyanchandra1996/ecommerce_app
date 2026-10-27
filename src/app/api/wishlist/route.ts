import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const wishlist = await DatabaseStore.findWishlist(search);
    return NextResponse.json({ success: true, data: wishlist });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, userId } = body;
    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID or SKU is required" }, { status: 400 });
    }

    const res = await DatabaseStore.toggleWishlistProduct(productId, userId || "guest_user");
    return NextResponse.json({ success: true, data: res });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
