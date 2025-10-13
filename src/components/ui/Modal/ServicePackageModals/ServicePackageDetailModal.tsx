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
  Spin,
  App,
  Alert,
  Divider,
} from "antd";
import {
  TagOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  ShopOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { ServicePackage } from "@/lib/api/types/service-package.types";
import { ServicePackageType } from "@/lib/api/types/service-package-type.types";
import { Category } from "@/lib/api/types/category.types";
import {
  ServiceProcessInfoDto,
  ServiceProcessStepInfoDto,
} from "@/lib/api/types/service-process.types";
import { Service, SkillLevel } from "@/lib/api/types/service.types";
import { servicePackageTypeService } from "@/lib/api/services/service-package-type.service";
import { categoryService } from "@/lib/api/services/category.service";
import { ServiceProcessService } from "@/lib/api/services/service-process.service";
import ServiceDetailModal from "@/components/ui/Modal/ServiceModals/ServiceDetailModal";
import CareProcessDetailModal from "@/components/ui/Modal/CarProcessModal/CareProcessDetailModal";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Title, Text } = Typography;

export interface ServicePackageDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  data: ServicePackage | null;
}

const ServicePackageDetailModal: React.FC<ServicePackageDetailModalProps> = ({
  visible,
  onCancel,
  data,
}) => {
  const { message } = App.useApp();

  // State for related data
  const [packageType, setPackageType] = useState<ServicePackageType | null>(
    null
  );
  const [category, setCategory] = useState<Category | null>(null);
  const [serviceProcess, setServiceProcess] =
    useState<ServiceProcessInfoDto | null>(null);

  // State for modals
  const [serviceDetailModalVisible, setServiceDetailModalVisible] =
    useState(false);
  const [processDetailModalVisible, setProcessDetailModalVisible] =
    useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedServiceProcess, setSelectedServiceProcess] = useState<ServiceProcessInfoDto | null>(null);

  // Loading states
  const [loading, setLoading] = useState(false);

  // Calculate process price from steps
  const calculateProcessPrice = useCallback(
    (process: ServiceProcessInfoDto | null) => {
      if (!process || !process.process_steps) return 0;

      return process.process_steps.reduce((total, step) => {
        if (!step.step_products) return total;
        return (
          total +
          step.step_products.reduce((stepTotal, product) => {
            return stepTotal + product.product_cost * product.quantity;
          }, 0)
        );
      }, 0);
    },
    []
  );

  // Calculate display values
  const displayDuration = useMemo(() => {
    if (data?.service_package_type_name === "COMBO") {
      // For combo packages, use total_duration from data
      return data.total_duration;
    } else if (serviceProcess) {
      // For process packages, use duration from process
      return serviceProcess.estimated_duration || data?.total_duration || 0;
    }
    return data?.total_duration || 0;
  }, [data, serviceProcess]);

  const displayPrice = useMemo(() => {
    if (data?.service_package_type_name === "COMBO") {
      // For combo packages, use package_price from data
      return data.package_price;
    } else if (serviceProcess) {
      // For process packages, calculate price from process
      const processPrice = calculateProcessPrice(serviceProcess);
      return processPrice > 0 ? processPrice : data?.package_price || 0;
    }
    return data?.package_price || 0;
  }, [data, serviceProcess, calculateProcessPrice]);


  // Load related data
  const loadRelatedData = useCallback(async () => {
    if (!data) return;

    setLoading(true);
    try {
      // Load package type
      if (data.service_package_type_id) {
        const packageTypeRes =
          await servicePackageTypeService.getServicePackageTypeById(
            data.service_package_type_id
          );
        setPackageType(packageTypeRes);
      }

      // Load category
      if (data.category_id) {
        const categoryRes = await categoryService.getCategoryById(
          data.category_id
        );
        setCategory(categoryRes.data as Category);
      }

      // Load service process (for non-combo packages)
      if (
        data.service_process_id &&
        data.service_package_type_name !== "COMBO"
      ) {
        const processRes = await ServiceProcessService.getServiceProcessById(
          data.service_process_id
        );
        setServiceProcess(processRes);
      }

    } catch (error) {
      console.error("Error loading related data:", error);
      message.error("Không thể tải thông tin liên quan");
    } finally {
      setLoading(false);
    }
  }, [data, message]);

  // Load data when modal opens
  useEffect(() => {
    if (visible && data) {
      loadRelatedData();
    }
  }, [visible, data, loadRelatedData]);

  // Handle view service detail
  const handleViewService = (service: Service) => {
    setSelectedService(service);
    setServiceDetailModalVisible(true);
  };




  // Table columns for combo services - using package_services data directly

  if (!data) return null;

  // Determine display type based on actual data
  const hasServices = data.package_services && data.package_services.length > 0;
  const hasProcess = data.service_process_id && data.service_process_id.trim() !== "";
  
  // If has services, show services (combo-like)
  // If no services but has process, show process
  const shouldShowServices = hasServices;
  const shouldShowProcess = !hasServices && hasProcess;

  return (
    <>
      <Modal
        title={
          <Space>
            <ShoppingCartOutlined />
            <span>Chi tiết gói dịch vụ</span>
          </Space>
        }
        open={visible}
        onCancel={onCancel}
        footer={[
          <Button key="close" onClick={onCancel}>
            Đóng
          </Button>,
        ]}
        width={1200}
        style={{ top: 20 }}
      >
        <Spin spinning={loading}>
          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {/* Header Information */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <div>
                      <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
                        {data.package_name}
                      </Title>
                      <Text type="secondary" code>
                        {data.package_id}
                      </Text>
                    </div>

                    <Space wrap>
                      {packageType && (
                        <Tag color="blue" icon={<TagOutlined />}>
                          {packageType.name}
                        </Tag>
                      )}
                      {category && (
                        <Tag color="green" icon={<ShopOutlined />}>
                          {category.category_name}
                        </Tag>
                      )}
                      <Tag
                        color={data.is_active ? "green" : "red"}
                        icon={<CheckCircleOutlined />}
                      >
                        {data.is_active ? "Hoạt động" : "Không hoạt động"}
                      </Tag>
                    </Space>
                  </Space>
                </Col>

                <Col span={12}>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic
                        title="Giá gói"
                        value={displayPrice}
                        formatter={(value) => formatCurrency(Number(value))}
                        valueStyle={{ color: "#52c41a", fontSize: 18 }}
                        prefix={<DollarOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Thời gian ước tính"
                        value={displayDuration}
                        suffix="phút"
                        valueStyle={{ color: "#1890ff", fontSize: 18 }}
                        prefix={<ClockCircleOutlined />}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>

            {/* Detailed Information */}
            <Card
              title={
                <Space>
                  <InfoCircleOutlined />
                  <span>Thông tin chi tiết</span>
                </Space>
              }
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="Tên gói dịch vụ" span={2}>
                  <Text strong>{data.package_name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Mã gói" span={1}>
                  <Text code>{data.package_id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Loại gói" span={1}>
                  <Tag color="blue">
                    {packageType?.name ||
                      data.service_package_type_name ||
                      "N/A"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Danh mục" span={1}>
                  <Tag color="green">
                    {category?.category_name || data.category_name}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Giá gói" span={1}>
                  <Text strong style={{ color: "#52c41a" }}>
                    {formatCurrency(displayPrice)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian dự kiến" span={1}>
                  <Tag color="orange">{displayDuration} phút</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Số dịch vụ" span={1}>
                  <Tag color="purple">
                    {data.package_services?.length || 0} dịch vụ
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái" span={1}>
                  <Tag color={data.is_active ? "green" : "red"}>
                    {data.is_active ? "Hoạt động" : "Không hoạt động"}
                  </Tag>
                </Descriptions.Item>
                {data.description && (
                  <Descriptions.Item label="Mô tả" span={2}>
                    <Text>{data.description}</Text>
                  </Descriptions.Item>
                )}
                {data.service_process_name && (
                  <Descriptions.Item label="Quy trình áp dụng" span={2}>
                    <Space>
                      <Text strong>{data.service_process_name}</Text>
                      {data.is_default_process && (
                        <Tag color="gold">Mặc định</Tag>
                      )}
                    </Space>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Package Type Specific Content */}
            {shouldShowServices ? (
              /* Combo Package - Services Cards */
              <Card
                title={
                  <Space>
                    <TeamOutlined />
                    <span>Danh sách dịch vụ trong gói</span>
                    <Tag color="blue">
                      {data.package_services?.length || 0} dịch vụ
                    </Tag>
                  </Space>
                }
                size="small"
                style={{ marginBottom: 16 }}
                extra={
                  <Space>
                    <Statistic
                      title="Tổng giá"
                      value={displayPrice}
                      formatter={(value) => formatCurrency(Number(value))}
                      valueStyle={{ color: "#52c41a", fontSize: 16 }}
                      prefix={<DollarOutlined />}
                    />
                  </Space>
                }
              >
                <div style={{ maxHeight: 400, overflowY: "auto" }}>
                  <Row gutter={[16, 16]}>
                    {data.package_services?.map((serviceItem, index) => (
                      <Col
                        span={24}
                        key={serviceItem.service_package_service_id || index}
                      >
                        <Card
                          size="small"
                          style={{
                            border: "1px solid #f0f0f0",
                            borderRadius: 8,
                            backgroundColor: "#fafafa",
                          }}
                          title={
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div>
                                <Text strong style={{ fontSize: 14 }}>
                                  {serviceItem.service_name}
                                </Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  ID: {serviceItem.service_id}
                                </Text>
                              </div>
                              <Space>
                                <Tag
                                  color={
                                    serviceItem.is_required ? "red" : "default"
                                  }
                                >
                                  {serviceItem.is_required
                                    ? "Bắt buộc"
                                    : "Tùy chọn"}
                                </Tag>
                                <Button
                                  type="link"
                                  icon={<EyeOutlined />}
                                  onClick={() => {
                                    const mockService: Service = {
                                      service_id: serviceItem.service_id || "",
                                      service_url:
                                        serviceItem.service_url || "",
                                      service_name:
                                        serviceItem.service_name || "",
                                      category_id: data?.category_id || "",
                                      category_name: data?.category_name || "",
                                      description:
                                        serviceItem.service_description || "",
                                      standard_duration:
                                        serviceItem.service_standard_duration ||
                                        0,
                                      required_skill_level: SkillLevel.BEGINNER,
                                      is_package: false,
                                      base_price:
                                        serviceItem.service_base_price || 0,
                                      labor_cost: 0,
                                      service_type_id: "",
                                      service_type_name: "",
                                      is_featured: false,
                                      is_active: serviceItem.is_active,
                                      service_process_id: "",
                                      service_process_name: "",
                                      service_process_code: "",
                                      is_default_process: false,
                                      estimated_duration:
                                        serviceItem.service_standard_duration ||
                                        0,
                                      branch_id: "",
                                      branch_name: "",
                                      audit: {
                                        created_date: "",
                                        modified_date: "",
                                        created_by: "",
                                        modified_by: "",
                                        is_active: serviceItem.is_active,
                                        is_deleted: false,
                                      },
                                    };
                                    handleViewService(mockService);
                                  }}
                                  size="small"
                                >
                                  Chi tiết
                                </Button>
                              </Space>
                            </div>
                          }
                        >
                          <Row gutter={[16, 8]}>
                            <Col span={12}>
                              <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Mô tả:
                                </Text>
                                <br />
                                <Text style={{ fontSize: 12 }}>
                                  {serviceItem.service_description &&
                                  serviceItem.service_description.length > 100
                                    ? `${serviceItem.service_description.substring(
                                        0,
                                        100
                                      )}...`
                                    : serviceItem.service_description ||
                                      "Không có mô tả"}
                                </Text>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Thông tin dịch vụ:
                                </Text>
                                <br />
                                <Space direction="vertical" size={2}>
                                  <Text style={{ fontSize: 12 }}>
                                    <ClockCircleOutlined
                                      style={{ marginRight: 4 }}
                                    />
                                    Thời gian:{" "}
                                    {serviceItem.service_standard_duration} phút
                                  </Text>
                                  <Text style={{ fontSize: 12 }}>
                                    <DollarOutlined
                                      style={{ marginRight: 4 }}
                                    />
                                    Giá cơ bản:{" "}
                                    {formatCurrency(
                                      serviceItem.service_base_price || 0
                                    )}
                                  </Text>
                                  <Text style={{ fontSize: 12 }}>
                                    <ShoppingCartOutlined
                                      style={{ marginRight: 4 }}
                                    />
                                    Số lượng: {serviceItem.quantity}
                                  </Text>
                                  <Text style={{ fontSize: 12 }}>
                                    <DollarOutlined
                                      style={{ marginRight: 4 }}
                                    />
                                    Đơn giá:{" "}
                                    {formatCurrency(
                                      serviceItem.unit_price || 0
                                    )}
                                  </Text>
                                  <Text
                                    strong
                                    style={{ fontSize: 12, color: "#52c41a" }}
                                  >
                                    <DollarOutlined
                                      style={{ marginRight: 4 }}
                                    />
                                    Tổng:{" "}
                                    {formatCurrency(
                                      serviceItem.total_price || 0
                                    )}
                                  </Text>
                                </Space>
                              </div>
                            </Col>
                          </Row>

                          {serviceItem.notes && (
                            <div
                              style={{
                                marginTop: 8,
                                paddingTop: 8,
                                borderTop: "1px solid #f0f0f0",
                              }}
                            >
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Ghi chú:
                              </Text>
                              <br />
                              <Text style={{ fontSize: 12 }}>
                                {serviceItem.notes}
                              </Text>
                            </div>
                          )}
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Card>
            ) : shouldShowProcess ? (
              /* Process-based Package - Process Information */
              <Card
                title={
                  <Space>
                    <SettingOutlined />
                    <span>Quy trình chăm sóc</span>
                  </Space>
                }
                size="small"
                style={{ marginBottom: 16 }}
                extra={
                  serviceProcess && (
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        setProcessDetailModalVisible(true);
                      }}
                      size="small"
                    >
                      Xem chi tiết quy trình
                    </Button>
                  )
                }
              >
                {serviceProcess ? (
                  <div>
                    <Descriptions column={2} size="small">
                      <Descriptions.Item label="Tên quy trình">
                        <Text strong>{serviceProcess.name}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Mã quy trình">
                        <Text code>{serviceProcess.code}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Số bước">
                        <Tag color="blue">{serviceProcess.step_count} bước</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Thời gian ước tính">
                        <Tag color="green">
                          {serviceProcess.estimated_duration} phút
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Trạng thái">
                        <Tag color={serviceProcess.is_active ? "green" : "red"}>
                          {serviceProcess.is_active
                            ? "Hoạt động"
                            : "Không hoạt động"}
                        </Tag>
                      </Descriptions.Item>
                    </Descriptions>

                    {serviceProcess.description && (
                      <div style={{ marginTop: 12 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <FileTextOutlined style={{ marginRight: 4 }} />
                          {serviceProcess.description}
                        </Text>
                      </div>
                    )}

                    {/* Process Steps Information */}
                    {serviceProcess.process_steps &&
                      serviceProcess.process_steps.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                          <Divider
                            orientation="left"
                            style={{ margin: "12px 0" }}
                          >
                            <Text strong style={{ fontSize: 14 }}>
                              <SettingOutlined style={{ marginRight: 4 }} />
                              Các bước trong quy trình
                            </Text>
                          </Divider>
                          <div style={{ maxHeight: 200, overflowY: "auto" }}>
                            {serviceProcess.process_steps.map(
                              (
                                step: ServiceProcessStepInfoDto,
                                index: number
                              ) => (
                                <Card
                                  key={step.id || index}
                                  size="small"
                                  style={{ marginBottom: 8 }}
                                  styles={{ body: { padding: "8px 12px" } }}
                                >
                                  <Row gutter={8} align="middle">
                                    <Col span={2}>
                                      <Tag color="blue" style={{ margin: 0 }}>
                                        {index + 1}
                                      </Tag>
                                    </Col>
                                    <Col span={16}>
                                      <Text strong style={{ fontSize: 13 }}>
                                        {step.name}
                                      </Text>
                                      {step.description && (
                                        <>
                                          <br />
                                          <Text
                                            type="secondary"
                                            style={{ fontSize: 11 }}
                                          >
                                            {step.description}
                                          </Text>
                                        </>
                                      )}
                                    </Col>
                                    <Col
                                      span={6}
                                      style={{ textAlign: "right" }}
                                    >
                                      {step.estimated_time && (
                                        <Tag
                                          color="orange"
                                          style={{ fontSize: 10 }}
                                        >
                                          {step.estimated_time} phút
                                        </Tag>
                                      )}
                                      {step.is_required && (
                                        <Tag
                                          color="red"
                                          style={{
                                            fontSize: 10,
                                            marginLeft: 4,
                                          }}
                                        >
                                          Bắt buộc
                                        </Tag>
                                      )}
                                    </Col>
                                  </Row>
                                </Card>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <Alert
                    message="Chưa có thông tin quy trình"
                    description="Gói dịch vụ này chưa được gán quy trình chăm sóc cụ thể."
                    type="info"
                    showIcon
                  />
                )}
              </Card>
            ) : (
              /* No services and no process */
              <Card
                title={
                  <Space>
                    <InfoCircleOutlined />
                    <span>Thông tin gói dịch vụ</span>
                  </Space>
                }
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Alert
                  message="Gói dịch vụ cơ bản"
                  description="Gói dịch vụ này chưa có dịch vụ cụ thể hoặc quy trình chăm sóc được gán."
                  type="info"
                  showIcon
                />
              </Card>
            )}

            {/* Description */}
            {data.description && (
              <Card
                title="Mô tả gói dịch vụ"
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Text>{data.description}</Text>
              </Card>
            )}

            {/* Images
            {imageUrls.length > 0 && (
              <Card title="Hình ảnh gói dịch vụ" size="small">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {imageUrls.map((url, index) => (
                    <div key={index} style={{ position: "relative" }}>
                      <Image
                        src={url}
                        alt={`Package image ${index + 1}`}
                        width={120}
                        height={120}
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
            )} */}
          </div>
        </Spin>
      </Modal>

      {/* Service Detail Modal */}
      {selectedService && (
        <ServiceDetailModal
          visible={serviceDetailModalVisible}
          onCancel={() => {
            setServiceDetailModalVisible(false);
            setSelectedService(null);
          }}
          data={selectedService}
        />
      )}

      {/* Process Detail Modal */}
      {processDetailModalVisible && (serviceProcess || selectedServiceProcess) && (
        <CareProcessDetailModal
          open={processDetailModalVisible}
          onCancel={() => {
            setProcessDetailModalVisible(false);
            setSelectedServiceProcess(null);
          }}
          process={selectedServiceProcess || serviceProcess!}
        />
      )}
    </>
  );
};

export default ServicePackageDetailModal;
