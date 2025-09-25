import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";
import "@ant-design/v5-patch-for-react-19";
import { AuthProvider } from "@/lib/api";
import { App, ConfigProvider } from "antd";

// Suppress specific React warnings that are false positives
if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args[0];
    if (
      typeof message === "string" &&
      (message.includes(
        "Instance created by `useForm` is not connected to any Form element"
      ) ||
      message.includes("You are registering a cleanup function after unmount") ||
      message.includes("Ant Design CSS-in-JS"))
    ) {
      return; // Suppress these specific warnings
    }
    originalWarn.apply(console, args);
  };
}

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
        <AuthProvider>
          <AntdRegistry>
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: '#1890ff',
                  colorSuccess: '#52c41a',
                  colorWarning: '#faad14',
                  colorError: '#ff4d4f',
                  colorInfo: '#1890ff',
                },
              }}
            >
              <App>{children}</App>
            </ConfigProvider>
          </AntdRegistry>
        </AuthProvider>
      </body>
    </html>
  );
}
