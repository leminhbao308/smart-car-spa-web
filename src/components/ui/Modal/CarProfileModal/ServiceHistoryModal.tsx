"use client";
import React, { useState } from "react";
import {
  Modal,
  Table,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Typography,
  Button,
  Tooltip,
} from "antd";
import {
  ToolOutlined,
  CalendarOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface ServiceRecord {
  date: string;
  service: string;
  cost: number;
  location: string;
  technician?: string;
  notes?: string;
  status?: "completed" | "pending" | "cancelled";
}

interface ServiceHistoryModalProps {
  visible: boolean;
  onCancel: () => void;
  data: ServiceRecord[];
  vehicleInfo?: {
    licensePlate: string;
    brand: string;
    model: string;
  };
}

const ServiceHistoryModal: React.FC<ServiceHistoryModalProps> = ({
  visible,
  onCancel,
  data,
  vehicleInfo,
}) => {
  const [loading, setLoading] = useState(false);

  // Calculate statistics
  const totalServices = data.length;
  const totalCost = data.reduce((sum, service) => sum + service.cost, 0);
  const averageCost = totalServices > 0 ? totalCost / totalServices : 0;
  const lastServiceDate =
    data.length > 0
      ? data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0].date
      : null;

  // Service status configuration
  const getStatusConfig = (status: string) => {
    const configs = {
      completed: { color: "green", label: "Hoàn thành" },
      pending: { color: "orange", label: "Đang thực hiện" },
      cancelled: { color: "red", label: "Đã hủy" },
    };
    return (
      configs[status as keyof typeof configs] || {
        color: "blue",
        label: "Không xác định",
      }
    );
  };

  // Table columns
  const columns: ColumnsType<ServiceRecord> = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      width: 120,
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (date: string) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {dayjs(date).format("DD/MM/YYYY")}
          </div>
          <div style={{ fontSize: 11, color: "#666" }}>
            {dayjs(date).format("HH:mm")}
          </div>
        </div>
      ),
    },
    {
      title: "Dịch vụ",
      dataIndex: "service",
      key: "service",
      width: 200,
      render: (service: string) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 2 }}>{service}</div>
          {data.find((d) => d.service === service)?.notes && (
            <div style={{ fontSize: 11, color: "#666" }}>
              {data.find((d) => d.service === service)?.notes}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Chi phí",
      dataIndex: "cost",
      key: "cost",
      width: 120,
      sorter: (a, b) => a.cost - b.cost,
      render: (cost: number) => (
        <Text strong style={{ color: "#1890ff" }}>
          {formatCurrency(cost)}
        </Text>
      ),
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
      width: 150,
      render: (location: string) => (
        <Space>
          <EnvironmentOutlined style={{ color: "#666" }} />
          <Text>{location}</Text>
        </Space>
      ),
    },
    {
      title: "Kỹ thuật viên",
      dataIndex: "technician",
      key: "technician",
      width: 120,
      render: (technician: string) =>
        technician || <Text type="secondary">Chưa xác định</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const config = getStatusConfig(status);
        return <Tag color={config.color}>{config.label}</Tag>;
      },
      filters: [
        { text: "Hoàn thành", value: "completed" },
        { text: "Đang thực hiện", value: "pending" },
        { text: "Đã hủy", value: "cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
    },
  ];

  const handleAddService = () => {
    // TODO: Implement add new service functionality
    console.log("Add new service");
  };

  return (
    <Modal
      title={
        <Space>
          <ToolOutlined />
          Lịch sử bảo dưỡng
          {vehicleInfo && (
            <Text type="secondary" style={{ fontSize: 14 }}>
              - {vehicleInfo.licensePlate} ({vehicleInfo.brand}{" "}
              {vehicleInfo.model})
            </Text>
          )}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Đóng
        </Button>,
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddService}
        >
          Thêm dịch vụ
        </Button>,
      ]}
    >
      <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
        {/* Statistics */}
        <Card
          title={
            <Space>
              <CalendarOutlined />
              Thống kê
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Tổng số lần"
                value={totalServices}
                suffix="lần"
                prefix={<ToolOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Tổng chi phí"
                value={totalCost}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<DollarOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Chi phí trung bình"
                value={averageCost}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<DollarOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Lần cuối"
                value={
                  lastServiceDate
                    ? dayjs(lastServiceDate).format("DD/MM/YYYY")
                    : "Chưa có"
                }
                prefix={<CalendarOutlined />}
              />
            </Col>
          </Row>
        </Card>

        {/* Service History Table */}
        <Card
          title={
            <Space>
              <ToolOutlined />
              Chi tiết lịch sử
            </Space>
          }
        >
          {data.length > 0 ? (
            <Table
              columns={columns}
              dataSource={data}
              rowKey={(record) =>
                `${record.date}-${record.service}-${record.cost}`
              }
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} mục`,
              }}
              size="small"
              scroll={{ x: 800 }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <ToolOutlined
                style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
              />
              <div>
                <Title level={4} type="secondary">
                  Chưa có lịch sử bảo dưỡng
                </Title>
                <Text type="secondary">
                  Xe này chưa có lịch sử bảo dưỡng nào được ghi nhận.
                </Text>
              </div>
            </div>
          )}
        </Card>

        {/* Service Timeline (Alternative view) */}
        {data.length > 0 && (
          <Card
            title="Timeline bảo dưỡng"
            style={{ marginTop: 16 }}
            size="small"
          >
            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {data
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((service, index) => (
                  <div
                    key={`${service.date}-${index}`}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      padding: "12px 0",
                      borderBottom:
                        index < data.length - 1 ? "1px solid #f0f0f0" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#1890ff",
                        marginRight: 12,
                        marginTop: 6,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>
                            {service.service}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#666",
                              marginBottom: 4,
                            }}
                          >
                            <CalendarOutlined style={{ marginRight: 4 }} />
                            {dayjs(service.date).format("DD/MM/YYYY HH:mm")}
                          </div>
                          <div style={{ fontSize: 12, color: "#666" }}>
                            <EnvironmentOutlined style={{ marginRight: 4 }} />
                            {service.location}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontWeight: 500,
                              color: "#1890ff",
                              marginBottom: 4,
                            }}
                          >
                            {formatCurrency(service.cost)}
                          </div>
                          <Tag
                            color={
                              getStatusConfig(service.status || "completed")
                                .color
                            }
                            size="small"
                          >
                            {
                              getStatusConfig(service.status || "completed")
                                .label
                            }
                          </Tag>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default ServiceHistoryModal;
