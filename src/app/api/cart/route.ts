import { NextRequest, NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { AuthService } from "@/modules/auth/services/auth.service";

async function getAuthContext(req: NextRequest) {
  const customer = await AuthService.getCurrentCustomerUser();
  let guestSessionId =
    req.headers.get("x-session-id") ||
    req.headers.get("x-guest-id") ||
    req.cookies.get("guest_session_id")?.value;
  let newGuestCookie: string | null = null;

  if (!customer && !guestSessionId) {
    guestSessionId = "gst_" + Math.random().toString(36).substring(2, 12);
    newGuestCookie = guestSessionId;
  }

  return { customer, guestSessionId, newGuestCookie };
}

export async function GET(req: NextRequest) {
  try {
    const { customer, guestSessionId, newGuestCookie } = await getAuthContext(req);
    const result = await DatabaseStore.getOrCreateCart(customer?.id, guestSessionId);

    const response = NextResponse.json({
      success: true,
      data: {
        cart: result.cart,
        items: result.items,
        totalItems: result.items.reduce((sum, it) => sum + it.quantity, 0),
        subtotal: result.items.reduce(
          (sum, it) => sum + (it.product?.price || 0) * it.quantity,
          0
        ),
      },
    });

    if (newGuestCookie) {
      response.cookies.set("guest_session_id", newGuestCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { customer, guestSessionId, newGuestCookie } = await getAuthContext(req);
    const { cart } = await DatabaseStore.getOrCreateCart(customer?.id, guestSessionId);

    const body = await req.json();
    const { productId, variantId, quantity = 1, selectedAttributes } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required." },
        { status: 400 }
      );
    }

    const savedItem = await DatabaseStore.saveCartItem(cart.id, {
      productId,
      variantId,
      quantity: Number(quantity) || 1,
      selectedAttributes,
    });

    const refreshed = await DatabaseStore.getOrCreateCart(customer?.id, guestSessionId);

    const response = NextResponse.json({
      success: true,
      message: "Cart item updated successfully.",
      data: {
        cart: refreshed.cart,
        items: refreshed.items,
        savedItem,
      },
    });

    if (newGuestCookie) {
      response.cookies.set("guest_session_id", newGuestCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { customer, guestSessionId } = await getAuthContext(req);
    const { cart } = await DatabaseStore.getOrCreateCart(customer?.id, guestSessionId);

    const body = await req.json();
    const { itemId, productId, variantId, delta, quantity } = body;

    let targetQuantity = quantity;
    if (delta !== undefined) {
      const items = await DatabaseStore.getOrCreateCart(customer?.id, guestSessionId);
      const current = items.items.find(
        (i) => i.id === itemId || i.productId === productId
      );
      targetQuantity = (current?.quantity || 1) + Number(delta);
    }

    await DatabaseStore.updateCartItemQuantity(
      cart.id,
      itemId || productId,
      targetQuantity,
      variantId
    );

    const refreshed = await DatabaseStore.getOrCreateCart(customer?.id, guestSessionId);
    return NextResponse.json({
      success: true,
      data: { cart: refreshed.cart, items: refreshed.items },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { customer, guestSessionId } = await getAuthContext(req);
    const { cart } = await DatabaseStore.getOrCreateCart(customer?.id, guestSessionId);

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    const productId = searchParams.get("productId");
    const variantId = searchParams.get("variantId") || undefined;
    const clearAll = searchParams.get("clear") === "true";

    if (clearAll || (!itemId && !productId)) {
      await DatabaseStore.clearCart(cart.id);
      return NextResponse.json({ success: true, message: "Cart cleared successfully." });
    }

    await DatabaseStore.removeCartItem(cart.id, itemId || productId!, variantId);
    const refreshed = await DatabaseStore.getOrCreateCart(customer?.id, guestSessionId);
    return NextResponse.json({
      success: true,
      data: { cart: refreshed.cart, items: refreshed.items },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
