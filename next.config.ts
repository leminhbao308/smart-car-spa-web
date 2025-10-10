import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React 19 compatibility settings
  experimental: {
    // Enable React 19 features
    reactCompiler: false, // Disable React Compiler for now
  },
  
  // Webpack configuration for better Ant Design compatibility
  webpack: (config) => {
    // Ensure proper module resolution for Ant Design
    config.resolve.alias = {
      ...config.resolve.alias,
      'antd/es': 'antd/lib',
    };
    
    return config;
  },
  
  // Transpile packages for better compatibility
  transpilePackages: ['antd', '@ant-design/icons', '@ant-design/nextjs-registry'],
  
  // Compiler options for React 19
  compiler: {
    // Remove console logs in productions
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
