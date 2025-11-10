import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React 19 compatibility settings
  experimental: {
    // Enable React 19 features
    // Tắt React Compiler trong dev mode trên EC2 để tiết kiệm memory
    // reactCompiler: process.env.NODE_ENV === "production",
    reactCompiler: false, // Giữ lại nếu memory đủ, tắt nếu thiếu memory
  },

  // Image configuration for external domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com", // AWS S3 buckets
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com", // Firebase Storage
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
    ],
  },
  transpilePackages: [
    "antd",
    "@ant-design/icons",
    "@ant-design/nextjs-registry",
  ],

  // Compiler options for React 19
  compiler: {
    // Remove console logs in productions
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
