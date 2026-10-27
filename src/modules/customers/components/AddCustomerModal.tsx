"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  Shield,
  Loader2,
  Check,
  MapPin,
  Truck,
  Sparkles,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  User,
  CheckCircle2,
} from "lucide-react";
import { Customer, AccountType, CustomerType, CustomerStatus } from "../types/customer.types";
import { Role } from "@/modules/roles/types/role.types";
import {
  COUNTRIES,
  lookupPostalCode,
  validatePostalCode,
} from "@/core/utils/postal-autofill";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  onCustomerSaved: () => void;
}

export function AddCustomerModal({ isOpen, onClose, customer, onCustomerSaved }: Props) {
  // Personal Info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("customer");
  const [customerType, setCustomerType] = useState<CustomerType>("Customer");
  const [status, setStatus] = useState<CustomerStatus>("ACTIVE");
  const [credit, setCredit] = useState("0");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);

  // Shipping Address Fields
  const [shippingCountryCode, setShippingCountryCode] = useState("IN");
  const [shippingPostalCode, setShippingPostalCode] = useState("400001");
  const [shippingState, setShippingState] = useState("Maharashtra");
  const [shippingCity, setShippingCity] = useState("Mumbai");
  const [shippingStreet, setShippingStreet] = useState("");
  const [shippingApartment, setShippingApartment] = useState("");
  const [shippingAutofillMsg, setShippingAutofillMsg] = useState<string | null>(null);
  const [shippingPostalError, setShippingPostalError] = useState<string | null>(null);
  const [shippingLocalities, setShippingLocalities] = useState<string[]>([]);

  // Billing Address Fields
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billingCountryCode, setBillingCountryCode] = useState("IN");
  const [billingPostalCode, setBillingPostalCode] = useState("400001");
  const [billingState, setBillingState] = useState("Maharashtra");
  const [billingCity, setBillingCity] = useState("Mumbai");
  const [billingStreet, setBillingStreet] = useState("");
  const [billingApartment, setBillingApartment] = useState("");
  const [billingAutofillMsg, setBillingAutofillMsg] = useState<string | null>(null);
  const [billingPostalError, setBillingPostalError] = useState<string | null>(null);
  const [billingLocalities, setBillingLocalities] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available roles
  useEffect(() => {
    if (isOpen) {
      fetch("/api/roles")
        .then((res) => res.json())
        .then((json) => {
          if (json.data) setRoles(json.data);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Populate form when editing or resetting
  useEffect(() => {
    if (customer) {
      setFullName(customer.name || `${customer.firstName || ""} ${customer.lastName || ""}`.trim());
      setEmail(customer.email || "");
      setMobileNumber(customer.mobileNumber || customer.phone || "");
      setAccountType(customer.accountType || "customer");
      setCustomerType(customer.customerType || "Customer");
      setStatus(customer.status || "ACTIVE");
      setCredit(customer.credit ? customer.credit.toString() : "0");
      setRoleId(customer.roleId || (customer.assignedRoles && customer.assignedRoles[0]) || "");
      setPassword("");

      // Populate addresses if present
      const defaultShipping = customer.addresses?.find((a) => a.type === "shipping" && a.isDefault) || customer.addresses?.find((a) => a.type === "shipping");
      const defaultBilling = customer.addresses?.find((a) => a.type === "billing" && a.isDefault) || customer.addresses?.find((a) => a.type === "billing");

      if (defaultShipping) {
        setShippingCountryCode(defaultShipping.country === "India" ? "IN" : "IN");
        setShippingPostalCode(defaultShipping.postalCode || "400001");
        setShippingState(defaultShipping.state || "Maharashtra");
        setShippingCity(defaultShipping.city || "Mumbai");
        setShippingStreet(defaultShipping.addressLine1 || "");
        setShippingApartment(defaultShipping.addressLine2 || "");
      } else {
        setShippingCountryCode("IN");
        setShippingPostalCode(customer.postalCode || "400001");
        setShippingState(customer.state || "Maharashtra");
        setShippingCity(customer.city || "Mumbai");
        setShippingStreet(customer.streetAddress || customer.shippingAddress || customer.address || "");
        setShippingApartment(customer.apartment || "");
      }

      if (defaultBilling) {
        setSameAsShipping(false);
        setBillingCountryCode(defaultBilling.country === "India" ? "IN" : "IN");
        setBillingPostalCode(defaultBilling.postalCode || "400001");
        setBillingState(defaultBilling.state || "Maharashtra");
        setBillingCity(defaultBilling.city || "Mumbai");
        setBillingStreet(defaultBilling.addressLine1 || "");
        setBillingApartment(defaultBilling.addressLine2 || "");
      } else {
        setSameAsShipping(true);
      }
    } else {
      setFullName("");
      setEmail("");
      setMobileNumber("");
      setPassword("Customer@123");
      setAccountType("customer");
      setCustomerType("Customer");
      setStatus("ACTIVE");
      setCredit("0.00");
      setRoleId("");
      setSameAsShipping(true);

      setShippingCountryCode("IN");
      setShippingPostalCode("400001");
      setShippingState("Maharashtra");
      setShippingCity("Mumbai");
      setShippingStreet("");
      setShippingApartment("");

      setBillingCountryCode("IN");
      setBillingPostalCode("400001");
      setBillingState("Maharashtra");
      setBillingCity("Mumbai");
      setBillingStreet("");
      setBillingApartment("");
    }
    setError(null);
  }, [customer, isOpen]);

  if (!isOpen) return null;

  // Selected Country objects
  const selectedShippingCountry = COUNTRIES.find((c) => c.code === shippingCountryCode) || COUNTRIES[0];
  const selectedBillingCountry = COUNTRIES.find((c) => c.code === billingCountryCode) || COUNTRIES[0];

  // Handle Postal Code Changes & Autofill
  const handleShippingPostalChange = (code: string) => {
    setShippingPostalCode(code);
    setShippingPostalError(null);
    setShippingAutofillMsg(null);
    setShippingLocalities([]);

    if (!code.trim()) return;

    const val = validatePostalCode(shippingCountryCode, code);
    if (!val.valid) {
      setShippingPostalError(val.error || null);
    }

    const lookup = lookupPostalCode(shippingCountryCode, code);
    if (lookup.success) {
      if (lookup.city) setShippingCity(lookup.city);
      if (lookup.state) setShippingState(lookup.state);
      if (lookup.localities && lookup.localities.length > 1) {
        setShippingLocalities(lookup.localities);
      }
      setShippingAutofillMsg(lookup.message || "City & State populated from PIN code.");
    }
  };

  const handleBillingPostalChange = (code: string) => {
    setBillingPostalCode(code);
    setBillingPostalError(null);
    setBillingAutofillMsg(null);
    setBillingLocalities([]);

    if (!code.trim()) return;

    const val = validatePostalCode(billingCountryCode, code);
    if (!val.valid) {
      setBillingPostalError(val.error || null);
    }

    const lookup = lookupPostalCode(billingCountryCode, code);
    if (lookup.success) {
      if (lookup.city) setBillingCity(lookup.city);
      if (lookup.state) setBillingState(lookup.state);
      if (lookup.localities && lookup.localities.length > 1) {
        setBillingLocalities(lookup.localities);
      }
      setBillingAutofillMsg(lookup.message || "City & State populated from PIN code.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) {
      setError("Full name and Email address are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    const effectiveShippingCountry = selectedShippingCountry.name;
    const effectiveBillingCountry = sameAsShipping ? effectiveShippingCountry : selectedBillingCountry.name;

    const shippingAddressDetail = {
      name: fullName.trim(),
      addressLine1: shippingStreet.trim(),
      addressLine2: shippingApartment.trim(),
      country: effectiveShippingCountry,
      state: shippingState.trim(),
      city: shippingCity.trim(),
      postalCode: shippingPostalCode.trim(),
      phone: mobileNumber.trim(),
      type: "shipping" as const,
      isDefault: true,
    };

    const billingAddressDetail = sameAsShipping
      ? {
          name: fullName.trim(),
          addressLine1: shippingStreet.trim(),
          addressLine2: shippingApartment.trim(),
          country: effectiveShippingCountry,
          state: shippingState.trim(),
          city: shippingCity.trim(),
          postalCode: shippingPostalCode.trim(),
          phone: mobileNumber.trim(),
          type: "billing" as const,
          isDefault: true,
        }
      : {
          name: fullName.trim(),
          addressLine1: billingStreet.trim(),
          addressLine2: billingApartment.trim(),
          country: effectiveBillingCountry,
          state: billingState.trim(),
          city: billingCity.trim(),
          postalCode: billingPostalCode.trim(),
          phone: mobileNumber.trim(),
          type: "billing" as const,
          isDefault: true,
        };

    const payload = {
      name: fullName.trim(),
      firstName,
      lastName,
      email: email.trim(),
      mobileNumber: mobileNumber.trim(),
      phone: mobileNumber.trim(),
      password,
      accountType,
      customerType,
      status,
      credit: parseFloat(credit) || 0,
      roleId,
      country: effectiveShippingCountry,
      countryCode: shippingCountryCode,
      state: shippingState.trim(),
      city: shippingCity.trim(),
      postalCode: shippingPostalCode.trim(),
      streetAddress: shippingStreet.trim(),
      apartment: shippingApartment.trim(),
      shippingAddressDetail,
      billingAddressDetail,
    };

    try {
      const url = customer ? `/api/customers/${customer.id}` : `/api/customers`;
      const method = customer ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to save customer account");

      onCustomerSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {customer ? "Edit Customer & Role" : "Add New Customer"}
              </h2>
              <p className="text-xs text-slate-500">
                Manage personal info, dynamic Indian PIN address autofill, and role access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* 1. Personal & Contact Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Customer Identification</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Vikram Sharma"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. vikram@example.com"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number (India +91)
                </label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              {!customer && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Customer account password"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 2. Security Role & Status */}
          <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Security Role & Customer Access</span>
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-600">Status:</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                  className="px-2 py-1 text-xs font-semibold rounded-md border border-slate-300 bg-white"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="PENDING_APPROVAL">PENDING APPROVAL</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Assign Custom Role
                </label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">No role assigned (Standard)</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Customer Type
                </label>
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Customer">Customer</option>
                  <option value="VIP">VIP</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Customer (Guest)">Customer (Guest)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Store Credit (₹ INR)
                </label>
                <input
                  type="number"
                  step="1"
                  value={credit}
                  onChange={(e) => setCredit(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Shipping Address with Dynamic PIN Code Autofill */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Shipping Address</span>
              </h3>
              <span className="text-[11px] text-slate-400">Default Country: India (IN)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Country
                </label>
                <select
                  value={shippingCountryCode}
                  onChange={(e) => {
                    setShippingCountryCode(e.target.value);
                    const c = COUNTRIES.find((x) => x.code === e.target.value);
                    if (c && c.states.length > 0) setShippingState(c.states[0]);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.dialCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    PIN / Postal Code *
                  </label>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" />
                    Auto-populates city & state
                  </span>
                </div>
                <input
                  type="text"
                  value={shippingPostalCode}
                  onChange={(e) => handleShippingPostalChange(e.target.value)}
                  placeholder="e.g. 400001, 110001, 560001"
                  className={`w-full px-3 py-2 text-xs rounded-lg border font-mono ${
                    shippingPostalError ? "border-red-300 bg-red-50" : "border-slate-300"
                  } focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                />
                {shippingAutofillMsg && (
                  <p className="mt-1 text-[11px] text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {shippingAutofillMsg}
                  </p>
                )}
                {shippingPostalError && (
                  <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {shippingPostalError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State / Union Territory
                </label>
                {selectedShippingCountry.states.length > 0 ? (
                  <select
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {selectedShippingCountry.states.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    placeholder="Enter state/province"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City / Town
                </label>
                <input
                  type="text"
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  placeholder="e.g. Mumbai, New Delhi"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {shippingLocalities.length > 1 && (
                <div className="sm:col-span-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                  <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                    Select Specific Locality for PIN {shippingPostalCode}:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {shippingLocalities.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setShippingApartment((prev) => prev ? `${prev}, ${loc}` : loc)}
                        className="px-2 py-0.5 text-[11px] bg-white border border-emerald-300 text-emerald-800 rounded hover:bg-emerald-100 transition"
                      >
                        + {loc}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={shippingStreet}
                  onChange={(e) => setShippingStreet(e.target.value)}
                  placeholder="House / Flat / Building No., Street Name, Area"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Address Details (Apartment, Landmark, Suite - Optional)
                </label>
                <input
                  type="text"
                  value={shippingApartment}
                  onChange={(e) => setShippingApartment(e.target.value)}
                  placeholder="e.g. Near Metro Station, 4th Floor"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* 4. Billing Address Options */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={(e) => setSameAsShipping(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-800">
                  Billing address same as shipping address
                </span>
              </label>
            </div>

            {!sameAsShipping && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-600" />
                  <span>Distinct Billing Address</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Billing Country
                    </label>
                    <select
                      value={billingCountryCode}
                      onChange={(e) => {
                        setBillingCountryCode(e.target.value);
                        const c = COUNTRIES.find((x) => x.code === e.target.value);
                        if (c && c.states.length > 0) setBillingState(c.states[0]);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Billing PIN / Postal Code
                    </label>
                    <input
                      type="text"
                      value={billingPostalCode}
                      onChange={(e) => handleBillingPostalChange(e.target.value)}
                      placeholder="e.g. 110001"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono"
                    />
                    {billingAutofillMsg && (
                      <p className="mt-1 text-[11px] text-emerald-700">{billingAutofillMsg}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      State / UT
                    </label>
                    <input
                      type="text"
                      value={billingState}
                      onChange={(e) => setBillingState(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={billingCity}
                      onChange={(e) => setBillingCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Billing Street Address
                    </label>
                    <input
                      type="text"
                      value={billingStreet}
                      onChange={(e) => setBillingStreet(e.target.value)}
                      placeholder="Street address line"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>{customer ? "Save Changes" : "Create Customer"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
