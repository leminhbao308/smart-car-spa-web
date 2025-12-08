"use client";
import React, { useState, useEffect, useRef } from "react";
import { Table, ConfigProvider } from "antd";
import type { TableProps } from "antd/es/table";

interface ClientOnlyTableProps<T = unknown> extends TableProps<T> {
  children?: React.ReactNode;
}

const ClientOnlyTable = <T = unknown,>(props: ClientOnlyTableProps<T>) => {
  const [isClient, setIsClient] = useState(false);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    setIsClient(true);
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Inject CSS for the loading animation with proper cleanup
  useEffect(() => {
    if (!isClient) return;

    // Only create style if it doesn't exist
    if (!styleRef.current) {
      const style = document.createElement("style");
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
      styleRef.current = style;
    }

    return () => {
      if (styleRef.current && isMountedRef.current) {
        try {
          document.head.removeChild(styleRef.current);
        } catch (error) {
          // Style element might already be removed
          console.warn("Style element already removed:", error);
        }
        styleRef.current = null;
      }
    };
  }, [isClient]);

  if (!isClient) {
    // Render a placeholder during SSR
    return (
      <div
        style={{
          width: "100%",
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
          borderRadius: "6px",
          border: "1px solid #d9d9d9",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              border: "2px solid #1890ff",
              borderTop: "2px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <span style={{ color: "#666", fontSize: "14px" }}>Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <Table 
      {...props} 
      rowKey={props.rowKey || 'id'}
    />
  );
};

export default ClientOnlyTable;
