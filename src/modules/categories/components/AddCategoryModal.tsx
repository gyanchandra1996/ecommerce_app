"use client";

import React, { useState } from "react";
import { X, FolderPlus, Loader2, Image as ImageIcon, UploadCloud, Trash2 } from "lucide-react";
import { CategoryRecord } from "@/core/db/store";
import { AssetSelectorModal } from "@/modules/assets/components/AssetSelectorModal";
import { Asset } from "@/modules/assets/types/asset.types";

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
  const [image, setImage] = useState("");
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
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
          image: image.trim() || null,
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
      setImage("");
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating category");
    } finally {
      setLoading(false);
    }
  };

  const handleAssetSelected = (selectedAssets: Asset[]) => {
    if (selectedAssets && selectedAssets.length > 0) {
      setImage(selectedAssets[0].url);
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
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 sticky top-0 bg-white z-10">
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

          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
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
              <label className="block font-semibold text-slate-700 mb-1.5">
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

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows={2}
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
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderPlus className="w-3.5 h-3.5" />}
                <span>Save Category</span>
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
