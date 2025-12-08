import React from "react";
import { Modal, Space, Descriptions, Typography, Form, Input, Tag } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { SaleOrderResponse } from "@/lib/api";
import { FormInstance } from "antd/es/form";

const { Text } = Typography;

interface CancelOrderModalProps {
  visible: boolean;
  order: SaleOrderResponse | null;
  form: FormInstance;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  calculateTotal: (order: SaleOrderResponse) => number;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  visible,
  order,
  form,
  loading,
  onClose,
  onConfirm,
  getStatusColor,
  getStatusText,
  calculateTotal,
}) => {
  if (!order) return null;

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
          <span>Xác nhận hủy đơn hàng</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      onOk={onConfirm}
      confirmLoading={loading}
      okText="Xác nhận hủy"
      cancelText="Đóng"
      okButtonProps={{ danger: true }}
      width={600}
    >
      <div>
        <Descriptions
          column={1}
          bordered
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Descriptions.Item label="Mã đơn hàng">
            <Text
              strong
              code
            >
              {order.id}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Khách hàng">
            {order.customer?.full_name || "Khách lẻ"}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {order.customer?.phone_number || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">
            <Text
              strong
              style={{ fontSize: "16px", color: "#1890ff" }}
            >
              ₫{(order.final_amount ?? calculateTotal(order)).toLocaleString()}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            label="Lý do hủy đơn hàng"
            name="cancellation_reason"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập lý do hủy đơn hàng",
              },
              {
                max: 500,
                message: "Lý do hủy không được vượt quá 500 ký tự",
              },
            ]}
          >
            <Input.TextArea
              placeholder="Nhập lý do hủy đơn hàng... (Bắt buộc)"
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default CancelOrderModal;
