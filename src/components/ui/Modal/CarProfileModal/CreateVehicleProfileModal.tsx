"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spin,
  Typography,
  Input,
} from "antd";
import {
  CarOutlined,
  InfoCircleOutlined,
  NumberOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
import { CreateVehicleProfileRequest } from "@/lib/api/types/vehicle-profile.types";
import { useVehicleTypesDropdown } from "@/lib/api/hooks/useVehicleTypes";
import { useVehicleBrandsDropdown } from "@/lib/api/hooks/useVehicleBrands";
import { VehicleBrandSelect } from "@/components/ui/VehicleBrandSelect";
import { VehicleTypeSelect } from "@/components/ui/VehicleTypeSelect";
import { VehicleModelSelect } from "@/components/ui/VehicleModelSelect";
import { CustomerSelect } from "@/components/ui/CustomerSelect";
import { CustomerModal } from "@/components/ui/Modal";
import {
  MemoizedInput,
  MemoizedTextArea,
  MemoizedInputNumber,
} from "@/components/ui/MemoizedComponents";
import { useUser } from "@/lib/api/hooks";

interface CreateVehicleProfileModalProps {
  ownerId?: string;
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: CreateVehicleProfileRequest) => void;
  loading?: boolean;
}

const CreateVehicleProfileModal: React.FC<CreateVehicleProfileModalProps> = ({
  ownerId,
  visible,
  onCancel,
  onSuccess,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [createCustomerModalVisible, setCreateCustomerModalVisible] =
    useState(false);
  const [customerSelectRefetch, setCustomerSelectRefetch] = useState<
    (() => void) | null
  >(null);

  // fetch user by ownerId and set to form if ownerId is provided
  const { user: owner, loading: isOwnerLoading } = useUser(ownerId || null);

  // Get dropdown data from APIs
  const { loading: typesLoading, error: typesError } =
    useVehicleTypesDropdown();
  const { loading: brandsLoading, error: brandsError } =
    useVehicleBrandsDropdown();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      // Set default values
      form.setFieldsValue({
        distance_traveled: 0,
      });

      // Set owner_id if ownerId is provided
      if (ownerId) {
        form.setFieldsValue({
          owner_id: ownerId,
        });
      }
    }
  }, [visible, form, ownerId]);

  // Set owner_id when owner data is loaded
  useEffect(() => {
    if (ownerId && owner && visible) {
      form.setFieldsValue({
        owner_id: ownerId,
      });
    }
  }, [ownerId, owner, visible, form]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();

      const createData: CreateVehicleProfileRequest = {
        license_plate: values.license_plate,
        description: values.description || "",
        vehicle_brand_id: values.vehicle_brand_id,
        vehicle_type_id: values.vehicle_type_id,
        vehicle_model_id: values.vehicle_model_id,
        owner_id: values.owner_id,
        distance_traveled: values.distance_traveled,
      };

      onSuccess(createData);
    } catch (error) {
      console.log("Form validation failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Check if any API is still loading
  const isDataLoading = typesLoading || brandsLoading;
  const hasApiError = Boolean(typesError || brandsError);

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleCreateCustomer = () => {
    setCreateCustomerModalVisible(true);
  };

  const handleCreateCustomerSuccess = (customer?: {
    user_id: string;
    full_name: string;
    email: string;
    phone_number: string;
  }) => {
    // Refresh the customer list and close modal
    setCreateCustomerModalVisible(false);

    // Trigger refetch of customer data
    if (customerSelectRefetch) {
      customerSelectRefetch();
    }

    // If we have customer data, set it as selected
    if (customer && customer.user_id) {
      form.setFieldsValue({
        owner_id: customer.user_id,
      });
    }
  };

  const handleCreateCustomerCancel = () => {
    setCreateCustomerModalVisible(false);
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <CarOutlined style={{ fontSize: 18 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: "#1f2937" }}>
              Thêm hồ sơ xe mới
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Nhập thông tin chi tiết về xe và chủ xe
            </Text>
          </div>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={1000}
      style={{ top: 20 }}
      footer={[
        <Button key="cancel" onClick={handleCancel} size="large">
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting || loading}
          disabled={isDataLoading || hasApiError}
          onClick={handleSubmit}
          size="large"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            borderRadius: 6,
          }}
        >
          {submitting ? "Đang tạo..." : "Tạo hồ sơ xe"}
        </Button>,
      ]}
      destroyOnHidden={true}
    >
      {hasApiError && (
        <Alert
          message="Lỗi tải dữ liệu"
          description="Không thể tải dữ liệu từ server. Vui lòng thử lại sau."
          type="error"
          showIcon
          style={{
            marginBottom: 20,
            borderRadius: 8,
            border: "1px solid #ff4d4f",
          }}
        />
      )}

      {isDataLoading && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            background: "#f8fafc",
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          <Spin size="large" />
          <div style={{ marginTop: 12, color: "#64748b", fontSize: 14 }}>
            Đang tải dữ liệu từ server...
          </div>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        scrollToFirstError
        disabled={isDataLoading || hasApiError}
        style={{ padding: "0 4px" }}
      >
        {/* Owner Information Section */}
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  borderRadius: 6,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <UserOutlined style={{ fontSize: 14 }} />
              </div>
              <div>
                <Title level={5} style={{ margin: 0, color: "#1f2937" }}>
                  Thông tin chủ xe
                </Title>
                {!ownerId && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Chọn khách hàng làm chủ xe
                  </Text>
                )}
              </div>
            </div>
          }
          size="small"
          style={{
            marginBottom: 20,
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          }}
          styles={{
            header: {
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              borderRadius: "12px 12px 0 0",
              borderBottom: "1px solid #e5e7eb",
            },
          }}
        >
          <Row gutter={[20, 16]}>
            <Col xs={24}>
              <Form.Item
                label={
                  <span style={{ fontWeight: 500, color: "#374151" }}>
                    Chủ xe <span style={{ color: "#ef4444" }}>*</span>
                  </span>
                }
                name="owner_id"
                rules={[{ required: true, message: "Vui lòng chọn chủ xe!" }]}
              >
                {ownerId && (
                  <Spin spinning={isOwnerLoading}>
                    <Input defaultValue={owner?.full_name} disabled />
                  </Spin>
                )}

                {!ownerId && (
                  <CustomerSelect
                    placeholder="Chọn khách hàng"
                    size="large"
                    style={{
                      borderRadius: 8,
                      border: "1px solid #d1d5db",
                    }}
                    onCreateCustomer={handleCreateCustomer}
                    onRefresh={(refetchFn) =>
                      setCustomerSelectRefetch(() => refetchFn)
                    }
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Basic Information Section */}
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  borderRadius: 6,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <NumberOutlined style={{ fontSize: 14 }} />
              </div>
              <div>
                <Title level={5} style={{ margin: 0, color: "#1f2937" }}>
                  Thông tin cơ bản
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Biển số và số km hiện tại
                </Text>
              </div>
            </div>
          }
          size="small"
          style={{
            marginBottom: 20,
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          }}
          styles={{
            header: {
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              borderRadius: "12px 12px 0 0",
              borderBottom: "1px solid #e5e7eb",
            },
          }}
        >
          <Row gutter={[20, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span style={{ fontWeight: 500, color: "#374151" }}>
                    Biển số xe <span style={{ color: "#ef4444" }}>*</span>
                  </span>
                }
                name="license_plate"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập biển số xe! (VD: 51A-12345)",
                  },
                ]}
              >
                <MemoizedInput
                  placeholder="VD: 51A-12345"
                  style={{
                    textTransform: "uppercase",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    padding: "8px 12px",
                  }}
                  maxLength={10}
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span style={{ fontWeight: 500, color: "#374151" }}>
                    Số km đã đi <span style={{ color: "#ef4444" }}>*</span>
                  </span>
                }
                name="distance_traveled"
                rules={[
                  { required: true, message: "Vui lòng nhập số km!" },
                  {
                    type: "number",
                    min: 0,
                    message: "Số km phải lớn hơn hoặc bằng 0!",
                  },
                ]}
              >
                <MemoizedInputNumber
                  placeholder="0"
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                  }}
                  min={0}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Vehicle Details Section */}
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  borderRadius: 6,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <CarOutlined style={{ fontSize: 14 }} />
              </div>
              <div>
                <Title level={5} style={{ margin: 0, color: "#1f2937" }}>
                  Thông tin xe
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Hãng, loại và dòng xe
                </Text>
              </div>
            </div>
          }
          size="small"
          style={{
            marginBottom: 20,
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          }}
          styles={{
            header: {
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              borderRadius: "12px 12px 0 0",
              borderBottom: "1px solid #e5e7eb",
            },
          }}
        >
          <Row gutter={[20, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span style={{ fontWeight: 500, color: "#374151" }}>
                    Hãng xe <span style={{ color: "#ef4444" }}>*</span>
                  </span>
                }
                name="vehicle_brand_id"
                rules={[{ required: true, message: "Vui lòng chọn hãng xe!" }]}
              >
                <VehicleBrandSelect
                  placeholder="Chọn hãng xe"
                  loading={brandsLoading}
                  size="large"
                  style={{
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span style={{ fontWeight: 500, color: "#374151" }}>
                    Loại xe <span style={{ color: "#ef4444" }}>*</span>
                  </span>
                }
                name="vehicle_type_id"
                rules={[{ required: true, message: "Vui lòng chọn loại xe!" }]}
              >
                <VehicleTypeSelect
                  placeholder="Chọn loại xe"
                  loading={typesLoading}
                  size="large"
                  style={{
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[20, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span style={{ fontWeight: 500, color: "#374151" }}>
                    Dòng xe <span style={{ color: "#ef4444" }}>*</span>
                  </span>
                }
                name="vehicle_model_id"
                rules={[{ required: true, message: "Vui lòng chọn dòng xe!" }]}
              >
                <VehicleModelSelect
                  placeholder="Chọn dòng xe"
                  size="large"
                  style={{
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Additional Information Section */}
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                  borderRadius: 6,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <FileTextOutlined style={{ fontSize: 14 }} />
              </div>
              <div>
                <Title level={5} style={{ margin: 0, color: "#1f2937" }}>
                  Thông tin bổ sung
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Mô tả chi tiết về xe (tùy chọn)
                </Text>
              </div>
            </div>
          }
          size="small"
          style={{
            marginBottom: 20,
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          }}
          styles={{
            header: {
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              borderRadius: "12px 12px 0 0",
              borderBottom: "1px solid #e5e7eb",
            },
          }}
        >
          <Row gutter={[20, 16]}>
            <Col xs={24}>
              <Form.Item
                label={
                  <span style={{ fontWeight: 500, color: "#374151" }}>
                    Mô tả chi tiết
                  </span>
                }
                name="description"
              >
                <MemoizedTextArea
                  rows={4}
                  placeholder="Nhập mô tả chi tiết về xe, tình trạng, lịch sử bảo dưỡng... (tùy chọn)"
                  maxLength={500}
                  showCount
                  size="large"
                  style={{
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    resize: "vertical",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Help Section */}
        {!ownerId && (
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    borderRadius: 6,
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <InfoCircleOutlined style={{ fontSize: 14 }} />
                </div>
                <div>
                  <Title level={5} style={{ margin: 0, color: "#1f2937" }}>
                    Hướng dẫn sử dụng
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Lưu ý quan trọng khi tạo hồ sơ xe
                  </Text>
                </div>
              </div>
            }
            size="small"
            style={{
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
              background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            }}
            styles={{
              header: {
                background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                borderRadius: "12px 12px 0 0",
                borderBottom: "1px solid #e5e7eb",
              },
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "#92400e",
                lineHeight: 1.6,
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <strong style={{ color: "#b45309" }}>👤 Chủ xe:</strong> Chọn
                khách hàng từ danh sách có sẵn (bước đầu tiên)
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong style={{ color: "#b45309" }}>📋 Biển số xe:</strong>{" "}
                Nhập đúng định dạng (VD: 51A-12345)
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong style={{ color: "#b45309" }}>📊 Số km:</strong> Nhập số
                km hiện tại của xe
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong style={{ color: "#b45309" }}>🏭 Hãng xe:</strong> Chọn
                từ danh sách hãng xe có sẵn trong hệ thống
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong style={{ color: "#b45309" }}>🚗 Loại xe:</strong> Chọn
                loại xe phù hợp (Sedan, SUV, Hatchback...)
              </div>
              <div>
                <strong style={{ color: "#b45309" }}>🔧 Dòng xe:</strong> Chọn
                dòng xe cụ thể (Camry, Civic, Vios...)
              </div>
            </div>
          </Card>
        )}
      </Form>

      {/* Create Customer Modal */}
      <CustomerModal
        visible={createCustomerModalVisible}
        onCancel={handleCreateCustomerCancel}
        onSuccess={handleCreateCustomerSuccess}
      />
    </Modal>
  );
};

export default CreateVehicleProfileModal;
