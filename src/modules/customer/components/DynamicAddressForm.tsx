"use client";

import React, { useState, useEffect } from "react";
import {
  COUNTRIES,
  lookupPostalCode,
  validatePostalCode,
  CountryInfo,
} from "@/core/utils/postal-autofill";
import { MapPin, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

export interface AddressFormData {
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
  type?: "billing" | "shipping";
  isDefault?: boolean;
}

interface Props {
  initialData?: Partial<AddressFormData>;
  onChange: (data: AddressFormData) => void;
  showTypeSelector?: boolean;
  showDefaultToggle?: boolean;
}

export function DynamicAddressForm({
  initialData,
  onChange,
  showTypeSelector = false,
  showDefaultToggle = true,
}: Props) {
  const [name, setName] = useState(initialData?.name || "");
  const [company, setCompany] = useState(initialData?.company || "");
  const [countryCode, setCountryCode] = useState(initialData?.countryCode || "IN");
  const [state, setState] = useState(initialData?.state || "Maharashtra");
  const [city, setCity] = useState(initialData?.city || "Mumbai");
  const [postalCode, setPostalCode] = useState(initialData?.postalCode || "400001");
  const [streetAddress, setStreetAddress] = useState(initialData?.streetAddress || "");
  const [apartment, setApartment] = useState(initialData?.apartment || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [addressType, setAddressType] = useState<"billing" | "shipping">(initialData?.type || "shipping");
  const [isDefault, setIsDefault] = useState(initialData?.isDefault ?? true);

  const [autofillMessage, setAutofillMessage] = useState<string | null>(null);
  const [postalError, setPostalError] = useState<string | null>(null);

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  // Notify parent on any field change
  useEffect(() => {
    onChange({
      name,
      company,
      country: selectedCountry.name,
      countryCode,
      state,
      city,
      postalCode,
      streetAddress,
      apartment,
      phone,
      type: addressType,
      isDefault,
    });
  }, [
    name,
    company,
    countryCode,
    selectedCountry.name,
    state,
    city,
    postalCode,
    streetAddress,
    apartment,
    phone,
    addressType,
    isDefault,
  ]);

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
    setPostalError(null);
  };

  const handlePostalCodeChange = (code: string) => {
    setPostalCode(code);
    setPostalError(null);

    if (!code.trim()) {
      setAutofillMessage(null);
      return;
    }

    // Validate format
    const valRes = validatePostalCode(countryCode, code);
    if (!valRes.valid) {
      setPostalError(valRes.error || null);
    }

    // Autofill lookup
    const lookup = lookupPostalCode(countryCode, code);
    if (lookup.success) {
      if (lookup.city) setCity(lookup.city);
      if (lookup.state) setState(lookup.state);
      setAutofillMessage(lookup.message || "Address details autofilled.");
    } else {
      setAutofillMessage(lookup.message || null);
    }
  };

  return (
    <div className="space-y-4 text-xs sm:text-sm">
      {/* Optional Address Type Selection */}
      {showTypeSelector && (
        <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-xs font-bold text-slate-700 ml-1">Address Type:</span>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="radio"
              name="address_type"
              checked={addressType === "shipping"}
              onChange={() => setAddressType("shipping")}
              className="text-indigo-600 focus:ring-indigo-500"
            />
            <span>Shipping Address</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="radio"
              name="address_type"
              checked={addressType === "billing"}
              onChange={() => setAddressType("billing")}
              className="text-indigo-600 focus:ring-indigo-500"
            />
            <span>Billing Address</span>
          </label>
        </div>
      )}

      {/* Name & Company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Company (Optional)</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company name"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Street Address & Apartment */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address *</label>
          <input
            type="text"
            required
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            placeholder="Street address, P.O. box, company name, c/o"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Apartment, suite, unit, building, floor, etc. (Optional)
          </label>
          <input
            type="text"
            value={apartment}
            onChange={(e) => setApartment(e.target.value)}
            placeholder="Apt, Suite, Unit, Building"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Country & Postal Code (with Autofill trigger) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Country / Region *</label>
          <select
            value={countryCode}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
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
            <label className="text-xs font-semibold text-slate-700">
              ZIP / Postal Code {selectedCountry.postalCodeRequired && "*"}
            </label>
            <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Autofill Enabled</span>
            </span>
          </div>
          <input
            type="text"
            required={selectedCountry.postalCodeRequired}
            value={postalCode}
            onChange={(e) => handlePostalCodeChange(e.target.value)}
            placeholder={selectedCountry.postalCodeFormat || "Enter postal code"}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
          />
        </div>
      </div>

      {/* Autofill / Error Notices */}
      {autofillMessage && (
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-800 text-[11px] animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>{autofillMessage}</span>
        </div>
      )}

      {postalError && (
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-[11px]">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{postalError}</span>
        </div>
      )}

      {/* City & State (Auto-populated, editable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
          <input
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            State / Province / Emirate *
          </label>
          {selectedCountry.states.length > 0 ? (
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
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
              placeholder="State / Province"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          )}
        </div>
      </div>

      {/* Phone with Country Dial Code */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone Number *</label>
        <div className="flex items-center gap-2">
          <span className="px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs select-none">
            {selectedCountry.dialCode}
          </span>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="50 123 4567"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Make Default checkbox */}
      {showDefaultToggle && (
        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Set as default {addressType === "billing" ? "billing" : "shipping"} address</span>
          </label>
        </div>
      )}
    </div>
  );
}
