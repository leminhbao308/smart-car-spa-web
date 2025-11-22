"use client";
import React from "react";
import { Button, Space } from "antd";
import { QuickAction } from "./types";

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick: (action: QuickAction) => void;
  disabled?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  onActionClick,
  disabled = false,
}) => {
  if (actions.length === 0) return null;

  return (
    <div
      style={{
        padding: "12px 16px",
        borderTop: "1px solid #f0f0f0",
        backgroundColor: "#fafafa",
      }}
    >
      <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
        Gợi ý câu hỏi:
      </div>
      <Space wrap size={[8, 8]}>
        {actions.map((action) => (
          <Button
            key={action.id}
            size="small"
            onClick={() => onActionClick(action)}
            disabled={disabled}
            style={{
              borderRadius: "16px",
              fontSize: "12px",
              height: "28px",
              borderColor: "#d9d9d9",
            }}
          >
            {action.label}
          </Button>
        ))}
      </Space>
    </div>
  );
};

export default QuickActions;

