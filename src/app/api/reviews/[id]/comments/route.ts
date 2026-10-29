import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviews = await DatabaseStore.findReviews();
    const review = reviews.find((r) => r.id === id);

    if (!review) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: review.comments || [],
      commentCount: review.commentCount || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.comment || !body.comment.trim()) {
      return NextResponse.json(
        { success: false, error: "Comment text cannot be empty." },
        { status: 400 }
      );
    }

    const updated = await DatabaseStore.addReviewComment(id, {
      userName: body.userName?.trim() || "Customer",
      userEmail: body.userEmail?.trim() || "customer@example.com",
      comment: body.comment.trim(),
      isAdmin: Boolean(body.isAdmin),
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    const latestComment = updated.comments?.[updated.comments.length - 1];

    return NextResponse.json(
      {
        success: true,
        message: "Comment added successfully.",
        data: updated,
        comment: latestComment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
