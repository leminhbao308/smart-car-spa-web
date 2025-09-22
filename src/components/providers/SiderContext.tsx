"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface SiderContextType {
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const SiderContext = createContext<SiderContextType | undefined>(undefined);

export const useSiderContext = () => {
  const context = useContext(SiderContext);
  if (!context) {
    throw new Error("useSiderContext must be used within a SiderProvider");
  }
  return context;
};

interface SiderProviderProps {
  children: ReactNode;
}

export const SiderProvider: React.FC<SiderProviderProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <SiderContext.Provider
      value={{
        collapsed,
        toggleCollapsed,
        setCollapsed,
      }}
    >
      {children}
    </SiderContext.Provider>
  );
};
