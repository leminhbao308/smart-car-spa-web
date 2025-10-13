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
  Modal,
  Descriptions,
  Empty,
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
  CloseOutlined, InsertRowBelowOutlined,
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
  const [detailModalVisible, setDetailModalVisible] = useState(false);

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
      const servicesResponse = await ServiceService.getAllServices({page: 0, size: 1000});

      // Fetch all service packages
      const servicePackagesResponse = await servicePackageService.getAllServicePackages(0, 1000);

      setProducts(productsResponse.data.content || []);
      setServices(servicesResponse.data.content || []);
      setServicePackages(servicePackagesResponse.data || []);

      // Update selected price book with full details
      setSelectedPriceBook(transformPriceBookToUI(priceBookDetail));
      setDetailModalVisible(true);

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

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleResetFilters = () => {
    setSearchText("");
    setSelectedBranch("");
    setSelectedStatus(undefined);
  };

  const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined) return "N/A";
    return `${amount.toLocaleString("vi-VN")} ₫`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case "PRODUCT":
        return <ShoppingOutlined style={{color: "#1890ff"}}/>;
      case "SERVICE":
        return <ToolOutlined style={{color: "#52c41a"}}/>;
      case "SERVICE_PACKAGE":
        return <InsertRowBelowOutlined style={{color: "#fa8c16"}}/>;
      default:
        return <AppstoreOutlined/>;
    }
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case "PRODUCT":
        return "Sản phẩm";
      case "SERVICE":
        return "Dịch vụ";
      case "SERVICE_PACKAGE":
        return "Gói dịch vụ";
      default:
        return type;
    }
  };

  const getItemTypeCounts = (items: PriceBookItem[]) => {
    const counts = {
      PRODUCT: 0,
      SERVICE: 0,
      SERVICE_PACKAGE: 0,
    };
    items?.forEach((item) => {
      counts[item.item_type]++;
    });
    return counts;
  };

  const getProductInfo = (productId: string) => {
    const product = products.find(p => p.product_id === productId);
    return product || null;
  };

  const getServiceInfo = (serviceId: string) => {
    const service = services.find(s => s.service_id === serviceId);
    return service || null;
  };

  const getServicePackageInfo = (packageId: string) => {
    const pkg = servicePackages.find(p => p.packageId === packageId);
    return pkg || null;
  };

  // Get base cost for markup calculation
  const getBasePrice = (record: PriceBookItem) => {
    if (record.item_type === "PRODUCT" && record.product) {
      const product = getProductInfo(record.product.product_id);
      return product?.peak_price || 0;
    } else if (record.item_type === "SERVICE" && record.service) {
      const service = getServiceInfo(record.service.service_id);
      return service?.base_price || 0;
    } else if (record.item_type === "SERVICE_PACKAGE" && record.servicePackage) {
      const pkg = getServicePackageInfo(record.servicePackage.packageId);
      return (pkg?.serviceCost || 0) + (pkg?.productCost || 0);
    }
    return 0;
  };

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
                {formatDate(date)}
              </Text>
            </Space>
            {record.valid_to ? (
              <Space>
                <CalendarOutlined style={{color: "#ff4d4f", fontSize: 16}}/>
                <Text type="secondary" style={{fontSize: 13}}>
                  đến {formatDate(record.valid_to)}
                </Text>
              </Space>
            ) : (
              <Tag color="green" style={{fontSize: 12, fontWeight: 500}}>
                Vô thời hạn
              </Tag>
            )}
          </Space>
        </div>
      ),
    },
    {
      title: "Thành phần",
      key: "composition",
      width: 200,
      render: (_: any, record: PriceTableUI) => {
        const counts = getItemTypeCounts(record.items || []);
        return (
          <Space direction="vertical" size={4}>
            {counts.PRODUCT > 0 && (
              <Tag icon={<ShoppingOutlined/>} color="blue">
                {counts.PRODUCT} sản phẩm
              </Tag>
            )}
            {counts.SERVICE > 0 && (
              <Tag icon={<ToolOutlined/>} color="green">
                {counts.SERVICE} dịch vụ
              </Tag>
            )}
            {counts.SERVICE_PACKAGE > 0 && (
              <Tag icon={<InsertRowBelowOutlined/>} color="orange">
                {counts.SERVICE_PACKAGE} gói
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      width: 140,
      render: (is_active: boolean) => {
        const status = is_active ? "active" : "inactive";
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

  // Detail modal item columns
  const itemColumns = [
    {
      title: "Loại",
      dataIndex: "item_type",
      key: "item_type",
      width: 140,
      render: (type: string) => (
        <Tag icon={getItemTypeIcon(type)} color={type === "PRODUCT" ? "blue" : type === "SERVICE" ? "green" : "orange"}>
          {getItemTypeLabel(type)}
        </Tag>
      ),
    },
    {
      title: "Tên mục",
      dataIndex: "item_name",
      key: "item_name",
      render: (text: string, record: PriceBookItem) => {
        let extraInfo = null;
        let additionalDetails = null;

        if (record.item_type === "PRODUCT" && record.product) {
          const product = getProductInfo(record.product.product_id);
          if (product) {
            extraInfo = (
              <Text type="secondary" style={{fontSize: 12}}>
                SKU: {product.sku} | {product.brand}
              </Text>
            );
            additionalDetails = (
              <Text type="secondary" style={{fontSize: 11}}>
                Giá niêm yết: {formatCurrency(product.peak_price)}
              </Text>
            );
          }
        } else if (record.item_type === "SERVICE" && record.service) {
          const service = getServiceInfo(record.service.service_id);
          if (service) {
            extraInfo = (
              <Text type="secondary" style={{fontSize: 12}}>
                Mã: {service.service_id}
              </Text>
            );
            additionalDetails = (
              <Text type="secondary" style={{fontSize: 11}}>
                Giá cơ bản: {formatCurrency(service.base_price)} | Tiền công: {formatCurrency(service.labor_cost)}
              </Text>
            );
          }
        } else if (record.item_type === "SERVICE_PACKAGE" && record.servicePackage) {
          const pkg = getServicePackageInfo(record.servicePackage.packageId);
          if (pkg) {
            extraInfo = (
              <Text type="secondary" style={{fontSize: 12}}>
                Loại: {pkg.packageType}
              </Text>
            );
            additionalDetails = (
              <Text type="secondary" style={{fontSize: 11}}>
                Chi phí DV: {formatCurrency(pkg.serviceCost)} | Chi phí SP: {formatCurrency(pkg.productCost)}
              </Text>
            );
          }
        }

        return (
          <Space direction="vertical" size={0}>
            <Text strong>{text}</Text>
            {extraInfo}
            {additionalDetails}
          </Space>
        );
      },
    },
    {
      title: "Chính sách giá",
      dataIndex: "policy_type",
      key: "policy_type",
      width: 180,
      render: (policy: string) => (
        <Tag color={policy === "FIXED" ? "blue" : "orange"}>
          {policy === "FIXED" ? "Giá cố định" : "Markup theo giá vốn"}
        </Tag>
      ),
    },
    {
      title: "Giá",
      key: "price",
      width: 180,
      render: (_: any, record: PriceBookItem) => {
        if (record.policy_type === "FIXED" && record.fixed_price) {
          return (
            <Text strong style={{color: "#52c41a"}}>
              {formatCurrency(record.fixed_price)}
            </Text>
          );
        } else if (record.markup_percent !== null) {
          return (
            <Space direction="vertical" size={0}>
              <Text strong style={{color: "#fa8c16"}}>
                +{record.markup_percent}%
              </Text>
            </Space>
          );
        }
        return <Text type="secondary">N/A</Text>;
      },
    },
  ];

  // Statistics
  const totalTables = priceBooks.length;
  const activeTables = priceBooks.filter((t) => t.active).length;
  const totalItems = priceBooks.reduce((sum, t) => sum + (t.items?.length || 0), 0);

  const allItems = priceBooks.flatMap(pb => pb.items || []);
  const itemTypeCounts = getItemTypeCounts(allItems);

  return (
    <div>
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{marginBottom: 24}}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng bảng giá"
              value={totalTables}
              prefix={<DollarOutlined/>}
              valueStyle={{color: "#1890ff"}}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang áp dụng"
              value={activeTables}
              prefix={<ShopOutlined/>}
              valueStyle={{color: "#52c41a"}}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sản phẩm"
              value={itemTypeCounts.PRODUCT}
              prefix={<ShoppingOutlined/>}
              valueStyle={{color: "#1890ff"}}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Dịch vụ & Gói"
              value={itemTypeCounts.SERVICE + itemTypeCounts.SERVICE_PACKAGE}
              prefix={<ToolOutlined/>}
              valueStyle={{color: "#52c41a"}}
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

      {/* Price Books List */}
      <Card
        title={
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <Space>
              <DollarOutlined style={{color: "#1890ff", fontSize: 18}}/>
              <span style={{fontSize: 16, fontWeight: 600}}>Quản lý bảng giá</span>
            </Space>
            <Button type="primary" icon={<PlusOutlined/>} onClick={() => message.info("Chức năng đang phát triển")}>
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

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined/>
            Chi tiết bảng giá
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" type="primary" icon={<CloseOutlined/>} onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={1200}
        style={{top: 20}}
      >
        <Spin spinning={viewDetailLoading}>
          {selectedPriceBook && (
            <Space direction="vertical" size={16} style={{width: "100%"}}>
              {/* Price Book Info */}
              <Card size="small" title="Thông tin bảng giá">
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Mã">
                    <Text code strong>
                      {selectedPriceBook.code}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tên">
                    <Text strong>{selectedPriceBook.name}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Đơn vị tiền tệ">
                    <Tag color="blue">{selectedPriceBook.currency}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag color={selectedPriceBook.is_active ? "success" : "default"}>
                      {selectedPriceBook.is_active ? "Đang áp dụng" : "Ngừng áp dụng"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày hiệu lực">
                    <Space>
                      <CalendarOutlined style={{color: "#52c41a"}}/>
                      {formatDate(selectedPriceBook.valid_from)}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày hết hạn">
                    <Space>
                      <CalendarOutlined style={{color: "#ff4d4f"}}/>
                      {selectedPriceBook.valid_to ? formatDate(selectedPriceBook.valid_to) : "Không giới hạn"}
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Statistics */}
              <Card title="Thống kê" size="small">
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title="Tổng mục"
                      value={selectedPriceBook.items?.length || 0}
                      prefix={<AppstoreOutlined/>}
                      valueStyle={{color: "#1890ff"}}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Sản phẩm"
                      value={getItemTypeCounts(selectedPriceBook.items || []).PRODUCT}
                      prefix={<ShoppingOutlined/>}
                      valueStyle={{color: "#1890ff"}}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Dịch vụ"
                      value={getItemTypeCounts(selectedPriceBook.items || []).SERVICE}
                      prefix={<ToolOutlined/>}
                      valueStyle={{color: "#52c41a"}}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Gói dịch vụ"
                      value={getItemTypeCounts(selectedPriceBook.items || []).SERVICE_PACKAGE}
                      prefix={<InsertRowBelowOutlined/>}
                      valueStyle={{color: "#fa8c16"}}
                    />
                  </Col>
                </Row>
              </Card>

              {/* Items List with Tabs */}
              <Card
                size="small"
                title={
                  <Space>
                    <span>Danh sách mục giá</span>
                    <Tag color="blue">{selectedPriceBook.items?.length || 0}</Tag>
                  </Space>
                }
              >
                {selectedPriceBook.items && selectedPriceBook.items.length > 0 ? (
                  <Tabs defaultActiveKey="all">
                    <TabPane tab={`Tất cả (${selectedPriceBook.items.length})`} key="all">
                      <Table
                        dataSource={selectedPriceBook.items}
                        columns={itemColumns}
                        rowKey="id"
                        pagination={{pageSize: 5, showTotal: (total) => `Tổng ${total} mục`}}
                        size="small"
                      />
                    </TabPane>
                    <TabPane
                      tab={
                        <span>
                          <ShoppingOutlined/> Sản phẩm ({getItemTypeCounts(selectedPriceBook.items).PRODUCT})
                        </span>
                      }
                      key="products"
                    >
                      <Table
                        dataSource={selectedPriceBook.items.filter((i) => i.item_type === "PRODUCT")}
                        columns={itemColumns}
                        rowKey="id"
                        pagination={{pageSize: 5, showTotal: (total) => `Tổng ${total} sản phẩm`}}
                        size="small"
                      />
                    </TabPane>
                    <TabPane
                      tab={
                        <span>
                          <ToolOutlined/> Dịch vụ ({getItemTypeCounts(selectedPriceBook.items).SERVICE})
                        </span>
                      }
                      key="services"
                    >
                      <Table
                        dataSource={selectedPriceBook.items.filter((i) => i.item_type === "SERVICE")}
                        columns={itemColumns}
                        rowKey="id"
                        pagination={{pageSize: 5, showTotal: (total) => `Tổng ${total} dịch vụ`}}
                        size="small"
                      />
                    </TabPane>
                    <TabPane
                      tab={
                        <span>
                          <InsertRowBelowOutlined/> Gói dịch vụ ({getItemTypeCounts(selectedPriceBook.items).SERVICE_PACKAGE})
                        </span>
                      }
                      key="packages"
                    >
                      <Table
                        dataSource={selectedPriceBook.items.filter((i) => i.item_type === "SERVICE_PACKAGE")}
                        columns={itemColumns}
                        rowKey="id"
                        pagination={{pageSize: 5, showTotal: (total) => `Tổng ${total} gói`}}
                        size="small"
                      />
                    </TabPane>
                  </Tabs>
                ) : (
                  <Empty description="Chưa có mục giá nào" image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                )}
              </Card>
            </Space>
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default PriceBookPage;
