"use client";
import React from "react";
import {
  Modal,
  Card,
  Row,
  Col,
  Descriptions,
  Tag,
  Badge,
  Typography,
  Space,
  Statistic,
  Image,
  Divider,
  Alert,
} from "antd";
import {
  ToolOutlined, 
  TagOutlined,
  DollarOutlined,
  StarOutlined,
  CameraOutlined,
  LinkOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ShopOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Service, SERVICE_STATUS_OPTIONS } from "@/lib/api/types/service.types";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Title, Text } = Typography;

interface ServiceDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  data?: Service | null;
}

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  visible,
  onCancel,
  data,
}) => {
  if (!data) return null;

  // Parse image URLs
  const imageUrls: string[] = [];
  
  // Get skill level config
  const skillConfig = SERVICE_STATUS_OPTIONS.find(s => s.value === data.requiredSkillLevel);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            background: '#f0f0f0',
            borderRadius: 8,
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ToolOutlined style={{ color: '#666', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#333' }}>
              {data.serviceName}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ID: {data.serviceId.slice(-8)}
            </Text>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            {data.isFeatured && (
              <Tag color="gold" icon={<StarOutlined />} style={{ marginRight: 8 }}>
                Nổi bật
              </Tag>
            )}
            <Tag color={data.isActive ? "green" : "red"} icon={data.isActive ? <CheckCircleOutlined /> : <InfoCircleOutlined />}>
              {data.isActive ? "Hoạt động" : "Không hoạt động"}
            </Tag>
          </div>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={1200}
      footer={null}
      styles={{
        body: { padding: '24px' }
      }}
    >
      <div style={{ padding: "0" }}>
        {/* Overview Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card 
              size="small" 
              style={{ 
                background: '#f8f9fa',
                border: '1px solid #e9ecef'
              }}
            >
              <Statistic
                title={<span style={{ color: '#666' }}>Giá cơ bản</span>}
                value={data.basePrice}
                formatter={(value) => formatCurrency(Number(value))}
                valueStyle={{ color: '#333', fontSize: 20, fontWeight: 'bold' }}
                prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card 
              size="small" 
              style={{ 
                background: '#f8f9fa',
                border: '1px solid #e9ecef'
              }}
            >
              <Statistic
                title={<span style={{ color: '#666' }}>Chi phí lao động</span>}
                value={data.laborCost}
                formatter={(value) => formatCurrency(Number(value))}
                valueStyle={{ color: '#333', fontSize: 20, fontWeight: 'bold' }}
                prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card 
              size="small" 
              style={{ 
                background: '#f8f9fa',
                border: '1px solid #e9ecef'
              }}
            >
              <Statistic
                title={<span style={{ color: '#666' }}>Thời gian thực hiện</span>}
                value={data.standardDuration}
                suffix="phút"
                valueStyle={{ color: '#333', fontSize: 20, fontWeight: 'bold' }}
                prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Thông tin cơ bản */}
        <Card
          title={
            <Space>
              <div style={{ 
                background: '#f0f0f0',
                borderRadius: 6,
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TagOutlined style={{ color: '#666', fontSize: 16 }} />
              </div>
              <Title level={5} style={{ margin: 0, color: '#333' }}>Thông tin cơ bản</Title>
            </Space>
          }
          style={{ marginBottom: 16 }}
          headStyle={{ background: '#fafafa' }}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label={
                  <Space>
                    <LinkOutlined style={{ color: '#666' }} />
                    <Text strong>URL dịch vụ</Text>
                  </Space>
                }>
                  <Text code style={{ fontSize: 12 }}>{data.serviceUrl}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={
                  <Space>
                    <TagOutlined style={{ color: '#666' }} />
                    <Text strong>Danh mục</Text>
                  </Space>
                }>
                  <Tag color="default" icon={<TagOutlined />}>{data.categoryName}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label={
                  <Space>
                    <SettingOutlined style={{ color: '#666' }} />
                    <Text strong>Loại dịch vụ</Text>
                  </Space>
                }>
                  <Tag color="default" icon={<SettingOutlined />}>{data.serviceTypeName}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label={
                  <Space>
                    <ShopOutlined style={{ color: '#666' }} />
                    <Text strong>Chi nhánh</Text>
                  </Space>
                }>
                  <Tag color="default" icon={<ShopOutlined />}>{data.branchName || "Không xác định"}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label={
                  <Space>
                    <ThunderboltOutlined style={{ color: '#666' }} />
                    <Text strong>Quy trình dịch vụ</Text>
                  </Space>
                }>
                  <Tag color="default" icon={<ThunderboltOutlined />}>
                    {data.serviceProcessName || "Không xác định"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label={
                  <Space>
                    <CheckCircleOutlined style={{ color: '#666' }} />
                    <Text strong>Là quy trình mặc định</Text>
                  </Space>
                }>
                  <Tag color={data.isDefaultProcess ? "green" : "default"} icon={<CheckCircleOutlined />}>
                    {data.isDefaultProcess ? "Có" : "Không"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label={
                  <Space>
                    <StarOutlined style={{ color: '#666' }} />
                    <Text strong>Gói dịch vụ</Text>
                  </Space>
                }>
                  <Tag color={data.isPackage ? "green" : "default"} icon={<StarOutlined />}>
                    {data.isPackage ? "Có" : "Không"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label={
                  <Space>
                    <UserOutlined style={{ color: '#666' }} />
                    <Text strong>Kỹ năng yêu cầu</Text>
                  </Space>
                }>
                  <Tag color="default" icon={<UserOutlined />}>
                    {skillConfig?.label || data.requiredSkillLevel}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
          
          {data.description && (
            <>
              <Divider />
              <Alert
                message="Mô tả dịch vụ"
                description={data.description}
                type="info"
                icon={<InfoCircleOutlined />}
                showIcon
                style={{ marginTop: 16 }}
              />
            </>
          )}
        </Card>

        {/* Thông tin bổ sung */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Card 
              size="small"
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#666' }} />
                  <Text strong>Thông tin thời gian</Text>
                </Space>
              }
              headStyle={{ background: '#fafafa' }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Thời gian chuẩn"
                    value={data.standardDuration}
                    suffix="phút"
                    valueStyle={{ color: "#333", fontSize: 18 }}
                    prefix={<ClockCircleOutlined style={{ color: '#666' }} />}
                  />
                </Col>
                {data.estimatedDuration && (
                  <Col span={12}>
                    <Statistic
                      title="Thời gian ước tính"
                      value={data.estimatedDuration}
                      suffix="phút"
                      valueStyle={{ color: "#333", fontSize: 18 }}
                      prefix={<ClockCircleOutlined style={{ color: '#666' }} />}
                    />
                  </Col>
                )}
              </Row>
            </Card>
          </Col>
          <Col span={12}>
            <Card 
              size="small"
              title={
                <Space>
                  <UserOutlined style={{ color: '#666' }} />
                  <Text strong>Yêu cầu kỹ thuật</Text>
                </Space>
              }
              headStyle={{ background: '#fafafa' }}
            >
              <div style={{ textAlign: 'center' }}>
                <Tag 
                  color="default" 
                  icon={<UserOutlined />}
                  style={{ fontSize: 16, padding: '8px 16px' }}
                >
                  {skillConfig?.label || data.requiredSkillLevel}
                </Tag>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">Mức độ kỹ năng yêu cầu</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Thông tin quy trình dịch vụ */}
        <Card
          title={
            <Space>
              <div style={{ 
                background: '#f0f0f0',
                borderRadius: 6,
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ThunderboltOutlined style={{ color: '#666', fontSize: 16 }} />
              </div>
              <Title level={5} style={{ margin: 0, color: '#333' }}>Thông tin quy trình</Title>
            </Space>
          }
          style={{ marginBottom: 16 }}
          headStyle={{ background: '#fafafa' }}
        >
          <Alert
            message="Quy trình dịch vụ"
            description={
              <div>
                <p><strong>Tên quy trình:</strong> {data.serviceProcessName || "Không xác định"}</p>
                <p><strong>Mã quy trình:</strong> {data.serviceProcessCode || "N/A"}</p>
                <p><strong>Là quy trình mặc định:</strong> {data.isDefaultProcess ? "Có" : "Không"}</p>
                <p><strong>Thời gian ước tính:</strong> {data.estimatedDuration ? `${data.estimatedDuration} phút` : "N/A"}</p>
              </div>
            }
            type="info"
            icon={<ThunderboltOutlined />}
            showIcon
            style={{ marginTop: 16 }}
          />
        </Card>

        {/* Hình ảnh dịch vụ */}
        {imageUrls && imageUrls.length > 0 && (
          <Card
            title={
              <Space>
                <div style={{ 
                  background: '#f0f0f0',
                  borderRadius: 6,
                  padding: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CameraOutlined style={{ color: '#666', fontSize: 16 }} />
                </div>
                <Title level={5} style={{ margin: 0, color: '#333' }}>Hình ảnh dịch vụ</Title>
                <Badge count={imageUrls.length} style={{ backgroundColor: '#666' }} />
              </Space>
            }
            style={{ marginBottom: 16 }}
            headStyle={{ background: '#fafafa' }}
          >
            <Row gutter={[16, 16]}>
              {imageUrls.map((url: string, index: number) => (
                <Col key={index} span={8}>
                  <div style={{ 
                    border: '1px solid #e9ecef',
                    borderRadius: 8,
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    <Image
                      src={url}
                      alt={`Service image ${index + 1}`}
                      style={{ width: "100%" }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        )}


        {/* Thông tin thời gian */}
        <Card
          title={
            <Space>
              <div style={{ 
                background: '#f0f0f0',
                borderRadius: 6,
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ClockCircleOutlined style={{ color: '#666', fontSize: 16 }} />
              </div>
              <Title level={5} style={{ margin: 0, color: '#333' }}>Thông tin thời gian</Title>
            </Space>
          }
          headStyle={{ background: '#fafafa' }}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div style={{ 
                background: '#f8f9fa',
                padding: 16,
                borderRadius: 8,
                border: '1px solid #e9ecef'
              }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong style={{ color: '#666' }}>Thời gian tạo</Text>
                  <Text style={{ fontSize: 16, color: '#333' }}>
                    {data.created_date ? new Date(data.created_date).toLocaleString("vi-VN") : "N/A"}
                  </Text>
                </Space>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ 
                background: '#f8f9fa',
                padding: 16,
                borderRadius: 8,
                border: '1px solid #e9ecef'
              }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong style={{ color: '#666' }}>Thời gian cập nhật</Text>
                  <Text style={{ fontSize: 16, color: '#333' }}>
                    {data.modified_date ? new Date(data.modified_date).toLocaleString("vi-VN") : "N/A"}
                  </Text>
                </Space>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </Modal>
  );
};

export default ServiceDetailModal;
