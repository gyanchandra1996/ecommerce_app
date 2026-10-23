"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AssetFilterToolbar } from "@/modules/assets/components/AssetFilterToolbar";
import { AssetGrid } from "@/modules/assets/components/AssetGrid";
import { AssetUploaderModal } from "@/modules/assets/components/AssetUploaderModal";
import { AssetDetailModal } from "@/modules/assets/components/AssetDetailModal";
import { AssetClientService } from "@/modules/assets/services/asset.service";
import { Asset, AssetFilters } from "@/modules/assets/types/asset.types";

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AssetFilters>({
    search: "",
    fileType: "all",
    sort: "recent",
    page: 1,
    pageSize: 20,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [multiselect, setMultiselect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AssetClientService.fetchAssets(filters);
      setAssets(res.items);
      setTotalPages(res.totalPages);
      setTotalCount(res.total);
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleFilterChange = (newFilters: Partial<AssetFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === assets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(assets.map((a) => a.id));
    }
  };

  const handleBatchDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected assets?`)) return;

    try {
      await AssetClientService.deleteBatch(selectedIds);
      setSelectedIds([]);
      loadAssets();
    } catch {
      alert("Failed to delete selected assets.");
    }
  };

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDetailOpen(true);
  };

  const handleUploadSuccess = () => {
    loadAssets();
  };

  const handleAssetUpdated = (updated: Asset) => {
    setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setSelectedAsset(updated);
  };

  const handleAssetDeleted = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  return (
    <div>
      {/* Page Title matching Image 1 */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Assets</h1>
      </div>

      {/* Toolbar */}
      <AssetFilterToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        multiselect={multiselect}
        onMultiselectToggle={(active) => {
          setMultiselect(active);
          if (!active) setSelectedIds([]);
        }}
        onOpenUploadModal={() => setIsUploadOpen(true)}
        selectedCount={selectedIds.length}
        totalCount={assets.length}
        onBatchDelete={handleBatchDelete}
        onSelectAll={handleSelectAll}
      />

      {/* Grid / List of Assets */}
      <AssetGrid
        assets={assets}
        loading={loading}
        viewMode={viewMode}
        multiselect={multiselect}
        selectedIds={selectedIds}
        onSelectId={handleSelectId}
        onAssetClick={handleAssetClick}
        onOpenUpload={() => setIsUploadOpen(true)}
        page={filters.page}
        totalPages={totalPages}
        onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
      />

      {/* Upload Modal with Progress Bar */}
      <AssetUploaderModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Detail / Edit / Product Attach Modal */}
      <AssetDetailModal
        asset={selectedAsset}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedAsset(null);
        }}
        onAssetUpdated={handleAssetUpdated}
        onAssetDeleted={handleAssetDeleted}
      />
    </div>
  );
}
