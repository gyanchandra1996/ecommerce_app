"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
  Shield,
  Key,
  Globe,
  Settings,
  RefreshCw,
  MapPin,
  ExternalLink,
  Sliders,
  Send,
} from "lucide-react";

export interface ShippingProvider {
  id: string;
  name: string;
  code: string;
  apiBaseUrl: string;
  credentials: Record<string, any>;
  settings: Record<string, any>;
  isEnabled: boolean;
  isDefault: boolean;
  pickupLocation?: string;
  rawConfigured?: boolean;
}

export function ShippingProvidersView() {
  const [providers, setProviders] = useState<ShippingProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Testing connection state
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/shipping/providers");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProviders(json.data);
      } else {
        setError(json.error || "Failed to load shipping providers");
      }
    } catch {
      setError("An unexpected error occurred while fetching shipping providers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleToggle = async (provider: ShippingProvider) => {
    try {
      const res = await fetch(`/api/shipping/providers/${provider.id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !provider.isEnabled }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message);
        setTimeout(() => setSuccessMsg(null), 3000);
        fetchProviders();
      } else {
        setError(json.error || "Failed to update provider status");
      }
    } catch {
      setError("Failed to toggle provider");
    }
  };

  const handleSetDefault = async (provider: ShippingProvider) => {
    try {
      const res = await fetch(`/api/shipping/providers/${provider.id}/default`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message);
        setTimeout(() => setSuccessMsg(null), 3000);
        fetchProviders();
      } else {
        setError(json.error || "Failed to set default provider");
      }
    } catch {
      setError("Failed to set default provider");
    }
  };

  const handleTestConnection = async (provider: ShippingProvider) => {
    try {
      setTestingId(provider.id);
      setTestResult(null);
      const res = await fetch(`/api/shipping/providers/${provider.id}/test-connection`, {
        method: "POST",
      });
      const json = await res.json();
      setTestResult({
        id: provider.id,
        success: Boolean(json.success),
        message: json.message || (json.success ? "Connection verified!" : json.error || "Failed"),
      });
    } catch {
      setTestResult({
        id: provider.id,
        success: false,
        message: "Network error during connection test",
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleDelete = async (provider: ShippingProvider) => {
    if (!confirm(`Are you sure you want to delete or disable ${provider.name}?`)) return;
    try {
      const res = await fetch(`/api/shipping/providers/${provider.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message);
        setTimeout(() => setSuccessMsg(null), 3500);
        fetchProviders();
      } else {
        setError(json.error || "Failed to delete provider");
      }
    } catch {
      setError("Error deleting provider");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            <span>Shipping Providers & Integrations</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure dynamic shipping carriers (Shiprocket, NimbusPost, Delhivery) and custom logistics adapters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchProviders}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/shipping/settings"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Settings</span>
          </Link>

          <Link
            href="/admin/shipping/providers/create"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Provider</span>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 text-xs">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Configured Providers</div>
            <div className="text-xl font-black text-slate-800">{providers.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-emerald-600 uppercase">Active for Dispatch</div>
            <div className="text-xl font-black text-emerald-800">{providers.filter((p) => p.isEnabled).length}</div>
          </div>
        </div>

        <Link
          href="/admin/shipping/zones"
          className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:border-indigo-300 transition group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase group-hover:text-indigo-600">
              Zones & Rates →
            </div>
            <div className="text-xs font-bold text-slate-700">Manage Pricing Slabs</div>
          </div>
        </Link>

        <Link
          href="/admin/shipping/tracking"
          className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:border-indigo-300 transition group"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase group-hover:text-indigo-600">
              Shipments & Tracking →
            </div>
            <div className="text-xs font-bold text-slate-700">Live Order Queue</div>
          </div>
        </Link>
      </div>

      {/* Providers Table / Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800">Integrated Providers ({providers.length})</h2>
          </div>
          <span className="text-xs text-slate-500">Only enabled providers appear in Order Dispatch</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading shipping providers...</span>
          </div>
        ) : providers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <Truck className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">No shipping providers found</p>
            <p className="text-slate-400">Click &ldquo;Add Provider&rdquo; above to configure your first courier.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px]">
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Code / Slug</th>
                  <th className="py-3 px-4">API Endpoint</th>
                  <th className="py-3 px-4">Pickup Location</th>
                  <th className="py-3 px-4 text-center">Default</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {providers.map((p) => {
                  const isCurrentDefault = p.isDefault;
                  const isTesting = testingId === p.id;
                  const resultForThis = testResult && testResult.id === p.id ? testResult : null;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      {/* Name & Badge */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                          <span>{p.name}</span>
                          {isCurrentDefault && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {p.settings?.defaultCourier || "Standard Routing"}
                        </span>
                      </td>

                      {/* Code */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-bold">{p.code}</span>
                      </td>

                      {/* API Base URL */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-[220px] truncate" title={p.apiBaseUrl}>
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px] truncate">{p.apiBaseUrl}</span>
                        </div>
                      </td>

                      {/* Pickup Hub */}
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">
                            {p.pickupLocation || p.settings?.pickupLocation || "Store Main Hub"}
                          </span>
                        </div>
                      </td>

                      {/* Default Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        {isCurrentDefault ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-indigo-700 font-bold">
                            <Check className="w-3.5 h-3.5" />
                            <span>Primary</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetDefault(p)}
                            className="text-[11px] text-slate-500 hover:text-indigo-600 hover:underline font-semibold"
                          >
                            Set Default
                          </button>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggle(p)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                            p.isEnabled
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${p.isEnabled ? "bg-emerald-600" : "bg-slate-400"}`} />
                          <span>{p.isEnabled ? "Enabled" : "Disabled"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Test Connection Button */}
                          <button
                            onClick={() => handleTestConnection(p)}
                            disabled={isTesting}
                            title="Test API Connection"
                            className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded text-[11px] font-semibold transition flex items-center gap-1"
                          >
                            <RefreshCw className={`w-3 h-3 text-slate-500 ${isTesting ? "animate-spin" : ""}`} />
                            <span>{isTesting ? "Testing..." : "Test"}</span>
                          </button>

                          {/* Edit */}
                          <Link
                            href={`/admin/shipping/providers/${p.id}/edit`}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit Provider"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(p)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete or Disable Provider"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Test Connection Result Notice */}
                        {resultForThis && (
                          <div
                            className={`mt-1.5 text-[10px] text-right font-medium animate-in fade-in ${
                              resultForThis.success ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {resultForThis.success ? "✓ " : "✕ "}
                            {resultForThis.message}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
