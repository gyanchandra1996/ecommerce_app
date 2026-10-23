"use client";

import React, { useState } from "react";
import { X, FolderPlus, Loader2 } from "lucide-react";
import { CategoryRecord } from "@/core/db/store";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryRecord[];
  onCategoryCreated: (category: CategoryRecord) => void;
  defaultParentId?: string | null;
}

export function AddCategoryModal({
  isOpen,
  onClose,
  categories,
  onCategoryCreated,
  defaultParentId = null,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string>(defaultParentId || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          parentId: parentId || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to create category");
      }

      onCategoryCreated(json.data);
      setName("");
      setDescription("");
      setParentId("");
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating category");
    } finally {
      setLoading(false);
    }
  };

  // Build flattened options with indentation for dropdown
  const getParentOptions = () => {
    const list: Array<{ id: string; label: string }> = [];

    const traverse = (cats: CategoryRecord[], prefix = "") => {
      cats.forEach((c) => {
        list.push({
          id: c.id,
          label: prefix ? `${prefix} > ${c.name}` : c.name,
        });
        if (c.children && c.children.length > 0) {
          traverse(c.children, prefix ? `${prefix} > ${c.name}` : c.name);
        }
      });
    };

    traverse(categories);
    return list;
  };

  const options = getParentOptions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Add Category</h2>
              <p className="text-xs text-slate-500">Create Category, Subcategory, or Sub-subcategory</p>
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category Hierarchy (Parent)
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            >
              <option value="">[None - Create as Root Level Category]</option>
              {options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Selecting a parent category places this item as its Subcategory or Sub-subcategory.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Gaming Laptops, Groceries, Sport Shoes"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for SEO and cataloging..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
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
              disabled={loading || !name.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderPlus className="w-3.5 h-3.5" />}
              <span>Save Category</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
