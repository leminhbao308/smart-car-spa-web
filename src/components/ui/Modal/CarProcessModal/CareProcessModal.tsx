"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Row,
  Col,
  Button,
  Space,
  Divider,
  Typography,
  message,
  Card,
  List,
  Tag,
  Switch,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import {
  CareProcess,
  CareStep,
  processCategories,
  stepCategories,
  vehicleTypes,
} from "@/components/utils/data/care-processes.data";
import {
  MemoizedInput,
  MemoizedTextArea,
  MemoizedInputNumber,
} from "@/components/ui/MemoizedComponents";

const { Title, Text } = Typography;
const { Option } = Select;

interface CareProcessModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (data: CareProcess) => void;
  initialData?: CareProcess | null;
  title?: string;
}

const CareProcessModal: React.FC<CareProcessModalProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
  title = "Thêm quy trình chăm sóc mới",
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<CareStep[]>([]);
  const [editingStep, setEditingStep] = useState<CareStep | null>(null);
  const [stepModalOpen, setStepModalOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        targetVehicleTypes: initialData.targetVehicleTypes || [],
      });
      setSteps(initialData.steps || []);
    } else {
      form.resetFields();
      setSteps([]);
    }
  }, [initialData, form]);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const formattedData = {
        ...values,
        id: initialData?.id || Date.now(),
        steps: steps,
        estimatedDuration: steps.reduce(
          (total, step) => total + step.estimatedTime,
          0
        ),
        createdAt:
          initialData?.createdAt || new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };

      onOk(formattedData);
      message.success(
        initialData
          ? "Cập nhật quy trình thành công!"
          : "Thêm quy trình thành công!"
      );
      form.resetFields();
      setSteps([]);
    } catch (error) {
      console.log("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSteps([]);
    onCancel();
  };

  const addStep = () => {
    const newStep: CareStep = {
      id: Date.now(),
      name: "",
      description: "",
      estimatedTime: 15,
      requiredTools: [],
      requiredMaterials: [],
      instructions: [],
      qualityChecklist: [],
      safetyNotes: [],
      isRequired: true,
      order: steps.length + 1,
      category: "inspection",
    };
    console.log("Adding new step:", newStep);
    setEditingStep(newStep);
    setStepModalOpen(true);
  };

  const editStep = (step: CareStep) => {
    setEditingStep(step);
    setStepModalOpen(true);
  };

  const saveStep = (stepData: CareStep) => {
    console.log("Saving step:", stepData);
    console.log("Current editingStep:", editingStep);
    console.log("Current steps:", steps);

    if (
      editingStep &&
      editingStep.id &&
      steps.some((step) => step.id === editingStep.id)
    ) {
      // Cập nhật bước đã tồn tại
      console.log("Updating existing step");
      setSteps(
        steps.map((step) =>
          step.id === editingStep.id
            ? { ...stepData, id: editingStep.id }
            : step
        )
      );
    } else {
      // Thêm bước mới
      console.log("Adding new step");
      const newStep = {
        ...stepData,
        id: Date.now(),
        order: steps.length + 1,
      };
      console.log("New step to add:", newStep);
      setSteps([...steps, newStep]);
    }
    setStepModalOpen(false);
    setEditingStep(null);
  };

  const deleteStep = (stepId: number) => {
    setSteps(steps.filter((step) => step.id !== stepId));
  };

  const moveStep = (stepId: number, direction: "up" | "down") => {
    const currentIndex = steps.findIndex((step) => step.id === stepId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    const newSteps = [...steps];
    [newSteps[currentIndex], newSteps[newIndex]] = [
      newSteps[newIndex],
      newSteps[currentIndex],
    ];

    // Cập nhật thứ tự
    newSteps.forEach((step, index) => {
      step.order = index + 1;
    });

    setSteps(newSteps);
  };

  const getCategoryIcon = (category: string) => {
    const categoryConfig = stepCategories.find((c) => c.value === category);
    return categoryConfig?.icon || "📋";
  };

  const getCategoryLabel = (category: string) => {
    const categoryConfig = stepCategories.find((c) => c.value === category);
    return categoryConfig?.label || category;
  };

  const getCategoryColor = (category: string) => {
    const categoryConfig = stepCategories.find((c) => c.value === category);
    return categoryConfig?.color || "default";
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
            name="name"
            label="Tên quy trình"
            rules={[
              { required: true, message: "Vui lòng nhập tên quy trình!" },
            ]}
          >
            <MemoizedInput placeholder="Nhập tên quy trình chăm sóc" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="category"
            label="Loại quy trình"
            rules={[
              { required: true, message: "Vui lòng chọn loại quy trình!" },
            ]}
          >
            <Select placeholder="Chọn loại quy trình">
              {processCategories.map((category) => (
                <Option key={category.value} value={category.value}>
                  <Space>
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <MemoizedTextArea
              rows={3}
              placeholder="Nhập mô tả quy trình chăm sóc"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="price"
            label="Giá dịch vụ (VNĐ)"
            rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
          >
            <MemoizedInputNumber
              min={0}
              placeholder="Nhập giá dịch vụ"
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="targetVehicleTypes"
            label="Loại xe áp dụng"
            rules={[{ required: true, message: "Vui lòng chọn loại xe!" }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn loại xe"
              style={{ width: "100%" }}
            >
              {vehicleTypes.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={24}>
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
          <List.Item key={step.id}>
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
                      {getCategoryIcon(step.category)}
                    </span>
                    <Text strong>
                      Bước {step.order}: {step.name}
                    </Text>
                    <Tag
                      color={getCategoryColor(step.category)}
                      style={{ marginLeft: 8 }}
                    >
                      {getCategoryLabel(step.category)}
                    </Tag>
                    <Tag color="blue" style={{ marginLeft: 8 }}>
                      {formatTime(step.estimatedTime)}
                    </Tag>
                    {step.isRequired && (
                      <Tag color="red" style={{ marginLeft: 8 }}>
                        Bắt buộc
                      </Tag>
                    )}
                  </div>
                  <Space>
                    <Button
                      type="text"
                      icon={<UpOutlined />}
                      onClick={() => moveStep(step.id, "up")}
                      disabled={index === 0}
                    />
                    <Button
                      type="text"
                      icon={<DownOutlined />}
                      onClick={() => moveStep(step.id, "down")}
                      disabled={index === steps.length - 1}
                    />
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => editStep(step)}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => deleteStep(step.id)}
                    />
                  </Space>
                </div>
              }
              size="small"
              style={{ width: "100%" }}
            >
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary">{step.description}</Text>
              </div>
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>Dụng cụ:</Text>
                  <div>
                    {step.requiredTools.map((tool, idx) => (
                      <Tag key={idx}   style={{ marginBottom: 2 }}>
                        {tool}
                      </Tag>
                    ))}
                  </div>
                </Col>
                <Col span={8}>
                  <Text strong>Vật liệu:</Text>
                  <div>
                    {step.requiredMaterials.map((material, idx) => (
                      <Tag key={idx}   style={{ marginBottom: 2 }}>
                        {material}
                      </Tag>
                    ))}
                  </div>
                </Col>
                <Col span={8}>
                  <Text strong>Hướng dẫn:</Text>
                  <div>
                    {step.instructions.slice(0, 2).map((instruction, idx) => (
                      <div key={idx} style={{ fontSize: 12, marginBottom: 2 }}>
                        • {instruction}
                      </div>
                    ))}
                    {step.instructions.length > 2 && (
                      <Text style={{ fontSize: 12, color: "#8c8c8c" }}>
                        +{step.instructions.length - 2} hướng dẫn khác
                      </Text>
                    )}
                  </div>
                </Col>
              </Row>
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
        confirmLoading={loading}
        okText={initialData ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            isActive: true,
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
        title={editingStep?.id ? "Chỉnh sửa bước" : "Thêm bước mới"}
      />
    </>
  );
};

// Component modal cho từng bước
interface StepModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (data: CareStep) => void;
  initialData?: CareStep | null;
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
  const [requiredTools, setRequiredTools] = useState<string[]>([]);
  const [requiredMaterials, setRequiredMaterials] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [qualityChecklist, setQualityChecklist] = useState<string[]>([]);
  const [safetyNotes, setSafetyNotes] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue(initialData);
      setRequiredTools(initialData.requiredTools || []);
      setRequiredMaterials(initialData.requiredMaterials || []);
      setInstructions(initialData.instructions || []);
      setQualityChecklist(initialData.qualityChecklist || []);
      setSafetyNotes(initialData.safetyNotes || []);
    } else {
      form.resetFields();
      // Set default values for new step
      form.setFieldsValue({
        estimatedTime: 15,
        isRequired: true,
        category: "inspection",
      });
      setRequiredTools([]);
      setRequiredMaterials([]);
      setInstructions([]);
      setQualityChecklist([]);
      setSafetyNotes([]);
    }
  }, [initialData, form]);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const stepData: CareStep = {
        ...values,
        id: initialData?.id || Date.now(),
        requiredTools: requiredTools,
        requiredMaterials: requiredMaterials,
        instructions: instructions,
        qualityChecklist: qualityChecklist,
        safetyNotes: safetyNotes,
        order: initialData?.order || 1,
      };

      onOk(stepData);
      message.success(
        initialData ? "Cập nhật bước thành công!" : "Thêm bước thành công!"
      );
      form.resetFields();
      setRequiredTools([]);
      setRequiredMaterials([]);
      setInstructions([]);
      setQualityChecklist([]);
      setSafetyNotes([]);
    } catch (error) {
      console.log("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setRequiredTools([]);
    setRequiredMaterials([]);
    setInstructions([]);
    setQualityChecklist([]);
    setSafetyNotes([]);
    onCancel();
  };

  const addItem = (list: string[], setList: (list: string[]) => void) => {
    setList([...list, ""]);
  };

  const updateItem = (
    index: number,
    value: string,
    list: string[],
    setList: (list: string[]) => void
  ) => {
    const updatedList = [...list];
    updatedList[index] = value;
    setList(updatedList);
  };

  const removeItem = (
    index: number,
    list: string[],
    setList: (list: string[]) => void
  ) => {
    setList(list.filter((_, i) => i !== index));
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
          category: "inspection",
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Tên bước"
              rules={[{ required: true, message: "Vui lòng nhập tên bước!" }]}
            >
              <MemoizedInput placeholder="Nhập tên bước" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="Loại bước"
              rules={[{ required: true, message: "Vui lòng chọn loại bước!" }]}
            >
              <Select placeholder="Chọn loại bước">
                {stepCategories.map((category) => (
                  <Option key={category.value} value={category.value}>
                    <Space>
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
            >
              <MemoizedTextArea rows={2} placeholder="Nhập mô tả bước" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="estimatedTime"
              label="Thời gian ước tính (phút)"
              rules={[{ required: true, message: "Vui lòng nhập thời gian!" }]}
            >
              <MemoizedInputNumber
                min={1}
                placeholder="Nhập thời gian"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
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

        {/* Dụng cụ cần thiết */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              marginBottom: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong>Dụng cụ cần thiết</Text>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => addItem(requiredTools, setRequiredTools)}
            >
              Thêm
            </Button>
          </div>
          <List
            dataSource={requiredTools}
            renderItem={(tool, index) => (
              <List.Item key={index}>
                <Card size="small" style={{ width: "100%" }}>
                  <Row gutter={8} align="middle">
                    <Col span={22}>
                      <MemoizedInput
                        value={tool}
                        onChange={(e) =>
                          updateItem(
                            index,
                            e.target.value,
                            requiredTools,
                            setRequiredTools
                          )
                        }
                        placeholder="Nhập dụng cụ"
                      />
                    </Col>
                    <Col span={2}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() =>
                          removeItem(index, requiredTools, setRequiredTools)
                        }
                      />
                    </Col>
                  </Row>
                </Card>
              </List.Item>
            )}
          />
        </div>

        {/* Vật liệu cần thiết */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              marginBottom: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong>Vật liệu cần thiết</Text>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => addItem(requiredMaterials, setRequiredMaterials)}
            >
              Thêm
            </Button>
          </div>
          <List
            dataSource={requiredMaterials}
            renderItem={(material, index) => (
              <List.Item key={index}>
                <Card size="small" style={{ width: "100%" }}>
                  <Row gutter={8} align="middle">
                    <Col span={22}>
                      <MemoizedInput
                        value={material}
                        onChange={(e) =>
                          updateItem(
                            index,
                            e.target.value,
                            requiredMaterials,
                            setRequiredMaterials
                          )
                        }
                        placeholder="Nhập vật liệu"
                      />
                    </Col>
                    <Col span={2}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() =>
                          removeItem(
                            index,
                            requiredMaterials,
                            setRequiredMaterials
                          )
                        }
                      />
                    </Col>
                  </Row>
                </Card>
              </List.Item>
            )}
          />
        </div>

        {/* Hướng dẫn thực hiện */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              marginBottom: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong>Hướng dẫn thực hiện</Text>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => addItem(instructions, setInstructions)}
            >
              Thêm
            </Button>
          </div>
          <List
            dataSource={instructions}
            renderItem={(instruction, index) => (
              <List.Item key={index}>
                <Card size="small" style={{ width: "100%" }}>
                  <Row gutter={8} align="middle">
                    <Col span={22}>
                      <MemoizedInput
                        value={instruction}
                        onChange={(e) =>
                          updateItem(
                            index,
                            e.target.value,
                            instructions,
                            setInstructions
                          )
                        }
                        placeholder="Nhập hướng dẫn"
                      />
                    </Col>
                    <Col span={2}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() =>
                          removeItem(index, instructions, setInstructions)
                        }
                      />
                    </Col>
                  </Row>
                </Card>
              </List.Item>
            )}
          />
        </div>

        {/* Danh sách kiểm tra chất lượng */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              marginBottom: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong>Danh sách kiểm tra chất lượng</Text>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => addItem(qualityChecklist, setQualityChecklist)}
            >
              Thêm
            </Button>
          </div>
          <List
            dataSource={qualityChecklist}
            renderItem={(item, index) => (
              <List.Item key={index}>
                <Card size="small" style={{ width: "100%" }}>
                  <Row gutter={8} align="middle">
                    <Col span={22}>
                      <MemoizedInput
                        value={item}
                        onChange={(e) =>
                          updateItem(
                            index,
                            e.target.value,
                            qualityChecklist,
                            setQualityChecklist
                          )
                        }
                        placeholder="Nhập tiêu chí kiểm tra"
                      />
                    </Col>
                    <Col span={2}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() =>
                          removeItem(
                            index,
                            qualityChecklist,
                            setQualityChecklist
                          )
                        }
                      />
                    </Col>
                  </Row>
                </Card>
              </List.Item>
            )}
          />
        </div>

        {/* Lưu ý an toàn */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              marginBottom: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong>Lưu ý an toàn</Text>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => addItem(safetyNotes, setSafetyNotes)}
            >
              Thêm
            </Button>
          </div>
          <List
            dataSource={safetyNotes}
            renderItem={(note, index) => (
              <List.Item key={index}>
                <Card size="small" style={{ width: "100%" }}>
                  <Row gutter={8} align="middle">
                    <Col span={22}>
                      <MemoizedInput
                        value={note}
                        onChange={(e) =>
                          updateItem(
                            index,
                            e.target.value,
                            safetyNotes,
                            setSafetyNotes
                          )
                        }
                        placeholder="Nhập lưu ý an toàn"
                      />
                    </Col>
                    <Col span={2}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() =>
                          removeItem(index, safetyNotes, setSafetyNotes)
                        }
                      />
                    </Col>
                  </Row>
                </Card>
              </List.Item>
            )}
          />
        </div>
      </Form>
    </Modal>
  );
};

export default CareProcessModal;
