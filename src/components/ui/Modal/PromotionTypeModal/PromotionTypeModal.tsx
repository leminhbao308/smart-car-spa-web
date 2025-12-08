"use client";
import React, {useState, useEffect} from "react";
import {
  Modal,
  Form,
  Row,
  Col,
  Card,
  Switch,
  Input,
  message,
} from "antd";
import {
  GiftOutlined,
} from "@ant-design/icons";
import {PromotionTypeInfo} from "@/lib/api";
import {MemoizedInput, MemoizedTextArea} from "@/components/ui/MemoizedComponents";

const {TextArea} = Input;

interface PromotionTypeModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (data: any) => void;
  initialData?: PromotionTypeInfo | null;
  title?: string;
}

const PromotionTypeModal: React.FC<PromotionTypeModalProps> = ({
                                                                 open,
                                                                 onCancel,
                                                                 onOk,
                                                                 initialData,
                                                                 title = "Thêm loại khuyến mãi mới"
                                                               }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setIsViewMode(title.includes("Chi tiết"));
        form.setFieldsValue({
          typeCode: initialData.typeCode,
          typeName: initialData.typeName,
          description: initialData.description,
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
      setLoading(true);
      const values = await form.validateFields();

      onOk(values);
    } catch (error) {
      console.log("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInfo = () => (
    <Card
      title={
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <GiftOutlined style={{color: '#1890ff'}}/>
          <span>Thông tin cơ bản</span>
        </div>
      }
      size="small"
      style={{marginBottom: 16}}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="typeCode"
            label="Mã loại khuyến mãi"
            rules={[
              {required: true, message: "Vui lòng nhập mã loại khuyến mãi!"},
              {
                pattern: /^[A-Z0-9_]+$/,
                message: "Mã chỉ được chứa chữ in hoa, số và dấu gạch dưới!"
              }
            ]}
          >
            <MemoizedInput
              placeholder="VD: DISCOUNT_10"
              disabled={isViewMode || !!initialData}
              maxLength={50}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="typeName"
            label="Tên loại khuyến mãi"
            rules={[{required: true, message: "Vui lòng nhập tên loại khuyến mãi!"}]}
          >
            <MemoizedInput
              placeholder="VD: Giảm giá 10%"
              disabled={isViewMode}
              maxLength={100}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="description"
        label="Mô tả"
        rules={[{required: true, message: "Vui lòng nhập mô tả!"}]}
      >
        <MemoizedTextArea
          rows={4}
          placeholder="Nhập mô tả chi tiết về loại khuyến mãi này"
          disabled={isViewMode}
          maxLength={500}
          showCount
        />
      </Form.Item>

      <Form.Item
        name="is_active"
        label="Trạng thái"
        valuePropName="checked"
      >
        <Switch
          disabled={isViewMode}
          checkedChildren="Hoạt động"
          unCheckedChildren="Tạm dừng"
        />
      </Form.Item>
    </Card>
  );

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      width={800}
      okText={isViewMode ? "Đóng" : (initialData ? "Cập nhật" : "Thêm mới")}
      cancelText="Hủy"
      confirmLoading={loading}
      destroyOnHidden={true}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isActive: true
        }}
      >
        {renderBasicInfo()}
      </Form>
    </Modal>
  );
};

export default PromotionTypeModal;
