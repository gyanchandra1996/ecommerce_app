import { NextRequest } from "next/server";
import { AuthService } from "@/modules/auth/services/auth.service";
import { apiError, apiSuccess } from "@/core/utils/api-response";
import { EmailService } from "@/core/mail/email.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      confirmPassword,
      role,
      mobileNumber,
      countryCode,
      country,
      state,
      city,
      postalCode,
      streetAddress,
      apartment,
      accountType,
    } = body;

    // Server-side validation for required registration fields
    if (!name || !name.trim()) {
      return apiError("Full name is required.", 400);
    }
    if (!email || !email.trim() || !email.includes("@")) {
      return apiError("A valid email address is required.", 400);
    }
    if (!password || password.length < 6) {
      return apiError("Password must be at least 6 characters long.", 400);
    }
    if (confirmPassword && password !== confirmPassword) {
      return apiError("Passwords do not match.", 400);
    }

    // Server-side security: Public registration strictly creates customer accounts.
    // Client-supplied role or accountType fields are explicitly rejected/ignored.
    const assignedRole = "CUSTOMER";
    const assignedAccountType = "customer";

    const { user, token } = await AuthService.register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      confirmPassword,
      role: assignedRole,
      mobileNumber: mobileNumber?.trim(),
      countryCode: countryCode?.trim() || "+1",
      phone: mobileNumber?.trim(),
      country: country?.trim(),
      state: state?.trim(),
      city: city?.trim(),
      postalCode: postalCode?.trim(),
      streetAddress: streetAddress?.trim(),
      apartment: apartment?.trim(),
      accountType: assignedAccountType,
    });

    await AuthService.setSessionCookie(token, "customer", true);

    EmailService.sendUserRegisteredEmail({
      email: user.email,
      name: user.name,
      phone: mobileNumber?.trim(),
    }).catch((e) => console.error("Failed to trigger registration email:", e));

    return apiSuccess({ user }, "Registration successful!", 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to register user.";
    return apiError(message, 400);
  }
}
