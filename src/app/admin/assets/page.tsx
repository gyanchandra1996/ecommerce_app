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
  const [loadingMore, setLoadingMore] = useState(false);
  const [isS3Enabled, setIsS3Enabled] = useState(false);

  const [filters, setFilters] = useState<AssetFilters>({
    search: "",
    fileType: "all",
    sort: "recent",
    page: 1,
    pageSize: 24,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [multiselect, setMultiselect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Check storage settings on mount
  useEffect(() => {
    fetch("/api/settings/storage")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setIsS3Enabled(Boolean(json.data.s3Enabled || json.data.provider === "s3"));
        }
      })
      .catch(() => {});
  }, []);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AssetClientService.fetchAssets({
        ...filters,
        page: 1,
      });
      setAssets(res.items);
      setTotalPages(res.totalPages);
      setTotalCount(res.total);
      if (typeof res.isS3Enabled === "boolean") {
        setIsS3Enabled(res.isS3Enabled);
      }
      setFilters((prev) => ({ ...prev, page: 1 }));
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.fileType, filters.storage, filters.sort, filters.pageSize]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleLoadMore = async () => {
    if (loadingMore || loading || assets.length >= totalCount) return;
    const nextPage = filters.page + 1;
    setLoadingMore(true);
    try {
      const res = await AssetClientService.fetchAssets({
        ...filters,
        page: nextPage,
      });
      setAssets((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const novel = res.items.filter((a) => !existingIds.has(a.id));
        return [...prev, ...novel];
      });
      setFilters((prev) => ({ ...prev, page: nextPage }));
      setTotalPages(res.totalPages);
      setTotalCount(res.total);
      if (typeof res.isS3Enabled === "boolean") {
        setIsS3Enabled(res.isS3Enabled);
      }
    } catch (err) {
      console.error("Failed to load more assets:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<AssetFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
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

  const handleBatchSyncS3 = async () => {
    if (!selectedIds.length) return;
    try {
      const res = await fetch("/api/assets/sync-s3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetIds: selectedIds }),
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message || `Successfully synced ${selectedIds.length} asset(s) to AWS S3.`);
        setSelectedIds([]);
        loadAssets();
      } else {
        alert(json.error || "Failed to sync assets to S3.");
      }
    } catch {
      alert("Error syncing assets to S3.");
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
    setTotalCount((prev) => Math.max(0, prev - 1));
  };

  const hasMore = assets.length < totalCount;

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
        onBatchSyncS3={handleBatchSyncS3}
        onSelectAll={handleSelectAll}
        isS3Enabled={isS3Enabled}
      />

      {/* Grid / List of Assets with Load More pagination */}
      <AssetGrid
        assets={assets}
        loading={loading}
        viewMode={viewMode}
        multiselect={multiselect}
        selectedIds={selectedIds}
        onSelectId={handleSelectId}
        onAssetClick={handleAssetClick}
        onOpenUpload={() => setIsUploadOpen(true)}
        onAssetUpdated={handleAssetUpdated}
        page={filters.page}
        totalPages={totalPages}
        totalCount={totalCount}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        loadingMore={loadingMore}
        isS3Enabled={isS3Enabled}
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
        isS3Enabled={isS3Enabled}
      />
    </div>
  );
}
