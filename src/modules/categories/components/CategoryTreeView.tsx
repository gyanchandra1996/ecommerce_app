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
  FolderOpen,
  ChevronsDownUp,
  ChevronsUpDown,
} from "lucide-react";
import { CategoryRecord } from "@/core/db/store";

interface Props {
  categories: CategoryRecord[];
  onAddSubcategory: (parentId: string) => void;
  onDeleteCategory: (id: string, name: string) => void;
  onToggleActive: (id: string, current: boolean) => void;
  onRefresh: () => void;
  onViewCategory?: (category: CategoryRecord) => void;
  onEditCategory?: (category: CategoryRecord) => void;
}

export function CategoryTreeView({
  categories,
  onAddSubcategory,
  onDeleteCategory,
  onToggleActive,
  onRefresh,
  onViewCategory,
  onEditCategory,
}: Props) {
  // Collect all category IDs that have children
  const getAllParentIds = (cats: CategoryRecord[]): string[] => {
    const ids: string[] = [];
    const traverse = (list: CategoryRecord[]) => {
      list.forEach((c) => {
        if (c.children && c.children.length > 0) {
          ids.push(c.id);
          traverse(c.children);
        }
      });
    };
    traverse(cats);
    return ids;
  };

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    // Default: expand top-level categories that have children
    const initial: Record<string, boolean> = {};
    categories.forEach((c) => {
      if (c.children && c.children.length > 0) {
        initial[c.id] = true;
      }
    });
    return initial;
  });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const parentIds = getAllParentIds(categories);
    const next: Record<string, boolean> = {};
    parentIds.forEach((id) => {
      next[id] = true;
    });
    setExpanded(next);
  };

  const collapseAll = () => {
    setExpanded({});
  };

  const renderCategoryNode = (category: CategoryRecord, depth = 0) => {
    const hasChildren = Boolean(category.children && category.children.length > 0);
    const isExpanded = Boolean(expanded[category.id]);
    const childCount = category.children?.length || 0;

    return (
      <div key={category.id} className="border-b border-slate-100 last:border-b-0">
        <div
          className={`py-3 px-3.5 flex items-center justify-between hover:bg-slate-50/90 transition group ${
            depth > 0 ? "bg-slate-50/40" : "bg-white"
          }`}
          style={{ paddingLeft: `${depth * 28 + 14}px` }}
        >
          {/* Left: Expand Triangle, Icon, Category Name, Level Pill */}
          <div className="flex items-center space-x-2.5 flex-1 min-w-0 pr-3">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(category.id)}
                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded transition cursor-pointer"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-emerald-700" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
              </button>
            ) : (
              <span className="w-6 h-6 flex items-center justify-center text-slate-300">
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </span>
            )}

            {/* Folder Icon */}
            {hasChildren && isExpanded ? (
              <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-slate-400 shrink-0" />
            )}

            {/* Category Image thumbnail if any */}
            {category.image && (
              <img
                src={category.image}
                alt=""
                className="w-5 h-5 rounded object-cover border border-slate-200 shrink-0"
              />
            )}

            {/* Name */}
            <span
              onClick={() => (onViewCategory ? onViewCategory(category) : toggleExpand(category.id))}
              className={`text-xs truncate cursor-pointer hover:underline ${
                depth === 0
                  ? "font-bold text-slate-800"
                  : depth === 1
                  ? "font-semibold text-slate-700"
                  : "font-medium text-slate-600"
              }`}
            >
              {category.name}
            </span>

            {/* Subcategories count pill */}
            {hasChildren && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                {childCount} {childCount === 1 ? "sub" : "subs"}
              </span>
            )}

            {/* Level indicator pill */}
            <span
              className={`hidden sm:inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase ${
                depth === 0
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : depth === 1
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {depth === 0 ? "Root" : `Level ${depth}`}
            </span>

            {/* Add Subcategory Quick Action on Hover */}
            {depth < 2 && (
              <button
                type="button"
                onClick={() => onAddSubcategory(category.id)}
                title={`Add subcategory inside "${category.name}"`}
                className="opacity-0 group-hover:opacity-100 px-2 py-0.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition text-[11px] font-medium flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Sub</span>
              </button>
            )}
          </div>

          {/* Right: TP (Total Products) & Action Icons matching Image 3 */}
          <div className="flex items-center space-x-4 sm:space-x-6 shrink-0">
            {/* TP Metric */}
            <div
              onClick={() => onViewCategory && onViewCategory(category)}
              className="text-xs font-semibold min-w-[70px] text-right cursor-pointer"
              title="Total Products in this category (click to view)"
            >
              <span className="text-slate-500 font-normal mr-1">TP:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 hover:bg-emerald-100 transition">
                {category.productCount ?? 0}
              </span>
            </div>

            {/* Action Icons matching user design */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 text-slate-500">
              {/* Lock / Unlock (Active Toggle) */}
              <button
                type="button"
                onClick={() => onToggleActive(category.id, category.isActive)}
                title={
                  category.isActive
                    ? "Status: Active (Click to Lock/Disable)"
                    : "Status: Disabled (Click to Unlock/Enable)"
                }
                className={`p-1.5 rounded hover:bg-slate-100 transition cursor-pointer ${
                  category.isActive ? "text-slate-600 hover:text-slate-900" : "text-amber-600 bg-amber-50"
                }`}
              >
                {category.isActive ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </button>

              {/* View Category & Products Modal */}
              <button
                type="button"
                onClick={() => onViewCategory && onViewCategory(category)}
                title="View Category Details & Products"
                className="p-1.5 rounded hover:bg-blue-50 hover:text-blue-600 transition text-blue-500 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
              </button>

              {/* Edit Category Modal */}
              <button
                type="button"
                onClick={() => onEditCategory && onEditCategory(category)}
                title="Edit Category"
                className="p-1.5 rounded hover:bg-amber-50 hover:text-amber-600 transition text-amber-500 cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              {/* Delete Category */}
              <button
                type="button"
                onClick={() => onDeleteCategory(category.id, category.name)}
                title="Delete Category"
                className="p-1.5 rounded hover:bg-red-50 hover:text-red-600 transition text-red-500 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Refresh / Sync */}
              <button
                type="button"
                onClick={onRefresh}
                title="Refresh Category"
                className="p-1.5 rounded hover:bg-emerald-50 hover:text-emerald-600 transition text-emerald-500 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Recursive Children (Subcategories) */}
        {hasChildren && isExpanded && (
          <div className="border-l-2 border-emerald-500/25 ml-5">
            {category.children!.map((child) => renderCategoryNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
        <Folder className="w-10 h-10 mx-auto mb-2 text-slate-300" />
        <p className="text-xs font-medium">No categories found matching your search</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Quick Tree Controls Bar */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-slate-600">Categories Hierarchy Tree</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={expandAll}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium transition cursor-pointer"
            title="Expand all tree branches"
          >
            <ChevronsUpDown className="w-3.5 h-3.5" />
            <span>Expand All</span>
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium transition cursor-pointer"
            title="Collapse all tree branches"
          >
            <ChevronsDownUp className="w-3.5 h-3.5" />
            <span>Collapse All</span>
          </button>
        </div>
      </div>

      {/* Tree Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
        {categories.map((root) => renderCategoryNode(root, 0))}
      </div>
    </div>
  );
}
