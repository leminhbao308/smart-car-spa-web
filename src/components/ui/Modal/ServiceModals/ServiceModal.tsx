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
  Alert,
  Space,
  Badge,
  Tabs,
  Avatar,
  Typography,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  InfoCircleOutlined,
  TagOutlined,
  PictureOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  MemoizedInput,
  MemoizedInputNumber,
  MemoizedTextArea,
} from "@/components/ui/MemoizedComponents";
import {
  CreateServiceRequest,
  UpdateServiceRequest,
  ServiceProductRequest,
  ProcessStepRequest,
} from "@/lib/api/types/service.types";
import {
  useServiceTypes,
  useServiceProcesses,
  useCreateService,
  useUpdateService,
  useCategories,
  useProducts,
} from "@/lib/api/hooks";
import { ServiceService } from "@/lib/api/services/service.service";
import { ServiceProcessService } from "@/lib/api/services/service-process.service";
import ServiceImageGallery from "@/components/ui/Service/ServiceImageGallery";

const { Title, Text } = Typography;

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
    estimated_duration?: number; // ✅ Thêm estimated_duration cho service
    required_skill_level?: string;
    service_type_id?: string;
    is_featured?: boolean;
    is_active?: boolean;
    service_process_id?: string;
    service_products?: Array<{
      id: string;
      product_id: string;
      quantity: number;
      unit: string;
      notes?: string;
      is_required: boolean;
      sort_order: number;
    }>;
    service_process?: {
      code: string;
      name: string;
      description?: string;
      process_steps?: Array<{
        id: string;
        step_order: number;
        name: string;
        description?: string;
        is_required: boolean;
      }>;
    };
    image_urls?: string[];
  };
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<
    ServiceProductRequest[]
  >([]);
  const [processSteps, setProcessSteps] = useState<ProcessStepRequest[]>([]);
  const [deletedProductIds, setDeletedProductIds] = useState<string[]>([]);
  const [deletedStepIds, setDeletedStepIds] = useState<string[]>([]);
  const [deleteProductModalVisible, setDeleteProductModalVisible] =
    useState(false);
  const [deleteStepModalVisible, setDeleteStepModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    index: number;
    product: ServiceProductRequest;
  } | null>(null);
  const [stepToDelete, setStepToDelete] = useState<{
    index: number;
    step: ProcessStepRequest;
  } | null>(null);
  const { message } = App.useApp();

  // API hooks
  const { data: serviceTypesData, isLoading: serviceTypesLoading } =
    useServiceTypes({});
  const { data: serviceProcessesData } = useServiceProcesses({});
  const { data: categoriesData } = useCategories(0, 1000);
  const { products: productsData } = useProducts({
    page: 0,
    size: 1000,
  });
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

        // Set products and process steps for edit mode
        if (editData.service_products) {
          setSelectedProducts(
            editData.service_products.map((sp) => ({
              product_id: sp.product_id,
              quantity: sp.quantity,
              unit: "", // Không cần đơn vị
              notes: sp.notes,
              is_required: sp.is_required,
              sort_order: sp.sort_order,
              id: sp.id, // Keep the ID for deletion tracking
            }))
          );
        }

        if (editData.service_process?.process_steps) {
          setProcessSteps(
            editData.service_process.process_steps.map((step) => ({
              step_order: step.step_order,
              name: step.name,
              description: step.description,
              is_required: step.is_required,
              is_active: true, // Default to true for existing steps
              id: step.id, // Keep the ID for deletion tracking
            }))
          );
        }
      } else {
        // Create mode - reset form
        form.resetFields();
        setSelectedProducts([]);
        setProcessSteps([]);
        setDeletedProductIds([]);
        setDeletedStepIds([]);
        setDeleteProductModalVisible(false);
        setDeleteStepModalVisible(false);
        setProductToDelete(null);
        setStepToDelete(null);
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
        // Update existing service with products and process
        const updateData: UpdateServiceRequest = {
          service_name: values.serviceName,
          service_url: values.serviceUrl,
          category_id: values.categoryId,
          description: values.description,
          estimated_duration: values.estimatedDuration, // ✅ Thêm estimated_duration cho service
          required_skill_level: values.requiredSkillLevel,
          service_type_id: values.serviceTypeId,
          is_featured: values.isFeatured || false,
          is_active: values.isActive !== undefined ? values.isActive : true,
          service_products:
            selectedProducts.length > 0 ? selectedProducts : undefined,
          service_process:
            processSteps.length > 0
              ? {
                  // Không gửi code khi update - giữ nguyên code hiện tại
                  ...(editData
                    ? {}
                    : { code: values.processCode || `PROC-${Date.now()}` }),
                  name:
                    values.processName ||
                    editData.service_process?.name ||
                    `${values.serviceName} - Quy trình`,
                  description:
                    values.processDescription ||
                    editData.service_process?.description,
                  is_default: false,
                  process_steps: processSteps,
                }
              : undefined,
        };

        await updateServiceMutation.mutateAsync({
          serviceId: editData.service_id,
          data: updateData,
        });

        // Delete removed products
        for (const productId of deletedProductIds) {
          try {
            await ServiceService.deleteServiceProduct(productId);
          } catch (error) {
            console.error("Error deleting service product:", error);
          }
        }

        // Delete removed process steps
        for (const stepId of deletedStepIds) {
          try {
            await ServiceProcessService.deleteServiceProcessStep(stepId);
          } catch (error) {
            console.error("Error deleting process step:", error);
          }
        }

        message.success("Cập nhật dịch vụ thành công!");
      } else {
        // Create new service with products and process
        const createData: CreateServiceRequest = {
          service_name: values.serviceName,
          service_url: values.serviceUrl,
          category_id: values.categoryId,
          description: values.description,
          estimated_duration: values.estimatedDuration, // ✅ Thêm estimated_duration cho service
          required_skill_level: values.requiredSkillLevel,
          service_type_id: values.serviceTypeId,
          is_featured: values.isFeatured || false,
          service_products:
            selectedProducts.length > 0 ? selectedProducts : undefined,
          service_process:
            processSteps.length > 0
              ? {
                  code: values.processCode || `PROC-${Date.now()}`,
                  name:
                    values.processName || `${values.serviceName} - Quy trình`,
                  description: values.processDescription,
                  is_default: true,
                  process_steps: processSteps,
                }
              : undefined,
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
    setSelectedProducts([]);
    setProcessSteps([]);
    setDeletedProductIds([]);
    setDeletedStepIds([]);
    setDeleteProductModalVisible(false);
    setDeleteStepModalVisible(false);
    setProductToDelete(null);
    setStepToDelete(null);
    onCancel();
  };

  // Helper functions for products and process steps
  const addProduct = () => {
    setSelectedProducts([
      ...selectedProducts,
      {
        product_id: "",
        quantity: 1,
        unit: "", // Không cần đơn vị
        notes: "",
        is_required: true,
        sort_order: selectedProducts.length + 1,
      },
    ]);
  };

  const removeProduct = (index: number) => {
    const product = selectedProducts[index];
    setProductToDelete({ index, product });
    setDeleteProductModalVisible(true);
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      const { index, product } = productToDelete;
      // If it's an existing product (has ID), add to deleted list
      if (product.id) {
        setDeletedProductIds([...deletedProductIds, product.id]);
      }
      setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
      setDeleteProductModalVisible(false);
      setProductToDelete(null);
      message.success("Đã xóa sản phẩm khỏi danh sách");
    }
  };

  const updateProduct = (
    index: number,
    field: keyof ServiceProductRequest,
    value: string | number | boolean
  ) => {
    const updated = [...selectedProducts];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedProducts(updated);
  };

  const addProcessStep = () => {
    setProcessSteps([
      ...processSteps,
      {
        step_order: processSteps.length + 1,
        name: "",
        description: "",
        is_required: true,
        is_active: true,
      },
    ]);
  };

  const removeProcessStep = (index: number) => {
    const step = processSteps[index];
    setStepToDelete({ index, step });
    setDeleteStepModalVisible(true);
  };

  const confirmDeleteStep = () => {
    if (stepToDelete) {
      const { index, step } = stepToDelete;
      // If it's an existing step (has ID), add to deleted list
      if (step.id) {
        setDeletedStepIds([...deletedStepIds, step.id]);
      }
      setProcessSteps(processSteps.filter((_, i) => i !== index));
      setDeleteStepModalVisible(false);
      setStepToDelete(null);
      message.success("Đã xóa bước khỏi quy trình");
    }
  };

  const updateProcessStep = (
    index: number,
    field: keyof ProcessStepRequest,
    value: string | number | boolean
  ) => {
    const updated = [...processSteps];
    updated[index] = { ...updated[index], [field]: value };
    setProcessSteps(updated);
  };

  // Tab 1: Thông tin cơ bản
  const generalInfoTab = (
    <>
      {/* Trạng thái và tính năng */}
      <Card
        size="small"
        style={{
          marginBottom: 16,
          border: "1px solid #f0f0f0",
          borderRadius: 8,
        }}
      >
        <Row gutter={16}>
          <Col
            xs={24}
            sm={12}
          >
            <Form.Item
              label="Trạng thái hoạt động"
              name="isActive"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            sm={12}
          >
            <Form.Item
              label="Dịch vụ nổi bật"
              name="isFeatured"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Thông tin cơ bản */}
      <Card
        title={
          <Space>
            <InfoCircleOutlined style={{ color: "#1890ff" }} />
            <span>Thông tin cơ bản</span>
          </Space>
        }
        size="small"
        style={{
          marginBottom: 16,
          border: "1px solid #f0f0f0",
          borderRadius: 8,
        }}
      >
        <Row gutter={16}>
          <Col
            xs={24}
            sm={12}
          >
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
          <Col
            xs={24}
            sm={12}
          >
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
          <Col
            xs={24}
            sm={12}
          >
            <Form.Item
              label="Danh mục"
              name="categoryId"
              rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
              initialValue={editData?.category_id}
            >
              <Select
                placeholder="Chọn danh mục"
                allowClear
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  String(option?.label || "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {categoriesData?.data?.content?.map((category: any) => (
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
          <Col
            xs={24}
            sm={12}
          >
            <Form.Item
              label="Loại dịch vụ"
              name="serviceTypeId"
              rules={[
                { required: true, message: "Vui lòng chọn loại dịch vụ!" },
              ]}
              initialValue={editData?.service_type_id}
            >
              <Select
                placeholder="Chọn loại dịch vụ"
                loading={serviceTypesLoading}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  String(option?.label || "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {serviceTypesData?.data?.content?.map((serviceType: any) => (
                  <Option
                    key={serviceType.service_type_id}
                    value={serviceType.service_type_id}
                    label={serviceType.name}
                  >
                    {serviceType.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col
            xs={24}
            sm={12}
          >
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
              initialValue={editData?.estimated_duration}
            >
              <MemoizedInputNumber
                min={1}
                style={{ width: "100%" }}
                placeholder="Nhập thời gian"
              />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            sm={12}
          >
            <Form.Item
              label="Cấp độ kỹ năng"
              name="requiredSkillLevel"
              rules={[
                { required: true, message: "Vui lòng chọn cấp độ kỹ năng!" },
              ]}
              initialValue={editData?.required_skill_level}
            >
              <Select placeholder="Chọn cấp độ kỹ năng">
                <Option value="BASIC">Cơ bản</Option>
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
          initialValue={editData?.description}
        >
          <MemoizedTextArea
            rows={3}
            placeholder="Nhập mô tả dịch vụ"
            maxLength={2000}
            showCount
          />
        </Form.Item>
      </Card>
    </>
  );

  // Tab 2: Sản phẩm dịch vụ
  const productsTab = (
    <Card
      title="Sản phẩm dịch vụ"
      size="small"
      extra={
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addProduct}
          size="small"
        >
          Thêm sản phẩm
        </Button>
      }
    >
      {selectedProducts.length > 0 ? (
        <div>
          {selectedProducts.map((product, index) => (
            <Card
              key={index}
              size="small"
              style={{ marginBottom: 12 }}
              title={`Sản phẩm ${index + 1}`}
              extra={
                <Button
                  type="text"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => removeProduct(index)}
                  size="small"
                />
              }
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 12, color: "#666" }}>
                      Sản phẩm
                    </label>
                    <Select
                      placeholder="Chọn sản phẩm"
                      value={product.product_id}
                      onChange={(value) =>
                        updateProduct(index, "product_id", value)
                      }
                      showSearch
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        String(option?.label || "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      style={{ width: "100%" }}
                    >
                      {productsData?.map((prod: any) => (
                        <Option
                          key={prod.product_id}
                          value={prod.product_id}
                          label={prod.product_name}
                        >
                          {prod.product_name}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col
                  xs={24}
                  sm={8}
                >
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 12, color: "#666" }}>
                      Số lượng
                    </label>
                    <MemoizedInputNumber
                      min={1}
                      value={product.quantity}
                      onChange={(value) =>
                        updateProduct(index, "quantity", value || 1)
                      }
                      style={{ width: "100%" }}
                    />
                  </div>
                </Col>
                <Col
                  xs={24}
                  sm={8}
                >
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 12, color: "#666" }}>
                      Bắt buộc
                    </label>
                    <Select
                      value={product.is_required}
                      onChange={(value) =>
                        updateProduct(index, "is_required", value)
                      }
                      style={{ width: "100%" }}
                    >
                      <Option value={true}>Bắt buộc</Option>
                      <Option value={false}>Tùy chọn</Option>
                    </Select>
                  </div>
                </Col>
                <Col
                  xs={24}
                  sm={8}
                >
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 12, color: "#666" }}>
                      Vị trí
                    </label>
                    <MemoizedInputNumber
                      min={1}
                      value={product.sort_order}
                      onChange={(value) =>
                        updateProduct(index, "sort_order", value || 1)
                      }
                      style={{ width: "100%" }}
                    />
                  </div>
                </Col>
              </Row>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 12, color: "#666" }}>Ghi chú</label>
                <MemoizedTextArea
                  rows={2}
                  placeholder="Ghi chú về sản phẩm"
                  value={product.notes}
                  onChange={(e) =>
                    updateProduct(index, "notes", e.target.value)
                  }
                />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Alert
          message="Chưa có sản phẩm nào"
          description="Nhấn 'Thêm sản phẩm' để thêm sản phẩm cho dịch vụ này"
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
        />
      )}
    </Card>
  );

  // Tab 3: Quy trình dịch vụ
  const processTab = (
    <Card
      title="Quy trình dịch vụ"
      size="small"
      extra={
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addProcessStep}
          size="small"
        >
          Thêm bước
        </Button>
      }
    >
      <Row
        gutter={[16, 16]}
        style={{ marginBottom: 16 }}
      >
        <Col span={12}>
          <Form.Item
            label="Mã quy trình"
            name="processCode"
            rules={[
              {
                required: processSteps.length > 0 && !editData,
                message: "Vui lòng nhập mã quy trình!",
              },
            ]}
            initialValue={editData?.service_process?.code}
          >
            <MemoizedInput
              placeholder="VD: BD-CAMRY-001"
              disabled={!!editData}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Tên quy trình"
            name="processName"
            rules={[
              {
                required: processSteps.length > 0,
                message: "Vui lòng nhập tên quy trình!",
              },
            ]}
            initialValue={editData?.service_process?.name}
          >
            <MemoizedInput placeholder="Tên quy trình" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Mô tả quy trình"
        name="processDescription"
        initialValue={editData?.service_process?.description}
      >
        <MemoizedTextArea
          rows={2}
          placeholder="Mô tả quy trình dịch vụ"
        />
      </Form.Item>

      {processSteps.length > 0 ? (
        <div>
          {processSteps.map((step, index) => (
            <Card
              key={index}
              size="small"
              style={{ marginBottom: 12 }}
              title={`Bước ${step.step_order}`}
              extra={
                <Button
                  type="text"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => removeProcessStep(index)}
                  size="small"
                />
              }
            >
              <Row gutter={[16, 16]}>
                <Col span={18}>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 12, color: "#666" }}>
                      Tên bước
                    </label>
                    <MemoizedInput
                      placeholder="Tên bước"
                      value={step.name}
                      onChange={(e) =>
                        updateProcessStep(index, "name", e.target.value)
                      }
                    />
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 12, color: "#666" }}>
                      Bắt buộc
                    </label>
                    <Select
                      value={step.is_required}
                      onChange={(value) =>
                        updateProcessStep(index, "is_required", value)
                      }
                      style={{ width: "100%" }}
                    >
                      <Option value={true}>Bắt buộc</Option>
                      <Option value={false}>Tùy chọn</Option>
                    </Select>
                  </div>
                </Col>
              </Row>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 12, color: "#666" }}>Mô tả</label>
                <MemoizedTextArea
                  rows={2}
                  placeholder="Mô tả chi tiết bước này"
                  value={step.description}
                  onChange={(e) =>
                    updateProcessStep(index, "description", e.target.value)
                  }
                />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Alert
          message="Chưa có bước nào"
          description="Nhấn 'Thêm bước' để tạo quy trình cho dịch vụ này"
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
        />
      )}
    </Card>
  );

  // Tab 4: Hình ảnh dịch vụ
  const imagesTab = editData?.service_id ? (
    <ServiceImageGallery serviceId={editData.service_id} />
  ) : (
    <Card>
      <Alert
        message="Lưu dịch vụ trước"
        description="Bạn cần tạo dịch vụ trước để có thể thêm hình ảnh"
        type="info"
        showIcon
      />
    </Card>
  );

  const tabItems = [
    {
      key: "general",
      label: (
        <Space>
          <InfoCircleOutlined />
          Thông tin chung
        </Space>
      ),
      children: generalInfoTab,
    },
    {
      key: "products",
      label: (
        <Space>
          <TagOutlined />
          Sản phẩm
          {selectedProducts.length > 0 && (
            <Badge count={selectedProducts.length} />
          )}
        </Space>
      ),
      children: productsTab,
    },
    {
      key: "process",
      label: (
        <Space>
          <InfoCircleOutlined />
          Quy trình
          {processSteps.length > 0 && <Badge count={processSteps.length} />}
        </Space>
      ),
      children: processTab,
    },
    {
      key: "images",
      label: (
        <Space>
          <PictureOutlined />
          Hình ảnh
        </Space>
      ),
      children: imagesTab,
    },
  ];

  return (
    <>
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar
              size={40}
              icon={editData ? <EditOutlined /> : <PlusOutlined />}
              style={{
                backgroundColor: editData ? "#1890ff" : "#52c41a",
                color: "white",
              }}
            />
            <div>
              <Title
                level={4}
                style={{ margin: 0, color: "#262626" }}
              >
                {editData ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
              </Title>
              <Text
                type="secondary"
                style={{ fontSize: 12 }}
              >
                {editData
                  ? "Cập nhật thông tin dịch vụ"
                  : "Nhập thông tin dịch vụ mới"}
              </Text>
            </div>
          </div>
        }
        open={visible}
        onCancel={handleCancel}
        width={1200}
        footer={[
          <Button
            key="cancel"
            onClick={handleCancel}
            size="large"
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={
              loading ||
              createServiceMutation.isPending ||
              updateServiceMutation.isPending
            }
            onClick={handleSubmit}
            icon={<SaveOutlined />}
            size="large"
            style={{
              background: editData ? "#1890ff" : "#52c41a",
              borderColor: editData ? "#1890ff" : "#52c41a",
            }}
          >
            {editData ? "Cập nhật dịch vụ" : "Thêm dịch vụ"}
          </Button>,
        ]}
        destroyOnHidden
        styles={{
          body: {
            padding: "24px",
            maxHeight: "80vh",
            overflowY: "auto",
          },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          scrollToFirstError
          initialValues={{
            isFeatured: false,
            isActive: true,
          }}
        >
          <Tabs
            defaultActiveKey="general"
            items={tabItems}
          />
        </Form>
      </Modal>

      {/* Delete Product Confirmation Modal */}
      <Modal
        title="Xác nhận xóa sản phẩm"
        open={deleteProductModalVisible}
        onOk={confirmDeleteProduct}
        onCancel={() => {
          setDeleteProductModalVisible(false);
          setProductToDelete(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>
          Bạn có chắc chắn muốn xóa sản phẩm{" "}
          <strong>
            {productToDelete?.product?.product_id
              ? productsData?.find(
                  (p) => p.product_id === productToDelete.product.product_id
                )?.product_name
              : "này"}
          </strong>{" "}
          khỏi danh sách?
        </p>
        {productToDelete?.product?.id && (
          <p style={{ color: "#ff4d4f", fontSize: 12 }}>
            ⚠️ Sản phẩm này đã tồn tại trong hệ thống và sẽ bị xóa vĩnh viễn.
          </p>
        )}
      </Modal>

      {/* Delete Step Confirmation Modal */}
      <Modal
        title="Xác nhận xóa bước quy trình"
        open={deleteStepModalVisible}
        onOk={confirmDeleteStep}
        onCancel={() => {
          setDeleteStepModalVisible(false);
          setStepToDelete(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>
          Bạn có chắc chắn muốn xóa bước{" "}
          <strong>
            {stepToDelete?.step?.name ||
              `Bước ${stepToDelete?.step?.step_order || ""}`}
          </strong>{" "}
          khỏi quy trình?
        </p>
        {stepToDelete?.step?.id && (
          <p style={{ color: "#ff4d4f", fontSize: 12 }}>
            ⚠️ Bước này đã tồn tại trong hệ thống và sẽ bị xóa vĩnh viễn.
          </p>
        )}
      </Modal>
    </>
  );
};

export default ServiceModal;
