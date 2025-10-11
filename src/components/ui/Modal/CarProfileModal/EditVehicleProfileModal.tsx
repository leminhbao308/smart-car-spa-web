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
  message} from "antd";
import {
  CarOutlined,
  InfoCircleOutlined,
  NumberOutlined,
  FileTextOutlined,
  UserOutlined,
  EditOutlined} from "@ant-design/icons";

const { Title, Text } = Typography;
import { VehicleProfileDisplay } from "@/lib/api/types/vehicle-profile.types";
import { useVehicleTypesDropdown } from "@/lib/api/hooks/useVehicleTypes";
import { useVehicleBrandsDropdown } from "@/lib/api/hooks/useVehicleBrands";
import { VehicleBrandSelect } from "@/components/ui/VehicleBrandSelect";
import { VehicleTypeSelect } from "@/components/ui/VehicleTypeSelect";
import { VehicleModelSelect } from "@/components/ui/VehicleModelSelect";
import { CustomerSelect } from "@/components/ui/CustomerSelect";
import { VehicleProfileService } from "@/lib/api/services/vehicle-profile.service";
import { MemoizedInput, MemoizedTextArea, MemoizedInputNumber } from "@/components/ui/MemoizedComponents";

interface EditVehicleProfileModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (updatedProfile: VehicleProfileDisplay) => void;
  profile: VehicleProfileDisplay | null;
  loading?: boolean;
}

const EditVehicleProfileModal: React.FC<EditVehicleProfileModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  profile,
  loading = false}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Get dropdown data from APIs
  const { loading: typesLoading, error: typesError } = useVehicleTypesDropdown();
  const { loading: brandsLoading, error: brandsError } = useVehicleBrandsDropdown();

  useEffect(() => {
    if (visible && profile) {
      // Set form values from profile data
      form.setFieldsValue({
        license_plate: profile.license_plate,
        description: profile.description || "",
        vehicle_brand_id: profile.vehicle_brand_id,
        vehicle_type_id: profile.vehicle_type_id,
        vehicle_model_id: profile.vehicle_model_id,
        owner_id: profile.owner_id,
        distance_traveled: profile.distance_traveled});
    }
  }, [visible, profile, form]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();

      if (!profile) {
        message.error("Không tìm thấy thông tin hồ sơ xe");
        return;
      }

      const updateData = {
        license_plate: values.license_plate,
        description: values.description || "",
        vehicle_brand_id: values.vehicle_brand_id,
        vehicle_type_id: values.vehicle_type_id,
        vehicle_model_id: values.vehicle_model_id,
        owner_id: values.owner_id,
        distance_traveled: values.distance_traveled};

      console.log("Updating vehicle profile with data:", updateData);

      const updatedProfile = await VehicleProfileService.updateVehicleProfile(
        profile.vehicle_id,
        updateData
      );

      message.success("Cập nhật hồ sơ xe thành công!");
      onSuccess(updatedProfile);
    } catch (error: unknown) {
      console.error("Update vehicle profile error:", error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật hồ sơ xe";
      message.error(errorMessage);
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

  if (!profile) return null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <EditOutlined style={{ fontSize: 18 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1f2937' }}>
              Chỉnh sửa hồ sơ xe
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Cập nhật thông tin cho {profile.license_plate}
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
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            border: 'none',
            borderRadius: 6
          }}
        >
          {submitting ? 'Đang cập nhật...' : 'Cập nhật hồ sơ xe'}
        </Button>,
      ]}
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
            border: '1px solid #ff4d4f'
          }}
        />
      )}

      {isDataLoading && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: '#f8fafc',
          borderRadius: 8,
          marginBottom: 20
        }}>
          <Spin size="large" />
          <div style={{ marginTop: 12, color: '#64748b', fontSize: 14 }}>
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
        style={{ padding: '0 4px' }}
      >
        {/* Owner Information Section */}
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
                  Chọn khách hàng làm chủ xe
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
            <Col xs={24}>
              <Form.Item
                label={
                  <span style={{ fontWeight: 500, color: '#374151' }}>
                    Chủ xe <span style={{ color: '#ef4444' }}>*</span>
                  </span>
                }
                name="owner_id"
                rules={[{ required: true, message: "Vui lòng chọn chủ xe!" }]}
              >
                <CustomerSelect
                  placeholder="Chọn khách hàng"
                  size="large"
                  style={{
                    borderRadius: 8,
                    border: '1px solid #d1d5db'
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Basic Information Section */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: 6,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <NumberOutlined style={{ fontSize: 14 }} />
              </div>
              <div>
                <Title level={5} style={{ margin: 0, color: '#1f2937' }}>
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
              <Form.Item
                label={
                  <span style={{ fontWeight: 500, color: '#374151' }}>
                    Biển số xe <span style={{ color: '#ef4444' }}>*</span>
                  </span>
                }
                name="license_plate"
                rules={[
                  { required: true, message: "Vui lòng nhập biển số xe!" },
                  {
                    pattern: /^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/,
                    message: "Biển số không đúng định dạng! (VD: 51A-12345)"
                  },
                ]}
              >
                <MemoizedInput
                  placeholder="VD: 51A-12345"
                  style={{
                    textTransform: 'uppercase',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    padding: '8px 12px'
                  }}
                  maxLength={10}
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span style={{ fontWeight: 500, color: '#374151' }}>
                    Số km đã đi <span style={{ color: '#ef4444' }}>*</span>
                  </span>
                }
                name="distance_traveled"
                rules={[
                  { required: true, message: "Vui lòng nhập số km!" },
                  { type: 'number', min: 0, message: "Số km phải lớn hơn hoặc bằng 0!" },
                ]}
              >
                <MemoizedInputNumber
                  placeholder="0"
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    border: '1px solid #d1d5db'
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
                  Hãng, loại và dòng xe
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
              <Form.Item
                label={
                  <span style={{ fontWeight: 500, color: '#374151' }}>
                    Hãng xe <span style={{ color: '#ef4444' }}>*</span>
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
                    border: '1px solid #d1d5db'
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span style={{ fontWeight: 500, color: '#374151' }}>
                    Loại xe <span style={{ color: '#ef4444' }}>*</span>
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
                    border: '1px solid #d1d5db'
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[20, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span style={{ fontWeight: 500, color: '#374151' }}>
                    Dòng xe <span style={{ color: '#ef4444' }}>*</span>
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
                    border: '1px solid #d1d5db'
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Additional Information Section */}
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
            <Col xs={24}>
              <Form.Item
                label={
                  <span style={{ fontWeight: 500, color: '#374151' }}>
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
                    border: '1px solid #d1d5db',
                    resize: 'vertical'
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Help Section */}
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
                <InfoCircleOutlined style={{ fontSize: 14 }} />
              </div>
              <div>
                <Title level={5} style={{ margin: 0, color: '#1f2937' }}>
                  Hướng dẫn chỉnh sửa
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Lưu ý quan trọng khi cập nhật hồ sơ xe
                </Text>
              </div>
            </div>
          }
          size="small"
          style={{
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
          }}
          styles={{
            header: {
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '12px 12px 0 0',
              borderBottom: '1px solid #e5e7eb'
            }
          }}
        >
          <div style={{
            fontSize: 13,
            color: '#92400e',
            lineHeight: 1.6
          }}>
            <div style={{ marginBottom: 12 }}>
              <strong style={{ color: '#b45309' }}>✏️ Chỉnh sửa:</strong> Cập nhật thông tin cần thiết cho hồ sơ xe
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong style={{ color: '#b45309' }}>📋 Biển số xe:</strong> Đảm bảo biển số đúng định dạng (VD: 51A-12345)
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong style={{ color: '#b45309' }}>📊 Số km:</strong> Cập nhật số km hiện tại chính xác
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong style={{ color: '#b45309' }}>🏭 Thông tin xe:</strong> Chọn đúng hãng, loại và dòng xe
            </div>
            <div>
              <strong style={{ color: '#b45309' }}>👤 Chủ xe:</strong> Xác nhận thông tin chủ xe chính xác
            </div>
          </div>
        </Card>
      </Form>
    </Modal>
  );
};

export default EditVehicleProfileModal;

