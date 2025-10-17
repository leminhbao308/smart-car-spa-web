"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Form,
  Select,
  Button,
  Row,
  Col,
  Space,
  Divider,
  App,
} from "antd";
import {
  SaveOutlined,
  CloseOutlined,
  ToolOutlined,
  CarOutlined,
} from "@ant-design/icons";
import {
  ServiceBay,
  CreateServiceBayRequest,
  UpdateServiceBayRequest,
  BAY_STATUS_OPTIONS,
  BayStatus,
  TechnicianStatus,
  TECHNICIAN_STATUS_OPTIONS,
} from "@/lib/api/types/service-bay.types";
import {
  useCreateServiceBay,
  useUpdateServiceBay,
  useValidateBayName,
  useAvailableTechnicians,
  useBulkAssignTechnicians,
} from "@/lib/api/hooks/useServiceBays";
import { useBranches } from "@/lib/api/hooks/useBranches";
import {
  MemoizedInput,
  MemoizedTextArea,
  MemoizedInputNumber,
} from "@/components/ui/MemoizedComponents";

const { Option } = Select;

interface ServiceBayModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (bay: ServiceBay) => void;
  editData?: ServiceBay | null;
  branchId?: string;
}

const ServiceBayModal: React.FC<ServiceBayModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData,
  branchId,
}) => {
  const [form] = Form.useForm();
  const [nameValidating, setNameValidating] = useState(false);
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([]);
  const [defaultTechnicianStatus, setDefaultTechnicianStatus] =
    useState<TechnicianStatus>(TechnicianStatus.ACTIVE);
  const { message } = App.useApp();

  const createServiceBayMutation = useCreateServiceBay();
  const updateServiceBayMutation = useUpdateServiceBay();
  const validateBayNameMutation = useValidateBayName();
  const bulkAssignTechniciansMutation = useBulkAssignTechnicians();

  const loading =
    createServiceBayMutation.isPending ||
    updateServiceBayMutation.isPending ||
    bulkAssignTechniciansMutation.isPending;

  const { branches } = useBranches({});
  const { data: availableTechnicians, isLoading: techniciansLoading } =
    useAvailableTechnicians();

  const isEdit = !!editData;

  useEffect(() => {
    if (visible) {
      if (isEdit && editData) {
        // Khi chỉnh sửa, gán sẵn tất cả thông tin bao gồm chi nhánh
        console.log("Setting form values for edit:", editData);
        form.setFieldsValue({
          bay_name: editData.bay_name,
          bay_code: editData.bay_code,
          description: editData.description,
          display_order: editData.display_order,
          status: editData.status,
          notes: editData.notes,
        });

        // Set technician data
        if (editData.technicians) {
          setSelectedTechnicians(
            editData.technicians.map((t) => t.technician_id)
          );
        }
      } else {
        // Khi tạo mới, reset form và gán chi nhánh nếu có
        form.resetFields();
        setSelectedTechnicians([]);
        setDefaultTechnicianStatus(TechnicianStatus.ACTIVE);
        if (branchId) {
          form.setFieldsValue({ branch_id: branchId });
        }
      }
    }
  }, [visible, isEdit, editData, branchId, form]);

  // Đảm bảo form được set giá trị sau khi branches đã load
  useEffect(() => {
    if (visible && isEdit && editData && branches.length > 0) {
      const branchExists = branches.some(
        (branch) => branch.branch_id === editData.branch_id
      );
      if (branchExists) {
        form.setFieldsValue({
          branch_id: editData.branch_id,
          bay_name: editData.bay_name,
          bay_code: editData.bay_code,
          description: editData.description,
          display_order: editData.display_order,
          status: editData.status,
          notes: editData.notes,
        });
      } else {
        console.warn("Branch not found in branches list:", editData.branch_id);
      }
    }
  }, [visible, isEdit, editData, branches, form]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      let result: ServiceBay;

      if (isEdit && editData) {
        const updateData: UpdateServiceBayRequest = {
          bay_name: values.bay_name as string,
          bay_code: values.bay_code as string | undefined,
          description: values.description as string | undefined,
          display_order: values.display_order as number | undefined,
          status: (values.status as BayStatus) || BayStatus.ACTIVE,
          notes: values.notes as string | undefined,
          // Technician management fields
          technician_ids: selectedTechnicians,
          default_technician_status: defaultTechnicianStatus,
          technician_notes: values.technician_notes as string | undefined,
        };
        result = await updateServiceBayMutation.mutateAsync({
          bayId: editData.bay_id,
          data: updateData,
        });
        message.success("Cập nhật khu vực dịch vụ thành công!");
      } else {
        const createData: CreateServiceBayRequest = {
          branch_id: (values.branch_id as string) || branchId || "",
          bay_name: values.bay_name as string,
          bay_code: values.bay_code as string | undefined,
          description: values.description as string | undefined,
          display_order: (values.display_order as number) || 1,
          status: (values.status as BayStatus) || BayStatus.ACTIVE,
          notes: values.notes as string | undefined,
        };
        result = await createServiceBayMutation.mutateAsync(createData);

        // Assign technicians after creating service bay
        if (selectedTechnicians.length > 0) {
          await bulkAssignTechniciansMutation.mutateAsync({
            bayId: result.bay_id,
            data: {
              technician_ids: selectedTechnicians,
              status: defaultTechnicianStatus,
              notes: values.technician_notes as string | undefined,
            },
          });
        }

        message.success("Tạo khu vực dịch vụ thành công!");
      }

      onSuccess(result);
      form.resetFields();
    } catch (error: unknown) {
      message.error(
        (error as Error).message || "Có lỗi xảy ra khi lưu khu vực dịch vụ"
      );
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleNameChange = useCallback(
    async (value: string) => {
      if (!value || value.length < 2) return;

      const branchId = form.getFieldValue("branch_id");
      if (!branchId) return;

      setNameValidating(true);
      try {
        const isValid = await validateBayNameMutation.mutateAsync({
          branchId,
          bayName: value,
          bayId: isEdit ? editData?.bay_id : undefined,
        });

        if (!isValid) {
          form.setFields([
            {
              name: "bay_name",
              errors: ["Tên khu vực dịch vụ đã tồn tại trong chi nhánh này"],
            },
          ]);
        } else {
          form.setFields([
            {
              name: "bay_name",
              errors: [],
            },
          ]);
        }
      } catch (error) {
        console.error("Error validating bay name:", error);
      } finally {
        setNameValidating(false);
      }
    },
    [form, isEdit, editData?.bay_id, validateBayNameMutation]
  );

  return (
    <App>
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ToolOutlined style={{ color: "#1890ff" }} />
            {isEdit ? "Chỉnh sửa khu vực dịch vụ" : "Thêm khu vực dịch vụ mới"}
          </div>
        }
        open={visible}
        onCancel={handleCancel}
        width={800}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          scrollToFirstError
          initialValues={{
            status: "ACTIVE",
          }}
        >
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            style={{ width: "50%", marginRight: 8 }}
          >
            <Select placeholder="Chọn trạng thái">
              {BAY_STATUS_OPTIONS.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="bay_name"
                label="Tên khu vực dịch vụ"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên khu vực dịch vụ",
                  },
                  {
                    min: 2,
                    message: "Tên khu vực dịch vụ phải có ít nhất 2 ký tự",
                  },
                  {
                    max: 255,
                    message: "Tên khu vực dịch vụ không được quá 255 ký tự",
                  },
                ]}
                validateStatus={nameValidating ? "validating" : ""}
              >
                <MemoizedInput
                  placeholder="Nhập tên khu vực dịch vụ"
                  onBlur={(e) => handleNameChange(e.target.value)}
                  suffix={nameValidating ? <CarOutlined spin /> : null}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="bay_code"
                label="Mã khu vực dịch vụ"
                rules={[
                  {
                    max: 50,
                    message: "Mã khu vực dịch vụ không được quá 50 ký tự",
                  },
                ]}
              >
                <MemoizedInput placeholder="Nhập mã khu vực dịch vụ (tùy chọn)" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ max: 1000, message: "Mô tả không được quá 1000 ký tự" }]}
          >
            <MemoizedTextArea
              rows={3}
              placeholder="Nhập mô tả về khu vực dịch vụ"
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="display_order"
                label="Thứ tự hiển thị"
                rules={[
                  { type: "number", min: 1, message: "Thứ tự phải lớn hơn 0" },
                ]}
              >
                <MemoizedInputNumber
                  min={1}
                  placeholder="1"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Ghi chú"
            rules={[{ max: 500, message: "Ghi chú không được quá 500 ký tự" }]}
          >
            <MemoizedTextArea
              rows={2}
              placeholder="Nhập ghi chú (tùy chọn)"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Divider orientation="center">Quản lý kỹ thuật viên</Divider>

          <Form.Item
            label="Kỹ thuật viên"
            help="Chọn kỹ thuật viên để gán cho khu vực dịch vụ này"
          >
            <Select
              mode="multiple"
              placeholder="Chọn kỹ thuật viên"
              value={selectedTechnicians}
              onChange={setSelectedTechnicians}
              loading={techniciansLoading}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              style={{ width: "100%" }}
            >
              {availableTechnicians?.map((technician) => (
                <Option
                  key={technician.technician_id}
                  value={technician.technician_id}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {technician.technician_name}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {technician.technician_code} -{" "}
                      {technician.technician_phone}
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

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
                {isEdit ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </App>
  );
};

export default ServiceBayModal;
