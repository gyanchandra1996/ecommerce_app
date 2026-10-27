import { NextResponse } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { AuthService } from "@/modules/auth/services/auth.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await AuthService.getCurrentUser();
    const address = await DatabaseStore.findAddressById(id);

    if (!address) {
      return NextResponse.json({ success: false, error: "Address not found." }, { status: 404 });
    }

    // Ownership check for non-admin users
    if (authUser && authUser.role !== "ADMIN") {
      if (
        (address.userId && address.userId !== authUser.id) &&
        (address.customerEmail && address.customerEmail.toLowerCase() !== authUser.email.toLowerCase())
      ) {
        return NextResponse.json({ success: false, error: "Access denied." }, { status: 403 });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...address,
        streetAddress: address.addressLine1 || (address as any).streetAddress || "",
        apartment: address.addressLine2 || (address as any).apartment || "",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await AuthService.getCurrentUser();
    const existing = await DatabaseStore.findAddressById(id);

    if (!existing) {
      return NextResponse.json({ success: false, error: "Address not found." }, { status: 404 });
    }

    // Ownership check
    if (authUser && authUser.role !== "ADMIN") {
      const isOwner =
        (existing.userId && existing.userId === authUser.id) ||
        (existing.customerEmail && existing.customerEmail.toLowerCase() === authUser.email.toLowerCase());

      if (!isOwner) {
        return NextResponse.json(
          { success: false, error: "You do not have permission to edit this address." },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const updateData: Record<string, any> = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.phone !== undefined || body.mobileNumber !== undefined) {
      updateData.phone = (body.phone || body.mobileNumber).trim();
    }
    if (body.company !== undefined) updateData.company = body.company.trim();
    if (body.streetAddress !== undefined || body.addressLine1 !== undefined) {
      updateData.addressLine1 = (body.streetAddress || body.addressLine1).trim();
    }
    if (body.apartment !== undefined || body.addressLine2 !== undefined) {
      updateData.addressLine2 = (body.apartment || body.addressLine2 || "").trim();
    }
    if (body.country !== undefined) updateData.country = body.country.trim();
    if (body.state !== undefined) updateData.state = body.state.trim();
    if (body.city !== undefined) updateData.city = body.city.trim();
    if (body.postalCode !== undefined) updateData.postalCode = body.postalCode.trim();
    if (body.type !== undefined) updateData.type = body.type === "shipping" ? "shipping" : "billing";
    if (body.isDefault !== undefined) updateData.isDefault = Boolean(body.isDefault);
    if (body.status !== undefined) updateData.status = body.status;

    // Validate essential fields if updated
    if (updateData.name === "") {
      return NextResponse.json({ success: false, error: "Recipient name cannot be empty." }, { status: 400 });
    }
    if (updateData.phone === "") {
      return NextResponse.json({ success: false, error: "Phone number cannot be empty." }, { status: 400 });
    }
    if (updateData.addressLine1 === "") {
      return NextResponse.json({ success: false, error: "Street address cannot be empty." }, { status: 400 });
    }

    const updated = await DatabaseStore.updateAddress(id, updateData);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Failed to update address." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Address updated successfully.",
      data: {
        ...updated,
        streetAddress: updated.addressLine1,
        apartment: updated.addressLine2,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(req, { params });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await AuthService.getCurrentUser();

    const deleteResult = await DatabaseStore.deleteAddress(
      id,
      authUser?.role === "ADMIN" ? undefined : authUser?.id,
      authUser?.role === "ADMIN" ? undefined : authUser?.email
    );

    if (!deleteResult.success) {
      return NextResponse.json(
        { success: false, error: deleteResult.error || "Failed to delete address." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Address deleted successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
