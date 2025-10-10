import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";
import "@ant-design/v5-patch-for-react-19";
import { AuthProvider } from "@/lib/api";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { App } from "antd";
import { AntdConfigProvider } from "@/lib/antd-config";
import "@/lib/suppress-warnings"; // Import warning suppression

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
            <AntdRegistry>
              <AntdConfigProvider>
                <App>{children}</App>
              </AntdConfigProvider>
            </AntdRegistry>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
