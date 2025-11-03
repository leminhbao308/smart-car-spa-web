/**
 * Console Suppression for React 19 + Ant Design v5 Compatibility
 * This file provides immediate suppression of compatibility warnings
 */

// Immediate suppression for Ant Design React 19 warnings
if (typeof window !== "undefined") {
  // Store original console methods
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.log;

  // Override console.warn
  console.warn = (...args: any[]) => {
    const message = args[0];
    
    // Check for Ant Design React 19 compatibility warnings
    if (typeof message === "string") {
      if (
        message.includes("antd v5 support React is 16 ~ 18") ||
        message.includes("[antd: compatible]") ||
        message.includes("https://u.ant.design/v5-for-19")
      ) {
        return; // Suppress this warning
      }
    }
    
    // Check full message for warnings
    const fullMessage = args.join(' ');
    if (typeof fullMessage === "string") {
      if (
        fullMessage.includes("antd v5 support React is 16 ~ 18") ||
        fullMessage.includes("[antd: compatible]") ||
        fullMessage.includes("https://u.ant.design/v5-for-19")
      ) {
        return; // Suppress this warning
      }
    }
    
    // Log other warnings normally
    originalConsoleWarn.apply(console, args);
  };

  // Override console.log
  console.log = (...args: any[]) => {
    const message = args[0];
    
    // Check for Ant Design React 19 compatibility warnings
    if (typeof message === "string") {
      if (
        message.includes("antd v5 support React is 16 ~ 18") ||
        message.includes("[antd: compatible]") ||
        message.includes("https://u.ant.design/v5-for-19")
      ) {
        return; // Suppress this error
      }
    }
    
    // Check full message for errors
    const fullMessage = args.join(' ');
    if (typeof fullMessage === "string") {
      if (
        fullMessage.includes("antd v5 support React is 16 ~ 18") ||
        fullMessage.includes("[antd: compatible]") ||
        fullMessage.includes("https://u.ant.design/v5-for-19")
      ) {
        return; // Suppress this error
      }
    }
    
    // Log other errors normally
    originalConsoleError.apply(console, args);
  };
}

// Export for manual use if needed
export const suppressAntdWarnings = () => {
  if (typeof window !== "undefined") {
    const originalConsoleWarn = console.warn;
    
    console.warn = (...args: any[]) => {
      const message = args[0];
      if (typeof message === "string" && message.includes("antd v5 support React is 16 ~ 18")) {
        return;
      }
      originalConsoleWarn.apply(console, args);
    };
  }
};
