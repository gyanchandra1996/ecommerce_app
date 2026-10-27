"use client";

import React, { useState } from "react";
import { X, CreditCard, Plus, Minus, Loader2 } from "lucide-react";
import { Customer } from "../types/customer.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onCreditUpdated: () => void;
}

export function CreditModal({ isOpen, onClose, customer, onCreditUpdated }: Props) {
  const [amount, setAmount] = useState("");
  const [operation, setOperation] = useState<"add" | "deduct">("add");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !customer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError("Please enter a positive numeric credit amount.");
      return;
    }

    setLoading(true);
    setError(null);

    const delta = operation === "add" ? val : -val;

    try {
      const res = await fetch(`/api/customers/${customer.id}/credit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: delta }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update credit");

      onCreditUpdated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Credit update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Adjust Customer Credit</h2>
              <p className="text-xs text-slate-500">{customer.email}</p>
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
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-600">Current Balance:</span>
            <span className="text-base font-bold text-slate-800 font-mono">
              ₹{customer.credit ? customer.credit.toFixed(2) : "0.00"} INR
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOperation("add")}
              className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center space-x-1 transition ${
                operation === "add"
                  ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Add Credit</span>
            </button>
            <button
              type="button"
              onClick={() => setOperation("deduct")}
              className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center space-x-1 transition ${
                operation === "deduct"
                  ? "bg-red-50 border-red-500 text-red-800 shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Minus className="w-3.5 h-3.5 text-red-600" />
              <span>Deduct Credit</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount ($) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
              <span>Confirm Adjustment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
