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
  ShoppingCartOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Service, SERVICE_STATUS_OPTIONS } from "@/lib/api/types/service.types";
import { ServiceProcessInfoDto } from "@/lib/api/types/service-process.types";
import { ServiceProcessService } from "@/lib/api/services/service-process.service";
import { useServiceTypes } from "@/lib/api/hooks/useServiceTypes";
import CareProcessDetailModal from "@/components/ui/Modal/CarProcessModal/CareProcessDetailModal";

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
    return (
      service.service_type_name ||
      serviceTypeMap.get(service.service_type_id) ||
      "Không xác định"
    );
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

  // Parse image URLs (not used in current design)
  // const imageUrls: string[] = [];

  // Get skill level config
  const skillConfig = SERVICE_STATUS_OPTIONS.find(
    (s) => s.value === displayData.required_skill_level
  );

  return (
    <>
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
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: "#e6f7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #1890ff",
              }}
            >
              <ToolOutlined style={{ color: "#1890ff", fontSize: 24 }} />
            </div>
            <div style={{ flex: 1 }}>
              <Title
                level={3}
                style={{
                  margin: 0,
                  color: "#262626",
                  fontSize: 24,
                  fontWeight: 600,
                }}
              >
                {displayData.service_name}
              </Title>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {displayData.is_featured && (
                <Tag
                  color="gold"
                  icon={<StarOutlined />}
                  style={{
                    margin: 0,
                    fontSize: 13,
                    padding: "4px 12px",
                    borderRadius: 6,
                    fontWeight: 500,
                  }}
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
                style={{
                  margin: 0,
                  fontSize: 13,
                  padding: "4px 12px",
                  borderRadius: 6,
                  fontWeight: 500,
                }}
              >
                {displayData.is_active ? "Hoạt động" : "Không hoạt động"}
              </Tag>
            </div>
          </div>
        }
        open={visible}
        onCancel={onCancel}
        width="95%"
        style={{ maxWidth: 1400 }}
        styles={{
          body: {
            overflowX: "hidden",
            maxHeight: "85vh",
            overflowY: "auto",
            padding: "24px",
            backgroundColor: "#fafafa",
          },
        }}
        footer={[
          <Button
            key="close"
            onClick={onCancel}
            size="large"
            style={{
              fontSize: 16,
              height: 40,
              padding: "0 24px",
              borderRadius: 8,
            }}
          >
            Đóng
          </Button>,
        ]}
        destroyOnHidden
      >
        <div
          style={{
            overflowX: "hidden",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Header Stats */}
          <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
            <Col xs={24} sm={6}>
              <Card
                size="small"
                style={{
                  textAlign: "center",
                  borderRadius: 12,
                  border: "1px solid #e8e8e8",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Statistic
                  title={
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#595959",
                      }}
                    >
                      Thời gian ước tính
                    </span>
                  }
                  value={displayData.service_process?.estimated_duration || 0}
                  valueStyle={{
                    color: "#1890ff",
                    fontSize: 24,
                    fontWeight: 600,
                  }}
                  prefix={<ClockCircleOutlined style={{ fontSize: 20 }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card
                size="small"
                style={{
                  textAlign: "center",
                  borderRadius: 12,
                  border: "1px solid #e8e8e8",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Statistic
                  title={
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#595959",
                      }}
                    >
                      Số sản phẩm
                    </span>
                  }
                  value={displayData.service_products?.length || 0}
                  valueStyle={{
                    color: "#52c41a",
                    fontSize: 24,
                    fontWeight: 600,
                  }}
                  prefix={<ShoppingCartOutlined style={{ fontSize: 20 }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card
                size="small"
                style={{
                  textAlign: "center",
                  borderRadius: 12,
                  border: "1px solid #e8e8e8",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Statistic
                  title={
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#595959",
                      }}
                    >
                      Số bước quy trình
                    </span>
                  }
                  value={
                    displayData.service_process?.process_steps?.length || 0
                  }
                  valueStyle={{
                    color: "#722ed1",
                    fontSize: 24,
                    fontWeight: 600,
                  }}
                  prefix={<PlayCircleOutlined style={{ fontSize: 20 }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card
                size="small"
                style={{
                  textAlign: "center",
                  borderRadius: 12,
                  border: "1px solid #e8e8e8",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Statistic
                  title={
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#595959",
                      }}
                    >
                      Cấp độ kỹ năng
                    </span>
                  }
                  value={skillConfig?.label || displayData.required_skill_level}
                  valueStyle={{
                    color: "#fa8c16",
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                  prefix={<UserOutlined style={{ fontSize: 20 }} />}
                />
              </Card>
            </Col>
          </Row>

          {/* Main Content - Vertical Layout */}
          <div>
            {/* Basic Information */}
            <Card
              title={
                <span
                  style={{ fontSize: 18, fontWeight: 600, color: "#262626" }}
                >
                  Thông tin cơ bản
                </span>
              }
              size="small"
              style={{
                marginBottom: 20,
                width: "100%",
                boxSizing: "border-box",
                borderRadius: 12,
                border: "1px solid #e8e8e8",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <Descriptions column={1} size="middle">
                <Descriptions.Item
                  label={
                    <Space>
                      <ToolOutlined
                        style={{ color: "#1890ff", fontSize: 16 }}
                      />
                      <Text strong style={{ fontSize: 15, color: "#262626" }}>
                        Tên dịch vụ
                      </Text>
                    </Space>
                  }
                >
                  <Text strong style={{ fontSize: 18, color: "#262626" }}>
                    {displayData.service_name}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <LinkOutlined
                        style={{ color: "#1890ff", fontSize: 16 }}
                      />
                      <Text strong style={{ fontSize: 15, color: "#262626" }}>
                        URL dịch vụ
                      </Text>
                    </Space>
                  }
                >
                  <Text
                    code
                    style={{
                      fontSize: 14,
                      backgroundColor: "#f5f5f5",
                      padding: "4px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {displayData.service_url}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <TagOutlined style={{ color: "#1890ff", fontSize: 16 }} />
                      <Text strong style={{ fontSize: 15, color: "#262626" }}>
                        Danh mục
                      </Text>
                    </Space>
                  }
                >
                  <Tag
                    color="blue"
                    icon={<TagOutlined />}
                    style={{
                      fontSize: 14,
                      padding: "4px 12px",
                      borderRadius: 6,
                    }}
                  >
                    {displayData.category_name}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <SettingOutlined
                        style={{ color: "#1890ff", fontSize: 16 }}
                      />
                      <Text strong style={{ fontSize: 15, color: "#262626" }}>
                        Loại dịch vụ
                      </Text>
                    </Space>
                  }
                >
                  <Tag
                    color="purple"
                    icon={<SettingOutlined />}
                    style={{
                      fontSize: 14,
                      padding: "4px 12px",
                      borderRadius: 6,
                    }}
                  >
                    {getServiceTypeName(displayData)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <Space>
                      <UserOutlined
                        style={{ color: "#1890ff", fontSize: 16 }}
                      />
                      <Text strong style={{ fontSize: 15, color: "#262626" }}>
                        Cấp độ kỹ năng
                      </Text>
                    </Space>
                  }
                >
                  <Tag
                    color={skillConfig?.color || "default"}
                    icon={<UserOutlined />}
                    style={{
                      fontSize: 14,
                      padding: "4px 12px",
                      borderRadius: 6,
                    }}
                  >
                    {skillConfig?.label || displayData.required_skill_level}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Description */}
            {displayData.description && (
              <Card
                title="Mô tả dịch vụ"
                size="small"
                style={{
                  marginBottom: 20,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <Text>{displayData.description}</Text>
              </Card>
            )}

            {/* Service Products */}
            {displayData.service_products &&
              displayData.service_products.length > 0 && (
                <Card
                  title={
                    <Space>
                      <ShoppingCartOutlined
                        style={{
                          color: "#52c41a",
                          fontSize: 18,
                          padding: "20px",
                        }}
                      />
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: 18,
                          color: "#262626",
                        }}
                      >
                        Sản phẩm sử dụng ({displayData.service_products.length})
                      </span>
                    </Space>
                  }
                  size="small"
                  style={{
                    marginBottom: 20,
                    width: "100%",
                    boxSizing: "border-box",
                    borderRadius: 12,
                    border: "1px solid #e8e8e8",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {displayData.service_products.map((product, index) => (
                      <div
                        key={product.id}
                        style={{
                          border: "1px solid #e8e8e8",
                          borderRadius: 12,
                          backgroundColor: "#ffffff",
                          overflow: "hidden",
                        }}
                      >
                        <Row gutter={0}>
                          {/* Thông tin cơ bản sản phẩm - Bên trái */}
                          <Col xs={24} lg={14}>
                            <div
                              style={{
                                padding: 20,
                                backgroundColor: "#f8f9fa",
                                borderRight: "1px solid #e8e8e8",
                                height: "100%",
                              }}
                            >
                              {/* Header với số thứ tự và tên sản phẩm */}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 12,
                                  marginBottom: 16,
                                }}
                              >
                                <div
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    backgroundColor: "#52c41a",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 14,
                                    fontWeight: "bold",
                                  }}
                                >
                                  {index + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <Text
                                    strong
                                    style={{
                                      fontSize: 16,
                                      color: "#262626",
                                      display: "block",
                                      marginBottom: 4,
                                    }}
                                  >
                                    {product.product_info.product_name}
                                  </Text>
                                  {product.is_required && (
                                    <Tag
                                      color="red"
                                      style={{ margin: 0, fontSize: 12 }}
                                    >
                                      Bắt buộc
                                    </Tag>
                                  )}
                                </div>
                              </div>

                              {/* Thông tin chi tiết */}
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 10,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 14,
                                      color: "#8c8c8c",
                                      minWidth: 110,
                                    }}
                                  >
                                    Số lượng sử dụng:
                                  </Text>
                                  <Tag
                                    color="blue"
                                    style={{
                                      margin: 0,
                                      fontSize: 14,
                                      padding: "4px 10px",
                                      borderRadius: 4,
                                      fontWeight: 500,
                                    }}
                                  >
                                    {product.quantity} {product.unit}
                                  </Tag>
                                </div>

                                {product.product_info.brand && (
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 10,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        color: "#8c8c8c",
                                        minWidth: 110,
                                      }}
                                    >
                                      Thương hiệu:
                                    </Text>
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        color: "#262626",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {product.product_info.brand}
                                    </Text>
                                  </div>
                                )}

                                {product.product_info.model && (
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 10,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        color: "#8c8c8c",
                                        minWidth: 110,
                                      }}
                                    >
                                      Model:
                                    </Text>
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        color: "#262626",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {product.product_info.model}
                                    </Text>
                                  </div>
                                )}

                                {product.product_info.sku && (
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 10,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        color: "#8c8c8c",
                                        minWidth: 110,
                                      }}
                                    >
                                      SKU:
                                    </Text>
                                    <Text
                                      code
                                      style={{
                                        fontSize: 13,
                                        backgroundColor: "#e6f7ff",
                                        padding: "3px 8px",
                                        borderRadius: 3,
                                      }}
                                    >
                                      {product.product_info.sku}
                                    </Text>
                                  </div>
                                )}

                                {product.notes && (
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "flex-start",
                                      gap: 10,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        color: "#8c8c8c",
                                        minWidth: 110,
                                        marginTop: 2,
                                      }}
                                    >
                                      Ghi chú:
                                    </Text>
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        color: "#595959",
                                        fontStyle: "italic",
                                        flex: 1,
                                      }}
                                    >
                                      {product.notes}
                                    </Text>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Col>

                          {/* Thuộc tính sản phẩm - Bên phải */}
                          <Col xs={24} lg={10}>
                            <div
                              style={{
                                padding: 20,
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <div style={{ marginBottom: 16 }}>
                                <Text
                                  strong
                                  style={{
                                    fontSize: 15,
                                    color: "#262626",
                                    marginBottom: 8,
                                    display: "block",
                                  }}
                                >
                                  Thuộc tính sản phẩm
                                </Text>
                              </div>

                              {product.product_info.attribute_values &&
                              product.product_info.attribute_values.length >
                                0 ? (
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                  }}
                                >
                                  {product.product_info.attribute_values.map(
                                    (attr, attrIndex) => (
                                      <div
                                        key={attrIndex}
                                        style={{
                                          padding: 10,
                                          backgroundColor: "#f6f6f6",
                                          borderRadius: 4,
                                          border: "1px solid #e8e8e8",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 10,
                                        }}
                                      >
                                        <Text
                                          style={{
                                            fontSize: 13,
                                            color: "#8c8c8c",
                                            minWidth: 90,
                                            flexShrink: 0,
                                          }}
                                        >
                                          {attr.attribute_name}:
                                        </Text>
                                        <Text
                                          style={{
                                            fontSize: 13,
                                            color: "#262626",
                                            fontWeight: 500,
                                            flex: 1,
                                          }}
                                        >
                                          {attr.display_value}
                                        </Text>
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <div
                                  style={{
                                    textAlign: "center",
                                    padding: "40px 20px",
                                    color: "#8c8c8c",
                                    backgroundColor: "#fafafa",
                                    borderRadius: 8,
                                    border: "1px dashed #d9d9d9",
                                  }}
                                >
                                  <ShoppingCartOutlined
                                    style={{
                                      fontSize: 24,
                                      marginBottom: 8,
                                      display: "block",
                                    }}
                                  />
                                  <Text style={{ fontSize: 13 }}>
                                    Không có thuộc tính
                                  </Text>
                                </div>
                              )}
                            </div>
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

            {/* Service Process */}
            {displayData.service_process ? (
              <Card
                title={
                  <Space>
                    <PlayCircleOutlined
                      style={{
                        color: "#722ed1",
                        fontSize: 18,
                        padding: "20px",
                      }}
                    />
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: 18,
                        color: "#262626",
                      }}
                    >
                      Quy trình dịch vụ
                    </span>
                    <Tag
                      color="blue"
                      style={{
                        fontSize: 14,
                        padding: "4px 12px",
                        borderRadius: 6,
                      }}
                    >
                      {displayData.service_process.code}
                    </Tag>
                  </Space>
                }
                size="small"
                style={{
                  marginBottom: 20,
                  width: "100%",
                  boxSizing: "border-box",
                  borderRadius: 12,
                  border: "1px solid #e8e8e8",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
                extra={
                  <Button
                    type="primary"
                    size="large"
                    icon={<EyeOutlined />}
                    onClick={handleViewProcess}
                    loading={loadingProcess}
                    style={{
                      fontSize: 14,
                      height: 36,
                      padding: "0 16px",
                      borderRadius: 6,
                    }}
                  >
                    Xem chi tiết
                  </Button>
                }
              >
                <Row gutter={[24, 16]}>
                  {/* Thông tin cơ bản quy trình - Bên trái */}
                  <Col xs={24} lg={10}>
                    <div
                      style={{
                        padding: 20,
                        backgroundColor: "#f8f9fa",
                        borderRadius: 8,
                        border: "1px solid #e9ecef",
                        height: "100%",
                      }}
                    >
                      <div style={{ marginBottom: 16 }}>
                        <Text
                          strong
                          style={{
                            fontSize: 16,
                            color: "#262626",
                            marginBottom: 8,
                            display: "block",
                          }}
                        >
                          Thông tin quy trình
                        </Text>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#8c8c8c",
                            marginBottom: 4,
                            display: "block",
                          }}
                        >
                          Tên quy trình
                        </Text>
                        <Text strong style={{ fontSize: 15, color: "#262626" }}>
                          {displayData.service_process.name}
                        </Text>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#8c8c8c",
                            marginBottom: 4,
                            display: "block",
                          }}
                        >
                          Mã quy trình
                        </Text>
                        <Text
                          code
                          style={{
                            fontSize: 14,
                            backgroundColor: "#e6f7ff",
                            padding: "4px 8px",
                            borderRadius: 4,
                          }}
                        >
                          {displayData.service_process.code}
                        </Text>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#8c8c8c",
                            marginBottom: 4,
                            display: "block",
                          }}
                        >
                          Số bước thực hiện
                        </Text>
                        <Tag
                          color="blue"
                          style={{
                            fontSize: 14,
                            padding: "4px 12px",
                            borderRadius: 6,
                          }}
                        >
                          {displayData.service_process.process_steps?.length ||
                            0}{" "}
                          bước
                        </Tag>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#8c8c8c",
                            marginBottom: 4,
                            display: "block",
                          }}
                        >
                          Trạng thái
                        </Text>
                        <Tag
                          color={
                            displayData.service_process.is_active
                              ? "green"
                              : "red"
                          }
                          style={{
                            fontSize: 14,
                            padding: "4px 12px",
                            borderRadius: 6,
                          }}
                        >
                          {displayData.service_process.is_active
                            ? "Hoạt động"
                            : "Không hoạt động"}
                        </Tag>
                      </div>

                      {displayData.service_process.description && (
                        <div
                          style={{
                            marginTop: 16,
                            paddingTop: 16,
                            borderTop: "1px solid #e8e8e8",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              color: "#8c8c8c",
                              marginBottom: 4,
                              display: "block",
                            }}
                          >
                            Mô tả
                          </Text>
                          <Text
                            style={{
                              fontSize: 14,
                              color: "#595959",
                              lineHeight: 1.5,
                            }}
                          >
                            <FileTextOutlined
                              style={{ marginRight: 6, color: "#1890ff" }}
                            />
                            {displayData.service_process.description}
                          </Text>
                        </div>
                      )}
                    </div>
                  </Col>

                  {/* Các bước quy trình - Bên phải */}
                  <Col xs={24} lg={14}>
                    <div style={{ height: "100%" }}>
                      <div style={{ marginBottom: 16 }}>
                        <Text
                          strong
                          style={{
                            fontSize: 16,
                            color: "#262626",
                            marginBottom: 8,
                            display: "block",
                          }}
                        >
                          Các bước thực hiện
                        </Text>
                      </div>

                      {displayData.service_process.process_steps &&
                      displayData.service_process.process_steps.length > 0 ? (
                        <div style={{ position: "relative" }}>
                          {/* Timeline line */}
                          <div
                            style={{
                              position: "absolute",
                              left: 20,
                              top: 12,
                              bottom: 12,
                              width: 2,
                              backgroundColor: "#e8e8e8",
                              zIndex: 1,
                            }}
                          />

                          {displayData.service_process.process_steps.map(
                            (step, index) => (
                              <div
                                key={step.id}
                                style={{
                                  position: "relative",
                                  paddingLeft: 70,
                                  paddingBottom:
                                    index ===
                                    (displayData.service_process?.process_steps
                                      ?.length || 0) -
                                      1
                                      ? 0
                                      : 24,
                                  zIndex: 2,
                                }}
                              >
                                {/* Timeline step number */}
                                <div
                                  style={{
                                    position: "absolute",
                                    left: 6,
                                    top: 2,
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    backgroundColor: "#6C7BEA",
                                    border: "3px solid #ffffff",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 16,
                                    fontWeight: "bold",
                                    color: "white",
                                    zIndex: 3,
                                  }}
                                >
                                  {step.step_order}
                                </div>

                                {/* Step content */}
                                <div
                                  style={{
                                    backgroundColor: "#ffffff",
                                    border: "1px solid #e8e8e8",
                                    borderRadius: 8,
                                    padding: 16,
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                    position: "relative",
                                  }}
                                >
                                  {/* Step header */}
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 12,
                                      marginBottom: 8,
                                    }}
                                  >
                                    <Text
                                      strong
                                      style={{
                                        fontSize: 15,
                                        color: "#262626",
                                        flex: 1,
                                      }}
                                    >
                                      {step.name}
                                    </Text>
                                    {step.is_required && (
                                      <Tag
                                        color="red"
                                        style={{ margin: 0, fontSize: 12 }}
                                      >
                                        Bắt buộc
                                      </Tag>
                                    )}
                                  </div>

                                  {/* Step description */}
                                  {step.description && (
                                    <div style={{ marginTop: 8 }}>
                                      <Text
                                        style={{
                                          fontSize: 13,
                                          color: "#666",
                                          lineHeight: 1.5,
                                        }}
                                      >
                                        {step.description}
                                      </Text>
                                    </div>
                                  )}

                                  {/* Step arrow indicator */}
                                  {index <
                                    (displayData.service_process?.process_steps
                                      ?.length || 0) -
                                      1 && (
                                    <div
                                      style={{
                                        position: "absolute",
                                        bottom: -12,
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        width: 0,
                                        height: 0,
                                        borderLeft: "6px solid transparent",
                                        borderRight: "6px solid transparent",
                                        borderTop: "8px solid #e8e8e8",
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "40px 20px",
                            color: "#8c8c8c",
                            backgroundColor: "#fafafa",
                            borderRadius: 8,
                            border: "1px dashed #d9d9d9",
                          }}
                        >
                          <PlayCircleOutlined
                            style={{
                              fontSize: 32,
                              marginBottom: 8,
                              display: "block",
                            }}
                          />
                          <Text style={{ fontSize: 14 }}>
                            Chưa có bước quy trình nào
                          </Text>
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card>
            ) : (
              <Card
                title={
                  <Space>
                    <PlayCircleOutlined
                      style={{ color: "#722ed1", fontSize: 18 }}
                    />
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: 18,
                        color: "#262626",
                      }}
                    >
                      Quy trình dịch vụ
                    </span>
                  </Space>
                }
                size="small"
                style={{
                  marginBottom: 20,
                  width: "100%",
                  boxSizing: "border-box",
                  borderRadius: 12,
                  border: "1px solid #e8e8e8",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Alert
                  message="Chưa có quy trình"
                  description="Dịch vụ này chưa được gán quy trình chăm sóc cụ thể"
                  type="info"
                  showIcon
                  style={{ fontSize: 14 }}
                />
              </Card>
            )}
          </div>

          {/* Images */}
          {/* {imageUrls.length > 0 && (
            <Card
              title="Hình ảnh dịch vụ"
              size="small"
              style={{ marginTop: 16, width: "100%", boxSizing: "border-box" }}
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
          )} */}
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
