import { NextRequest } from "next/server";
import { DatabaseStore } from "@/core/db/store";
import { apiError, apiSuccess } from "@/core/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const accountType = searchParams.get("accountType") || "All";
    const customerType = searchParams.get("customerType") || "All";
    const status = searchParams.get("status") || "All";

    const [customers, pendingCount] = await Promise.all([
      DatabaseStore.findCustomers({ search, accountType, customerType, status }),
      DatabaseStore.getPendingCustomersCount(),
    ]);

    return apiSuccess({
      items: customers,
      pendingCount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load customers.";
    return apiError(message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      name,
      firstName,
      lastName,
      phone,
      mobileNumber,
      password,
      accountType,
      customerType,
      country,
      countryCode,
      state,
      city,
      postalCode,
      streetAddress,
      apartment,
      address,
      shippingAddress,
      billingAddressDetail,
      shippingAddressDetail,
      credit,
      roleId,
      assignedRoles,
      status,
    } = body;

    if (!email) {
      return apiError("Email address is required.", 400);
    }

    const effectiveFirstName = firstName || (name ? name.split(" ")[0] : "Customer");

    const existing = await DatabaseStore.findUserByEmail(email);
    if (existing) {
      return apiError("User with this email already exists.", 400);
    }

    const created = await DatabaseStore.createCustomer({
      email,
      name: name || `${effectiveFirstName} ${lastName || ""}`.trim(),
      firstName: effectiveFirstName,
      lastName: lastName || "",
      phone: mobileNumber || phone || "",
      mobileNumber: mobileNumber || phone || "",
      password: password || "Customer123!",
      accountType: accountType || "customer",
      customerType: customerType || "Customer",
      country: country || "India",
      countryCode: countryCode || "IN",
      state: state || "Maharashtra",
      city: city || "Mumbai",
      postalCode: postalCode || "400001",
      streetAddress: streetAddress || address || "",
      apartment: apartment || "",
      address: address || streetAddress || "",
      shippingAddress: shippingAddress || streetAddress || address || "",
      billingAddressDetail,
      shippingAddressDetail,
      credit: credit ? parseFloat(credit) : 0,
      roleId,
      assignedRoles: assignedRoles || (roleId ? [roleId] : []),
      status: status || "ACTIVE",
    });

    return apiSuccess(created, "Customer account created successfully.", 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create customer.";
    return apiError(message, 500);
  }
}
