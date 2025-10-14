"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  Typography,
  App,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useUpdateProgress } from "@/lib/api/hooks/useTracking";
import { ServiceProcessTrackingInfoDto } from "@/lib/api/types/service-process-tracking.types";

const { TextArea } = Input;
const { Text } = Typography;

interface UpdateTrackingModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  tracking: ServiceProcessTrackingInfoDto | null;
  stepName?: string;
}

const UpdateTrackingModal: React.FC<UpdateTrackingModalProps> = ({
  open,
  onCancel,
  onSuccess,
  tracking,
  stepName,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const updateProgressMutation = useUpdateProgress();
  const { message } = App.useApp();

  useEffect(() => {
    if (open && tracking) {
      form.setFieldsValue({
        notes: tracking.notes || "",
        evidence_media_urls: tracking.evidenceMediaUrls || "",
      });
    }
  }, [open, tracking, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!tracking) return;

      setLoading(true);
      await updateProgressMutation.mutateAsync({
        trackingId: tracking.trackingId,
        request: {
          notes: values.notes || undefined,
          media_url: values.evidence_media_urls || undefined,
          progress_percent: 100.0,
        },
      });

      message.success("Cập nhật tracking thành công");
      onSuccess();
      form.resetFields();
    } catch (error) {
      console.error("Update tracking error:", error);
      message.error("Có lỗi xảy ra khi cập nhật tracking");
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
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <EditOutlined style={{ color: "#1890ff" }} />
          <span>Cập nhật tracking</span>
          {stepName && (
            <span style={{ fontSize: 12, color: "#666" }}>
              - {stepName}
            </span>
          )}
        </div>
      }
      open={open}
      onCancel={handleCancel}
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
          Cập nhật
        </Button>,
      ]}
      width={600}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          notes: "",
          evidence_media_urls: "",
        }}
      >
        <Form.Item
          name="notes"
          label="Ghi chú"
          rules={[
            {
              max: 500,
              message: "Ghi chú không được vượt quá 500 ký tự",
            },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Nhập ghi chú về quá trình thực hiện..."
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item
          name="evidence_media_urls"
          label="URL bằng chứng (tùy chọn)"
          rules={[
            {
              type: "url",
              message: "Vui lòng nhập URL hợp lệ",
            },
          ]}
        >
          <Input
            placeholder="https://example.com/evidence.jpg"
            addonBefore="URL"
          />
        </Form.Item>

        <div
          style={{
            padding: 12,
            backgroundColor: "#f6ffed",
            border: "1px solid #b7eb8f",
            borderRadius: 4,
            marginTop: 16,
          }}
        >
          <Text style={{ fontSize: 12, color: "#666" }}>
            💡 <strong>Lưu ý:</strong> Cả hai trường đều là tùy chọn. Bạn có thể
            để trống nếu không cần thiết.
          </Text>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateTrackingModal;
