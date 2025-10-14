"use client";
import React, {useCallback, useEffect, useState, useMemo} from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Input,
  Table,
  Space,
  Divider,
  Tag,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Radio,
  Spin,
  Badge,
  Empty,
  Statistic,
  QRCode,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  PrinterOutlined,
  SaveOutlined,
  UserOutlined,
  BarcodeOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  ClearOutlined,
  ReloadOutlined,
  BankOutlined,
} from "@ant-design/icons";
import {
  useUserManagement,
  useBranches,
  useWarehouseByBranch,
  useCatalogForSale,
  usePricing,
  useInventoryLevels,
  useCreateAndPay, useVerifyPayment, useFulfillSalesOrder,
} from "@/lib/api/hooks";
import {Product, UserManagementInfo} from "@/lib/api";
import {useCategories} from "@/lib/api/hooks/useCategory";
import type {BranchDisplay} from "@/lib/api/types/branch.types";
import type {CatalogItem} from "@/lib/api/types/catalog.types";
import {PaymentModal} from "@/components/ui/Modal/PaymentModal";

const {Title, Text} = Typography;
const {Option} = Select;

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
  categoryName: string;
  availableStock: number;
  maxQuantity: number;
}

interface ProductWithStock extends Product {
  sellingPrice: number;
  availableStock: number;
}

const POSPage = () => {
  // State Management
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<UserManagementInfo | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchDisplay | null>(null);
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [isBranchModalVisible, setIsBranchModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK">("CASH");
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [customerType, setCustomerType] = useState("guest");
  const [customerSearchText, setCustomerSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [form] = Form.useForm();

  // PayOS State
  const [paymentQRCode, setPaymentQRCode] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<number | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // API Hooks
  const {branches, loading: branchesLoading} = useBranches({});
  const {warehouse, loading: warehouseLoading, refresh: refreshWarehouse} = useWarehouseByBranch(
    selectedBranch?.branch_id || null
  );
  const {catalog, loading: catalogLoading, refresh: refreshCatalog} = useCatalogForSale(
    warehouse?.id || ""
  );
  const {previewBatch, loading: pricingLoading} = usePricing();
  const {levelsBatch, loading: inventoryLoading} = useInventoryLevels();
  const {mutateAsync: createAndPay, isPending: isCreatingOrder} = useCreateAndPay();
  const {mutateAsync: fulfillOrder, isPending: isFulfilling} = useFulfillSalesOrder();

  // Payment verification with polling
  const {data: paymentStatus, isLoading: isVerifying} = useVerifyPayment(
    orderCode,
    {
      enabled: isPolling && !!orderCode,
      refetchInterval: 3000, // Poll every 3 seconds
      onSuccess: (data) => {
        if (data?.status === "COMPLETED") {
          handlePaymentSuccess();
        }
      },
      onCancelled: (data) => {
        handlePaymentCancelled();
      },
    }
  );

  const {
    users,
    isLoading: isUsersLoading,
    setFilters,
    refreshUsers,
    searchUsers,
  } = useUserManagement();

  const fetchedCategories = useCategories();
  const categories = useMemo(() => {
    const cats = fetchedCategories.data?.data?.content;
    return cats ? cats.map((cat) => cat.category_name) : [];
  }, [fetchedCategories.data?.data?.content]);

  // Initialize user filters
  const setUserFilters = useCallback(
    (search: string | undefined) => {
      setFilters({
        userType: "CUSTOMER",
        search: search,
      });
    },
    [setFilters]
  );

  useEffect(() => {
    setUserFilters("");
  }, [setUserFilters]);

  // Get available products from catalog with enhanced data
  const availableProducts = useMemo((): ProductWithStock[] => {
    if (!catalog?.items) return [];
    return catalog.items.map((item: CatalogItem) => ({
      ...item.product,
      sellingPrice: item.price,
      availableStock: item.inventory?.available || 0,
    }));
  }, [catalog]);

  // Filtered products with performance optimization
  const filteredProducts = useMemo(() => {
    return availableProducts.filter((product) => {
      const matchesSearch =
        product.product_name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchText.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchText.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" ||
        product.product_type_name === categoryFilter;

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in_stock" && product.availableStock > 10) ||
        (stockFilter === "low_stock" &&
          product.availableStock > 0 &&
          product.availableStock <= 10) ||
        (stockFilter === "out_of_stock" && product.availableStock === 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [availableProducts, searchText, categoryFilter, stockFilter]);

  // Cart Management Functions
  const addToCart = useCallback((product: ProductWithStock) => {
    if (product.availableStock <= 0) {
      message.warning("Sản phẩm đã hết hàng!");
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === product.product_id);
      const currentQty = existingItem ? existingItem.quantity : 0;

      if (currentQty + 1 > product.availableStock) {
        message.warning(`Chỉ còn ${product.availableStock} sản phẩm trong kho!`);
        return prevCart;
      }

      if (existingItem) {
        return prevCart.map((item) =>
          item.productId === product.product_id
            ? {
              ...item,
              quantity: item.quantity + 1,
              total: (item.quantity + 1) * item.price,
            }
            : item
        );
      } else {
        const newItem: CartItem = {
          productId: product.product_id,
          productName: product.product_name,
          price: product.sellingPrice || 0,
          quantity: 1,
          total: product.sellingPrice || 0,
          categoryName: product.product_type_name,
          availableStock: product.availableStock,
          maxQuantity: product.availableStock,
        };
        message.success(`Đã thêm ${product.product_name} vào giỏ hàng`);
        return [...prevCart, newItem];
      }
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) => {
      const item = prevCart.find((i) => i.productId === productId);
      if (item && quantity > item.availableStock) {
        message.warning(`Chỉ còn ${item.availableStock} sản phẩm trong kho!`);
        return prevCart;
      }

      return prevCart.map((item) =>
        item.productId === productId
          ? {...item, quantity, total: quantity * item.price}
          : item
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
    message.info("Đã xóa sản phẩm khỏi giỏ hàng");
  }, []);

  const clearCart = useCallback(() => {
    Modal.confirm({
      title: "Xóa toàn bộ giỏ hàng?",
      content: "Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: {danger: true},
      onOk: () => {
        setCart([]);
        message.success("Đã xóa toàn bộ giỏ hàng");
      },
    });
  }, []);

  // Calculation Functions
  const getSubtotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.total, 0);
  }, [cart]);

  const getTotalAmount = useCallback(() => {
    return getSubtotal();
  }, [getSubtotal]);

  const getTotalItems = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const getChange = useCallback(() => {
    return Math.max(0, receivedAmount - getTotalAmount());
  }, [receivedAmount, getTotalAmount]);

  // Branch Management
  const handleSelectBranch = useCallback((branch: BranchDisplay) => {
    setSelectedBranch(branch);
    setCart([]);
    setIsBranchModalVisible(false);
    message.success(`Đã chọn chi nhánh: ${branch.branch_name}`);
  }, []);

  // Customer Management
  const handleCustomerTypeChange = useCallback((type: string) => {
    setCustomerType(type);
    if (type === "guest") {
      setSelectedCustomer({
        user_id: "",
        full_name: "Khách lẻ",
        phone_number: "N/A",
        email: "N/A",
      } as UserManagementInfo);
      setIsCustomerModalVisible(false);
    } else {
      setSelectedCustomer(null);
    }
  }, []);

  const handleSearchCustomer = useCallback(async () => {
    if (!customerSearchText.trim()) {
      await refreshUsers();
      return;
    }

    try {
      await searchUsers(customerSearchText);
      if (users.length > 0) {
        if (users.length === 1) {
          setSelectedCustomer(users[0]);
          setCustomerSearchText("");
          setIsCustomerModalVisible(false);
          message.success("Tìm thấy và chọn khách hàng!");
        } else {
          message.success(`Tìm thấy ${users.length} khách hàng!`);
        }
      } else {
        message.warning("Không tìm thấy khách hàng!");
      }
    } catch (error) {
      message.error("Lỗi khi tìm kiếm khách hàng!");
    }
  }, [customerSearchText, refreshUsers, searchUsers, users]);

  // Payment Success Handler
  const handlePaymentSuccess = useCallback(async () => {
    setIsPolling(false);
    message.success("Thanh toán thành công!");

    if (currentOrderId) {
      try {
        const hide = message.loading("Đang hoàn thành đơn hàng...", 0);
        await fulfillOrder(currentOrderId);
        hide();
        message.success("Thanh toán thành công và đã hoàn thành đơn hàng!");
      } catch (error: any) {
        message.error("Thanh toán thành công nhưng lỗi khi hoàn thành đơn hàng: " + (error?.message || ""));
      }
    } else {
      message.success("Thanh toán thành công!");
    }

    // Reset all states
    setCart([]);
    setSelectedCustomer(null);
    setIsPaymentModalVisible(false);
    setReceivedAmount(0);
    setPaymentMethod("CASH");
    setPaymentQRCode(null);
    setPaymentUrl(null);
    setOrderCode(null);

    // Refresh catalog and warehouse
    refreshCatalog();
    refreshWarehouse();

    // close payment modal if open
    setIsPaymentModalVisible(false);
  }, [refreshCatalog, refreshWarehouse]);

  // Payment Cancelled Handler
  const handlePaymentCancelled = useCallback(() => {
    setIsPolling(false);
    message.warning("Thanh toán đã bị hủy");

    setPaymentQRCode(null);
    setPaymentUrl(null);
    setOrderCode(null);
  }, []);

  // Checkout and Payment
  const handleCheckout = useCallback(() => {
    if (cart.length === 0) {
      message.warning("Giỏ hàng trống!");
      return;
    }
    if (!selectedBranch) {
      message.warning("Vui lòng chọn chi nhánh!");
      return;
    }
    if (!warehouse) {
      message.warning("Không tìm thấy kho cho chi nhánh này!");
      return;
    }
    setReceivedAmount(getTotalAmount());
    setPaymentMethod("CASH");
    setPaymentQRCode(null);
    setPaymentUrl(null);
    setOrderCode(null);
    setIsPolling(false);
    setIsPaymentModalVisible(true);
  }, [cart.length, selectedBranch, warehouse, getTotalAmount]);

  const handlePayment = useCallback(async () => {
    // Validation for cash payment
    if (paymentMethod === "CASH" && receivedAmount < getTotalAmount()) {
      message.error("Số tiền nhận không đủ!");
      return;
    }

    if (!selectedBranch || !warehouse) {
      message.error("Thiếu thông tin chi nhánh hoặc kho!");
      return;
    }

    const hide = message.loading("Đang xử lý thanh toán...", 0);

    try {
      const baseUrl = window.location.origin;
      const orderRequest = {
        branch_id: selectedBranch.branch_id,
        warehouse_id: warehouse.id,
        customer_id: selectedCustomer?.user_id || undefined,
        lines: cart.map((item) => ({
          product_id: item.productId,
          qty: item.quantity,
          unit_price: item.price,
        })),
        payment_method: paymentMethod,
        return_url: `${baseUrl}/payment/success`,
        cancel_url: `${baseUrl}/payment/cancel`,
      };

      const response = await createAndPay(orderRequest);

      hide();

      if (response.order?.id) {
        setCurrentOrderId(response.order.id);
      }

      // Handle CASH payment
      if (paymentMethod === "CASH") {
        message.success("Thanh toán tiền mặt thành công!");

        if (response.order?.id) {
          try {
            await fulfillOrder(response.order.id);
            message.success("Đã hoàn thành đơn hàng!");
          } catch (error: any) {
            message.error("Lỗi khi hoàn thành đơn hàng: " + (error?.message || ""));
          }
        }

        // Reset states
        setCart([]);
        setSelectedCustomer(null);
        setIsPaymentModalVisible(false);
        setReceivedAmount(0);
        setPaymentMethod("CASH");

        // Refresh catalog and warehouse
        refreshCatalog();
        refreshWarehouse();
      }
      // Handle BANK payment
      else if (paymentMethod === "BANK") {
        if (response.payment.payment_url) {
          setPaymentUrl(response.payment.payment_url);
          setPaymentQRCode(response.payment.qr_code || null);
          setOrderCode(response.payment.order_code || null);
          setIsPolling(true); // Start polling

          message.success("Đã tạo đơn hàng! Vui lòng quét mã QR hoặc truy cập link thanh toán");
        } else {
          throw new Error("Không nhận được link thanh toán");
        }
      }
    } catch (error: any) {
      hide();
      message.error(error?.message || "Có lỗi xảy ra khi thanh toán!");
    }
  }, [
    paymentMethod,
    receivedAmount,
    getTotalAmount,
    selectedBranch,
    warehouse,
    selectedCustomer,
    cart,
    createAndPay,
    refreshCatalog,
    refreshWarehouse,
  ]);

  const handleOpenPaymentLink = useCallback(() => {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
    }
  }, [paymentUrl]);

  const handleCancelPayment = useCallback(() => {
    setIsPaymentModalVisible(false);
    setPaymentQRCode(null);
    setPaymentUrl(null);
    setOrderCode(null);
    setIsPolling(false);
    setCurrentOrderId(null);
    message.info("Đã hủy thanh toán");
  }, []);

  // Cart Table Columns
  const cartColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      ellipsis: true,
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price: number) => (
        <Text strong style={{color: "#1890ff"}}>
          ₫{price.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 150,
      render: (quantity: number, record: CartItem) => (
        <Space>
          <Button
            size="small"
            icon={<MinusOutlined/>}
            onClick={() => updateQuantity(record.productId, quantity - 1)}
            disabled={quantity <= 1}
          />
          <InputNumber
            size="small"
            value={quantity}
            min={1}
            max={record.maxQuantity}
            style={{width: 60}}
            onChange={(value) => updateQuantity(record.productId, value || 1)}
          />
          <Button
            size="small"
            icon={<PlusOutlined/>}
            onClick={() => updateQuantity(record.productId, quantity + 1)}
            disabled={quantity >= record.maxQuantity}
          />
        </Space>
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "total",
      key: "total",
      width: 120,
      render: (total: number) => (
        <Text strong>₫{total.toLocaleString()}</Text>
      ),
    },
    {
      title: "",
      key: "action",
      width: 50,
      render: (_: unknown, record: CartItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined/>}
          onClick={() => removeFromCart(record.productId)}
        />
      ),
    },
  ];

  const isLoading = catalogLoading || warehouseLoading || pricingLoading || inventoryLoading;

  return (
    <div
      style={{
        height: "calc(100vh - 13.9rem)",
        padding: "0",
        overflow: "hidden",
      }}
    >
      <Row gutter={[24, 24]} style={{height: "100%"}}>
        {/* Products Section */}
        <Col xs={24} lg={14} style={{height: "100%"}}>
          <Card
            title={
              <Space>
                <ShopOutlined/>
                <span>Sản phẩm</span>
                {selectedBranch && (
                  <Tag color="blue">{selectedBranch.branch_name}</Tag>
                )}
              </Space>
            }
            extra={
              <Button
                icon={<ReloadOutlined/>}
                onClick={() => {
                  refreshCatalog();
                  refreshWarehouse();
                }}
                loading={isLoading}
              >
                Làm mới
              </Button>
            }
            style={{height: "100%", borderRadius: "12px"}}
            styles={{
              body: {height: "calc(100% - 57px)", overflow: "auto"},
            }}
          >
            <Row gutter={[16, 16]} style={{marginBottom: "16px"}}>
              <Col span={8}>
                <Input
                  placeholder="Tìm kiếm sản phẩm, mã SKU..."
                  prefix={<SearchOutlined/>}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  size="large"
                  allowClear
                />
              </Col>
              <Col span={4}>
                <Select
                  placeholder="Danh mục"
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  style={{width: "100%"}}
                  size="large"
                >
                  <Option value="all">Tất cả</Option>
                  {categories.map((cat) => (
                    <Option key={cat} value={cat}>
                      {cat}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={4}>
                <Select
                  placeholder="Tồn kho"
                  value={stockFilter}
                  onChange={setStockFilter}
                  style={{width: "100%"}}
                  size="large"
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="in_stock">Còn hàng</Option>
                  <Option value="low_stock">Sắp hết</Option>
                  <Option value="out_of_stock">Hết hàng</Option>
                </Select>
              </Col>
              <Col span={4}>
                <Button
                  size="large"
                  icon={<ShopOutlined/>}
                  onClick={() => setIsBranchModalVisible(true)}
                  style={{width: "100%"}}
                  type={selectedBranch ? "primary" : "default"}
                >
                  {selectedBranch ? (
                    <Text ellipsis={{tooltip: true}} style={{color: "white"}}>
                      {selectedBranch.branch_name}
                    </Text>
                  ) : (
                    "Chọn chi nhánh"
                  )}
                </Button>
              </Col>
              <Col span={4}>
                <Button
                  size="large"
                  icon={<UserOutlined/>}
                  onClick={() => setIsCustomerModalVisible(true)}
                  style={{width: "100%"}}
                >
                  <Text ellipsis={{tooltip: true}}>
                    {selectedCustomer ? selectedCustomer.full_name : "Khách hàng"}
                  </Text>
                </Button>
              </Col>
            </Row>

            {!selectedBranch ? (
              <Empty
                style={{marginTop: "100px"}}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical">
                    <Text type="secondary">Vui lòng chọn chi nhánh để xem sản phẩm</Text>
                  </Space>
                }
              />
            ) : isLoading ? (
              <div style={{textAlign: "center", padding: "80px 20px"}}>
                <Spin size="large"/>
                <div style={{marginTop: "16px"}}>Đang tải sản phẩm...</div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <Empty description="Không tìm thấy sản phẩm"/>
            ) : (
              <Row gutter={[16, 16]}>
                {filteredProducts.map((product) => (
                  <Col xs={12} sm={8} md={6} lg={6} xl={6} key={product.product_id}>
                    <Badge.Ribbon
                      text={product.availableStock === 0 ? "Hết hàng" : `Còn ${product.availableStock}`}
                      color={
                        product.availableStock === 0
                          ? "red"
                          : product.availableStock <= 10
                            ? "orange"
                            : "green"
                      }
                    >
                      <Card
                        hoverable={product.availableStock > 0}
                        style={{
                          borderRadius: "8px",
                          opacity: product.availableStock === 0 ? 0.5 : 1,
                          cursor: product.availableStock === 0 ? "not-allowed" : "pointer",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                        styles={{
                          body: {
                            padding: "12px",
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            height: "100%"
                          },
                        }}
                        onClick={() =>
                          product.availableStock > 0 && addToCart(product)
                        }
                      >
                        <div style={{
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                        }}>
                          <div
                            style={{
                              height: "80px",
                              backgroundColor: "#f5f5f5",
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginBottom: "12px",
                            }}
                          >
                            <BarcodeOutlined
                              style={{fontSize: "32px", color: "#999"}}
                            />
                          </div>
                          <div style={{flex: 1, display: "flex", flexDirection: "column"}}>
                            <Text
                              strong
                              style={{
                                fontSize: "13px",
                                display: "block",
                                marginBottom: "8px",
                                minHeight: "40px",
                                lineHeight: "1.4",
                              }}
                              ellipsis={{
                                tooltip: product.product_name
                              }}
                            >
                              {product.product_name}
                            </Text>
                            <Text
                              style={{
                                color: "#1890ff",
                                fontSize: "16px",
                                fontWeight: "bold",
                                display: "block",
                                marginBottom: "8px",
                              }}
                            >
                              ₫{product.sellingPrice?.toLocaleString()}
                            </Text>
                            <div style={{
                              marginTop: "auto",
                              marginBottom: "8px",
                              display: "flex",
                              flexWrap: "wrap",
                              justifyContent: "center"
                            }}>
                              {product.brand && (
                                <Tag color="purple" style={{
                                  fontSize: "10px",
                                  margin: 0,
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "4px",
                                  justifyContent: "center"
                                }}>
                                  <Text ellipsis={{tooltip: product.brand}}>
                                    {product.brand}
                                  </Text>
                                </Tag>
                              )}
                            </div>
                            <div style={{
                              marginTop: "auto",
                              marginBottom: "8px",
                              display: "flex",
                              flexWrap: "wrap",
                              justifyContent: "center"
                            }}>
                              {product.sku && (
                                <Tag color="blue" style={{fontSize: "10px", margin: 0}}>
                                  <Text
                                    ellipsis={{tooltip: product.sku}}>
                                    {product.sku}
                                  </Text>
                                </Tag>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Badge.Ribbon>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </Col>

        {/* Cart Section */}
        <Col xs={24} lg={10} style={{height: "100%"}}>
          <Card
            title={
              <Space>
                <ShoppingCartOutlined/>
                <span>Giỏ hàng</span>
                <Badge count={getTotalItems()} showZero color="#1890ff"/>
              </Space>
            }
            extra={
              cart.length > 0 && (
                <Button
                  size="small"
                  danger
                  icon={<ClearOutlined/>}
                  onClick={clearCart}
                >
                  Xóa tất cả
                </Button>
              )
            }
            style={{height: "100%", borderRadius: "12px"}}
            styles={{
              body: {
                height: "calc(100% - 57px)",
                display: "flex",
                flexDirection: "column",
              },
            }}
          >
            {cart.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Giỏ hàng trống"
                style={{flex: 1, display: "flex", flexDirection: "column", justifyContent: "center"}}
              />
            ) : (
              <>
                <div style={{flex: 1, overflow: "auto", marginBottom: "16px"}}>
                  <Table
                    dataSource={cart}
                    columns={cartColumns}
                    pagination={false}
                    size="small"
                    rowKey="productId"
                  />
                </div>

                <Divider style={{margin: "12px 0"}}/>

                <div style={{marginBottom: "16px"}}>
                  <Row justify="space-between" style={{marginBottom: "8px"}}>
                    <Text>Tổng sản phẩm:</Text>
                    <Text strong>{getTotalItems()}</Text>
                  </Row>
                  <Row justify="space-between" style={{marginBottom: "8px"}}>
                    <Text>Khách hàng:</Text>
                    <Text>{selectedCustomer?.full_name || "Khách lẻ"}</Text>
                  </Row>
                  <Row justify="space-between" style={{marginBottom: "8px"}}>
                    <Text>Chi nhánh:</Text>
                    <Text>{selectedBranch?.branch_name || "Chưa chọn"}</Text>
                  </Row>

                  <Divider style={{margin: "8px 0"}}/>

                  <Row justify="space-between" style={{marginBottom: "4px"}}>
                    <Text>Tạm tính:</Text>
                    <Text>₫{getSubtotal().toLocaleString()}</Text>
                  </Row>

                  <Row justify="space-between">
                    <Title level={4} style={{margin: 0}}>
                      Tổng cộng:
                    </Title>
                    <Title level={4} style={{margin: 0, color: "#1890ff"}}>
                      ₫{getTotalAmount().toLocaleString()}
                    </Title>
                  </Row>
                </div>

                <Space direction="vertical" style={{width: "100%"}}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined/>}
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || !selectedBranch}
                    loading={isCreatingOrder}
                    style={{width: "100%"}}
                  >
                    Thanh toán
                  </Button>
                  {/*<Row gutter={[8, 8]}>*/}
                  {/*  <Col span={12}>*/}
                  {/*    <Button*/}
                  {/*      size="large"*/}
                  {/*      icon={<SaveOutlined/>}*/}
                  {/*      style={{width: "100%"}}*/}
                  {/*      disabled*/}
                  {/*    >*/}
                  {/*      Lưu hóa đơn tạm*/}
                  {/*    </Button>*/}
                  {/*  </Col>*/}
                  {/*  <Col span={12}>*/}
                  {/*    <Button*/}
                  {/*      size="large"*/}
                  {/*      icon={<PrinterOutlined/>}*/}
                  {/*      style={{width: "100%"}}*/}
                  {/*      disabled*/}
                  {/*    >*/}
                  {/*      In hóa đơn*/}
                  {/*    </Button>*/}
                  {/*  </Col>*/}
                  {/*</Row>*/}
                </Space>
              </>
            )}
          </Card>
        </Col>
      </Row>

      {/* Branch Selection Modal */}
      <Modal
        title="Chọn chi nhánh"
        open={isBranchModalVisible}
        onCancel={() => setIsBranchModalVisible(false)}
        footer={null}
        width={800}
      >
        <Input
          placeholder="Tìm kiếm chi nhánh..."
          prefix={<SearchOutlined/>}
          style={{marginBottom: "16px"}}
        />
        <Row gutter={[16, 16]}>
          {branches.map((branch) => (
            <Col span={12} key={branch.branch_id}>
              <Card
                hoverable
                onClick={() => handleSelectBranch(branch)}
                style={{
                  borderColor:
                    selectedBranch?.branch_id === branch.branch_id
                      ? "#1890ff"
                      : undefined,
                  borderWidth:
                    selectedBranch?.branch_id === branch.branch_id ? 2 : 1,
                }}
              >
                <Space direction="vertical" style={{width: "100%"}}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text strong>{branch.branch_name}</Text>
                    {selectedBranch?.branch_id === branch.branch_id && (
                      <CheckCircleOutlined style={{color: "#1890ff"}}/>
                    )}
                  </div>
                  <Text type="secondary" style={{fontSize: "12px"}}>
                    {branch.address}
                  </Text>
                  <div>
                    <Tag color="blue">{branch.branch_code}</Tag>
                    <Tag
                      color={
                        branch.operating_status === "ACTIVE" ? "green" : "orange"
                      }
                    >
                      {branch.operating_status}
                    </Tag>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>

      {/* Customer Modal */}
      <Modal
        title="Quản lý khách hàng"
        open={isCustomerModalVisible}
        onCancel={() => {
          setIsCustomerModalVisible(false);
          refreshUsers().then(() => {
            form.resetFields();
          });
        }}
        footer={null}
        width={700}
      >
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <Text strong>Chọn loại khách hàng:</Text>
          <Radio.Group
            value={customerType}
            onChange={(e) => handleCustomerTypeChange(e.target.value)}
            style={{marginTop: "8px"}}
          >
            <Space>
              <Radio value="guest">Khách lẻ</Radio>
              <Radio value="existing">Khách hàng có sẵn</Radio>
              {/*<Radio value="new">Khách hàng mới</Radio>*/}
            </Space>
          </Radio.Group>
        </div>

        {customerType === "guest" && (
          <div style={{textAlign: "center", padding: "40px"}}>
            <UserOutlined style={{fontSize: "48px", color: "#d9d9d9"}}/>
            <div style={{marginTop: "16px"}}>
              <Text type="secondary">Sử dụng thông tin khách lẻ mặc định</Text>
            </div>
            <Button
              type="primary"
              onClick={() => {
                handleCustomerTypeChange("guest");
                setIsCustomerModalVisible(false);
              }}
              style={{marginTop: "16px"}}
            >
              Xác nhận
            </Button>
          </div>
        )}

        {customerType === "existing" && (
          <div>
            <Space.Compact style={{width: "100%", marginBottom: "16px"}}>
              <Input
                placeholder="Tìm kiếm theo tên, SĐT hoặc email"
                prefix={<SearchOutlined/>}
                value={customerSearchText}
                onChange={(e) => setCustomerSearchText(e.target.value)}
                onPressEnter={handleSearchCustomer}
              />
              <Button type="primary" onClick={handleSearchCustomer}>
                <SearchOutlined/>
              </Button>
            </Space.Compact>

            <Table
              loading={isUsersLoading}
              dataSource={users}
              columns={[
                {title: "Tên", dataIndex: "full_name", key: "full_name"},
                {title: "SĐT", dataIndex: "phone_number", key: "phone_number"},
                {title: "Email", dataIndex: "email", key: "email"},
                {
                  title: "Thao tác",
                  key: "action",
                  render: (_: unknown, record: UserManagementInfo) => (
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => {
                        setSelectedCustomer(record);
                        setIsCustomerModalVisible(false);
                        message.success(`Đã chọn khách hàng: ${record.full_name}`);
                      }}
                    >
                      Chọn
                    </Button>
                  ),
                },
              ]}
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
              }}
              rowKey="user_id"
              size="small"
            />
          </div>
        )}

        {/*{customerType === "new" && (*/}
        {/*  <div style={{textAlign: "center", padding: "40px"}}>*/}
        {/*    <Text type="secondary">Chức năng tạo khách hàng mới đang được phát triển</Text>*/}
        {/*  </div>*/}
        {/*)}*/}
      </Modal>

      {/* Payment Modal */}
      <PaymentModal
        isVisible={isPaymentModalVisible}
        isCreatingOrder={isCreatingOrder}
        paymentMethod={paymentMethod}
        receivedAmount={receivedAmount}
        totalAmount={getTotalAmount()}
        totalItems={getTotalItems()}
        selectedCustomer={selectedCustomer}
        paymentQRCode={paymentQRCode}
        paymentUrl={paymentUrl}
        orderCode={orderCode}
        onCancel={handleCancelPayment}
        onPayment={handlePayment}
        onPaymentMethodChange={setPaymentMethod}
        onReceivedAmountChange={setReceivedAmount}
        onOpenPaymentLink={handleOpenPaymentLink}
      />
    </div>
  );
};

export default POSPage;
