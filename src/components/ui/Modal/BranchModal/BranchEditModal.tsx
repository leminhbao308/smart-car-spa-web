"use client";
import React, { useEffect } from "react";
import { Modal, Form, Select, Button, message, Space } from "antd";
import {
  MemoizedInput,
  MemoizedTextArea,
  MemoizedInputNumber,
} from "@/components/ui/MemoizedComponents";
import {
  BranchDisplay,
  UpdateBranchRequest,
} from "@/lib/api/types/branch.types";
import { BranchService } from "@/lib/api/services/branch.service";

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
        branch_code: branch.branch_code,
        description: branch.description,
        address: branch.address,
        phone: branch.phone,
        email: branch.email,
        service_slots: branch.service_slots,
        established_date: branch.established_date,
        center_id: branch.center_id,
        manager_id: branch.manager_id,
        operating_status: branch.operating_status,
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
        branch_code: values.branch_code,
        description: values.description,
        address: values.address,
        phone: values.phone,
        email: values.email,
        service_slots: values.service_slots,
        established_date: values.established_date,
        center_id: values.center_id,
        manager_id: values.manager_id,
        operating_status: values.operating_status,
        is_active: values.is_active,
      };

      await BranchService.updateBranch(branch.branch_id, updateData);
      message.success("Cập nhật chi nhánh thành công!");
      onSuccess();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi cập nhật chi nhánh";
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
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Cập nhật
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
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

        <Space.Compact style={{ width: "100%" }}>
          <Form.Item
            name="service_slots"
            label="Số lượng khu vực dịch vụ"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng khu vực" },
            ]}
            style={{ width: "50%", marginRight: 8 }}
          >
            <MemoizedInputNumber
              min={1}
              max={20}
              placeholder="Số lượng khu vực"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="established_date"
            label="Ngày thành lập"
            style={{ width: "50%" }}
          >
            <MemoizedInput type="date" />
          </Form.Item>
        </Space.Compact>
      </Form>
    </Modal>
  );
};

export default BranchEditModal;
