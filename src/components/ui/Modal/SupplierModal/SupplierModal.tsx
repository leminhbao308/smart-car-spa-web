"use client";
import React, { useState, useEffect } from "react";
import { Modal, Form, Row, Col, message, Card, Tabs, Switch } from "antd";
import {
  BankOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from "@/lib/api/types/supplier.types";
import {
  useCreateSupplier,
  useUpdateSupplier,
} from "@/lib/api/hooks/useSuppliers";
import {
  MemoizedInput,
  MemoizedTextArea,
} from "@/components/ui/MemoizedComponents";

interface SupplierModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialData?: Supplier | null;
  title?: string;
}

const SupplierModal: React.FC<SupplierModalProps> = ({
  open,
  onCancel,
  onSuccess,
  initialData,
  title = "Thêm nhà cung cấp mới",
}) => {
  const [form] = Form.useForm();
  const [isViewMode, setIsViewMode] = useState(false);
  const createSupplierMutation = useCreateSupplier();
  const updateSupplierMutation = useUpdateSupplier();

  useEffect(() => {
    if (open) {
      if (initialData) {
        setIsViewMode(title.includes("Chi tiết"));
        form.setFieldsValue({
          supplier_name: initialData.supplier_name,
          contact_person: initialData.contact_person,
          email: initialData.email,
          phone: initialData.phone,
          address: initialData.address,
          bank_name: initialData.bank_name,
          bank_account: initialData.bank_account,
          is_active: initialData.is_active,
        });
      } else {
        setIsViewMode(false);
        form.resetFields();
      }
    }
  }, [open, initialData, form, title]);

  const handleOk = async () => {
    if (isViewMode) {
      onCancel();
      return;
    }

    try {
      const values = await form.validateFields();

      if (initialData) {
        // Update existing supplier
        const updateData: UpdateSupplierRequest = {
          supplier_name: values.supplier_name,
          contact_person: values.contact_person,
          email: values.email,
          phone: values.phone,
          address: values.address,
          bank_name: values.bank_name,
          bank_account: values.bank_account,
          is_active: values.is_active,
        };

        await updateSupplierMutation.mutateAsync({
          supplierId: initialData.supplier_id,
          data: updateData,
        });
        message.success("Cập nhật nhà cung cấp thành công!");
      } else {
        // Create new supplier
        const createData: CreateSupplierRequest = {
          supplier_name: values.supplier_name,
          contact_person: values.contact_person,
          email: values.email,
          phone: values.phone,
          address: values.address,
          bank_name: values.bank_name,
          bank_account: values.bank_account,
        };

        await createSupplierMutation.mutateAsync(createData);
        message.success("Thêm nhà cung cấp thành công!");
      }

      form.resetFields();
      onSuccess();
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  const renderBasicInfo = () => (
    <Card title="Thông tin cơ bản" size="small" style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="supplier_name"
            label="Tên nhà cung cấp"
            rules={[
              { min: 2, message: "Tên nhà cung cấp phải có ít nhất 2 ký tự" },
              {
                max: 255,
                message: "Tên nhà cung cấp không được vượt quá 255 ký tự",
              },
            ]}
          >
            <MemoizedInput
              placeholder="Nhập tên nhà cung cấp"
              disabled={isViewMode}
              prefix={<BankOutlined />}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="contact_person"
            label="Người liên hệ"
            rules={[
              {
                max: 255,
                message: "Tên người liên hệ không được vượt quá 255 ký tự",
              },
            ]}
          >
            <MemoizedInput
              placeholder="Nhập tên người liên hệ"
              disabled={isViewMode}
              prefix={<UserOutlined />}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const renderContactInfo = () => (
    <Card title="Thông tin liên hệ" size="small" style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              {
                max: 20,
                message: "Số điện thoại không được vượt quá 20 ký tự",
              },
              {
                pattern: /^[0-9+\-\s()]*$/,
                message: "Số điện thoại không hợp lệ",
              },
            ]}
          >
            <MemoizedInput
              placeholder="Nhập số điện thoại"
              disabled={isViewMode}
              prefix={<PhoneOutlined />}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: "email", message: "Email không hợp lệ" },
              { max: 255, message: "Email không được vượt quá 255 ký tự" },
            ]}
          >
            <MemoizedInput
              placeholder="Nhập email"
              disabled={isViewMode}
              prefix={<MailOutlined />}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="address"
        label="Địa chỉ"
        rules={[
          { max: 1000, message: "Địa chỉ không được vượt quá 1000 ký tự" },
        ]}
      >
        <MemoizedTextArea
          rows={2}
          placeholder="Nhập địa chỉ chi tiết"
          disabled={isViewMode}
        />
      </Form.Item>
    </Card>
  );

  const renderBankInfo = () => (
    <Card title="Thông tin ngân hàng" size="small" style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="bank_name"
            label="Tên ngân hàng"
            rules={[
              {
                max: 255,
                message: "Tên ngân hàng không được vượt quá 255 ký tự",
              },
            ]}
          >
            <MemoizedInput
              placeholder="Nhập tên ngân hàng"
              disabled={isViewMode}
              prefix={<BankOutlined />}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="bank_account"
            label="Số tài khoản"
            rules={[
              {
                max: 255,
                message: "Số tài khoản không được vượt quá 255 ký tự",
              },
            ]}
          >
            <MemoizedInput
              placeholder="Nhập số tài khoản"
              disabled={isViewMode}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const renderStatusInfo = () => (
    <Card title="Trạng thái" size="small">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="is_active"
            label="Trạng thái hoạt động"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Hoạt động"
              unCheckedChildren="Tạm dừng"
              disabled={isViewMode}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      width={1000}
      okText={isViewMode ? "Đóng" : initialData ? "Cập nhật" : "Thêm mới"}
      cancelText="Hủy"
      confirmLoading={
        createSupplierMutation.isPending || updateSupplierMutation.isPending
      }
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          is_active: true,
        }}
      >
        <Tabs
          defaultActiveKey="basic"
          type="card"
          items={[
            {
              key: "basic",
              label: "Thông tin cơ bản",
              children: (
                <>
                  {renderBasicInfo()}
                  {renderContactInfo()}
                </>
              ),
            },
            {
              key: "bank",
              label: "Thông tin ngân hàng",
              children: renderBankInfo(),
            },
            {
              key: "status",
              label: "Trạng thái",
              children: renderStatusInfo(),
            },
          ]}
        />
      </Form>
    </Modal>
  );
};

export default SupplierModal;
