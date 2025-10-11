"use client";
import React, {useEffect, useMemo, useState} from "react";
import {AdminTable} from "@/components/ui/Table";
import {useConfirmationModalContext} from "@/components/ui/Modal";
import {ColumnsType} from "antd/es/table";
import {message, Select, Space, Tag, Tooltip} from "antd";
import {DollarOutlined, HistoryOutlined,} from "@ant-design/icons";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import {InventoryLevel, Product, PurchaseOrder, PurchaseOrderService} from "@/lib/api";
import {useInventoryLevels} from "@/lib/api/hooks";
import {useProducts} from "@/lib/api/hooks/useProducts";
import {useBranches} from "@/lib/api/hooks/useBranches";
import {usePricing} from "@/lib/api/hooks/usePricing";
import {useWarehouseByBranch} from "@/lib/api/hooks/useWarehouseByBranch";
import PriceHistoryModal from "@/components/ui/Modal/StockModal/PriceHistoryModal";

interface StockTableItem extends InventoryLevel {
  key: string;
  stockStatus: "low" | "normal" | "high" | "out";
  branchName?: string;
  lastPurchasePrice?: number;
  peakPurchasePrice?: number;
  sellingPrice?: number;
  profitMargin?: number;
}

const StockInventoryPage = () => {
  const [data, setData] = useState<StockTableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [priceHistoryVisible, setPriceHistoryVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const {showModal} = useConfirmationModalContext();
  const inventoryHook = useInventoryLevels();
  const {products} = useProducts({});
  const {branches, loading: branchesLoading} = useBranches({});
  const pricingHook = usePricing();

  // Get warehouse based on selected branch
  const {warehouse, loading: warehouseLoading} = useWarehouseByBranch(selectedBranch);

  // Create branch map for quick lookup
  const branchMap = useMemo(() => {
    const map = new Map();
    branches.forEach((branch) => {
      map.set(branch.branch_id, branch.branch_name);
    });
    return map;
  }, [branches]);

  // Set default branch when branches are loaded
  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0].branch_id);
    }
  }, [branches, selectedBranch]);

  // Fetch purchase orders on mount
  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  // Fetch inventory when warehouse is available
  useEffect(() => {
    if (warehouse && products.length > 0 && branches.length > 0) {
      fetchInventoryLevels();
    }
  }, [warehouse, products, branches, purchaseOrders]);

  const fetchPurchaseOrders = async () => {
    try {
      const orders = await PurchaseOrderService.getAllPurchaseOrders();
      setPurchaseOrders(orders);
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
    if (!warehouse || products.length === 0) return;

    setLoading(true);
    try {
      const productIds = products.map((p: Product) => p.productId);
      const batchResult = await inventoryHook.levelsBatch({
        warehouse_id: warehouse.id,
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
          if (item && item.product_id) {
            sellingPrices[item.product_id] = item.total_price;
          }
        });
      } catch (error) {
        console.error("Failed to fetch pricing:", error);
      }

      const branchName = warehouse?.branch?.id
        ? branchMap.get(warehouse.branch.id)
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

        const lastPurchasePrice = getLastPurchasePrice(product.productId, warehouse.id);
        const sellingPrice = sellingPrices[product.productId];
        const profitMargin = lastPurchasePrice && sellingPrice
          ? ((sellingPrice - lastPurchasePrice) / lastPurchasePrice) * 100
          : undefined;

        return {
          key: product.productId,
          id: product.productId,
          product: product,
          warehouse: warehouse,
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

  // Định nghĩa columns
  const columns: ColumnsType<StockTableItem> = [
    {
      title: "Mã SP",
      dataIndex: ["product", "sku"],
      key: "sku",
      width: 190,
      // fixed: "left",
      render: (sku: string) => <div style={{fontWeight: 500}}>{sku}</div>,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: ["product", "productName"],
      key: "productName",
      width: 250,
      fixed: "left",
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
        <div style={{fontWeight: 600}}>
          {qty}
          {record.stockStatus === "out" && (
            <Tag color="red" style={{marginLeft: 8, fontSize: 10}}>
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
        <div style={{color: "#faad14"}}>{qty}</div>
      ),
    },
    {
      title: "Khả dụng",
      dataIndex: "available",
      key: "available",
      width: 90,
      render: (qty: number) => (
        <div style={{color: "#52c41a", fontWeight: 500}}>{qty}</div>
      ),
    },
    {
      title: (
        <Tooltip title="Giá nhập gần nhất">
          <span>Giá nhập gần nhất <DollarOutlined style={{fontSize: 12}}/></span>
        </Tooltip>
      ),
      dataIndex: "lastPurchasePrice",
      key: "lastPurchasePrice",
      width: 130,
      render: (price?: number) => (
        <div>
          {price !== undefined ? formatCurrency(price) : <span style={{color: "#999"}}>Chưa nhập</span>}
        </div>
      ),
    },
    {
      title: (
        <Tooltip title="Giá bán hiện tại">
          <span>Giá bán hiện tại<DollarOutlined style={{fontSize: 12}}/></span>
        </Tooltip>
      ),
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      width: 130,
      render: (price?: number) => (
        <div style={{fontWeight: 500}}>
          {price !== undefined ? formatCurrency(price) : <span style={{color: "#999"}}>Chưa có giá</span>}
        </div>
      ),
    },
    {
      title: "Cập nhật lần cuối",
      dataIndex: "modified_date",
      key: "modified_date",
      width: 150,
      render: (date: string) =>
        date ? new Date(date).toLocaleString("vi-VN") : "N/A",
      sorter: (a, b) =>
        new Date(a.modified_date).getTime() - new Date(b.modified_date).getTime(),
    },
  ];

  const handlePriceHistory = (record: StockTableItem) => {
    setSelectedProduct(record.product);
    setPriceHistoryVisible(true);
  };

  const fetchPriceHistory = async (productId: string) => {
    try {
      return await PurchaseOrderService.getProductPOHistory(productId);
    } catch (error) {
      console.error("Failed to fetch price history:", error);
      return null;
    }
  };

  // Calculate summary
  const totalProducts = data.length;
  const outOfStock = data.filter((item) => item.stockStatus === "out").length;
  const lowStock = data.filter((item) => item.stockStatus === "low").length;

  const isLoading = loading || inventoryHook.loading || branchesLoading || pricingHook.loading || warehouseLoading;

  return (
    <div>
      {/* Summary cards */}
      <div style={{marginBottom: 16}}>
        <Space size="large" wrap>
          <div style={{padding: "12px 20px", background: "#f0f2f5", borderRadius: 8}}>
            <div style={{fontSize: 12, color: "#666"}}>Tổng sản phẩm</div>
            <div style={{fontSize: 24, fontWeight: 600}}>{totalProducts}</div>
          </div>
          <div style={{padding: "12px 20px", background: "#fff1f0", borderRadius: 8}}>
            <div style={{fontSize: 12, color: "#666"}}>Hết hàng</div>
            <div style={{fontSize: 24, fontWeight: 600, color: "#ff4d4f"}}>
              {outOfStock}
            </div>
          </div>
          <div style={{padding: "12px 20px", background: "#fff7e6", borderRadius: 8}}>
            <div style={{fontSize: 12, color: "#666"}}>Sắp hết</div>
            <div style={{fontSize: 24, fontWeight: 600, color: "#faad14"}}>
              {lowStock}
            </div>
          </div>
        </Space>
      </div>

      {/* Branch selector */}
      <div style={{marginBottom: 16}}>
        <Space>
          <span style={{fontWeight: 500}}>Chọn chi nhánh:</span>
          <Select
            style={{width: 500}}
            value={selectedBranch}
            onChange={setSelectedBranch}
            placeholder="Chọn chi nhánh"
            loading={branchesLoading}
          >
            {branches.map((branch) => (
              <Select.Option key={branch.branch_id} value={branch.branch_id}>
                {branch.branch_name} - {branch.address || ""}
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
            key: "priceHistory",
            label: "Lịch sử giá",
            type: "default",
            icon: <HistoryOutlined/>,
            onClick: handlePriceHistory,
            fixed: true
          },
        ]}
        scroll={{x: 2000}}
      />

      {/* Price History Modal */}
      <PriceHistoryModal
        visible={priceHistoryVisible}
        onClose={() => {
          setPriceHistoryVisible(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        warehouseId={warehouse?.id || ""}
        onFetchHistory={fetchPriceHistory}
      />
    </div>
  );
};

export default StockInventoryPage;
