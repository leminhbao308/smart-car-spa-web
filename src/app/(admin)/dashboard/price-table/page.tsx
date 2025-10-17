"use client";
import React, {useState, useEffect, useCallback, useMemo} from "react";
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
  Spin, App,
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
  ShoppingOutlined,
  ToolOutlined,
  InsertRowBelowOutlined,
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import {useConfirmationModalContext} from "@/components/ui/Modal";
import {PricingService} from "@/lib/api/services/pricing.service";
import {productService} from "@/lib/api/services/product.service";
import {ServiceService} from "@/lib/api/services/service.service";
import {servicePackageService} from "@/lib/api/services/service-package.service";
import {PriceBook, PriceBookItem} from "@/lib/api/types/price-book.types";
import {useBranches} from "@/lib/api/hooks/useBranches";
import {Product, Promotion, Service, ServicePackage} from "@/lib/api";
import PriceBookDetailModal from "@/components/ui/Modal/PriceTableModals/PriceBookDetailModal";
import PriceBookFormModal from "@/components/ui/Modal/PriceTableModals/PriceBookFormModal";

const {Text} = Typography;
const {Option} = Select;

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
  // Ant Design Message
  const {message} = App.useApp();

  const [priceBooks, setPriceBooks] = useState<PriceTableUI[]>([]);
  const [filteredData, setFilteredData] = useState<PriceTableUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPriceBook, setSelectedPriceBook] = useState<PriceTableUI | null>(null);
  const [viewDetailLoading, setViewDetailLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Form modal states
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formLoading, setFormLoading] = useState(false);

  // Cached data for products, services, service packages
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const {branches} = useBranches({});

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

  // Fetch products, services, packages ONCE and cache them
  const fetchMasterData = useCallback(async () => {
    if (dataLoaded) return; // Skip if already loaded

    try {
      const [productsResponse, servicesResponse] = await Promise.all([
        productService.getAllProducts({
          page: 1,
          size: 1000,
          filters: {is_active: true},
        }),
        ServiceService.getAllServices({
          page: 0,
          size: 1000,
        }),
      ]);

      setProducts(productsResponse.data.content || []);
      if ("content" in servicesResponse.data) {
        setServices(servicesResponse.data.content || []);
      } else {
        setServices(servicesResponse.data || []);
      }
      setDataLoaded(true);
    } catch (error: any) {
      console.error("Failed to fetch master data:", error);
      message.error("Không thể tải dữ liệu sản phẩm/dịch vụ");
    }
  }, [dataLoaded]);

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

  // Fetch price book details
  const fetchPriceBookDetails = useCallback(async (priceBookId: string) => {
    setViewDetailLoading(true);
    try {
      // Load master data if not loaded
      if (!dataLoaded) {
        await fetchMasterData();
      }

      // Fetch only the price book details
      const priceBookDetail = await PricingService.getPriceBookById(priceBookId);
      setSelectedPriceBook(transformPriceBookToUI(priceBookDetail));
      setDetailModalVisible(true);
    } catch (error: any) {
      message.error(error?.message || "Không thể tải chi tiết bảng giá");
      console.error("Failed to fetch price book details:", error);
    } finally {
      setViewDetailLoading(false);
    }
  }, [dataLoaded, fetchMasterData]);

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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN");
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

  // Handle create price book
  const handleCreate = async () => {
    // Load master data if not loaded
    if (!dataLoaded) {
      setFormLoading(true);
      await fetchMasterData();
      setFormLoading(false);
    }
    setFormMode("create");
    setSelectedPriceBook(null);
    setFormModalVisible(true);
  };

  // Handle edit price book
  const handleEdit = async (record: PriceTableUI) => {
    // Load master data if not loaded
    if (!dataLoaded) {
      setFormLoading(true);
      await fetchMasterData();
      setFormLoading(false);
    }

    try {
      // Fetch full details
      const priceBookDetail = await PricingService.getPriceBookById(record.id);
      setSelectedPriceBook(transformPriceBookToUI(priceBookDetail));
      setFormMode("edit");
      setFormModalVisible(true);
    } catch (error: any) {
      message.error(error?.message || "Không thể tải thông tin bảng giá");
    }
  };

  // Handle form submit
  const handleFormSubmit = async (data: any) => {
    try {
      if (formMode === "create") {
        await PricingService.createPriceBook(data);
        message.success("Tạo bảng giá thành công");
      } else {
        await PricingService.updatePriceBook(selectedPriceBook!.id, data);
        message.success("Cập nhật bảng giá thành công");
      }
      setFormModalVisible(false);
      fetchPriceBooks();
    } catch (error: any) {
      message.error(error?.message || "Có lỗi xảy ra");
      throw error;
    }
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
              <Tag
                color="gold"
                style={{marginLeft: 12, fontSize: 11, fontWeight: 500}}
              >
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
      dataIndex: "branch_id",
      key: "branch_id",
      width: 200,
      render: (branch_id: string | null) => {
        if (!branch_id) {
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
        const branch = branches.find((b) => b.branch_id === branch_id);
        return (
          <div style={{padding: "8px 0"}}>
            <Space direction="vertical" size={4}>
              <Space>
                <ShopOutlined style={{color: "#1890ff", fontSize: 16}}/>
                <Text strong style={{fontSize: 14}}>
                  {branch?.branch_name || "Toàn hệ thống"}
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
    {
      title: "Thao tác",
      key: "action",
      width: 250,
      render: (_, record: PriceTableUI) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined/>}
            onClick={() => fetchPriceBookDetails(record.id)}
            size={"small"}
          >
            Xem
          </Button>
          <Button
            type="default"
            icon={<EditOutlined/>}
            onClick={() => handleEdit(record)}
            size={"small"}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
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
          <Col span={5}>
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
          <Col span={3}>
            <Button icon={<ReloadOutlined/>} onClick={handleResetFilters} style={{width: "100%"}}>
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Price Books List */}
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Space>
              <DollarOutlined style={{color: "#1890ff", fontSize: 18}}/>
              <span style={{fontSize: 16, fontWeight: 600}}>Quản lý bảng giá</span>
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined/>}
              onClick={handleCreate}
            >
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
      <PriceBookDetailModal
        visible={detailModalVisible}
        loading={viewDetailLoading}
        selectedPriceBook={selectedPriceBook}
        products={products}
        services={services}
        onClose={() => setDetailModalVisible(false)}
      />

      {/* Form Modal */}
      <PriceBookFormModal
        visible={formModalVisible}
        loading={formLoading}
        mode={formMode}
        priceBook={selectedPriceBook}
        products={products}
        services={services}
        branches={branches}
        onClose={() => {
          setFormModalVisible(false);
          setSelectedPriceBook(null);
        }}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default PriceBookPage;
