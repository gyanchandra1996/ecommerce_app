"use client";

import React from "react";
import { CategoryRecord } from "@/core/db/store";
import { CategoryFormModal } from "./CategoryFormModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryRecord[];
  onCategoryCreated?: (category: CategoryRecord) => void;
  onCategorySaved?: (category: CategoryRecord) => void;
  defaultParentId?: string | null;
  editingCategory?: CategoryRecord | null;
}

export function AddCategoryModal({
  isOpen,
  onClose,
  categories,
  onCategoryCreated,
  onCategorySaved,
  defaultParentId = null,
  editingCategory = null,
}: Props) {
  const handleSaved = (cat: CategoryRecord) => {
    if (onCategorySaved) onCategorySaved(cat);
    if (onCategoryCreated) onCategoryCreated(cat);
  };

  return (
    <CategoryFormModal
      isOpen={isOpen}
      onClose={onClose}
      categories={categories}
      onCategorySaved={handleSaved}
      defaultParentId={defaultParentId}
      editingCategory={editingCategory}
    />
  );
}
