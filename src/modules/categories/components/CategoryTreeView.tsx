"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Lock,
  Unlock,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  Plus,
  Folder,
} from "lucide-react";
import { CategoryRecord } from "@/core/db/store";

interface Props {
  categories: CategoryRecord[];
  onAddSubcategory: (parentId: string) => void;
  onDeleteCategory: (id: string, name: string) => void;
  onToggleActive: (id: string, current: boolean) => void;
  onRefresh: () => void;
}

export function CategoryTreeView({
  categories,
  onAddSubcategory,
  onDeleteCategory,
  onToggleActive,
  onRefresh,
}: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    cat_root_us1: true,
    cat_sub_laptops: true,
  });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderCategoryNode = (category: CategoryRecord, depth = 0) => {
    const hasChildren = Boolean(category.children && category.children.length > 0);
    const isExpanded = expanded[category.id];

    return (
      <div key={category.id} className="border-b border-slate-100 last:border-b-0">
        <div
          className={`py-2.5 px-3 flex items-center justify-between hover:bg-slate-50 transition group ${
            depth > 0 ? "bg-slate-50/40" : "bg-white"
          }`}
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
          {/* Left: Expand Triangle & Category Name */}
          <div className="flex items-center space-x-2.5 flex-1 min-w-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(category.id)}
                className="p-1 text-slate-500 hover:text-slate-800 transition"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <span className="w-3.5 h-3.5 flex items-center justify-center text-slate-300">
                <ChevronRight className="w-3 h-3 text-slate-300" />
              </span>
            )}

            <span
              className={`text-xs truncate ${
                depth === 0 ? "font-semibold text-slate-800" : depth === 1 ? "font-medium text-slate-700" : "text-slate-600"
              }`}
            >
              {category.name}
            </span>

            {depth < 2 && (
              <button
                type="button"
                onClick={() => onAddSubcategory(category.id)}
                title="Add subcategory inside this category"
                className="opacity-0 group-hover:opacity-100 p-1 text-emerald-600 hover:bg-emerald-50 rounded transition text-[10px] flex items-center space-x-0.5"
              >
                <Plus className="w-3 h-3" />
                <span>Add sub</span>
              </button>
            )}
          </div>

          {/* Right: TP (Total Products) & Action Icons matching Image 3 */}
          <div className="flex items-center space-x-5 shrink-0">
            {/* TP Metric matching Image 3 */}
            <div className="font-semibold text-xs text-slate-600 min-w-[50px] text-right">
              TP: <span className="text-emerald-700">{category.productCount ?? 0}</span>
            </div>

            {/* Action Icons matching screenshot */}
            <div className="flex items-center space-x-2 text-slate-500">
              {/* Lock / Unlock */}
              <button
                type="button"
                onClick={() => onToggleActive(category.id, category.isActive)}
                title={category.isActive ? "Active (Click to Lock/Disable)" : "Disabled (Click to Unlock/Enable)"}
                className={`p-1 hover:text-slate-800 transition ${
                  category.isActive ? "text-slate-700" : "text-amber-600"
                }`}
              >
                {category.isActive ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              </button>

              {/* View */}
              <button
                type="button"
                onClick={() => alert(`Viewing category: ${category.name}`)}
                title="View Category Products"
                className="p-1 hover:text-blue-600 transition text-blue-500"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>

              {/* Edit */}
              <button
                type="button"
                onClick={() => {
                  const newName = prompt("Edit category name:", category.name);
                  if (newName && newName.trim()) {
                    fetch(`/api/categories/${category.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: newName.trim() }),
                    }).then(() => onRefresh());
                  }
                }}
                title="Edit Category"
                className="p-1 hover:text-amber-600 transition text-amber-500"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={() => onDeleteCategory(category.id, category.name)}
                title="Delete Category"
                className="p-1 hover:text-red-600 transition text-red-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Refresh / Sync */}
              <button
                type="button"
                onClick={onRefresh}
                title="Refresh Category"
                className="p-1 hover:text-emerald-600 transition text-emerald-500"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recursive Children (Subcategory & Sub-subcategory) */}
        {hasChildren && isExpanded && (
          <div className="border-l-2 border-emerald-500/20 ml-4">
            {category.children!.map((child) => renderCategoryNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Folder className="w-10 h-10 mx-auto mb-2 text-slate-300" />
        <p className="text-xs">No categories found matching your search</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
      {categories.map((root) => renderCategoryNode(root, 0))}
    </div>
  );
}
