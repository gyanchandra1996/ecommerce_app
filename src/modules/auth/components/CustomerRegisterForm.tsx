"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Sparkles,
  Eye,
  EyeOff,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { COUNTRIES, lookupPostalCode, validatePostalCode } from "@/core/utils/postal-autofill";

export function CustomerRegisterForm() {
  const router = useRouter();

  // Basic Account Credentials
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Phone with Country Code
  const [countryCode, setCountryCode] = useState("IN");
  const [mobileNumber, setMobileNumber] = useState("");

  // Address Fields with Autofill
  const [streetAddress, setStreetAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [state, setState] = useState("Maharashtra");
  const [postalCode, setPostalCode] = useState("400001");

  // Autofill helpers
  const [autofillNotice, setAutofillNotice] = useState<string | null>(null);
  const [postalError, setPostalError] = useState<string | null>(null);

  // Submission & Validation States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  const handleCountryChange = (newCode: string) => {
    setCountryCode(newCode);
    const newCountry = COUNTRIES.find((c) => c.code === newCode);
    if (newCountry && newCountry.states.length > 0) {
      setState(newCountry.states[0]);
    } else {
      setState("");
    }
    setCity("");
    setPostalCode("");
    setAutofillNotice(null);
    setPostalError(null);
  };

  const handlePostalCodeChange = (code: string) => {
    setPostalCode(code);
    setPostalError(null);

    if (!code.trim()) {
      setAutofillNotice(null);
      return;
    }

    const val = validatePostalCode(countryCode, code);
    if (!val.valid) {
      setPostalError(val.error || null);
    }

    const lookup = lookupPostalCode(countryCode, code);
    if (lookup.success) {
      if (lookup.city) setCity(lookup.city);
      if (lookup.state) setState(lookup.state);
      setAutofillNotice(lookup.message || "City & State populated!");
    } else {
      setAutofillNotice(lookup.message || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!mobileNumber.trim()) {
      setError("Please enter your mobile phone number.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!streetAddress.trim()) {
      setError("Please enter your street address.");
      return;
    }
    if (!city.trim()) {
      setError("Please enter your city.");
      return;
    }

    const postalValidation = validatePostalCode(countryCode, postalCode);
    if (!postalValidation.valid) {
      setError(postalValidation.error || "Please enter a valid postal code.");
      return;
    }

    setLoading(true);

    try {
      const fullMobile = `${selectedCountry.dialCode} ${mobileNumber.trim()}`;
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          confirmPassword,
          role: "CUSTOMER",
          accountType: "customer",
          mobileNumber: fullMobile,
          countryCode: selectedCountry.dialCode,
          country: selectedCountry.name,
          state,
          city,
          postalCode,
          streetAddress,
          apartment,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || json.error || "Failed to create customer account.");
      }

      setRegisteredSuccess(true);
      setTimeout(() => {
        router.push("/customer/dashboard");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 mb-3">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Customer Account</h1>
        <p className="text-xs text-slate-500 mt-1">
          Register to view your orders, saved addresses, wishlists, and checkout faster.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {registeredSuccess && (
        <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Account created successfully! Redirecting to your customer dashboard...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        {/* Section 1: Personal & Account Credentials */}
        <div className="border-b border-slate-100 pb-4 space-y-3">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-600" />
            <span>Personal Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Gyanchandra Kumar"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Mobile with country code */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mobile Number with Country Code *
            </label>
            <div className="flex items-center gap-2">
              <select
                value={countryCode}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="px-2 py-2 border border-slate-300 rounded-lg bg-slate-50 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.dialCode} ({c.name})
                  </option>
                ))}
              </select>

              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="50 123 4567"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 pr-9 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Address with Country, State, and ZIP Autofill */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>Primary Address (For Deliveries & Checkout)</span>
            </h2>
            <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              <span>ZIP Autofill</span>
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address *</label>
            <input
              type="text"
              required
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="Villa 14B, Street 22A, Building 4"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Apartment, suite, unit, floor, etc. (Optional)
            </label>
            <input
              type="text"
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
              placeholder="Suite 402, Landmark / Gate 3"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

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
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ZIP / Postal Code {selectedCountry.postalCodeRequired ? "*" : "(Optional)"}
              </label>
              <input
                type="text"
                required={selectedCountry.postalCodeRequired}
                value={postalCode}
                onChange={(e) => handlePostalCodeChange(e.target.value)}
                placeholder={selectedCountry.postalCodeFormat || "e.g. 12345"}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
              />
            </div>
          </div>

          {autofillNotice && (
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-800 text-[11px] animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>{autofillNotice}</span>
            </div>
          )}

          {postalError && (
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{postalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mumbai"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State / Province *</label>
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
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || registeredSuccess}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? "Creating Account..." : "Create Account & Continue"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 font-bold hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
