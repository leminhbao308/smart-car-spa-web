"use client";
import React, { useState, useEffect } from "react";
import { Modal, Form, Select, Input, Button, message } from "antd";
import { useCreateTracking } from "@/lib/api/hooks/useTracking";
import { useServiceProcessByServiceId } from "@/lib/api/hooks/useServiceProcess";
import { useEmployeesDropdown } from "@/lib/api/hooks/useEmployees";
import { useServiceBaysByBranch } from "@/lib/api/hooks/useServiceBays";
import { BookingInfoDto } from "@/lib/api/types/booking.types";
import { CreateServiceProcessTrackingRequest, TrackingStatus } from "@/lib/api/types/service-process-tracking.types";
import { ServiceProcessStepInfoDto } from "@/lib/api/types/service-process.types";

const { Option } = Select;
const { TextArea } = Input;

interface CreateTrackingModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  booking: BookingInfoDto;
}

const CreateTrackingModal: React.FC<CreateTrackingModalProps> = ({
  open,
  onCancel,
  onSuccess,
  booking,
}) => {
  const [form] = Form.useForm();
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  // const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null); // Not used anymore

  const createTrackingMutation = useCreateTracking();
  const { data: serviceProcess, isLoading: isLoadingProcess } = useServiceProcessByServiceId(selectedServiceId || "");
  const { data: employees, isLoading: isLoadingEmployees } = useEmployeesDropdown();
  const { data: serviceBays, isLoading: isLoadingServiceBays } = useServiceBaysByBranch(booking.branchId);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      setSelectedServiceId("");
      // setSelectedProcessId(null); // Not used anymore
      
      // Set default values - auto-select first service from booking
      if (booking.bookingItems && booking.bookingItems.length > 0) {
        const firstService = booking.bookingItems[0];
        if (firstService.serviceId) {
          setSelectedServiceId(firstService.serviceId);
          form.setFieldValue("serviceId", firstService.serviceId);
        }
      }
    }
  }, [open, booking, form]);

  // Update process when service changes and auto-select first step
  useEffect(() => {
    if (serviceProcess) {
      // Auto-select first step of the process
      const firstStep = serviceProcess.processSteps?.[0];
      if (firstStep) {
        form.setFieldValue("serviceStepId", firstStep.id);
      }
    }
  }, [serviceProcess, form]);

  const handleSubmit = async (values: {
    serviceId: string;
    serviceStepId: string;
    technicianId: string;
    bayId: string;
    notes?: string;
  }) => {
    try {
      const request: CreateServiceProcessTrackingRequest = {
        booking_id: booking.bookingId,
        service_step_id: values.serviceStepId,
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
      console.error("Create tracking error:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const serviceSteps = serviceProcess?.processSteps || [];

  return (
    <Modal
      title="Tạo Tracking Dịch vụ"
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
        <Form.Item
          label="Dịch vụ"
          name="serviceId"
          rules={[{ required: true, message: "Vui lòng chọn dịch vụ" }]}
        >
          <Select
            placeholder="Chọn dịch vụ"
            value={selectedServiceId}
            onChange={setSelectedServiceId}
            loading={isLoadingProcess}
            allowClear
          >
            {booking.bookingItems?.map((item) => (
              <Option key={item.serviceId} value={item.serviceId}>
                <div>
                  <div style={{ fontWeight: 500 }}>{item.serviceName || `Service ${item.serviceId?.substring(0, 8)}...`}</div>
                  <div style={{ fontSize: 11, color: "#999" }}>
                    Số lượng: {item.quantity} • Giá: {item.servicePrice ? `${item.servicePrice.toLocaleString()} VNĐ` : 'N/A'}
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Bước dịch vụ"
          name="serviceStepId"
          rules={[{ required: true, message: "Vui lòng chọn bước dịch vụ" }]}
        >
          <Select
            placeholder="Chọn bước dịch vụ"
            loading={isLoadingProcess}
            disabled={!selectedServiceId}
            allowClear
          >
            {serviceSteps.map((step: ServiceProcessStepInfoDto) => (
              <Option key={step.id} value={step.id}>
                <div>
                  <div style={{ fontWeight: 500 }}>{step.name}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    Bước {step.stepOrder} • {step.estimatedTime} phút
                  </div>
                  {step.description && (
                    <div style={{ fontSize: 11, color: "#999" }}>
                      {step.description}
                    </div>
                  )}
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

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
              const text = option?.children?.toString() || '';
              return text.toLowerCase().includes(input.toLowerCase());
            }}
          >
            {employees?.map((employee) => (
              <Option key={employee.user_id} value={employee.user_id}>
                <div>
                  <div style={{ fontWeight: 500 }}>{employee.full_name}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {employee.phone_number} • {employee.email}
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
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {bay.bay_code} • {bay.bay_type} • Sức chứa: {bay.capacity}
                  </div>
                  {bay.description && (
                    <div style={{ fontSize: 11, color: "#999" }}>
                      {bay.description}
                    </div>
                  )}
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
