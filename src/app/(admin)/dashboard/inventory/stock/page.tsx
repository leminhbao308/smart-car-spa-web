"use client";
import React, {useEffect, useMemo, useState} from "react";
import {AdminTable} from "@/components/ui/Table";
import {useConfirmationModalContext} from "@/components/ui/Modal";
import {ColumnsType} from "antd/es/table";
import {App, Button, DatePicker, message, Modal, Select, Space, Tag, Tooltip} from "antd";
import {DollarOutlined, DownloadOutlined, FileExcelOutlined, HistoryOutlined,} from "@ant-design/icons";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import {InventoryLevel, InventoryService, Product, PurchaseOrder, PurchaseOrderService} from "@/lib/api";
import {useInventoryLevels} from "@/lib/api/hooks";
import {useProducts} from "@/lib/api/hooks/useProducts";
import {useBranches} from "@/lib/api/hooks/useBranches";
import {usePricing} from "@/lib/api/hooks/usePricing";
import {useWarehouseByBranch} from "@/lib/api/hooks/useWarehouseByBranch";
import PriceHistoryModal from "@/components/ui/Modal/StockModal/PriceHistoryModal";
import dayjs, {Dayjs} from "dayjs";

const {RangePicker} = DatePicker;

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
  // Ant Design Message
  const { message } = App.useApp();

  // State variables
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

  // Export report states
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportDate, setExportDate] = useState<Dayjs | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportBranch, setExportBranch] = useState<string | undefined>(undefined);

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
      const line = po.lines.find(l => l.product.product_id === productId);
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
      const productIds = products.map((p: Product) => p.product_id);
      const batchResult = await inventoryHook.levelsBatch({
        warehouse_id: warehouse.id,
        product_ids: productIds,
      });

      // Fetch selling prices for all products
      const sellingPrices: { [productId: string]: number } = {};
      try {
        const pricingResult = await pricingHook.previewBatch({
          items: products.map((p: Product) => ({
            product_id: p.product_id,
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

      const branchName = warehouse?.branch?.branch_id
        ? branchMap.get(warehouse.branch.branch_id)
        : "N/A";

      const stockItems: StockTableItem[] = products.map((product: Product) => {
        const invData = batchResult.items?.[product.product_id];
        const onHand = invData?.on_hand || 0;
        const reserved = invData?.reserved || 0;
        const available = invData?.available || 0;

        let stockStatus: "low" | "normal" | "high" | "out" = "normal";
        if (onHand === 0) {
          stockStatus = "out";
        } else if (onHand < 1000) {
          stockStatus = "low";
        } else if (onHand > 2000) {
          stockStatus = "high";
        }

        const lastPurchasePrice = getLastPurchasePrice(product.product_id, warehouse.id);
        const sellingPrice = sellingPrices[product.product_id];
        const profitMargin = lastPurchasePrice && sellingPrice
          ? ((sellingPrice - lastPurchasePrice) / lastPurchasePrice) * 100
          : undefined;

        return {
          key: product.product_id,
          id: product.product_id,
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

  const handleOpenExportModal = () => {
    // Set default date to today
    setExportDate(dayjs());
    setExportBranch(undefined);
    setExportModalVisible(true);
  };

  const handleExportReport = async () => {
    if (!exportDate) {
      message.error("Vui lòng chọn ngày để xuất báo cáo");
      return;
    }

    setExportLoading(true);
    try {
      const date = exportDate.format("YYYY-MM-DD");

      await InventoryService.exportStockReport(
        date,
        exportBranch
      );

      message.success("Xuất báo cáo thành công");
      setExportModalVisible(false);
    } catch (error: any) {
      message.error(error?.message || "Có lỗi xảy ra khi xuất báo cáo");
    } finally {
      setExportLoading(false);
    }
  };

  const handleCloseExportModal = () => {
    setExportModalVisible(false);
    setExportDate(null);
    setExportBranch(undefined);
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
      dataIndex: ["product", "product_name"],
      key: "product_name",
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
        extraButtons={[
          <Button
            key="export"
            type="default"
            icon={<FileExcelOutlined/>}
            onClick={handleOpenExportModal}
            style={{
              backgroundColor: "#10b981",
              borderColor: "#10b981",
              color: "white",
            }}
          >
            Xuất báo cáo Excel
          </Button>
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

      {/* Modal xuất báo cáo */}
      <Modal
        title={
          <Space>
            <FileExcelOutlined style={{color: "#10b981"}}/>
            <span>Xuất báo cáo tồn kho</span>
          </Space>
        }
        open={exportModalVisible}
        onCancel={handleCloseExportModal}
        footer={[
          <Button key="cancel" onClick={handleCloseExportModal}>
            Hủy
          </Button>,
          <Button
            key="export"
            type="primary"
            icon={<DownloadOutlined/>}
            loading={exportLoading}
            onClick={handleExportReport}
            style={{backgroundColor: "#10b981", borderColor: "#10b981"}}
            disabled={!exportDate || (!exportBranch && branches.length > 1)}
          >
            Xuất Excel
          </Button>
        ]}
        width={500}
      >
        <Space direction="vertical" style={{width: "100%"}} size="large">
          <div>
            <label style={{display: "block", marginBottom: 8, fontWeight: 500}}>
              Ngày xuất báo cáo <span style={{color: "red"}}>*</span>
            </label>
            <DatePicker
              value={exportDate}
              onChange={(date) => setExportDate(date)}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày"
              style={{width: "100%"}}
            />
          </div>

          <div>
            <label style={{display: "block", marginBottom: 8, fontWeight: 500}}>
              Chi nhánh
            </label>
            <Select
              value={exportBranch}
              onChange={setExportBranch}
              placeholder="Chọn chi nhánh"
              allowClear
              style={{width: "100%"}}
              options={branches.map(branch => ({
                value: branch.branch_id,
                label: branch.branch_name
              }))}
            />
            {!selectedBranch && (
              <div style={{fontSize: 12, color: "#6b7280", marginTop: 4}}>
                Vui lòng chọn chi nhánh để xuất báo cáo tồn kho
              </div>
            )}
          </div>

          <div style={{
            padding: 12,
            backgroundColor: "#f0f9ff",
            borderRadius: 6,
            border: "1px solid #bae6fd"
          }}>
            <div style={{fontSize: 12, color: "#0369a1"}}>
              <strong>Lưu ý:</strong>
              <ul style={{marginTop: 8, marginBottom: 0, paddingLeft: 20}}>
                <li>Báo cáo sẽ bao gồm tất cả sản phẩm trong kho tính đến ngày chọn</li>
                <li>Vui lòng chọn chi nhánh để thực hiện xuất báo cáo</li>
                <li>File Excel sẽ được tải xuống tự động</li>
              </ul>
            </div>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default StockInventoryPage;
