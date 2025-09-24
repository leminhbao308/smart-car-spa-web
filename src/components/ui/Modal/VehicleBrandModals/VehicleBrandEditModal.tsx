"use client";
import React, { useState, useEffect } from "react";
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
  EditOutlined,
  UploadOutlined,
  GlobalOutlined,
  CalendarOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { countries, brandStatuses } from "@/components/utils/data/vehicle-brands.data";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface VehicleBrandEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (brand: any) => void;
  brandData: any;
}

const VehicleBrandEditModal: React.FC<VehicleBrandEditModalProps> = ({
  visible,
  onClose,
  onSuccess,
  brandData,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [popularModels, setPopularModels] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newModel, setNewModel] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("");

  useEffect(() => {
    if (brandData && visible) {
      form.setFieldsValue({
        brandName: brandData.brandName,
        brandCode: brandData.brandCode,
        country: brandData.country,
        foundedYear: brandData.foundedYear,
        website: brandData.website,
        status: brandData.status,
        description: brandData.description,
        priceRange: brandData.priceRange,
      });
      setLogoUrl(brandData.logo || "");
      setPopularModels(brandData.popularModels || []);
      setSpecialties(brandData.specialties || []);
    }
  }, [brandData, visible, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const updatedBrand = {
        ...brandData,
        ...values,
        logo: logoUrl || brandData.logo,
        popularModels,
        specialties,
        updatedAt: new Date().toISOString(),
      };

      onSuccess(updatedBrand);
      message.success("Cập nhật hãng xe thành công!");
      onClose();
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật hãng xe!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setLogoUrl(brandData?.logo || "");
    setPopularModels(brandData?.popularModels || []);
    setSpecialties(brandData?.specialties || []);
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

  const addModel = () => {
    if (newModel.trim() && !popularModels.includes(newModel.trim())) {
      setPopularModels([...popularModels, newModel.trim()]);
      setNewModel("");
    }
  };

  const removeModel = (model: string) => {
    setPopularModels(popularModels.filter((m) => m !== model));
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter((s) => s !== specialty));
  };

  if (!brandData) return null;

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <EditOutlined style={{ color: "#1890ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Chỉnh sửa hãng xe: {brandData.brandName}
          </Title>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      styles={{
        body: { maxHeight: "70vh", overflowY: "auto" },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
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
                { pattern: /^[A-Z0-9_]+$/, message: "Mã hãng xe chỉ được chứa chữ hoa, số và dấu gạch dưới!" },
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
                { type: "number", min: 1800, max: new Date().getFullYear(), message: "Năm thành lập không hợp lệ!" },
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
              rules={[
                { type: "url", message: "URL website không hợp lệ!" },
              ]}
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
              rules={[{ required: true, message: "Vui lòng nhập phân khúc giá!" }]}
            >
              <Input placeholder="VD: Từ 500 triệu - 2 tỷ VNĐ" />
            </Form.Item>
          </Col>

          {/* Model phổ biến */}
          <Col span={24}>
            <Form.Item label="Model phổ biến">
              <div style={{ marginBottom: 8 }}>
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    placeholder="Nhập tên model"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    onPressEnter={addModel}
                  />
                  <Button type="primary" onClick={addModel}>
                    Thêm
                  </Button>
                </Space.Compact>
              </div>
              <div>
                {popularModels.map((model) => (
                  <Tag
                    key={model}
                    closable
                    onClose={() => removeModel(model)}
                    style={{ marginBottom: 4 }}
                  >
                    {model}
                  </Tag>
                ))}
              </div>
            </Form.Item>
          </Col>

          {/* Đặc điểm nổi bật */}
          <Col span={24}>
            <Form.Item label="Đặc điểm nổi bật">
              <div style={{ marginBottom: 8 }}>
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    placeholder="Nhập đặc điểm"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    onPressEnter={addSpecialty}
                  />
                  <Button type="primary" onClick={addSpecialty}>
                    Thêm
                  </Button>
                </Space.Compact>
              </div>
              <div>
                {specialties.map((specialty) => (
                  <Tag
                    key={specialty}
                    closable
                    onClose={() => removeSpecialty(specialty)}
                    color="green"
                    style={{ marginBottom: 4 }}
                  >
                    {specialty}
                  </Tag>
                ))}
              </div>
            </Form.Item>
          </Col>
        </Row>

        <div style={{ textAlign: "right", marginTop: 24 }}>
          <Space>
            <Button onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Cập nhật
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default VehicleBrandEditModal;
