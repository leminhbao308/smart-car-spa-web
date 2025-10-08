"use client";

import React, { memo } from "react";
import { Input, InputProps } from "antd";

interface MemoizedInputProps extends InputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const MemoizedInput = memo<MemoizedInputProps>(({ value, onChange, ...props }) => {
  return <Input value={value} onChange={onChange} {...props} />;
});

MemoizedInput.displayName = "MemoizedInput";

export default MemoizedInput;
