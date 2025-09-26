"use client";
import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Button, message, Space } from "antd";
import { BranchDisplay, UpdateBranchRequest } from "@/lib/api/types/branch.types";
import { BranchService } from "@/lib/api/services/branch.service";

const { TextArea } = Input;

interface BranchEditModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  branch: BranchDisplay | null;
  centerId: string | null;
}

const BranchEditModal: React.FC<BranchEditModalProps> = ({
  open,
  onCancel,
  onSuccess,
  branch,
  centerId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (branch && open) {
      form.setFieldsValue({
        branch_name: branch.branch_name,
        description: branch.description,
        address: branch.address,
        phone: branch.phone,
        email: branch.email,
        service_capacity: branch.service_capacity,
        current_workload: branch.current_workload,
        area_sqm: branch.area_sqm,
        parking_spaces: branch.parking_spaces,
        operating_status: branch.operating_status,
        branch_type: branch.branch_type,
        is_active: branch.is_active,
      });
    }
  }, [branch, open, form]);

  const handleSubmit = async () => {
    if (!branch || !centerId) return;

    try {
      setLoading(true);
      const values = await form.validateFields();

      const updateData: UpdateBranchRequest = {
        branch_name: values.branch_name,
        description: values.description,
        address: values.address,
        phone: values.phone,
        email: values.email,
        service_capacity: values.service_capacity,
        current_workload: values.current_workload,
        area_sqm: values.area_sqm,
        parking_spaces: values.parking_spaces,
        operating_status: values.operating_status,
        branch_type: values.branch_type,
        is_active: values.is_active,
      };

      await BranchService.updateBranch(branch.branch_id, updateData);
      message.success("Cập nhật chi nhánh thành công!");
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật chi nhánh";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Chỉnh sửa chi nhánh"
      open={open}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          Cập nhật
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 24 }}
      >
        <Form.Item
          name="branch_name"
          label="Tên chi nhánh"
          rules={[{ required: true, message: "Vui lòng nhập tên chi nhánh" }]}
        >
          <Input placeholder="Nhập tên chi nhánh" />
        </Form.Item>

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
            name="current_workload"
            label="Khối lượng hiện tại"
            rules={[{ required: true, message: "Vui lòng nhập khối lượng" }]}
            style={{ width: "50%" }}
          >
            <InputNumber
              min={0}
              placeholder="Khối lượng"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Space.Compact>

        <Space.Compact style={{ width: "100%" }}>
          <Form.Item
            name="area_sqm"
            label="Diện tích (m²)"
            rules={[{ required: true, message: "Vui lòng nhập diện tích" }]}
            style={{ width: "50%", marginRight: 8 }}
          >
            <InputNumber
              min={1}
              placeholder="Diện tích"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="parking_spaces"
            label="Chỗ đỗ xe"
            rules={[{ required: true, message: "Vui lòng nhập số chỗ đỗ xe" }]}
            style={{ width: "50%" }}
          >
            <InputNumber
              min={0}
              placeholder="Chỗ đỗ xe"
              style={{ width: "100%" }}
            />
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
          name="is_active"
          label="Trạng thái"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select placeholder="Chọn trạng thái">
            <Select.Option value={true}>Kích hoạt</Select.Option>
            <Select.Option value={false}>Vô hiệu hóa</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BranchEditModal;
