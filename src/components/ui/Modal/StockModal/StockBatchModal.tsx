"use client";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Table,
  Tag,
  Spin,
  Empty,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Input,
  DatePicker,
} from "antd";
import { ColumnsType } from "antd/es/table";
import {
  InboxOutlined,
  CalendarOutlined,
  DollarOutlined,
  ShoppingOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import { Product, InventoryLotDTO, InventoryLotSummary } from "@/lib/api";
import { InventoryLotService } from "@/lib/api/services/inventory-lot.service";
import dayjs, { Dayjs } from "dayjs";
import "./StockBatchModal.css";

interface StockBatchModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product | null;
  branchId?: string | null;
  currentStock?: number; // Current available stock for the product (for reference)
}

interface StockBatchItem extends InventoryLotDTO {
  key: string;
  isExpiringSoon?: boolean;
  isExpired?: boolean;
}

const StockBatchModal: React.FC<StockBatchModalProps> = ({
  visible,
  onClose,
  product,
  branchId,
  currentStock = 0,
}) => {
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState<StockBatchItem[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<StockBatchItem[]>([]);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);
  const [summary, setSummary] = useState<InventoryLotSummary | null>(null);

  useEffect(() => {
    if (visible && product && branchId) {
      fetchBatches();
    } else {
      // Reset when closed
      setBatches([]);
      setFilteredBatches([]);
      setSearchText("");
      setDateRange([null, null]);
      setSummary(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, product, branchId]);

  useEffect(() => {
    // Apply filters
    let filtered = [...batches];

    // Filter by search text (lot code or supplier)
    if (searchText) {
      filtered = filtered.filter(
        (batch) =>
          batch.lot_code?.toLowerCase().includes(searchText.toLowerCase()) ||
          batch.supplier_name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by date range
    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter((batch) => {
        const batchDate = dayjs(batch.received_at);
        return (
          batchDate.isAfter(dateRange[0]!) &&
          batchDate.isBefore(dateRange[1]!.add(1, "day"))
        );
      });
    }

    setFilteredBatches(filtered);
  }, [batches, searchText, dateRange]);

  const fetchBatches = async () => {
    if (!product || !branchId) return;

    setLoading(true);
    try {
      const data = await InventoryLotService.getProductLotSummary(
        branchId,
        product.product_id
      );

      if (!data?.lots) {
        setBatches([]);
        setFilteredBatches([]);
        setSummary(null);
        return;
      }

      setSummary(data);

      // Sort by date descending and process batches
      const sortedData = [...data.lots]
        .sort(
          (a, b) =>
            new Date(b.received_at).getTime() -
            new Date(a.received_at).getTime()
        )
        .map((item) => {
          const batchItem: StockBatchItem = {
            ...item,
            key: item.lot_id,
          };

          // Check expiry status
          if (item.expiry_date) {
            const expiryDate = dayjs(item.expiry_date);
            const today = dayjs();
            const daysUntilExpiry = expiryDate.diff(today, "day");

            if (daysUntilExpiry < 0) {
              batchItem.isExpired = true;
            } else if (daysUntilExpiry <= 30) {
              batchItem.isExpiringSoon = true;
            }
          }

          return batchItem;
        });

      setBatches(sortedData);
      setFilteredBatches(sortedData);
    } catch (error) {
      console.log("Failed to fetch stock batches:", error);
      setBatches([]);
      setFilteredBatches([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  // Calculate statistics
  const totalBatches = batches.length;
  const totalQuantity = batches.reduce(
    (sum, batch) => sum + batch.qty_received,
    0
  );
  const totalValue = batches.reduce(
    (sum, batch) => sum + batch.qty_received * batch.unit_cost,
    0
  );
  const avgUnitCost = batches.length > 0 ? totalValue / totalQuantity : 0;
  const expiringBatches = batches.filter(
    (b) => b.isExpiringSoon || b.isExpired
  ).length;

  const columns: ColumnsType<StockBatchItem> = [
    {
      title: "Mã lô hàng",
      dataIndex: "lot_code",
      key: "lot_code",
      width: 150,
      fixed: "left",
      render: (lotCode: string | null) => (
        <div style={{ fontWeight: 600, color: "#1890ff" }}>
          {lotCode || <span style={{ color: "#999" }}>Không có mã lô</span>}
        </div>
      ),
    },
    {
      title: "Ngày nhập",
      dataIndex: "received_at",
      key: "received_at",
      width: 160,
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: "#1890ff" }} />
          <span>{new Date(date).toLocaleString("vi-VN")}</span>
        </Space>
      ),
      sorter: (a, b) =>
        new Date(a.received_at).getTime() - new Date(b.received_at).getTime(),
    },
    {
      title: "Nhà cung cấp",
      key: "supplier",
      width: 200,
      render: (_, record) => (
        <Space>
          <ShoppingOutlined style={{ color: "#52c41a" }} />
          <span>{record.supplier_name || "N/A"}</span>
        </Space>
      ),
    },
    {
      title: "Số lượng nhập",
      dataIndex: "qty_received",
      key: "qty_received",
      width: 120,
      align: "right",
      render: (qty: number) => (
        <span style={{ fontWeight: 600, fontSize: 16, color: "#1890ff" }}>
          {qty}
        </span>
      ),
      sorter: (a, b) => a.qty_received - b.qty_received,
    },
    {
      title: "Số lượng tồn",
      dataIndex: "qty_current",
      key: "qty_current",
      width: 120,
      align: "right",
      render: (qty: number) => (
        <Tag
          color={qty > 0 ? "green" : "red"}
          style={{ fontSize: 14, padding: "4px 12px", fontWeight: 600 }}
        >
          {qty}
        </Tag>
      ),
      sorter: (a, b) => a.qty_current - b.qty_current,
    },
    {
      title: "Đơn giá",
      dataIndex: "unit_cost",
      key: "unit_cost",
      width: 140,
      align: "right",
      render: (price: number) => (
        <span style={{ fontWeight: 500 }}>{formatCurrency(price)}</span>
      ),
      sorter: (a, b) => a.unit_cost - b.unit_cost,
    },
    {
      title: "Thành tiền",
      key: "total",
      width: 160,
      align: "right",
      render: (_, record) => {
        const total = record.qty_received * record.unit_cost;
        return (
          <span style={{ fontWeight: 600, fontSize: 15, color: "#52c41a" }}>
            {formatCurrency(total)}
          </span>
        );
      },
      sorter: (a, b) =>
        a.qty_received * a.unit_cost - b.qty_received * b.unit_cost,
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "expiry_date",
      key: "expiry_date",
      width: 180,
      render: (date: string | null, record) => {
        if (!date) {
          return <Tag color="default">Không có HSD</Tag>;
        }

        const expiryDate = dayjs(date);
        const formattedDate = expiryDate.format("DD/MM/YYYY");

        if (record.isExpired) {
          return (
            <Tag
              icon={<ExclamationCircleOutlined />}
              color="error"
            >
              Đã hết hạn: {formattedDate}
            </Tag>
          );
        }

        if (record.isExpiringSoon) {
          const daysLeft = expiryDate.diff(dayjs(), "day");
          return (
            <Tag
              icon={<ExclamationCircleOutlined />}
              color="warning"
            >
              Còn {daysLeft} ngày: {formattedDate}
            </Tag>
          );
        }

        return <Tag color="success">{formattedDate}</Tag>;
      },
      sorter: (a, b) => {
        if (!a.expiry_date && !b.expiry_date) return 0;
        if (!a.expiry_date) return 1;
        if (!b.expiry_date) return -1;
        return (
          new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
        );
      },
    },
  ];

  return (
    <Modal
      title={
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
            <InboxOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            Thông tin hàng tồn kho theo lô
          </div>
          <div style={{ fontSize: 14, fontWeight: 400, color: "#666" }}>
            {product.product_name} ({product.sku})
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1400}
      style={{ top: 20 }}
    >
      <Spin spinning={loading}>
        {batches.length === 0 && !loading ? (
          <Empty
            description="Sản phẩm này chưa có lô hàng nhập nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div>
            {/* Statistics Cards */}
            <Row
              gutter={16}
              style={{ marginBottom: 24 }}
            >
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Tổng số lô"
                    value={totalBatches}
                    prefix={<InboxOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Tổng số lượng"
                    value={totalQuantity}
                    valueStyle={{ color: "#52c41a", fontWeight: 600 }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Đơn giá TB"
                    value={avgUnitCost}
                    precision={0}
                    formatter={(value) => formatCurrency(Number(value))}
                    prefix={<DollarOutlined />}
                    valueStyle={{ color: "#faad14" }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Lô sắp hết hạn"
                    value={expiringBatches}
                    prefix={<ExclamationCircleOutlined />}
                    valueStyle={{
                      color: expiringBatches > 0 ? "#ff4d4f" : "#52c41a",
                    }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 16, padding: 16 }}>
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <Space
                  size="large"
                  wrap
                >
                  <div>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>
                      Tìm kiếm:
                    </div>
                    <Input.Search
                      placeholder="Mã lô hoặc nhà cung cấp..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      style={{ width: 300 }}
                      allowClear
                    />
                  </div>
                  <div>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>
                      Khoảng thời gian nhập:
                    </div>
                    <DatePicker.RangePicker
                      value={dateRange}
                      onChange={(dates) =>
                        setDateRange(dates as [Dayjs | null, Dayjs | null])
                      }
                      format="DD/MM/YYYY"
                      placeholder={["Từ ngày", "Đến ngày"]}
                      style={{ width: 300 }}
                    />
                  </div>
                </Space>
                <div
                  style={{
                    fontSize: 12,
                    color: "#666",
                    backgroundColor: "#f0f9ff",
                    padding: "8px 12px",
                    borderRadius: 4,
                    border: "1px solid #bae6fd",
                  }}
                >
                  💡 <strong>Lưu ý:</strong> Số lượng tồn hiển thị là số lượng
                  hiện tại còn lại trong từng lô hàng (đã trừ đi số lượng đã bán
                  và đang đặt trước).
                </div>
              </Space>
            </Card>

            {/* Batches Table */}
            <Card
              title={
                <Space>
                  <span>Danh sách lô hàng</span>
                  <Tag color="blue">{filteredBatches.length} lô</Tag>
                </Space>
              }
            >
              <Table
                dataSource={filteredBatches}
                columns={columns}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} lô hàng`,
                }}
                size="middle"
                scroll={{ x: 1350 }}
                rowClassName={(record) => {
                  if (record.isExpired) return "row-expired";
                  if (record.isExpiringSoon) return "row-expiring-soon";
                  return "";
                }}
              />
            </Card>
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default StockBatchModal;
