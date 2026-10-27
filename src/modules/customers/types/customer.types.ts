import { AddressRecord } from "@/core/db/store";

export type AccountType = "admin" | "customer" | "manager" | "staff";
export type CustomerType = "Customer" | "Customer (Guest)" | "Wholesale" | "VIP";
export type CustomerStatus = "ACTIVE" | "INACTIVE" | "PENDING_APPROVAL";

export interface Customer {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  mobileNumber?: string;
  countryCode?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  streetAddress?: string;
  apartment?: string;
  address?: string | null;
  shippingAddress?: string | null;
  addresses?: AddressRecord[];
  accountType: AccountType;
  customerType: CustomerType;
  lastLogin: string;
  credit: number;
  status: CustomerStatus;
  roleId?: string;
  roleName?: string;
  assignedRoles?: string[];
  ordersCount?: number;
  wishlistCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFilters {
  search: string;
  accountType: string;
  customerType: string;
  status: string;
  page: number;
  pageSize: number;
}
