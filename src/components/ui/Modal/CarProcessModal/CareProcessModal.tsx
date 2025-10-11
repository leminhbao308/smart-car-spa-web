"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Form,
  Row,
  Col,
  Button,
  Space,
  Divider,
  Typography,
  Card,
  List,
  Tag,
  Switch,
  InputNumber,
  Table,
  Popconfirm,
  App,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UpOutlined,
  DownOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import {
  ServiceProcessInfoDto,
  CreateServiceProcessRequest,
  CreateServiceProcessStepRequest,
  CreateServiceProcessStepProductRequest,
  UpdateServiceProcessRequest,
} from "@/lib/api/types/service-process.types";
import {
  useCreateServiceProcess,
  useUpdateServiceProcess,
} from "@/lib/api/hooks/useServiceProcesses";
import {
  MemoizedInput,
  MemoizedTextArea,
  MemoizedInputNumber,
} from "@/components/ui/MemoizedComponents";

const { Title, Text } = Typography;

interface CareProcessModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  initialData?: ServiceProcessInfoDto | null;
  title?: string;
}

const CareProcessModal: React.FC<CareProcessModalProps> = ({
  open,
  onCancel,
  onSuccess,
  initialData,
  title = "Thêm quy trình chăm sóc mới",
}) => {
  const [form] = Form.useForm();
  const formRef = useRef(form);
  formRef.current = form;
  
  const [steps, setSteps] = useState<CreateServiceProcessStepRequest[]>([]);
  const [editingStep, setEditingStep] = useState<CreateServiceProcessStepRequest | null>(null);
  const [stepModalOpen, setStepModalOpen] = useState(false);

  // Ant Design App hook for message
  const { message } = App.useApp();

  // React Query hooks
  const createServiceProcessMutation = useCreateServiceProcess();
  const updateServiceProcessMutation = useUpdateServiceProcess();

  useEffect(() => {
    if (initialData) {
      // Convert ServiceProcessStepInfoDto to CreateServiceProcessStepRequest with IDs
      const convertedSteps: CreateServiceProcessStepRequest[] = initialData.processSteps?.map(step => ({
        id: step.id, // Keep step ID for updates
        stepOrder: step.stepOrder,
        name: step.name,
        description: step.description,
        estimatedTime: step.estimatedTime,
        isRequired: step.isRequired,
        stepProducts: step.stepProducts?.map(product => ({
          id: product.id, // Keep product ID for updates
          productId: product.productId,
          productName: product.productName, // Include product name for display
          quantity: product.quantity,
          unit: product.unit,
        })) || [],
      })) || [];
      setSteps(convertedSteps);
      
      // Calculate total duration from steps
      const totalDuration = convertedSteps.reduce((total, step) => total + (step.estimatedTime || 0), 0);
      
      formRef.current.setFieldsValue({
        code: initialData.code,
        name: initialData.name,
        description: initialData.description,
        estimatedDuration: totalDuration,
        isDefault: initialData.isDefault,
        isActive: initialData.isActive,
      });
    } else {
      formRef.current.resetFields();
      setSteps([]);
    }
  }, [initialData]);

  // Auto-update estimated duration when steps change
  useEffect(() => {
    const totalDuration = (steps || []).reduce((total, step) => total + (step.estimatedTime || 0), 0);
    formRef.current.setFieldValue('estimatedDuration', totalDuration);
  }, [steps]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // Calculate total duration from steps
      const totalDuration = steps.reduce((total, step) => total + (step.estimatedTime || 0), 0);

      if (initialData) {
        // Update existing process - convert to UpdateServiceProcessRequest format
        const updateData: UpdateServiceProcessRequest = {
          code: values.code,
          name: values.name,
          description: values.description,
          estimated_duration: totalDuration,
          is_default: values.isDefault || false,
          is_active: values.isActive !== false,
          process_steps: steps.map(step => ({
            id: step.id, // Include step ID if exists
            step_order: step.stepOrder,
            name: step.name,
            description: step.description,
            estimated_time: step.estimatedTime,
            is_required: step.isRequired,
            is_active: true, // Set is_active to true for new steps
            step_products: step.stepProducts?.filter(product => product.productId && product.productId.trim() !== '')?.map(product => ({
              id: product.id, // Include product ID if exists
              product_id: product.productId, // Backend expects product_id field name
              quantity: product.quantity,
              unit: product.unit,
            })) || [],
          })),
        };

        await updateServiceProcessMutation.mutateAsync({
          serviceProcessId: initialData.id,
          data: updateData,
        });
        message.success("Cập nhật quy trình thành công!");
      } else {
        // Create new process
        const createData: CreateServiceProcessRequest = {
          code: values.code,
          name: values.name,
          description: values.description,
          estimatedDuration: totalDuration,
          isDefault: values.isDefault || false,
          isActive: values.isActive !== false,
          processSteps: steps.map(step => ({
            ...step,
            stepProducts: step.stepProducts?.filter(product => product.productId && product.productId.trim() !== '') || [],
          })),
        };

        await createServiceProcessMutation.mutateAsync(createData);
        message.success("Thêm quy trình thành công!");
      }

      form.resetFields();
      setSteps([]);
      onSuccess?.();
    } catch (error) {
      console.error("Error saving service process:", error);
      message.error("Có lỗi xảy ra khi lưu quy trình");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSteps([]);
    onCancel();
  };

  const addStep = () => {
    const newStep: CreateServiceProcessStepRequest = {
      stepOrder: steps.length + 1,
      name: "",
      description: "",
      estimatedTime: 15,
      isRequired: true,
      stepProducts: [],
    };
    setEditingStep(newStep);
    setStepModalOpen(true);
  };

  const editStep = (step: CreateServiceProcessStepRequest, index: number) => {
    setEditingStep({ ...step, stepOrder: index + 1 });
    setStepModalOpen(true);
  };

  const saveStep = (stepData: CreateServiceProcessStepRequest) => {
    let newSteps: CreateServiceProcessStepRequest[];
    
    if (editingStep && editingStep.stepOrder && steps.some((step, index) => index === editingStep.stepOrder! - 1)) {
      // Update existing step
      newSteps = [...steps];
      newSteps[editingStep.stepOrder - 1] = { ...stepData, stepOrder: editingStep.stepOrder };
    } else {
      // Add new step
      const newStep = {
        ...stepData,
        stepOrder: steps.length + 1,
      };
      newSteps = [...steps, newStep];
    }
    
    setSteps(newSteps);
    setStepModalOpen(false);
    setEditingStep(null);
  };

  const deleteStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Reorder steps
    newSteps.forEach((step, i) => {
      step.stepOrder = i + 1;
    });
    setSteps(newSteps);
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    const newSteps = [...steps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];

    // Update step order
    newSteps.forEach((step, i) => {
      step.stepOrder = i + 1;
    });

    setSteps(newSteps);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Component thông tin cơ bản
  const BasicInfoSection = () => (
    <div>
      <Title level={5} style={{ marginBottom: 16 }}>
        Thông tin cơ bản
      </Title>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="code"
            label="Mã quy trình"
            rules={[
              { required: true, message: "Vui lòng nhập mã quy trình!" },
              { min: 2, max: 50, message: "Mã quy trình phải từ 2-50 ký tự!" },
            ]}
          >
            <MemoizedInput placeholder="Nhập mã quy trình (VD: PROC001)" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Tên quy trình"
            rules={[
              { required: true, message: "Vui lòng nhập tên quy trình!" },
              { min: 2, max: 150, message: "Tên quy trình phải từ 2-150 ký tự!" },
            ]}
          >
            <MemoizedInput placeholder="Nhập tên quy trình chăm sóc" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { max: 2000, message: "Mô tả không được vượt quá 2000 ký tự!" },
            ]}
          >
            <MemoizedTextArea
              rows={3}
              placeholder="Nhập mô tả quy trình chăm sóc"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="estimatedDuration"
            label="Thời gian ước tính (phút)"
            extra="Tự động tính từ tổng thời gian các bước"
          >
            <MemoizedInputNumber
              min={1}
              placeholder="Tự động tính toán"
              style={{ width: "100%" }}
              readOnly
              value={steps.reduce((total, step) => total + (step.estimatedTime || 0), 0)}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="isDefault"
            label="Quy trình mặc định"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="isActive"
            label="Trạng thái hoạt động"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  // Component các bước thực hiện
  const StepsSection = () => (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={5} style={{ margin: 0 }}>
          Các bước thực hiện ({steps.length} bước)
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={addStep}>
          Thêm bước
        </Button>
      </div>

      <List
        dataSource={steps}
        renderItem={(step, index) => (
          <List.Item key={index}>
            <Card
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ fontSize: 20, marginRight: 8 }}>
                      📋
                    </span>
                    <Text strong>
                      Bước {step.stepOrder}: {step.name}
                    </Text>
                    <Tag color="blue" style={{ marginLeft: 8 }}>
                      {formatTime(step.estimatedTime || 0)}
                    </Tag>
                    {step.isRequired && (
                      <Tag color="red" style={{ marginLeft: 8 }}>
                        Bắt buộc
                      </Tag>
                    )}
                    {step.stepProducts && step.stepProducts.length > 0 && (
                      <Tag color="green" style={{ marginLeft: 8 }}>
                        <ShoppingCartOutlined /> {step.stepProducts.length} sản phẩm
                      </Tag>
                    )}
                  </div>
                  <Space>
                    <Button
                      type="text"
                      icon={<UpOutlined />}
                      onClick={() => moveStep(index, "up")}
                      disabled={index === 0}
                    />
                    <Button
                      type="text"
                      icon={<DownOutlined />}
                      onClick={() => moveStep(index, "down")}
                      disabled={index === steps.length - 1}
                    />
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => editStep(step, index)}
                    />
                    <Popconfirm
                      title="Xóa bước này?"
                      description="Bạn có chắc chắn muốn xóa bước này?"
                      onConfirm={() => deleteStep(index)}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                      />
                    </Popconfirm>
                  </Space>
                </div>
              }
              size="small"
              style={{ width: "100%" }}
            >
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary">{step.description}</Text>
              </div>
              {step.stepProducts && step.stepProducts.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <Text strong>Sản phẩm sử dụng:</Text>
                  <div style={{ marginTop: 8 }}>
                    {step.stepProducts.map((product, idx) => (
                      <Tag key={idx} color="green" style={{ marginBottom: 4 }}>
                        {product.productName || product.productId} - {product.quantity} {product.unit || 'cái'}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </List.Item>
        )}
      />

      {steps.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>
          <Text>Chưa có bước nào. Click &quot;Thêm bước&quot; để bắt đầu.</Text>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Modal
        title={title}
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1200}
        confirmLoading={createServiceProcessMutation.isPending || updateServiceProcessMutation.isPending}
        okText={initialData ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            isActive: true,
            isDefault: false,
          }}
        >
          {/* Thông tin cơ bản */}
          <BasicInfoSection />

          <Divider />

          {/* Các bước thực hiện */}
          <StepsSection />
        </Form>
      </Modal>

      {/* Modal thêm/sửa bước */}
      <StepModal
        open={stepModalOpen}
        onCancel={() => {
          setStepModalOpen(false);
          setEditingStep(null);
        }}
        onOk={saveStep}
        initialData={editingStep}
        title={editingStep?.stepOrder ? "Chỉnh sửa bước" : "Thêm bước mới"}
      />
    </>
  );
};

// Component modal cho từng bước
interface StepModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (data: CreateServiceProcessStepRequest) => void;
  initialData?: CreateServiceProcessStepRequest | null;
  title?: string;
}

const StepModal: React.FC<StepModalProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
  title = "Thêm bước mới",
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [stepProducts, setStepProducts] = useState<CreateServiceProcessStepProductRequest[]>([]);

  // Ant Design App hook for message
  const { message } = App.useApp();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        name: initialData.name,
        description: initialData.description,
        estimatedTime: initialData.estimatedTime,
        isRequired: initialData.isRequired,
      });
      setStepProducts(initialData.stepProducts || []);
    } else {
      form.resetFields();
      // Set default values for new step
      form.setFieldsValue({
        estimatedTime: 15,
        isRequired: true,
      });
      setStepProducts([]);
    }
  }, [initialData, form]);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const stepData: CreateServiceProcessStepRequest = {
        stepOrder: initialData?.stepOrder || 1,
        name: values.name,
        description: values.description,
        estimatedTime: values.estimatedTime,
        isRequired: values.isRequired,
        stepProducts: stepProducts,
      };

      onOk(stepData);
      message.success(
        initialData ? "Cập nhật bước thành công!" : "Thêm bước thành công!"
      );
      form.resetFields();
      setStepProducts([]);
    } catch (error) {
      console.log("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setStepProducts([]);
    onCancel();
  };

  const addProduct = () => {
    const newProduct: CreateServiceProcessStepProductRequest = {
      productId: "",
      productName: "",
      quantity: 1,
      unit: "cái",
    };
    setStepProducts([...stepProducts, newProduct]);
  };

  const updateProduct = (index: number, field: keyof CreateServiceProcessStepProductRequest, value: string | number) => {
    const updatedProducts = [...stepProducts];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setStepProducts(updatedProducts);
  };

  const removeProduct = (index: number) => {
    setStepProducts(stepProducts.filter((_, i) => i !== index));
  };

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      width={800}
      confirmLoading={loading}
      okText={initialData ? "Cập nhật" : "Thêm mới"}
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          estimatedTime: 15,
          isRequired: true,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Tên bước"
              rules={[
                { required: true, message: "Vui lòng nhập tên bước!" },
                { min: 2, max: 150, message: "Tên bước phải từ 2-150 ký tự!" },
              ]}
            >
              <MemoizedInput placeholder="Nhập tên bước" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="estimatedTime"
              label="Thời gian ước tính (phút)"
              rules={[
                { required: true, message: "Vui lòng nhập thời gian!" },
                { type: "number", min: 1, message: "Thời gian phải ít nhất 1 phút!" },
              ]}
            >
              <MemoizedInputNumber
                min={1}
                placeholder="Nhập thời gian"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[
                { max: 2000, message: "Mô tả không được vượt quá 2000 ký tự!" },
              ]}
            >
              <MemoizedTextArea rows={2} placeholder="Nhập mô tả bước" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="isRequired"
              label="Bước bắt buộc"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {/* Quản lý sản phẩm */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              marginBottom: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong>Sản phẩm sử dụng</Text>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={addProduct}
            >
              Thêm sản phẩm
            </Button>
          </div>
          
          {stepProducts.length > 0 ? (
            <Table
              dataSource={stepProducts}
              pagination={false}
              size="small"
              rowKey={(_, index) => index || 0}
              columns={[
                {
                  title: "STT",
                  key: "index",
                  width: 60,
                  align: "center" as const,
                  render: (_: CreateServiceProcessStepProductRequest, __: CreateServiceProcessStepProductRequest, index: number) => index + 1,
                },
                {
                  title: "Mã sản phẩm",
                  dataIndex: "productId",
                  key: "productId",
                  render: (value: string, record: CreateServiceProcessStepProductRequest, index: number) => (
                    <MemoizedInput
                      value={value}
                      onChange={(e) => updateProduct(index, "productId", e.target.value)}
                      placeholder="Nhập mã sản phẩm"
                    />
                  ),
                },
                {
                  title: "Tên sản phẩm",
                  dataIndex: "productName",
                  key: "productName",
                  render: (value: string, record: CreateServiceProcessStepProductRequest, index: number) => (
                    <MemoizedInput
                      value={value}
                      onChange={(e) => updateProduct(index, "productName", e.target.value)}
                      placeholder="Nhập tên sản phẩm"
                    />
                  ),
                },
                {
                  title: "Số lượng",
                  dataIndex: "quantity",
                  key: "quantity",
                  width: 120,
                  render: (value: number, record: CreateServiceProcessStepProductRequest, index: number) => (
                    <InputNumber
                      value={value}
                      onChange={(val) => updateProduct(index, "quantity", val || 1)}
                      min={0.01}
                      step={0.1}
                      style={{ width: "100%" }}
                    />
                  ),
                },
                {
                  title: "Đơn vị",
                  dataIndex: "unit",
                  key: "unit",
                  width: 100,
                  render: (value: string, record: CreateServiceProcessStepProductRequest, index: number) => (
                    <MemoizedInput
                      value={value}
                      onChange={(e) => updateProduct(index, "unit", e.target.value)}
                      placeholder="cái"
                    />
                  ),
                },
                {
                  title: "Thao tác",
                  key: "actions",
                  width: 80,
                  align: "center" as const,
                  render: (_: CreateServiceProcessStepProductRequest, __: CreateServiceProcessStepProductRequest, index: number) => (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeProduct(index)}
                    />
                  ),
                },
              ]}
            />
          ) : (
            <div style={{ textAlign: "center", padding: 20, color: "#8c8c8c" }}>
              <Text>Chưa có sản phẩm nào. Click &quot;Thêm sản phẩm&quot; để bắt đầu.</Text>
            </div>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default CareProcessModal;
