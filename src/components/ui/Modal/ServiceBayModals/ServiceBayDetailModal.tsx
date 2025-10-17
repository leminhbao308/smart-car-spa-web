"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Space,
  Typography,
  Spin,
  Alert,
} from "antd";
import {
  EyeOutlined,
  CloseOutlined,
  CarOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  ServiceBay, 
  BayStatus, 
  BAY_STATUS_OPTIONS,
  ServiceBayStatistics,
} from "@/lib/api/types/service-bay.types";
import { useServiceBayStatistics } from "@/lib/api/hooks/useServiceBays";

const { Text } = Typography;

interface ServiceBayDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  data?: ServiceBay | null;
}

const ServiceBayDetailModal: React.FC<ServiceBayDetailModalProps> = ({
  visible,
  onCancel,
  data,
}) => {
  const [statistics, setStatistics] = useState<ServiceBayStatistics | null>(null);
  const { data: bayStats, isLoading: statsLoading } = useServiceBayStatistics(
    data?.bay_id || null
  );

  useEffect(() => {
    if (visible && data && bayStats) {
      setStatistics(bayStats);
    }
  }, [visible, data, bayStats]);

  if (!data) return null;


  const getBayStatusInfo = (status: BayStatus) => {
    return BAY_STATUS_OPTIONS.find(opt => opt.value === status) || {
      label: status,
      color: "default"
    };
  };

  const statusInfo = getBayStatusInfo(data.status);

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <EyeOutlined style={{ color: "#1890ff" }} />
          Chi tiết khu vực dịch vụ
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width="95%"
      style={{ maxWidth: 1000 }}
      footer={[
        <Button key="close" onClick={onCancel}>
          <CloseOutlined />
          Đóng
        </Button>
      ]}
      destroyOnHidden
    >
      <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
        {/* Basic Information */}
        <Card
          title={
            <Space>
              <span style={{ fontSize: "20px" }}>🔧</span>
              <span>{data.bay_name}</span>
              <Tag color="blue">Khu vực dịch vụ</Tag>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Mã khu vực dịch vụ">
              <Text code>{data.bay_code || "Chưa có mã"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Chi nhánh">
              <Space>
                <CarOutlined />
                <Text strong>{data.branch_name}</Text>
                <Text type="secondary">({data.branch_code})</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thứ tự hiển thị">
              <Text strong>{data.display_order}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tình trạng">
              <Space direction="vertical" size="small">
                <Tag color={data.is_available ? "success" : "error"}>
                  {data.is_available ? "Có sẵn" : "Không có sẵn"}
                </Tag>
                {data.is_maintenance && (
                  <Tag color="warning">Đang bảo trì</Tag>
                )}
                {data.is_closed && (
                  <Tag color="error">Tạm đóng</Tag>
                )}
              </Space>
            </Descriptions.Item>
          </Descriptions>

        </Card>

        {/* Statistics */}
        <Card title="Thống kê hoạt động" style={{ marginBottom: 16 }}>
          {statsLoading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">Đang tải thống kê...</Text>
              </div>
            </div>
          ) : statistics ? (
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Tổng đặt lịch"
                  value={statistics.total_bookings || 0}
                  prefix={<CalendarOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Đã hoàn thành"
                  value={statistics.completed_bookings || 0}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Đang thực hiện"
                  value={statistics.active_bookings || 0}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Tỷ lệ sử dụng"
                  value={statistics.utilization_rate || 0}
                  suffix="%"
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Col>
            </Row>
          ) : (
            <Alert
              message="Không có dữ liệu thống kê"
              description="Chưa có dữ liệu thống kê cho khu vực dịch vụ này."
              type="info"
              showIcon
            />
          )}
        </Card>

        {/* Service Bay Information */}
        <Card title="Thông tin khu vực dịch vụ" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ textAlign: "center", padding: "16px" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                  🔧
                </div>
                <Text strong>Khu vực dịch vụ</Text>
              </div>
            </Col>
            <Col span={16}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Mô tả">
                  <Text>{data.description || "Chưa có mô tả"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú">
                  <Text type="secondary">{data.notes || "Chưa có ghi chú"}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Card>

        {/* Technician Information */}
        <Card title="Thông tin kỹ thuật viên" style={{ marginBottom: 16 }}>
          {data.technicians && data.technicians.length > 0 ? (
            <div>
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: 16 }}>
                  Tổng số kỹ thuật viên: {data.technicians.length}
                </Text>
              </div>
              <Row gutter={[16, 16]}>
                {data.technicians.map((technician) => (
                  <Col span={24} key={technician.technician_id}>
                    <Card
                      size="small"
                      style={{
                        border: `1px solid ${technician.is_active ? '#52c41a' : '#d9d9d9'}`,
                        backgroundColor: technician.is_active ? '#f6ffed' : '#fafafa'
                      }}
                    >
                      <Row gutter={16} align="middle">
                        <Col span={2}>
                          <div style={{ textAlign: "center" }}>
                            <UserOutlined 
                              style={{ 
                                fontSize: 24, 
                                color: technician.is_active ? '#52c41a' : '#d9d9d9' 
                              }} 
                            />
                          </div>
                        </Col>
                        <Col span={16}>
                          <div>
                            <div style={{ marginBottom: 4 }}>
                              <Text strong style={{ fontSize: 16 }}>
                                {technician.technician_name}
                              </Text>
                              <Tag 
                                color={technician.is_active ? 'success' : 'default'} 
                                style={{ marginLeft: 8 }}
                              >
                                {technician.is_active ? 'Hoạt động' : 'Không hoạt động'}
                              </Tag>
                            </div>
                            <div style={{ marginBottom: 2 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                <strong>Mã:</strong> {technician.technician_code}
                              </Text>
                            </div>
                            <div style={{ marginBottom: 2 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                <strong>SĐT:</strong> {technician.technician_phone}
                              </Text>
                            </div>
                            <div>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                <strong>Email:</strong> {technician.technician_email}
                              </Text>
                            </div>
                          </div>
                        </Col>
                        <Col span={6}>
                          <div style={{ textAlign: "right" }}>
                            <Tag 
                              color={technician.is_active ? 'green' : 'red'}
                              style={{ fontSize: 12 }}
                            >
                              {technician.is_active ? '✓ Đang làm việc' : '✗ Tạm nghỉ'}
                            </Tag>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ) : (
            <Alert
              message="Chưa có kỹ thuật viên"
              description="Khu vực dịch vụ này chưa được gán kỹ thuật viên nào."
              type="info"
              showIcon
              icon={<UserOutlined />}
            />
          )}
        </Card>

        {/* Audit Information */}
        <Card title="Thông tin hệ thống" size="small">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Ngày tạo">
              <Text type="secondary">
                {new Date(data.created_date).toLocaleString("vi-VN")}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo">
              <Text type="secondary">{data.created_by}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày cập nhật">
              <Text type="secondary">
                {new Date(data.modified_date).toLocaleString("vi-VN")}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Người cập nhật">
              <Text type="secondary">{data.modified_by}</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
};

export default ServiceBayDetailModal;
