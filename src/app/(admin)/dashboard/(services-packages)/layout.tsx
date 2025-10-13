"use client";
import React from "react";

interface ServicesPackagesLayoutProps {
  children: React.ReactNode;
}

const ServicesPackagesLayout: React.FC<ServicesPackagesLayoutProps> = ({
  children,
}) => {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {children}
    </div>
  );
};

export default ServicesPackagesLayout;
