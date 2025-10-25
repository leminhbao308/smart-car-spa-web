"use client";
import React, { useState, useEffect, useRef } from "react";
import { Table } from "antd";
import type { TableProps } from "antd/es/table";

interface SafeTableProps<T = unknown> extends TableProps<T> {
  children?: React.ReactNode;
}

const SafeTable = <T = unknown,>(props: SafeTableProps<T>) => {
  const [isClient, setIsClient] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    setIsClient(true);
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Prevent CSS-in-JS cleanup warnings
  useEffect(() => {
    if (!isClient) return;

    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      const message = args[0];
      if (
        typeof message === "string" &&
        (message.includes("You are registering a cleanup function after unmount") ||
         message.includes("Ant Design CSS-in-JS") ||
         message.includes("cleanup function after unmount"))
      ) {
        return; // Suppress Ant Design CSS-in-JS warnings
      }
      originalConsoleWarn.apply(console, args);
    };

    return () => {
      if (isMountedRef.current) {
        console.warn = originalConsoleWarn;
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
      // Use rowKey as string or function without index parameter
      rowKey={props.rowKey || 'id'}
    />
  );
};

export default SafeTable;
