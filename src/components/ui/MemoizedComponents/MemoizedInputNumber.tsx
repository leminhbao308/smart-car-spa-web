"use client";

import React, { memo } from "react";
import { InputNumber } from "antd";

interface MemoizedInputNumberProps {
  value?: number | string;
  onChange?: (value: number | string | null) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  formatter?: (value: string | number | undefined) => string;
  parser?: (value: string | undefined) => string | number;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  [key: string]: any;
}

const MemoizedInputNumber = memo<MemoizedInputNumberProps>(({ value, onChange, ...props }) => {
  return <InputNumber value={value} onChange={onChange} {...props} />;
});

MemoizedInputNumber.displayName = "MemoizedInputNumber";

export default MemoizedInputNumber;
