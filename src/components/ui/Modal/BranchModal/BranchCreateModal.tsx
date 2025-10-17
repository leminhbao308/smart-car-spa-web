"use client";
import React from "react";
import { Modal, Form, Select, Button, message, Space } from "antd";
import {
  MemoizedInput,
  MemoizedTextArea,
} from "@/components/ui/MemoizedComponents";
import { CreateBranchRequest } from "@/lib/api/types/branch.types";
import { BranchService } from "@/lib/api/services/branch.service";

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
        service_slots: 8, // Mặc định 8 slots
        established_date: values.established_date,
        center_id: centerId,
        manager_id: values.manager_id,
        operating_status: values.operating_status || "ACTIVE",
      };

      await BranchService.createBranch(createData);
      message.success("Tạo chi nhánh thành công!");
      form.resetFields();
      onSuccess();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi tạo chi nhánh";
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
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Tạo chi nhánh
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        <Form.Item name="operating_status" label="Trạng thái hoạt động">
          <Select placeholder="Chọn trạng thái" defaultValue="ACTIVE">
            <Select.Option value="ACTIVE">Hoạt động</Select.Option>
            <Select.Option value="INACTIVE">Tạm dừng</Select.Option>
            <Select.Option value="MAINTENANCE">Bảo trì</Select.Option>
          </Select>
        </Form.Item>
        <Space.Compact style={{ width: "100%" }}>
          <Form.Item
            name="branch_name"
            label="Tên chi nhánh"
            rules={[{ required: true, message: "Vui lòng nhập tên chi nhánh" }]}
            style={{ width: "70%", marginRight: 8 }}
          >
            <MemoizedInput placeholder="Nhập tên chi nhánh" />
          </Form.Item>

          <Form.Item
            name="branch_code"
            label="Mã chi nhánh"
            rules={[{ required: true, message: "Vui lòng nhập mã chi nhánh" }]}
            style={{ width: "30%" }}
          >
            <MemoizedInput placeholder="Mã chi nhánh" />
          </Form.Item>
        </Space.Compact>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
        >
          <MemoizedTextArea rows={3} placeholder="Nhập mô tả chi nhánh" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
        >
          <MemoizedTextArea rows={2} placeholder="Nhập địa chỉ chi nhánh" />
        </Form.Item>

        <Space.Compact style={{ width: "100%" }}>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
            style={{ width: "50%", marginRight: 8 }}
          >
            <MemoizedInput placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
            style={{ width: "50%" }}
          >
            <MemoizedInput placeholder="Nhập email" />
          </Form.Item>
        </Space.Compact>

        <Form.Item name="established_date" label="Ngày thành lập">
          <MemoizedInput type="date" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BranchCreateModal;
