/**
 * Warning Suppression for React 19 + Ant Design v5 Compatibility
 * This file suppresses known compatibility warnings that are safe to ignore
 */

// Only run on client side
if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  const originalError = console.log;

  // List of warnings to suppress
  const suppressedWarnings = [
    // Ant Design React 19 compatibility warnings
    "antd v5 support React is 16 ~ 18",
    "[antd: compatible]",
    "antd v5 support React is 16 ~ 18. see https://u.ant.design/v5-for-19 for compatible",
    "Warning: [antd: compatible] antd v5 support React is 16 ~ 18. see https://u.ant.design/v5-for-19 for compatible.",
    
    // React 19 specific warnings
    "Instance created by `useForm` is not connected to any Form element",
    "You are registering a cleanup function after unmount",
    "Ant Design CSS-in-JS",
    
    // Next.js specific warnings
    "Warning: ReactDOM.render is no longer supported",
    "Warning: ReactDOM.hydrate is no longer supported",
    
    // Other common React 19 warnings
    "Warning: componentWillReceiveProps has been renamed",
    "Warning: componentWillMount has been renamed",
    "Warning: componentWillUpdate has been renamed",
  ];

  // Override console.warn
  console.warn = (...args) => {
    const message = args[0];
    
    if (typeof message === "string") {
      // Check if this warning should be suppressed
      const shouldSuppress = suppressedWarnings.some(suppressedWarning => 
        message.includes(suppressedWarning)
      );
      
      if (shouldSuppress) {
        return; // Suppress this warning
      }
    }
    
    // Also check for Ant Design React 19 compatibility warnings in the full message
    const fullMessage = args.join(' ');
    if (typeof fullMessage === "string") {
      const shouldSuppressFull = suppressedWarnings.some(suppressedWarning => 
        fullMessage.includes(suppressedWarning)
      );
      
      if (shouldSuppressFull) {
        return; // Suppress this warning
      }
    }
    
    // Log the warning normally if it's not in our suppression list
    originalWarn.apply(console, args);
  };

  // Override console.log for specific errors
  console.log = (...args) => {
    const message = args[0];
    
    if (typeof message === "string") {
      // Check if this error should be suppressed
      const shouldSuppress = suppressedWarnings.some(suppressedWarning => 
        message.includes(suppressedWarning)
      );
      
      if (shouldSuppress) {
        return; // Suppress this error
      }
    }
    
    // Also check for Ant Design React 19 compatibility warnings in the full message
    const fullMessage = args.join(' ');
    if (typeof fullMessage === "string") {
      const shouldSuppressFull = suppressedWarnings.some(suppressedWarning => 
        fullMessage.includes(suppressedWarning)
      );
      
      if (shouldSuppressFull) {
        return; // Suppress this error
      }
    }
    
    // Log the error normally if it's not in our suppression list
    originalError.apply(console, args);
  };
}

// Export a function to manually suppress additional warnings if needed
export const suppressWarning = (warningPattern: string) => {
  if (typeof window !== "undefined") {
    const originalWarn = console.warn;
    
    console.warn = (...args) => {
      const message = args[0];
      
      if (typeof message === "string" && message.includes(warningPattern)) {
        return; // Suppress this warning
      }
      
      originalWarn.apply(console, args);
    };
  }
};
