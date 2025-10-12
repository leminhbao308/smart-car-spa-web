"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Avatar,
  Row,
  Col,
  Card,
  Typography,
  Button,
  Spin,
} from "antd";
import {
  CalendarOutlined,
} from "@ant-design/icons";
import { VehicleBrand } from "@/lib/api/types";
import { VehicleService } from "@/lib/api/services/vehicle.service";

const { Title, Text } = Typography;

interface VehicleBrandDetailModalProps {
  visible: boolean;
  onClose: () => void;
  brandId: string | null;
}

const VehicleBrandDetailModal: React.FC<VehicleBrandDetailModalProps> = ({
  visible,
  onClose,
  brandId,
}) => {
  const [brand, setBrand] = useState<VehicleBrand | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBrandDetails = useCallback(async () => {
    if (!brandId) return;
    
    setLoading(true);
    try {
      const brandData = await VehicleService.getVehicleBrandById(brandId);
      setBrand(brandData);
    } catch (error) {
      console.error("Error fetching brand details:", error);
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    if (visible && brandId) {
      fetchBrandDetails();
    }
  }, [visible, brandId, fetchBrandDetails]);

  if (!brand && !loading) return null;

  return (
    <>
      <style jsx global>{`
        .ant-modal {
          max-width: 90vw !important;
        }
        .ant-modal-content {
          max-height: 90vh;
          overflow: hidden;
        }
        .ant-modal-body {
          padding: 16px !important;
          max-height: calc(90vh - 120px);
          overflow-y: auto;
          overflow-x: hidden;
        }
        .ant-descriptions {
          overflow-x: hidden;
        }
        .ant-descriptions-item-label {
          min-width: 100px;
          word-break: break-word;
        }
        .ant-descriptions-item-content {
          word-break: break-word;
        }
        @media (max-width: 768px) {
          .ant-modal {
            margin: 10px !important;
            max-width: calc(100vw - 20px) !important;
          }
          .ant-descriptions-bordered .ant-descriptions-item {
            padding: 8px 12px !important;
          }
        }
      `}</style>
      <Modal
      title={
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 16,
          padding: "8px 0"
        }}>
          <div style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Avatar
              size={50}
              src={brand?.brand_logo_url || undefined}
              style={{ 
                backgroundColor: "#1890ff",
                border: "3px solid #e6f7ff",
                boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)"
              }}
            >
              {brand?.brand_name?.charAt(0)?.toUpperCase()}
            </Avatar>
            {brand?.is_active && (
              <div style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                width: 16,
                height: 16,
                backgroundColor: "#52c41a",
                border: "2px solid #fff",
                borderRadius: "50%",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <Title level={3} style={{ 
              margin: 0, 
              color: "#262626",
              fontWeight: 600,
              lineHeight: 1.2
            }}>
              {brand?.brand_name}
            </Title>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 8,
              marginTop: 4
            }}>
              <Tag color="blue" style={{ margin: 0 }}>
                {brand?.brand_code}
              </Tag>
              <Tag color={brand?.is_active ? "green" : "red"} style={{ margin: 0 }}>
                {brand?.is_active ? "Hoạt động" : "Không hoạt động"}
              </Tag>
            </div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button 
          key="close" 
          onClick={onClose}
          size="large"
          style={{
            minWidth: 100,
            height: 40,
            borderRadius: 6,
            fontWeight: 500
          }}
        >
          Đóng
        </Button>,
      ]}
      width="60%"
      styles={{
        body: { 
          maxHeight: "70vh", 
          overflowY: "auto",
          padding: "16px"
        },
      }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      ) : brand ? (
        <Row gutter={[20, 20]}>
          {/* Thông tin cơ bản */}
          <Col span={24}>
            <Card 
              title={
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 8,
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#262626"
                }}>
                  <div style={{
                    width: 4,
                    height: 20,
                    backgroundColor: "#1890ff",
                    borderRadius: 2
                  }} />
                  Thông tin cơ bản
                </div>
              } 
              size="small"
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                border: "1px solid #f0f0f0"
              }}
            >
              <Descriptions 
                column={{ xs: 1, sm: 1 }} 
                size="small"
                bordered={false}
                style={{ marginTop: 8 }}
              >
                <Descriptions.Item label={<span style={{ fontWeight: 500, color: "#595959" }}>Tên hãng</span>}>
                  <Text strong style={{ fontSize: "15px", color: "#262626" }}>
                    {brand.brand_name}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label={<span style={{ fontWeight: 500, color: "#595959" }}>Mã hãng</span>}>
                  <Tag color="blue" style={{ fontSize: "12px", padding: "2px 8px" }}>
                    {brand.brand_code}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label={<span style={{ fontWeight: 500, color: "#595959" }}>Trạng thái</span>}>
                  <Tag 
                    color={brand.is_active ? "green" : "red"} 
                    style={{ fontSize: "12px", padding: "2px 8px" }}
                  >
                    {brand.is_active ? "Hoạt động" : "Không hoạt động"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label={<span style={{ fontWeight: 500, color: "#595959" }}>Trạng thái xóa</span>}>
                  <Tag 
                    color={brand.is_deleted ? "red" : "green"} 
                    style={{ fontSize: "12px", padding: "2px 8px" }}
                  >
                    {brand.is_deleted ? "Đã xóa" : "Chưa xóa"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label={<span style={{ fontWeight: 500, color: "#595959" }}>Mô tả</span>}>
                  <div style={{
                    backgroundColor: "#fafafa",
                    padding: "12px",
                    borderRadius: 6,
                    border: "1px solid #f0f0f0",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    color: "#595959"
                  }}>
                    {brand.description || "Không có mô tả"}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Thông tin hệ thống */}
          <Col span={24}>
            <Card 
              title={
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 8,
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#262626"
                }}>
                  <div style={{
                    width: 4,
                    height: 20,
                    backgroundColor: "#52c41a",
                    borderRadius: 2
                  }} />
                  Thông tin hệ thống
                </div>
              } 
              size="small"
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                border: "1px solid #f0f0f0"
              }}
            >
              <Descriptions 
                column={{ xs: 1, sm: 1 }} 
                size="small"
                bordered={false}
                style={{ marginTop: 8 }}
              >
                <Descriptions.Item label={<span style={{ fontWeight: 500, color: "#595959" }}>Ngày tạo</span>}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 6,
                    backgroundColor: "#f6ffed",
                    padding: "6px 10px",
                    borderRadius: 4,
                    border: "1px solid #b7eb8f"
                  }}>
                    <CalendarOutlined style={{ color: "#52c41a", fontSize: "14px" }} />
                    <Text style={{ color: "#389e0d", fontSize: "13px", fontWeight: 500 }}>
                      {new Date(brand.created_date).toLocaleDateString("vi-VN")}
                    </Text>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label={<span style={{ fontWeight: 500, color: "#595959" }}>Ngày cập nhật</span>}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 6,
                    backgroundColor: "#e6f7ff",
                    padding: "6px 10px",
                    borderRadius: 4,
                    border: "1px solid #91d5ff"
                  }}>
                    <CalendarOutlined style={{ color: "#1890ff", fontSize: "14px" }} />
                    <Text style={{ color: "#0958d9", fontSize: "13px", fontWeight: 500 }}>
                      {new Date(brand.modified_date).toLocaleDateString("vi-VN")}
                    </Text>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label={<span style={{ fontWeight: 500, color: "#595959" }}>Người tạo</span>}>
                  <div style={{
                    backgroundColor: "#fafafa",
                    padding: "6px 10px",
                    borderRadius: 4,
                    border: "1px solid #f0f0f0"
                  }}>
                    <Text code style={{ fontSize: "13px", color: "#262626" }}>
                      {brand.created_by}
                    </Text>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label={<span style={{ fontWeight: 500, color: "#595959" }}>Người cập nhật</span>}>
                  <div style={{
                    backgroundColor: "#fafafa",
                    padding: "6px 10px",
                    borderRadius: 4,
                    border: "1px solid #f0f0f0"
                  }}>
                    <Text code style={{ fontSize: "13px", color: "#262626" }}>
                      {brand.modified_by}
                    </Text>
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Logo */}
          {brand.brand_logo_url && (
            <Col span={24}>
              <Card 
                title={
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 8,
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#262626"
                  }}>
                    <div style={{
                      width: 4,
                      height: 20,
                      backgroundColor: "#fa8c16",
                      borderRadius: 2
                    }} />
                    Logo hãng xe
                  </div>
                } 
                size="small"
                style={{
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #f0f0f0"
                }}
              >
                <div style={{ 
                  textAlign: "center",
                  padding: "20px 0"
                }}>
                  <div style={{
                    position: "relative",
                    display: "inline-block"
                  }}>
                    <Avatar
                      size={120}
                      src={brand.brand_logo_url}
                      style={{ 
                        backgroundColor: "#f0f0f0",
                        border: "4px solid #fff",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
                      }}
                    >
                      {brand.brand_name.charAt(0).toUpperCase()}
                    </Avatar>
                    {brand.is_active && (
                      <div style={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        width: 24,
                        height: 24,
                        backgroundColor: "#52c41a",
                        border: "3px solid #fff",
                        borderRadius: "50%",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <div style={{
                          width: 8,
                          height: 8,
                          backgroundColor: "#fff",
                          borderRadius: "50%"
                        }} />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Col>
          )}
        </Row>
      ) : null}
    </Modal>
    </>
  );
};

export default VehicleBrandDetailModal;