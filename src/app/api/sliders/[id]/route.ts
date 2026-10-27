import { NextRequest } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { apiError, apiSuccess } from "@/core/utils/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const slider = await DatabaseStore.findSliderById(id);
    if (!slider) {
      return apiError("Slider not found.", 404);
    }
    return apiSuccess(slider);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load slider.";
    return apiError(message, 500);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await DatabaseStore.updateSlider(id, body);
    if (!updated) {
      return apiError("Slider not found.", 404);
    }

    return apiSuccess(updated, "Slider updated successfully.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update slider.";
    return apiError(message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await DatabaseStore.deleteSlider(id);
    if (!deleted) {
      return apiError("Slider not found.", 404);
    }

    return apiSuccess({ deleted: true }, "Slider removed successfully.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete slider.";
    return apiError(message, 500);
  }
}
