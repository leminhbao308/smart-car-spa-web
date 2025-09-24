"use client";
import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Row,
  Col,
  Upload,
  message,
  Space,
  Typography,
  Tag,
} from "antd";
import {
  PlusOutlined, 
  GlobalOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  countries,
  brandStatuses,
} from "@/components/utils/data/vehicle-brands.data";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface VehicleBrandAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (brand: any) => void;
}

const VehicleBrandAddModal: React.FC<VehicleBrandAddModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>("");

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newBrand = {
        id: Date.now(),
        ...values,
        logo: logoUrl || "https://via.placeholder.com/100x100?text=LOGO",
        totalModels: 0,
        totalVehicles: 0,
        averageRating: 0,
        popularModels: [],
        specialties: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSuccess(newBrand);
      message.success("Thêm hãng xe thành công!");
      form.resetFields();
      setLogoUrl("");
      onClose();
    } catch (error) {
      message.error("Có lỗi xảy ra khi thêm hãng xe!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setLogoUrl("");
    onClose();
  };

  const handleLogoUpload = (info: any) => {
    if (info.file.status === "done") {
      setLogoUrl(info.file.response?.url || "");
      message.success("Tải logo thành công!");
    } else if (info.file.status === "error") {
      message.error("Tải logo thất bại!");
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
        body: { maxHeight: "70vh", overflowY: "auto" },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: "active",
          foundedYear: new Date().getFullYear(),
        }}
      >
        <Row gutter={[16, 16]}>
          {/* Logo */}
          <Col span={24}>
            <Form.Item label="Logo hãng xe">
              <Upload
                name="logo"
                listType="picture-card"
                showUploadList={false}
                onChange={handleLogoUpload}
                beforeUpload={() => false} // Disable actual upload for demo
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="logo" style={{ width: "100%" }} />
                ) : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải logo</div>
                  </div>
                )}
              </Upload>
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
              ]}
            >
              <Input placeholder="Nhập tên hãng xe" />
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
                    "Mã hãng xe chỉ được chứa chữ hoa, số và dấu gạch dưới!",
                },
              ]}
            >
              <Input placeholder="VD: TOYOTA, HONDA" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Quốc gia"
              name="country"
              rules={[{ required: true, message: "Vui lòng chọn quốc gia!" }]}
            >
              <Select
                placeholder="Chọn quốc gia"
                showSearch
                optionFilterProp="children"
                suffixIcon={<GlobalOutlined />}
              >
                {countries.map((country) => (
                  <Option key={country.value} value={country.label}>
                    <Space>
                      <span>{country.flag}</span>
                      <span>{country.label}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Năm thành lập"
              name="foundedYear"
              rules={[
                { required: true, message: "Vui lòng nhập năm thành lập!" },
                {
                  type: "number",
                  min: 1800,
                  max: new Date().getFullYear(),
                  message: "Năm thành lập không hợp lệ!",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="VD: 1937"
                suffix={<CalendarOutlined />}
                min={1800}
                max={new Date().getFullYear()}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Website"
              name="website"
              rules={[{ type: "url", message: "URL website không hợp lệ!" }]}
            >
              <Input placeholder="https://www.example.com" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select placeholder="Chọn trạng thái">
                {brandStatuses.map((status) => (
                  <Option key={status.value} value={status.value}>
                    <Tag color={status.color}>{status.label}</Tag>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Mô tả"
              name="description"
              rules={[
                { required: true, message: "Vui lòng nhập mô tả!" },
                { min: 10, message: "Mô tả phải có ít nhất 10 ký tự!" },
              ]}
            >
              <TextArea
                rows={3}
                placeholder="Nhập mô tả về hãng xe..."
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Phân khúc giá"
              name="priceRange"
              rules={[
                { required: true, message: "Vui lòng nhập phân khúc giá!" },
              ]}
            >
              <Input placeholder="VD: Từ 500 triệu - 2 tỷ VNĐ" />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ textAlign: "right", marginTop: 24 }}>
          <Space>
            <Button onClick={handleCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Thêm hãng xe
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default VehicleBrandAddModal;
