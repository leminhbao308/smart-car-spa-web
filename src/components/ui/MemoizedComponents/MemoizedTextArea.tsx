"use client";

import React, { memo } from "react";
import { Input } from "antd";

const { TextArea } = Input;

interface MemoizedTextAreaProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  placeholder?: string;
  maxLength?: number;
  showCount?: boolean;
  [key: string]: any;
}

const MemoizedTextArea = memo<MemoizedTextAreaProps>(({ value, onChange, ...props }) => {
  return <TextArea value={value} onChange={onChange} {...props} />;
});

MemoizedTextArea.displayName = "MemoizedTextArea";

export default MemoizedTextArea;
