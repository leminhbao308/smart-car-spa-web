import { Layout } from "antd";

const { Footer } = Layout;

const AdminFooter = () => {
  return (
    <Footer
      style={{
        display: "flex",

        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#33363F",
        borderRadius: "0.75rem 0.75rem 0 0",
        color: "#F0F1F2",
        height: "40px",
      }}
    >
      © 2025 Smart Car Spa. All Rights Reserved. Made with love by{" "}
      <b>Hoang Nam & Minh Bao</b>
    </Footer>
  );
};

export default AdminFooter;
