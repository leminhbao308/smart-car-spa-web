"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { UploadOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import {
  MemoizedInput,
  MemoizedInputNumber,
  MemoizedTextArea,
} from "@/components/ui/MemoizedComponents";
import {
  CreateServiceRequest,
  UpdateServiceRequest,
} from "@/lib/api/types/service.types";
import {
  useServiceTypes,
  useServiceProcesses,
  useCreateService,
  useUpdateService,
  useCategories,
} from "@/lib/api/hooks";

const { Option } = Select;

interface ServiceModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editData?: {
    service_id: string;
    service_name: string;
    service_url: string;
    category_id?: string;
    description?: string;
    estimated_duration?: number;
    required_skill_level?: string;
    service_type_id?: string;
    is_featured?: boolean;
    is_active?: boolean;
    service_process_id?: string;
    image_urls?: string[];
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
  const { data: serviceTypesData, isLoading: serviceTypesLoading } =
    useServiceTypes({});
  const { data: serviceProcessesData, isLoading: serviceProcessesLoading } =
    useServiceProcesses({});
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories(
    0,
    1000
  );
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();

  // Initialize form when modal opens or editData changes
  useEffect(() => {
    if (visible) {
      if (editData) {
        // Edit mode - populate form with existing data
        form.setFieldsValue({
          serviceName: editData.service_name,
          serviceUrl: editData.service_url,
          categoryId: editData.category_id,
          description: editData.description,
          estimatedDuration: editData.estimated_duration,
          requiredSkillLevel: editData.required_skill_level,
          serviceTypeId: editData.service_type_id,
          isFeatured: editData.is_featured,
          isActive: editData.is_active,
          serviceProcessId: editData.service_process_id,
        });
        setImageUrls(editData.image_urls || []);
      } else {
        // Create mode - reset form
        form.resetFields();
        setImageUrls([]);
      }
    }
  }, [visible, editData, form]);

  // Watch for form field changes
  const serviceProcessId = Form.useWatch("serviceProcessId", form);

  const formRef = useRef(form);
  formRef.current = form;

  const updateFormFields = useCallback(() => {
    if (serviceProcessId && serviceProcessesData) {
      const selectedProcess = serviceProcessesData.find(
        (p) => p.id === serviceProcessId
      );
      if (selectedProcess) {
        // Update estimated duration if not set
        const currentDuration =
          formRef.current.getFieldValue("estimatedDuration");
        if (!currentDuration && selectedProcess.estimated_duration) {
          formRef.current.setFieldValue(
            "estimatedDuration",
            selectedProcess.estimated_duration
          );
        }
      }
    }
  }, [serviceProcessId, serviceProcessesData]);

  useEffect(() => {
    updateFormFields();
  }, [updateFormFields]);

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
          estimated_duration: values.estimatedDuration,
          required_skill_level: values.requiredSkillLevel,
          service_type_id: values.serviceTypeId,
          is_featured: values.isFeatured || false,
          is_active: values.isActive !== undefined ? values.isActive : true,
          service_process_id: values.serviceProcessId,
        };

        await updateServiceMutation.mutateAsync({
          serviceId: editData.service_id,
          data: updateData,
        });

        // Không cần tính lại pricing nữa

        message.success("Cập nhật dịch vụ thành công!");
      } else {
        // Create new service
        const createData: CreateServiceRequest = {
          service_name: values.serviceName,
          service_url: values.serviceUrl,
          category_id: values.categoryId,
          description: values.description,
          estimated_duration: values.estimatedDuration,
          required_skill_level: values.requiredSkillLevel,
          service_type_id: values.serviceTypeId,
          is_featured: values.isFeatured || false,
          service_process_id: values.serviceProcessId,
        };

        await createServiceMutation.mutateAsync(createData);

        // Không cần tính lại pricing nữa

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
      confirmLoading={
        loading ||
        createServiceMutation.isPending ||
        updateServiceMutation.isPending
      }
      width="90%"
      style={{ maxWidth: 1000 }}
      destroyOnHidden
      styles={{ body: { overflowX: 'hidden' } }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isFeatured: false,
          isActive: true,
        }}
      >
        {/* Trạng thái và tính năng */}
        <Card
          title="Trạng thái và tính năng"
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Trạng thái"
                name="isActive"
                valuePropName="checked"
                extra="Bật/tắt trạng thái hoạt động của dịch vụ"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Dịch vụ nổi bật"
                name="isFeatured"
                valuePropName="checked"
                extra="Đánh dấu dịch vụ là nổi bật"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Card>
        {/* Thông tin cơ bản */}
        <Card title="Thông tin cơ bản" size="small">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tên dịch vụ"
                name="serviceName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên dịch vụ!" },
                  {
                    min: 2,
                    max: 500,
                    message: "Tên dịch vụ phải từ 2-500 ký tự!",
                  },
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
                label="Danh mục"
                name="categoryId"
                rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
              >
                <Select
                  placeholder="Chọn danh mục"
                  allowClear
                  loading={categoriesLoading}
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) => {
                    const label = String(option?.label ?? "");
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {categoriesData?.data?.content &&
                    categoriesData.data.content.length > 0 &&
                    categoriesData.data.content.map((category) => (
                      <Option
                        key={category.category_id}
                        value={category.category_id}
                        label={category.category_name}
                      >
                        {category.category_name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Loại dịch vụ"
                name="serviceTypeId"
                rules={[
                  { required: true, message: "Vui lòng chọn loại dịch vụ!" },
                ]}
              >
                <Select
                  placeholder="Chọn loại dịch vụ"
                  loading={serviceTypesLoading}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    String(option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {serviceTypesData?.data?.content &&
                    serviceTypesData.data.content.length > 0 &&
                    serviceTypesData.data.content.map((serviceType) => (
                      <Option
                        key={serviceType.service_type_id}
                        value={serviceType.service_type_id}
                      >
                        {serviceType.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Thời gian ước tính (phút)"
                name="estimatedDuration"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập thời gian ước tính!",
                  },
                  {
                    type: "number",
                    min: 1,
                    message: "Thời gian phải lớn hơn 0!",
                  },
                ]}
              >
                <MemoizedInputNumber
                  min={1}
                  style={{ width: "100%" }}
                  placeholder="Nhập thời gian"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Cấp độ kỹ năng"
                name="requiredSkillLevel"
                rules={[
                  { required: true, message: "Vui lòng chọn cấp độ kỹ năng!" },
                ]}
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

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ max: 2000, message: "Mô tả không được quá 2000 ký tự!" }]}
          >
            <MemoizedTextArea rows={3} placeholder="Nhập mô tả dịch vụ" />
          </Form.Item>
        </Card>

        {/* Thông tin quy trình */}
        <Card
          title="Thông tin quy trình"
          size="small"
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Quy trình dịch vụ"
                name="serviceProcessId"
                extra="Chọn quy trình dịch vụ để áp dụng cho dịch vụ này (tùy chọn)"
              >
                <Select
                  placeholder="Chọn quy trình dịch vụ"
                  allowClear
                  loading={serviceProcessesLoading}
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) => {
                    const label = String(option?.label ?? "");
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                  size="large"
                >
                  {serviceProcessesData &&
                    serviceProcessesData.length > 0 &&
                    serviceProcessesData.map((process) => (
                      <Option
                        key={process.id}
                        value={process.id}
                        label={process.name}
                      >
                        {process.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Thông tin quy trình được chọn"
                extra="Thông tin chi tiết về quy trình đã chọn"
              >
                <div
                  style={{
                    padding: 12,
                    backgroundColor: "#f8f9fa",
                    borderRadius: 6,
                    border: "1px solid #e9ecef",
                    minHeight: 40,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {(() => {
                    const selectedProcess = serviceProcessesData?.find(
                      (p) => p.id === serviceProcessId
                    );

                    if (selectedProcess) {
                      return (
                        <div style={{ width: "100%" }}>
                          <div
                            style={{
                              fontWeight: 500,
                              color: "#333",
                              marginBottom: 4,
                            }}
                          >
                            {selectedProcess.name}
                          </div>
                          <div style={{ fontSize: 12, color: "#666" }}>
                            {selectedProcess.description || "Không có mô tả"} •
                            {selectedProcess.estimated_duration} phút •
                            {selectedProcess.process_steps?.length || 0} bước
                            {selectedProcess.is_default && " • Mặc định"}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div style={{ color: "#999", fontSize: 14 }}>
                        Chưa chọn quy trình
                      </div>
                    );
                  })()}
                </div>
              </Form.Item>
            </Col>
          </Row>  
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
                    setImageUrls((prev) => [...prev, newImageUrl]);
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
                      setImageUrls((prev) =>
                        prev.filter((_, i) => i !== index)
                      );
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{ textAlign: "center", color: "#999", padding: "20px" }}
            >
              Chưa có hình ảnh nào
            </div>
          )}
        </Card>
      </Form>
    </Modal>
  );
};

export default ServiceModal;
