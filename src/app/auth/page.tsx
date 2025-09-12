import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div>
      <Header />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: "20px",
        }}
      >
        <h2>Login Page</h2>
        <Link
          style={{
            padding: "12px 24px",
            backgroundColor: "#EE5D50",
            color: "#fff",
            borderRadius: "4px",
            textDecoration: "none",
          }}
          href="/"
        >
          Go to Home
        </Link>
      </div>
      
      <Footer />
    </div>
  );
}
