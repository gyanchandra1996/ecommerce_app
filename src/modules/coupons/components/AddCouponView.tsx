"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ticket, Check, X, AlertCircle, ArrowLeft } from "lucide-react";

export function AddCouponView() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State matching Screenshot 4 & 5
  const [formData, setFormData] = useState({
    code: "",
    expiryDate: "",
    usageLimit: 0,
    couponType: "%Off Total Order",
    discountPercentage: 0,
    minAmount: 0,
    discountAmount: 0,
    selectedUsers: "",
    selectedTemplate: "",
    usageLimitPerCustomer: 1,
    isActive: true,
  });

  const couponTypes = [
    "%Off Total Order",
    "%Off Total Order > Amount specified",
    "%Off on Specific Multiple Items",
    "%Off on Specific Multiple Categories",
    "$Discount on Total Order",
    "$Discount on Total Order > Amount specified",
    "$Discount on Specific Multiple Items",
    "$Discount on Specific Multiple Categories",
    "Free shipping for the order",
    "Free Shipping for order greater than Specified amount",
    "Free Shipping for Specific Multiple Items",
  ];

  const templates = [
    "Select Template",
    "Welcome New Customers (10% Off)",
    "VIP Flash Sale (20% Off)",
    "Holiday Special ($15 Off)",
    "Free Shipping Voucher",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.code.trim()) {
      setErrorMsg("Coupon Code is required.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code.toUpperCase().trim(),
          couponType: formData.couponType,
          discountPercentage: Number(formData.discountPercentage) || 0,
          discountAmount: Number(formData.discountAmount) || 0,
          minAmount: Number(formData.minAmount) || 0,
          expiryDate: formData.expiryDate || undefined,
          usageLimit: Number(formData.usageLimit) || 0,
          usageLimitPerCustomer: Number(formData.usageLimitPerCustomer) || 1,
          selectedUsers: formData.selectedUsers
            ? formData.selectedUsers.split(",").map((s) => s.trim())
            : [],
          selectedTemplate: formData.selectedTemplate,
          isActive: formData.isActive,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create coupon");
      }

      router.push("/admin/coupons");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while creating coupon.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb matching Screenshot 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Ticket className="w-5 h-5 text-emerald-600" />
            <span>Add Coupon</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            <span className="text-emerald-600 font-medium">Marketing</span> /{" "}
            <Link href="/admin/coupons" className="text-slate-600 hover:text-emerald-600">
              Coupon
            </Link>{" "}
            / <span className="text-slate-400">Add Coupon</span>
          </p>
        </div>

        <Link
          href="/admin/coupons"
          className="h-8 px-3.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md shadow-xs flex items-center space-x-1.5 transition self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Coupons</span>
        </Link>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form Card matching Screenshot 4 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        {/* Row 1: Coupon Code, Expiry Date, Coupon Usage Count */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Coupon Code :<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              required
              placeholder="e.g. SUMMER25"
              value={formData.code}
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 uppercase font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Expiry Date: (if empty never Expires)
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              placeholder="MM/DD/YYYY"
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Coupon Usage Count: (No limit Usage)
            </label>
            <input
              type="number"
              min="0"
              name="usageLimit"
              value={formData.usageLimit || ""}
              placeholder="0 for unlimited"
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Row 2: Coupon Type dropdown matching Screenshot 5 */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Coupon Type
          </label>
          <select
            name="couponType"
            value={formData.couponType}
            onChange={handleChange}
            className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          >
            {couponTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Row 3: Discount Percentage, Minimum Amount for Discount, Discount Amount */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Discount Percentage :<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              name="discountPercentage"
              value={formData.discountPercentage}
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Minimum Amount for Discount:*
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              name="minAmount"
              value={formData.minAmount}
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Discount Amount :*
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              name="discountAmount"
              value={formData.discountAmount}
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Row 4: Select Coupon Users, Select Coupon Template, Usage Count Per Customer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Coupon Users :
            </label>
            <input
              type="text"
              name="selectedUsers"
              value={formData.selectedUsers}
              onChange={handleChange}
              placeholder="Select Users For this Coupon"
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Coupon Template :
            </label>
            <select
              name="selectedTemplate"
              value={formData.selectedTemplate}
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              {templates.map((tpl) => (
                <option key={tpl} value={tpl === "Select Template" ? "" : tpl}>
                  {tpl}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Coupon Usage Count Per Customer
            </label>
            <input
              type="number"
              min="1"
              name="usageLimitPerCustomer"
              value={formData.usageLimitPerCustomer}
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Row 5: Active Status Checkbox matching Screenshot 4 */}
        <div className="pt-2 flex items-center space-x-2">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-800">Active Status</span>
          </label>
        </div>

        {/* Bottom Actions matching Screenshot 4 */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
          <Link
            href="/admin/coupons"
            className="h-9 px-5 text-xs font-semibold text-slate-700 bg-slate-600 hover:bg-slate-700 text-white rounded-md shadow-xs flex items-center space-x-1.5 transition"
          >
            <span>Cancel</span>
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="h-9 px-6 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-md shadow-xs flex items-center space-x-1.5 transition"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{submitting ? "Adding..." : "Add"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
