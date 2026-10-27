"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Contact,
  Truck,
  Home,
  ShoppingBag,
  PlusCircle,
  Ban,
  Eye,
  Edit2,
  Trash2,
  Mail,
  Heart,
  CreditCard,
  CheckCircle2,
  Shield,
  Phone,
  MapPin,
} from "lucide-react";
import { Customer } from "../types/customer.types";

interface Props {
  customers: Customer[];
  loading: boolean;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string, email: string) => void;
  onOpenCredit: (customer: Customer) => void;
  onToggleDeactivate: (customer: Customer) => void;
  onPreview: (customer: Customer) => void;
}

export function CustomerTable({
  customers,
  loading,
  onEdit,
  onDelete,
  onOpenCredit,
  onToggleDeactivate,
  onPreview,
}: Props) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
        Loading customer directory...
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
        No customers found matching your filter criteria.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-2xs">
      <table className="w-full text-left text-xs min-w-[980px]">
        {/* Table Header */}
        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
          <tr>
            <th className="p-3">Customer Info</th>
            <th className="p-3">Contact</th>
            <th className="p-3">Location & PIN</th>
            <th className="p-3 text-center">Addresses</th>
            <th className="p-3">Role / Account</th>
            <th className="p-3 text-center">Orders</th>
            <th className="p-3 text-center">Status</th>
            <th className="p-3 text-right">Credit (₹)</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-100">
          {customers.map((c) => {
            const phone = c.mobileNumber || c.phone;
            const hasBilling = c.addresses?.some((a) => a.type === "billing") || !!c.address;
            const hasShipping = c.addresses?.some((a) => a.type === "shipping") || !!c.shippingAddress || !!c.address;
            const locationStr = [c.city, c.state, c.postalCode].filter(Boolean).join(", ") || c.country || "India";

            return (
              <tr key={c.id} className="hover:bg-slate-50/70 transition">
                {/* Customer Info */}
                <td className="p-3 font-medium text-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                      {(c.name || c.email).substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span
                        onClick={() => onPreview(c)}
                        className="font-bold text-slate-800 hover:text-emerald-700 cursor-pointer block"
                      >
                        {c.name || `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Customer"}
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">{c.email}</span>
                    </div>
                  </div>
                </td>

                {/* Contact (Mobile Number) */}
                <td className="p-3 text-slate-700 font-mono">
                  {phone ? (
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{phone}</span>
                    </span>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>

                {/* Location & PIN */}
                <td className="p-3 text-slate-600">
                  <span className="flex items-center space-x-1" title={locationStr}>
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[140px]">{locationStr}</span>
                  </span>
                </td>

                {/* Addresses */}
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    {hasShipping && (
                      <span
                        title="Shipping address configured"
                        className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold"
                      >
                        SHIP
                      </span>
                    )}
                    {hasBilling && (
                      <span
                        title="Billing address configured"
                        className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold"
                      >
                        BILL
                      </span>
                    )}
                    {!hasShipping && !hasBilling && <span className="text-slate-300">-</span>}
                  </div>
                </td>

                {/* Role / Account Type */}
                <td className="p-3">
                  <span className="font-semibold text-slate-700 block">
                    {c.roleName || (c.assignedRoles && c.assignedRoles[0]) || c.accountType || "customer"}
                  </span>
                  <span className="text-[10px] text-slate-500">{c.customerType || "Customer"}</span>
                </td>

                {/* Orders Count */}
                <td className="p-3 text-center font-bold font-mono text-slate-700">
                  <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[11px]">
                    {c.ordersCount ?? 0}
                  </span>
                </td>

                {/* Status Toggle Badge */}
                <td className="p-3 text-center">
                  <button
                    onClick={() => onToggleDeactivate(c)}
                    title={`Click to ${c.status === "ACTIVE" ? "Deactivate" : "Activate"} account`}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                      c.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    {c.status || "ACTIVE"}
                  </button>
                </td>

                {/* Credit Balance */}
                <td className="p-3 text-right font-mono font-medium text-slate-800">
                  ₹{c.credit ? c.credit.toFixed(2) : "0.00"}
                </td>

                {/* Actions Dropdown */}
                <td className="p-3 text-right relative">
                  <div className="inline-block text-left">
                    <button
                      type="button"
                      onClick={() => setOpenDropdownId(openDropdownId === c.id ? null : c.id)}
                      className="h-7 px-3 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded flex items-center space-x-1 transition shadow-xs cursor-pointer"
                    >
                      <span>Actions</span>
                      <ChevronDown className="w-3 h-3 ml-0.5" />
                    </button>

                    {openDropdownId === c.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-left">
                        <button
                          type="button"
                          onClick={() => {
                            onPreview(c);
                            setOpenDropdownId(null);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>View Details & Addresses</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onEdit(c);
                            setOpenDropdownId(null);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Edit Customer</span>
                        </button>

                        <Link
                          href={`/admin/orders?search=${encodeURIComponent(c.email)}`}
                          onClick={() => setOpenDropdownId(null)}
                          className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-teal-600" />
                          <span>View Customer Orders</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            onToggleDeactivate(c);
                            setOpenDropdownId(null);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition"
                        >
                          <Ban className="w-3.5 h-3.5 text-amber-600" />
                          <span>{c.status === "ACTIVE" ? "Deactivate Account" : "Activate Account"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onOpenCredit(c);
                            setOpenDropdownId(null);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition font-medium"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Manage Store Credit</span>
                        </button>

                        <div className="border-t border-slate-100 my-1"></div>

                        <button
                          type="button"
                          onClick={() => {
                            onDelete(c.id, c.email);
                            setOpenDropdownId(null);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          <span>Delete Customer</span>
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
