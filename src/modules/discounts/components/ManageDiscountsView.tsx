"use client";

import React, { useState, useEffect } from "react";
import { Plus, Tag, Trash2, Edit2, Check, X, Calendar, Percent } from "lucide-react";

interface Discount {
  id: string;
  itemNo: string;
  productId?: string;
  productName: string;
  discountType: "%" | "$" | "PERCENT" | "FIXED";
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface ProductOption {
  id: string;
  sku: string;
  name: string;
  price: number;
}

export function ManageDiscountsView() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    itemNo: "",
    productName: "",
    discountType: "%" as "%" | "$",
    discountValue: 10,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0],
    isActive: true,
  });

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/discounts");
      const json = await res.json();
      if (json.success && json.data) {
        setDiscounts(json.data);
      }
    } catch (err) {
      console.error("Error fetching discounts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const json = await res.json();
      if (json.data) {
        setProducts(
          json.data.map((p: any) => ({
            id: p.id,
            sku: p.sku,
            name: p.name,
            price: p.price,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
  }, []);

  const openAddModal = () => {
    const defaultProd = products[0];
    setFormData({
      itemNo: defaultProd ? defaultProd.sku : "",
      productName: defaultProd ? defaultProd.name : "",
      discountType: "%",
      discountValue: 15,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0],
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleProductSelect = (sku: string) => {
    const prod = products.find((p) => p.sku === sku);
    if (prod) {
      setFormData((prev) => ({
        ...prev,
        itemNo: prod.sku,
        productName: prod.name,
      }));
    } else {
      setFormData((prev) => ({ ...prev, itemNo: sku }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemNo || !formData.productName) return;

    try {
      setSaving(true);
      const res = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        fetchDiscounts();
      }
    } catch (err) {
      console.error("Error saving discount:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (discount: Discount) => {
    try {
      const res = await fetch(`/api/discounts/${discount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !discount.isActive }),
      });
      if (res.ok) fetchDiscounts();
    } catch (err) {
      console.error("Error toggling discount active status:", err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove discount for "${name}"?`)) return;
    try {
      const res = await fetch(`/api/discounts/${id}`, { method: "DELETE" });
      if (res.ok) fetchDiscounts();
    } catch (err) {
      console.error("Error deleting discount:", err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Breadcrumb matching Screenshot 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-600" />
            <span>Manage Discount</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            <span className="text-emerald-600 font-medium">Product</span> /{" "}
            <span className="text-slate-400">Manage Discount</span>
          </p>
        </div>

        {/* Action Button matching Screenshot 3 */}
        <button
          onClick={openAddModal}
          className="h-8 px-3.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm flex items-center space-x-1.5 transition self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Discount</span>
        </button>
      </div>

      {/* Main Table matching Screenshot 3 */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Item No</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-center">Discount type</th>
                <th className="py-3 px-4 text-right">Discount</th>
                <th className="py-3 px-4">Start date</th>
                <th className="py-3 px-4">End date</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading discounts...
                  </td>
                </tr>
              ) : discounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No discounts configured. Click &quot;+ Add Discount&quot; to create one.
                  </td>
                </tr>
              ) : (
                discounts.map((disc) => {
                  // Active discount rows have distinct light green highlight background matching Screenshot 3!
                  const isActive = disc.isActive;
                  return (
                    <tr
                      key={disc.id}
                      className={`transition ${
                        isActive
                          ? "bg-emerald-50/70 hover:bg-emerald-100/60 font-medium text-emerald-950"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-semibold">
                        {disc.itemNo}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {disc.productName}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-white/80 border border-slate-300">
                          {disc.discountType === "PERCENT" || disc.discountType === "%" ? "%" : "$"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {disc.discountType === "PERCENT" || disc.discountType === "%"
                          ? `${disc.discountValue}%`
                          : `$${disc.discountValue}`}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {disc.startDate}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {disc.endDate}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleToggleActive(disc)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                              isActive
                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            }`}
                            title="Toggle active status"
                          >
                            {isActive ? "Active" : "Inactive"}
                          </button>
                          <button
                            onClick={() => handleDelete(disc.id, disc.productName)}
                            className="p-1 text-slate-400 hover:text-red-600 transition"
                            title="Delete Discount"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Discount Modal matching Screenshot 3 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>Add Product Discount</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.itemNo}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">-- Choose a Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.sku}>
                      {p.sku} - {p.name} (${p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Item No / SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.itemNo}
                    onChange={(e) => setFormData({ ...formData, itemNo: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value as "%" | "$" })
                    }
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="%">Percentage (%)</option>
                    <option value="$">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: Number(e.target.value) })
                    }
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-slate-700">Activate Immediately</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md flex items-center space-x-1.5 transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Apply Discount"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
