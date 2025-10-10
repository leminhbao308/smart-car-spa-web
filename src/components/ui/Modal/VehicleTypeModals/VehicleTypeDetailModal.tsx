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
  message,
} from "antd";
import { CalendarOutlined, CarOutlined } from "@ant-design/icons";
import { VehicleType } from "@/lib/api/types";
import { VehicleService } from "@/lib/api/services/vehicle.service";

const { Title, Text } = Typography;

interface VehicleTypeDetailModalProps {
  visible: boolean;
  onClose: () => void;
  typeId: string | null;
}

const VehicleTypeDetailModal: React.FC<VehicleTypeDetailModalProps> = ({
  visible,
  onClose,
  typeId,
}) => {
  const [type, setType] = useState<VehicleType | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTypeDetails = useCallback(async () => {
    if (!typeId) return;

    setLoading(true);
    try {
      const fetchedType = await VehicleService.getVehicleTypeById(typeId);
      setType(fetchedType);
    } catch (error) {
      console.error("Failed to fetch vehicle type details:", error);
      message.error("Không thể tải thông tin loại xe");
    } finally {
      setLoading(false);
    }
  }, [typeId]);

  useEffect(() => {
    if (visible && typeId) {
      fetchTypeDetails();
    }
  }, [visible, typeId, fetchTypeDetails]);

  if (!type && !loading) return null;

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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "8px 0",
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Avatar
                size={50}
                icon={<CarOutlined />}
                style={{
                  backgroundColor: "#52c41a",
                  border: "3px solid #f6ffed",
                  boxShadow: "0 4px 12px rgba(82, 196, 26, 0.15)",
                }}
              />
              {type?.is_active && (
                <div
                  style={{
                    position: "absolute",
                    bottom: -2,
                    right: -2,
                    width: 16,
                    height: 16,
                    backgroundColor: "#52c41a",
                    border: "2px solid #fff",
                    borderRadius: "50%",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <Title
                level={3}
                style={{
                  margin: 0,
                  color: "#262626",
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {type?.type_name}
              </Title>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <Tag color="green" style={{ margin: 0 }}>
                  {type?.type_code}
                </Tag>
                <Tag
                  color={type?.is_active ? "green" : "red"}
                  style={{ margin: 0 }}
                >
                  {type?.is_active ? "Hoạt động" : "Không hoạt động"}
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
              fontWeight: 500,
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
            padding: "16px",
          },
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
          </div>
        ) : type ? (
          <Row gutter={[20, 20]}>
            {/* Thông tin cơ bản */}
            <Col span={24}>
              <Card
                title={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#262626",
                    }}
                  >
                    <div
                      style={{
                        width: 4,
                        height: 20,
                        backgroundColor: "#52c41a",
                        borderRadius: 2,
                      }}
                    />
                    Thông tin cơ bản
                  </div>
                }
                size="small"
                style={{
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #f0f0f0",
                }}
              >
                <Descriptions
                  column={{ xs: 1, sm: 2 }}
                  size="small"
                  bordered={false}
                  style={{ marginTop: 8 }}
                >
                  <Descriptions.Item
                    label="Tên loại xe"
                    labelStyle={{ fontWeight: 500, color: "#595959" }}
                  >
                    <Text strong style={{ fontSize: "15px", color: "#262626" }}>
                      {type.type_name}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label="Mã loại xe"
                    labelStyle={{ fontWeight: 500, color: "#595959" }}
                  >
                    <Tag
                      color="green"
                      style={{ fontSize: "12px", padding: "2px 8px" }}
                    >
                      {type.type_code}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label="Mô tả"
                    span={{ xs: 1, sm: 2 }}
                    labelStyle={{ fontWeight: 500, color: "#595959" }}
                  >
                    <div
                      style={{
                        backgroundColor: "#fafafa",
                        padding: "12px",
                        borderRadius: 6,
                        border: "1px solid #f0f0f0",
                        fontSize: "14px",
                        lineHeight: 1.6,
                        color: "#595959",
                      }}
                    >
                      {type.description || "Không có mô tả"}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label="Trạng thái"
                    labelStyle={{ fontWeight: 500, color: "#595959" }}
                  >
                    <Tag
                      color={type.is_active ? "green" : "red"}
                      style={{ fontSize: "12px", padding: "2px 8px" }}
                    >
                      {type.is_active ? "Hoạt động" : "Không hoạt động"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label="Trạng thái xóa"
                    labelStyle={{ fontWeight: 500, color: "#595959" }}
                  >
                    <Tag
                      color={type.is_deleted ? "red" : "green"}
                      style={{ fontSize: "12px", padding: "2px 8px" }}
                    >
                      {type.is_deleted ? "Đã xóa" : "Chưa xóa"}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Thông tin hệ thống */}
            <Col span={24}>
              <Card
                title={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#262626",
                    }}
                  >
                    <div
                      style={{
                        width: 4,
                        height: 20,
                        backgroundColor: "#1890ff",
                        borderRadius: 2,
                      }}
                    />
                    Thông tin hệ thống
                  </div>
                }
                size="small"
                style={{
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #f0f0f0",
                }}
              >
                <Descriptions
                  column={{ xs: 1, sm: 2 }}
                  size="small"
                  bordered={false}
                  style={{ marginTop: 8 }}
                >
                  <Descriptions.Item
                    label="Ngày tạo"
                    labelStyle={{ fontWeight: 500, color: "#595959" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        backgroundColor: "#f6ffed",
                        padding: "6px 10px",
                        borderRadius: 4,
                        border: "1px solid #b7eb8f",
                      }}
                    >
                      <CalendarOutlined
                        style={{ color: "#52c41a", fontSize: "14px" }}
                      />
                      <Text
                        style={{
                          color: "#389e0d",
                          fontSize: "13px",
                          fontWeight: 500,
                        }}
                      >
                        {new Date(type.created_date).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Text>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label="Ngày cập nhật"
                    labelStyle={{ fontWeight: 500, color: "#595959" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        backgroundColor: "#e6f7ff",
                        padding: "6px 10px",
                        borderRadius: 4,
                        border: "1px solid #91d5ff",
                      }}
                    >
                      <CalendarOutlined
                        style={{ color: "#1890ff", fontSize: "14px" }}
                      />
                      <Text
                        style={{
                          color: "#0958d9",
                          fontSize: "13px",
                          fontWeight: 500,
                        }}
                      >
                        {new Date(type.modified_date).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Text>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label="Người tạo"
                    labelStyle={{ fontWeight: 500, color: "#595959" }}
                  >
                    <div
                      style={{
                        backgroundColor: "#fafafa",
                        padding: "6px 10px",
                        borderRadius: 4,
                        border: "1px solid #f0f0f0",
                      }}
                    >
                      <Text code style={{ fontSize: "13px", color: "#262626" }}>
                        {type.created_by}
                      </Text>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label="Người cập nhật"
                    labelStyle={{ fontWeight: 500, color: "#595959" }}
                  >
                    <div
                      style={{
                        backgroundColor: "#fafafa",
                        padding: "6px 10px",
                        borderRadius: 4,
                        border: "1px solid #f0f0f0",
                      }}
                    >
                      <Text code style={{ fontSize: "13px", color: "#262626" }}>
                        {type.modified_by}
                      </Text>
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>
        ) : null}
      </Modal>
    </>
  );
};

export default VehicleTypeDetailModal;
