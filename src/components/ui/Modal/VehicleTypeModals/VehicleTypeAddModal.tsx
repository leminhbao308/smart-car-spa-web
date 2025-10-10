"use client";
import React from "react";
import { Modal, Form, Button, Row, Col, Typography, Card } from "antd";
import { PlusOutlined, CarOutlined } from "@ant-design/icons";
import { CreateVehicleTypeRequest } from "@/lib/api/types";
import { useCreateVehicleType } from "@/lib/api/hooks/useVehicleTypes";
import {
  MemoizedInput,
  MemoizedTextArea,
} from "@/components/ui/MemoizedComponents";

const { Title, Text } = Typography;

interface VehicleTypeAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const VehicleTypeAddModal: React.FC<VehicleTypeAddModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const createVehicleTypeMutation = useCreateVehicleType();

  const handleSubmit = async (values: {
    typeName: string;
    typeCode: string;
    description: string;
  }) => {
    const createData: CreateVehicleTypeRequest = {
      type_name: values.typeName,
      type_code: values.typeCode,
      description: values.description,
    };

    try {
      await createVehicleTypeMutation.mutateAsync(createData);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating vehicle type:", error);
      // Error handling is done in the hook
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <>
      <style jsx global>{`
        .ant-modal {
          max-width: 90vw !important;
        }
        .ant-modal-content {
          max-height: 90vh;
          overflow: hidden;
        }
        .ant-modal-body {
          padding: 16px !important;
          max-height: calc(90vh - 120px);
          overflow-y: auto;
          overflow-x: hidden;
        }
        .ant-form-item {
          margin-bottom: 16px;
        }
        @media (max-width: 768px) {
          .ant-modal {
            margin: 10px !important;
            max-width: calc(100vw - 20px) !important;
          }
          .ant-form-item {
            margin-bottom: 12px;
          }
        }
      `}</style>
      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 0",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                backgroundColor: "#f6ffed",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #b7eb8f",
              }}
            >
              <PlusOutlined style={{ color: "#52c41a", fontSize: "18px" }} />
            </div>
            <div>
              <Title
                level={3}
                style={{
                  margin: 0,
                  color: "#262626",
                  fontWeight: 600,
                }}
              >
                Thêm loại xe mới
              </Title>
              <Text type="secondary" style={{ fontSize: "14px" }}>
                Tạo loại xe mới trong hệ thống
              </Text>
            </div>
          </div>
        }
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width="60%"
        style={{ maxWidth: "700px" }}
        styles={{
          body: {
            maxHeight: "70vh",
            overflowY: "auto",
            overflowX: "hidden",
            padding: "16px",
          },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{}}
        >
          <Row gutter={[20, 20]}>
            {/* Icon loại xe */}
            <Col span={24}>
              <Card
                title={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#262626",
                    }}
                  >
                    <div
                      style={{
                        width: 3,
                        height: 16,
                        backgroundColor: "#fa8c16",
                        borderRadius: 2,
                      }}
                    />
                    Biểu tượng loại xe
                  </div>
                }
                size="small"
                style={{
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #f0f0f0",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 12,
                      border: "2px dashed #d9d9d9",
                      backgroundColor: "#fafafa",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s ease",
                      margin: "0 auto",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#52c41a";
                      e.currentTarget.style.backgroundColor = "#f6ffed";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#d9d9d9";
                      e.currentTarget.style.backgroundColor = "#fafafa";
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: "#f6ffed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 8,
                        border: "2px solid #b7eb8f",
                      }}
                    >
                      <CarOutlined
                        style={{
                          fontSize: "20px",
                          color: "#52c41a",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#52c41a",
                        fontWeight: 500,
                        textAlign: "center",
                      }}
                    >
                      Loại xe
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#8c8c8c",
                        marginTop: 2,
                        textAlign: "center",
                      }}
                    >
                      SEDAN, SUV, HATCHBACK...
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Thông tin cơ bản */}
            <Col span={24}>
              <Card
                title={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#262626",
                    }}
                  >
                    <div
                      style={{
                        width: 3,
                        height: 16,
                        backgroundColor: "#52c41a",
                        borderRadius: 2,
                      }}
                    />
                    Thông tin cơ bản
                  </div>
                }
                size="small"
                style={{
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #f0f0f0",
                }}
              >
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span style={{ fontWeight: 500, color: "#595959" }}>
                          Tên loại xe
                        </span>
                      }
                      name="typeName"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập tên loại xe!",
                        },
                        {
                          min: 2,
                          message: "Tên loại xe phải có ít nhất 2 ký tự!",
                        },
                        {
                          max: 100,
                          message: "Tên loại xe không được quá 100 ký tự!",
                        },
                        {
                          pattern: /^[a-zA-Z0-9\s\-&.,()]+$/,
                          message:
                            "Tên loại xe chỉ được chứa chữ cái, số, khoảng trắng và ký tự đặc biệt: -&.,()",
                        },
                      ]}
                    >
                      <MemoizedInput
                        placeholder="Nhập tên loại xe"
                        showCount
                        maxLength={100}
                        style={{
                          borderRadius: 6,
                          border: "1px solid #d9d9d9",
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label={
                        <span style={{ fontWeight: 500, color: "#595959" }}>
                          Mã loại xe
                        </span>
                      }
                      name="typeCode"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập mã loại xe!",
                        },
                        {
                          pattern: /^[A-Z0-9_]+$/,
                          message:
                            "Mã loại xe chỉ được chứa chữ hoa, số và dấu gạch dưới!",
                        },
                        {
                          min: 2,
                          message: "Mã loại xe phải có ít nhất 2 ký tự!",
                        },
                        {
                          max: 20,
                          message: "Mã loại xe không được quá 20 ký tự!",
                        },
                      ]}
                    >
                      <MemoizedInput
                        placeholder="VD: SEDAN, SUV, HATCHBACK"
                        style={{
                          textTransform: "uppercase",
                          borderRadius: 6,
                          border: "1px solid #d9d9d9",
                        }}
                        onChange={(e) => {
                          const upperValue = e.target.value.toUpperCase();
                          e.target.value = upperValue;
                          // Use setTimeout to avoid circular reference
                          setTimeout(() => {
                            form.setFieldValue("typeCode", upperValue);
                          }, 0);
                        }}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item
                      label={
                        <span style={{ fontWeight: 500, color: "#595959" }}>
                          Mô tả
                        </span>
                      }
                      name="description"
                      rules={[
                        { required: true, message: "Vui lòng nhập mô tả!" },
                        { min: 10, message: "Mô tả phải có ít nhất 10 ký tự!" },
                        {
                          max: 500,
                          message: "Mô tả không được quá 500 ký tự!",
                        },
                      ]}
                    >
                      <MemoizedTextArea
                        rows={4}
                        placeholder="Nhập mô tả về loại xe, đặc điểm, phân loại..."
                        showCount
                        maxLength={500}
                        style={{
                          resize: "vertical",
                          borderRadius: 6,
                          border: "1px solid #d9d9d9",
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <div
            style={{
              marginTop: 32,
              paddingTop: 20,
              borderTop: "2px solid #f0f0f0",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <Button
              onClick={handleCancel}
              disabled={createVehicleTypeMutation.isPending}
              size="large"
              style={{
                minWidth: 100,
                height: 44,
                borderRadius: 8,
                fontWeight: 500,
                border: "1px solid #d9d9d9",
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createVehicleTypeMutation.isPending}
              size="large"
              icon={<PlusOutlined />}
              style={{
                minWidth: 160,
                height: 44,
                borderRadius: 8,
                fontWeight: 500,
                background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                border: "none",
                boxShadow: "0 4px 12px rgba(82, 196, 26, 0.3)",
              }}
            >
              {createVehicleTypeMutation.isPending
                ? "Đang thêm..."
                : "Thêm loại xe"}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default VehicleTypeAddModal;
