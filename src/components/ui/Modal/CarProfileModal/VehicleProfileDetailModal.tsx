"use client";

import React from "react";
import {
  Modal,
  Card,
  Row,
  Col,
  Tag,
  Avatar,
  Typography,
  Divider,
  Space,
  Button,
  Tooltip,
} from "antd";
import {
  CarOutlined,
  UserOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  EditOutlined,
  InfoCircleOutlined,
  NumberOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { VehicleProfileDisplay } from "@/lib/api/types/vehicle-profile.types";

const { Title, Text } = Typography;

interface VehicleProfileDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  onEdit?: (profile: VehicleProfileDisplay) => void;
  profile: VehicleProfileDisplay | null;
  loading?: boolean;
}

const VehicleProfileDetailModal: React.FC<VehicleProfileDetailModalProps> = ({
  visible,
  onCancel,
  onEdit,
  profile,
  loading = false,
}) => {
  if (!profile) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (isActive: boolean, isDeleted: boolean) => {
    if (isDeleted) return "red";
    if (isActive) return "green";
    return "orange";
  };

  const getStatusText = (isActive: boolean, isDeleted: boolean) => {
    if (isDeleted) return "Đã xóa";
    if (isActive) return "Hoạt động";
    return "Tạm dừng";
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <CarOutlined style={{ fontSize: 18 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1f2937' }}>
              Chi tiết hồ sơ xe
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {profile.license_plate}
            </Text>
          </div>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={900}
      style={{ top: 20 }}
      footer={[
        <Button key="close" onClick={onCancel} size="large">
          Đóng
        </Button>,
        onEdit && (
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(profile)}
            size="large"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: 6
            }}
          >
            Chỉnh sửa
          </Button>
        ),
      ]}
    >
      <div style={{ padding: '0 4px' }}>
        {/* Status and Basic Info */}
        <Card
          size="small"
          style={{
            marginBottom: 20,
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}
          styles={{
            header: {
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: '12px 12px 0 0',
              borderBottom: '1px solid #e5e7eb'
            }
          }}
        >
          <Row gutter={[20, 16]}>
            <Col xs={24} sm={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
                <Text strong style={{ color: '#374151' }}>Trạng thái:</Text>
              </div>
              <Tag 
                color={getStatusColor(profile.is_active, profile.is_deleted)}
                style={{ fontSize: 13, padding: '4px 12px' }}
              >
                {getStatusText(profile.is_active, profile.is_deleted)}
              </Tag>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <NumberOutlined style={{ color: '#1890ff' }} />
                <Text strong style={{ color: '#374151' }}>Số km đã đi:</Text>
              </div>
              <Text style={{ fontSize: 16, fontWeight: 600, color: '#1f2937' }}>
                {profile.distance_traveled.toLocaleString()} km
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Vehicle Information */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: 6,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <CarOutlined style={{ fontSize: 14 }} />
              </div>
              <div>
                <Title level={5} style={{ margin: 0, color: '#1f2937' }}>
                  Thông tin xe
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Chi tiết về phương tiện
                </Text>
              </div>
            </div>
          }
          size="small"
          style={{
            marginBottom: 20,
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}
          styles={{
            header: {
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: '12px 12px 0 0',
              borderBottom: '1px solid #e5e7eb'
            }
          }}
        >
          <Row gutter={[20, 16]}>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ color: '#374151', display: 'block', marginBottom: 4 }}>
                  Biển số xe:
                </Text>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: 600, 
                  color: '#1890ff',
                  fontFamily: 'monospace',
                  background: '#f0f9ff',
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: '1px solid #bae6fd'
                }}>
                  {profile.license_plate}
                </Text>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ color: '#374151', display: 'block', marginBottom: 4 }}>
                  Hãng xe:
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {profile.brand_logo && (
                    <Avatar 
                      src={profile.brand_logo} 
                      size="small"
                      style={{ flexShrink: 0 }}
                    />
                  )}
                  <Text style={{ fontSize: 15, fontWeight: 500 }}>
                    {profile.brand_name || 'Chưa cập nhật'}
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ color: '#374151', display: 'block', marginBottom: 4 }}>
                  Loại xe:
                </Text>
                <Tag 
                  color="blue" 
                  style={{ fontSize: 13, padding: '4px 12px' }}
                >
                  {profile.type_name || 'Chưa cập nhật'}
                </Tag>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ color: '#374151', display: 'block', marginBottom: 4 }}>
                  Dòng xe:
                </Text>
                <Text style={{ fontSize: 15, fontWeight: 500 }}>
                  {profile.model_name || 'Chưa cập nhật'}
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Owner Information */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: 6,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <UserOutlined style={{ fontSize: 14 }} />
              </div>
              <div>
                <Title level={5} style={{ margin: 0, color: '#1f2937' }}>
                  Thông tin chủ xe
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Chi tiết về người sở hữu
                </Text>
              </div>
            </div>
          }
          size="small"
          style={{
            marginBottom: 20,
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}
          styles={{
            header: {
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: '12px 12px 0 0',
              borderBottom: '1px solid #e5e7eb'
            }
          }}
        >
          <Row gutter={[20, 16]}>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ color: '#374151', display: 'block', marginBottom: 4 }}>
                  Tên chủ xe:
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar 
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#1890ff', flexShrink: 0 }}
                  />
                  <Text style={{ fontSize: 15, fontWeight: 500 }}>
                    {profile.owner_name || 'Chưa cập nhật'}
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ color: '#374151', display: 'block', marginBottom: 4 }}>
                  Số điện thoại:
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PhoneOutlined style={{ color: '#10b981' }} />
                  <Text style={{ fontSize: 15 }}>
                    {profile.owner_phone || 'Chưa cập nhật'}
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24}>
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ color: '#374151', display: 'block', marginBottom: 4 }}>
                  Email:
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MailOutlined style={{ color: '#8b5cf6' }} />
                  <Text style={{ fontSize: 15 }}>
                    {profile.owner_email || 'Chưa cập nhật'}
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Description */}
        {profile.description && (
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  borderRadius: 6,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <FileTextOutlined style={{ fontSize: 14 }} />
                </div>
                <div>
                  <Title level={5} style={{ margin: 0, color: '#1f2937' }}>
                    Mô tả chi tiết
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Thông tin bổ sung về xe
                  </Text>
                </div>
              </div>
            }
            size="small"
            style={{
              marginBottom: 20,
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}
            styles={{
              header: {
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '12px 12px 0 0',
                borderBottom: '1px solid #e5e7eb'
              }
            }}
          >
            <Text style={{ 
              fontSize: 14, 
              lineHeight: 1.6, 
              color: '#374151',
              whiteSpace: 'pre-wrap'
            }}>
              {profile.description}
            </Text>
          </Card>
        )}

        {/* System Information */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                borderRadius: 6,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <CalendarOutlined style={{ fontSize: 14 }} />
              </div>
              <div>
                <Title level={5} style={{ margin: 0, color: '#1f2937' }}>
                  Thông tin hệ thống
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Dữ liệu quản lý và theo dõi
                </Text>
              </div>
            </div>
          }
          size="small"
          style={{
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}
          styles={{
            header: {
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: '12px 12px 0 0',
              borderBottom: '1px solid #e5e7eb'
            }
          }}
        >
          <Row gutter={[20, 16]}>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ color: '#374151', display: 'block', marginBottom: 4 }}>
                  Ngày tạo:
                </Text>
                <Text style={{ fontSize: 14 }}>
                  {formatDate(profile.created_date)}
                </Text>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ color: '#374151', display: 'block', marginBottom: 4 }}>
                  Ngày cập nhật:
                </Text>
                <Text style={{ fontSize: 14 }}>
                  {formatDate(profile.modified_date)}
                </Text>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ color: '#374151', display: 'block', marginBottom: 4 }}>
                  Tạo bởi:
                </Text>
                <Text style={{ fontSize: 14 }}>
                  {profile.created_by || 'Hệ thống'}
                </Text>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ color: '#374151', display: 'block', marginBottom: 4 }}>
                  Cập nhật bởi:
                </Text>
                <Text style={{ fontSize: 14 }}>
                  {profile.modified_by || 'Hệ thống'}
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </Modal>
  );
};

export default VehicleProfileDetailModal;
