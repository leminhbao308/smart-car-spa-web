"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Switch,
  Button,
  App,
  Row,
  Col,
  Card,
  Upload,
  Image,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { MemoizedInput, MemoizedInputNumber, MemoizedTextArea } from "@/components/ui/MemoizedComponents";
import { CreateServiceRequest, UpdateServiceRequest } from "@/lib/api/types/service.types";
import { useServiceTypes, useActiveServiceProcesses, useBranches, useCreateService, useUpdateService } from "@/lib/api/hooks";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Option } = Select;

interface ServiceModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editData?: {
    serviceId: string;
    serviceName: string;
    serviceUrl: string;
    categoryId?: string;
    description?: string;
    standardDuration?: number;
    requiredSkillLevel?: string;
    isPackage?: boolean;
    basePrice?: number;
    laborCost?: number;
    serviceTypeId?: string;
    isFeatured?: boolean;
    serviceProcessId?: string;
    isDefaultProcess?: boolean;
    branchId?: string;
    imageUrls?: string[];
  };
  title?: string;
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData,
  title = "Thêm dịch vụ mới",
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const { message } = App.useApp();

  // API hooks
  const { data: serviceTypesData, isLoading: serviceTypesLoading } = useServiceTypes({});
  const { data: serviceProcessesData, isLoading: serviceProcessesLoading } = useActiveServiceProcesses();
  const { branches, loading: branchesLoading } = useBranches();
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();

  // Initialize form when modal opens or editData changes
  useEffect(() => {
    if (visible) {
      if (editData) {
        // Edit mode - populate form with existing data
        form.setFieldsValue({
          serviceName: editData.serviceName,
          serviceUrl: editData.serviceUrl,
          categoryId: editData.categoryId,
          description: editData.description,
          standardDuration: editData.standardDuration,
          requiredSkillLevel: editData.requiredSkillLevel,
          isPackage: editData.isPackage,
          basePrice: editData.basePrice,
          laborCost: editData.laborCost,
          serviceTypeId: editData.serviceTypeId,
          isFeatured: editData.isFeatured,
          serviceProcessId: editData.serviceProcessId,
          isDefaultProcess: editData.isDefaultProcess,
          branchId: editData.branchId,
        });
        setImageUrls(editData.imageUrls || []);
      } else {
        // Create mode - reset form
        form.resetFields();
        setImageUrls([]);
      }
    }
  }, [visible, editData, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (editData) {
        // Update existing service
        const updateData: UpdateServiceRequest = {
          service_name: values.serviceName,
          service_url: values.serviceUrl,
          category_id: values.categoryId,
          description: values.description,
          standard_duration: values.standardDuration,
          required_skill_level: values.requiredSkillLevel,
          is_package: values.isPackage || false,
          base_price: values.basePrice,
          labor_cost: values.laborCost,
          service_type_id: values.serviceTypeId,
          is_featured: values.isFeatured || false,
          is_active: true,
          service_process_id: values.serviceProcessId,
          is_default_process: values.isDefaultProcess || false,
          branch_id: values.branchId,
        };

        await updateServiceMutation.mutateAsync({
          serviceId: editData.serviceId,
          data: updateData,
        });

        message.success("Cập nhật dịch vụ thành công!");
      } else {
        // Create new service
        const createData: CreateServiceRequest = {
          service_name: values.serviceName,
          service_url: values.serviceUrl,
          category_id: values.categoryId,
          description: values.description,
          standard_duration: values.standardDuration,
          required_skill_level: values.requiredSkillLevel,
          is_package: values.isPackage || false,
          base_price: values.basePrice,
          labor_cost: values.laborCost,
          service_type_id: values.serviceTypeId,
          is_featured: values.isFeatured || false,
          service_process_id: values.serviceProcessId,
          is_default_process: values.isDefaultProcess || false,
          branch_id: values.branchId,
        };

        await createServiceMutation.mutateAsync(createData);

        message.success("Tạo dịch vụ thành công!");
      }

      onSuccess();
    } catch (error) {
      console.error("Error submitting service:", error);
      message.error("Có lỗi xảy ra khi lưu dịch vụ!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImageUrls([]);
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading || createServiceMutation.isPending || updateServiceMutation.isPending}
      width={1000}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isPackage: false,
          isFeatured: false,
          isDefaultProcess: false,
          basePrice: 0,
          laborCost: 0,
        }}
      >
        {/* Thông tin cơ bản */}
        <Card title="Thông tin cơ bản" size="small">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tên dịch vụ"
                name="serviceName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên dịch vụ!" },
                  { min: 2, max: 500, message: "Tên dịch vụ phải từ 2-500 ký tự!" },
                ]}
              >
                <MemoizedInput placeholder="Nhập tên dịch vụ" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="URL dịch vụ"
                name="serviceUrl"
                rules={[
                  { required: true, message: "Vui lòng nhập URL dịch vụ!" },
                  { max: 1000, message: "URL không được quá 1000 ký tự!" },
                ]}
              >
                <MemoizedInput placeholder="Nhập URL dịch vụ" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Loại dịch vụ"
                name="serviceTypeId"
                rules={[{ required: true, message: "Vui lòng chọn loại dịch vụ!" }]}
              >
                <Select
                  placeholder="Chọn loại dịch vụ"
                  loading={serviceTypesLoading}
                  showSearch
                  optionFilterProp="children"
                   filterOption={(input, option) =>
                     String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                   }
                >
                  {serviceTypesData?.data?.content && serviceTypesData.data.content.length > 0 &&
                    serviceTypesData.data.content.map((serviceType) => (
                      <Option key={serviceType.serviceTypeId} value={serviceType.serviceTypeId}>
                        {serviceType.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item
                label="Thời gian chuẩn (phút)"
                name="standardDuration"
                rules={[
                  { required: true, message: "Vui lòng nhập thời gian chuẩn!" },
                  { type: "number", min: 1, message: "Thời gian phải lớn hơn 0!" },
                ]}
              >
                <MemoizedInputNumber
                  min={1}
                  style={{ width: "100%" }}
                  placeholder="Nhập thời gian"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item
                label="Cấp độ kỹ năng"
                name="requiredSkillLevel"
                rules={[{ required: true, message: "Vui lòng chọn cấp độ kỹ năng!" }]}
              >
                <Select placeholder="Chọn cấp độ">
                  <Option value="BEGINNER">Cơ bản</Option>
                  <Option value="INTERMEDIATE">Trung bình</Option>
                  <Option value="ADVANCED">Nâng cao</Option>
                  <Option value="EXPERT">Chuyên gia</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Chi nhánh"
                name="branchId"
              >
                <Select
                  placeholder="Chọn chi nhánh"
                  allowClear
                  loading={branchesLoading}
                  showSearch
                  optionFilterProp="children"
                   filterOption={(input, option) =>
                     String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                   }
                >
                  {branches && branches.length > 0 &&
                    branches.map((branch) => (
                      <Option key={branch.branch_id} value={branch.branch_id}>
                        {branch.branch_name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item
                label="Chi phí lao động (VNĐ)"
                name="laborCost"
                rules={[
                  { required: true, message: "Vui lòng nhập chi phí lao động!" },
                  { type: "number", min: 0, message: "Chi phí phải lớn hơn hoặc bằng 0!" },
                ]}
              >
                <MemoizedInputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  placeholder="Nhập chi phí lao động"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item
                label="Giá cơ bản (VNĐ)"
                name="basePrice"
                extra="Giá cơ bản được tính tự động từ quy trình dịch vụ"
              >
                <MemoizedInputNumber
                  min={0}
                  style={{ 
                    width: "100%",
                    backgroundColor: "#f5f5f5",
                    color: "#666",
                    cursor: "not-allowed"
                  }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  placeholder="Tự động tính từ quy trình"
                  readOnly
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ max: 2000, message: "Mô tả không được quá 2000 ký tự!" }]}
          >
            <MemoizedTextArea
              rows={3}
              placeholder="Nhập mô tả dịch vụ"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Gói dịch vụ"
                name="isPackage"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Dịch vụ nổi bật"
                name="isFeatured"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Sử dụng quy trình mặc định"
                name="isDefaultProcess"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Thông tin quy trình */}
        <Card title="Thông tin quy trình" size="small" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Quy trình dịch vụ"
                name="serviceProcessId"
                rules={[{ required: true, message: "Vui lòng chọn quy trình!" }]}
              >
                <Select
                  placeholder="Chọn quy trình dịch vụ"
                  allowClear
                  loading={serviceProcessesLoading}
                  showSearch
                  optionFilterProp="children"
                   filterOption={(input, option) =>
                     String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                   }
                >
                  {serviceProcessesData && serviceProcessesData.length > 0 &&
                    serviceProcessesData.map((process) => (
                      <Option key={process.id} value={process.id}>
                        {process.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <div style={{ marginTop: 16, padding: 16, backgroundColor: "#f5f5f5", borderRadius: 6 }}>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ fontSize: 12, color: "#666" }}>
                  Chi phí lao động:
                </div>
                <div style={{ fontWeight: 500, color: "#fa8c16" }}>
                  {formatCurrency(form.getFieldValue("laborCost") || 0)}
                </div>
              </Col>
              <Col span={8}>
                <div style={{ fontSize: 12, color: "#666" }}>
                  Giá cơ bản:
                </div>
                <div
                  style={{ fontWeight: 500, color: "#52c41a", fontSize: 16 }}
                >
                  {formatCurrency(form.getFieldValue("basePrice") || 0)}
                </div>
              </Col>
              <Col span={8}>
                <div style={{ fontSize: 12, color: "#666" }}>
                  Tổng dự kiến:
                </div>
                <div
                  style={{ fontWeight: 500, color: "#1890ff", fontSize: 16 }}
                >
                  {formatCurrency(
                    (form.getFieldValue("basePrice") || 0) + 
                    (form.getFieldValue("laborCost") || 0)
                  )}
                </div>
              </Col>
            </Row>
          </div>
        </Card>

        {/* Quản lý hình ảnh */}
        <Card
          title="Hình ảnh dịch vụ"
          size="small"
          style={{ marginTop: 16 }}
          extra={
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={() => false}
              onChange={(info) => {
                if (info.file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const newImageUrl = e.target?.result as string;
                    setImageUrls(prev => [...prev, newImageUrl]);
                  };
                   reader.readAsDataURL(info.file as unknown as File);
                }
              }}
            >
              <Button size="small" icon={<UploadOutlined />}>
                Thêm hình ảnh
              </Button>
            </Upload>
          }
        >
          {imageUrls.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {imageUrls.map((url, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <Image
                    src={url}
                    alt={`Service image ${index + 1}`}
                    style={{ width: 100, height: 100, objectFit: "cover" }}
                    preview={{
                      mask: <EyeOutlined />,
                    }}
                  />
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                    }}
                    onClick={() => {
                      setImageUrls(prev => prev.filter((_, i) => i !== index));
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#999", padding: "20px" }}>
              Chưa có hình ảnh nào
            </div>
          )}
        </Card>
      </Form>
    </Modal>
  );
};

export default ServiceModal;
