"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Button,
  Row,
  Col,
  Upload,
  message,
  Typography,
  Card,
} from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import Image from "next/image";
import { VehicleBrand, UpdateVehicleBrandRequest } from "@/lib/api/types";
import { useUpdateVehicleBrand } from "@/lib/api/hooks/useVehicleBrands";
import { MemoizedInput, MemoizedTextArea } from "../../MemoizedComponents";

const { Title, Text } = Typography;

interface VehicleBrandEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  brandData: VehicleBrand | null;
}

const VehicleBrandEditModal: React.FC<VehicleBrandEditModalProps> = ({
  visible,
  onClose,
  onSuccess,
  brandData,
}) => {
  const [form] = Form.useForm();
  const [logoUrl, setLogoUrl] = useState<string>("");
  const updateVehicleBrandMutation = useUpdateVehicleBrand();

  useEffect(() => {
    if (visible && brandData) {
      form.setFieldsValue({
        brandName: brandData.brand_name,
        brandCode: brandData.brand_code,
        description: brandData.description,
      });
      setLogoUrl(brandData.brand_logo_url || "");
    }
  }, [visible, brandData, form]);

  const handleSubmit = async (values: {
    brandName: string;
    brandCode: string;
    description: string;
  }) => {
    if (!brandData) return;

    const updateData: UpdateVehicleBrandRequest = {
      brand_name: values.brandName,
      brand_code: values.brandCode,
      description: values.description,
      ...(logoUrl && logoUrl.trim() !== "" && { brand_logo_url: logoUrl }),
    };

    console.log("Submitting update data:", updateData);

    try {
      await updateVehicleBrandMutation.mutateAsync({
        brandId: brandData.brand_id,
        data: updateData,
      });

      form.resetFields();
      setLogoUrl("");
      onSuccess();
      onClose();
    } catch (error) {
      console.log("Error updating vehicle brand:", error);
      // Error handling is done in the hook
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setLogoUrl("");
    onClose();
  };

  // Tạo preview URL cho file được chọn
  const handleFileChange = (info: {
    file: { originFileObj?: File; status?: string };
  }) => {
    const { file } = info;

    if (file.originFileObj) {
      // Tạo URL preview cho file local
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file.originFileObj);
    }
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
        .ant-upload {
          width: 100%;
        }
        .ant-upload-list {
          overflow-x: hidden;
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
                backgroundColor: "#e6f7ff",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #91d5ff",
              }}
            >
              <EditOutlined style={{ color: "#1890ff", fontSize: "18px" }} />
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
                Chỉnh sửa hãng xe
              </Title>
              <Text type="secondary" style={{ fontSize: "14px" }}>
                Cập nhật thông tin hãng xe
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
            {/* Logo */}
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
                    Logo hãng xe
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
                      position: "relative",
                      display: "inline-block",
                      marginBottom: 16,
                    }}
                  >
                    {logoUrl ? (
                      <div style={{ position: "relative" }}>
                        <div
                          style={{
                            width: 120,
                            height: 120,
                            borderRadius: 12,
                            overflow: "hidden",
                            border: "3px solid #e6f7ff",
                            boxShadow: "0 4px 16px rgba(24, 144, 255, 0.15)",
                            position: "relative",
                            backgroundColor: "#fafafa",
                          }}
                        >
                          <Image
                            src={logoUrl}
                            alt="logo"
                            width={120}
                            height={120}
                            style={{
                              objectFit: "cover",
                              width: "100%",
                              height: "100%",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background:
                                "linear-gradient(135deg, rgba(24, 144, 255, 0.1) 0%, rgba(24, 144, 255, 0.05) 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: 0,
                              transition: "opacity 0.3s ease",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = "1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = "0";
                            }}
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = "image/*";
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement)
                                  .files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    setLogoUrl(e.target?.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }}
                          >
                            <div
                              style={{
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                borderRadius: 6,
                                padding: "8px 12px",
                                fontSize: "12px",
                                fontWeight: 500,
                                color: "#1890ff",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                              }}
                            >
                              Thay đổi
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            width: 28,
                            height: 28,
                            backgroundColor: "#ff4d4f",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(255, 77, 79, 0.3)",
                            border: "2px solid #fff",
                            transition: "all 0.2s ease",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLogoUrl("");
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.1)";
                            e.currentTarget.style.backgroundColor = "#ff7875";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.backgroundColor = "#ff4d4f";
                          }}
                        >
                          <span
                            style={{
                              color: "#fff",
                              fontSize: "14px",
                              fontWeight: "bold",
                              lineHeight: 1,
                            }}
                          >
                            ×
                          </span>
                        </div>
                      </div>
                    ) : (
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
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#1890ff";
                          e.currentTarget.style.backgroundColor = "#f0f8ff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#d9d9d9";
                          e.currentTarget.style.backgroundColor = "#fafafa";
                        }}
                      >
                        <Upload
                          name="logo"
                          listType="picture-card"
                          showUploadList={false}
                          onChange={handleFileChange}
                          beforeUpload={(file) => {
                            const isImage = file.type.startsWith("image/");
                            if (!isImage) {
                              message.error("Chỉ được tải lên file hình ảnh!");
                              return false;
                            }
                            const isLt2M = file.size / 1024 / 1024 < 2;
                            if (!isLt2M) {
                              message.error(
                                "Kích thước file không được vượt quá 2MB!"
                              );
                              return false;
                            }
                            return false;
                          }}
                          accept="image/*"
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "none",
                            background: "transparent",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              height: "100%",
                            }}
                          >
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                backgroundColor: "#e6f7ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 8,
                                border: "2px solid #91d5ff",
                              }}
                            >
                              <PlusOutlined
                                style={{
                                  fontSize: "20px",
                                  color: "#1890ff",
                                }}
                              />
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                color: "#1890ff",
                                fontWeight: 500,
                                textAlign: "center",
                              }}
                            >
                              Tải logo
                            </div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#8c8c8c",
                                marginTop: 2,
                                textAlign: "center",
                              }}
                            >
                              120x120px
                            </div>
                          </div>
                        </Upload>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#8c8c8c",
                      lineHeight: 1.4,
                      maxWidth: 200,
                      margin: "0 auto",
                    }}
                  >
                    Hỗ trợ định dạng: JPG, PNG, GIF
                    <br />
                    Kích thước tối đa: 2MB
                    <br />
                    Khuyến nghị: 120x120px
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
                        backgroundColor: "#1890ff",
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
                          Tên hãng xe
                        </span>
                      }
                      name="brandName"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập tên hãng xe!",
                        },
                        {
                          min: 2,
                          message: "Tên hãng xe phải có ít nhất 2 ký tự!",
                        },
                        {
                          max: 100,
                          message: "Tên hãng xe không được quá 100 ký tự!",
                        },
                        {
                          pattern: /^[a-zA-Z0-9\s\-&.,()]+$/,
                          message:
                            "Tên hãng xe chỉ được chứa chữ cái, số, khoảng trắng và ký tự đặc biệt: -&.,()",
                        },
                      ]}
                    >
                      <MemoizedInput
                        placeholder="Nhập tên hãng xe"
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
                          Mã hãng xe
                        </span>
                      }
                      name="brandCode"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập mã hãng xe!",
                        },
                        {
                          pattern: /^[A-Z0-9_]+$/,
                          message:
                            "Mã hãng xe chỉ được chứa chữ hoa, số và dấu gạch dưới!",
                        },
                        {
                          min: 2,
                          message: "Mã hãng xe phải có ít nhất 2 ký tự!",
                        },
                        {
                          max: 20,
                          message: "Mã hãng xe không được quá 20 ký tự!",
                        },
                      ]}
                    >
                       <MemoizedInput
                         placeholder="VD: TOYOTA, HONDA, BMW"
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
                             form.setFieldValue('brandCode', upperValue);
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
                        placeholder="Nhập mô tả về hãng xe, lịch sử, đặc điểm nổi bật..."
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
              disabled={updateVehicleBrandMutation.isPending}
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
              loading={updateVehicleBrandMutation.isPending}
              size="large"
              icon={<EditOutlined />}
              style={{
                minWidth: 160,
                height: 44,
                borderRadius: 8,
                fontWeight: 500,
                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                border: "none",
                boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
              }}
            >
              {updateVehicleBrandMutation.isPending
                ? "Đang cập nhật..."
                : "Cập nhật hãng xe"}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default VehicleBrandEditModal;
