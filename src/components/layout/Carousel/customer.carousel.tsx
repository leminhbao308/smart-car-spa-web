"use client";
import { Carousel } from "antd";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export interface CarouselItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
}

interface CustomerCarouselProps {
  carouselData?: CarouselItem[];
}

const carouselItemStyle: React.CSSProperties = {
  position: "relative",
  height: "calc(100vh - 100px)",
  overflow: "hidden",
};

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "linear-gradient(45deg, rgba(0,0,0,0.6), rgba(0,0,0,0.3))",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  padding: "2rem",
  color: "white",
};

const titleStyle: React.CSSProperties = {
  fontSize: "2.5rem",
  fontWeight: "bold",
  marginBottom: "1rem",
  textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
};

const descriptionStyle: React.CSSProperties = {
  fontSize: "1.2rem",
  marginBottom: "2rem",
  maxWidth: "600px",
  lineHeight: "1.6",
  textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
};

const linkStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 30px",
  backgroundColor: "#1890ff",
  color: "white",
  textDecoration: "none",
  borderRadius: "25px",
  fontSize: "1.1rem",
  fontWeight: "600",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 15px rgba(24, 144, 255, 0.3)",
};

const imageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const CustomerCarousel = ({ carouselData = [] }: CustomerCarouselProps) => {
  const pathname = usePathname();
  
  // Chỉ hiển thị carousel ở trang chủ
  if (pathname !== "/") {
    return null;
  }

  return (
    <Carousel autoplay autoplaySpeed={5000} effect="fade">
      {carouselData.map((item) => (
        <div key={item.id}>
          <div style={carouselItemStyle}>
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              style={imageStyle}
              priority={item.id === 1}
            />
            <div style={overlayStyle}>
              <h2 style={titleStyle}>{item.title}</h2>
              <p style={descriptionStyle}>{item.description}</p>
              <Link href={item.linkUrl} style={linkStyle}>
                Xem chi tiết
              </Link>
            </div>
          </div>
        </div>
      ))}
    </Carousel>
  );
};

export default CustomerCarousel;
