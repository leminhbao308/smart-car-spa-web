"use client";

import React, { memo, useCallback } from "react";
import { Input, InputProps } from "antd";

interface MemoizedInputProps extends InputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Safe comparison function for objects that might contain circular references
const safeCompare = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  
  // For React elements, compare by reference
  if (React.isValidElement(a) && React.isValidElement(b)) {
    return a === b;
  }
  
  // For objects, try JSON.stringify with error handling
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch (error) {
    // If JSON.stringify fails (circular reference), fall back to reference comparison
    return a === b;
  }
};

const MemoizedInput = memo<MemoizedInputProps>(({ value, onChange, ...props }) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
  }, [onChange]);

  return <Input value={value} onChange={handleChange} {...props} />;
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.value === nextProps.value &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.size === nextProps.size &&
    safeCompare(prevProps.style, nextProps.style) &&
    safeCompare(prevProps.prefix, nextProps.prefix) &&
    safeCompare(prevProps.suffix, nextProps.suffix)
  );
});

MemoizedInput.displayName = "MemoizedInput";

export default MemoizedInput;
