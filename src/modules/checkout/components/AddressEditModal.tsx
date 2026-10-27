"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Building,
  Phone,
  User,
} from "lucide-react";
import {
  COUNTRIES,
  lookupPostalCode,
  validatePostalCode,
} from "@/core/utils/postal-autofill";

export interface AddressData {
  id?: string;
  name: string;
  company?: string;
  country: string;
  countryCode: string;
  state: string;
  city: string;
  postalCode: string;
  streetAddress: string;
  apartment?: string;
  phone: string;
  type: "billing" | "shipping";
  isDefault: boolean;
}

interface Props {
  isOpen: boolean;
  mode: "add" | "edit";
  initialData?: Partial<AddressData> | null;
  defaultType?: "billing" | "shipping";
  onSave: (savedAddress: AddressData) => void;
  onClose: () => void;
}

export function AddressEditModal({
  isOpen,
  mode,
  initialData,
  defaultType = "shipping",
  onSave,
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [countryCode, setCountryCode] = useState("IN");
  const [state, setState] = useState("Maharashtra");
  const [city, setCity] = useState("Mumbai");
  const [postalCode, setPostalCode] = useState("400001");
  const [streetAddress, setStreetAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<"billing" | "shipping">(defaultType);
  const [isDefault, setIsDefault] = useState(false);

  const [autofillMessage, setAutofillMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  useEffect(() => {
    if (initialData && mode === "edit") {
      setName(initialData.name || "");
      setCompany(initialData.company || "");
      const cCode =
        initialData.countryCode ||
        COUNTRIES.find((c) => c.name.toLowerCase() === initialData.country?.toLowerCase())?.code ||
        "IN";
      setCountryCode(cCode);
      setState(initialData.state || "");
      setCity(initialData.city || "");
      setPostalCode(initialData.postalCode || "");
      setStreetAddress(initialData.streetAddress || (initialData as any).addressLine1 || "");
      setApartment(initialData.apartment || (initialData as any).addressLine2 || "");
      setPhone(initialData.phone || "");
      setType(initialData.type || defaultType);
      setIsDefault(Boolean(initialData.isDefault));
    } else {
      // Add mode defaults
      setName("");
      setCompany("");
      setCountryCode("IN");
      setState("Maharashtra");
      setCity("Mumbai");
      setPostalCode("400001");
      setStreetAddress("");
      setApartment("");
      setPhone("");
      setType(defaultType);
      setIsDefault(false);
    }
    setAutofillMessage(null);
    setFormError(null);
  }, [initialData, mode, defaultType, isOpen]);

  if (!isOpen) return null;

  const handleCountryChange = (newCountryCode: string) => {
    setCountryCode(newCountryCode);
    const newCountry = COUNTRIES.find((c) => c.code === newCountryCode);
    if (newCountry && newCountry.states.length > 0) {
      setState(newCountry.states[0]);
    } else {
      setState("");
    }
    setCity("");
    setPostalCode("");
    setAutofillMessage(null);
  };

  const handlePostalCodeChange = (newCode: string) => {
    setPostalCode(newCode);
    setFormError(null);

    if (newCode.trim().length >= 3) {
      const result = lookupPostalCode(countryCode, newCode.trim());
      if (result.success && result.city && result.state) {
        setCity(result.city);
        setState(result.state);
        setAutofillMessage(`Autofilled: ${result.city}, ${result.state}`);
      } else {
        setAutofillMessage(null);
      }
    } else {
      setAutofillMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!name.trim()) {
      setFormError("Please enter full recipient name.");
      return;
    }
    if (!phone.trim()) {
      setFormError("Please enter a valid mobile number.");
      return;
    }
    if (!streetAddress.trim()) {
      setFormError("Please enter street address / building details.");
      return;
    }
    if (!city.trim() || !state.trim()) {
      setFormError("City and State are required.");
      return;
    }
    if (!postalCode.trim()) {
      setFormError("PIN / Postal code is required.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: name.trim(),
        company: company.trim() || undefined,
        addressLine1: streetAddress.trim(),
        addressLine2: apartment.trim() || undefined,
        streetAddress: streetAddress.trim(),
        apartment: apartment.trim() || undefined,
        country: selectedCountry.name,
        countryCode,
        state: state.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        phone: phone.trim(),
        type,
        isDefault,
      };

      let res: Response;
      if (mode === "edit" && initialData?.id) {
        // Edit existing address -> NO DUPLICATE!
        res = await fetch(`/api/addresses/${initialData.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new address
        res = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save address.");
      }

      const saved: AddressData = {
        id: json.data.id,
        name: json.data.name,
        company: json.data.company,
        country: json.data.country,
        countryCode: json.data.countryCode || countryCode,
        state: json.data.state,
        city: json.data.city,
        postalCode: json.data.postalCode,
        streetAddress: json.data.streetAddress || json.data.addressLine1,
        apartment: json.data.apartment || json.data.addressLine2,
        phone: json.data.phone,
        type: json.data.type,
        isDefault: json.data.isDefault,
      };

      onSave(saved);
      onClose();
    } catch (err: any) {
      setFormError(err.message || "Failed to save address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-wide">
                {mode === "edit" ? "Edit Saved Address" : "Add New Delivery Address"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {mode === "edit"
                  ? "Update address information without creating duplicates"
                  : "Save this address for fast checkout"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("shipping")}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                type === "shipping"
                  ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>Shipping Address</span>
            </button>
            <button
              type="button"
              onClick={() => setType("billing")}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                type === "billing"
                  ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>Billing Address</span>
            </button>
          </div>

          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Gyanchandra Verma"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 9876543210"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Company (Optional) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Company Name (Optional)
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Country & PIN Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Country *
              </label>
              <select
                value={countryCode}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                  PIN / Postal Code *
                </label>
                <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Autofill
                </span>
              </div>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => handlePostalCodeChange(e.target.value)}
                placeholder="e.g. 400001, 110001, 560001"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold"
              />
              {autofillMessage && (
                <p className="text-[10px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>{autofillMessage}</span>
                </p>
              )}
            </div>
          </div>

          {/* State & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                State / Province *
              </label>
              {selectedCountry.states && selectedCountry.states.length > 0 ? (
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  <option value="">Select State</option>
                  {selectedCountry.states.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State name"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                City / District *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City name"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Street Address & Apartment */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Street Address / Flat / Floor / Building *
            </label>
            <input
              type="text"
              required
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="e.g. Flat 402, Building A, Palm Heights, MG Road"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Apartment, Suite, Landmark (Optional)
            </label>
            <input
              type="text"
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
              placeholder="e.g. Near Metro Station / Landmark"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Set as Default Address */}
          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span className="text-xs font-semibold text-slate-700">
              Set as my default {type} address
            </span>
          </label>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow transition cursor-pointer flex items-center gap-2"
            >
              <span>{isSubmitting ? "Saving..." : mode === "edit" ? "Save Changes" : "Save Address"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
