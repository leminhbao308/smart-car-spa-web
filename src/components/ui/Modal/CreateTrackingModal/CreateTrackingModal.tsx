"use client";
import React, { useEffect } from "react";
import { Modal, Form, Select, Input, Button, message } from "antd";
import { useCreateTracking } from "@/lib/api/hooks/useTracking";
import { useEmployeesDropdown } from "@/lib/api/hooks/useEmployees";
import { useServiceBaysByBranch } from "@/lib/api/hooks/useServiceBays";
import { BookingInfoDto } from "@/lib/api/types/booking.types";
import {
  CreateServiceProcessTrackingRequest,
  TrackingStatus,
} from "@/lib/api/types/service-process-tracking.types";

const { Option } = Select;
const { TextArea } = Input;

interface CreateTrackingModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  booking: BookingInfoDto;
  preSelectedStepId?: string;
  preSelectedStepName?: string;
}

const CreateTrackingModal: React.FC<CreateTrackingModalProps> = ({
  open,
  onCancel,
  onSuccess,
  booking,
  preSelectedStepId,
  preSelectedStepName,
}) => {
  const [form] = Form.useForm();

  const createTrackingMutation = useCreateTracking();
  const { data: employees, isLoading: isLoadingEmployees } =
    useEmployeesDropdown();
  const { data: serviceBays, isLoading: isLoadingServiceBays } =
    useServiceBaysByBranch(booking.branchId);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.resetFields();

      // Set pre-selected step if provided
      if (preSelectedStepId) {
        form.setFieldValue("serviceStepId", preSelectedStepId);
      }
    }
  }, [open, form, preSelectedStepId]);

  const handleSubmit = async (values: {
    technicianId: string;
    bayId: string;
    notes?: string;
  }) => {
    try {
      const request: CreateServiceProcessTrackingRequest = {
        booking_id: booking.bookingId,
        service_step_id: preSelectedStepId || "",
        technician_id: values.technicianId,
        bay_id: values.bayId,
        status: TrackingStatus.PENDING,
        estimated_duration: 60, // Default estimated duration
        notes: values.notes,
      };

      await createTrackingMutation.mutateAsync(request);
      message.success("Tạo tracking thành công");
      onSuccess();
    } catch (error) {
      message.error("Có lỗi xảy ra khi tạo tracking");
      console.log("Create tracking error:", error);
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
          <span>Tạo Tracking Dịch vụ</span>
          {preSelectedStepName && (
            <span style={{ fontSize: 12, color: "#666" }}>
              - {preSelectedStepName}
            </span>
          )}
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{}}
      >
        {/* Display selected step information */}
        {preSelectedStepName && (
          <Form.Item label="Bước dịch vụ">
            <div
              style={{
                padding: 12,
                backgroundColor: "#f6ffed",
                border: "1px solid #b7eb8f",
                borderRadius: 4,
              }}
            >
              <div style={{ fontWeight: 500, color: "#52c41a" }}>
                {preSelectedStepName}
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                Bước đã được chọn từ quy trình dịch vụ
              </div>
            </div>
          </Form.Item>
        )}

        <Form.Item
          label="Kỹ thuật viên"
          name="technicianId"
          rules={[{ required: true, message: "Vui lòng chọn kỹ thuật viên" }]}
        >
          <Select
            placeholder="Chọn kỹ thuật viên"
            loading={isLoadingEmployees}
            showSearch
            allowClear
            filterOption={(input, option) => {
              const text = option?.children?.toString() || "";
              return text.toLowerCase().includes(input.toLowerCase());
            }}
          >
            {employees?.map((employee) => (
              <Option key={employee.user_id} value={employee.user_id}>
                <div>
                  <div style={{ fontWeight: 500 }}>
                    {employee.full_name} • {employee.phone_number} •{" "}
                    {employee.email}
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Khu vực dịch vụ"
          name="bayId"
          rules={[{ required: true, message: "Vui lòng chọn khu vực dịch vụ" }]}
        >
          <Select
            placeholder="Chọn khu vực dịch vụ"
            loading={isLoadingServiceBays}
            allowClear
          >
            {serviceBays?.map((bay) => (
              <Option key={bay.bay_id} value={bay.bay_id}>
                <div>
                  <div style={{ fontWeight: 500 }}>{bay.bay_name}</div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Ghi chú" name="notes">
          <TextArea
            rows={3}
            placeholder="Nhập ghi chú (tùy chọn)"
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={createTrackingMutation.isPending}
          >
            Tạo Tracking
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateTrackingModal;
