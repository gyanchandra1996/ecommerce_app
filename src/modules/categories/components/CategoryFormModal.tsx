"use client";

import React, { useState, useEffect } from "react";
import { X, FolderPlus, Edit3, Loader2, UploadCloud, Copy, Check } from "lucide-react";
import { CategoryRecord } from "@/core/db/store";
import { AssetSelectorModal } from "@/modules/assets/components/AssetSelectorModal";
import { Asset } from "@/modules/assets/types/asset.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryRecord[];
  onCategorySaved: (category: CategoryRecord) => void;
  editingCategory?: CategoryRecord | null;
  defaultParentId?: string | null;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  categories,
  onCategorySaved,
  editingCategory = null,
  defaultParentId = null,
}: Props) {
  const isEdit = Boolean(editingCategory);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [image, setImage] = useState("");
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState(false);

  // Sync state when modal opens or editingCategory changes
  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name || "");
      setSlug(editingCategory.slug || "");
      setDescription(editingCategory.description || "");
      setParentId(editingCategory.parentId || "");
      setIsActive(editingCategory.isActive !== false);
      setImage(editingCategory.image || "");
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setParentId(defaultParentId || "");
      setIsActive(true);
      setImage("");
    }
    setError(null);
  }, [editingCategory, defaultParentId, isOpen]);

  if (!isOpen) return null;

  // Auto-generate slug when name changes in create mode
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit && !slug) {
      // preview slug
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  const handleCopySlug = () => {
    if (!slug) return;
    navigator.clipboard.writeText(slug);
    setCopiedSlug(true);
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEdit && editingCategory) {
        // PATCH existing category
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim() || undefined,
            description: description.trim() || undefined,
            parentId: parentId || null,
            isActive,
            image: image.trim() || null,
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || json.message || "Failed to update category.");
        }

        onCategorySaved(json.data);
        onClose();
      } else {
        // POST new category
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || undefined,
            parentId: parentId || null,
            image: image.trim() || null,
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || json.message || "Failed to create category.");
        }

        onCategorySaved(json.data);
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving category.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssetSelected = (selectedAssets: Asset[]) => {
    if (selectedAssets && selectedAssets.length > 0) {
      setImage(selectedAssets[0].url);
    }
  };

  // Helper to find all descendant IDs of the category being edited to prevent cycles
  const getDescendantIds = (catId: string): Set<string> => {
    const descendants = new Set<string>();
    const recurse = (id: string) => {
      categories.forEach((c) => {
        if (c.parentId === id && !descendants.has(c.id)) {
          descendants.add(c.id);
          recurse(c.id);
        }
      });
    };
    recurse(catId);
    return descendants;
  };

  const invalidParentIds = editingCategory ? getDescendantIds(editingCategory.id) : new Set<string>();
  if (editingCategory) {
    invalidParentIds.add(editingCategory.id);
  }

  // Build flattened options with indentation for dropdown
  const getParentOptions = () => {
    const list: Array<{ id: string; label: string; disabled: boolean }> = [];

    const traverse = (cats: CategoryRecord[], prefix = "") => {
      cats.forEach((c) => {
        const disabled = invalidParentIds.has(c.id);
        list.push({
          id: c.id,
          label: prefix ? `${prefix} > ${c.name}` : c.name,
          disabled,
        });
        if (c.children && c.children.length > 0) {
          traverse(c.children, prefix ? `${prefix} > ${c.name}` : c.name);
        }
      });
    };

    traverse(categories);
    return list;
  };

  const parentOptions = getParentOptions();

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 sticky top-0 bg-white z-10">
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-xs ${
                  isEdit ? "bg-amber-500 text-white" : "bg-emerald-600 text-white"
                }`}
              >
                {isEdit ? <Edit3 className="w-4 h-4" /> : <FolderPlus className="w-4 h-4" />}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 tracking-tight">
                  {isEdit ? `Edit Category: ${editingCategory?.name}` : "Add New Category"}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {isEdit
                    ? "Update category details, parent hierarchy, and status"
                    : "Create Category, Subcategory, or Sub-subcategory"}
                </p>
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

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
            {/* Hierarchy (Parent) Dropdown */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Category Hierarchy (Parent)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white text-slate-800"
              >
                <option value="">[None - Root Level Category]</option>
                {parentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id} disabled={opt.disabled}>
                    {opt.label} {opt.disabled ? " (Invalid - self or descendant)" : ""}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Assigning a parent places this category as a subcategory underneath it.
              </p>
            </div>

            {/* Category Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Smartphones, Gaming Laptops, Sport Shoes"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
              />
            </div>

            {/* Slug (URL friendly identifier) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Category Slug (URL Identifier)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. smartphones-4k2b"
                  className="w-full pl-3 pr-10 py-2 text-xs rounded-lg border border-slate-300 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                {slug && (
                  <button
                    type="button"
                    onClick={handleCopySlug}
                    className="absolute right-2 p-1 text-slate-400 hover:text-slate-600 rounded"
                    title="Copy slug"
                  >
                    {copiedSlug ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Used in SEO and URL routing: /categories/[slug]
              </p>
            </div>

            {/* Status (Active / Inactive) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Category Status</label>
              <div className="flex items-center space-x-3">
                <label className="inline-flex items-center cursor-pointer space-x-2">
                  <input
                    type="radio"
                    name="cat_status"
                    checked={isActive}
                    onChange={() => setIsActive(true)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-700 font-medium">Active (Visible)</span>
                </label>
                <label className="inline-flex items-center cursor-pointer space-x-2">
                  <input
                    type="radio"
                    name="cat_status"
                    checked={!isActive}
                    onChange={() => setIsActive(false)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-xs text-slate-700 font-medium">Disabled / Inactive</span>
                </label>
              </div>
            </div>

            {/* Category Image from Assets Modal */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Category Thumbnail / Icon Image
              </label>
              {image ? (
                <div className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={image} alt="Category preview" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{image}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Selected from Asset Library</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setIsAssetModalOpen(true)}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setImage("")}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsAssetModalOpen(true)}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-5 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition flex flex-col items-center justify-center space-y-1"
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-slate-700">Select or Upload Category Image</p>
                  <p className="text-[11px] text-slate-500">
                    Click to open the Asset Modal to pick or upload a new image
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description for cataloging, customer browsing, and SEO..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none text-slate-800"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className={`px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer ${
                  isEdit
                    ? "bg-amber-600 hover:bg-amber-700 active:bg-amber-800"
                    : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
                }`}
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isEdit ? (
                  <Edit3 className="w-3.5 h-3.5" />
                ) : (
                  <FolderPlus className="w-3.5 h-3.5" />
                )}
                <span>{isEdit ? "Update Category" : "Save Category"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Centralized Asset Selector Modal */}
      {isAssetModalOpen && (
        <AssetSelectorModal
          isOpen={isAssetModalOpen}
          onClose={() => setIsAssetModalOpen(false)}
          selectedAssetIds={[]}
          onConfirmSelection={handleAssetSelected}
          multiSelect={false}
        />
      )}
    </>
  );
}
