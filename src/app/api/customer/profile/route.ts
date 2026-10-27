import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/modules/auth/services/auth.service";
import { DatabaseStore } from "@/core/db/store";
import { apiError, apiSuccess } from "@/core/utils/api-response";

export async function GET() {
  try {
    const authUser = await AuthService.getCurrentUser();
    if (!authUser) {
      return apiError("Unauthorized", 401);
    }

    const fullUser = await DatabaseStore.findUserById(authUser.id);
    if (!fullUser) {
      return apiError("User not found", 404);
    }

    // Also fetch customer's saved addresses
    const rawAddresses = await DatabaseStore.findAddresses({
      userId: fullUser.id,
      customerEmail: fullUser.email,
    });

    const addresses = rawAddresses.map((addr) => ({
      ...addr,
      streetAddress: addr.addressLine1 || (addr as any).streetAddress || "",
      apartment: addr.addressLine2 || (addr as any).apartment || "",
    }));

    const sanitized = {
      id: fullUser.id,
      name: fullUser.name,
      email: fullUser.email,
      phone: fullUser.phone || fullUser.mobileNumber,
      mobileNumber: fullUser.mobileNumber || fullUser.phone,
      countryCode: fullUser.countryCode || "+1",
      country: fullUser.country,
      state: fullUser.state,
      city: fullUser.city,
      postalCode: fullUser.postalCode,
      streetAddress: fullUser.streetAddress,
      apartment: fullUser.apartment,
      role: fullUser.role,
      accountType: fullUser.accountType,
      credit: fullUser.credit || 0,
      addresses,
    };

    return apiSuccess(sanitized, "Profile retrieved successfully.");
  } catch (error: any) {
    return apiError(error.message || "Failed to retrieve profile.", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await AuthService.getCurrentUser();
    if (!authUser) {
      return apiError("Unauthorized", 401);
    }

    const body = await req.json();
    const updateData: Record<string, any> = {};

    if (body.name) updateData.name = body.name.trim();
    if (body.phone !== undefined) {
      updateData.phone = body.phone.trim();
      updateData.mobileNumber = body.phone.trim();
    }
    if (body.countryCode) updateData.countryCode = body.countryCode.trim();
    if (body.country) updateData.country = body.country.trim();
    if (body.state) updateData.state = body.state.trim();
    if (body.city) updateData.city = body.city.trim();
    if (body.postalCode) updateData.postalCode = body.postalCode.trim();
    if (body.streetAddress) updateData.streetAddress = body.streetAddress.trim();
    if (body.apartment !== undefined) updateData.apartment = body.apartment.trim();

    // Change password if requested
    if (body.newPassword) {
      if (!body.currentPassword) {
        return apiError("Current password is required to set a new password.", 400);
      }
      const userRecord = await DatabaseStore.findUserById(authUser.id);
      if (!userRecord || !userRecord.password) {
        return apiError("User record error", 400);
      }
      const isMatch = await AuthService.verifyPassword(body.currentPassword, userRecord.password);
      if (!isMatch) {
        return apiError("Current password is incorrect.", 400);
      }
      if (body.newPassword.length < 6) {
        return apiError("New password must be at least 6 characters.", 400);
      }
      updateData.password = await AuthService.hashPassword(body.newPassword);
    }

    const updated = await DatabaseStore.updateUser(authUser.id, updateData);
    if (!updated) {
      return apiError("Failed to update user profile.", 404);
    }

    return apiSuccess(
      {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
      },
      "Profile updated successfully!"
    );
  } catch (error: any) {
    return apiError(error.message || "Failed to update profile.", 500);
  }
}
