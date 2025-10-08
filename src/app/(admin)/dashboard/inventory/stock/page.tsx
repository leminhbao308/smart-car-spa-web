"use client";
import React, { useState, useEffect, useMemo } from "react";
import { AdminTable } from "@/components/ui/Table";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import { ColumnsType } from "antd/es/table";
import { Tag, Badge, message, Select, Space, Tooltip } from "antd";
import {
  EyeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import { InventoryService, WarehouseService, PurchaseOrderService } from "@/lib/api";
import { useInventoryLevels } from "@/lib/api/hooks";
import { useProducts } from "@/lib/api/hooks/useProducts";
import { useBranches } from "@/lib/api/hooks/useBranches";
import { usePricing } from "@/lib/api/hooks/usePricing";
import { InventoryLevel, Warehouse, Product, PurchaseOrder } from "@/lib/api";

interface StockTableItem extends InventoryLevel {
  key: string;
  stockStatus: "low" | "normal" | "high" | "out";
  branchName?: string;
  lastPurchasePrice?: number;
  sellingPrice?: number;
  profitMargin?: number;
}

const StockInventoryPage = () => {
  const [data, setData] = useState<StockTableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const { showModal } = useConfirmationModalContext();
  const inventoryHook = useInventoryLevels();
  const { products } = useProducts({});
  const { branches, loading: branchesLoading } = useBranches({});
  const pricingHook = usePricing();

  // Create branch map for quick lookup
  const branchMap = useMemo(() => {
    const map = new Map();
    branches.forEach((branch) => {
      map.set(branch.branch_id, branch.branch_name);
    });
    return map;
  }, [branches]);

  // Fetch warehouses and purchase orders on mount
  useEffect(() => {
    fetchWarehouses();
    fetchPurchaseOrders();
  }, []);

  // Fetch inventory when warehouse selected
  useEffect(() => {
    if (selectedWarehouse && products.length > 0 && branches.length > 0) {
      fetchInventoryLevels();
    }
  }, [selectedWarehouse, products, branches, purchaseOrders]);

  const fetchWarehouses = async () => {
    try {
      const warehouseList = await WarehouseService.getAllWarehouses();
      setWarehouses(warehouseList);
      if (warehouseList.length > 0) {
        setSelectedWarehouse(warehouseList[0].id);
      }
    } catch (error: any) {
      message.error(error?.message || "Không thể tải danh sách kho");
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const orders = await PurchaseOrderService.getAllPurchaseOrders();
      setPurchaseOrders(orders.filter(po => po.status === "RECEIVED"));
    } catch (error: any) {
      console.error("Failed to fetch purchase orders:", error);
    }
  };

  const getLastPurchasePrice = (productId: string, warehouseId: string): number | undefined => {
    // Find last received purchase order for this product in this warehouse
    const relevantPOs = purchaseOrders
      .filter(po => po.warehouse.id === warehouseId)
      .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());

    for (const po of relevantPOs) {
      const line = po.lines.find(l => l.product.productId === productId);
      if (line) {
        return line.unit_cost;
      }
    }
    return undefined;
  };

  const fetchInventoryLevels = async () => {
    if (!selectedWarehouse || products.length === 0) return;

    setLoading(true);
    try {
      const productIds = products.map((p: Product) => p.productId);
      const batchResult = await inventoryHook.levelsBatch({
        warehouse_id: selectedWarehouse,
        product_ids: productIds,
      });

      // Fetch selling prices for all products
      let sellingPrices: { [productId: string]: number } = {};
      try {
        const pricingResult = await pricingHook.previewBatch({
          items: products.map((p: Product) => ({
            product_id: p.productId,
            qty: 1,
          })),
        });
        pricingResult.items.forEach((item) => {
          if (item.product && item.product.id) {
            sellingPrices[item.product.id] = item.total_price;
          }
        });
      } catch (error) {
        console.error("Failed to fetch pricing:", error);
      }

      const selectedWh = warehouses.find((w) => w.id === selectedWarehouse);
      if (!selectedWh) {
        console.error("Selected warehouse not found:", selectedWarehouse);
        return;
      }
      
      const branchName = selectedWh?.branch?.id
        ? branchMap.get(selectedWh.branch.id)
        : "N/A";

      const stockItems: StockTableItem[] = products.map((product: Product) => {
        const invData = batchResult.items?.[product.productId];
        const onHand = invData?.on_hand || 0;
        const reserved = invData?.reserved || 0;
        const available = invData?.available || 0;

        let stockStatus: "low" | "normal" | "high" | "out" = "normal";
        if (onHand === 0) {
          stockStatus = "out";
        } else if (product.minStockLevel && onHand < product.minStockLevel) {
          stockStatus = "low";
        } else if (product.maxStockLevel && onHand > product.maxStockLevel) {
          stockStatus = "high";
        }

        const lastPurchasePrice = getLastPurchasePrice(product.productId, selectedWarehouse);
        const sellingPrice = sellingPrices[product.productId];
        const profitMargin = lastPurchasePrice && sellingPrice
          ? ((sellingPrice - lastPurchasePrice) / lastPurchasePrice) * 100
          : undefined;

        return {
          key: product.productId,
          id: product.productId,
          product: product,
          warehouse: selectedWh,
          on_hand: onHand,
          reserved: reserved,
          available: available,
          created_date: invData?.created_date || new Date().toISOString(),
          created_by: invData?.created_by || "",
          modified_date: invData?.modified_date || new Date().toISOString(),
          modified_by: invData?.modified_by || "",
          is_active: invData?.is_active ?? true,
          stockStatus,
          branchName,
          lastPurchasePrice,
          sellingPrice,
          profitMargin,
        };
      });

      setData(stockItems);
    } catch (error: any) {
      message.error(error?.message || "Không thể tải dữ liệu tồn kho");
    } finally {
      setLoading(false);
    }
  };

  // Get warehouse display name
  const getWarehouseName = (warehouse: Warehouse) => {
    if (warehouse?.branch?.id) {
      const branchName = branchMap.get(warehouse.branch.id);
      return branchName || warehouse.id.substring(0, 8);
    }
    return warehouse?.id?.substring(0, 8) || "N/A";
  };

  // Định nghĩa columns
  const columns: ColumnsType<StockTableItem> = [
    {
      title: "Mã SP",
      dataIndex: ["product", "sku"],
      key: "sku",
      width: 100,
      fixed: "left",
      render: (sku: string) => <div style={{ fontWeight: 500 }}>{sku}</div>,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: ["product", "productName"],
      key: "productName",
      width: 250,
      fixed: "left",
      ellipsis: true,
    },
    {
      title: "Danh mục",
      dataIndex: ["product", "categoryName"],
      key: "categoryName",
      width: 150,
    },
    {
      title: "Thương hiệu",
      dataIndex: ["product", "brand"],
      key: "brand",
      width: 120,
    },
    {
      title: "Tồn kho",
      dataIndex: "on_hand",
      key: "on_hand",
      width: 100,
      sorter: (a, b) => a.on_hand - b.on_hand,
      render: (qty: number, record) => (
        <div style={{ fontWeight: 600 }}>
          {qty}
          {record.stockStatus === "out" && (
            <Tag color="red" style={{ marginLeft: 8, fontSize: 10 }}>
              Hết
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Đã đặt",
      dataIndex: "reserved",
      key: "reserved",
      width: 90,
      render: (qty: number) => (
        <div style={{ color: "#faad14" }}>{qty}</div>
      ),
    },
    {
      title: "Khả dụng",
      dataIndex: "available",
      key: "available",
      width: 90,
      render: (qty: number) => (
        <div style={{ color: "#52c41a", fontWeight: 500 }}>{qty}</div>
      ),
    },
    {
      title: "Min/Max",
      key: "minMax",
      width: 100,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          {record.product.minStockLevel}/{record.product.maxStockLevel}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "stockStatus",
      key: "stockStatus",
      width: 120,
      render: (status: string) => {
        const statusConfig = {
          out: { label: "Hết hàng", color: "red" },
          low: { label: "Sắp hết", color: "orange" },
          normal: { label: "Bình thường", color: "green" },
          high: { label: "Dư thừa", color: "blue" },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
      filters: [
        { text: "Hết hàng", value: "out" },
        { text: "Sắp hết", value: "low" },
        { text: "Bình thường", value: "normal" },
        { text: "Dư thừa", value: "high" },
      ],
      onFilter: (value, record) => record.stockStatus === value,
    },
    {
      title: (
        <Tooltip title="Giá nhập gần nhất">
          <span>Giá nhập <DollarOutlined style={{ fontSize: 12 }} /></span>
        </Tooltip>
      ),
      dataIndex: "lastPurchasePrice",
      key: "lastPurchasePrice",
      width: 130,
      render: (price?: number) => (
        <div style={{ color: "#1890ff" }}>
          {price !== undefined ? formatCurrency(price) : <span style={{ color: "#999" }}>N/A</span>}
        </div>
      ),
    },
    {
      title: (
        <Tooltip title="Giá bán hiện tại">
          <span>Giá bán <DollarOutlined style={{ fontSize: 12 }} /></span>
        </Tooltip>
      ),
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      width: 130,
      render: (price?: number) => (
        <div style={{ color: "#52c41a", fontWeight: 500 }}>
          {price !== undefined ? formatCurrency(price) : <span style={{ color: "#999" }}>N/A</span>}
        </div>
      ),
    },
    {
      title: (
        <Tooltip title="Tỷ suất lợi nhuận">
          <span>Lãi suất</span>
        </Tooltip>
      ),
      dataIndex: "profitMargin",
      key: "profitMargin",
      width: 100,
      sorter: (a, b) => (a.profitMargin || 0) - (b.profitMargin || 0),
      render: (margin?: number) => {
        if (margin === undefined) return <span style={{ color: "#999" }}>N/A</span>;
        const color = margin > 30 ? "#52c41a" : margin > 15 ? "#faad14" : "#ff4d4f";
        return (
          <div style={{ color, fontWeight: 600 }}>
            {margin.toFixed(1)}%
          </div>
        );
      },
    },
    {
      title: "Giá trị tồn",
      key: "totalValue",
      width: 150,
      sorter: (a, b) => {
        const valueA = a.on_hand * (a.lastPurchasePrice || a.product.costPrice);
        const valueB = b.on_hand * (b.lastPurchasePrice || b.product.costPrice);
        return valueA - valueB;
      },
      render: (_, record) => {
        const price = record.lastPurchasePrice || record.product.costPrice;
        const totalValue = record.on_hand * price;
        return (
          <div style={{ fontWeight: 600, color: "#52c41a" }}>
            {formatCurrency(totalValue)}
          </div>
        );
      },
    },
    {
      title: "Cập nhật",
      dataIndex: "modified_date",
      key: "modified_date",
      width: 150,
      render: (date: string) =>
        date ? new Date(date).toLocaleString("vi-VN") : "N/A",
      sorter: (a, b) =>
        new Date(a.modified_date).getTime() - new Date(b.modified_date).getTime(),
    },
  ];

  const handleView = (record: StockTableItem) => {
    const profit = record.lastPurchasePrice && record.sellingPrice
      ? record.sellingPrice - record.lastPurchasePrice
      : undefined;

    showModal({
      title: "Chi tiết tồn kho",
      content: (
        <div style={{ lineHeight: 2 }}>
          <p><strong>Sản phẩm:</strong> {record.product.productName}</p>
          <p><strong>SKU:</strong> {record.product.sku}</p>
          <p><strong>Chi nhánh:</strong> {record.branchName}</p>
          <hr style={{ margin: "12px 0", borderColor: "#f0f0f0" }} />
          <p><strong>Tồn kho:</strong> {record.on_hand}</p>
          <p><strong>Đã đặt:</strong> {record.reserved}</p>
          <p><strong>Khả dụng:</strong> {record.available}</p>
          <hr style={{ margin: "12px 0", borderColor: "#f0f0f0" }} />
          <p><strong>Giá nhập:</strong> {record.lastPurchasePrice !== undefined ? formatCurrency(record.lastPurchasePrice) : "N/A"}</p>
          <p><strong>Giá bán:</strong> {record.sellingPrice !== undefined ? formatCurrency(record.sellingPrice) : "N/A"}</p>
          {profit !== undefined && (
            <>
              <p><strong>Lợi nhuận/sp:</strong> <span style={{ color: "#52c41a" }}>{formatCurrency(profit)}</span></p>
              <p><strong>Tỷ suất lãi:</strong> <span style={{ color: "#52c41a" }}>{record.profitMargin?.toFixed(1)}%</span></p>
            </>
          )}
          <hr style={{ margin: "12px 0", borderColor: "#f0f0f0" }} />
          <p><strong>Giá trị tồn:</strong> <span style={{ color: "#52c41a", fontWeight: 600 }}>{formatCurrency(record.on_hand * (record.lastPurchasePrice || record.product.costPrice))}</span></p>
        </div>
      ),
      type: "info",
    });
  };

  // Calculate summary
  const totalProducts = data.length;
  const outOfStock = data.filter((item) => item.stockStatus === "out").length;
  const lowStock = data.filter((item) => item.stockStatus === "low").length;
  const totalValue = data.reduce(
    (sum, item) => sum + item.on_hand * (item.lastPurchasePrice || item.product.costPrice),
    0
  );
  const avgProfitMargin = data.filter(item => item.profitMargin !== undefined).length > 0
    ? data.reduce((sum, item) => sum + (item.profitMargin || 0), 0) /
    data.filter(item => item.profitMargin !== undefined).length
    : 0;

  const isLoading = loading || inventoryHook.loading || branchesLoading || pricingHook.loading;

  return (
    <div>
      {/* Summary cards */}
      <div style={{ marginBottom: 16 }}>
        <Space size="large" wrap>
          <div style={{ padding: "12px 20px", background: "#f0f2f5", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#666" }}>Tổng sản phẩm</div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>{totalProducts}</div>
          </div>
          <div style={{ padding: "12px 20px", background: "#fff1f0", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#666" }}>Hết hàng</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: "#ff4d4f" }}>
              {outOfStock}
            </div>
          </div>
          <div style={{ padding: "12px 20px", background: "#fff7e6", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#666" }}>Sắp hết</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: "#faad14" }}>
              {lowStock}
            </div>
          </div>
          <div style={{ padding: "12px 20px", background: "#f6ffed", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#666" }}>Tổng giá trị</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: "#52c41a" }}>
              {formatCurrency(totalValue)}
            </div>
          </div>
          <div style={{ padding: "12px 20px", background: "#e6f7ff", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#666" }}>Lãi suất TB</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: "#1890ff" }}>
              {avgProfitMargin.toFixed(1)}%
            </div>
          </div>
        </Space>
      </div>

      {/* Warehouse selector */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <span style={{ fontWeight: 500 }}>Chọn kho:</span>
          <Select
            style={{ width: 300 }}
            value={selectedWarehouse}
            onChange={setSelectedWarehouse}
            placeholder="Chọn kho"
            loading={branchesLoading}
          >
            {warehouses.map((wh) => (
              <Select.Option key={wh.id} value={wh.id}>
                {getWarehouseName(wh)}
              </Select.Option>
            ))}
          </Select>
        </Space>
      </div>

      <AdminTable
        title="Quản lý tồn kho"
        dataSource={data}
        columns={columns}
        loading={isLoading}
        searchable={true}
        searchPlaceholder="Tìm kiếm sản phẩm theo tên, SKU, mã vạch..."
        searchFields={["product.productName", "product.sku", "product.barcode"]}
        actions={[
          {
            key: "view",
            label: "Xem chi tiết",
            type: "default",
            icon: <EyeOutlined />,
            onClick: handleView,
          },
        ]}
        scroll={{ x: 2000 }}
      />
    </div>
  );
};

export default StockInventoryPage;
