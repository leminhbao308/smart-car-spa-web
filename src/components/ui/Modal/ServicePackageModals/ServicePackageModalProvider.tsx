"use client";
import React from "react";
import ServicePackageModal from "./ServicePackageModal";
import { useServicePackageModal } from "./useServicePackageModal";

interface ServicePackageModalProviderProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export const ServicePackageModalProvider: React.FC<ServicePackageModalProviderProps> = ({
  children,
  onSuccess,
}) => {
  const modalProps = useServicePackageModal();

  const handleSuccess = () => {
    modalProps.onSuccess();
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <>
      {children}
      <ServicePackageModal
        visible={modalProps.visible}
        mode={modalProps.mode}
        editData={modalProps.editData}
        onCancel={modalProps.closeModal}
        onSuccess={handleSuccess}
      />
    </>
  );
};

// Export the hook for direct use
export { useServicePackageModal };
