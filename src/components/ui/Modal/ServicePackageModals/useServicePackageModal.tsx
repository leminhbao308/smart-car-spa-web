"use client";
import { useState, useCallback } from "react";
import { ServicePackage } from "@/lib/api/types/service-package.types";

export const useServicePackageModal = () => {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editData, setEditData] = useState<ServicePackage | null>(null);

  const openCreateModal = useCallback(() => {
    setMode("create");
    setEditData(null);
    setVisible(true);
  }, []);

  const openEditModal = useCallback((data: ServicePackage) => {
    setMode("edit");
    setEditData(data);
    setVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setVisible(false);
    setEditData(null);
  }, []);

  const onSuccess = useCallback(() => {
    // This will be called when the operation is successful
    // The parent component should handle refreshing the data
  }, []);

  return {
    visible,
    mode,
    editData,
    openCreateModal,
    openEditModal,
    closeModal,
    onSuccess,
  };
};
