"use client";
import React from "react";
import { Layout } from "antd";
import AdminFooter from "@/components/layout/Footer/admin.footer";
import AdminHeader from "@/components/layout/Header/admin.header";
import AdminSider from "@/components/layout/Sider/admin.sider";
import { ConfirmationModalProvider } from "@/components/ui/Modal";
import { SiderProvider } from "@/components/providers/SiderContext";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import "@/styles/sider.css";
const { Content } = Layout;

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <ConfirmationModalProvider>
        <SiderProvider>
          <Layout style={{ minHeight: "100vh" }}>
            <AdminSider />
            <Layout style={{ backgroundColor: "#F4F7FE", margin: "0 1rem" }}>
              <AdminHeader />
              <Content
                style={{
                  marginBottom: "1rem",
                  flex: 1,
                  borderRadius: "1rem",
                }}
              >
                <div
                  style={{
                    padding: 24,
                    height: "100%",
                    background: "#fff",
                    borderRadius: "0.75rem",
                  }}
                >
                  {children}
                </div>
              </Content>
              <AdminFooter />
            </Layout>
          </Layout>
        </SiderProvider>
      </ConfirmationModalProvider>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
