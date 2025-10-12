"use client";
import React, {useState, useEffect, useCallback} from "react";
import {
  Tag,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Input,
  Button,
  message,
  Spin,
  Table,
  Tabs,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ShopOutlined,
  CalendarOutlined,
  DollarOutlined,
  FilterOutlined,
  ReloadOutlined,
  PlusOutlined,
  LoadingOutlined,
  AppstoreOutlined,
  ToolOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import {useConfirmationModalContext} from "@/components/ui/Modal";
import {PricingService} from "@/lib/api/services/pricing.service";
import {productService} from "@/lib/api/services/product.service";
import {ServiceService} from "@/lib/api/services/service.service";
import {servicePackageService} from "@/lib/api/services/service-package.service";
import {PriceBook, PriceBookItem} from "@/lib/api/types/price-book.types";
import {useBranches} from "@/lib/api/hooks/useBranches";
import {Product, Service, ServicePackage} from "@/lib/api";

const {Text} = Typography;
const {Option} = Select;
const {TabPane} = Tabs;

// Transform API PriceBook to UI format
interface PriceTableUI extends PriceBook {
  branchId: string | null;
  effectiveDate: string;
  isDefault: boolean;
}

const transformPriceBookToUI = (priceBook: PriceBook): PriceTableUI => {
  return {
    ...priceBook,
    branchId: null,
    effectiveDate: priceBook.valid_from,
    isDefault: false,
  };
};

const PRICE_TABLE_STATUSES = [
  {value: "active", label: "Đang áp dụng", color: "success"},
  {value: "inactive", label: "Ngừng áp dụng", color: "default"},
];

const PriceBookPage = () => {
  const [priceBooks, setPriceBooks] = useState<PriceTableUI[]>([]);
  const [filteredData, setFilteredData] = useState<PriceTableUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPriceBook, setSelectedPriceBook] = useState<PriceTableUI | null>(null);
  const [viewDetailLoading, setViewDetailLoading] = useState(false);

  // Product, Service, Service Package states
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);

  const {showModal} = useConfirmationModalContext();
  const {branches} = useBranches({});

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

  // Fetch all price books
  const fetchPriceBooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await PricingService.getAllPriceBooks();
      const transformed = data.map(transformPriceBookToUI);
      setPriceBooks(transformed);
      message.success("Tải danh sách bảng giá thành công");
    } catch (error: any) {
      message.error(error?.message || "Không thể tải danh sách bảng giá");
      console.error("Failed to fetch price books:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch products, services, service packages for a price book
  const fetchPriceBookDetails = useCallback(async (priceBookId: string) => {
    setViewDetailLoading(true);
    try {
      // Fetch full price book details
      const priceBookDetail = await PricingService.getPriceBookById(priceBookId);

      // Fetch all products
      const productsResponse = await productService.getAllProducts({
        page: 1,
        size: 1000,
        filters: {is_active: true}
      });

      // Fetch all services
      const servicesResponse = await ServiceService.getAllServices(0, 1000);

      // Fetch all service packages
      const servicePackagesResponse = await servicePackageService.getAllServicePackages(0, 1000);

      setProducts(productsResponse.data.content || []);
      setServices(servicesResponse.data.content || []);
      setServicePackages(servicePackagesResponse.data || []);

      // Filter items in this price book
      const priceBookProductIds = priceBookDetail.items?.map(item => item.product?.id) || [];

      // Set filtered data based on price book items
      setProducts(prev => prev.filter(p => priceBookProductIds.includes(p.product_id)));

    } catch (error: any) {
      message.error(error?.message || "Không thể tải chi tiết bảng giá");
      console.error("Failed to fetch price book details:", error);
    } finally {
      setViewDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPriceBooks();
  }, [fetchPriceBooks]);

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = priceBooks;

    if (searchText) {
      filtered = filtered.filter(
        (table) =>
          table.name.toLowerCase().includes(searchText.toLowerCase()) ||
          table.code.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedBranch !== "") {
      filtered = filtered.filter((table) => table.branchId === selectedBranch);
    }

    if (selectedStatus) {
      const isActive = selectedStatus === "active";
      filtered = filtered.filter((table) => table.active === isActive);
    }

    setFilteredData(filtered);
  }, [priceBooks, searchText, selectedBranch, selectedStatus]);

  const getProductNameById = (productId: string) => {
    const product = products.find((p) => p.product_id === productId);
    return product ? product.product_name : "N/A";
  }

  const getProductSkuById = (productId: string) => {
    const product = products.find((p) => p.product_id === productId);
    return product ? product.sku : "N/A";
  }

  const getProductBrandById = (productId: string) => {
    const product = products.find((p) => p.product_id === productId);
    return product ? product.brand : "N/A";
  }

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const columns = [
    {
      title: "Bảng giá",
      dataIndex: "name",
      key: "name",
      width: 300,
      render: (text: string, record: PriceTableUI) => (
        <div style={{padding: "8px 0"}}>
          <div style={{display: "flex", alignItems: "center", marginBottom: 8}}>
            <Text strong style={{fontSize: 16, color: "#1890ff"}}>
              {text}
            </Text>
            {record.isDefault && (
              <Tag color="gold" style={{marginLeft: 12, fontSize: 11, fontWeight: 500}}>
                Mặc định
              </Tag>
            )}
          </div>
          <div style={{marginBottom: 6}}>
            <Text type="secondary" style={{fontSize: 13, fontWeight: 500}}>
              Mã: {record.code}
            </Text>
          </div>
          <Text type="secondary" style={{fontSize: 12}}>
            Đơn vị: {record.currency}
          </Text>
        </div>
      ),
    },
    {
      title: "Chi nhánh",
      dataIndex: "branchId",
      key: "branchId",
      width: 200,
      render: (branchId: string | null) => {
        if (!branchId) {
          return (
            <div style={{padding: "8px 0"}}>
              <Space>
                <ShopOutlined style={{color: "#52c41a", fontSize: 16}}/>
                <Text strong style={{fontSize: 14, color: "#52c41a"}}>
                  Toàn hệ thống
                </Text>
              </Space>
            </div>
          );
        }
        const branch = branches.find((b) => b.branch_id === branchId);
        return (
          <div style={{padding: "8px 0"}}>
            <Space direction="vertical" size={4}>
              <Space>
                <ShopOutlined style={{color: "#1890ff", fontSize: 16}}/>
                <Text strong style={{fontSize: 14}}>
                  {branch?.branch_name || "N/A"}
                </Text>
              </Space>
            </Space>
          </div>
        );
      },
    },
    {
      title: "Ngày hiệu lực",
      dataIndex: "valid_from",
      key: "valid_from",
      width: 180,
      render: (date: string, record: PriceTableUI) => (
        <div style={{padding: "8px 0"}}>
          <Space direction="vertical" size={4}>
            <Space>
              <CalendarOutlined style={{color: "#52c41a", fontSize: 16}}/>
              <Text style={{fontSize: 14, fontWeight: 500}}>
                {new Date(date).toLocaleDateString("vi-VN")}
              </Text>
            </Space>
            {record.valid_fo && (
              <Space>
                <CalendarOutlined style={{color: "#ff4d4f", fontSize: 16}}/>
                <Text type="secondary" style={{fontSize: 13}}>
                  đến {new Date(record.valid_fo).toLocaleDateString("vi-VN")}
                </Text>
              </Space>
            )}
          </Space>
        </div>
      ),
    },
    {
      title: "Số lượng mục",
      dataIndex: "items",
      key: "items",
      width: 120,
      align: "center" as const,
      render: (items: any[]) => (
        <Tag color="blue" style={{fontSize: 14, fontWeight: 500}}>
          {items?.length || 0}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      width: 140,
      render: (active: boolean) => {
        const status = active ? "active" : "inactive";
        const statusInfo = PRICE_TABLE_STATUSES.find((s) => s.value === status);
        return (
          <div style={{padding: "8px 0"}}>
            <Tag
              color={statusInfo?.color}
              style={{
                fontSize: 12,
                fontWeight: 500,
                padding: "4px 12px",
                borderRadius: 6,
              }}
            >
              {statusInfo?.label}
            </Tag>
          </div>
        );
      },
    },
  ];

  const actions = [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: <EyeOutlined/>,
      onClick: (record: PriceTableUI) => {
        setSelectedPriceBook(record);
        fetchPriceBookDetails(record.id);
      },
    },
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <EditOutlined/>,
      onClick: (record: PriceTableUI) => {
        message.info("Chức năng chỉnh sửa đang được phát triển");
      },
    },
  ];

  const handleResetFilters = () => {
    setSearchText("");
    setSelectedBranch("");
    setSelectedStatus(undefined);
  };

  // Product columns for detail view
  const productColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (text: string, record: any) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{fontSize: 12}}>
            SKU: {record.sku} | Brand: {record.brand}
          </Text>
        </Space>
      ),
    },
    {
      title: "Chính sách giá",
      dataIndex: "policy_type",
      key: "policy_type",
      width: 150,
      render: (policy: string) => {
        const isFixed = policy === "FIXED";
        return (
          <Tag color={isFixed ? "blue" : "orange"}>
            {isFixed ? "Giá cố định" : "Markup theo giá vốn"}
          </Tag>
        );
      },
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 150,
      render: (price: number | null, record: any) => {
        if (record.policy_type === "FIXED") {
          return (
            <Text strong style={{color: "#52c41a"}}>
              {price?.toLocaleString("vi-VN")} ₫
            </Text>
          );
        } else {
          return (
            <Text strong style={{color: "#fa8c16"}}>
              +{record.markup_percent}%
            </Text>
          );
        }
      },
    },
  ];

  // Statistics
  const totalTables = priceBooks.length;
  const activeTables = priceBooks.filter((t) => t.active).length;
  const totalItems = priceBooks.reduce((sum, t) => sum + (t.items?.length || 0), 0);

  return (
    <div>
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{marginBottom: 24}}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng bảng giá"
              value={totalTables}
              prefix={<DollarOutlined/>}
              valueStyle={{color: "#1890ff"}}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Đang áp dụng"
              value={activeTables}
              prefix={<ShopOutlined/>}
              valueStyle={{color: "#52c41a"}}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng mục giá"
              value={totalItems}
              prefix={<AppstoreOutlined/>}
              valueStyle={{color: "#fa8c16"}}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card title="Bộ lọc" style={{marginBottom: 24}} size="small">
        <Row gutter={[16, 8]}>
          <Col span={8}>
            <Input
              placeholder="Tìm kiếm bảng giá..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<FilterOutlined/>}
            />
          </Col>
          <Col span={8}>
            <Select
              placeholder="Chọn chi nhánh"
              value={selectedBranch}
              onChange={setSelectedBranch}
              allowClear
              style={{width: "100%"}}
            >
              <Option value="">Toàn hệ thống</Option>
              {branches.map((branch) => (
                <Option key={branch.branch_id} value={branch.branch_id}>
                  {branch.branch_name} ({branch.branch_code})
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <Select
              placeholder="Chọn trạng thái"
              value={selectedStatus}
              onChange={setSelectedStatus}
              allowClear
              style={{width: "100%"}}
            >
              {PRICE_TABLE_STATUSES.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row style={{marginTop: 16}}>
          <Col>
            <Button icon={<ReloadOutlined/>} onClick={handleResetFilters}>
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        {/* Price Books List */}
        <Col span={selectedPriceBook ? 12 : 24}>
          <Card
            title={
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <Space>
                  <DollarOutlined style={{color: "#1890ff", fontSize: 18}}/>
                  <span style={{fontSize: 16, fontWeight: 600}}>Quản lý bảng giá</span>
                </Space>
                <Button type="primary" icon={<PlusOutlined/>} onClick={() => console.info("Chức năng đang phát triển")}>
                  Thêm bảng giá mới
                </Button>
              </div>
            }
            style={{boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: 8}}
          >
            <Spin spinning={loading} indicator={<LoadingOutlined spin/>}>
              <AdminTable
                dataSource={filteredData}
                columns={columns}
                actions={actions}
                showAddButton={false}
                searchable={false}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total: number) => `Tổng ${total} bảng giá`,
                }}
              />
            </Spin>
          </Card>
        </Col>

        {/* Price Book Details */}
        {selectedPriceBook && (
          <Col span={12}>
            <Card
              title={
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <Space>
                    <EyeOutlined style={{color: "#1890ff", fontSize: 18}}/>
                    <span style={{fontSize: 16, fontWeight: 600}}>Chi tiết bảng giá</span>
                  </Space>
                  <Button
                    icon={<DeleteOutlined/>}
                    onClick={() => setSelectedPriceBook(null)}
                    type="text"
                  >
                    Đóng
                  </Button>
                </div>
              }
              style={{boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: 8}}
            >
              <Spin spinning={viewDetailLoading}>
                <Space direction="vertical" size={16} style={{width: "100%"}}>
                  {/* Price Book Info */}
                  <Card size="small" title="Thông tin bảng giá">
                    <Space direction="vertical" size={8} style={{width: "100%"}}>
                      <div>
                        <Text type="secondary">Tên bảng giá: </Text>
                        <Text strong>{selectedPriceBook.name}</Text>
                      </div>
                      <div>
                        <Text type="secondary">Mã: </Text>
                        <Text strong>{selectedPriceBook.code}</Text>
                      </div>
                      <div>
                        <Text type="secondary">Đơn vị tiền tệ: </Text>
                        <Text strong>{selectedPriceBook.currency}</Text>
                      </div>
                      <div>
                        <Text type="secondary">Hiệu lực từ: </Text>
                        <Text strong>
                          {new Date(selectedPriceBook.valid_from).toLocaleDateString("vi-VN")}
                        </Text>
                      </div>
                      {selectedPriceBook.valid_fo && (
                        <div>
                          <Text type="secondary">Hiệu lực đến: </Text>
                          <Text strong>
                            {new Date(selectedPriceBook.valid_fo).toLocaleDateString("vi-VN")}
                          </Text>
                        </div>
                      )}
                    </Space>
                  </Card>

                  {/* Items in Price Book */}
                  <Card size="small" title={`Sản phẩm (${selectedPriceBook.items?.length || 0})`}>
                    {selectedPriceBook.items && selectedPriceBook.items.length > 0 ? (
                      <Table
                        dataSource={selectedPriceBook.items.map((item, index) => ({
                          ...item,
                          key: index,
                          productName: getProductNameById(item.product.id),
                          sku: getProductSkuById(item.product.id),
                          brand: getProductBrandById(item.product.id),
                        }))}
                        columns={productColumns}
                        pagination={false}
                        size="small"
                      />
                    ) : (
                      <Text type="secondary">Chưa có sản phẩm nào</Text>
                    )}
                  </Card>
                </Space>
              </Spin>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default PriceBookPage;
