"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  X,
  Search,
  LocateFixed,
  MapPin,
  User,
  Check,
  Plus,
  Home,
  Briefcase,
  Loader2,
  AlertCircle,
  Building2,
} from "lucide-react";

export interface DeliveryLocationInfo {
  label: string; // e.g. "Deliver to Mumbai - 400001" or "Deliver to Vikram - 110001"
  pincode: string;
  city: string;
  state: string;
  addressLine?: string;
  isCustom?: boolean;
}

// Popular Indian Delivery Hubs matching Flipkart / Amazon India
const POPULAR_INDIAN_HUBS = [
  { pincode: "110001", city: "New Delhi", state: "Delhi" },
  { pincode: "400001", city: "Mumbai", state: "Maharashtra" },
  { pincode: "560001", city: "Bengaluru", state: "Karnataka" },
  { pincode: "700001", city: "Kolkata", state: "West Bengal" },
  { pincode: "600001", city: "Chennai", state: "Tamil Nadu" },
  { pincode: "500001", city: "Hyderabad", state: "Telangana" },
  { pincode: "411001", city: "Pune", state: "Maharashtra" },
  { pincode: "380001", city: "Ahmedabad", state: "Gujarat" },
  { pincode: "302001", city: "Jaipur", state: "Rajasthan" },
  { pincode: "226001", city: "Lucknow", state: "Uttar Pradesh" },
  { pincode: "201301", city: "Noida", state: "Uttar Pradesh" },
  { pincode: "122001", city: "Gurugram", state: "Haryana" },
];

interface DeliveryLocationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  onLocationSelect: (location: DeliveryLocationInfo) => void;
  currentUser?: any;
}

export function DeliveryLocationDrawer({
  isOpen,
  onClose,
  currentLocation,
  onLocationSelect,
  currentUser,
}: DeliveryLocationDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Saved Addresses from API
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // New Address Quick Add Modal State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newRecipient, setNewRecipient] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddressLine, setNewAddressLine] = useState("");
  const [newCity, setNewCity] = useState("Mumbai");
  const [newState, setNewState] = useState("Maharashtra");
  const [newPincode, setNewPincode] = useState("400001");
  const [isSavingNewAddress, setIsSavingNewAddress] = useState(false);

  // Load Saved Addresses if user is authenticated
  useEffect(() => {
    if (isOpen && currentUser) {
      loadAddresses();
    }
  }, [isOpen, currentUser]);

  const loadAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const res = await fetch("/api/addresses");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSavedAddresses(json.data);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // Filtered PIN / City search results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return POPULAR_INDIAN_HUBS.filter(
      (hub) =>
        hub.pincode.includes(q) ||
        hub.city.toLowerCase().includes(q) ||
        hub.state.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Handle "Use my current location"
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          // Attempt reverse geocoding via OpenStreetMap free API
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();

          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.suburb ||
            data.address?.state_district ||
            "Mumbai";
          const state = data.address?.state || "Maharashtra";
          const pincode = data.address?.postcode || "400001";

          const location: DeliveryLocationInfo = {
            label: `Deliver to ${city} - ${pincode}`,
            pincode,
            city,
            state,
            addressLine: data.display_name?.split(",").slice(0, 2).join(",") || city,
            isCustom: true,
          };

          onLocationSelect(location);
          onClose();
        } catch {
          // Fallback if network blocked
          const defaultLoc: DeliveryLocationInfo = {
            label: "Deliver to Current Location - 400001",
            pincode: "400001",
            city: "Mumbai",
            state: "Maharashtra",
            isCustom: true,
          };
          onLocationSelect(defaultLoc);
          onClose();
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setLocationError("Location permission denied. Please search your PIN code manually.");
        } else {
          setLocationError("Unable to retrieve location. Please search by PIN code.");
        }
      },
      { timeout: 8000 }
    );
  };

  // Handle direct PIN or City selection
  const handleSelectHub = (hub: { pincode: string; city: string; state: string }) => {
    const location: DeliveryLocationInfo = {
      label: `Deliver to ${hub.city} - ${hub.pincode}`,
      pincode: hub.pincode,
      city: hub.city,
      state: hub.state,
    };
    onLocationSelect(location);
    onClose();
  };

  // Handle selecting an existing saved address
  const handleSelectAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    const location: DeliveryLocationInfo = {
      label: `Deliver to ${addr.name || "You"} - ${addr.postalCode || addr.pincode || "400001"}`,
      pincode: addr.postalCode || addr.pincode || "400001",
      city: addr.city || "",
      state: addr.state || "",
      addressLine: addr.addressLine1 || addr.streetAddress || "",
    };
    onLocationSelect(location);
    onClose();
  };

  // Handle saving a new address
  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipient || !newPhone || !newAddressLine || !newPincode) return;

    try {
      setIsSavingNewAddress(true);
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRecipient,
          phone: newPhone,
          addressLine1: newAddressLine,
          city: newCity,
          state: newState,
          postalCode: newPincode,
          country: "India",
          type: "shipping",
          isDefault: true,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        handleSelectAddress(json.data);
      }
    } catch {
      // Fallback: select locally
      handleSelectHub({ pincode: newPincode, city: newCity, state: newState });
    } finally {
      setIsSavingNewAddress(false);
      setIsAddingNew(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-2xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        {/* Flipkart-Style Slide-Over Drawer */}
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
          {/* Header matching Flipkart screenshot */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Select delivery address
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Search Input matching Flipkart UI */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by area, street name, pin code"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown if query typed */}
            {searchQuery.trim().length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden shadow-xs">
                {searchResults.length > 0 ? (
                  searchResults.map((hub) => (
                    <button
                      key={hub.pincode}
                      type="button"
                      onClick={() => handleSelectHub(hub)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50/60 flex items-center justify-between transition cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {hub.city}, {hub.state}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            PIN: {hub.pincode}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition">
                        Deliver here &rarr;
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No matching location for &quot;{searchQuery}&quot;. You can use current location or select a major hub below.
                  </div>
                )}
              </div>
            )}

            {/* "Use my current location" row matching Flipkart screenshot */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="w-full p-3.5 rounded-xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50 text-left flex items-start space-x-3 transition cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition">
                {isLocating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LocateFixed className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-blue-600 group-hover:underline">
                  {isLocating ? "Detecting your location..." : "Use my current location"}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Allow access to location for fastest delivery pin
                </div>
              </div>
            </button>

            {locationError && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{locationError}</span>
              </div>
            )}

            {/* Saved Addresses Section matching Flipkart screenshot */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Saved addresses
                </h3>
                {currentUser && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(!isAddingNew)}
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingNew ? "Cancel" : "Add New"}</span>
                  </button>
                )}
              </div>

              {!currentUser ? (
                /* Unauthenticated view matching screenshot: "Login to see saved addresses" */
                <Link
                  href="/login?callbackUrl=/"
                  onClick={onClose}
                  className="w-full p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center space-x-3.5 transition cursor-pointer group shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-blue-600 group-hover:underline">
                      Login to see saved addresses
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Fast-track orders with your doorstep delivery addresses
                    </p>
                  </div>
                </Link>
              ) : (
                /* Authenticated view: List of saved addresses with radio select */
                <div className="space-y-2.5">
                  {isLoadingAddresses ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Loading your saved addresses...
                    </div>
                  ) : savedAddresses.length > 0 ? (
                    savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr)}
                          className={`p-3.5 rounded-xl border transition cursor-pointer relative ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/30 ring-1 ring-blue-600/20"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="mt-0.5">
                              <input
                                type="radio"
                                name="saved_address"
                                checked={isSelected}
                                onChange={() => handleSelectAddress(addr)}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                              />
                            </div>
                            <div className="flex-1 text-xs">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-slate-900">{addr.name}</span>
                                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                  {addr.type || "Home"}
                                </span>
                              </div>
                              <p className="text-slate-600 mt-1 leading-snug">
                                {addr.addressLine1 || addr.streetAddress},{" "}
                                {addr.city}, {addr.state} -{" "}
                                <span className="font-mono font-bold text-slate-800">
                                  {addr.postalCode || addr.pincode}
                                </span>
                              </p>
                              {addr.phone && (
                                <p className="text-[11px] text-slate-500 mt-1">
                                  Phone: {addr.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                      No saved addresses yet. Add one below for 1-click delivery.
                    </div>
                  )}
                </div>
              )}

              {/* Add New Address Form Modal/Panel */}
              {isAddingNew && (
                <form
                  onSubmit={handleSaveNewAddress}
                  className="mt-3 p-4 rounded-xl border border-blue-200 bg-blue-50/20 space-y-3 text-xs"
                >
                  <div className="font-bold text-slate-800">Add New Delivery Address</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={newRecipient}
                      onChange={(e) => setNewRecipient(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Mobile Phone (+91)"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Street Address, House/Flat No, Area"
                    value={newAddressLine}
                    onChange={(e) => setNewAddressLine(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="PIN Code"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-blue-600"
                    />
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                    />
                    <input
                      type="text"
                      required
                      placeholder="State"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSavingNewAddress}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                  >
                    {isSavingNewAddress ? "Saving..." : "Save and Deliver Here"}
                  </button>
                </form>
              )}
            </div>

            {/* Popular Major Indian Cities Hubs */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Popular Delivery Hubs
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_INDIAN_HUBS.slice(0, 8).map((hub) => (
                  <button
                    key={hub.pincode}
                    type="button"
                    onClick={() => handleSelectHub(hub)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/30 text-left transition cursor-pointer group"
                  >
                    <div className="font-bold text-xs text-slate-800 group-hover:text-blue-600">
                      {hub.city}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      PIN {hub.pincode}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Active Selection Status */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/80 text-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Active Delivery Destination
              </span>
              <span className="font-bold text-slate-800 truncate block max-w-[280px]">
                {currentLocation || "Delivering to India"}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
