import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Switch,
  Button,
  Space,
  Card,
  Row,
  Col,
  Table,
  Tag,
  Typography,
  Divider,
  message,
  Badge,
  Empty} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  DollarOutlined,
  TagOutlined,
  FileTextOutlined} from "@ant-design/icons";
import {
  PriceTable,
  PriceTableService,
  DiscountProgram,
  branchesData,
  discountProgramsData,
  PRICE_TABLE_STATUSES} from "@/components/utils/data/price-table.data";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import { MemoizedInput, MemoizedTextArea, MemoizedInputNumber } from "@/components/ui/MemoizedComponents";

const { Option } = Select;
const { Text } = Typography;

interface PriceTableModalProps {
  open: boolean;
  onOk: (priceTable: PriceTable) => void;
  onCancel: () => void;
  initialData?: PriceTable | null;
  title?: string;
}

const PriceTableModal: React.FC<PriceTableModalProps> = ({
  open,
  onOk,
  onCancel,
  initialData,
  title = "Thêm bảng giá mới"}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<PriceTableService[]>(
    []
  );
  const [selectedDiscountPrograms, setSelectedDiscountPrograms] = useState<
    DiscountProgram[]
  >([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );

  // Mock services data - in real app, this would come from props or API
  const servicesData = [
    {
      id: 1,
      serviceName: "Rửa xe chuyên nghiệp",
      serviceCategory: "Chăm sóc ngoại thất",
      basePrice: 150000,
      priceRanges: [
        {
          id: 1,
          name: "Xe nhỏ (dưới 4.5m)",
          minValue: 0,
          maxValue: 4.5,
          price: 120000,
          description: "Sedan, hatchback, coupe"},
        {
          id: 2,
          name: "Xe trung bình (4.5m - 5m)",
          minValue: 4.5,
          maxValue: 5.0,
          price: 150000,
          description: "SUV, crossover, wagon"},
        {
          id: 3,
          name: "Xe lớn (trên 5m)",
          minValue: 5.0,
          maxValue: 999,
          price: 180000,
          description: "Pickup, van, xe tải nhỏ"},
      ]},
    {
      id: 2,
      serviceName: "Đánh bóng và phủ ceramic",
      serviceCategory: "Chăm sóc ngoại thất",
      basePrice: 500000,
      priceRanges: [
        {
          id: 4,
          name: "Xe nhỏ (dưới 4.5m)",
          minValue: 0,
          maxValue: 4.5,
          price: 400000,
          description: "Sedan, hatchback, coupe"},
        {
          id: 5,
          name: "Xe trung bình (4.5m - 5m)",
          minValue: 4.5,
          maxValue: 5.0,
          price: 500000,
          description: "SUV, crossover, wagon"},
        {
          id: 6,
          name: "Xe lớn (trên 5m)",
          minValue: 5.0,
          maxValue: 999,
          price: 600000,
          description: "Pickup, van, xe tải nhỏ"},
      ]},
    {
      id: 3,
      serviceName: "Thay dầu động cơ",
      serviceCategory: "Bảo dưỡng động cơ",
      basePrice: 300000,
      priceRanges: [
        {
          id: 7,
          name: "Dầu thường (5W-30)",
          minValue: 0,
          maxValue: 0,
          price: 250000,
          description: "Dầu động cơ thông thường"},
        {
          id: 8,
          name: "Dầu cao cấp (0W-20)",
          minValue: 0,
          maxValue: 0,
          price: 350000,
          description: "Dầu động cơ cao cấp"},
        {
          id: 9,
          name: "Dầu tổng hợp (5W-40)",
          minValue: 0,
          maxValue: 0,
          price: 400000,
          description: "Dầu tổng hợp cao cấp"},
      ]},
  ];

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        name: initialData.name,
        code: initialData.code,
        description: initialData.description,
        branchId: initialData.branchId,
        status: initialData.status,
        effectiveDate: initialData.effectiveDate,
        expiryDate: initialData.expiryDate,
        isDefault: initialData.isDefault});
      setSelectedServices(initialData.services);
      setSelectedDiscountPrograms(initialData.discountPrograms);
    } else {
      form.resetFields();
      setSelectedServices([]);
      setSelectedDiscountPrograms([]);
    }
  }, [initialData, form]);

  // Filter available services
  const filteredServices = servicesData.filter((service) => {
    const matchesSearch = service.serviceName
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesCategory =
      !selectedCategory || service.serviceCategory === selectedCategory;
    const notSelected = !selectedServices.some(
      (s) => s.serviceId === service.id
    );

    return matchesSearch && matchesCategory && notSelected;
  });

  // Get unique categories
  const categories = [...new Set(servicesData.map((s) => s.serviceCategory))];

  const handleAddService = (serviceId: number) => {
    const service = servicesData.find((s) => s.id === serviceId);
    if (service) {
      const newService: PriceTableService = {
        id: Date.now(),
        serviceId: service.id,
        serviceName: service.serviceName,
        serviceCategory: service.serviceCategory,
        basePrice: service.basePrice,
        finalPrice: service.basePrice,
        discountPercentage: 0,
        priceRanges: service.priceRanges,
        status: "active"};
      setSelectedServices([...selectedServices, newService]);
    }
  };

  const handleRemoveService = (serviceId: number) => {
    setSelectedServices(
      selectedServices.filter((s) => s.serviceId !== serviceId)
    );
  };

  const handleUpdateServicePrice = (
    serviceId: number,
    field: string,
    value: any
  ) => {
    setSelectedServices(
      selectedServices.map((s) => {
        if (s.serviceId === serviceId) {
          const updated = { ...s, [field]: value };
          if (field === "discountPercentage") {
            updated.finalPrice = Math.round(s.basePrice * (1 - value / 100));
          }
          return updated;
        }
        return s;
      })
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (selectedServices.length === 0) {
        message.error("Vui lòng chọn ít nhất một dịch vụ!");
        return;
      }

      const priceTableData: PriceTable = {
        id: initialData?.id || Date.now(),
        name: values.name,
        code: values.code,
        description: values.description,
        branchId: values.branchId,
        branchName: values.branchId
          ? branchesData.find((b) => b.id === values.branchId)?.name
          : undefined,
        status: values.status,
        effectiveDate: values.effectiveDate,
        expiryDate: values.expiryDate,
        isDefault: values.isDefault || false,
        discountPrograms: selectedDiscountPrograms,
        services: selectedServices,
        createdAt:
          initialData?.createdAt || new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        createdBy: "admin",
        updatedBy: "admin"};

      onOk(priceTableData);
      message.success(
        initialData
          ? "Cập nhật bảng giá thành công!"
          : "Thêm bảng giá thành công!"
      );

      // Reset form
      form.resetFields();
      setSelectedServices([]);
      setSelectedDiscountPrograms([]);
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedServices([]);
    setSelectedDiscountPrograms([]);
    onCancel();
  };

  // Services table columns
  const serviceColumns = [
    {
      title: "Dịch vụ",
      dataIndex: "serviceName",
      key: "serviceName",
      render: (text: string, record: PriceTableService) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.serviceCategory}
          </Text>
        </div>
      )},
    {
      title: "Giá gốc",
      dataIndex: "basePrice",
      key: "basePrice",
      render: (price: number) => (
        <Text strong style={{ color: "#52c41a" }}>
          {formatCurrency(price)}
        </Text>
      )},
    {
      title: "Giảm giá (%)",
      dataIndex: "discountPercentage",
      key: "discountPercentage",
      render: (value: number, record: PriceTableService) => (
        <MemoizedInputNumber
          min={0}
          max={100}
          value={value}
          onChange={(val) =>
            handleUpdateServicePrice(
              record.serviceId,
              "discountPercentage",
              val || 0
            )
          }
          formatter={(value) => `${value}%`}
          parser={(value) => Number(value!.replace("%", ""))}
          size="small"
          style={{ width: 80 }}
        />
      )},
    {
      title: "Giá cuối",
      dataIndex: "finalPrice",
      key: "finalPrice",
      render: (price: number) => (
        <Text strong style={{ color: "#1890ff" }}>
          {formatCurrency(price)}
        </Text>
      )},
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Hoạt động" : "Ngừng hoạt động"}
        </Tag>
      )},
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: PriceTableService) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveService(record.serviceId)}
          size="small"
        />
      )},
  ];

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          {title}
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={1400}
      style={{ top: 20 }}
      styles={{
        body: {
          maxHeight: "85vh",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "16px 24px"}}}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: "active",
          isDefault: false}}
      >
        <Row gutter={[16, 16]}>
          {/* Thông tin cơ bản */}
          <Col span={24}>
            <Card title="Thông tin cơ bản" size="small">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Tên bảng giá"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên bảng giá!"},
                    ]}
                  >
                    <MemoizedInput placeholder="Nhập tên bảng giá" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="code"
                    label="Mã bảng giá"
                    rules={[
                      { required: true, message: "Vui lòng nhập mã bảng giá!" },
                    ]}
                  >
                    <MemoizedInput placeholder="Nhập mã bảng giá" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="description" label="Mô tả">
                    <MemoizedTextArea rows={3} placeholder="Nhập mô tả bảng giá" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="branchId"
                    label="Chi nhánh áp dụng"
                    rules={[
                      { required: true, message: "Vui lòng chọn chi nhánh!" },
                    ]}
                  >
                    <Select placeholder="Chọn chi nhánh" allowClear>
                      <Option value={null}>Toàn hệ thống</Option>
                      {branchesData.map((branch) => (
                        <Option key={branch.id} value={branch.id}>
                          {branch.name} ({branch.code})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="status"
                    label="Trạng thái"
                    rules={[
                      { required: true, message: "Vui lòng chọn trạng thái!" },
                    ]}
                  >
                    <Select placeholder="Chọn trạng thái">
                      {PRICE_TABLE_STATUSES.map((status) => (
                        <Option key={status.value} value={status.value}>
                          {status.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="isDefault"
                    label="Bảng giá mặc định"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="effectiveDate"
                    label="Ngày hiệu lực"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn ngày hiệu lực!"},
                    ]}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="expiryDate" label="Ngày hết hạn">
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Chọn dịch vụ */}
          <Col span={24}>
            <Card
              title={
                <Space>
                  <TagOutlined />
                  Chọn dịch vụ cho bảng giá
                  <Badge
                    count={selectedServices.length}
                    showZero
                    color="#1890ff"
                  />
                </Space>
              }
              size="small"
            >
              <Row gutter={[16, 16]}>
                {/* Bộ lọc */}
                <Col span={24}>
                  <Row gutter={8}>
                    <Col span={8}>
                      <MemoizedInput
                        placeholder="Tìm kiếm dịch vụ..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        prefix={<InfoCircleOutlined />}
                      />
                    </Col>
                    <Col span={8}>
                      <Select
                        placeholder="Chọn danh mục"
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        allowClear
                        style={{ width: "100%" }}
                      >
                        {categories.map((category) => (
                          <Option key={category} value={category}>
                            {category}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col span={8}>
                      <Button
                        onClick={() => {
                          setSearchText("");
                          setSelectedCategory(undefined);
                        }}
                        style={{ width: "100%" }}
                      >
                        Xóa bộ lọc
                      </Button>
                    </Col>
                  </Row>
                </Col>

                {/* Dịch vụ có sẵn */}
                <Col span={12}>
                  <Space style={{ marginBottom: 12 }}>
                    <Text strong>Dịch vụ có sẵn</Text>
                    <Tag color="blue">{filteredServices.length} dịch vụ</Tag>
                  </Space>

                  <div
                    style={{
                      maxHeight: 300,
                      overflowY: "auto",
                      overflowX: "hidden",
                      border: "1px solid #f0f0f0",
                      borderRadius: 8,
                      padding: 8}}
                  >
                    {filteredServices.length > 0 ? (
                      <div>
                        {filteredServices.map((service) => (
                          <Card
                            key={service.id}
                            size="small"
                            hoverable
                            style={{
                              border: "1px solid #e8e8e8",
                              borderRadius: 6,
                              marginBottom: 8}}
                            styles={{
                              body: { padding: 12 }}}
                          >
                            <Row gutter={8}>
                              <Col span={16}>
                                <div>
                                  <Text strong>{service.serviceName}</Text>
                                  <br />
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                  >
                                    {service.serviceCategory}
                                  </Text>
                                  <br />
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                  >
                                    Giá: {formatCurrency(service.basePrice)}
                                  </Text>
                                </div>
                              </Col>
                              <Col span={8} style={{ textAlign: "right" }}>
                                <Button
                                  type="primary"
                                  size="small"
                                  icon={<PlusOutlined />}
                                  onClick={() => handleAddService(service.id)}
                                >
                                  Thêm
                                </Button>
                              </Col>
                            </Row>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Empty
                        description="Không tìm thấy dịch vụ nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </Col>

                {/* Dịch vụ đã chọn */}
                <Col span={12}>
                  <Space style={{ marginBottom: 12 }}>
                    <Text strong>Dịch vụ đã chọn</Text>
                    <Tag color="green">{selectedServices.length} dịch vụ</Tag>
                  </Space>

                  <div
                    style={{
                      maxHeight: 300,
                      overflowY: "auto",
                      overflowX: "hidden",
                      border: "1px solid #f0f0f0",
                      borderRadius: 8,
                      padding: 8}}
                  >
                    {selectedServices.length > 0 ? (
                      <Table
                        dataSource={selectedServices}
                        columns={serviceColumns}
                        pagination={false}
                        size="small"
                        rowKey="serviceId"
                        scroll={{ y: 250 }}
                      />
                    ) : (
                      <Empty
                        description="Chưa có dịch vụ nào được chọn"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Chương trình giảm giá */}
          <Col span={24}>
            <Card
              title={
                <Space>
                  <DollarOutlined />
                  Chương trình giảm giá
                  <Badge
                    count={selectedDiscountPrograms.length}
                    showZero
                    color="#fa8c16"
                  />
                </Space>
              }
              size="small"
            >
              <Select
                mode="multiple"
                placeholder="Chọn chương trình giảm giá"
                value={selectedDiscountPrograms.map((p) => p.id)}
                onChange={(values) => {
                  const programs = discountProgramsData.filter((p) =>
                    values.includes(p.id)
                  );
                  setSelectedDiscountPrograms(programs);
                }}
                style={{ width: "100%" }}
                optionLabelProp="label"
              >
                {discountProgramsData.map((program) => (
                  <Option
                    key={program.id}
                    value={program.id}
                    label={program.name}
                  >
                    <div>
                      <Text strong>{program.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {program.type === "percentage"
                          ? `${program.value}%`
                          : formatCurrency(program.value)}
                      </Text>
                    </div>
                  </Option>
                ))}
              </Select>
            </Card>
          </Col>
        </Row>

        <Divider />

        <div style={{ textAlign: "right" }}>
          <Space>
            <Button onClick={handleCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {initialData ? "Cập nhật" : "Thêm mới"}
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default PriceTableModal;

