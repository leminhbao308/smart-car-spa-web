import React from "react";
import {
  Modal,
  Space,
  Descriptions,
  Typography,
  Divider,
  Form,
  Input,
  Table,
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { SaleOrderLineResponse, SaleOrderResponse } from "@/lib/api";
import { FormInstance } from "antd/es/form";

const { Text, Title } = Typography;

interface ReturnOrderModalProps {
  visible: boolean;
  order: SaleOrderResponse | null;
  form: FormInstance;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  calculateTotal: (order: SaleOrderResponse) => number;
  calculateReturnAmount: (order: SaleOrderResponse) => number;
  getDiscountedUnitPrice: (
    order: SaleOrderResponse,
    unitPrice: number
  ) => number;
}

const ReturnOrderModal: React.FC<ReturnOrderModalProps> = ({
  visible,
  order,
  form,
  loading,
  onClose,
  onConfirm,
  calculateTotal,
  calculateReturnAmount,
  getDiscountedUnitPrice,
}) => {
  if (!order) return null;

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: "#faad14" }} />
          <span>Xác nhận hoàn trả đơn hàng</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      onOk={onConfirm}
      confirmLoading={loading}
      okText="Xác nhận hoàn trả"
      cancelText="Hủy"
      okButtonProps={{ danger: true }}
      width={700}
    >
      <div>
        <Descriptions
          column={1}
          bordered
          size="small"
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
          <Descriptions.Item label="Tổng tiền hoàn trả">
            <Text
              strong
              style={{ fontSize: "16px", color: "#ff4d4f" }}
            >
              ₫{calculateReturnAmount(order).toLocaleString()}
            </Text>
            {order.total_discount_amount && order.total_discount_amount > 0 && (
              <div style={{ marginTop: 4 }}>
                <Text
                  type="secondary"
                  style={{ fontSize: "12px" }}
                >
                  (Giá gốc: ₫{calculateTotal(order).toLocaleString()})
                </Text>
              </div>
            )}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          initialValues={{ reason: "Hoàn trả hàng" }}
        >
          <Form.Item
            label="Lý do hoàn trả"
            name="reason"
            rules={[
              { required: true, message: "Vui lòng nhập lý do hoàn trả" },
            ]}
          >
            <Input.TextArea
              placeholder="Nhập lý do hoàn trả hàng..."
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>

        <Divider />

        <Title level={5}>Danh sách sản phẩm sẽ được hoàn trả</Title>
        <Table
          dataSource={order.lines}
          columns={[
            {
              title: "Sản phẩm",
              dataIndex: ["product", "product_name"],
              key: "product_name",
            },
            {
              title: "Mã SP",
              dataIndex: ["product", "sku"],
              key: "sku",
              width: 100,
            },
            {
              title: "Số lượng",
              dataIndex: "quantity",
              key: "quantity",
              width: 100,
              align: "center" as const,
            },
            {
              title: "Đơn giá",
              dataIndex: "unit_price",
              key: "unit_price",
              width: 150,
              render: (price: number, record: SaleOrderLineResponse) => {
                if (record.is_free_item) {
                  return (
                    <Text
                      type="success"
                      strong
                    >
                      MIỄN PHÍ
                    </Text>
                  );
                }
                const discountedPrice = getDiscountedUnitPrice(order, price);
                const hasDiscount =
                  order.total_discount_amount &&
                  order.total_discount_amount > 0;

                return (
                  <div>
                    <div>₫{discountedPrice.toLocaleString()}</div>
                    {hasDiscount && (
                      <Text
                        type="secondary"
                        delete
                        style={{ fontSize: "11px" }}
                      >
                        ₫{price.toLocaleString()}
                      </Text>
                    )}
                  </div>
                );
              },
            },
            {
              title: "Thành tiền",
              key: "total",
              width: 150,
              render: (_: unknown, record: SaleOrderLineResponse) => {
                if (record.is_free_item) {
                  return (
                    <Text
                      type="success"
                      strong
                    >
                      ₫0
                    </Text>
                  );
                }
                const discountedPrice = getDiscountedUnitPrice(
                  order,
                  record.unit_price
                );
                const lineTotal = record.quantity * discountedPrice;
                const originalTotal = record.quantity * record.unit_price;
                const hasDiscount =
                  order.total_discount_amount &&
                  order.total_discount_amount > 0;

                return (
                  <div>
                    <Text
                      strong
                      style={{ color: "#ff4d4f" }}
                    >
                      ₫{lineTotal.toLocaleString()}
                    </Text>
                    {hasDiscount && (
                      <div>
                        <Text
                          type="secondary"
                          delete
                          style={{ fontSize: "11px" }}
                        >
                          ₫{originalTotal.toLocaleString()}
                        </Text>
                      </div>
                    )}
                  </div>
                );
              },
            },
          ]}
          pagination={false}
          rowKey="id"
          size="small"
          scroll={{ y: 200 }}
        />
      </div>
    </Modal>
  );
};

export default ReturnOrderModal;
