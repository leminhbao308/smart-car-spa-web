"use client";
import React from "react";
import { Card, Typography, Row, Col, Button } from "antd";
import Image from "next/image";

const { Title, Text } = Typography;

interface NewsCardProps {
  title: string;
  description: string;
  image: string;
  date?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({
  title,
  description,
  image,
  date,
}) => (
  <Card
    hoverable
    style={{
      borderRadius: "12px",
      overflow: "hidden",
      height: "100%",
      border: "1px solid #E0E0E0",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      transition: "all 0.3s ease",
    }}
    bodyStyle={{ padding: 0 }}
  >
    {/* News Image */}
    <div
      style={{
        position: "relative",
        width: "100%",
        paddingBottom: "60%",
        overflow: "hidden",
      }}
    >
      <Image
        src={image}
        alt={title}
        fill
        style={{ objectFit: "cover" }}
      />
    </div>

    {/* News Content */}
    <div style={{ padding: "20px" }}>
      <Title level={4} style={{ margin: "0 0 12px 0", fontSize: "16px", lineHeight: "1.4" }}>
        {title}
      </Title>
      
      <Text
        style={{
          color: "#666",
          fontSize: "14px",
          lineHeight: "1.5",
          display: "block",
          marginBottom: "16px",
        }}
      >
        {description}
      </Text>

      {date && (
        <Text
          style={{
            color: "#999",
            fontSize: "12px",
            display: "block",
            marginBottom: "16px",
          }}
        >
          {date}
        </Text>
      )}

      <Button
        type="primary"
        style={{
          backgroundColor: "#1890ff",
          borderColor: "#1890ff",
          borderRadius: "6px",
          fontSize: "14px",
          height: "32px",
          padding: "0 16px",
        }}
      >
        Chi tiết
      </Button>
    </div>
  </Card>
);

const NewsSection: React.FC = () => {
  const newsItems = [
    {
      title: "Khi nào cần thay nước làm mát động cơ ô tô?",
      description: "Nước làm mát là hỗn hợp giữa 50% khối lượng nước và 50% khối lượng ethylene glycol nguyên chất có đặc tính...",
      image: "/images/background01.jpg",
      date: "15/01/2025",
    },
    {
      title: "6 sai lầm khi bảo dưỡng ô tô khiến bạn \"tiền mất tật mang\"",
      description: "Có những điều nghe ai cũng nói, tưởng là đúng, nhưng thật ra lại sai. Nếu đang chăm xe theo 6 cách dưới đây...",
      image: "/images/background02.jpg",
      date: "12/01/2025",
    },
    {
      title: "Hướng dẫn chọn phim cách nhiệt ô tô phù hợp",
      description: "Phim cách nhiệt không chỉ giúp bảo vệ nội thất xe khỏi tia UV mà còn tăng tính thẩm mỹ và an toàn...",
      image: "/images/background03.jpg",
      date: "10/01/2025",
    },
    {
      title: "Công nghệ phủ ceramic - Xu hướng bảo vệ sơn xe mới",
      description: "Phủ ceramic là công nghệ tiên tiến giúp bảo vệ sơn xe khỏi các tác động từ môi trường bên ngoài...",
      image: "/images/background04.png",
      date: "08/01/2025",
    },
  ];

  return (
    <div style={{ padding: "0 20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Section Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <Title level={2} style={{ color: "#333", marginBottom: "8px" }}>
          TIN TỨC & BLOG
        </Title>
        <Text style={{ color: "#666", fontSize: "16px" }}>
          Cập nhật những thông tin mới nhất về chăm sóc xe hơi
        </Text>
      </div>

      {/* News Grid */}
      <Row gutter={[24, 24]}>
        {newsItems.map((news, index) => (
          <Col 
            key={index}
            xs={24} 
            sm={12} 
            md={12} 
            lg={8} 
            xl={6}
          >
            <NewsCard
              title={news.title}
              description={news.description}
              image={news.image}
              date={news.date}
            />
          </Col>
        ))}
      </Row>

      {/* View All Button */}
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <Button
          type="default"
          size="large"
          style={{
            borderColor: "#1890ff",
            color: "#1890ff",
            borderRadius: "8px",
            padding: "0 32px",
            height: "40px",
            fontWeight: "500",
          }}
        >
          Xem tất cả tin tức
        </Button>
      </div>
    </div>
  );
};

export default NewsSection;
