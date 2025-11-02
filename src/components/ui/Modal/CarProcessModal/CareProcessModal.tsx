"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
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
import { ProductService } from "@/lib/api/services/product.service";
import {
  MemoizedInput,
  MemoizedTextArea,
  MemoizedInputNumber,
} from "@/components/ui/MemoizedComponents";
import ProductSearchSelect from "@/components/ui/ProductSearchSelect";

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
  const [editingStep, setEditingStep] =
    useState<CreateServiceProcessStepRequest | null>(null);
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [shouldClearAllSteps, setShouldClearAllSteps] = useState(false);

  // Ant Design App hook for message
  const { message } = App.useApp();

  // Function to fetch product name if missing
  const fetchProductName = useCallback(
    async (productId: string): Promise<string | null> => {
      try {
        const product = await ProductService.getProductById(productId);
        if (product) {
          return product.product_name;
        }
      } catch (error) {
        console.log("Error fetching product name:", error);
      }
      return null;
    },
    []
  );

  // React Query hooks
  const createServiceProcessMutation = useCreateServiceProcess();
  const updateServiceProcessMutation = useUpdateServiceProcess();

  // Function to load initial data with product names
  const loadInitialData = useCallback(
    async (data: ServiceProcessInfoDto) => {
      console.log("Loading initial data:", data);
      console.log("Initial process_steps:", data.process_steps);

      const convertedSteps: CreateServiceProcessStepRequest[] =
        await Promise.all(
          data.process_steps?.map(async (step, index) => {
            console.log(`Processing step ${index}:`, step);
            console.log(`Step step_products:`, step.step_products);

            const stepProducts = await Promise.all(
              step.step_products?.map(async (product) => {
                console.log(
                  "Loading product:",
                  product,
                  "product_name:",
                  product.product_name
                );
                let productName = product.product_name;

                // If product_name is missing but product_id exists, fetch it
                if (!productName && product.product_id) {
                  const fetchedName = await fetchProductName(
                    product.product_id
                  );
                  productName = fetchedName || "";
                  console.log("Fetched product name:", productName);
                }

                return {
                  id: product.id, // Keep product ID for updates
                  product_id: product.product_id,
                  product_name: productName || "", // Include product name for display
                  quantity: product.quantity,
                  unit: product.unit,
                };
              }) || []
            );

            return {
              id: step.id, // Keep step ID for updates
              step_order: index + 1, // Ensure step_order starts from 1
              name: step.name,
              description: step.description,
              estimated_time: step.estimated_time,
              is_required: step.is_required,
              step_products: stepProducts,
            };
          }) || []
        );

      console.log("Converted steps:", convertedSteps);
      setSteps(convertedSteps);

      // Calculate total duration from steps
      const totalDuration = convertedSteps.reduce(
        (total, step) => total + (step.estimated_time || 0),
        0
      );

      formRef.current.setFieldsValue({
        code: data.code,
        name: data.name,
        description: data.description,
        estimated_duration: totalDuration, // Updated to use snake_case
        is_default: data.is_default,
        is_active: data.is_active,
      });
    },
    [fetchProductName]
  );

  useEffect(() => {
    if (initialData) {
      loadInitialData(initialData);
    } else {
      formRef.current.resetFields();
      setSteps([]);
    }
  }, [initialData, loadInitialData]);

  // Calculate total duration from steps
  const totalDuration = useMemo(() => {
    return (steps || []).reduce(
      (total, step) => total + (step.estimated_time || 0),
      0
    );
  }, [steps]);

  // Auto-update estimated duration when totalDuration changes
  const [lastTotalDuration, setLastTotalDuration] = useState<number>(0);

  useEffect(() => {
    if (formRef.current && lastTotalDuration !== totalDuration) {
      formRef.current.setFieldValue("estimated_duration", totalDuration); // Updated to use snake_case
      setLastTotalDuration(totalDuration);
    }
  }, [totalDuration, lastTotalDuration]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // Debug: Log steps data before processing
      console.log("handleOk - steps before processing:", steps);
      steps.forEach((step, index) => {
        console.log(`Step ${index}:`, step);
        console.log(`Step ${index} step_products:`, step.step_products);
      });

      // Validate product selection
      const productErrors: string[] = [];
      console.log("Validation - steps:", steps);
      steps.forEach((step, stepIndex) => {
        console.log(`Validation - step ${stepIndex + 1}:`, step);
        console.log(
          `Validation - step ${stepIndex + 1} step_products:`,
          step.step_products
        );
        step.step_products?.forEach((product, productIndex) => {
          console.log(
            `Validation - step ${stepIndex + 1}, product ${productIndex + 1}:`,
            product
          );
          console.log(
            `Validation - step ${stepIndex + 1}, product ${
              productIndex + 1
            } details:`,
            {
              product_id: product.product_id,
              product_name: product.product_name,
              quantity: product.quantity,
              unit: product.unit,
            }
          );
          if (!product.product_id || product.product_id.trim() === "") {
            console.log(
              `Validation error - step ${stepIndex + 1}, product ${
                productIndex + 1
              }: product_id is empty`
            );
            productErrors.push(
              `Bước ${stepIndex + 1}, Sản phẩm ${
                productIndex + 1
              }: Vui lòng chọn sản phẩm`
            );
          }
          if (!product.quantity || product.quantity <= 0) {
            productErrors.push(
              `Bước ${stepIndex + 1}, Sản phẩm ${
                productIndex + 1
              }: Số lượng phải lớn hơn 0`
            );
          }
        });
      });

      if (productErrors.length > 0) {
        message.error(productErrors[0]); // Show first error
        return;
      }

      // Use the calculated total duration

      if (initialData) {
        // Update existing process - convert to UpdateServiceProcessRequest format
        const updateData: UpdateServiceProcessRequest = {
          code: values.code,
          name: values.name,
          description: values.description,
          estimated_duration: totalDuration, // Updated to use snake_case
          is_default: values.is_default || false,
          is_active: values.is_active !== false,
          // Xử lý process_steps dựa trên logic:
          // - Nếu shouldClearAllSteps = true: gửi process_steps: [] để xóa tất cả steps
          // - Nếu steps.length > 0: gửi process_steps với danh sách steps
          // - Nếu steps.length = 0 và shouldClearAllSteps = false: không gửi process_steps (giữ nguyên)
          ...(shouldClearAllSteps || steps.length > 0
            ? {
                process_steps: steps.map((step) => {
                  console.log("Processing step for update:", step);
                  const processedStep = {
                    id: step.id, // Include step ID if exists
                    step_order: step.step_order,
                    name: step.name,
                    description: step.description,
                    estimated_time: step.estimated_time,
                    is_required: step.is_required,
                    is_active: true, // Set is_active to true for new steps
                    step_products:
                      step.step_products
                        ?.filter(
                          (product) =>
                            product &&
                            product.product_id &&
                            product.product_id.trim() !== ""
                        )
                        ?.map((product) => ({
                          id: product.id, // Include product ID if exists
                          product_id: product.product_id, // Keep product_id for frontend type compatibility
                          quantity: Number(product.quantity) || 1, // Convert to number for BigDecimal
                          unit: product.unit || "cái",
                        })) || [],
                  };
                  console.log("Processed step:", processedStep);
                  return processedStep;
                }),
              }
            : {}),
        };

        // Map to backend format before sending
        const mappedUpdateData = {
          code: updateData.code,
          name: updateData.name,
          description: updateData.description,
          estimated_duration: updateData.estimated_duration,
          is_default: updateData.is_default,
          is_active: updateData.is_active,
          process_steps: updateData.process_steps?.map((step) => ({
            id: step.id,
            step_order: step.step_order,
            name: step.name,
            description: step.description,
            estimated_time: step.estimated_time,
            is_required: step.is_required,
            is_active: step.is_active,
            step_products: step.step_products?.map((product) => ({
              id: product.id,
              product_id: product.product_id,
              quantity: Number(product.quantity) || 1,
              unit: product.unit || "cái",
            })) || [],
          })) || [],
        };
        console.log("Mapped update data:", mappedUpdateData);

        await updateServiceProcessMutation.mutateAsync({
          serviceProcessId: initialData.id,
          data: mappedUpdateData,
        });
        message.success("Cập nhật quy trình thành công!");
      } else {
        // Create new process
        const createData: CreateServiceProcessRequest = {
          code: values.code,
          name: values.name,
          description: values.description,
          estimated_duration: totalDuration, // Updated to use snake_case
          is_default: values.is_default || false,
          is_active: values.is_active !== false,
          ...(steps.length > 0 && {
            process_steps: steps.map((step) => ({
              ...step,
              step_products:
                step.step_products
                  ?.filter(
                    (product) =>
                      product &&
                      product.product_id &&
                      product.product_id.trim() !== ""
                  )
                  ?.map((product) => ({
                    product_id: product.product_id, // Keep product_id for frontend type compatibility
                    quantity: Number(product.quantity) || 1, // Convert to number for BigDecimal
                    unit: product.unit || "cái",
                  })) || [],
            })),
          }),
        };

        // Map to backend format before sending
        const mappedCreateData = {
          code: createData.code,
          name: createData.name,
          description: createData.description,
          estimated_duration: createData.estimated_duration,
          is_default: createData.is_default,
          is_active: createData.is_active,
          process_steps: createData.process_steps?.map((step) => ({
            step_order: step.step_order,
            name: step.name,
            description: step.description,
            estimated_time: step.estimated_time,
            is_required: step.is_required,
            is_active: true,
            step_products: step.step_products?.map((product) => ({
              product_id: product.product_id,
              quantity: Number(product.quantity) || 1,
              unit: product.unit || "cái",
            })) || [],
          })) || [],
        };
        console.log("Mapped create data:", mappedCreateData);

        await createServiceProcessMutation.mutateAsync(mappedCreateData);
        message.success("Thêm quy trình thành công!");
      }

      form.resetFields();
      setSteps([]);
      setShouldClearAllSteps(false);
      onSuccess?.();
    } catch (error) {
      console.log("Error saving service process:", error);
      message.error("Có lỗi xảy ra khi lưu quy trình");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSteps([]);
    setShouldClearAllSteps(false);
    onCancel();
  };

  const addStep = () => {
    const newStep: CreateServiceProcessStepRequest = {
      step_order: steps.length + 1,
      name: "",
      description: "",
      estimated_time: 15,
      is_required: true,
      step_products: [],
    };
    setEditingStep(newStep);
    setStepModalOpen(true);
    // Reset shouldClearAllSteps khi thêm step mới
    setShouldClearAllSteps(false);
  };

  const editStep = (step: CreateServiceProcessStepRequest, index: number) => {
    setEditingStep({ ...step, step_order: index + 1 });
    setStepModalOpen(true);
  };

  const saveStep = (stepData: CreateServiceProcessStepRequest) => {
    console.log("saveStep - received stepData:", stepData);
    console.log("saveStep - stepData.step_products:", stepData.step_products);
    let newSteps: CreateServiceProcessStepRequest[];

    if (editingStep && editingStep.step_order) {
      // Update existing step - find by step_order
      const stepIndex = editingStep.step_order - 1;
      if (stepIndex >= 0 && stepIndex < steps.length) {
        newSteps = [...steps];
        newSteps[stepIndex] = {
          ...stepData,
          step_order: editingStep.step_order,
        };
      } else {
        // Fallback: add as new step
        const newStep = {
          ...stepData,
          step_order: steps.length + 1,
        };
        newSteps = [...steps, newStep];
      }
    } else {
      // Add new step
      const newStep = {
        ...stepData,
        step_order: steps.length + 1,
      };
      newSteps = [...steps, newStep];
    }

    console.log("saveStep - newSteps:", newSteps);
    console.log(
      "saveStep - newSteps details:",
      newSteps.map((step) => ({
        step_order: step.step_order,
        name: step.name,
        step_products: step.step_products?.map((p) => ({
          product_id: p.product_id,
          product_name: p.product_name,
          quantity: p.quantity,
          unit: p.unit,
        })),
      }))
    );
    setSteps(newSteps);
    setStepModalOpen(false);
    setEditingStep(null);
  };

  const deleteStep = (index: number) => {
    if (index < 0 || index >= steps.length) return;

    const newSteps = steps.filter((_, i) => i !== index);
    // Reorder steps
    newSteps.forEach((step, i) => {
      step.step_order = i + 1;
    });
    setSteps(newSteps);
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    const newSteps = [...steps];
    // Swap the steps
    [newSteps[index], newSteps[newIndex]] = [
      newSteps[newIndex],
      newSteps[index],
    ];

    // Update step order for all steps
    newSteps.forEach((step, i) => {
      step.step_order = i + 1;
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
              {
                min: 2,
                max: 150,
                message: "Tên quy trình phải từ 2-150 ký tự!",
              },
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
            name="estimated_duration"
            label="Thời gian ước tính (phút)"
            extra="Tự động tính từ tổng thời gian các bước"
          >
            <MemoizedInputNumber
              min={1}
              placeholder="Tự động tính toán"
              style={{ width: "100%" }}
              readOnly
              value={steps.reduce(
                (total, step) => total + (step.estimated_time || 0),
                0
              )}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="is_default"
            label="Quy trình mặc định"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="is_active"
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
        <Space>
          {steps.length > 0 && (
            <Popconfirm
              title="Xóa tất cả bước?"
              description="Bạn có chắc chắn muốn xóa tất cả các bước? Hành động này không thể hoàn tác."
              onConfirm={() => {
                setSteps([]);
                setShouldClearAllSteps(true);
                message.success("Đã xóa tất cả các bước");
              }}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button danger icon={<DeleteOutlined />}>
                Xóa tất cả
              </Button>
            </Popconfirm>
          )}
          <Button type="primary" icon={<PlusOutlined />} onClick={addStep}>
            Thêm bước
          </Button>
        </Space>
      </div>

      <List
        dataSource={steps}
        renderItem={(step, index) => (
          <List.Item key={step.step_order || index}>
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
                    <span style={{ fontSize: 20, marginRight: 8 }}>📋</span>
                    <Text strong>
                      Bước {step.step_order}: {step.name}
                    </Text>
                    <Tag color="blue" style={{ marginLeft: 8 }}>
                      {formatTime(step.estimated_time || 0)}
                    </Tag>
                    {step.is_required && (
                      <Tag color="red" style={{ marginLeft: 8 }}>
                        Bắt buộc
                      </Tag>
                    )}
                    {step.step_products && step.step_products.length > 0 && (
                      <Tag color="green" style={{ marginLeft: 8 }}>
                        <ShoppingCartOutlined /> {step.step_products.length} sản
                        phẩm
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
                      <Button type="text" danger icon={<DeleteOutlined />} />
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
              {step.step_products && step.step_products.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <Text strong>Sản phẩm sử dụng:</Text>
                  <div style={{ marginTop: 8 }}>
                    {step.step_products.map((product, idx) => (
                      <Tag
                        key={idx}
                        color="green"
                        style={{ marginBottom: 4, marginRight: 4 }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                          }}
                        >
                          <div style={{ fontWeight: 500 }}>
                            {product.product_name ||
                              `Sản phẩm ${product.product_id}`}
                          </div>
                          <div style={{ fontSize: 11, opacity: 0.8 }}>
                            {product.quantity} {product.unit || "cái"}
                          </div>
                        </div>
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
        confirmLoading={
          createServiceProcessMutation.isPending ||
          updateServiceProcessMutation.isPending
        }
        okText={initialData ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            is_active: true,
            is_default: false,
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
        title={editingStep?.step_order ? "Chỉnh sửa bước" : "Thêm bước mới"}
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
  const [stepProducts, setStepProducts] = useState<
    CreateServiceProcessStepProductRequest[]
  >([]);

  // Debug logging for stepProducts state changes
  useEffect(() => {
    console.log("StepModal - stepProducts state changed:", stepProducts);
    console.log(
      "StepModal - stepProducts details:",
      stepProducts.map((p) => ({
        product_id: p.product_id,
        product_name: p.product_name,
        quantity: p.quantity,
        unit: p.unit,
      }))
    );
  }, [stepProducts]);

  // Ant Design App hook for message and modal
  const { message, modal } = App.useApp();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        name: initialData.name,
        description: initialData.description,
        estimated_time: initialData.estimated_time, // Updated to use snake_case
        is_required: initialData.is_required, // Updated to use snake_case
      });
      console.log("Loading initial step_products:", initialData.step_products);
      setStepProducts(initialData.step_products || []);
    } else {
      form.resetFields();
      // Set default values for new step
      form.setFieldsValue({
        estimated_time: 15, // Updated to use snake_case
        is_required: true, // Updated to use snake_case
      });
      setStepProducts([]);
    }
  }, [initialData, form]);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      console.log("StepModal handleOk - stepProducts:", stepProducts);
      console.log(
        "StepModal handleOk - stepProducts details:",
        stepProducts.map((p) => ({
          product_id: p.product_id,
          product_name: p.product_name,
          quantity: p.quantity,
          unit: p.unit,
        }))
      );
      const stepData: CreateServiceProcessStepRequest = {
        step_order: initialData?.step_order || 1,
        name: values.name,
        description: values.description,
        estimated_time: values.estimated_time, // Updated to use snake_case
        is_required: values.is_required, // Updated to use snake_case
        step_products: stepProducts,
      };
      console.log("StepModal handleOk - stepData:", stepData);
      console.log(
        "StepModal handleOk - stepData.step_products:",
        stepData.step_products
      );

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
      product_id: "",
      product_name: "",
      quantity: 1,
      unit: "cái",
    };
    setStepProducts((prevProducts) => [...prevProducts, newProduct]);
  };

  const updateProduct = (
    index: number,
    field: keyof CreateServiceProcessStepProductRequest,
    value: string | number
  ) => {
    console.log(
      "updateProduct - index:",
      index,
      "field:",
      field,
      "value:",
      value
    );
    console.log("updateProduct - current stepProducts:", stepProducts);

    setStepProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index] = { ...updatedProducts[index], [field]: value };
      console.log("updateProduct - updated stepProducts:", updatedProducts);
      console.log(
        "updateProduct - updated stepProducts details:",
        updatedProducts.map((p) => ({
          product_id: p.product_id,
          product_name: p.product_name,
          quantity: p.quantity,
          unit: p.unit,
        }))
      );
      return updatedProducts;
    });
  };

  const removeProduct = (index: number) => {
    modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: () => {
        setStepProducts((prevProducts) =>
          prevProducts.filter((_, i) => i !== index)
        );
      },
    });
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
          estimated_time: 15,
          is_required: true,
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
              name="estimated_time"
              label="Thời gian ước tính (phút)"
              rules={[
                { required: true, message: "Vui lòng nhập thời gian!" },
                {
                  type: "number",
                  min: 1,
                  message: "Thời gian phải ít nhất 1 phút!",
                },
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
              name="is_required"
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
              key={`table-${stepProducts.length}-${stepProducts
                .map((p) => p.product_id)
                .join("-")}`}
              dataSource={stepProducts}
              pagination={false}
              size="small"
              rowKey={(record) => `product-${record.product_id}`}
              columns={[
                {
                  title: "STT",
                  key: "index",
                  width: 60,
                  align: "center" as const,
                  render: (
                    _: CreateServiceProcessStepProductRequest,
                    __: CreateServiceProcessStepProductRequest,
                    index: number
                  ) => index + 1,
                },
                {
                  title: "Sản phẩm",
                  dataIndex: "product_id",
                  key: "product_id",
                  render: (
                    value: string,
                    record: CreateServiceProcessStepProductRequest,
                    index: number
                  ) => (
                    <div>
                      <ProductSearchSelect
                        value={value}
                        onChange={(
                          productId: string,
                          product?: {
                            product_name: string;
                            unit_of_measure: string;
                          }
                        ) => {
                          console.log(
                            "ProductSearchSelect onChange - productId:",
                            productId,
                            "product:",
                            product
                          );

                          if (!productId) {
                            // Clear product info when no product selected
                            updateProduct(index, "product_id", "");
                            updateProduct(index, "product_name", "");
                            updateProduct(index, "unit", "cái");
                            return;
                          }

                          console.log(
                            "Before updateProduct - stepProducts:",
                            stepProducts
                          );
                          updateProduct(index, "product_id", productId);
                          if (product) {
                            updateProduct(
                              index,
                              "product_name",
                              product.product_name
                            );
                            updateProduct(
                              index,
                              "unit",
                              product.unit_of_measure || "cái"
                            );
                          }
                          console.log("After updateProduct calls");
                        }}
                        placeholder="Tìm kiếm sản phẩm..."
                        size="small"
                        style={{ width: "100%" }}
                        excludeProductIds={stepProducts
                          .filter((_, i) => i !== index && _.product_id)
                          .map((p) => p.product_id)}
                      />
                      {(() => {
                        console.log(
                          "ProductSearchSelect render - record:",
                          record,
                          "product_name:",
                          record.product_name,
                          "product_id:",
                          record.product_id
                        );
                        console.log(
                          "ProductSearchSelect render - stepProducts:",
                          stepProducts
                        );
                        console.log(
                          "ProductSearchSelect render - stepProducts details:",
                          stepProducts.map((p) => ({
                            product_id: p.product_id,
                            product_name: p.product_name,
                            quantity: p.quantity,
                            unit: p.unit,
                          }))
                        );
                        return null;
                      })()}
                      {record.product_name ? (
                        <div
                          style={{
                            marginTop: 8,
                            padding: "12px 16px",
                            backgroundColor: "#f6ffed",
                            border: "1px solid #b7eb8f",
                            borderRadius: 8,
                            boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 4,
                            }}
                          >
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: "#52c41a",
                              }}
                            />
                            <Text
                              strong
                              style={{ color: "#389e0d", fontSize: 13 }}
                            >
                              {record.product_name}
                            </Text>
                          </div>
                          {record.product_id && (
                            <div
                              style={{
                                fontSize: 11,
                                color: "#52c41a",
                                marginLeft: 16,
                              }}
                            >
                              SKU: {record.product_id}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          style={{
                            marginTop: 8,
                            padding: "8px 12px",
                            backgroundColor: "#fff7e6",
                            border: "1px solid #ffd591",
                            borderRadius: 6,
                            fontSize: 12,
                            color: "#d46b08",
                          }}
                        >
                          ⚠️ Vui lòng chọn sản phẩm
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  title: "Số lượng",
                  dataIndex: "quantity",
                  key: "quantity",
                  width: 120,
                  render: (
                    value: number,
                    record: CreateServiceProcessStepProductRequest,
                    index: number
                  ) => (
                    <InputNumber
                      value={value}
                      onChange={(val) =>
                        updateProduct(index, "quantity", Number(val) || 1)
                      }
                      min={0.01}
                      step={0.1}
                      precision={2}
                      style={{ width: "100%" }}
                    />
                  ),
                },
                {
                  title: "Đơn vị",
                  dataIndex: "unit",
                  key: "unit",
                  width: 120,
                  render: (
                    value: string,
                    record: CreateServiceProcessStepProductRequest,
                    index: number
                  ) => (
                    <div>
                      <MemoizedInput
                        value={value}
                        onChange={(e) =>
                          updateProduct(index, "unit", e.target.value)
                        }
                        placeholder="cái"
                        size="small"
                      />
                      {!value && (
                        <div
                          style={{ fontSize: 10, color: "#999", marginTop: 2 }}
                        >
                          Mặc định: cái
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  title: "Thao tác",
                  key: "actions",
                  width: 80,
                  align: "center" as const,
                  render: (
                    _: CreateServiceProcessStepProductRequest,
                    __: CreateServiceProcessStepProductRequest,
                    index: number
                  ) => (
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
              <Text>
                Chưa có sản phẩm nào. Click &quot;Thêm sản phẩm&quot; để bắt
                đầu.
              </Text>
            </div>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default CareProcessModal;
