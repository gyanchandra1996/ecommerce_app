"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Shield,
  MapPin,
  Truck,
  Calendar,
  CreditCard,
  ShoppingBag,
  Phone,
  CheckCircle2,
  Clock,
  Edit2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Customer } from "../types/customer.types";
import { AddressRecord, OrderRecord } from "@/core/db/store";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onEdit?: (customer: Customer) => void;
}

export function CustomerDetailModal({ isOpen, onClose, customer, onEdit }: Props) {
  const [customerOrders, setCustomerOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (isOpen && customer?.email) {
      setLoadingOrders(true);
      fetch(`/api/orders?search=${encodeURIComponent(customer.email)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.data) {
            const list = Array.isArray(json.data) ? json.data : json.data.orders || [];
            setCustomerOrders(list);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingOrders(false));
    }
  }, [isOpen, customer?.email]);

  if (!isOpen || !customer) return null;

  const billingAddr = customer.addresses?.find((a) => a.type === "billing" && a.isDefault) ||
    customer.addresses?.find((a) => a.type === "billing");
  const shippingAddr = customer.addresses?.find((a) => a.type === "shipping" && a.isDefault) ||
    customer.addresses?.find((a) => a.type === "shipping");

  const phone = customer.mobileNumber || customer.phone || "Not provided";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              {(customer.name || customer.email).substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-800">{customer.name || customer.email}</h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    customer.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {customer.status || "ACTIVE"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {customer.customerType || "Customer Account"} • {customer.email}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(customer);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center space-x-1 border border-emerald-200 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Key Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-slate-500 text-[11px] block">Mobile Number</span>
              <span className="font-semibold text-slate-800 font-mono flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                {phone}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Security Role</span>
              <span className="font-semibold text-indigo-700 block mt-0.5">
                {customer.roleName || (customer.assignedRoles && customer.assignedRoles[0]) || customer.accountType || "Standard Customer"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Store Credit</span>
              <span className="font-bold text-emerald-700 font-mono text-sm block mt-0.5">
                ₹{customer.credit ? customer.credit.toFixed(2) : "0.00"} INR
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Total Orders</span>
              <span className="font-bold text-slate-800 font-mono text-sm block mt-0.5">
                {customerOrders.length || customer.ordersCount || 0}
              </span>
            </div>
          </div>

          {/* Saved Addresses Section */}
          <div className="space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-[11px] text-slate-500 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Saved Customer Addresses (Addresses Database)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Shipping Address */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="font-bold text-slate-700 flex items-center space-x-1">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Default Shipping Address</span>
                  </span>
                  <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold">
                    SHIPPING
                  </span>
                </div>
                {shippingAddr ? (
                  <div className="text-slate-600 leading-relaxed text-[11px]">
                    <p className="font-semibold text-slate-800">{shippingAddr.name}</p>
                    <p>{shippingAddr.addressLine1}</p>
                    {shippingAddr.addressLine2 && <p>{shippingAddr.addressLine2}</p>}
                    <p>
                      {shippingAddr.city}, {shippingAddr.state} - <span className="font-mono font-semibold">{shippingAddr.postalCode}</span>
                    </p>
                    <p className="font-medium text-slate-700">{shippingAddr.country}</p>
                    {shippingAddr.phone && <p className="text-slate-500">Phone: {shippingAddr.phone}</p>}
                  </div>
                ) : customer.shippingAddress || customer.address ? (
                  <div className="text-slate-600 text-[11px]">
                    <p>{customer.shippingAddress || customer.address}</p>
                    {customer.city && (
                      <p>
                        {customer.city}, {customer.state} {customer.postalCode}
                      </p>
                    )}
                    <p>{customer.country || "India"}</p>
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">No shipping address configured.</p>
                )}
              </div>

              {/* Billing Address */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="font-bold text-slate-700 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Default Billing Address</span>
                  </span>
                  <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded text-[9px] font-bold">
                    BILLING
                  </span>
                </div>
                {billingAddr ? (
                  <div className="text-slate-600 leading-relaxed text-[11px]">
                    <p className="font-semibold text-slate-800">{billingAddr.name}</p>
                    <p>{billingAddr.addressLine1}</p>
                    {billingAddr.addressLine2 && <p>{billingAddr.addressLine2}</p>}
                    <p>
                      {billingAddr.city}, {billingAddr.state} - <span className="font-mono font-semibold">{billingAddr.postalCode}</span>
                    </p>
                    <p className="font-medium text-slate-700">{billingAddr.country}</p>
                    {billingAddr.phone && <p className="text-slate-500">Phone: {billingAddr.phone}</p>}
                  </div>
                ) : customer.address ? (
                  <div className="text-slate-600 text-[11px]">
                    <p>{customer.address}</p>
                    {customer.city && (
                      <p>
                        {customer.city}, {customer.state} {customer.postalCode}
                      </p>
                    )}
                    <p>{customer.country || "India"}</p>
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">Same as shipping address or not specified.</p>
                )}
              </div>
            </div>
          </div>

          {/* Customer Orders History */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold uppercase tracking-wider text-[11px] text-slate-500 flex items-center space-x-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Recent Customer Orders ({customerOrders.length})</span>
              </h3>
            </div>

            {loadingOrders ? (
              <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                Loading order history...
              </div>
            ) : customerOrders.length === 0 ? (
              <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                No orders placed by this customer yet.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Order #</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Gateway</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customerOrders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/70">
                        <td className="p-2.5 font-bold text-slate-800">{ord.orderNumber}</td>
                        <td className="p-2.5 text-slate-500">{ord.orderDate ? new Date(ord.orderDate).toLocaleDateString() : "Recent"}</td>
                        <td className="p-2.5 text-slate-700">{ord.gateway}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              ord.paymentStatus === "Paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-800">
                          ₹{ord.totalPrice ? ord.totalPrice.toFixed(2) : "0.00"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
