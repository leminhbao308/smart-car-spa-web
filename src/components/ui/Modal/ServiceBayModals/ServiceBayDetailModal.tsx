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
  Timeline,
  Button,
  Space,
  Divider,
  Typography,
  Spin,
  Alert,
} from "antd";
import {
  EyeOutlined,
  CloseOutlined,
  ToolOutlined,
  CarOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  ServiceBay,
  BayType,
  BayStatus,
  BAY_TYPE_OPTIONS,
  BAY_STATUS_OPTIONS,
} from "@/lib/api/types/service-bay.types";
import { useServiceBayStatistics } from "@/lib/api/hooks/useServiceBays";

const { Title, Text } = Typography;

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
  const [statistics, setStatistics] = useState<any>(null);
  const { statistics: bayStats, loading: statsLoading } = useServiceBayStatistics(
    data?.bay_id || null
  );

  useEffect(() => {
    if (visible && data) {
      setStatistics(bayStats);
    }
  }, [visible, data, bayStats]);

  if (!data) return null;

  const getBayTypeInfo = (type: BayType) => {
    return BAY_TYPE_OPTIONS.find(opt => opt.value === type) || {
      label: type,
      color: "#8c8c8c",
      icon: "🔧"
    };
  };

  const getBayStatusInfo = (status: BayStatus) => {
    return BAY_STATUS_OPTIONS.find(opt => opt.value === status) || {
      label: status,
      color: "default"
    };
  };

  const typeInfo = getBayTypeInfo(data.bay_type);
  const statusInfo = getBayStatusInfo(data.status);

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <EyeOutlined style={{ color: "#1890ff" }} />
          Chi tiết bệ dịch vụ
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="close" onClick={onCancel}>
          <CloseOutlined />
          Đóng
        </Button>
      ]}
      destroyOnClose
    >
      <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
        {/* Basic Information */}
        <Card
          title={
            <Space>
              <span style={{ fontSize: "20px" }}>{typeInfo.icon}</span>
              <span>{data.bay_name}</span>
              <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Mã bệ dịch vụ">
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
            <Descriptions.Item label="Sức chứa">
              <Text strong>{data.capacity} xe</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Thứ tự hiển thị">
              <Text>{data.display_order}</Text>
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

          {data.description && (
            <>
              <Divider />
              <div>
                <Text strong>Mô tả:</Text>
                <div style={{ marginTop: 8 }}>
                  <Text>{data.description}</Text>
                </div>
              </div>
            </>
          )}

          {data.notes && (
            <>
              <Divider />
              <div>
                <Text strong>Ghi chú:</Text>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">{data.notes}</Text>
                </div>
              </div>
            </>
          )}
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
              description="Chưa có dữ liệu thống kê cho bệ dịch vụ này."
              type="info"
              showIcon
            />
          )}
        </Card>

        {/* Bay Type Specific Information */}
        <Card title="Thông tin chuyên biệt" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ textAlign: "center", padding: "16px" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                  {data.is_wash_bay ? "🚿" : data.is_repair_bay ? "🔧" : data.is_lift_bay ? "⬆️" : "🔧"}
                </div>
                <Text strong>
                  {data.is_wash_bay ? "Bệ rửa xe" : 
                   data.is_repair_bay ? "Bệ sửa chữa" : 
                   data.is_lift_bay ? "Bệ nâng xe" : "Bệ tổng hợp"}
                </Text>
              </div>
            </Col>
            <Col span={16}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Loại bệ">
                  <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Chức năng">
                  <Space wrap>
                    {data.is_wash_bay && <Tag color="blue">Rửa xe</Tag>}
                    {data.is_repair_bay && <Tag color="green">Sửa chữa</Tag>}
                    {data.is_lift_bay && <Tag color="purple">Nâng xe</Tag>}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
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
