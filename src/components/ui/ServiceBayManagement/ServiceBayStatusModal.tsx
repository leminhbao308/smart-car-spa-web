"use client";

import React, { useState } from "react";
import {
  Modal,
  Form,
  Select,
  Button,
  Space,
  message,
  Alert,
  Divider,
} from "antd";
import {
  SettingOutlined,
  CloseOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  ServiceBay,
  BayStatus,
  BAY_STATUS_OPTIONS,
} from "@/lib/api/types/service-bay.types";
import { useUpdateServiceBayStatus } from "@/lib/api/hooks/useServiceBays";
import MemoizedTextArea from "../Modal/ServiceBayModals/MemoizedTextArea";

const { Option } = Select;

interface ServiceBayStatusModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (bay: ServiceBay) => void;
  bay?: ServiceBay | null;
}

const ServiceBayStatusModal: React.FC<ServiceBayStatusModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  bay,
}) => {
  const [form] = Form.useForm();
  const [selectedStatus, setSelectedStatus] = useState<BayStatus | null>(null);
  const updateServiceBayStatusMutation = useUpdateServiceBayStatus();
  const loading = updateServiceBayStatusMutation.isPending;

  React.useEffect(() => {
    if (visible && bay) {
      form.setFieldsValue({
        status: bay.status,
        reason: bay.notes || "",
      });
      setSelectedStatus(bay.status);
    }
  }, [visible, bay, form]);

  const handleSubmit = async (values: { status: BayStatus; reason?: string }) => {
    if (!bay) return;

    try {
      const result = await updateServiceBayStatusMutation.mutateAsync({
        bayId: bay.bay_id,
        status: values.status,
        reason: values.reason
      });
      
      message.success("Cập nhật trạng thái khu vực dịch vụ thành công!");
      onSuccess(result);
      form.resetFields();
    } catch (error: unknown) {
      message.error((error as Error).message || "Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedStatus(null);
    onCancel();
  };

  const getStatusDescription = (status: BayStatus) => {
    switch (status) {
      case BayStatus.ACTIVE:
        return "Bệ dịch vụ hoạt động bình thường và có thể phục vụ khách hàng";
      case BayStatus.MAINTENANCE:
        return "Bệ dịch vụ đang được bảo trì, không thể phục vụ khách hàng";
      case BayStatus.CLOSED:
        return "Bệ dịch vụ tạm thời đóng cửa, không thể phục vụ khách hàng";
      case BayStatus.INACTIVE:
        return "Bệ dịch vụ không hoạt động, không thể phục vụ khách hàng";
      default:
        return "";
    }
  };

  const getStatusColor = (status: BayStatus) => {
    const option = BAY_STATUS_OPTIONS.find(opt => opt.value === status);
    return option?.color || "default";
  };

  if (!bay) return null;

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SettingOutlined style={{ color: "#722ed1" }} />
          Quản lý trạng thái khu vực dịch vụ
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={600}
      footer={null}
      destroyOnHidden
    >
      <div style={{ marginBottom: "16px" }}>
        <Alert
          message={`Bệ dịch vụ: ${bay.bay_name}`}
          description={`Chi nhánh: ${bay.branch_name} (${bay.branch_code})`}
          type="info"
          showIcon
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="status"
          label="Trạng thái mới"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select
            placeholder="Chọn trạng thái"
            onChange={(value) => {
              setSelectedStatus(value);
            }}
          >
            {BAY_STATUS_OPTIONS.map((option) => (
              <Option key={option.value} value={option.value}>
                <Space>
                  <span
                    style={{
                      display: "inline-block",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: option.color === "success" ? "#52c41a" :
                                     option.color === "warning" ? "#faad14" :
                                     option.color === "error" ? "#ff4d4f" : "#8c8c8c"
                    }}
                  />
                  <span>{option.label}</span>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedStatus && (
          <Alert
            message={getStatusDescription(selectedStatus)}
            type={getStatusColor(selectedStatus) === "success" ? "success" :
                  getStatusColor(selectedStatus) === "warning" ? "warning" :
                  getStatusColor(selectedStatus) === "error" ? "error" : "info"}
            showIcon
            style={{ marginBottom: "16px" }}
          />
        )}

        <Form.Item
          name="reason"
          label="Lý do thay đổi"
          rules={[
            { max: 500, message: "Lý do không được quá 500 ký tự" },
          ]}
        >
                <MemoizedTextArea
                  placeholder="Nhập lý do thay đổi trạng thái (tùy chọn)"
                  showCount
                  maxLength={500}
                />
        </Form.Item>

        <Divider />

        <div style={{ textAlign: "right" }}>
          <Space>
            <Button onClick={handleCancel} disabled={loading}>
              <CloseOutlined />
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
            >
              Cập nhật trạng thái
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default ServiceBayStatusModal;
