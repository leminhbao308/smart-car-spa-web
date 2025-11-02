/**
 * Early Warning Suppression for Ant Design React 19 Compatibility
 * This file runs immediately to suppress warnings before any components load
 */

// Immediate suppression - runs as soon as this file is imported
(function() {
  'use strict';
  
  // Only run on client side
  if (typeof window === "undefined") return;
  
  // Store original console methods
  const originalWarn = console.warn;
  const originalError = console.log;
  const originalLog = console.log;
  
  // Patterns to suppress
  const antdPatterns = [
    'antd v5 support React is 16 ~ 18',
    '[antd: compatible]',
    'https://u.ant.design/v5-for-19',
    'Warning: [antd: compatible] antd v5 support React is 16 ~ 18. see https://u.ant.design/v5-for-19 for compatible.',
  ];
  
  // Check if message should be suppressed
  const shouldSuppress = (message: string): boolean => {
    return antdPatterns.some(pattern => message.includes(pattern));
  };
  
  // Override console.warn
  console.warn = function(...args: any[]) {
    const message = args[0];
    if (typeof message === "string" && shouldSuppress(message)) {
      return;
    }
    const fullMessage = args.join(' ');
    if (typeof fullMessage === "string" && shouldSuppress(fullMessage)) {
      return;
    }
    originalWarn.apply(console, args);
  };
  
  // Override console.log
  console.log = function(...args: any[]) {
    const message = args[0];
    if (typeof message === "string" && shouldSuppress(message)) {
      return;
    }
    const fullMessage = args.join(' ');
    if (typeof fullMessage === "string" && shouldSuppress(fullMessage)) {
      return;
    }
    originalError.apply(console, args);
  };
  
  // Override console.log
  console.log = function(...args: any[]) {
    const message = args[0];
    if (typeof message === "string" && shouldSuppress(message)) {
      return;
    }
    const fullMessage = args.join(' ');
    if (typeof fullMessage === "string" && shouldSuppress(fullMessage)) {
      return;
    }
    originalLog.apply(console, args);
  };
  
  // Also override other console methods
  const consoleMethods = ['info', 'debug', 'trace'];
  consoleMethods.forEach(method => {
    const originalMethod = (console as any)[method];
    if (typeof originalMethod === 'function') {
      (console as any)[method] = function(...args: any[]) {
        const message = args[0];
        if (typeof message === "string" && shouldSuppress(message)) {
          return;
        }
        const fullMessage = args.join(' ');
        if (typeof fullMessage === "string" && shouldSuppress(fullMessage)) {
          return;
        }
        originalMethod.apply(console, args);
      };
    }
  });
})();

// Export for manual use
export const suppressEarlyWarnings = () => {
  // This function is already executed above, but we export it for completeness
  console.log('Early warning suppression is already active');
};
