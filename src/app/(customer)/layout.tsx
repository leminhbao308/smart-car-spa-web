import CustomerCarousel from "@/components/layout/Carousel/customer.carousel";
import CustomerFooter from "@/components/layout/Footer/customer.footer";
import CustomerHeader from "@/components/layout/Header/customer.header";
import { carouselData } from "@/components/utils/data/carousel.data";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import ProtectedRoute from "@/components/common/ProtectedRoute";

const CustomerLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute requiredRole="CUSTOMER">
      <Layout
        style={{ backgroundColor: "#F4F7FE", width: "100%", height: "100%" }}
      >
        <CustomerHeader />
        <CustomerCarousel carouselData={carouselData} />
        <Content>{children}</Content>
        {/* Footer */}
        <CustomerFooter />
      </Layout>
    </ProtectedRoute>
  );
};

export default CustomerLayout;
