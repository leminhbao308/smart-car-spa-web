import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";
import "@ant-design/v5-patch-for-react-19";
import { AuthProvider } from "@/lib/api";
import { App } from "antd";

// Suppress specific React warnings that are false positives
if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args[0];
    if (
      typeof message === "string" &&
      message.includes(
        "Instance created by `useForm` is not connected to any Form element"
      )
    ) {
      return; // Suppress this specific warning
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
            <App>{children}</App>
          </AntdRegistry>
        </AuthProvider>
      </body>
    </html>
  );
}
