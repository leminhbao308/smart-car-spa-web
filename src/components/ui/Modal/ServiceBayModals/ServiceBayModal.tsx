"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Form,
  Select,
  Button,
  Row,
  Col,
  message,
  Space,
  Divider} from "antd";
import {
  SaveOutlined,
  CloseOutlined,
  ToolOutlined,
  CarOutlined} from "@ant-design/icons";
import {
  ServiceBay,
  CreateServiceBayRequest,
  UpdateServiceBayRequest,
  BayType,
  BAY_TYPE_OPTIONS} from "@/lib/api/types/service-bay.types";
import { useServiceBayManagement } from "@/lib/api/hooks/useServiceBays";
import { useBranches } from "@/lib/api/hooks/useBranches";
import { MemoizedInput, MemoizedTextArea, MemoizedInputNumber } from "@/components/ui/MemoizedComponents";

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
  branchId}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [nameValidating, setNameValidating] = useState(false);
  
  const { createServiceBay, updateServiceBay, validateBayName } = useServiceBayManagement();
  const { branches } = useBranches({});

  const isEdit = !!editData;

  useEffect(() => {
    if (visible) {
      if (isEdit && editData) {
        form.setFieldsValue({
          branch_id: editData.branch_id,
          bay_name: editData.bay_name,
          bay_code: editData.bay_code,
          bay_type: editData.bay_type,
          description: editData.description,
          capacity: editData.capacity,
          display_order: editData.display_order,
          notes: editData.notes});
      } else {
        form.resetFields();
        if (branchId) {
          form.setFieldsValue({ branch_id: branchId });
        }
      }
    }
  }, [visible, isEdit, editData, branchId, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      let result: ServiceBay;
      
      if (isEdit && editData) {
        const updateData: UpdateServiceBayRequest = {
          bay_name: values.bay_name,
          bay_code: values.bay_code,
          bay_type: values.bay_type,
          description: values.description,
          capacity: values.capacity,
          display_order: values.display_order,
          notes: values.notes};
        result = await updateServiceBay(editData.bay_id, updateData);
        message.success("Cập nhật bệ dịch vụ thành công!");
      } else {
        const createData: CreateServiceBayRequest = {
          branch_id: values.branch_id,
          bay_name: values.bay_name,
          bay_code: values.bay_code,
          bay_type: values.bay_type,
          description: values.description,
          capacity: values.capacity || 1,
          display_order: values.display_order || 1,
          notes: values.notes};
        result = await createServiceBay(createData);
        message.success("Tạo bệ dịch vụ thành công!");
      }
      
      onSuccess(result);
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || "Có lỗi xảy ra khi lưu bệ dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleNameChange = useCallback(async (value: string) => {
    if (!value || value.length < 2) return;
    
    const branchId = form.getFieldValue("branch_id");
    if (!branchId) return;

    setNameValidating(true);
    try {
      const isValid = await validateBayName(
        branchId,
        value,
        isEdit ? editData?.bay_id : undefined
      );
      
      if (!isValid) {
        form.setFields([
          {
            name: "bay_name",
            errors: ["Tên bệ dịch vụ đã tồn tại trong chi nhánh này"]},
        ]);
      } else {
        form.setFields([
          {
            name: "bay_name",
            errors: []},
        ]);
      }
    } catch (error) {
      console.error("Error validating bay name:", error);
    } finally {
      setNameValidating(false);
    }
  }, [form, isEdit, editData?.bay_id, validateBayName]);

  const getBayTypeIcon = (type: BayType) => {
    const option = BAY_TYPE_OPTIONS.find(opt => opt.value === type);
    return option?.icon || "🔧";
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ToolOutlined style={{ color: "#1890ff" }} />
          {isEdit ? "Chỉnh sửa bệ dịch vụ" : "Thêm bệ dịch vụ mới"}
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
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="branch_id"
              label="Chi nhánh"
              rules={[{ required: true, message: "Vui lòng chọn chi nhánh" }]}
            >
              <Select
                placeholder="Chọn chi nhánh"
                disabled={!!branchId || isEdit}
                showSearch
                optionFilterProp="children"
                filterOption={( option) =>
                  (option?.children as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase()) ?? false
                }
              >
                {branches.map((branch) => (
                  <Option key={branch.branch_id} value={branch.branch_id}>
                    {branch.branch_name} ({branch.branch_code})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="bay_type"
              label="Loại bệ dịch vụ"
              rules={[{ required: true, message: "Vui lòng chọn loại bệ dịch vụ" }]}
            >
              <Select placeholder="Chọn loại bệ dịch vụ">
                {BAY_TYPE_OPTIONS.map((option) => (
                  <Option key={option.value} value={option.value}>
                    <Space>
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="bay_name"
              label="Tên bệ dịch vụ"
              rules={[
                { required: true, message: "Vui lòng nhập tên bệ dịch vụ" },
                { min: 2, message: "Tên bệ dịch vụ phải có ít nhất 2 ký tự" },
                { max: 255, message: "Tên bệ dịch vụ không được quá 255 ký tự" },
              ]}
              validateStatus={nameValidating ? "validating" : ""}
            >
              <MemoizedInput
                placeholder="Nhập tên bệ dịch vụ"
                onBlur={(e) => handleNameChange(e.target.value)}
                suffix={nameValidating ? <CarOutlined spin /> : null}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="bay_code"
              label="Mã bệ dịch vụ"
              rules={[
                { max: 50, message: "Mã bệ dịch vụ không được quá 50 ký tự" },
              ]}
            >
              <MemoizedInput placeholder="Nhập mã bệ dịch vụ (tùy chọn)" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[
            { max: 1000, message: "Mô tả không được quá 1000 ký tự" },
          ]}
        >
          <MemoizedTextArea
            rows={3}
            placeholder="Nhập mô tả về bệ dịch vụ"
            showCount
            maxLength={1000}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="capacity"
              label="Sức chứa"
              rules={[
                { required: true, message: "Vui lòng nhập sức chứa" },
                { type: "number", min: 1, message: "Sức chứa phải lớn hơn 0" },
              ]}
            >
              <MemoizedInputNumber
                min={1}
                max={10}
                placeholder="1"
                style={{ width: "100%" }}
                addonAfter="xe"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
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
          rules={[
            { max: 500, message: "Ghi chú không được quá 500 ký tự" },
          ]}
        >
          <MemoizedTextArea
            rows={2}
            placeholder="Nhập ghi chú (tùy chọn)"
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
              {isEdit ? "Cập nhật" : "Tạo mới"}
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default ServiceBayModal;

