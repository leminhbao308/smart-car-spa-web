"use client";
import React, { useState, useEffect } from "react";
import { Menu, MenuProps, ConfigProvider } from "antd";

// Add CSS for pulse animation
const pulseStyle = `
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = pulseStyle;
  if (!document.head.querySelector('style[data-pulse]')) {
    styleSheet.setAttribute('data-pulse', 'true');
    document.head.appendChild(styleSheet);
  }
}

interface ClientOnlyMenuProps extends MenuProps {
  children?: React.ReactNode;
}

const ClientOnlyMenu: React.FC<ClientOnlyMenuProps> = ({ children, ...props }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render a placeholder during SSR
    return (
      <div
        style={{
          fontSize: props.style?.fontSize || "0.9rem",
          border: "none",
          backgroundColor: "transparent",
          height: "auto",
          minHeight: "100%",
        }}
      >
        {/* Placeholder content that matches the menu structure */}
        <div style={{ padding: "8px 0" }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              style={{
                height: "40px",
                margin: "4px 0",
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemPaddingInline: props.inlineCollapsed ? 8 : 16,
          },
        },
      }}
    >
      <Menu
        {...props}
        getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
      />
    </ConfigProvider>
  );
};

export default ClientOnlyMenu;
