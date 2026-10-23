"use client";

import React, { useState } from "react";
import {
  FileVideo,
  FileText,
  FileMusic,
  File,
  Check,
  Play,
  Copy,
  ExternalLink,
  Package,
} from "lucide-react";
import { Asset } from "../types/asset.types";

interface Props {
  asset: Asset;
  isSelected: boolean;
  multiselect: boolean;
  onSelect: (id: string) => void;
  onClick: (asset: Asset) => void;
}

export function AssetCard({ asset, isSelected, multiselect, onSelect, onClick }: Props) {
  const [copied, setCopied] = useState(false);

  // Format date like "2026-Feb-18" or "2026-Jun-22"
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${d.getFullYear()}-${months[d.getMonth()]}-${String(d.getDate()).padStart(2, "0")}`;
    } catch {
      return "2026-Oct-23";
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + asset.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => {
        if (multiselect) {
          onSelect(asset.id);
        } else {
          onClick(asset);
        }
      }}
      className={`group relative bg-white rounded-lg border transition-all duration-150 flex flex-col cursor-pointer overflow-hidden ${
        isSelected
          ? "border-emerald-600 ring-2 ring-emerald-500/20 shadow-md"
          : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      {/* Checkbox for multiselect */}
      {multiselect && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelect(asset.id);
          }}
          className="absolute top-2 left-2 z-20"
        >
          <div
            className={`w-5 h-5 rounded flex items-center justify-center transition border ${
              isSelected
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-white/90 border-slate-300 hover:border-emerald-500"
            }`}
          >
            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </div>
      )}

      {/* Copy quick action button on hover */}
      <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={handleCopyLink}
          title="Copy file URL"
          className="p-1.5 rounded-md bg-white/95 text-slate-600 hover:text-emerald-600 shadow-sm border border-slate-200 backdrop-blur-xs transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Media Thumbnail Container */}
      <div className="w-full h-44 bg-slate-50 relative flex items-center justify-center p-2 border-b border-slate-100">
        {asset.fileType === "IMAGE" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.url}
            alt={asset.altText || asset.name}
            loading="lazy"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
          />
        ) : asset.fileType === "VIDEO" ? (
          <div className="relative w-full h-full flex items-center justify-center bg-slate-900/5 rounded">
            <video
              src={asset.url}
              preload="metadata"
              className="w-full h-full object-contain pointer-events-none rounded"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition rounded">
              <div className="w-10 h-10 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-md">
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>
            </div>
            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 text-white text-[10px] font-mono">
              VIDEO
            </span>
          </div>
        ) : asset.fileType === "DOCUMENT" ? (
          <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-emerald-600 transition">
            <FileText className="w-12 h-12 stroke-[1.5]" />
            <span className="text-[10px] font-semibold uppercase tracking-wider mt-1 text-slate-500">
              Document
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400">
            <File className="w-12 h-12 stroke-[1.5]" />
            <span className="text-[10px] font-semibold uppercase tracking-wider mt-1 text-slate-500">
              {asset.fileType}
            </span>
          </div>
        )}

        {/* Product attached indicator tag */}
        {Boolean(asset.productCount && asset.productCount > 0) && (
          <div
            title={`Used in ${asset.productCount} product(s)`}
            className="absolute bottom-2 left-2 flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-medium shadow-xs"
          >
            <Package className="w-3 h-3" />
            <span>{asset.productCount}</span>
          </div>
        )}
      </div>

      {/* Card Info Footer (matches Image 1: name & "Added: 2026-Feb-18") */}
      <div className="p-3 text-center bg-white flex flex-col justify-center">
        <h3
          title={asset.name}
          className="text-xs font-medium text-slate-700 truncate w-full group-hover:text-emerald-700 transition"
        >
          {asset.name}
        </h3>
        <p className="text-[11px] text-slate-400 mt-1">
          Added: {formatDate(asset.createdAt)}
        </p>
      </div>
    </div>
  );
}
