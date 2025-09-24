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
  message,
  Space,
  Typography,
  Card,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { vehicleBrandsData } from "@/components/utils/data/vehicle-brands.data";
import { vehicleTypesData } from "@/components/utils/data/vehicle-types.data";
import {
  modelStatuses,
  fuelTypes,
} from "@/components/utils/data/vehicle-models.data";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface VehicleModelAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (model: {
    id: number;
    modelCode: string;
    modelName: string;
    brandId: number;
    brandName: string;
    typeId: number;
    typeName: string;
    year: number;
    generation: string;
    description: string;
    engineOptions: Array<{
      engine: string;
      power: string;
      fuelType: string;
    }>;
    transmissionOptions: string[];
    drivetrainOptions: string[];
    priceRange: string;
    fuelEfficiency: string;
    dimensions: {
      length: string;
      width: string;
      height: string;
      wheelbase: string;
    };
    features: string[];
    colors: string[];
    status: string;
    totalVehicles: number;
    averageRating: number;
    launchDate: string;
    endDate: null;
    competitors: string[];
    targetMarket: string;
    createdAt: string;
    updatedAt: string;
  }) => void;
}

const VehicleModelAddModal: React.FC<VehicleModelAddModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [engineOptions, setEngineOptions] = useState<Array<{
    engine: string;
    power: string;
    fuelType: string;
  }>>([]);
  const [transmissionOptions, setTransmissionOptions] = useState<string[]>([]);
  const [drivetrainOptions, setDrivetrainOptions] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [newEngine, setNewEngine] = useState({
    engine: "",
    power: "",
    fuelType: "",
  });
  const [newTransmission, setNewTransmission] = useState("");
  const [newDrivetrain, setNewDrivetrain] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newCompetitor, setNewCompetitor] = useState("");

  const handleSubmit = async (values: {
    modelName: string;
    modelCode: string;
    brandId: number;
    typeId: number;
    year: number;
    generation: string;
    description: string;
    priceRange: string;
    fuelEfficiency: string;
    dimensions: {
      length: string;
      width: string;
      height: string;
      wheelbase: string;
    };
    targetMarket: string;
    status: string;
  }) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const selectedBrand = vehicleBrandsData.find(
        (b) => b.id === values.brandId
      );
      const selectedType = vehicleTypesData.find((t) => t.id === values.typeId);

      const newModel = {
        id: Date.now(),
        ...values,
        brandName: selectedBrand?.brandName || "",
        typeName: selectedType?.typeName || "",
        engineOptions,
        transmissionOptions,
        drivetrainOptions,
        features,
        colors,
        competitors,
        totalVehicles: 0,
        averageRating: 0,
        launchDate: new Date().toISOString().split("T")[0],
        endDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSuccess(newModel);
      message.success("Thêm model xe thành công!");
      form.resetFields();
      resetArrays();
      onClose();
    } catch {
      message.error("Có lỗi xảy ra khi thêm model xe!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    resetArrays();
    onClose();
  };

  const resetArrays = () => {
    setEngineOptions([]);
    setTransmissionOptions([]);
    setDrivetrainOptions([]);
    setFeatures([]);
    setColors([]);
    setCompetitors([]);
    setNewEngine({ engine: "", power: "", fuelType: "" });
    setNewTransmission("");
    setNewDrivetrain("");
    setNewFeature("");
    setNewColor("");
    setNewCompetitor("");
  };

  const addEngine = () => {
    if (newEngine.engine && newEngine.power && newEngine.fuelType) {
      setEngineOptions([...engineOptions, { ...newEngine }]);
      setNewEngine({ engine: "", power: "", fuelType: "" });
    }
  };

  const removeEngine = (index: number) => {
    setEngineOptions(engineOptions.filter((_, i) => i !== index));
  };

  const addItem = (
    type: string,
    value: string,
    setter: (items: string[] | ((prev: string[]) => string[])) => void,
    setNewValue: (value: string) => void
  ) => {
    if (value.trim()) {
      setter((prev: string[]) => [...prev, value.trim()]);
      setNewValue("");
    }
  };

  const removeItem = (
    type: string,
    value: string,
    setter: (items: string[] | ((prev: string[]) => string[])) => void
  ) => {
    setter((prev: string[]) => prev.filter((item: string) => item !== value));
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PlusOutlined style={{ color: "#1890ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Thêm model xe mới
          </Title>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={1000}
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
          year: new Date().getFullYear(),
        }}
      >
        <Row gutter={[16, 16]}>
          {/* Thông tin cơ bản */}
          <Col span={24}>
            <Card title="Thông tin cơ bản" size="small">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    label="Tên model"
                    name="modelName"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên model!" },
                      { min: 2, message: "Tên model phải có ít nhất 2 ký tự!" },
                    ]}
                  >
                    <Input placeholder="Nhập tên model" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Mã model"
                    name="modelCode"
                    rules={[
                      { required: true, message: "Vui lòng nhập mã model!" },
                      {
                        pattern: /^[A-Z0-9_]+$/,
                        message:
                          "Mã model chỉ được chứa chữ hoa, số và dấu gạch dưới!",
                      },
                    ]}
                  >
                    <Input placeholder="VD: CAMRY, CRV" />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Hãng xe"
                    name="brandId"
                    rules={[
                      { required: true, message: "Vui lòng chọn hãng xe!" },
                    ]}
                  >
                    <Select placeholder="Chọn hãng xe">
                      {vehicleBrandsData.map((brand) => (
                        <Option key={brand.id} value={brand.id}>
                          {brand.brandName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Loại xe"
                    name="typeId"
                    rules={[
                      { required: true, message: "Vui lòng chọn loại xe!" },
                    ]}
                  >
                    <Select placeholder="Chọn loại xe">
                      {vehicleTypesData.map((type) => (
                        <Option key={type.id} value={type.id}>
                          {type.typeName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Năm"
                    name="year"
                    rules={[
                      { required: true, message: "Vui lòng nhập năm!" },
                      {
                        type: "number",
                        min: 1900,
                        max: new Date().getFullYear() + 2,
                        message: "Năm không hợp lệ!",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="VD: 2024"
                      min={1900}
                      max={new Date().getFullYear() + 2}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Thế hệ"
                    name="generation"
                    rules={[
                      { required: true, message: "Vui lòng nhập thế hệ!" },
                    ]}
                  >
                    <Input placeholder="VD: 8th Generation" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Trạng thái"
                    name="status"
                    rules={[
                      { required: true, message: "Vui lòng chọn trạng thái!" },
                    ]}
                  >
                    <Select placeholder="Chọn trạng thái">
                      {modelStatuses.map((status) => (
                        <Option key={status.value} value={status.value}>
                          {status.label}
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
                      placeholder="Nhập mô tả về model xe..."
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Phân khúc giá"
                    name="priceRange"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập phân khúc giá!",
                      },
                    ]}
                  >
                    <Input placeholder="VD: Từ 800 triệu - 1.2 tỷ VNĐ" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Tiêu thụ nhiên liệu"
                    name="fuelEfficiency"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tiêu thụ nhiên liệu!",
                      },
                    ]}
                  >
                    <Input placeholder="VD: 7.8L/100km" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Tùy chọn động cơ */}
          <Col span={24}>
            <Card title="Tùy chọn động cơ" size="small">
              <Row gutter={[8, 8]}>
                <Col span={8}>
                  <Input
                    placeholder="Động cơ (VD: 2.5L 4-Cylinder)"
                    value={newEngine.engine}
                    onChange={(e) =>
                      setNewEngine({ ...newEngine, engine: e.target.value })
                    }
                  />
                </Col>
                <Col span={6}>
                  <Input
                    placeholder="Công suất (VD: 203 HP)"
                    value={newEngine.power}
                    onChange={(e) =>
                      setNewEngine({ ...newEngine, power: e.target.value })
                    }
                  />
                </Col>
                <Col span={6}>
                  <Select
                    placeholder="Loại nhiên liệu"
                    value={newEngine.fuelType}
                    onChange={(value) =>
                      setNewEngine({ ...newEngine, fuelType: value })
                    }
                    style={{ width: "100%" }}
                  >
                    {fuelTypes.map((fuel) => (
                      <Option key={fuel.value} value={fuel.label}>
                        <Space>
                          <span>{fuel.icon}</span>
                          <span>{fuel.label}</span>
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col span={4}>
                  <Button
                    type="primary"
                    onClick={addEngine}
                    style={{ width: "100%" }}
                  >
                    Thêm
                  </Button>
                </Col>
              </Row>
              <div style={{ marginTop: 16 }}>
                {engineOptions.map((engine, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: 8,
                      padding: 8,
                      backgroundColor: "#f9f9f9",
                      borderRadius: 4,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <Text strong>{engine.engine}</Text> - {engine.power} (
                      {engine.fuelType})
                    </div>
                    <Button
                      type="text"
                      danger
                      size="small"
                      onClick={() => removeEngine(index)}
                    >
                      <MinusCircleOutlined />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Hộp số và dẫn động */}
          <Col span={12}>
            <Card title="Hộp số" size="small">
              <div style={{ marginBottom: 8 }}>
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    placeholder="Nhập hộp số"
                    value={newTransmission}
                    onChange={(e) => setNewTransmission(e.target.value)}
                    onPressEnter={() =>
                      addItem(
                        "transmission",
                        newTransmission,
                        setTransmissionOptions,
                        setNewTransmission
                      )
                    }
                  />
                  <Button
                    type="primary"
                    onClick={() =>
                      addItem(
                        "transmission",
                        newTransmission,
                        setTransmissionOptions,
                        setNewTransmission
                      )
                    }
                  >
                    Thêm
                  </Button>
                </Space.Compact>
              </div>
              <div>
                {transmissionOptions.map((transmission) => (
                  <Button
                    key={transmission}
                    size="small"
                    style={{ marginBottom: 4, marginRight: 4 }}
                    onClick={() =>
                      removeItem(
                        "transmission",
                        transmission,
                        setTransmissionOptions
                      )
                    }
                  >
                    {transmission} <MinusCircleOutlined />
                  </Button>
                ))}
              </div>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Dẫn động" size="small">
              <div style={{ marginBottom: 8 }}>
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    placeholder="Nhập dẫn động"
                    value={newDrivetrain}
                    onChange={(e) => setNewDrivetrain(e.target.value)}
                    onPressEnter={() =>
                      addItem(
                        "drivetrain",
                        newDrivetrain,
                        setDrivetrainOptions,
                        setNewDrivetrain
                      )
                    }
                  />
                  <Button
                    type="primary"
                    onClick={() =>
                      addItem(
                        "drivetrain",
                        newDrivetrain,
                        setDrivetrainOptions,
                        setNewDrivetrain
                      )
                    }
                  >
                    Thêm
                  </Button>
                </Space.Compact>
              </div>
              <div>
                {drivetrainOptions.map((drivetrain) => (
                  <Button
                    key={drivetrain}
                    size="small"
                    style={{ marginBottom: 4, marginRight: 4 }}
                    onClick={() =>
                      removeItem("drivetrain", drivetrain, setDrivetrainOptions)
                    }
                  >
                    {drivetrain} <MinusCircleOutlined />
                  </Button>
                ))}
              </div>
            </Card>
          </Col>

          {/* Tính năng và màu sắc */}
          <Col span={12}>
            <Card title="Tính năng" size="small">
              <div style={{ marginBottom: 8 }}>
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    placeholder="Nhập tính năng"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onPressEnter={() =>
                      addItem("feature", newFeature, setFeatures, setNewFeature)
                    }
                  />
                  <Button
                    type="primary"
                    onClick={() =>
                      addItem("feature", newFeature, setFeatures, setNewFeature)
                    }
                  >
                    Thêm
                  </Button>
                </Space.Compact>
              </div>
              <div>
                {features.map((feature) => (
                  <Button
                    key={feature}
                    size="small"
                    style={{ marginBottom: 4, marginRight: 4 }}
                    onClick={() => removeItem("feature", feature, setFeatures)}
                  >
                    {feature} <MinusCircleOutlined />
                  </Button>
                ))}
              </div>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Màu sắc" size="small">
              <div style={{ marginBottom: 8 }}>
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    placeholder="Nhập màu sắc"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    onPressEnter={() =>
                      addItem("color", newColor, setColors, setNewColor)
                    }
                  />
                  <Button
                    type="primary"
                    onClick={() =>
                      addItem("color", newColor, setColors, setNewColor)
                    }
                  >
                    Thêm
                  </Button>
                </Space.Compact>
              </div>
              <div>
                {colors.map((color) => (
                  <Button
                    key={color}
                    size="small"
                    style={{ marginBottom: 4, marginRight: 4 }}
                    onClick={() => removeItem("color", color, setColors)}
                  >
                    {color} <MinusCircleOutlined />
                  </Button>
                ))}
              </div>
            </Card>
          </Col>

          {/* Đối thủ cạnh tranh và thị trường mục tiêu */}
          <Col span={12}>
            <Card title="Đối thủ cạnh tranh" size="small">
              <div style={{ marginBottom: 8 }}>
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    placeholder="Nhập đối thủ"
                    value={newCompetitor}
                    onChange={(e) => setNewCompetitor(e.target.value)}
                    onPressEnter={() =>
                      addItem(
                        "competitor",
                        newCompetitor,
                        setCompetitors,
                        setNewCompetitor
                      )
                    }
                  />
                  <Button
                    type="primary"
                    onClick={() =>
                      addItem(
                        "competitor",
                        newCompetitor,
                        setCompetitors,
                        setNewCompetitor
                      )
                    }
                  >
                    Thêm
                  </Button>
                </Space.Compact>
              </div>
              <div>
                {competitors.map((competitor) => (
                  <Button
                    key={competitor}
                    size="small"
                    style={{ marginBottom: 4, marginRight: 4 }}
                    onClick={() =>
                      removeItem("competitor", competitor, setCompetitors)
                    }
                  >
                    {competitor} <MinusCircleOutlined />
                  </Button>
                ))}
              </div>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Thông tin bổ sung" size="small">
              <Form.Item
                label="Thị trường mục tiêu"
                name="targetMarket"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập thị trường mục tiêu!",
                  },
                ]}
              >
                <Input placeholder="VD: Gia đình, Doanh nhân" />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <div style={{ textAlign: "right", marginTop: 24 }}>
          <Space>
            <Button onClick={handleCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Thêm model xe
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default VehicleModelAddModal;
