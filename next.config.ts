import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React 19 compatibility settings
  experimental: {
    // Enable React 19 features
    reactCompiler: true,
    // Tối ưu cho EC2: giảm số lượng workers để tiết kiệm memory
    ...(process.env.NODE_ENV === "development" && {
      // Có thể tắt một số tính năng không cần thiết trong dev mode trên EC2
    }),
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
