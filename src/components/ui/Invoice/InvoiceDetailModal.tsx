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
  Card,
} from "antd";
import {
  FileTextOutlined,
  PrinterOutlined,
  DownloadOutlined,
  GiftOutlined,
  CarOutlined,
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
  // Check if this is a booking invoice
  const isBookingInvoice = order?.lines.some(
    (line) => line.is_service_item && line.original_booking_id
  );

  // Get booking info from order
  const bookingInfo = order?.booking_info;
  const bookingCode =
    bookingInfo?.booking_code ||
    order?.lines.find((line) => line.original_booking_code)
      ?.original_booking_code;

  // Debug: Log booking info
  React.useEffect(() => {
    if (isBookingInvoice && visible) {
      console.log("📋 Booking Invoice Detected");
      console.log("Booking Info:", bookingInfo);
      console.log("Booking Code:", bookingCode);
      console.log("Full Order:", order);
    }
  }, [isBookingInvoice, bookingInfo, bookingCode, visible, order]);

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

        {/* Booking Information Card - Show detailed info if available */}
        {isBookingInvoice && bookingInfo && (
          <>
            <Divider style={{ margin: "16px 0" }}>
              <Space>
                <CarOutlined />
                <Text strong>Thông tin Booking</Text>
              </Space>
            </Divider>
            <Descriptions
              column={2}
              bordered
              size="small"
            >
              <Descriptions.Item
                label="Mã Booking"
                span={1}
              >
                <Text
                  strong
                  copyable
                  style={{ color: "#1890ff" }}
                >
                  {bookingCode}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label="Biển số xe"
                span={1}
              >
                <Text strong>{bookingInfo.vehicle_license_plate}</Text>
              </Descriptions.Item>
              {bookingInfo.vehicle_brand_name && (
                <Descriptions.Item
                  label="Xe"
                  span={2}
                >
                  <Text>
                    {bookingInfo.vehicle_brand_name}
                    {bookingInfo.vehicle_model_name &&
                      ` ${bookingInfo.vehicle_model_name}`}
                    {bookingInfo.vehicle_year &&
                      ` (${bookingInfo.vehicle_year})`}
                  </Text>
                </Descriptions.Item>
              )}
              {bookingInfo.scheduled_start_at && (
                <Descriptions.Item
                  label="Thời gian hẹn"
                  span={1}
                >
                  {dayjs(bookingInfo.scheduled_start_at).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </Descriptions.Item>
              )}
              {bookingInfo.actual_check_in_at && (
                <Descriptions.Item
                  label="Check-in"
                  span={1}
                >
                  {dayjs(bookingInfo.actual_check_in_at).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </Descriptions.Item>
              )}
              {bookingInfo.notes && (
                <Descriptions.Item
                  label="Ghi chú"
                  span={2}
                >
                  <Text type="secondary">{bookingInfo.notes}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </>
        )}

        <Divider style={{ margin: "16px 0" }} />

        {/* Tabs for Promotions, Products/Services and Cancellation Reason */}
        <Tabs
          defaultActiveKey={isBookingInvoice ? "services" : "products"}
          items={[
            {
              key: isBookingInvoice ? "services" : "products",
              label: isBookingInvoice
                ? "Chi tiết dịch vụ"
                : "Chi tiết sản phẩm",
              children: (
                <Table
                  dataSource={order.lines}
                  columns={[
                    {
                      title: isBookingInvoice ? "Dịch vụ" : "Sản phẩm",
                      dataIndex: ["product", "product_name"],
                      key: "product_name",
                      render: (name: string, record: SaleOrderLineResponse) => {
                        // For service items, get name from booking_items
                        let displayName = name;
                        if (record.is_service_item && bookingInfo) {
                          const serviceItem = bookingInfo.booking_items?.find(
                            (item) => item.service_id === record.service_id
                          );
                          displayName = serviceItem?.service_name || name;
                        }

                        return (
                          <Space
                            direction="vertical"
                            size={2}
                          >
                            <Text>{displayName}</Text>
                            {record.original_booking_code && (
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                Từ booking: {record.original_booking_code}
                              </Text>
                            )}
                          </Space>
                        );
                      },
                    },
                    {
                      title: isBookingInvoice ? "Mã DV" : "Mã SP",
                      dataIndex: ["product", "sku"],
                      key: "sku",
                      width: 120,
                      render: (sku: string, record: SaleOrderLineResponse) => {
                        // For service items, show service_id instead
                        if (record.is_service_item) {
                          return (
                            <Text
                              type="secondary"
                              style={{ fontSize: "12px" }}
                              ellipsis={{tooltip: record.service_id}}
                              copyable
                            >
                              {record.service_id}
                            </Text>
                          );
                        }
                        return sku;
                      },
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
