"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  StarOutlined,
  LinkOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Service, SERVICE_STATUS_OPTIONS } from "@/lib/api/types/service.types";
import { ServiceProcessInfoDto } from "@/lib/api/types/service-process.types";
import { ServiceProcessService } from "@/lib/api/services/service-process.service";
import { useServiceTypes } from "@/lib/api/hooks/useServiceTypes";
import CareProcessDetailModal from "@/components/ui/Modal/CarProcessModal/CareProcessDetailModal";
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

  // Get service types for mapping
  const { data: serviceTypesData } = useServiceTypes({});

  // State for process details and modals
  const [processDetails, setProcessDetails] =
    useState<ServiceProcessInfoDto | null>(null);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [loadingProcess, setLoadingProcess] = useState(false);

  const loadProcessDetails = useCallback(async () => {
    if (!data?.service_process_id) return;

    setLoadingProcess(true);
    try {
      const process = await ServiceProcessService.getServiceProcessById(
        data.service_process_id
      );
      setProcessDetails(process);
    } catch (error) {
      console.error("Error loading process details:", error);
      message.error("Không thể tải chi tiết quy trình");
    } finally {
      setLoadingProcess(false);
    }
  }, [data?.service_process_id, message]);

  // Create service type mapping
  const serviceTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    if (serviceTypesData?.data?.content) {
      serviceTypesData.data.content.forEach((type) => {
        map.set(type.service_type_id, type.name);
      });
    }
    return map;
  }, [serviceTypesData]);

  // Helper function to get service type name
  const getServiceTypeName = (service: Service) => {
    return service.service_type_name || serviceTypeMap.get(service.service_type_id) || "Không xác định";
  };

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

  if (!data) return null;

  // Use service data
  const displayData = data;

  // Parse image URLs
  const imageUrls: string[] = [];

  // Get skill level config
  const skillConfig = SERVICE_STATUS_OPTIONS.find(
    (s) => s.value === displayData.required_skill_level
  );

  return (
    <>
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: "#f0f2f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ToolOutlined style={{ color: "#666", fontSize: 20 }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: "#333" }}>
                {displayData.service_name}
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                ID: {displayData.service_id.slice(-8)}
              </Text>
            </div>
            <div style={{ marginLeft: "auto" }}>
              {displayData.is_featured && (
                <Tag
                  color="gold"
                  icon={<StarOutlined />}
                  style={{ marginRight: 8 }}
                >
                  Nổi bật
                </Tag>
              )}
              <Tag
                color={displayData.is_active ? "green" : "red"}
                icon={
                  displayData.is_active ? (
                    <CheckCircleOutlined />
                  ) : (
                    <InfoCircleOutlined />
                  )
                }
              >
                {displayData.is_active ? "Hoạt động" : "Không hoạt động"}
              </Tag>
            </div>
          </div>
        }
        open={visible}
        onCancel={onCancel}
        width="95%"
        style={{ maxWidth: 1200 }}
        styles={{ body: { overflowX: 'hidden' } }}
        footer={[
          <Button key="close" onClick={onCancel}>
            Đóng
          </Button>,
        ]}
        destroyOnHidden
      >
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {/* Header Stats */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={6}>
              <Card size="small" style={{ textAlign: "center" }}>
                <Statistic
                  title="Thời gian ước tính"
                  value={displayData.estimated_duration}
                  suffix="phút"
                  valueStyle={{ color: "#1890ff", fontSize: 18 }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card size="small" style={{ textAlign: "center" }}>
                <Statistic
                  title="Loại dịch vụ"
                  value={getServiceTypeName(displayData)}
                  valueStyle={{ color: "#722ed1", fontSize: 14 }}
                  prefix={<SettingOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card size="small" style={{ textAlign: "center" }}>
                <Statistic
                  title="Cấp độ kỹ năng"
                  value={skillConfig?.label || displayData.required_skill_level}
                  valueStyle={{ color: "#52c41a", fontSize: 14 }}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card size="small" style={{ textAlign: "center" }}>
                <Statistic
                  title="Dịch vụ nổi bật"
                  value={displayData.is_featured ? "Có" : "Không"}
                  valueStyle={{
                    color: displayData.is_featured ? "#faad14" : "#999",
                    fontSize: 14,
                  }}
                  prefix={<StarOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Main Content - Vertical Layout */}
          <div>
            {/* Basic Information */}
            <Card
              title="Thông tin cơ bản"
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item
                  label={
                    <Space>
                      <ToolOutlined style={{ color: "#666" }} />
                      <Text strong>Tên dịch vụ</Text>
                    </Space>
                  }
                >
                  <Text strong style={{ fontSize: 16 }}>
                    {displayData.service_name}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <LinkOutlined style={{ color: "#666" }} />
                      <Text strong>URL dịch vụ</Text>
                    </Space>
                  }
                >
                  <Text code style={{ fontSize: 12 }}>
                    {displayData.service_url}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <TagOutlined style={{ color: "#666" }} />
                      <Text strong>Danh mục</Text>
                    </Space>
                  }
                >
                  <Tag color="blue" icon={<TagOutlined />}>
                    {displayData.category_name}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <SettingOutlined style={{ color: "#666" }} />
                      <Text strong>Loại dịch vụ</Text>
                    </Space>
                  }
                >
                  <Tag color="purple" icon={<SettingOutlined />}>
                    {getServiceTypeName(displayData)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <UserOutlined style={{ color: "#666" }} />
                      <Text strong>Cấp độ kỹ năng</Text>
                    </Space>
                  }
                >
                  <Tag
                    color={skillConfig?.color || "default"}
                    icon={<UserOutlined />}
                  >
                    {skillConfig?.label || displayData.required_skill_level}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
            {/* Process Information */}
            <Card
              title="Quy trình chăm sóc"
              size="small"
              style={{ marginBottom: 16 }}
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
                <div style={{ textAlign: "center", padding: 20 }}>
                  <Spin />
                  <div style={{ marginTop: 8 }}>
                    Đang tải thông tin quy trình...
                  </div>
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
                      <Tag color="blue">
                        {processDetails.process_steps?.length || 0} bước
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian ước tính">
                      <Tag color="green">
                        {processDetails.estimated_duration} phút
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Tag color={processDetails.is_active ? "green" : "red"}>
                        {processDetails.is_active
                          ? "Hoạt động"
                          : "Không hoạt động"}
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
          </div>

          {/* Description */}
          {displayData.description && (
            <Card title="Mô tả dịch vụ" size="small" style={{ marginTop: 16 }}>
              <Text>{displayData.description}</Text>
            </Card>
          )}

          {/* Images */}
          {imageUrls.length > 0 && (
            <Card
              title="Hình ảnh dịch vụ"
              size="small"
              style={{ marginTop: 16 }}
            >
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
                        border: "1px solid #d9d9d9",
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
