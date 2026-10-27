"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
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
  X,
  RefreshCw,
} from "lucide-react";

interface PaymentGateway {
  id: string;
  name: string;
  code: string;
  cardTypes: string[];
  isDefault: boolean;
  isCreditCard: boolean;
  isActive: boolean;
  environment: "sandbox" | "live";
  credentials: Record<string, string>;
  description?: string;
  displayOrder: number;
}

const COMMON_CARDS = ["VISA", "Mastercard", "AMEX", "Discover", "Diners Club", "JCB", "UPI", "NetBanking", "RuPay", "Apple Pay", "Google Pay"];

export function ManageGatewaysView() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formEnv, setFormEnv] = useState<"sandbox" | "live">("sandbox");
  const [formIsCreditCard, setFormIsCreditCard] = useState(true);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formCards, setFormCards] = useState<string[]>(["VISA", "Mastercard"]);
  const [formCredentials, setFormCredentials] = useState<Record<string, string>>({});
  const [formDescription, setFormDescription] = useState("");

  const fetchGateways = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/gateways");
      const json = await res.json();
      if (json.success) {
        setGateways(json.data);
      } else {
        setError(json.error || "Failed to load gateways");
      }
    } catch {
      setError("Network error fetching gateways");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const openAddModal = () => {
    setEditingGateway(null);
    setFormName("");
    setFormCode("");
    setFormEnv("sandbox");
    setFormIsCreditCard(true);
    setFormIsActive(true);
    setFormIsDefault(false);
    setFormCards(["VISA", "Mastercard"]);
    setFormCredentials({});
    setFormDescription("");
    setIsModalOpen(true);
  };

  const openEditModal = (gw: PaymentGateway) => {
    setEditingGateway(gw);
    setFormName(gw.name);
    setFormCode(gw.code);
    setFormEnv(gw.environment);
    setFormIsCreditCard(gw.isCreditCard);
    setFormIsActive(gw.isActive);
    setFormIsDefault(gw.isDefault);
    setFormCards(gw.cardTypes || []);
    setFormCredentials(gw.credentials || {});
    setFormDescription(gw.description || "");
    setIsModalOpen(true);
  };

  const handleSetDefault = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/gateways/${id}/default`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        showNotification(`${name} is now the default payment gateway`);
        fetchGateways();
      } else {
        alert(json.error || "Failed to set default gateway");
      }
    } catch {
      alert("Error setting default gateway");
    }
  };

  const handleToggleActive = async (gw: PaymentGateway) => {
    try {
      const res = await fetch(`/api/gateways/${gw.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !gw.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        showNotification(`${gw.name} is now ${!gw.isActive ? "active" : "disabled"}`);
        fetchGateways();
      } else {
        alert(json.error || "Failed to update status");
      }
    } catch {
      alert("Error updating status");
    }
  };

  const handleDelete = async (gw: PaymentGateway) => {
    if (!confirm(`Are you sure you want to delete payment gateway "${gw.name}"?`)) return;
    try {
      const res = await fetch(`/api/gateways/${gw.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showNotification(`${gw.name} deleted successfully`);
        fetchGateways();
      } else {
        alert(json.error || "Failed to delete");
      }
    } catch {
      alert("Error deleting gateway");
    }
  };

  const toggleCardType = (card: string) => {
    if (formCards.includes(card)) {
      setFormCards(formCards.filter((c) => c !== card));
    } else {
      setFormCards([...formCards, card]);
    }
  };

  const handleCredentialChange = (key: string, val: string) => {
    setFormCredentials((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) {
      alert("Name and code are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: formName.trim(),
        code: formCode.trim().toLowerCase(),
        environment: formEnv,
        isCreditCard: formIsCreditCard,
        isActive: formIsActive,
        isDefault: formIsDefault,
        cardTypes: formCards,
        credentials: formCredentials,
        description: formDescription.trim(),
      };

      let res: Response;
      if (editingGateway) {
        res = await fetch(`/api/gateways/${editingGateway.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/gateways", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (json.success) {
        showNotification(
          editingGateway
            ? `${formName} credentials updated successfully`
            : `${formName} created successfully`
        );
        setIsModalOpen(false);
        fetchGateways();
      } else {
        alert(json.error || "Failed to save gateway");
      }
    } catch {
      alert("Error saving gateway");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header matching Screenshot 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <span>Manage Payment Gateways</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            <span className="text-indigo-600 font-medium">Settings</span> /{" "}
            <span className="text-slate-400">Payment Gateways</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchGateways}
            className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition"
            title="Refresh gateways"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Gateway</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table Card matching Screenshot 1 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Gateway Name</th>
                <th className="py-3 px-4">Cards & Methods</th>
                <th className="py-3 px-4 text-center">Default</th>
                <th className="py-3 px-4 text-center">Credit Card</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && gateways.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                      <span>Loading payment gateways...</span>
                    </div>
                  </td>
                </tr>
              ) : gateways.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No payment gateways configured. Click "Add Gateway" to get started.
                  </td>
                </tr>
              ) : (
                gateways.map((gw) => (
                  <tr
                    key={gw.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      gw.isDefault ? "bg-indigo-50/20" : ""
                    }`}
                  >
                    {/* Name */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            gw.code === "razorpay"
                              ? "bg-blue-100 text-blue-700"
                              : gw.code === "paypal"
                              ? "bg-sky-100 text-sky-800"
                              : gw.code === "paytm"
                              ? "bg-cyan-100 text-cyan-800"
                              : gw.code === "stripe"
                              ? "bg-violet-100 text-violet-800"
                              : gw.code === "authorizenet"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {gw.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span>{gw.name}</span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                              {gw.environment}
                            </span>
                          </div>
                          {gw.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1">{gw.description}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Cards */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {gw.cardTypes?.map((card, i) => (
                          <span
                            key={i}
                            className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {card}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Default Radio */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="radio"
                        name="default_gateway"
                        checked={gw.isDefault}
                        onChange={() => handleSetDefault(gw.id, gw.name)}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                        title="Set as default payment gateway"
                      />
                    </td>

                    {/* Credit Card Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {gw.isCreditCard ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">
                          No
                        </span>
                      )}
                    </td>

                    {/* Status Toggle Switch */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(gw)}
                        className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          gw.isActive ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            gw.isActive ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(gw)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="Configure credentials & options"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(gw)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete gateway"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal matching Screenshot 1 config */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-600" />
                <span>
                  {editingGateway ? `Configure ${editingGateway.name}` : "Add Payment Gateway"}
                </span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitModal} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gateway Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Razorpay"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gateway Code *</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toLowerCase())}
                    placeholder="e.g. razorpay"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Environment & Booleans */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Environment</label>
                  <select
                    value={formEnv}
                    onChange={(e) => setFormEnv(e.target.value as "sandbox" | "live")}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs"
                  >
                    <option value="sandbox">Sandbox / Test</option>
                    <option value="live">Live / Production</option>
                  </select>
                </div>

                <div className="flex flex-col justify-center">
                  <label className="text-xs font-semibold text-slate-600 mb-1">Credit Card</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={formIsCreditCard}
                      onChange={(e) => setFormIsCreditCard(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Accepts Cards</span>
                  </label>
                </div>

                <div className="flex flex-col justify-center">
                  <label className="text-xs font-semibold text-slate-600 mb-1">Active Status</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Enabled</span>
                  </label>
                </div>
              </div>

              {/* Supported Cards */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Supported Cards & Payment Methods
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_CARDS.map((card) => {
                    const selected = formCards.includes(card);
                    return (
                      <button
                        type="button"
                        key={card}
                        onClick={() => toggleCardType(card)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                          selected
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {card}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gateway Specific API Credentials */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h3 className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-500" />
                  <span>API Keys & Credentials</span>
                </h3>

                {formCode.includes("razorpay") && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Razorpay Key ID</label>
                      <input
                        type="text"
                        value={formCredentials.keyId || ""}
                        onChange={(e) => handleCredentialChange("keyId", e.target.value)}
                        placeholder="rzp_test_..."
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Razorpay Key Secret</label>
                      <input
                        type="password"
                        value={formCredentials.keySecret || ""}
                        onChange={(e) => handleCredentialChange("keySecret", e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {formCode.includes("paypal") && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">PayPal Client ID</label>
                      <input
                        type="text"
                        value={formCredentials.clientId || ""}
                        onChange={(e) => handleCredentialChange("clientId", e.target.value)}
                        placeholder="sb-paypal-client-id"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">PayPal Secret Key</label>
                      <input
                        type="password"
                        value={formCredentials.clientSecret || ""}
                        onChange={(e) => handleCredentialChange("clientSecret", e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {formCode.includes("paytm") && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Paytm Merchant ID</label>
                      <input
                        type="text"
                        value={formCredentials.merchantId || ""}
                        onChange={(e) => handleCredentialChange("merchantId", e.target.value)}
                        placeholder="PAYTM_MID_..."
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Paytm Merchant Key</label>
                      <input
                        type="password"
                        value={formCredentials.merchantKey || ""}
                        onChange={(e) => handleCredentialChange("merchantKey", e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {formCode.includes("stripe") && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Publishable Key</label>
                      <input
                        type="text"
                        value={formCredentials.publishableKey || ""}
                        onChange={(e) => handleCredentialChange("publishableKey", e.target.value)}
                        placeholder="pk_test_..."
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Secret Key</label>
                      <input
                        type="password"
                        value={formCredentials.secretKey || ""}
                        onChange={(e) => handleCredentialChange("secretKey", e.target.value)}
                        placeholder="sk_test_..."
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {formCode.includes("authorizenet") && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">API Login ID</label>
                      <input
                        type="text"
                        value={formCredentials.apiLoginId || ""}
                        onChange={(e) => handleCredentialChange("apiLoginId", e.target.value)}
                        placeholder="5k92Xp8..."
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Transaction Key</label>
                      <input
                        type="password"
                        value={formCredentials.transactionKey || ""}
                        onChange={(e) => handleCredentialChange("transactionKey", e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {formCode.includes("braintree") && (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Merchant ID</label>
                      <input
                        type="text"
                        value={formCredentials.merchantId || ""}
                        onChange={(e) => handleCredentialChange("merchantId", e.target.value)}
                        placeholder="bm7982..."
                        className="w-full px-2 py-1.5 border border-slate-300 rounded font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Public Key</label>
                      <input
                        type="text"
                        value={formCredentials.publicKey || ""}
                        onChange={(e) => handleCredentialChange("publicKey", e.target.value)}
                        placeholder="pub_live_..."
                        className="w-full px-2 py-1.5 border border-slate-300 rounded font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Private Key</label>
                      <input
                        type="password"
                        value={formCredentials.privateKey || ""}
                        onChange={(e) => handleCredentialChange("privateKey", e.target.value)}
                        placeholder="••••••"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {formCode.includes("cod") && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Instructions for Buyer</label>
                    <input
                      type="text"
                      value={formCredentials.instructions || ""}
                      onChange={(e) => handleCredentialChange("instructions", e.target.value)}
                      placeholder="e.g. Pay with cash upon delivery"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Note</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Optional note visible to customers or internal staff"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              {/* Make Default */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={formIsDefault}
                    onChange={(e) => setFormIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Set as the default payment method for checkout</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold shadow-sm flex items-center gap-1.5"
                >
                  {isSubmitting ? "Saving..." : editingGateway ? "Save Changes" : "Create Gateway"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
