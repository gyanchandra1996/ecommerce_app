"use client";

import React from "react";
import { AssetCard } from "./AssetCard";
import { Asset } from "../types/asset.types";
import {
  FolderOpen,
  Upload,
  ChevronLeft,
  ChevronRight,
  Cloud,
  HardDrive,
  ChevronDown,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface Props {
  assets: Asset[];
  loading: boolean;
  viewMode: "grid" | "list";
  multiselect: boolean;
  selectedIds: string[];
  onSelectId: (id: string) => void;
  onAssetClick: (asset: Asset) => void;
  onOpenUpload: () => void;
  onAssetUpdated?: (updated: Asset) => void;
  page?: number;
  totalPages?: number;
  totalCount?: number;
  onPageChange?: (newPage: number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  isS3Enabled?: boolean;
}

export function AssetGrid({
  assets,
  loading,
  viewMode,
  multiselect,
  selectedIds,
  onSelectId,
  onAssetClick,
  onOpenUpload,
  onAssetUpdated,
  page = 1,
  totalPages = 1,
  totalCount = 0,
  onPageChange,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  isS3Enabled = false,
}: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-slate-200 overflow-hidden animate-pulse"
          >
            <div className="h-44 bg-slate-200" />
            <div className="p-3 space-y-2">
              <div className="h-3.5 bg-slate-200 rounded w-3/4 mx-auto" />
              <div className="h-2.5 bg-slate-100 rounded w-1/2 mx-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No assets found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Start by uploading images, product photos, or promotional videos to your media library.
        </p>
        <button
          type="button"
          onClick={onOpenUpload}
          className="mt-5 inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Assets</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {viewMode === "grid" ? (
        /* Grid mode matching Image 1: 5 columns on desktop */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              isSelected={selectedIds.includes(asset.id)}
              multiselect={multiselect}
              onSelect={onSelectId}
              onClick={onAssetClick}
              onAssetUpdated={onAssetUpdated}
              isS3Enabled={isS3Enabled}
            />
          ))}
        </div>
      ) : (
        /* List mode */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                {multiselect && <th className="p-3 w-10"></th>}
                <th className="p-3 w-16">Preview</th>
                <th className="p-3">File Name</th>
                <th className="p-3">Type</th>
                {isS3Enabled && <th className="p-3">Storage</th>}
                <th className="p-3">Size</th>
                <th className="p-3">Added Date</th>
                <th className="p-3 text-right">Products</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.map((asset) => {
                const isSelected = selectedIds.includes(asset.id);
                return (
                  <tr
                    key={asset.id}
                    onClick={() => {
                      if (multiselect) onSelectId(asset.id);
                      else onAssetClick(asset);
                    }}
                    className={`hover:bg-slate-50/80 cursor-pointer transition ${
                      isSelected ? "bg-emerald-50/40" : ""
                    }`}
                  >
                    {multiselect && (
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectId(asset.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                    )}
                    <td className="p-3">
                      <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center overflow-hidden">
                        {asset.fileType?.toUpperCase() === "IMAGE" || asset.url?.match(/\.(webp|png|jpe?g|svg|gif|avif)$/i) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={asset.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">
                            {asset.fileType.substring(0, 3)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-medium text-slate-800">{asset.name}</td>
                    <td className="p-3 uppercase font-mono text-[10px] text-slate-500">
                      {asset.fileType}
                    </td>
                    {isS3Enabled && (
                      <td className="p-3">
                        {asset.storageProvider === "s3" || (asset.url && (asset.url.includes("s3") || asset.url.includes("cloudfront"))) ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            <Cloud className="w-3 h-3 text-sky-500" />
                            <span>AWS S3</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            <HardDrive className="w-3 h-3 text-slate-400" />
                            <span>Local</span>
                          </span>
                        )}
                      </td>
                    )}
                    <td className="p-3 text-slate-500">
                      {(asset.size / (1024 * 1024)).toFixed(2)} MB
                    </td>
                    <td className="p-3 text-slate-500">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      {asset.productCount ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                          {asset.productCount} linked
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Load More Pagination Section */}
      {totalCount > 0 && (
        <div className="pt-6 pb-4 flex flex-col items-center justify-center space-y-3">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{assets.length}</strong> of{" "}
              <strong className="text-slate-800">{totalCount}</strong> assets
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-xs bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (assets.length / (totalCount || 1)) * 100)}%` }}
            />
          </div>

          {hasMore && onLoadMore ? (
            <button
              type="button"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs hover:shadow transition disabled:opacity-60 cursor-pointer"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading more assets...</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>Load More Assets ({Math.min(24, totalCount - assets.length)} remaining)</span>
                </>
              )}
            </button>
          ) : (
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              All {totalCount} assets loaded
            </p>
          )}
        </div>
      )}
    </div>
  );
}
