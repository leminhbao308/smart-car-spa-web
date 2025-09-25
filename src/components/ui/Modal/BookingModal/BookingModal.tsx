"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  InputNumber,
  Button,
  Space,
  Card,
  Tag,
  Row,
  Col,
  Avatar,
  Typography,
} from "antd";
import {
  CarOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  serviceTypes,
  priorityLevels,
  branches,
  staffMembers,
  availableServices,
} from "@/components/utils/data/bookings.data";
import { formatDurationVer01 } from "@/components/utils/helper/duration.format.helper";
import SlotSelectionModal from "../SlotSelectionModal";
import { branchesData } from "@/components/utils/data/branches.data";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

interface BookingModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (bookingData: any) => void;
  initialData?: any;
  mode?: "create" | "edit";
  loading?: boolean;
}

const BookingModal: React.FC<BookingModalProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
  mode = "create",
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        form.setFieldsValue({
          ...initialData,
          bookingDate: dayjs(initialData.bookingDate),
          bookingTime: dayjs(initialData.bookingTime, "HH:mm"),
          preferredDate: dayjs(initialData.preferredDate),
          preferredTime: dayjs(initialData.preferredTime, "HH:mm"),
        });
        setSelectedServices(initialData.services || []);
        setSelectedStaff(initialData.assignedStaff || []);
        const branch = branches.find((b) => b.id === initialData.branchId);
        setSelectedBranch(branch);
        calculateTotals(initialData.services || []);
      } else {
        form.resetFields();
        setSelectedServices([]);
        setSelectedStaff([]);
        setSelectedBranch(null);
        setTotalPrice(0);
        setTotalDuration(0);
      }
    }
  }, [open, mode, initialData, form]);

  const calculateTotals = (services: any[]) => {
    const price = services.reduce((sum, service) => sum + service.price, 0);
    const duration = services.reduce(
      (sum, service) => sum + service.duration,
      0
    );
    setTotalPrice(price);
    setTotalDuration(duration);
  };

  const handleServiceChange = (serviceIds: number[]) => {
    const services = availableServices.filter((service) =>
      serviceIds.includes(service.id)
    );
    setSelectedServices(services);
    calculateTotals(services);
  };

  const handleStaffChange = (staffIds: number[]) => {
    const staff = staffMembers.filter((member) => staffIds.includes(member.id));
    setSelectedStaff(staff);
  };

  const handleBranchChange = (branchId: number) => {
    const branch = branchesData.find((b) => b.id === branchId);
    setSelectedBranch(branch);
  };

  const handleSelectSlot = (
    slot: any,
    branch: any,
    selectedDateTime: string
  ) => {
    setSelectedSlot({ ...slot, branch, selectedDateTime });
    setSlotModalOpen(false);
  };

  const handleOpenSlotSelection = () => {
    const values = form.getFieldsValue();
    if (!values.bookingDate || !values.bookingTime || !selectedBranch) {
      return;
    }
    setSlotModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const bookingData = {
        ...values,
        services: selectedServices,
        assignedStaff: selectedStaff,
        totalPrice,
        estimatedDuration: totalDuration,
        bookingDate: values.bookingDate.format("YYYY-MM-DD"),
        bookingTime: values.bookingTime.format("HH:mm"),
        preferredDate: values.preferredDate.format("YYYY-MM-DD"),
        preferredTime: values.preferredTime.format("HH:mm"),
      };
      onOk(bookingData);
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CalendarOutlined style={{ color: "#1890ff" }} />
          <span>
            {mode === "create" ? "Đặt lịch chăm sóc xe" : "Chỉnh sửa lịch đặt"}
          </span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {mode === "create" ? "Đặt lịch" : "Cập nhật"}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          priority: "normal",
          status: "pending",
        }}
      >
        <Row gutter={16}>
          {/* Thông tin khách hàng */}
          <Col span={12}>
            <Card
              size="small"
              title="Thông tin khách hàng"
              style={{ marginBottom: 16 }}
            >
              <Form.Item
                name="customerName"
                label="Tên khách hàng"
                rules={[
                  { required: true, message: "Vui lòng nhập tên khách hàng" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nhập tên khách hàng"
                />
              </Form.Item>

              <Form.Item
                name="customerPhone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: "Số điện thoại không hợp lệ",
                  },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>

              <Form.Item
                name="customerEmail"
                label="Email"
                rules={[{ type: "email", message: "Email không hợp lệ" }]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Card>
          </Col>

          {/* Thông tin xe */}
          <Col span={12}>
            <Card
              size="small"
              title="Thông tin xe"
              style={{ marginBottom: 16 }}
            >
              <Form.Item
                name="licensePlate"
                label="Biển số xe"
                rules={[
                  { required: true, message: "Vui lòng nhập biển số xe" },
                ]}
              >
                <Input prefix={<CarOutlined />} placeholder="Nhập biển số xe" />
              </Form.Item>

              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item
                    name="brand"
                    label="Hãng xe"
                    rules={[
                      { required: true, message: "Vui lòng chọn hãng xe" },
                    ]}
                  >
                    <Select placeholder="Chọn hãng xe">
                      <Option value="Toyota">Toyota</Option>
                      <Option value="Honda">Honda</Option>
                      <Option value="Mazda">Mazda</Option>
                      <Option value="BMW">BMW</Option>
                      <Option value="Mercedes">Mercedes</Option>
                      <Option value="Audi">Audi</Option>
                      <Option value="Lexus">Lexus</Option>
                      <Option value="Porsche">Porsche</Option>
                      <Option value="Hyundai">Hyundai</Option>
                      <Option value="Ford">Ford</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="model"
                    label="Model"
                    rules={[{ required: true, message: "Vui lòng nhập model" }]}
                  >
                    <Input placeholder="Nhập model" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item
                    name="year"
                    label="Năm sản xuất"
                    rules={[
                      { required: true, message: "Vui lòng nhập năm sản xuất" },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={1990}
                      max={2024}
                      placeholder="Năm"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="color"
                    label="Màu sắc"
                    rules={[
                      { required: true, message: "Vui lòng nhập màu sắc" },
                    ]}
                  >
                    <Input placeholder="Nhập màu sắc" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Dịch vụ */}
          <Col span={12}>
            <Card size="small" title="Dịch vụ" style={{ marginBottom: 16 }}>
              <Form.Item
                name="serviceType"
                label="Loại dịch vụ"
                rules={[
                  { required: true, message: "Vui lòng chọn loại dịch vụ" },
                ]}
              >
                <Select placeholder="Chọn loại dịch vụ">
                  {serviceTypes.map((service) => (
                    <Option key={service.value} value={service.value}>
                      <Space>
                        <span>{service.icon}</span>
                        <span>{service.label}</span>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="services"
                label="Dịch vụ chi tiết"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất một dịch vụ",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn dịch vụ"
                  onChange={handleServiceChange}
                  optionLabelProp="label"
                >
                  {availableServices.map((service) => (
                    <Option
                      key={service.id}
                      value={service.id}
                      label={service.name}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>{service.name}</span>
                        <span style={{ color: "#52c41a", fontWeight: 500 }}>
                          {service.price.toLocaleString()} VNĐ
                        </span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedServices.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Text strong>Dịch vụ đã chọn:</Text>
                  <div style={{ marginTop: 4 }}>
                    {selectedServices.map((service) => (
                      <Tag
                        key={service.id}
                        color="blue"
                        style={{ marginBottom: 4 }}
                      >
                        {service.name} - {service.price.toLocaleString()} VNĐ
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </Col>

          {/* Thời gian và địa điểm */}
          <Col span={12}>
            <Card
              size="small"
              title="Thời gian và địa điểm"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item
                    name="bookingDate"
                    label="Ngày đặt lịch"
                    rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Chọn ngày"
                      disabledDate={(current) =>
                        current && current < dayjs().startOf("day")
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="bookingTime"
                    label="Giờ đặt lịch"
                    rules={[{ required: true, message: "Vui lòng chọn giờ" }]}
                  >
                    <TimePicker
                      style={{ width: "100%" }}
                      format="HH:mm"
                      placeholder="Chọn giờ"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="branchId"
                label="Chi nhánh"
                rules={[{ required: true, message: "Vui lòng chọn chi nhánh" }]}
              >
                <Select
                  placeholder="Chọn chi nhánh"
                  optionLabelProp="label"
                  onChange={handleBranchChange}
                  showSearch
                  filterOption={(input, option) => {
                    const childrenText =
                      typeof option?.children === "string"
                        ? option.children
                        : "";
                    const labelText =
                      typeof option?.label === "string" ? option.label : "";
                    return (
                      childrenText
                        .toLowerCase()
                        .includes(input.toLowerCase()) ||
                      labelText.toLowerCase().includes(input.toLowerCase())
                    );
                  }}
                >
                  {branches.map((branch) => (
                    <Option
                      key={branch.id}
                      value={branch.id}
                      label={branch.name}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          maxWidth: "100%",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 500,
                            marginBottom: 2,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {branch.name}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#666",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "250px",
                          }}
                        >
                          {branch.address}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedBranch && (
                <div
                  style={{
                    marginTop: 8,
                    padding: 8,
                    backgroundColor: "#f6ffed",
                    border: "1px solid #b7eb8f",
                    borderRadius: 4,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <EnvironmentOutlined style={{ color: "#52c41a" }} />
                      <Text strong style={{ color: "#52c41a" }}>
                        Chi nhánh đã chọn:
                      </Text>
                    </div>
                    <Button
                      type="primary"
                      size="small"
                      onClick={handleOpenSlotSelection}
                      disabled={
                        !form.getFieldValue("bookingDate") ||
                        !form.getFieldValue("bookingTime")
                      }
                    >
                      Chọn slot
                    </Button>
                  </div>
                  <div style={{ fontSize: 13, color: "#666" }}>
                    <div style={{ fontWeight: 500, marginBottom: 2 }}>
                      {selectedBranch.name}
                    </div>
                    <div>{selectedBranch.address}</div>
                    <div style={{ marginTop: 2 }}>
                      <PhoneOutlined style={{ marginRight: 4 }} />
                      {selectedBranch.phone}
                    </div>
                    {selectedBranch.totalSlots && (
                      <div style={{ marginTop: 2, display: "flex", gap: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Slot trống: {selectedBranch.availableSlots}/
                          {selectedBranch.totalSlots}
                        </Text>
                      </div>
                    )}
                  </div>
                  {selectedSlot && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: 8,
                        backgroundColor: "#e6f7ff",
                        borderRadius: 4,
                      }}
                    >
                      <Text strong style={{ color: "#1890ff" }}>
                        Slot đã chọn: {selectedSlot.name} (
                        {selectedSlot.type === "basic"
                          ? "Cơ bản"
                          : selectedSlot.type === "premium"
                          ? "Cao cấp"
                          : "VIP"}
                        )
                      </Text>
                    </div>
                  )}
                </div>
              )}

              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item
                    name="priority"
                    label="Mức độ ưu tiên"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn mức độ ưu tiên",
                      },
                    ]}
                  >
                    <Select placeholder="Chọn mức độ ưu tiên">
                      {priorityLevels.map((priority) => (
                        <Option key={priority.value} value={priority.value}>
                          <Space>
                            <span>{priority.icon}</span>
                            <span>{priority.label}</span>
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    label="Trạng thái"
                    rules={[
                      { required: true, message: "Vui lòng chọn trạng thái" },
                    ]}
                  >
                    <Select placeholder="Chọn trạng thái">
                      <Option value="pending">Chờ xác nhận</Option>
                      <Option value="confirmed">Đã xác nhận</Option>
                      <Option value="in_progress">Đang thực hiện</Option>
                      <Option value="completed">Hoàn thành</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Nhân viên */}
          <Col span={12}>
            <Card
              size="small"
              title="Nhân viên phụ trách"
              style={{ marginBottom: 16 }}
            >
              <Form.Item name="assignedStaff" label="Chọn nhân viên">
                <Select
                  mode="multiple"
                  placeholder="Chọn nhân viên"
                  onChange={handleStaffChange}
                  optionLabelProp="label"
                >
                  {staffMembers.map((staff) => (
                    <Option key={staff.id} value={staff.id} label={staff.name}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Avatar
                          size="small"
                          style={{ backgroundColor: "#1890ff" }}
                        >
                          {staff.name.charAt(0)}
                        </Avatar>
                        <div>
                          <div style={{ fontWeight: 500 }}>{staff.name}</div>
                          <div style={{ fontSize: 12, color: "#666" }}>
                            {staff.role}
                          </div>
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedStaff.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Text strong>Nhân viên đã chọn:</Text>
                  <div style={{ marginTop: 4 }}>
                    {selectedStaff.map((staff) => (
                      <Tag
                        key={staff.id}
                        color="green"
                        style={{ marginBottom: 4 }}
                      >
                        {staff.name} - {staff.role}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </Col>

          {/* Tổng kết */}
          <Col span={12}>
            <Card size="small" title="Tổng kết" style={{ marginBottom: 16 }}>
              <Row gutter={8}>
                <Col span={12}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: 8,
                      backgroundColor: "#f0f0f0",
                      borderRadius: 4,
                    }}
                  >
                    <DollarOutlined
                      style={{ color: "#52c41a", fontSize: 20 }}
                    />
                    <div style={{ marginTop: 4 }}>
                      <Text strong style={{ color: "#52c41a" }}>
                        {totalPrice.toLocaleString()} VNĐ
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Tổng giá
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: 8,
                      backgroundColor: "#f0f0f0",
                      borderRadius: 4,
                    }}
                  >
                    <ClockCircleOutlined
                      style={{ color: "#1890ff", fontSize: 20 }}
                    />
                    <div style={{ marginTop: 4 }}>
                      <Text strong style={{ color: "#1890ff" }}>
                        {formatDurationVer01(totalDuration)}
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Thời gian
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Ghi chú và yêu cầu đặc biệt */}
        <Card size="small" title="Ghi chú và yêu cầu đặc biệt">
          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={3} placeholder="Nhập ghi chú cho lịch đặt..." />
          </Form.Item>

          <Form.Item name="specialRequests" label="Yêu cầu đặc biệt">
            <Select
              mode="tags"
              placeholder="Nhập yêu cầu đặc biệt (có thể thêm nhiều)"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Card>
      </Form>

      <SlotSelectionModal
        open={slotModalOpen}
        onCancel={() => setSlotModalOpen(false)}
        onSelectSlot={handleSelectSlot}
        branch={selectedBranch}
        selectedDate={
          form.getFieldValue("bookingDate")?.format("YYYY-MM-DD") || ""
        }
        selectedTime={form.getFieldValue("bookingTime")?.format("HH:mm") || ""}
        estimatedDuration={totalDuration}
      />
    </Modal>
  );
};

export default BookingModal;
