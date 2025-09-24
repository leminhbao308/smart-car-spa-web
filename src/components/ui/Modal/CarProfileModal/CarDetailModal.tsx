"use client";
import React from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Card,
  Row,
  Col,
  Space,
  Typography,
  Timeline,
  Statistic,
} from "antd";
import {
  CarOutlined,
  UserOutlined,
  CalendarOutlined,
  ToolOutlined,
  PhoneOutlined,
  MailOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import {
  vehicleTypes,
  vehicleStatuses,
  engineTypes,
  transmissions,
} from "@/components/utils/data/car-profiles.data";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import {
  calculateVehicleAge,
  getDaysUntilService,
  getTotalServiceCost,
} from "@/components/utils/helper/vehicle.warranty.helper";

const { Text } = Typography;

interface CarProfile {
  id: number;
  vehicleCode: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  engineType: string;
  engineCapacity: string;
  transmission: string;
  fuelType: string;
  mileage?: number;
  vehicleType: string;
  status: string;
  registrationDate: string;
  insuranceExpiry: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  serviceHistory?: Array<{
    date: string;
    service: string;
    cost: number;
    location: string;
  }>;
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface CarDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  data: CarProfile | null;
}

const CarDetailModal: React.FC<CarDetailModalProps> = ({
  visible,
  onCancel,
  data,
}) => {
  if (!data) return null;

  const vehicleTypeConfig = vehicleTypes.find(t => t.value === data.vehicleType);
  const statusConfig = vehicleStatuses.find(s => s.value === data.status);
  const engineConfig = engineTypes.find(e => e.value === data.engineType);
  const transmissionConfig = transmissions.find(t => t.value === data.transmission);

  const daysUntilService = getDaysUntilService(data.nextServiceDate);
  const totalServiceCost = getTotalServiceCost(data.serviceHistory);
  const vehicleAge = calculateVehicleAge(data.year);

  // Calculate insurance status
  const insuranceExpiry = new Date(data.insuranceExpiry);
  const today = new Date();
  const diffDays = Math.ceil((insuranceExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Modal
      title={
        <Space>
          <CarOutlined />
          Chi tiết hồ sơ xe
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={null}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Vehicle Overview */}
        <Card
          title={
            <Space>
              <CarOutlined />
              Thông tin tổng quan
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="Biển số"
                value={data.licensePlate}
                valueStyle={{ color: '#1890ff', fontSize: 20, fontWeight: 'bold' }}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="Hãng & Model"
                value={`${data.brand} ${data.model}`}
                valueStyle={{ fontSize: 16 }}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="Năm sản xuất"
                value={`${data.year} (${vehicleAge} tuổi)`}
                valueStyle={{ fontSize: 16 }}
              />
            </Col>
          </Row>
        </Card>

        {/* Vehicle Information */}
        <Card
          title={
            <Space>
              <CarOutlined />
              Thông tin xe
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Mã xe">
              <Text code>{data.vehicleCode}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Loại xe">
              <Tag color={vehicleTypeConfig?.color} icon={vehicleTypeConfig?.icon}>
                {vehicleTypeConfig?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Màu sắc">
              <Tag color="default">{data.color}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Loại động cơ">
              <Tag color={engineConfig?.color}>{engineConfig?.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Dung tích">
              {data.engineCapacity}
            </Descriptions.Item>
            <Descriptions.Item label="Hộp số">
              <Tag color={transmissionConfig?.color}>{transmissionConfig?.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Nhiên liệu">
              {data.fuelType}
            </Descriptions.Item>
            <Descriptions.Item label="Số km">
              <Text strong>{data.mileage ? data.mileage.toLocaleString() : '0'} km</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đăng ký">
              {new Date(data.registrationDate).toLocaleDateString('vi-VN')}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Customer Information */}
        <Card
          title={
            <Space>
              <UserOutlined />
              Thông tin chủ xe
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Tên chủ xe">
              <Text strong>{data.customerName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <Space>
                <PhoneOutlined />
                <Text copyable>{data.customerPhone}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <Space>
                <MailOutlined />
                <Text copyable>{data.customerEmail}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="ID Khách hàng">
              <Text code>#{data.customerId}</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Insurance & Service Status */}  
        <Card
          title={
            <Space>
              <SafetyOutlined />
              Bảo hiểm & Bảo dưỡng
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card size="small" title="Bảo hiểm">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary">Ngày hết hạn:</Text>
                    <br />
                    <Text strong>{new Date(data.insuranceExpiry).toLocaleDateString('vi-VN')}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Trạng thái:</Text>
                    <br />
                    <Tag 
                      color={
                        diffDays < 30 ? 'red' : 
                        diffDays < 90 ? 'orange' : 'green'
                      }
                    >
                      {diffDays > 0 ? `Còn ${diffDays} ngày` : 'Đã hết hạn'}
                    </Tag>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card size="small" title="Bảo dưỡng">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary">Lần cuối:</Text>
                    <br />
                    <Text strong>
                      {data.lastServiceDate 
                        ? new Date(data.lastServiceDate).toLocaleDateString('vi-VN')
                        : 'Chưa có'
                      }
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary">Lần tiếp theo:</Text>
                    <br />
                    <Tag 
                      color={
                        daysUntilService <= 0 ? 'red' : 
                        daysUntilService <= 30 ? 'orange' : 'green'
                      }
                    >
                      {daysUntilService > 0 ? `${daysUntilService} ngày` : 'Quá hạn'}
                    </Tag>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* Service History */}
        <Card
          title={
            <Space>
              <ToolOutlined />
              Lịch sử bảo dưỡng
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Statistic
                title="Tổng số lần bảo dưỡng"
                value={data.serviceHistory?.length || 0}
                suffix="lần"
              />
            </Col>
            <Col xs={24} sm={12}>
              <Statistic
                title="Tổng chi phí"
                value={totalServiceCost}
                formatter={(value) => formatCurrency(Number(value))}
              />
            </Col>
          </Row>
          
          {data.serviceHistory && data.serviceHistory.length > 0 ? (
            <Timeline
              items={data.serviceHistory!
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((service) => ({
                  children: (
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>
                        {service.service}
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {new Date(service.date).toLocaleDateString('vi-VN')}
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                        📍 {service.location}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#1890ff' }}>
                        {formatCurrency(service.cost)}
                      </div>
                    </div>
                  ),
                }))
              }
            />
          ) : (
            <Text type="secondary">Chưa có lịch sử bảo dưỡng</Text>
          )}
        </Card>

        {/* Notes */}
        {data.notes && (
          <Card
            title={
              <Space>
                <ToolOutlined />
                Ghi chú
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Text>{data.notes}</Text>
          </Card>
        )}

        {/* System Information */}
        <Card
          title="Thông tin hệ thống"
          size="small"
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Ngày tạo">
              {new Date(data.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật cuối">
              {new Date(data.updatedAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
};

export default CarDetailModal;
