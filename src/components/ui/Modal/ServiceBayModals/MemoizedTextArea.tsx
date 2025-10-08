"use client";

import React, { memo } from "react";
import { Input, InputProps } from "antd";

const { TextArea } = Input;

interface MemoizedTextAreaProps extends InputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const MemoizedTextArea = memo<MemoizedTextAreaProps>(({ value, onChange, ...props }) => {
  return <TextArea value={value} onChange={onChange} {...props} />;
});

MemoizedTextArea.displayName = "MemoizedTextArea";

export default MemoizedTextArea;
