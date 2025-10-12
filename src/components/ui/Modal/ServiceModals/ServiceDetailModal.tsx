"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Descriptions,
  Statistic,
  Space,
  Button,
  Alert,
  Spin,
  App,
} from "antd";
import {
  ToolOutlined, 
  TagOutlined,
  DollarOutlined,
  StarOutlined,
  LinkOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ShopOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Service, SERVICE_STATUS_OPTIONS } from "@/lib/api/types/service.types";
import { ServiceProcessInfoDto } from "@/lib/api/types/service-process.types";
import { ServiceService } from "@/lib/api/services/service.service";
import { ServiceProcessService } from "@/lib/api/services/service-process.service";
import CareProcessDetailModal from "@/components/ui/Modal/CarProcessModal/CareProcessDetailModal";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import Image from "next/image";

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
  const { message } = App.useApp();
  
  // State for process details and modals
  const [processDetails, setProcessDetails] = useState<ServiceProcessInfoDto | null>(null);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [loadingProcess, setLoadingProcess] = useState(false);
  const [recalculatingPrice, setRecalculatingPrice] = useState(false);
  const [updatedService, setUpdatedService] = useState<Service | null>(null);

  const loadProcessDetails = useCallback(async () => {
    if (!data?.service_process_id) return;
    
    setLoadingProcess(true);
    try {
      const process = await ServiceProcessService.getServiceProcessById(data.service_process_id);
      setProcessDetails(process);
    } catch (error) {
      console.error("Error loading process details:", error);
      message.error("Không thể tải chi tiết quy trình");
    } finally {
      setLoadingProcess(false);
    }
  }, [data?.service_process_id, message]);

  // Load process details when service has a process
  useEffect(() => {
    if (visible && data?.service_process_id) {
      loadProcessDetails();
    }
  }, [visible, data?.service_process_id, loadProcessDetails]);

  const handleViewProcess = () => {
    if (processDetails) {
      setProcessModalOpen(true);
    }
  };

  const handleRecalculatePrice = async () => {
    if (!data?.service_id) return;
    
    setRecalculatingPrice(true);
    try {
      const updatedPricing = await ServiceService.recalculateBasePrice(data.service_id);
      
      // Update the service data with new pricing
      const updatedServiceData = {
        ...data,
        base_price: updatedPricing.base_price,
        labor_cost: updatedPricing.labor_cost,
        estimated_duration: updatedPricing.process_steps?.reduce((total, step) => total + (step.estimated_time || 0), 0) || data.estimated_duration
      };
      
      setUpdatedService(updatedServiceData);
      message.success("Cập nhật giá dịch vụ thành công!");
    } catch (error) {
      console.error("Error recalculating price:", error);
      message.error("Không thể cập nhật giá dịch vụ");
    } finally {
      setRecalculatingPrice(false);
    }
  };

  if (!data) return null;

  // Use updated service data if available
  const displayData = updatedService || data;

  // Parse image URLs
  const imageUrls: string[] = [];
  
  // Get skill level config
  const skillConfig = SERVICE_STATUS_OPTIONS.find(s => s.value === displayData.required_skill_level);

  return (
    <>
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: '#f0f2f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ToolOutlined style={{ color: '#666', fontSize: 20 }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#333' }}>
                {displayData.service_name}
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                ID: {displayData.service_id.slice(-8)}
              </Text>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              {displayData.is_featured && (
                <Tag color="gold" icon={<StarOutlined />} style={{ marginRight: 8 }}>
                  Nổi bật
                </Tag>
              )}
              <Tag color={displayData.is_active ? "green" : "red"} icon={displayData.is_active ? <CheckCircleOutlined /> : <InfoCircleOutlined />}>
                {displayData.is_active ? "Hoạt động" : "Không hoạt động"}
              </Tag>
            </div>
          </div>
        }
        open={visible}
        onCancel={onCancel}
        width={1200}
        footer={[
          <Button key="close" onClick={onCancel}>
            Đóng
          </Button>
        ]}
        destroyOnHidden
      >
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Header Stats */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="Giá cơ bản"
                  value={displayData.base_price}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: "#52c41a", fontSize: 20 }}
                  prefix={<DollarOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="Chi phí lao động"
                  value={displayData.labor_cost}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: "#fa8c16", fontSize: 20 }}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="Thời gian chuẩn"
                  value={displayData.standard_duration}
                  suffix="phút"
                  valueStyle={{ color: "#1890ff", fontSize: 20 }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Main Content */}
          <Row gutter={[24, 24]}>
            {/* Left Column - Basic Info */}
            <Col xs={24} lg={12}>
              <Card title="Thông tin cơ bản" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label={
                    <Space>
                      <LinkOutlined style={{ color: '#666' }} />
                      <Text strong>URL dịch vụ</Text>
                    </Space>
                  }>
                    <Text code style={{ fontSize: 12 }}>{displayData.service_url}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label={
                    <Space>
                      <TagOutlined style={{ color: '#666' }} />
                      <Text strong>Danh mục</Text>
                    </Space>
                  }>
                    <Tag color="default" icon={<TagOutlined />}>{displayData.category_name}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={
                    <Space>
                      <SettingOutlined style={{ color: '#666' }} />
                      <Text strong>Loại dịch vụ</Text>
                    </Space>
                  }>
                    <Tag color="default" icon={<SettingOutlined />}>{displayData.service_type_name}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={
                    <Space>
                      <ShopOutlined style={{ color: '#666' }} />
                      <Text strong>Chi nhánh</Text>
                    </Space>
                  }>
                    <Tag color="default" icon={<ShopOutlined />}>{displayData.branch_name || "Không xác định"}</Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="Cấu hình dịch vụ" size="small" style={{ marginTop: 16 }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label={
                    <Space>
                      <ThunderboltOutlined style={{ color: '#666' }} />
                      <Text strong>Quy trình dịch vụ</Text>
                    </Space>
                  }>
                    <Tag color="default" icon={<ThunderboltOutlined />}>
                      {displayData.service_process_name || "Không xác định"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={
                    <Space>
                      <CheckCircleOutlined style={{ color: '#666' }} />
                      <Text strong>Là quy trình mặc định</Text>
                    </Space>
                  }>
                    <Tag color={displayData.is_default_process ? "green" : "default"} icon={<CheckCircleOutlined />}>
                      {displayData.is_default_process ? "Có" : "Không"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={
                    <Space>
                      <StarOutlined style={{ color: '#666' }} />
                      <Text strong>Gói dịch vụ</Text>
                    </Space>
                  }>
                    <Tag color={displayData.is_package ? "green" : "default"} icon={<StarOutlined />}>
                      {displayData.is_package ? "Có" : "Không"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={
                    <Space>
                      <UserOutlined style={{ color: '#666' }} />
                      <Text strong>Cấp độ kỹ năng</Text>
                    </Space>
                  }>
                    <Tag color={skillConfig?.color || "default"}>
                      {skillConfig?.label || displayData.required_skill_level}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Right Column - Process & Actions */}
            <Col xs={24} lg={12}>
              {/* Process Information */}
              <Card 
                title="Quy trình chăm sóc" 
                size="small"
                extra={
                  displayData.service_process_id && (
                    <Button 
                      type="primary" 
                      size="small" 
                      icon={<EyeOutlined />}
                      onClick={handleViewProcess}
                      loading={loadingProcess}
                    >
                      Xem chi tiết
                    </Button>
                  )
                }
              >
                {loadingProcess ? (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <Spin />
                    <div style={{ marginTop: 8 }}>Đang tải thông tin quy trình...</div>
                  </div>
                ) : processDetails ? (
                  <div>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Tên quy trình">
                        <Text strong>{processDetails.name}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Mã quy trình">
                        <Text code>{processDetails.code}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Số bước">
                        <Tag color="blue">{processDetails.step_count} bước</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Thời gian ước tính">
                        <Tag color="green">{processDetails.estimated_duration} phút</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Trạng thái">
                        <Tag color={processDetails.is_active ? "green" : "red"}>
                          {processDetails.is_active ? "Hoạt động" : "Không hoạt động"}
                        </Tag>
                      </Descriptions.Item>
                    </Descriptions>
                    
                    {processDetails.description && (
                      <div style={{ marginTop: 12 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <FileTextOutlined style={{ marginRight: 4 }} />
                          {processDetails.description}
                        </Text>
                      </div>
                    )}
                  </div>
                ) : displayData.service_process_id ? (
                  <Alert
                    message="Không thể tải thông tin quy trình"
                    description="Vui lòng thử lại hoặc liên hệ quản trị viên"
                    type="warning"
                    showIcon
                  />
                ) : (
                  <Alert
                    message="Chưa gán quy trình"
                    description="Dịch vụ này chưa được gán quy trình chăm sóc cụ thể"
                    type="info"
                    showIcon
                  />
                )}
              </Card>

              {/* Price Management */}
              <Card title="Quản lý giá" size="small" style={{ marginTop: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ marginBottom: 16 }}>
                    <Statistic
                      title="Tổng giá dự kiến"
                      value={displayData.base_price + displayData.labor_cost}
                      formatter={(value) => formatCurrency(Number(value))}
                      valueStyle={{ color: "#1890ff", fontSize: 24 }}
                      prefix={<DollarOutlined />}
                    />
                  </div>
                  
                  {displayData.service_process_id && (
                    <Button
                      type="primary"
                      icon={<ReloadOutlined />}
                      onClick={handleRecalculatePrice}
                      loading={recalculatingPrice}
                      block
                    >
                      Cập nhật giá theo quy trình
                    </Button>
                  )}
                  
                  <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                    {displayData.service_process_id 
                      ? "Tính lại giá dựa trên sản phẩm và thời gian trong quy trình"
                      : "Cần gán quy trình để tự động tính giá"
                    }
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Description */}
          {displayData.description && (
            <Card title="Mô tả dịch vụ" size="small" style={{ marginTop: 16 }}>
              <Text>{displayData.description}</Text>
            </Card>
          )}

          {/* Images */}
          {imageUrls.length > 0 && (
            <Card title="Hình ảnh dịch vụ" size="small" style={{ marginTop: 16 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {imageUrls.map((url, index) => (
                  <div key={index} style={{ position: "relative" }}>
                    <Image
                      src={url}
                      alt={`Service image ${index + 1}`}
                      width={100}
                      height={100}
                      style={{ 
                        objectFit: "cover",
                        borderRadius: 6,
                        border: '1px solid #d9d9d9'
                      }}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </Modal>

      {/* Process Detail Modal */}
      {processDetails && (
        <CareProcessDetailModal
          open={processModalOpen}
          onCancel={() => setProcessModalOpen(false)}
          process={processDetails}
        />
      )}
    </>
  );
};

export default ServiceDetailModal;