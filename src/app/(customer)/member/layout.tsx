"use client";
import React from "react";
import ProtectedRoute from "@/components/common/ProtectedRoute";

const MemberLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute requiredRole="CUSTOMER">
      {children}
    </ProtectedRoute>
  );
};

export default MemberLayout;
