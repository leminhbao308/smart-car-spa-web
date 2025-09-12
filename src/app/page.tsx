import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Header />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 64px)", flexDirection: "column", gap: "20px" }}>
        <h2>Home Page</h2>
        <Link style={{ padding: "12px 24px", backgroundColor: "#0070f3", color: "#fff", borderRadius: "4px", textDecoration: "none" }} href="/auth">Login</Link>
      </div>
      <Footer />
    </div>
  );
}
