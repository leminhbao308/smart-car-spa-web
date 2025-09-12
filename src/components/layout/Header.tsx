import Image from "next/image";
export default function Header() {
  return (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1000 }}>
      <Image
        src="/Main Logo_Light.png"
        alt="Smart Car Spa Logo"
        width={80}
        height={80}
      />
    </header>
  );
}
