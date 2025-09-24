"use client";
import React from "react";
import ConfirmationModal from "./ConfirmationModal";
import { useConfirmationModal, ShowModalConfig } from "./useConfirmationModal";

interface ConfirmationModalProviderProps {
  children: React.ReactNode;
}

export const ConfirmationModalContext = React.createContext<{
  showModal: (config: ShowModalConfig) => void;
  hideModal: () => void;
  setLoading: (loading: boolean) => void;
} | null>(null);

export const ConfirmationModalProvider: React.FC<ConfirmationModalProviderProps> = ({ children }) => {
  const modal = useConfirmationModal();

  return (
    <ConfirmationModalContext.Provider
      value={{
        showModal: modal.showModal,
        hideModal: modal.hideModal,
        setLoading: modal.setLoading,
      }}
    >
      {children}
      <ConfirmationModal
        open={modal.open}
        title={modal.title}
        content={modal.content}
        type={modal.type}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        loading={modal.loading}
        width={modal.width}
      />
    </ConfirmationModalContext.Provider>
  );
};

export const useConfirmationModalContext = () => {
  const context = React.useContext(ConfirmationModalContext);
  if (!context) {
    throw new Error("useConfirmationModalContext must be used within ConfirmationModalProvider");
  }
  return context;
};
