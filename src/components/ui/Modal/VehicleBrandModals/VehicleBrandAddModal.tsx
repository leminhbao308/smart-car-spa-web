"use client";
import React, { useState } from "react";
import {
  Modal,
  Form,
  Button,
  Row,
  Col,
  Upload,
  message,
  Space,
  Typography} from "antd";
import {
  PlusOutlined} from "@ant-design/icons";
import Image from "next/image";
import { CreateVehicleBrandRequest } from "@/lib/api/types";
import { VehicleService } from "@/lib/api/services/vehicle.service";

const { Title } = Typography;
const { TextArea } = Input;

interface VehicleBrandAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const VehicleBrandAddModal: React.FC<VehicleBrandAddModalProps> = ({
  visible,
  onClose,
  onSuccess}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>("");

  const handleSubmit = async (values: { brandName: string; brandCode: string; description: string }) => {
    setLoading(true);
    try {
      const brandData: CreateVehicleBrandRequest = {
        brand_name: values.brandName,
        brand_code: values.brandCode,
        description: values.description,
        ...(logoUrl && { brand_logo_url: logoUrl })};

      console.log("Submitting brand data:", brandData);
      const createdBrand = await VehicleService.createVehicleBrand(brandData);
      console.log("Created brand:", createdBrand);

      message.success("Thêm hãng xe thành công!");
      form.resetFields();
      setLogoUrl("");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating vehicle brand:", error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi thêm hãng xe!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setLogoUrl("");
    onClose();
  };

  // Tạo preview URL cho file được chọn
  const handleFileChange = (info: { file: { originFileObj?: File; status?: string } }) => {
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
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PlusOutlined style={{ color: "#1890ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Thêm hãng xe mới
          </Title>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
      styles={{
        body: { maxHeight: "70vh", overflowY: "auto" }}}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{}}
      >
        <Row gutter={[16, 16]}>
          {/* Logo */}
          <Col span={24}>
            <Form.Item 
              label="Logo hãng xe (tùy chọn)"
              help="Hỗ trợ định dạng: JPG, PNG, GIF. Kích thước tối đa: 2MB"
            >
              <Upload
                name="logo"
                listType="picture-card"
                showUploadList={false}
                onChange={handleFileChange}
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith('image/');
                  if (!isImage) {
                    message.error('Chỉ được tải lên file hình ảnh!');
                    return false;
                  }
                  const isLt2M = file.size / 1024 / 1024 < 2;
                  if (!isLt2M) {
                    message.error('Kích thước file không được vượt quá 2MB!');
                    return false;
                  }
                  return false; // Disable actual upload for demo
                }}
                accept="image/*"
              >
                {logoUrl ? (
                  <Image 
                    src={logoUrl} 
                    alt="logo" 
                    width={104}
                    height={104}
                    style={{ 
                      objectFit: "cover",
                      borderRadius: 6
                    }} 
                  />
                ) : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải logo</div>
                  </div>
                )}
              </Upload>
              {logoUrl && (
                <div style={{ marginTop: 8, textAlign: 'center' }}>
                  <Button 
                    size="small" 
                    danger 
                    onClick={() => setLogoUrl("")}
                  >
                    Xóa logo
                  </Button>
                </div>
              )}
            </Form.Item>
          </Col>

          {/* Thông tin cơ bản */}
          <Col span={12}>
            <Form.Item
              label="Tên hãng xe"
              name="brandName"
              rules={[
                { required: true, message: "Vui lòng nhập tên hãng xe!" },
                { min: 2, message: "Tên hãng xe phải có ít nhất 2 ký tự!" },
                { max: 100, message: "Tên hãng xe không được quá 100 ký tự!" },
                {
                  pattern: /^[a-zA-Z0-9\s\-&.,()]+$/,
                  message: "Tên hãng xe chỉ được chứa chữ cái, số, khoảng trắng và ký tự đặc biệt: -&.,()"},
              ]}
            >
              <MemoizedInput 
                placeholder="Nhập tên hãng xe" 
                showCount
                maxLength={100}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Mã hãng xe"
              name="brandCode"
              rules={[
                { required: true, message: "Vui lòng nhập mã hãng xe!" },
                {
                  pattern: /^[A-Z0-9_]+$/,
                  message:
                    "Mã hãng xe chỉ được chứa chữ hoa, số và dấu gạch dưới!"},
                { min: 2, message: "Mã hãng xe phải có ít nhất 2 ký tự!" },
                { max: 20, message: "Mã hãng xe không được quá 20 ký tự!" },
              ]}
            >
              <MemoizedInput 
                placeholder="VD: TOYOTA, HONDA, BMW" 
                style={{ textTransform: 'uppercase' }}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                }}
              />
            </Form.Item>
          </Col>


          <Col span={24}>
            <Form.Item
              label="Mô tả"
              name="description"
              rules={[
                { required: true, message: "Vui lòng nhập mô tả!" },
                { min: 10, message: "Mô tả phải có ít nhất 10 ký tự!" },
                { max: 500, message: "Mô tả không được quá 500 ký tự!" },
              ]}
            >
              <MemoizedTextArea
                rows={4}
                placeholder="Nhập mô tả về hãng xe, lịch sử, đặc điểm nổi bật..."
                showCount
                maxLength={500}
                style={{ resize: 'vertical' }}
              />
            </Form.Item>
          </Col>

        </Row>

        <div style={{ textAlign: "right", marginTop: 24, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
          <Space>
            <Button 
              onClick={handleCancel}
              disabled={loading}
              size="large"
            >
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              icon={<PlusOutlined />}
            >
              {loading ? "Đang thêm..." : "Thêm hãng xe"}
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default VehicleBrandAddModal;

