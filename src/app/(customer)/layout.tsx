import CustomerCarousel from "@/components/layout/Carousel/customer.carousel";
import CustomerFooter from "@/components/layout/Footer/customer.footer";
import CustomerHeader from "@/components/layout/Header/customer.header";
import { carouselData } from "@/components/utils/data/carousel.data";
import { CartProvider } from "@/contexts/CartContext";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";

const CustomerLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <CartProvider>
      <Layout
        style={{ backgroundColor: "#F4F7FE", width: "100%", height: "100%" }}
      >
        <CustomerHeader />
        <CustomerCarousel carouselData={carouselData} />
        <Content>{children}</Content>
        {/* Footer */}
        <CustomerFooter />
      </Layout>
    </CartProvider>
  );
};

export default CustomerLayout;
