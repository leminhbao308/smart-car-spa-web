"use client";
import { useState, useCallback } from "react";

export interface UseConfirmationModalReturn {
  open: boolean;
  title?: string;
  content: string;
  type: "confirm" | "success" | "warning" | "error" | "info";
  loading: boolean;
  confirmText?: string;
  cancelText?: string;
  width?: number;
  showModal: (config: ShowModalConfig) => void;
  hideModal: () => void;
  setLoading: (loading: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface ShowModalConfig {
  title?: string;
  content: string;
  type?: "confirm" | "success" | "warning" | "error" | "info";
  confirmText?: string;
  cancelText?: string;
  width?: number;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export const useConfirmationModal = (): UseConfirmationModalReturn => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState<string>();
  const [content, setContent] = useState("");
  const [type, setType] = useState<"confirm" | "success" | "warning" | "error" | "info">("confirm");
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState<string>();
  const [cancelText, setCancelText] = useState<string>();
  const [width, setWidth] = useState<number>();
  const [onConfirmCallback, setOnConfirmCallback] = useState<() => void | Promise<void>>(() => {});
  const [onCancelCallback, setOnCancelCallback] = useState<(() => void) | undefined>();

  const showModal = useCallback((config: ShowModalConfig) => {
    setTitle(config.title);
    setContent(config.content);
    setType(config.type || "confirm");
    setConfirmText(config.confirmText);
    setCancelText(config.cancelText);
    setWidth(config.width);
    setOnConfirmCallback(() => config.onConfirm);
    setOnCancelCallback(() => config.onCancel);
    setOpen(true);
    setLoading(false);
  }, []);

  const hideModal = useCallback(() => {
    setOpen(false);
    setLoading(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    try {
      setLoading(true);
      await onConfirmCallback();
      hideModal();
    } catch (error) {
      console.error("Error in confirmation:", error);
      setLoading(false);
    }
  }, [onConfirmCallback, hideModal]);

  const handleCancel = useCallback(() => {
    if (onCancelCallback) {
      onCancelCallback();
    }
    hideModal();
  }, [onCancelCallback, hideModal]);

  return {
    open,
    title,
    content,
    type,
    loading,
    confirmText,
    cancelText,
    width,
    showModal,
    hideModal,
    setLoading,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  };
};
