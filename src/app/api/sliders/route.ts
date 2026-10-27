import { NextRequest } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { apiError, apiSuccess } from "@/core/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const position = searchParams.get("position") as "main" | "side" | "triple_promo" | undefined;
    const includeInactive = searchParams.get("all") === "true";

    const sliders = await DatabaseStore.findSliders({
      position: position || undefined,
      includeInactive,
    });

    return apiSuccess(sliders);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load sliders.";
    return apiError(message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      subtitle,
      description,
      badge,
      tag,
      buttonText = "Shop Now",
      buttonLink = "/#deals",
      imageUrl,
      bgGradient,
      textColor = "text-white",
      position = "main",
      displayOrder,
      isActive = true,
    } = body;

    if (!title || !title.trim()) {
      return apiError("Slider title is required.", 400);
    }

    const created = await DatabaseStore.createSlider({
      title: title.trim(),
      subtitle: subtitle?.trim(),
      description: description?.trim(),
      badge: badge?.trim(),
      tag: tag?.trim(),
      buttonText: buttonText.trim(),
      buttonLink: buttonLink.trim(),
      imageUrl: imageUrl?.trim(),
      bgGradient: bgGradient?.trim() || "from-[#091124] via-[#1a233d] to-[#0c142b]",
      textColor: textColor?.trim() || "text-white",
      position,
      displayOrder: typeof displayOrder === "number" ? displayOrder : 1,
      isActive: Boolean(isActive),
    });

    return apiSuccess(created, "Slider banner created successfully.", 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create slider.";
    return apiError(message, 500);
  }
}
