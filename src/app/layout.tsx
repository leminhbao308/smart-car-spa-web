import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";
import "@/lib/early-warning-suppression"; // Import early warning suppression FIRST
import "@ant-design/v5-patch-for-react-19";
import { AuthProvider } from "@/lib/api";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { WebSocketProviderWrapper } from "@/providers/WebSocketProvider";
import { App } from "antd";
import { AntdConfigProvider } from "@/lib/antd-config";
import "@/lib/suppress-warnings"; // Import warning suppression
import "@/lib/console-suppression"; // Import immediate console suppression
import "@/lib/antd-warning-suppressor"; // Import comprehensive warning suppressor

export const metadata: Metadata = {
  title: "Smart Car Spa",
  description: "A web application for managing smart car services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <QueryProvider>
          <AuthProvider>
            <WebSocketProviderWrapper>
              <AntdRegistry>
                <AntdConfigProvider>
                  <App>{children}</App>
                </AntdConfigProvider>
              </AntdRegistry>
            </WebSocketProviderWrapper>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
