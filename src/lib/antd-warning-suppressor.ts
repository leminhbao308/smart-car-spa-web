/**
 * Ant Design Warning Suppressor for React 19
 * This file provides comprehensive suppression of Ant Design React 19 compatibility warnings
 */

// Only run on client side
if (typeof window !== "undefined") {
  // Store original console methods
  const originalWarn = console.warn;
  const originalError = console.log;
  const originalLog = console.log;

  // List of patterns to suppress
  const suppressPatterns = [
    "antd v5 support React is 16 ~ 18",
    "[antd: compatible]",
    "https://u.ant.design/v5-for-19",
    "Warning: [antd: compatible]",
    "antd v5 support React is 16 ~ 18. see https://u.ant.design/v5-for-19 for compatible",
  ];

  // Function to check if message should be suppressed
  const shouldSuppress = (message: string): boolean => {
    return suppressPatterns.some(pattern => message.includes(pattern));
  };

  // Override console.warn
  console.warn = (...args: any[]) => {
    const message = args[0];
    
    if (typeof message === "string" && shouldSuppress(message)) {
      return; // Suppress this warning
    }
    
    // Check full message
    const fullMessage = args.join(' ');
    if (typeof fullMessage === "string" && shouldSuppress(fullMessage)) {
      return; // Suppress this warning
    }
    
    // Log other warnings normally
    originalWarn.apply(console, args);
  };

  // Override console.log
  console.log = (...args: any[]) => {
    const message = args[0];
    
    if (typeof message === "string" && shouldSuppress(message)) {
      return; // Suppress this error
    }
    
    // Check full message
    const fullMessage = args.join(' ');
    if (typeof fullMessage === "string" && shouldSuppress(fullMessage)) {
      return; // Suppress this error
    }
    
    // Log other errors normally
    originalError.apply(console, args);
  };

  // Override console.log for any Ant Design warnings that might come through
  console.log = (...args: any[]) => {
    const message = args[0];
    
    if (typeof message === "string" && shouldSuppress(message)) {
      return; // Suppress this log
    }
    
    // Check full message
    const fullMessage = args.join(' ');
    if (typeof fullMessage === "string" && shouldSuppress(fullMessage)) {
      return; // Suppress this log
    }
    
    // Log other messages normally
    originalLog.apply(console, args);
  };

  // Also suppress warnings that might come from React DevTools
  const originalConsole = { ...console };
  
  // Override all console methods
  Object.keys(console).forEach(key => {
    const originalMethod = (console as any)[key];
    if (typeof originalMethod === 'function') {
      (console as any)[key] = (...args: any[]) => {
        const message = args[0];
        
        if (typeof message === "string" && shouldSuppress(message)) {
          return; // Suppress this message
        }
        
        // Check full message
        const fullMessage = args.join(' ');
        if (typeof fullMessage === "string" && shouldSuppress(fullMessage)) {
          return; // Suppress this message
        }
        
        // Call original method
        originalMethod.apply(console, args);
      };
    }
  });
}

// Export for manual use
export const suppressAntdWarnings = () => {
  if (typeof window !== "undefined") {
    const originalWarn = console.warn;
    
    console.warn = (...args: any[]) => {
      const message = args[0];
      if (typeof message === "string" && message.includes("antd v5 support React is 16 ~ 18")) {
        return;
      }
      originalWarn.apply(console, args);
    };
  }
};

// Auto-initialize
export default suppressAntdWarnings;
