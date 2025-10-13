"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Switch,
  Button,
  Space,
  App,
  Row,
  Col,
} from "antd";
import {
  ServicePackageType,
  CreateServicePackageTypeRequest,
  UpdateServicePackageTypeRequest,
} from "@/lib/api/types/service-package-type.types";
import { servicePackageTypeService } from "@/lib/api/services/service-package-type.service";
import {
  SERVICE_PACKAGE_TYPE_CUSTOMER_TYPE_OPTIONS,
} from "@/lib/api/types/service-package-type.types";
import {
  MemoizedInput,
  MemoizedTextArea,
} from "@/components/ui/MemoizedComponents";

const { Option } = Select;

interface ServicePackageTypeModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editData?: ServicePackageType;
}

const ServicePackageTypeModal: React.FC<ServicePackageTypeModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);

  const isEdit = !!editData;

  useEffect(() => {
    if (visible) {
      // Reset loading state when modal opens
      console.log("Modal opened, resetting states");
      setLoading(false);
      setValidatingCode(false);

      if (editData) {
        console.log("Setting form values for edit:", editData);
        form.setFieldsValue({
          code: editData.code,
          name: editData.name,
          description: editData.description,
          applicable_customer_type: editData.applicable_customer_type,
          is_default: editData.is_default,
          is_active: editData.is_active,
        });
      } else {
        console.log("Resetting form for new item");
        form.resetFields();
        form.setFieldsValue({
          is_active: true,
          is_default: false,
        });
      }
    }
  }, [visible, editData, form]);

  const handleSubmit = async (
    values: CreateServicePackageTypeRequest | UpdateServicePackageTypeRequest
  ) => {
    try {
      setLoading(true);
      console.log("Submitting service package type data:", values);

      if (isEdit) {
        await servicePackageTypeService.updateServicePackageType(
          editData!.service_package_type_id,
          values
        );
        message.success("Cập nhật loại gói dịch vụ thành công!");
      } else {
        await servicePackageTypeService.createServicePackageType(values);
        message.success("Thêm loại gói dịch vụ thành công!");
      }

      onSuccess();
    } catch (error: unknown) {
      console.error("Error saving service package type:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi lưu loại gói dịch vụ";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setLoading(false);
    setValidatingCode(false);
    onCancel();
  };

  return (
    <Modal
      title={
        isEdit ? "Chỉnh sửa loại gói dịch vụ" : "Thêm loại gói dịch vụ mới"
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={900}
      destroyOnHidden
      centered
      maskClosable={false}
      keyboard={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Mã loại gói"
              name="code"
              normalize={(value) => value?.toUpperCase()}
              rules={[
                { required: true, message: "Vui lòng nhập mã loại gói" },
                { min: 2, max: 20, message: "Mã loại gói phải từ 2-20 ký tự" },
                {
                  pattern: /^[A-Z0-9_]+$/,
                  message:
                    "Mã loại gói chỉ được chứa chữ hoa, số và dấu gạch dưới",
                },
              ]}
            >
              <MemoizedInput
                placeholder="Nhập mã loại gói (VD: MAINTENANCE)"
                disabled={loading || validatingCode}
                style={{ textTransform: "uppercase" }}
                showCount
                maxLength={20}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Tên loại gói"
              name="name"
              rules={[
                { required: true, message: "Vui lòng nhập tên loại gói" },
                {
                  min: 2,
                  max: 100,
                  message: "Tên loại gói phải từ 2-100 ký tự",
                },
              ]}
            >
              <MemoizedInput
                placeholder="Nhập tên loại gói (VD: Gói bảo dưỡng)"
                disabled={loading}
                showCount
                maxLength={100}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[{ max: 500, message: "Mô tả không được quá 500 ký tự" }]}
        >
          <MemoizedTextArea
            rows={3}
            placeholder="Nhập mô tả chi tiết về loại gói dịch vụ..."
            disabled={loading}
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item
          label="Loại khách hàng áp dụng"
          name="applicable_customer_type"
          rules={[
            { required: true, message: "Vui lòng chọn loại khách hàng" },
          ]}
        >
          <Select
            placeholder="Chọn loại khách hàng"
            disabled={loading}
            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              String(option?.children)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            onChange={(value) => {
              console.log("Customer type changed:", value);
            }}
          >
            {SERVICE_PACKAGE_TYPE_CUSTOMER_TYPE_OPTIONS.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Đặt làm mặc định"
              name="is_default"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Có"
                unCheckedChildren="Không"
                disabled={loading}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Trạng thái hoạt động"
              name="is_active"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Hoạt động"
                unCheckedChildren="Không hoạt động"
                disabled={loading}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <Space>
            <Button onClick={handleCancel} disabled={loading} size="large">
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              disabled={validatingCode}
            >
              {isEdit ? "Cập nhật" : "Thêm mới"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ServicePackageTypeModal;
