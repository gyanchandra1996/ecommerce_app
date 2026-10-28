"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  Loader2,
  FolderTree,
  Table,
  Layers,
  Folder,
  Package,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  GitFork,
} from "lucide-react";
import { CategoryTreeView } from "@/modules/categories/components/CategoryTreeView";
import { CategoryTableView } from "@/modules/categories/components/CategoryTableView";
import { CategoryFormModal } from "@/modules/categories/components/CategoryFormModal";
import { ViewCategoryModal } from "@/modules/categories/components/ViewCategoryModal";
import { CategoryRecord } from "@/core/db/store";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"tree" | "table">("tree");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DISABLED">("ALL");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [viewingCategory, setViewingCategory] = useState<CategoryRecord | null>(null);

  // Notification feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

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
      showFeedback("error", "Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Flatten categories hierarchy for stats and table view
  const allFlatCategories = useMemo(() => {
    const list: CategoryRecord[] = [];
    const traverse = (cats: CategoryRecord[]) => {
      cats.forEach((c) => {
        list.push(c);
        if (c.children && c.children.length > 0) {
          traverse(c.children);
        }
      });
    };
    traverse(categories);
    return list;
  }, [categories]);

  // Filtered categories based on status filter
  const displayedCategories = useMemo(() => {
    if (statusFilter === "ALL") return categories;
    const filterBranch = (list: CategoryRecord[]): CategoryRecord[] => {
      return list
        .filter((c) => (statusFilter === "ACTIVE" ? c.isActive !== false : c.isActive === false))
        .map((c) => ({
          ...c,
          children: c.children ? filterBranch(c.children) : [],
        }));
    };
    return filterBranch(categories);
  }, [categories, statusFilter]);

  const displayedFlatCategories = useMemo(() => {
    if (statusFilter === "ALL") return allFlatCategories;
    return allFlatCategories.filter((c) =>
      statusFilter === "ACTIVE" ? c.isActive !== false : c.isActive === false
    );
  }, [allFlatCategories, statusFilter]);

  // Stats
  const totalCategoriesCount = allFlatCategories.length;
  const rootCategoriesCount = allFlatCategories.filter((c) => !c.parentId || c.level === 0).length;
  const subcategoriesCount = allFlatCategories.filter((c) => c.parentId && (c.level || 0) > 0).length;
  // Total Products mapped: sum of productCount across root categories
  const totalMappedProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

  // Handlers
  const handleOpenCreateRoot = () => {
    setEditingCategory(null);
    setDefaultParentId(null);
    setIsFormOpen(true);
  };

  const handleOpenAddSub = (parentId: string) => {
    setEditingCategory(null);
    setDefaultParentId(parentId);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category: CategoryRecord) => {
    setEditingCategory(category);
    setDefaultParentId(category.parentId || null);
    setIsFormOpen(true);
  };

  const handleOpenView = (category: CategoryRecord) => {
    // If viewing category has an updated version in allFlatCategories, use it
    const fresh = allFlatCategories.find((c) => c.id === category.id) || category;
    setViewingCategory(fresh);
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update status");
      }
      showFeedback(
        "success",
        `Category marked as ${!current ? "Active" : "Disabled"} successfully.`
      );
      loadCategories();
    } catch (err: unknown) {
      showFeedback("error", err instanceof Error ? err.message : "Failed to toggle status");
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}" and all its subcategories?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete category");
      }
      showFeedback("success", `Category "${name}" and its subcategories removed.`);
      loadCategories();
    } catch (err: unknown) {
      showFeedback("error", err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center space-x-2">
            <span>Manage Categories</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            <span className="text-emerald-600 font-medium">Catalog</span> / Manage Categories & Subcategories
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateRoot}
          className="h-9 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add New Category</span>
        </button>
      </div>

      {/* Dismissible Feedback Alert */}
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between transition ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Interactive Overview Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Categories</span>
            <Folder className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-800">{totalCategoriesCount}</span>
            <span className="text-[11px] text-slate-400">nodes</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Root Categories</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-800">{rootCategoriesCount}</span>
            <span className="text-[11px] text-blue-600 font-medium">top level</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Subcategories</span>
            <GitFork className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-800">{subcategoriesCount}</span>
            <span className="text-[11px] text-purple-600 font-medium">nested</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Mapped Products (TP)</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-700">{totalMappedProducts}</span>
            <span className="text-[11px] text-slate-400">items</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar: Search, View Switch, Status Filters */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left: View Mode Toggle & Status Filter */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Tree vs Table View Switch */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode("tree")}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                viewMode === "tree"
                  ? "bg-white text-emerald-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Tree View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-emerald-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 text-xs">
            {(["ALL", "ACTIVE", "DISABLED"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition cursor-pointer ${
                  statusFilter === st
                    ? "bg-slate-800 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {st === "ALL" ? "All" : st === "ACTIVE" ? "Active" : "Disabled"}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Search & Refresh */}
        <div className="flex items-center space-x-2">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Category by name..."
              className="w-full h-8.5 pl-3 pr-8 text-xs bg-slate-50/70 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
            )}
          </div>

          <button
            type="button"
            onClick={loadCategories}
            title="Refresh Categories"
            className="h-8.5 px-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 transition flex items-center justify-center cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Content Area: Tree or Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-xs font-medium">Loading category hierarchy...</span>
        </div>
      ) : viewMode === "tree" ? (
        <CategoryTreeView
          categories={displayedCategories}
          onAddSubcategory={handleOpenAddSub}
          onDeleteCategory={handleDeleteCategory}
          onToggleActive={handleToggleActive}
          onRefresh={loadCategories}
          onViewCategory={handleOpenView}
          onEditCategory={handleOpenEdit}
        />
      ) : (
        <CategoryTableView
          categories={displayedCategories}
          allFlatCategories={displayedFlatCategories}
          onAddSubcategory={handleOpenAddSub}
          onDeleteCategory={handleDeleteCategory}
          onToggleActive={handleToggleActive}
          onViewCategory={handleOpenView}
          onEditCategory={handleOpenEdit}
        />
      )}

      {/* Add / Edit Category Form Modal */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        categories={categories}
        defaultParentId={defaultParentId}
        editingCategory={editingCategory}
        onCategorySaved={() => {
          showFeedback(
            "success",
            editingCategory
              ? "Category updated successfully."
              : "New category created successfully."
          );
          loadCategories();
        }}
      />

      {/* View Category & Mapped Products Modal */}
      <ViewCategoryModal
        isOpen={Boolean(viewingCategory)}
        onClose={() => setViewingCategory(null)}
        category={viewingCategory}
        allCategories={allFlatCategories}
        onEditCategory={handleOpenEdit}
      />
    </div>
  );
}
