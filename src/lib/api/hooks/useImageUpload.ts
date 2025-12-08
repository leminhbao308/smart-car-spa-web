"use client";

import { useState, useCallback, useMemo } from "react";
import { message } from "antd";
import type { UploadFile } from "antd";

export interface ImageUploadConfig {
  maxSize?: number; // in bytes
  maxCount?: number;
  accept?: string;
  autoValidate?: boolean;
}

export interface ImageUploadResult {
  fileList: UploadFile[];
  setFileList: (files: UploadFile[]) => void;
  validateFile: (file: UploadFile) => boolean;
  validateFileList: (files: UploadFile[]) => boolean;
  clearFiles: () => void;
  handleChange: (info: { fileList: UploadFile[] }) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const DEFAULT_CONFIG: ImageUploadConfig = {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxCount: 1,
  accept: "image/*",
  autoValidate: true,
};

/**
 * Reusable hook for image upload functionality
 * Handles file validation, state management, and error handling
 */
export const useImageUpload = (
  config: ImageUploadConfig = {}
): ImageUploadResult => {
  // Destructure config for stable dependencies
  const {
    maxSize = DEFAULT_CONFIG.maxSize,
    maxCount = DEFAULT_CONFIG.maxCount,
    accept = DEFAULT_CONFIG.accept,
    autoValidate = DEFAULT_CONFIG.autoValidate,
  } = config;

  // Memoize finalConfig to prevent re-creating on every render
  const finalConfig = useMemo(
    () => ({ maxSize, maxCount, accept, autoValidate }),
    [maxSize, maxCount, accept, autoValidate]
  );

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate a single file
   */
  const validateFile = useCallback(
    (file: UploadFile): boolean => {
      setError(null);

      // Check file size
      if (file.size && finalConfig.maxSize && file.size > finalConfig.maxSize) {
        const maxSizeMB = (finalConfig.maxSize / (1024 * 1024)).toFixed(0);
        const errorMsg = `File "${file.name}" quá lớn! Kích thước tối đa là ${maxSizeMB}MB.`;
        setError(errorMsg);
        if (finalConfig.autoValidate) {
          message.error(errorMsg);
        }
        return false;
      }

      // Check file type
      if (finalConfig.accept && file.type) {
        const acceptTypes = finalConfig.accept.split(",").map((t) => t.trim());
        const isAccepted = acceptTypes.some((type) => {
          if (type === "image/*") return file.type?.startsWith("image/");
          if (type.endsWith("/*"))
            return file.type?.startsWith(type.replace("/*", ""));
          return file.type === type;
        });

        if (!isAccepted) {
          const errorMsg = `File "${file.name}" không đúng định dạng! Chỉ chấp nhận: ${finalConfig.accept}`;
          setError(errorMsg);
          if (finalConfig.autoValidate) {
            message.error(errorMsg);
          }
          return false;
        }
      }

      return true;
    },
    [finalConfig]
  );

  /**
   * Validate file list
   */
  const validateFileList = useCallback(
    (files: UploadFile[]): boolean => {
      setError(null);

      // Check max count
      if (finalConfig.maxCount && files.length > finalConfig.maxCount) {
        const errorMsg = `Chỉ được chọn tối đa ${finalConfig.maxCount} file!`;
        setError(errorMsg);
        if (finalConfig.autoValidate) {
          message.error(errorMsg);
        }
        return false;
      }

      // Validate each file
      for (const file of files) {
        if (!validateFile(file)) {
          return false;
        }
      }

      return true;
    },
    [finalConfig, validateFile]
  );

  /**
   * Handle file list change
   */
  const handleChange = useCallback(
    (info: { fileList: UploadFile[] }) => {
      const { fileList: newFileList } = info;

      // Validate if autoValidate is enabled
      if (finalConfig.autoValidate) {
        // Check individual file validation
        if (newFileList.length > 0) {
          const lastFile = newFileList.at(-1);
          if (lastFile && !validateFile(lastFile)) {
            return; // Don't update file list if validation fails
          }
        }

        // Check count validation
        if (finalConfig.maxCount && newFileList.length > finalConfig.maxCount) {
          message.error(`Chỉ được chọn tối đa ${finalConfig.maxCount} file!`);
          return;
        }
      }

      setFileList(newFileList);
      setError(null);
    },
    [finalConfig, validateFile]
  );

  /**
   * Clear all files
   */
  const clearFiles = useCallback(() => {
    setFileList([]);
    setError(null);
  }, []);

  return {
    fileList,
    setFileList,
    validateFile,
    validateFileList,
    clearFiles,
    handleChange,
    error,
    setError,
  };
};
