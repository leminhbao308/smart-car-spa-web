"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Space,
  Row,
  Col,
  Card,
  Upload,
  Tabs,
  TimePicker,
} from "antd";
import type { TabsProps } from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  CenterInfo,
  centerStatuses,
} from "@/components/utils/data/center-info.data";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

interface CenterInfoFormProps {
  open: boolean;
  onCancel: () => void;
  onOk: (centerInfo: CenterInfo) => void;
  initialData?: CenterInfo;
  loading?: boolean;
}

const CenterInfoForm: React.FC<CenterInfoFormProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          ...initialData,
          businessHours: {
            weekdays: {
              open: dayjs(initialData.businessHours.weekdays.open, "HH:mm"),
              close: dayjs(initialData.businessHours.weekdays.close, "HH:mm"),
            },
            weekends: {
              open: dayjs(initialData.businessHours.weekends.open, "HH:mm"),
              close: dayjs(initialData.businessHours.weekends.close, "HH:mm"),
            },
          },
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const centerInfo: CenterInfo = {
        ...values,
        businessHours: {
          weekdays: {
            open: values.businessHours.weekdays.open.format("HH:mm"),
            close: values.businessHours.weekdays.close.format("HH:mm"),
          },
          weekends: {
            open: values.businessHours.weekends.open.format("HH:mm"),
            close: values.businessHours.weekends.close.format("HH:mm"),
          },
          holidays: values.businessHours.holidays,
        },
        id: initialData?.id || 1,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onOk(centerInfo);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const normFile = (e: { fileList?: unknown[] } | unknown[]) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const tabItems: TabsProps["items"] = [
    {
      key: "basic",
      label: "Thông tin cơ bản",
      children: (
        <Row gutter={16}>
          <Col span={12}>
            <Card
              size="small"
              title="Thông tin chung"
              style={{ marginBottom: 16 }}
            >
              <Form.Item
                name="name"
                label="Tên trung tâm"
                rules={[
                  { required: true, message: "Vui lòng nhập tên trung tâm" },
                ]}
              >
                <Input placeholder="Nhập tên trung tâm" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
              >
                <TextArea rows={3} placeholder="Nhập mô tả về trung tâm" />
              </Form.Item>

              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item
                    name="establishedYear"
                    label="Năm thành lập"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập năm thành lập",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={1900}
                      max={2024}
                      placeholder="Năm"
                    />
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
                      {centerStatuses.map((status) => (
                        <Option key={status.value} value={status.value}>
                          <span style={{ color: status.color }}>●</span>{" "}
                          {status.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="logo"
                label="Logo"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload
                  name="logo"
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={() => false}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload Logo</div>
                  </div>
                </Upload>
              </Form.Item>
            </Card>
          </Col>

          <Col span={12}>
            <Card
              size="small"
              title="Thông tin pháp lý"
              style={{ marginBottom: 16 }}
            >
              <Form.Item
                name="licenseNumber"
                label="Số giấy phép kinh doanh"
                rules={[
                  { required: true, message: "Vui lòng nhập số giấy phép" },
                ]}
              >
                <Input placeholder="Nhập số giấy phép kinh doanh" />
              </Form.Item>

              <Form.Item
                name="taxCode"
                label="Mã số thuế"
                rules={[
                  { required: true, message: "Vui lòng nhập mã số thuế" },
                ]}
              >
                <Input placeholder="Nhập mã số thuế" />
              </Form.Item>

              <Form.Item
                name="website"
                label="Website"
                rules={[{ type: "url", message: "URL không hợp lệ" }]}
              >
                <Input placeholder="https://example.com" />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "contact",
      label: "Thông tin liên hệ",
      children: (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Card size="small" title="Địa chỉ" style={{ marginBottom: 16 }}>
                <Form.Item
                  name={["address", "street"]}
                  label="Đường/Số nhà"
                  rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                >
                  <Input placeholder="Nhập địa chỉ" />
                </Form.Item>

                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item
                      name={["address", "ward"]}
                      label="Phường/Xã"
                      rules={[
                        { required: true, message: "Vui lòng nhập phường/xã" },
                      ]}
                    >
                      <Input placeholder="Phường/Xã" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={["address", "district"]}
                      label="Quận/Huyện"
                      rules={[
                        { required: true, message: "Vui lòng nhập quận/huyện" },
                      ]}
                    >
                      <Input placeholder="Quận/Huyện" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item
                      name={["address", "city"]}
                      label="Tỉnh/Thành phố"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập tỉnh/thành phố",
                        },
                      ]}
                    >
                      <Input placeholder="Tỉnh/Thành phố" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={["address", "postalCode"]}
                      label="Mã bưu điện"
                    >
                      <Input placeholder="Mã bưu điện" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name={["address", "country"]}
                  label="Quốc gia"
                  initialValue="Việt Nam"
                >
                  <Input placeholder="Quốc gia" />
                </Form.Item>
              </Card>
            </Col>

            <Col span={12}>
              <Card size="small" title="Liên hệ" style={{ marginBottom: 16 }}>
                <Form.Item
                  name="phone"
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
                  name="hotline"
                  label="Hotline"
                  rules={[
                    { required: true, message: "Vui lòng nhập hotline" },
                    {
                      pattern: /^[0-9]{10,11}$/,
                      message: "Hotline không hợp lệ",
                    },
                  ]}
                >
                  <Input placeholder="Nhập hotline" />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input placeholder="Nhập email" />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <Card size="small" title="Giờ làm việc">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name={["businessHours", "weekdays", "open"]}
                  label="Giờ mở cửa (Thứ 2-6)"
                  rules={[
                    { required: true, message: "Vui lòng chọn giờ mở cửa" },
                  ]}
                >
                  <TimePicker
                    style={{ width: "100%" }}
                    format="HH:mm"
                    placeholder="Chọn giờ"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name={["businessHours", "weekdays", "close"]}
                  label="Giờ đóng cửa (Thứ 2-6)"
                  rules={[
                    { required: true, message: "Vui lòng chọn giờ đóng cửa" },
                  ]}
                >
                  <TimePicker
                    style={{ width: "100%" }}
                    format="HH:mm"
                    placeholder="Chọn giờ"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name={["businessHours", "holidays"]}
                  label="Ngày nghỉ lễ"
                >
                  <Input placeholder="Mô tả ngày nghỉ lễ" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={["businessHours", "weekends", "open"]}
                  label="Giờ mở cửa (Thứ 7-CN)"
                  rules={[
                    { required: true, message: "Vui lòng chọn giờ mở cửa" },
                  ]}
                >
                  <TimePicker
                    style={{ width: "100%" }}
                    format="HH:mm"
                    placeholder="Chọn giờ"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={["businessHours", "weekends", "close"]}
                  label="Giờ đóng cửa (Thứ 7-CN)"
                  rules={[
                    { required: true, message: "Vui lòng chọn giờ đóng cửa" },
                  ]}
                >
                  <TimePicker
                    style={{ width: "100%" }}
                    format="HH:mm"
                    placeholder="Chọn giờ"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </>
      ),
    },
    {
      key: "bank",
      label: "Thông tin ngân hàng",
      children: (
        <Card size="small" title="Thông tin tài khoản ngân hàng">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={["bankInfo", "bankName"]}
                label="Tên ngân hàng"
                rules={[
                  { required: true, message: "Vui lòng nhập tên ngân hàng" },
                ]}
              >
                <Input placeholder="Nhập tên ngân hàng" />
              </Form.Item>

              <Form.Item
                name={["bankInfo", "accountNumber"]}
                label="Số tài khoản"
                rules={[
                  { required: true, message: "Vui lòng nhập số tài khoản" },
                ]}
              >
                <Input placeholder="Nhập số tài khoản" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={["bankInfo", "accountHolder"]}
                label="Chủ tài khoản"
                rules={[
                  { required: true, message: "Vui lòng nhập chủ tài khoản" },
                ]}
              >
                <Input placeholder="Nhập tên chủ tài khoản" />
              </Form.Item>

              <Form.Item
                name={["bankInfo", "branch"]}
                label="Chi nhánh"
                rules={[{ required: true, message: "Vui lòng nhập chi nhánh" }]}
              >
                <Input placeholder="Nhập chi nhánh" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SaveOutlined style={{ color: "#1890ff" }} />
          <span>
            {initialData
              ? "Cập nhật thông tin trung tâm"
              : "Thêm thông tin trung tâm"}
          </span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      width={1200}
      footer={[
        <Button key="cancel" icon={<CloseOutlined />} onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SaveOutlined />}
          loading={loading}
          onClick={handleSubmit}
        >
          {initialData ? "Cập nhật" : "Thêm mới"}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "active",
        }}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Form>
    </Modal>
  );
};

export default CenterInfoForm;
