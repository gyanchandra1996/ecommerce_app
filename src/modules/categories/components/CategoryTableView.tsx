"use client";

import React from "react";
import {
  Folder,
  Eye,
  Edit2,
  Trash2,
  Unlock,
  Lock,
  Plus,
  Layers,
  Package,
} from "lucide-react";
import { CategoryRecord } from "@/core/db/store";

interface Props {
  categories: CategoryRecord[];
  allFlatCategories: CategoryRecord[];
  onAddSubcategory: (parentId: string) => void;
  onDeleteCategory: (id: string, name: string) => void;
  onToggleActive: (id: string, current: boolean) => void;
  onViewCategory: (category: CategoryRecord) => void;
  onEditCategory: (category: CategoryRecord) => void;
}

export function CategoryTableView({
  allFlatCategories,
  onAddSubcategory,
  onDeleteCategory,
  onToggleActive,
  onViewCategory,
  onEditCategory,
}: Props) {
  // Build parent lookup
  const catMap = new Map<string, CategoryRecord>();
  allFlatCategories.forEach((c) => catMap.set(c.id, c));

  const getParentName = (parentId?: string | null): string => {
    if (!parentId) return "— Root Category —";
    const parent = catMap.get(parentId);
    return parent ? parent.name : parentId;
  };

  if (allFlatCategories.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
        <Folder className="w-10 h-10 mx-auto mb-2 text-slate-300" />
        <p className="text-xs font-medium">No categories found</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Parent Category</th>
              <th className="py-3 px-4">Level</th>
              <th className="py-3 px-4 text-center">TP (Products)</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {allFlatCategories.map((c) => {
              const isRoot = !c.parentId;
              return (
                <tr key={c.id} className="hover:bg-slate-50/80 transition group">
                  {/* Category Image & Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
                        {c.image ? (
                          <img src={c.image} alt={c.name} className="w-full h-full object-contain" />
                        ) : (
                          <Folder className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div
                          onClick={() => onViewCategory(c)}
                          className="font-bold text-slate-800 hover:text-emerald-700 cursor-pointer truncate max-w-[200px]"
                        >
                          {c.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                          /{c.slug}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Parent */}
                  <td className="py-3 px-4 text-slate-600">
                    <span
                      className={`text-xs ${
                        isRoot ? "font-semibold text-slate-400 italic" : "font-medium text-slate-700"
                      }`}
                    >
                      {getParentName(c.parentId)}
                    </span>
                  </td>

                  {/* Level */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        c.level === 0
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : c.level === 1
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {c.level === 0 ? "Root Level" : `Level ${c.level}`}
                    </span>
                  </td>

                  {/* TP (Products) */}
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onViewCategory(c)}
                      className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition cursor-pointer"
                      title="View products in this category"
                    >
                      <Package className="w-3 h-3 text-emerald-600" />
                      <span>{c.productCount ?? 0}</span>
                    </button>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleActive(c.id, c.isActive)}
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition cursor-pointer ${
                        c.isActive !== false
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                      }`}
                    >
                      {c.isActive !== false ? (
                        <>
                          <Unlock className="w-3 h-3" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>Disabled</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1 text-slate-500">
                      {/* Add Subcategory */}
                      {(c.level ?? 0) < 2 && (
                        <button
                          type="button"
                          onClick={() => onAddSubcategory(c.id)}
                          title="Add subcategory"
                          className="p-1.5 rounded hover:bg-emerald-50 hover:text-emerald-700 transition text-emerald-600 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* View */}
                      <button
                        type="button"
                        onClick={() => onViewCategory(c)}
                        title="View Category Products"
                        className="p-1.5 rounded hover:bg-blue-50 hover:text-blue-600 transition text-blue-500 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => onEditCategory(c)}
                        title="Edit Category"
                        className="p-1.5 rounded hover:bg-amber-50 hover:text-amber-600 transition text-amber-500 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onDeleteCategory(c.id, c.name)}
                        title="Delete Category"
                        className="p-1.5 rounded hover:bg-red-50 hover:text-red-600 transition text-red-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
