"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import { CategoryTreeView } from "@/modules/categories/components/CategoryTreeView";
import { AddCategoryModal } from "@/modules/categories/components/AddCategoryModal";
import { CategoryRecord } from "@/core/db/store";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const url = search.trim()
        ? `/api/categories?search=${encodeURIComponent(search.trim())}`
        : `/api/categories?format=tree`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.data) {
        setCategories(json.data);
      }
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleOpenAddSub = (parentId: string) => {
    setDefaultParentId(parentId);
    setIsAddOpen(true);
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      loadCategories();
    } catch {
      alert("Failed to toggle status");
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" and all its subcategories?`)) return;
    try {
      await fetch(`/api/categories/${id}`, { method: "DELETE" });
      loadCategories();
    } catch {
      alert("Failed to delete category");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header matching Image 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Manage Categories</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            <span className="text-emerald-600 font-medium">Products</span> / Manage Categories
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setDefaultParentId(null);
            setIsAddOpen(true);
          }}
          className="h-9 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add New Category</span>
        </button>
      </div>

      {/* Search Bar matching Image 3 */}
      <div className="flex justify-end pt-2">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Category"
            className="w-full h-9 pl-3 pr-8 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
          />
          <Search className="w-3.5 h-3.5 absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Category Tree View */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-xs">Loading category hierarchy...</span>
        </div>
      ) : (
        <CategoryTreeView
          categories={categories}
          onAddSubcategory={handleOpenAddSub}
          onDeleteCategory={handleDeleteCategory}
          onToggleActive={handleToggleActive}
          onRefresh={loadCategories}
        />
      )}

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        categories={categories}
        defaultParentId={defaultParentId}
        onCategoryCreated={() => loadCategories()}
      />
    </div>
  );
}
