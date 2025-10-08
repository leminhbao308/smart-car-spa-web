"use client";

import React, { memo, useCallback } from "react";
import { Input, InputProps } from "antd";

interface MemoizedInputProps extends InputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

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
    JSON.stringify(prevProps.style) === JSON.stringify(nextProps.style) &&
    JSON.stringify(prevProps.prefix) === JSON.stringify(nextProps.prefix) &&
    JSON.stringify(prevProps.suffix) === JSON.stringify(nextProps.suffix)
  );
});

MemoizedInput.displayName = "MemoizedInput";

export default MemoizedInput;
