"use client";
import { CartProvider } from "@/contexts/CartContext";

const AuthenticationLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <CartProvider>
      <div>{children}</div>
    </CartProvider>
  );
};

export default AuthenticationLayout;
