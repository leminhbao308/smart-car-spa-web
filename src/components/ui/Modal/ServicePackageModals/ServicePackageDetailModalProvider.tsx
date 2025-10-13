"use client";
import React, { createContext, useContext } from "react";
import { useServicePackageDetailModal } from "./useServicePackageDetailModal";
import ServicePackageDetailModal, { ServicePackageDetailModalProps } from "./ServicePackageDetailModal";
import { ServicePackage } from "@/lib/api/types/service-package.types";

interface ServicePackageDetailModalContextType {
  showDetailModal: (data: ServicePackage) => void;
  hideModal: () => void;
}

const ServicePackageDetailModalContext = createContext<
  ServicePackageDetailModalContextType | undefined
>(undefined);

export const ServicePackageDetailModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isModalVisible, data, showDetailModal, hideModal } = useServicePackageDetailModal();

  return (
    <ServicePackageDetailModalContext.Provider
      value={{ showDetailModal, hideModal }}
    >
      {children}
      <ServicePackageDetailModal
        visible={isModalVisible}
        onCancel={hideModal}
        data={data}
      />
    </ServicePackageDetailModalContext.Provider>
  );
};

export const useServicePackageDetailModalContext = () => {
  const context = useContext(ServicePackageDetailModalContext);
  if (!context) {
    throw new Error(
      "useServicePackageDetailModalContext must be used within a ServicePackageDetailModalProvider"
    );
  }
  return context;
};
