"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Truck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  Globe,
  Key,
  Lock,
  MapPin,
  Sliders,
  ShieldCheck,
} from "lucide-react";

interface Props {
  providerId?: string;
}

export function ShippingProviderForm({ providerId }: Props) {
  const router = useRouter();
  const isEditing = Boolean(providerId);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState("https://apiv2.shiprocket.in/v1/external");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [clientId, setClientId] = useState("");
  const [pickupLocation, setPickupLocation] = useState("Main Warehouse Mumbai");
  const [defaultCourier, setDefaultCourier] = useState("BlueDart Express Air");
  const [expressDelivery, setExpressDelivery] = useState(false);
  const [autoLabelGenerate, setAutoLabelGenerate] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [customConfigJson, setCustomConfigJson] = useState("{}");

  // UI state
  const [loading, setLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Test Connection
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Pre-fill templates based on provider code
  const handleCodeChange = (newCode: string) => {
    const val = newCode.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    setCode(val);

    if (!isEditing) {
      if (val === "shiprocket") {
        setName((prev) => prev || "Shiprocket");
        setApiBaseUrl("https://apiv2.shiprocket.in/v1/external");
        setDefaultCourier("BlueDart Express Air");
      } else if (val === "nimbuspost") {
        setName((prev) => prev || "NimbusPost");
        setApiBaseUrl("https://api.nimbuspost.com/v1");
        setDefaultCourier("NimbusPost Priority Network");
      } else if (val === "delhivery") {
        setName((prev) => prev || "Delhivery");
        setApiBaseUrl("https://track.delhivery.com/api/");
        setDefaultCourier("Delhivery Surface Standard");
      }
    }
  };

  // Fetch provider if editing
  useEffect(() => {
    if (!providerId) return;
    const fetchExisting = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/shipping/providers/${providerId}`);
        const json = await res.json();
        if (json.success && json.data) {
          const p = json.data;
          setName(p.name || "");
          setCode(p.code || "");
          setApiBaseUrl(p.apiBaseUrl || "");
          setPickupLocation(p.pickupLocation || p.settings?.pickupLocation || "");
          setIsEnabled(Boolean(p.isEnabled));
          setIsDefault(Boolean(p.isDefault));

          const creds = p.credentials || {};
          setApiKey(creds.apiKey || creds.email || creds.apiToken || "");
          setApiSecret(creds.password || creds.apiSecret || creds.clientSecret || "");
          setClientId(creds.clientId || "");

          const settings = p.settings || {};
          setDefaultCourier(settings.defaultCourier || "Standard Courier");
          setExpressDelivery(Boolean(settings.expressDelivery));
          setAutoLabelGenerate(Boolean(settings.autoLabelGenerate));

          const customOnly = { ...settings };
          delete customOnly.defaultCourier;
          delete customOnly.expressDelivery;
          delete customOnly.autoLabelGenerate;
          delete customOnly.pickupLocation;
          setCustomConfigJson(JSON.stringify(customOnly, null, 2));
        } else {
          setErrorMsg(json.error || "Failed to load provider");
        }
      } catch {
        setErrorMsg("Failed to load provider configuration.");
      } finally {
        setLoading(false);
      }
    };
    fetchExisting();
  }, [providerId]);

  // Test connection directly from form data
  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);
      setErrorMsg(null);

      let parsedCustom = {};
      try {
        parsedCustom = JSON.parse(customConfigJson || "{}");
      } catch {
        // ignore
      }

      const payload = {
        code: code || "custom",
        providerId,
        apiBaseUrl,
        credentials: {
          apiKey,
          apiSecret,
          clientId,
          email: apiKey.includes("@") ? apiKey : undefined,
          password: apiSecret,
          apiToken: apiKey,
        },
        settings: {
          ...parsedCustom,
          pickupLocation,
          defaultCourier,
          expressDelivery,
          autoLabelGenerate,
        },
      };

      const res = await fetch("/api/shipping/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      setTestResult({
        success: Boolean(json.success),
        message: json.message || (json.success ? "Connection established successfully!" : json.error || "Failed"),
      });
    } catch {
      setTestResult({
        success: false,
        message: "Failed to connect to provider API.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      if (!name.trim() || !code.trim()) {
        setErrorMsg("Provider Name and Code are required.");
        setIsSubmitting(false);
        return;
      }

      let parsedCustom = {};
      try {
        parsedCustom = JSON.parse(customConfigJson || "{}");
      } catch {
        setErrorMsg("Custom configuration must be valid JSON.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        name: name.trim(),
        code: code.trim().toLowerCase(),
        apiBaseUrl: apiBaseUrl.trim(),
        pickupLocation: pickupLocation.trim(),
        isEnabled,
        isDefault,
        credentials: {
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim(),
          clientId: clientId.trim(),
          email: apiKey.includes("@") ? apiKey.trim() : undefined,
          password: apiSecret.trim(),
          apiToken: apiKey.trim(),
        },
        settings: {
          ...parsedCustom,
          pickupLocation: pickupLocation.trim(),
          defaultCourier: defaultCourier.trim(),
          expressDelivery,
          autoLabelGenerate,
        },
      };

      const endpoint = isEditing ? `/api/shipping/providers/${providerId}` : "/api/shipping/providers";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(isEditing ? "Provider updated successfully!" : "Provider created successfully!");
        setTimeout(() => {
          router.push("/admin/shipping/providers");
        }, 1200);
      } else {
        setErrorMsg(json.error || "Failed to save provider");
      }
    } catch {
      setErrorMsg("An unexpected error occurred while saving provider.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span>Loading provider details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/shipping/providers"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600" />
              <span>{isEditing ? `Edit Shipping Provider: ${name}` : "Add New Shipping Provider"}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure credentials, API base URL, pickup location and courier routing.
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Basic Provider Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>1. Provider Identification</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Provider Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Provider Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shiprocket, NimbusPost, Delhivery"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Provider Code */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Provider Code (Slug) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isEditing}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="e.g. shiprocket, nimbuspost, delhivery, custom"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono disabled:bg-slate-100 disabled:text-slate-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Unique identifier used by system adapters and database lookup.
              </span>
            </div>

            {/* API Base URL */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                API Base URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                required
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                placeholder="https://apiv2.shiprocket.in/v1/external"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
              />
            </div>

            {/* Pickup Location */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Pickup Location Name / Warehouse Code</span>
              </label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. Primary Warehouse Mumbai (Hub 1)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Security & Credentials */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-600" />
              <span>2. API Authentication & Credentials</span>
            </h2>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Encrypted at Rest</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* API Key / Token / Registered Email */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                API Key / Client ID / Account Email
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter API Key, Bearer Token or Account Email"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
              />
            </div>

            {/* API Secret / Password */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                API Secret / Password
              </label>
              <input
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder={isEditing ? "•••••••• (Leave blank to keep current secret)" : "Enter secret / password"}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
              />
            </div>

            {/* Optional Client ID */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Client ID / Merchant Identifier (Optional)
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="e.g. DELHIVERY_CLIENT_101 or Shiprocket App ID"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Provider-Specific Configuration & Settings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>3. Courier Routing & Operational Settings</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Default Courier Service */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default Courier Routing Service
              </label>
              <input
                type="text"
                value={defaultCourier}
                onChange={(e) => setDefaultCourier(e.target.value)}
                placeholder="e.g. BlueDart Express Air, Delhivery Surface, Shadowfax"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>

            {/* Auto Label Generation Toggle */}
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="autoLabel"
                checked={autoLabelGenerate}
                onChange={(e) => setAutoLabelGenerate(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <label htmlFor="autoLabel" className="font-semibold text-slate-700 cursor-pointer">
                Auto-generate printable AWB shipping labels upon dispatch
              </label>
            </div>

            {/* Express Delivery Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="express"
                checked={expressDelivery}
                onChange={(e) => setExpressDelivery(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <label htmlFor="express" className="font-semibold text-slate-700 cursor-pointer">
                Priority / Air Express Mode (faster transit times)
              </label>
            </div>

            {/* Custom JSON Config */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Advanced Provider Configuration (JSON)
              </label>
              <textarea
                rows={3}
                value={customConfigJson}
                onChange={(e) => setCustomConfigJson(e.target.value)}
                placeholder='{ "channel": "Custom", "trackingUrlTemplate": "https://..." }'
                className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Activation & Defaults */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
            4. Status & Activation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
              <input
                type="checkbox"
                id="isEnabled"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <label htmlFor="isEnabled" className="font-bold text-slate-800 cursor-pointer block">
                  Active & Enabled for Dispatch
                </label>
                <span className="text-[11px] text-slate-500">
                  When enabled, this provider appears as a selectable courier in the backend order dispatch modal.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <label htmlFor="isDefault" className="font-bold text-slate-800 cursor-pointer block">
                  Set as Default Provider
                </label>
                <span className="text-[11px] text-slate-500">
                  Automatically pre-selected for single-click order fulfillment. Only one default allowed.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons & Test Connection */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Test Connection Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isTesting ? "animate-spin" : ""}`} />
              <span>{isTesting ? "Testing Connection..." : "Test Connection"}</span>
            </button>

            {testResult && (
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-md animate-in fade-in ${
                  testResult.success
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {testResult.success ? "✓ " : "✕ "}
                {testResult.message}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/shipping/providers"
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "Saving Provider..." : isEditing ? "Save Changes" : "Create Shipping Provider"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
