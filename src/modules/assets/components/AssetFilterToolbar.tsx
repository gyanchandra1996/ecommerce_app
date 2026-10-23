"use client";

import React from "react";
import {
  LayoutGrid,
  List,
  Plus,
  Search,
  Filter,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { AssetFilters } from "../types/asset.types";

interface Props {
  filters: AssetFilters;
  onFilterChange: (newFilters: Partial<AssetFilters>) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  multiselect: boolean;
  onMultiselectToggle: (active: boolean) => void;
  onOpenUploadModal: () => void;
  selectedCount: number;
  totalCount: number;
  onBatchDelete: () => void;
  onSelectAll: () => void;
}

export function AssetFilterToolbar({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  multiselect,
  onMultiselectToggle,
  onOpenUploadModal,
  selectedCount,
  totalCount,
  onBatchDelete,
  onSelectAll,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3 mb-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: View Toggle & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Grid / List switch button */}
          <button
            type="button"
            onClick={() => onViewModeChange(viewMode === "grid" ? "list" : "grid")}
            title={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
            className="w-9 h-9 rounded-md bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white flex items-center justify-center transition shadow-xs cursor-pointer"
          >
            {viewMode === "grid" ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </button>

          {/* Type Filter Dropdown */}
          <select
            value={filters.fileType}
            onChange={(e) =>
              onFilterChange({
                fileType: e.target.value as AssetFilters["fileType"],
                page: 1,
              })
            }
            className="h-9 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer min-w-[100px]"
          >
            <option value="all">All</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
            <option value="audio">Audio</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={filters.sort}
            onChange={(e) =>
              onFilterChange({
                sort: e.target.value as AssetFilters["sort"],
                page: 1,
              })
            }
            className="h-9 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer min-w-[110px]"
          >
            <option value="recent">Recent</option>
            <option value="oldest">Oldest</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="size_desc">File Size</option>
          </select>

          {/* Advance Option Dropdown */}
          <div className="relative inline-block">
            <select
              defaultValue="advance"
              onChange={(e) => {
                if (e.target.value !== "advance") {
                  onFilterChange({ fileType: e.target.value as AssetFilters["fileType"], page: 1 });
                }
              }}
              className="h-9 px-3 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
            >
              <option value="advance" disabled>
                Advance Option
              </option>
              <option value="all">Reset All Filters</option>
              <option value="image">Only High-Res Images</option>
              <option value="video">Only Video Media</option>
            </select>
          </div>

          {/* Select Option Dropdown */}
          {multiselect && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSelectAll}
                className="h-9 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md flex items-center space-x-1.5 transition cursor-pointer"
              >
                {selectedCount === totalCount && totalCount > 0 ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>Select All ({totalCount})</span>
              </button>

              {selectedCount > 0 && (
                <button
                  type="button"
                  onClick={onBatchDelete}
                  className="h-9 px-3 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete ({selectedCount})</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Search, Multiselect Toggle & Add Button */}
        <div className="flex items-center gap-3">
          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
              placeholder="search.."
              className="h-9 pl-3 pr-8 text-xs text-slate-700 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400 w-44 sm:w-52"
            />
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Multiselect Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-medium text-slate-600">Multiselect</span>
            <div
              onClick={() => onMultiselectToggle(!multiselect)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
                multiselect ? "bg-emerald-600" : "bg-slate-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  multiselect ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
          </label>

          {/* Green "+" Upload Button */}
          <button
            type="button"
            onClick={onOpenUploadModal}
            title="Upload New Asset"
            className="w-9 h-9 rounded-md bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white flex items-center justify-center transition shadow-xs cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
