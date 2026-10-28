"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Upload,
  Download,
  RotateCcw,
  Search,
  AlertTriangle,
  Package,
  Check,
  Save,
  Boxes,
} from "lucide-react";

interface ProductItem {
  id: string;
  sku: string;
  name: string;
  currentStock: number;
  minStock: number;
  warehouse: string;
  status: string;
  isSoldOut: boolean;
  assetIds?: string[];
}

interface WarehouseOption {
  id: string;
  name: string;
  accountNumber?: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "low" | "none" | "soldout">("all");
  const [displaySoldOut, setDisplaySoldOut] = useState(true);
  const [displayInactive, setDisplayInactive] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");

  // Stock edit state buffer { [id]: { currentStock: number, warehouse: string, isSoldOut: boolean, modified: boolean } }
  const [stockEdits, setStockEdits] = useState<
    Record<string, { currentStock: number; warehouse: string; isSoldOut: boolean; modified: boolean }>
  >({});
  const [movements, setMovements] = useState<Array<{
    id: string;
    productName: string;
    warehouseName: string;
    type: string;
    quantity: number;
    previousAvailable: number;
    newAvailable: number;
    referenceId?: string;
    notes?: string;
    createdAt: string;
  }>>([]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      const [prodRes, whRes, movRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/warehouses"),
        fetch("/api/inventory/movements?limit=15"),
      ]);
      const prodJson = await prodRes.json();
      const whJson = await whRes.json();
      const movJson = await movRes.json();

      if (prodJson.data) {
        setProducts(prodJson.data);
        const edits: Record<string, { currentStock: number; warehouse: string; isSoldOut: boolean; modified: boolean }> = {};
        prodJson.data.forEach((p: ProductItem) => {
          edits[p.id] = {
            currentStock: p.currentStock,
            warehouse: p.warehouse || "Default Hub",
            isSoldOut: p.isSoldOut,
            modified: false,
          };
        });
        setStockEdits(edits);
      }

      if (whJson.data) {
        setWarehouses(whJson.data);
      }

      if (movJson.data) {
        setMovements(movJson.data);
      }
    } catch (err) {
      console.error("Error loading inventory:", err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockChange = (id: string, val: number) => {
    setStockEdits((prev) => {
      const current = prev[id] || { currentStock: 0, warehouse: "Default Hub", isSoldOut: false };
      const isSoldOut = val <= 0;
      return {
        ...prev,
        [id]: {
          ...current,
          currentStock: Math.max(0, val),
          isSoldOut: isSoldOut ? true : current.isSoldOut,
          modified: true,
        },
      };
    });
  };

  const handleWarehouseChange = (id: string, whName: string) => {
    setStockEdits((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { currentStock: 0, isSoldOut: false }),
        warehouse: whName,
        modified: true,
      },
    }));
  };

  const handleToggleSoldOut = (id: string) => {
    setStockEdits((prev) => {
      const current = prev[id] || { currentStock: 0, warehouse: "Default Hub", isSoldOut: false };
      return {
        ...prev,
        [id]: {
          ...current,
          isSoldOut: !current.isSoldOut,
          modified: true,
        },
      };
    });
  };

  const handleSaveItem = async (id: string) => {
    const edit = stockEdits[id];
    if (!edit) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStock: Number(edit.currentStock),
          warehouse: edit.warehouse,
          isSoldOut: Boolean(edit.isSoldOut),
        }),
      });

      if (res.ok) {
        // Synchronize warehouse stock
        const currentProd = products.find((p) => p.id === id);
        const whOption = warehouses.find((w) => w.name === edit.warehouse);
        if (currentProd && whOption) {
          const diff = Number(edit.currentStock) - Number(currentProd.currentStock);
          if (diff !== 0) {
            await fetch("/api/inventory/adjust", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId: id,
                warehouseId: whOption.id,
                quantity: diff,
                notes: `Stock adjusted from ${currentProd.currentStock} to ${edit.currentStock} in ${edit.warehouse}`,
              }),
            }).catch(() => {});
          }
        }

        setStockEdits((prev) => ({
          ...prev,
          [id]: { ...prev[id], modified: false },
        }));
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  currentStock: Number(edit.currentStock),
                  warehouse: edit.warehouse,
                  isSoldOut: Boolean(edit.isSoldOut),
                }
              : p
          )
        );
        notify("Inventory updated successfully.");
        // Refresh movements
        fetch("/api/inventory/movements?limit=15")
          .then((r) => r.json())
          .then((j) => {
            if (j.data) setMovements(j.data);
          })
          .catch(() => {});
      }
    } catch (err) {
      console.error("Error saving inventory item:", err);
    }
  };

  const notify = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const filteredProducts = products.filter((p) => {
    const edit = stockEdits[p.id] || p;
    if (!displaySoldOut && edit.isSoldOut) return false;
    if (selectedWarehouse !== "all" && edit.warehouse !== selectedWarehouse) return false;
    if (
      search &&
      !p.name.toLowerCase().includes(search.toLowerCase()) &&
      !p.sku.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (activeTab === "low") return edit.currentStock <= p.minStock && edit.currentStock > 0;
    if (activeTab === "none") return edit.currentStock === 0;
    if (activeTab === "soldout") return edit.isSoldOut;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header and Breadcrumb matching Image 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-600" />
            <span>Manage Inventory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            <span className="text-emerald-600 font-medium">Inventory</span> / Manage Inventory
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 cursor-pointer select-none text-xs text-slate-600">
            <span>Display Sold Out:</span>
            <div
              onClick={() => setDisplaySoldOut(!displaySoldOut)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                displaySoldOut ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  displaySoldOut ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
          </label>

          {statusMsg && (
            <div className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center space-x-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{statusMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Warehouse Mode Alert Banner matching Image 2 */}
      <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-center space-x-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          Inventory synchronizes directly with connected warehouses. Updating stock numbers here reflects immediately on your live storefront product pages.
        </span>
      </div>

      {/* Filter Toolbar matching Screenshot */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          {/* Warehouse Selector Populated from /api/warehouses */}
          <div className="w-60">
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="all">All Warehouses</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.name}>
                  {wh.name} {wh.accountNumber ? `(${wh.accountNumber})` : ""}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setSearch("");
              setSelectedWarehouse("all");
              setActiveTab("all");
            }}
            title="Reset filters"
            className="w-8 h-8 rounded-md bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 cursor-pointer select-none text-xs text-slate-600">
            <span>Display Inactive</span>
            <div
              onClick={() => setDisplayInactive(!displayInactive)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                displayInactive ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  displayInactive ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
          </label>

          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SKU or Name..."
              className="h-8 pl-3 pr-7 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 w-52"
            />
            <Search className="w-3.5 h-3.5 absolute right-2 top-2.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Tabs matching Image 2 */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-2 px-3 text-xs font-semibold transition border-b-2 ${
            activeTab === "all"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          All ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("low")}
          className={`pb-2 px-3 text-xs font-semibold transition border-b-2 ${
            activeTab === "low"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Low Inventory ({products.filter((p) => p.currentStock <= p.minStock && p.currentStock > 0).length})
        </button>
        <button
          onClick={() => setActiveTab("none")}
          className={`pb-2 px-3 text-xs font-semibold transition border-b-2 ${
            activeTab === "none"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          No Inventory ({products.filter((p) => p.currentStock === 0).length})
        </button>
        <button
          onClick={() => setActiveTab("soldout")}
          className={`pb-2 px-3 text-xs font-semibold transition border-b-2 ${
            activeTab === "soldout"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Sold Out/Inactive ({products.filter((p) => p.isSoldOut).length})
        </button>
      </div>

      {/* Inventory Data Table matching Image 2 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3">Item No.</th>
              <th className="p-3">Product Status</th>
              <th className="p-3">Name</th>
              <th className="p-3">Warehouse</th>
              <th className="p-3">Mini stock</th>
              <th className="p-3">Status</th>
              <th className="p-3">Current Stock</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map((item) => {
              const edit = stockEdits[item.id] || {
                currentStock: item.currentStock,
                warehouse: item.warehouse || "Default Hub",
                isSoldOut: item.isSoldOut,
                modified: false,
              };

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/80 transition ${
                    edit.modified ? "bg-amber-50/40" : ""
                  }`}
                >
                  <td className="p-3 font-mono font-medium text-slate-800">{item.sku}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-600 text-white">
                      Active
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-800">
                    <span>{item.name}</span>
                  </td>

                  {/* Warehouse Selector */}
                  <td className="p-3">
                    <select
                      value={edit.warehouse}
                      onChange={(e) => handleWarehouseChange(item.id, e.target.value)}
                      className="px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {warehouses.map((wh) => (
                        <option key={wh.id} value={wh.name}>
                          {wh.name}
                        </option>
                      ))}
                      {!warehouses.some((w) => w.name === edit.warehouse) && (
                        <option value={edit.warehouse}>{edit.warehouse}</option>
                      )}
                    </select>
                  </td>

                  <td className="p-3 text-slate-600">{item.minStock}</td>

                  {/* Quick Toggle Status Available / Sold Out */}
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleToggleSoldOut(item.id)}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                        edit.isSoldOut
                          ? "bg-amber-500 text-white hover:bg-amber-600"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                      title="Click to toggle Available / Sold Out"
                    >
                      {edit.isSoldOut ? "Sold Out" : "Available"}
                    </button>
                  </td>

                  {/* Editable Stock Input */}
                  <td className="p-3">
                    <input
                      type="number"
                      min="0"
                      value={edit.currentStock}
                      onChange={(e) => handleStockChange(item.id, Number(e.target.value))}
                      className="w-20 px-2 py-1 text-xs border border-slate-300 rounded font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>

                  {/* Save Button */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleSaveItem(item.id)}
                      className={`px-3 py-1 text-xs font-semibold rounded shadow-xs transition flex items-center space-x-1 mx-auto ${
                        edit.modified
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                      title="Save Stock Changes"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Inventory Movements History Log */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs mt-6">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-indigo-600" />
              Inventory Movement & Fulfillment History
            </h2>
            <p className="text-[11px] text-slate-500">
              Audit log of stock allocations, order reservations, shipping dispatches, and adjustments
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {movements.length} recent record(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Date / Time</th>
                <th className="py-2.5 px-4">Product</th>
                <th className="py-2.5 px-4">Warehouse</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4 text-right">Quantity</th>
                <th className="py-2.5 px-4 text-right">Available (Before → After)</th>
                <th className="py-2.5 px-4">Reference / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No inventory movements recorded yet.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {m.productName}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {m.warehouseName}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.type === "RESERVATION"
                            ? "bg-amber-100 text-amber-800"
                            : m.type === "DISPATCH"
                            ? "bg-blue-100 text-blue-800"
                            : m.type === "RELEASE"
                            ? "bg-purple-100 text-purple-800"
                            : m.type === "STOCK_ADD"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {m.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold">
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-[11px] text-slate-500">
                      {m.previousAvailable} → <span className="font-bold text-slate-800">{m.newAvailable}</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                      <span className="font-mono text-indigo-600">{m.referenceId || "—"}</span>
                      {m.notes && <span className="block text-slate-400">{m.notes}</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
