"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Row,
  Col,
  TimePicker,
  Button,
  Space,
  Divider,
  message,
} from "antd";
import {
  MemoizedInput,
  MemoizedTextArea,
  MemoizedInputNumber,
} from "@/components/ui/MemoizedComponents";

import dayjs from "dayjs";
import {
  Branch,
  branchStatuses,
  branchServices,
  branchFacilities,
} from "@/components/utils/data/branches.data";

const { Option } = Select;

interface BranchModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (data: Branch) => void;
  initialData?: Branch | null;
  title?: string;
}

const BranchModal: React.FC<BranchModalProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
  title = "Thêm chi nhánh mới",
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        openingHours: {
          weekdays: initialData.openingHours.weekdays
            .split(" - ")
            .map((time: string) => dayjs(time, "HH:mm")),
          weekends: initialData.openingHours.weekends
            .split(" - ")
            .map((time: string) => dayjs(time, "HH:mm")),
        },
      });
    } else {
      form.resetFields();
    }
  }, [initialData, form]);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Format opening hours
      const formattedData = {
        ...values,
        openingHours: {
          weekdays: `${values.openingHours.weekdays[0].format(
            "HH:mm"
          )} - ${values.openingHours.weekdays[1].format("HH:mm")}`,
          weekends: `${values.openingHours.weekends[0].format(
            "HH:mm"
          )} - ${values.openingHours.weekends[1].format("HH:mm")}`,
        },
        id: initialData?.id || Date.now(),
        currentBookings: initialData?.currentBookings || 0,
        establishedDate:
          initialData?.establishedDate || dayjs().format("YYYY-MM-DD"),
        careSlots: initialData?.careSlots || [],
        totalSlots: initialData?.totalSlots || 0,
        availableSlots: initialData?.availableSlots || 0,
      };

      onOk(formattedData);
      message.success(
        initialData
          ? "Cập nhật chi nhánh thành công!"
          : "Thêm chi nhánh thành công!"
      );
      form.resetFields();
    } catch (error) {
      console.log("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const normFile = (e: { fileList?: unknown[] } | unknown[]) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const tabItems = [
    {
      key: "basic",
      label: "Thông tin cơ bản",
      children: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Tên chi nhánh"
              rules={[
                { required: true, message: "Vui lòng nhập tên chi nhánh!" },
              ]}
            >
              <MemoizedInput placeholder="Nhập tên chi nhánh" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select placeholder="Chọn trạng thái">
                {branchStatuses.map((status) => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="address"
              label="Địa chỉ"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
            >
              <MemoizedInput placeholder="Nhập địa chỉ chi nhánh" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: /^[0-9\-\+\(\)\s]+$/,
                  message: "Số điện thoại không hợp lệ!",
                },
              ]}
            >
              <MemoizedInput placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <MemoizedInput placeholder="Nhập email" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="manager"
              label="Quản lý chi nhánh"
              rules={[
                { required: true, message: "Vui lòng nhập tên quản lý!" },
              ]}
            >
              <MemoizedInput placeholder="Nhập tên quản lý" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="capacity"
              label="Sức chứa"
              rules={[{ required: true, message: "Vui lòng nhập sức chứa!" }]}
            >
              <MemoizedInputNumber
                min={1}
                max={1000}
                placeholder="Nhập sức chứa"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="description" label="Mô tả">
              <MemoizedTextArea rows={3} placeholder="Nhập mô tả chi nhánh" />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: "hours",
      label: "Giờ hoạt động",
      children: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={["openingHours", "weekdays"]}
              label="Giờ hoạt động ngày thường"
              rules={[
                { required: true, message: "Vui lòng chọn giờ hoạt động!" },
              ]}
            >
              <TimePicker.RangePicker
                format="HH:mm"
                style={{ width: "100%" }}
                placeholder={["Giờ mở cửa", "Giờ đóng cửa"]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={["openingHours", "weekends"]}
              label="Giờ hoạt động cuối tuần"
              rules={[
                { required: true, message: "Vui lòng chọn giờ hoạt động!" },
              ]}
            >
              <TimePicker.RangePicker
                format="HH:mm"
                style={{ width: "100%" }}
                placeholder={["Giờ mở cửa", "Giờ đóng cửa"]}
              />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: "services",
      label: "Dịch vụ & Tiện ích",
      children: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="services"
              label="Dịch vụ cung cấp"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ít nhất một dịch vụ!",
                },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn các dịch vụ"
                style={{ width: "100%" }}
              >
                {branchServices.map((service) => (
                  <Option key={service} value={service}>
                    {service}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="facilities" label="Tiện ích có sẵn">
              <Select
                mode="multiple"
                placeholder="Chọn các tiện ích"
                style={{ width: "100%" }}
              >
                {branchFacilities.map((facility) => (
                  <Option key={facility} value={facility}>
                    {facility}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      ),
    },
  ];

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
          status: "active",
          services: [],
          facilities: [],
          certifications: [],
          careSlots: [],
          totalSlots: 0,
          availableSlots: 0,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
            {tabItems.map((tab) => (
              <Button
                key={tab.key}
                type={activeTab === tab.key ? "primary" : "default"}
                onClick={() => setActiveTab(tab.key)}
                size="small"
              >
                {tab.label}
              </Button>
            ))}
          </Space>
        </div>

        <Divider />

        {tabItems.find((tab) => tab.key === activeTab)?.children}
      </Form>
    </Modal>
  );
};

export default BranchModal;
