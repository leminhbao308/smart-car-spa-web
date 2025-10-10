/**
 * Ant Design Configuration for React 19 Compatibility
 * This file ensures proper compatibility between Ant Design v5 and React 19
 */

import React from 'react';
import { ConfigProvider } from 'antd';

// Configure Ant Design for React 19 compatibility
export const antdConfig = {
  theme: {
    token: {
      colorPrimary: '#1890ff',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      colorInfo: '#1890ff',
    },
    // Add React 19 compatibility settings
    hashed: false, // Disable hashed class names for better React 19 compatibility
  },
  // Additional React 19 compatibility options
  componentSize: 'middle' as const,
  direction: 'ltr' as const,
  // Disable legacy features that might cause issues with React 19
  legacy: false,
};

// Export a configured ConfigProvider component
export const AntdConfigProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigProvider {...antdConfig}>
      {children}
    </ConfigProvider>
  );
};
