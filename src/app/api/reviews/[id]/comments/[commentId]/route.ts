import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params;
    const updated = await DatabaseStore.deleteReviewComment(id, commentId);

    if (!updated) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
