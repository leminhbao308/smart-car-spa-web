"use client";
import React from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Statistic,
  Divider,
  Tag,
  Button,
} from "antd";
import Image from "next/image";
import Link from "next/link";
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  ShopOutlined,
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  SafetyOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useCenters } from "@/lib/api/hooks/useCenters";
import { useBranchesByCenter } from "@/lib/api/hooks/useBranchesByCenter";

const { Title, Text, Paragraph } = Typography;

const AboutPage = () => {
  const { centers, loading } = useCenters();
  const centerInfo = centers.length > 0 ? centers[0] : null;

  // Fetch branches to get actual count
  const { branches } = useBranchesByCenter(centerInfo?.center_id || null);

  // Helper function to get safe logo URL
  const getSafeLogoUrl = (logoUrl: string | null | undefined): string => {
    if (!logoUrl) return "/images/Main Logo_Light.png";
    if (logoUrl.startsWith("/") || logoUrl.startsWith("./")) {
      return logoUrl;
    }
    if (logoUrl.startsWith("http")) {
      if (
        logoUrl.includes("premium.smartcarspa-hn.com") ||
        logoUrl.includes("smartcarspa-hn.com")
      ) {
        return "/images/Main Logo_Light.png";
      }
      return logoUrl;
    }
    return "/images/Main Logo_Light.png";
  };

  if (loading) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center" }}>
        <Text>Đang tải thông tin...</Text>
      </div>
    );
  }

  if (!centerInfo) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center" }}>
        <Text>Không tìm thấy thông tin trung tâm</Text>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      {/* Hero Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
          padding: "80px 24px 60px",
          textAlign: "center",
          color: "white",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "white",
              padding: "16px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              marginBottom: 24,
            }}
          >
            <Image
              src={getSafeLogoUrl(centerInfo.logo_url)}
              alt={centerInfo.center_name}
              width={120}
              height={120}
              style={{
                objectFit: "contain",
              }}
            />
          </div>
          <Title
            level={1}
            style={{ color: "white", marginBottom: 16 }}
          >
            {centerInfo.center_name}
          </Title>
          <Paragraph
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.9)",
              maxWidth: 800,
              margin: "0 auto",
            }}
          >
            {centerInfo.description}
          </Paragraph>
        </div>
      </div>

      {/* Statistics Section */}
      <div
        style={{ maxWidth: 1200, margin: "-40px auto 0", padding: "0 24px" }}
      >
        <Card
          style={{
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            borderRadius: 12,
          }}
        >
          <Row
            gutter={[48, 24]}
            justify="center"
          >
            <Col
              xs={24}
              sm={12}
            >
              <Statistic
                title="Chi nhánh"
                value={branches?.length || 0}
                prefix={<ShopOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff", fontSize: 40 }}
              />
              <Text
                type="secondary"
                style={{ fontSize: 14 }}
              >
                Trên toàn quốc
              </Text>
            </Col>
            <Col
              xs={24}
              sm={12}
            >
              <Statistic
                title="Năm kinh nghiệm"
                value={
                  centerInfo.established_date
                    ? new Date().getFullYear() -
                      new Date(centerInfo.established_date).getFullYear()
                    : 0
                }
                prefix={<TrophyOutlined style={{ color: "#722ed1" }} />}
                valueStyle={{ color: "#722ed1", fontSize: 40 }}
                suffix="+"
              />
              <Text
                type="secondary"
                style={{ fontSize: 14 }}
              >
                Phục vụ tận tâm
              </Text>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: 1200,
          margin: "60px auto",
          padding: "0 24px",
        }}
      >
        <Row gutter={[24, 24]}>
          {/* Values Section */}
          <Col
            xs={24}
            lg={12}
          >
            <Card
              title={
                <Space>
                  <SafetyOutlined style={{ color: "#52c41a" }} />
                  <Text
                    strong
                    style={{ fontSize: 18 }}
                  >
                    Giá trị cốt lõi
                  </Text>
                </Space>
              }
              style={{ height: "100%" }}
            >
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <div>
                  <Tag
                    color="blue"
                    style={{ marginBottom: 8 }}
                  >
                    CHẤT LƯỢNG
                  </Tag>
                  <Paragraph style={{ marginBottom: 0 }}>
                    Cam kết sử dụng sản phẩm chính hãng và dịch vụ chuyên nghiệp
                  </Paragraph>
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <div>
                  <Tag
                    color="green"
                    style={{ marginBottom: 8 }}
                  >
                    TẬN TÂM
                  </Tag>
                  <Paragraph style={{ marginBottom: 0 }}>
                    Đặt lợi ích khách hàng lên hàng đầu trong mọi dịch vụ
                  </Paragraph>
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <div>
                  <Tag
                    color="orange"
                    style={{ marginBottom: 8 }}
                  >
                    CHUYÊN NGHIỆP
                  </Tag>
                  <Paragraph style={{ marginBottom: 0 }}>
                    Đội ngũ kỹ thuật viên được đào tạo bài bản, giàu kinh nghiệm
                  </Paragraph>
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <div>
                  <Tag
                    color="purple"
                    style={{ marginBottom: 8 }}
                  >
                    UY TÍN
                  </Tag>
                  <Paragraph style={{ marginBottom: 0 }}>
                    Minh bạch trong báo giá và cam kết bảo hành dài hạn
                  </Paragraph>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Contact Information */}
          <Col
            xs={24}
            lg={12}
          >
            <Card
              title={
                <Space>
                  <EnvironmentOutlined style={{ color: "#1890ff" }} />
                  <Text
                    strong
                    style={{ fontSize: 18 }}
                  >
                    Thông tin liên hệ
                  </Text>
                </Space>
              }
            >
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <div>
                  <Text strong>Trụ sở chính:</Text>
                  <div style={{ marginTop: 8 }}>
                    <EnvironmentOutlined
                      style={{ marginRight: 8, color: "#1890ff" }}
                    />
                    <Text>{centerInfo.headquarters_address}</Text>
                  </div>
                </div>

                <Divider style={{ margin: "8px 0" }} />

                <div>
                  <Text strong>Liên hệ:</Text>
                  <div style={{ marginTop: 8 }}>
                    <PhoneOutlined
                      style={{ marginRight: 8, color: "#52c41a" }}
                    />
                    <Text>{centerInfo.headquarters_phone}</Text>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <MailOutlined
                      style={{ marginRight: 8, color: "#722ed1" }}
                    />
                    <Text>{centerInfo.headquarters_email}</Text>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <GlobalOutlined
                      style={{ marginRight: 8, color: "#13c2c2" }}
                    />
                    <Text>{centerInfo.website || "N/A"}</Text>
                  </div>
                </div>

                <Divider style={{ margin: "8px 0" }} />

                <div>
                  <Text strong>Giờ làm việc:</Text>
                  <div style={{ marginTop: 8 }}>
                    <ClockCircleOutlined
                      style={{ marginRight: 8, color: "#fa8c16" }}
                    />
                    <Text>
                      {centerInfo.business_hours?.monday?.open || "08:00"} -{" "}
                      {centerInfo.business_hours?.sunday?.close || "18:00"}
                    </Text>
                  </div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 12 }}
                  >
                    (Thứ 2 - Chủ nhật)
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Legal & Social */}
          <Col
            xs={24}
            lg={12}
          >
            <Card
              title={
                <Space>
                  <SafetyOutlined style={{ color: "#52c41a" }} />
                  <Text
                    strong
                    style={{ fontSize: 18 }}
                  >
                    Thông tin pháp lý
                  </Text>
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <div>
                  <Text strong>Giấy phép kinh doanh:</Text>
                  <div style={{ marginTop: 8 }}>
                    <Text>{centerInfo.business_license || "N/A"}</Text>
                  </div>
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <div>
                  <Text strong>Mã số thuế:</Text>
                  <div style={{ marginTop: 8 }}>
                    <Text>{centerInfo.tax_code || "N/A"}</Text>
                  </div>
                </div>
                <Divider style={{ margin: "8px 0" }} />
                <div>
                  <Text strong>Mã trung tâm:</Text>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">{centerInfo.center_code}</Text>
                  </div>
                </div>
              </Space>
            </Card>

            {/* Social Media */}
            {centerInfo.social_media &&
              (centerInfo.social_media.facebook ||
                centerInfo.social_media.instagram ||
                centerInfo.social_media.youtube) && (
                <Card
                  title={
                    <Space>
                      <TeamOutlined style={{ color: "#722ed1" }} />
                      <Text
                        strong
                        style={{ fontSize: 18 }}
                      >
                        Kết nối với chúng tôi
                      </Text>
                    </Space>
                  }
                >
                  <Space size="large">
                    {centerInfo.social_media.facebook && (
                      <a
                        href={centerInfo.social_media.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FacebookOutlined
                          style={{ fontSize: 32, color: "#1877f2" }}
                        />
                      </a>
                    )}
                    {centerInfo.social_media.instagram && (
                      <a
                        href={centerInfo.social_media.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <InstagramOutlined
                          style={{ fontSize: 32, color: "#e4405f" }}
                        />
                      </a>
                    )}
                    {centerInfo.social_media.youtube && (
                      <a
                        href={centerInfo.social_media.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <YoutubeOutlined
                          style={{ fontSize: 32, color: "#ff0000" }}
                        />
                      </a>
                    )}
                  </Space>
                </Card>
              )}
          </Col>
        </Row>
      </div>

      {/* CTA Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
          padding: "60px 24px",
          textAlign: "center",
          marginTop: 60,
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Title
            level={2}
            style={{ color: "white", marginBottom: 16 }}
          >
            Trải nghiệm dịch vụ của chúng tôi ngay hôm nay
          </Title>
          <Paragraph
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.9)",
              marginBottom: 32,
            }}
          >
            Đội ngũ chuyên nghiệp của chúng tôi luôn sẵn sàng phục vụ bạn với
            những dịch vụ chăm sóc xe tốt nhất
          </Paragraph>
          <Space size="middle">
            <Link href="/services">
              <Button
                type="primary"
                size="large"
                style={{
                  backgroundColor: "white",
                  color: "#1890ff",
                  borderRadius: 8,
                  fontWeight: 600,
                  height: 48,
                  padding: "0 32px",
                }}
              >
                Xem dịch vụ
              </Button>
            </Link>
            <a href={`tel:${centerInfo.headquarters_phone}`}>
              <Button
                size="large"
                style={{
                  backgroundColor: "transparent",
                  color: "white",
                  border: "2px solid white",
                  borderRadius: 8,
                  fontWeight: 600,
                  height: 48,
                  padding: "0 32px",
                }}
              >
                Liên hệ ngay
              </Button>
            </a>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
