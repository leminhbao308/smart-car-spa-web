import React from "react";
import {
  Modal,
  Button,
  Space,
  Descriptions,
  Tag,
  Typography,
  Divider,
  Table,
  Tabs,
} from "antd";
import {
  FileTextOutlined,
  PrinterOutlined,
  DownloadOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { SaleOrderLineResponse, SaleOrderResponse } from "@/lib/api";
import PromotionSnapshot from "./PromotionSnapshot";

const { Text } = Typography;

interface InvoiceDetailModalProps {
  visible: boolean;
  order: SaleOrderResponse | null;
  onClose: () => void;
  onPrint: (order: SaleOrderResponse) => void;
  onExport: (order: SaleOrderResponse) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  calculateTotal: (order: SaleOrderResponse) => number;
}

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  visible,
  order,
  onClose,
  onPrint,
  onExport,
  getStatusColor,
  getStatusText,
  calculateTotal,
}) => {
  if (!order) return null;

  // Build footer buttons based on order status
  const footerButtons = [];

  // Only show print and export buttons if order is not cancelled
  if (order.status !== "CANCELLED") {
    footerButtons.push([
      <Button
        key="print"
        icon={<PrinterOutlined />}
        onClick={() => onPrint(order)}
      >
        In hóa đơn
      </Button>,
      <Button
        key="export"
        icon={<DownloadOutlined />}
        onClick={() => onExport(order)}
      >
        Xuất file
      </Button>,
    ]);
  }

  footerButtons.push(
    <Button
      key="close"
      type="primary"
      onClick={onClose}
    >
      Đóng
    </Button>
  );

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          <span>Chi tiết hóa đơn</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={footerButtons}
      width={900}
    >
      <div>
        {/* General Information - Always visible */}
        <Descriptions
          column={2}
          bordered
          size="small"
        >
          <Descriptions.Item
            label="Mã đơn hàng"
            span={2}
          >
            <Text
              strong
              copyable
            >
              {order.id}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item
            label="Ngày tạo"
            span={1}
          >
            {dayjs(order.created_date).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item
            label="Người tạo"
            span={1}
          >
            {order.created_by}
          </Descriptions.Item>
          <Descriptions.Item
            label="Khách hàng"
            span={1}
          >
            {order.customer?.full_name || "Khách lẻ"}
          </Descriptions.Item>
          <Descriptions.Item
            label="Số điện thoại"
            span={1}
          >
            {order.customer?.phone_number || ""}
          </Descriptions.Item>
          <Descriptions.Item
            label="Chi nhánh"
            span={1}
          >
            {order.branch.branch_name}
          </Descriptions.Item>
          <Descriptions.Item
            label="Địa chỉ"
            span={1}
          >
            {order.branch.address}
          </Descriptions.Item>
          <Descriptions.Item
            label="Trạng thái"
            span={1}
          >
            <Tag color={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Tag>
          </Descriptions.Item>

          {/* Pricing Information */}
          {order.total_discount_amount && order.total_discount_amount > 0 ? (
            <>
              <Descriptions.Item
                label="Tổng tiền gốc"
                span={1}
              >
                <Text style={{ fontSize: "15px" }}>
                  ₫
                  {(
                    order.original_amount ||
                    calculateTotal(order) + order.total_discount_amount
                  ).toLocaleString()}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label="Giảm giá"
                span={1}
              >
                <Tag
                  color="red"
                  icon={<GiftOutlined />}
                  style={{ fontSize: "13px" }}
                >
                  -₫{order.total_discount_amount.toLocaleString()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item
                label="Tổng thanh toán"
                span={1}
              >
                <Text
                  strong
                  style={{ fontSize: "18px", color: "#52c41a" }}
                >
                  ₫
                  {(
                    order.final_amount ?? calculateTotal(order)
                  ).toLocaleString()}
                </Text>
              </Descriptions.Item>
            </>
          ) : (
            <Descriptions.Item
              label="Tổng thanh toán"
              span={2}
            >
              <Text
                strong
                style={{ fontSize: "18px", color: "#1890ff" }}
              >
                ₫
                {(order.final_amount ?? calculateTotal(order)).toLocaleString()}
              </Text>
            </Descriptions.Item>
          )}
        </Descriptions>

        <Divider style={{ margin: "16px 0" }} />

        {/* Tabs for Promotions, Products and Cancellation Reason */}
        <Tabs
          defaultActiveKey="products"
          items={[
            {
              key: "products",
              label: "Chi tiết sản phẩm",
              children: (
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
                      width: 120,
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
                      width: 130,
                      render: (price: number, record: SaleOrderLineResponse) =>
                        record.is_free_item ? (
                          <Text
                            type="success"
                            strong
                          >
                            MIỄN PHÍ
                          </Text>
                        ) : (
                          `₫${Number(price).toLocaleString()}`
                        ),
                    },
                    {
                      title: "Thành tiền",
                      key: "total",
                      width: 150,
                      render: (_: unknown, record: SaleOrderLineResponse) =>
                        record.is_free_item ? (
                          <Text
                            type="success"
                            strong
                          >
                            ₫0
                          </Text>
                        ) : (
                          <Text strong>
                            ₫
                            {(
                              record.quantity * record.unit_price
                            ).toLocaleString()}
                          </Text>
                        ),
                    },
                  ]}
                  pagination={false}
                  rowKey={(record) => record.id}
                  size="small"
                />
              ),
            },
            {
              key: "promotions",
              label: "Khuyến mãi",
              children: (
                <PromotionSnapshot
                  snapshotJson={order.promotion_snapshot}
                  totalDiscountAmount={order.total_discount_amount}
                  discountPercentage={order.discount_percentage}
                  originalAmount={order.original_amount}
                  finalAmount={order.final_amount ?? calculateTotal(order)}
                  orderLines={order.lines}
                />
              ),
            },
            ...(order.status === "CANCELLED" && order.cancellation_reason
              ? [
                  {
                    key: "cancellation",
                    label: "Lý do hủy",
                    children: (
                      <div style={{ padding: "16px" }}>
                        <Text
                          strong
                          style={{
                            fontSize: "14px",
                            display: "block",
                            marginBottom: "8px",
                          }}
                        >
                          Lý do hủy đơn hàng:
                        </Text>
                        <div
                          style={{
                            padding: "12px",
                            backgroundColor: "#fff2e8",
                            border: "1px solid #ffbb96",
                            borderRadius: "6px",
                          }}
                        >
                          <Text style={{ whiteSpace: "pre-wrap" }}>
                            {order.cancellation_reason}
                          </Text>
                        </div>
                      </div>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </div>
    </Modal>
  );
};

export default InvoiceDetailModal;
