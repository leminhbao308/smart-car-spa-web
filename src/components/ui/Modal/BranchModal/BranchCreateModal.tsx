"use client";
import React from "react";
import { Modal, Form, Input, InputNumber, Select, Button, message, Space } from "antd";
import { CreateBranchRequest } from "@/lib/api/types/branch.types";
import { BranchService } from "@/lib/api/services/branch.service";

const { TextArea } = Input;

interface BranchCreateModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  centerId: string | null;
}

const BranchCreateModal: React.FC<BranchCreateModalProps> = ({
  open,
  onCancel,
  onSuccess,
  centerId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    if (!centerId) {
      message.error("Không tìm thấy thông tin trung tâm");
      return;
    }

    try {
      setLoading(true);
      const values = await form.validateFields();

      const createData: CreateBranchRequest = {
        branch_name: values.branch_name,
        branch_code: values.branch_code,
        description: values.description,
        address: values.address,
        phone: values.phone,
        email: values.email,
        service_capacity: values.service_capacity,
        latitude: values.latitude || 0,
        longitude: values.longitude || 0,
        area_sqm: values.area_sqm,
        parking_spaces: values.parking_spaces,
        established_date: values.established_date,
        center_id: centerId,
        operating_status: values.operating_status,
        branch_type: values.branch_type,
        operating_hours: JSON.stringify({
          monday: { open: "08:00", close: "20:00" },
          tuesday: { open: "08:00", close: "20:00" },
          wednesday: { open: "08:00", close: "20:00" },
          thursday: { open: "08:00", close: "20:00" },
          friday: { open: "08:00", close: "20:00" },
          saturday: { open: "08:00", close: "18:00" },
          sunday: { open: "09:00", close: "17:00" },
        }),
        contact_info: JSON.stringify({
          emergency_phone: values.emergency_phone || "",
          support_email: values.support_email || "",
          manager_phone: values.manager_phone || "",
        }),
        facilities: JSON.stringify([
          "Rửa xe tự động",
          "Rửa xe thủ công",
          "Hút bụi",
          "Đánh bóng",
          "Sửa chữa cơ bản",
          "Thay dầu",
          "Kiểm tra tổng thể"
        ]),
        services_offered: JSON.stringify([
          "Rửa xe ngoài",
          "Rửa xe trong",
          "Đánh bóng xe",
          "Hút bụi nội thất",
          "Thay dầu động cơ",
          "Kiểm tra lốp",
          "Sửa chữa cơ bản"
        ]),
      };

      await BranchService.createBranch(createData);
      message.success("Tạo chi nhánh thành công!");
      form.resetFields();
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo chi nhánh";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Thêm chi nhánh mới"
      open={open}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          Tạo chi nhánh
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 24 }}
      >
        <Space.Compact style={{ width: "100%" }}>
          <Form.Item
            name="branch_name"
            label="Tên chi nhánh"
            rules={[{ required: true, message: "Vui lòng nhập tên chi nhánh" }]}
            style={{ width: "70%", marginRight: 8 }}
          >
            <Input placeholder="Nhập tên chi nhánh" />
          </Form.Item>

          <Form.Item
            name="branch_code"
            label="Mã chi nhánh"
            rules={[{ required: true, message: "Vui lòng nhập mã chi nhánh" }]}
            style={{ width: "30%" }}
          >
            <Input placeholder="Mã chi nhánh" />
          </Form.Item>
        </Space.Compact>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
        >
          <TextArea rows={3} placeholder="Nhập mô tả chi nhánh" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
        >
          <TextArea rows={2} placeholder="Nhập địa chỉ chi nhánh" />
        </Form.Item>

        <Space.Compact style={{ width: "100%" }}>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
            style={{ width: "50%", marginRight: 8 }}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" }
            ]}
            style={{ width: "50%" }}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>
        </Space.Compact>

        <Space.Compact style={{ width: "100%" }}>
          <Form.Item
            name="service_capacity"
            label="Công suất dịch vụ"
            rules={[{ required: true, message: "Vui lòng nhập công suất" }]}
            style={{ width: "50%", marginRight: 8 }}
          >
            <InputNumber
              min={1}
              placeholder="Công suất"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="area_sqm"
            label="Diện tích (m²)"
            rules={[{ required: true, message: "Vui lòng nhập diện tích" }]}
            style={{ width: "50%" }}
          >
            <InputNumber
              min={1}
              placeholder="Diện tích"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Space.Compact>

        <Space.Compact style={{ width: "100%" }}>
          <Form.Item
            name="parking_spaces"
            label="Chỗ đỗ xe"
            rules={[{ required: true, message: "Vui lòng nhập số chỗ đỗ xe" }]}
            style={{ width: "50%", marginRight: 8 }}
          >
            <InputNumber
              min={0}
              placeholder="Chỗ đỗ xe"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="established_date"
            label="Ngày thành lập"
            rules={[{ required: true, message: "Vui lòng chọn ngày thành lập" }]}
            style={{ width: "50%" }}
          >
            <Input type="date" />
          </Form.Item>
        </Space.Compact>

        <Space.Compact style={{ width: "100%" }}>
          <Form.Item
            name="operating_status"
            label="Trạng thái hoạt động"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            style={{ width: "50%", marginRight: 8 }}
          >
            <Select placeholder="Chọn trạng thái">
              <Select.Option value="ACTIVE">Hoạt động</Select.Option>
              <Select.Option value="INACTIVE">Tạm dừng</Select.Option>
              <Select.Option value="MAINTENANCE">Bảo trì</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="branch_type"
            label="Loại chi nhánh"
            rules={[{ required: true, message: "Vui lòng chọn loại chi nhánh" }]}
            style={{ width: "50%" }}
          >
            <Select placeholder="Chọn loại chi nhánh">
              <Select.Option value="STANDARD">Standard</Select.Option>
              <Select.Option value="PREMIUM">Premium</Select.Option>
              <Select.Option value="VIP">VIP</Select.Option>
            </Select>
          </Form.Item>
        </Space.Compact>

        <Form.Item
          name="emergency_phone"
          label="Số điện thoại khẩn cấp"
        >
          <Input placeholder="Nhập số điện thoại khẩn cấp" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BranchCreateModal;
