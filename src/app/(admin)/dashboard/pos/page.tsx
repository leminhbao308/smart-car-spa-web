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
  // GiftOutlined,
  // StarOutlined,
  // PercentageOutlined,
} from "@ant-design/icons";
// import {
//   promotionsData,
//   Promotion,
// } from "@/components/utils/data/promotions.data";
// import {
//   getTierInfo,
//   calculatePointsToEarn,
// } from "@/components/utils/data/points.data";
import {
  useProducts,
  useUserManagement,
  useBranches,
  useWarehouseByBranch,
  useCatalogForSale,
  usePricing,
  useInventoryLevels,
  useSalesOrder,
} from "@/lib/api/hooks";
import {Product, UserManagementInfo, CreateSORequest} from "@/lib/api";
import {useCategories} from "@/lib/api/hooks/useCategory";
import type {BranchDisplay} from "@/lib/api/types/branch.types";
import type {CatalogItem} from "@/lib/api/types/catalog.types";

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
}

// TODO: Uncomment when promotion API is ready
// interface AppliedPromotion {
//   id: number;
//   name: string;
//   type: string;
//   value: number;
//   discountAmount: number;
// }

// TODO: Uncomment when points API is ready
// interface PointsUsage {
//   pointsUsed: number;
//   discountAmount: number;
// }

const POSPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<UserManagementInfo | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchDisplay | null>(null);
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [isBranchModalVisible, setIsBranchModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  // const [isPromotionModalVisible, setIsPromotionModalVisible] = useState(false);
  // const [isPointsModalVisible, setIsPointsModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [customerType, setCustomerType] = useState("guest");
  const [customerSearchText, setCustomerSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  // const [appliedPromotions, setAppliedPromotions] = useState<AppliedPromotion[]>([]);
  // const [pointsUsage, setPointsUsage] = useState<PointsUsage | null>(null);
  const [form] = Form.useForm();

  // API Hooks
  const {branches, loading: branchesLoading} = useBranches({});
  const {warehouse, loading: warehouseLoading} = useWarehouseByBranch(
    selectedBranch?.branch_id || null
  );
  const {catalog, loading: catalogLoading} = useCatalogForSale(
    warehouse?.id
  );
  const {previewBatch, loading: pricingLoading} = usePricing();
  const {levelsBatch, loading: inventoryLoading} = useInventoryLevels();
  const {createDraft, confirm, fulfill, loading: orderLoading} = useSalesOrder();

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

  // Set user filters for customers
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

  // Get available products from catalog
  const availableProducts = useMemo(() => {
    if (!catalog?.items) return [];
    return catalog.items.map((item: CatalogItem) => ({
      ...item.product,
      sellingPrice: item.price,
      availableStock: item.inventory?.available || 0,
    }));
  }, [catalog]);

  const addToCart = (product: Product & { availableStock: number }) => {
    if (product.availableStock <= 0) {
      message.warning("Sản phẩm đã hết hàng!");
      return;
    }

    const existingItem = cart.find((item) => item.productId === product.productId);
    const currentQty = existingItem ? existingItem.quantity : 0;

    if (currentQty + 1 > product.availableStock) {
      message.warning(`Chỉ còn ${product.availableStock} sản phẩm trong kho!`);
      return;
    }

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product.productId
            ? {
              ...item,
              quantity: item.quantity + 1,
              total: (item.quantity + 1) * item.price,
            }
            : item
        )
      );
    } else {
      const newItem: CartItem = {
        productId: product.productId,
        productName: product.productName,
        price: product.sellingPrice || 0,
        quantity: 1,
        total: product.sellingPrice || 0,
        categoryName: product.categoryName,
        availableStock: product.availableStock,
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cart.find((i) => i.productId === productId);
    if (item && quantity > item.availableStock) {
      message.warning(`Chỉ còn ${item.availableStock} sản phẩm trong kho!`);
      return;
    }

    setCart(
      cart.map((item) =>
        item.productId === productId
          ? {...item, quantity, total: quantity * item.price}
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.total, 0);
  };

  // TODO: Implement when promotion API is ready
  // const getTotalDiscount = () => {
  //   const promotionDiscount = appliedPromotions.reduce(
  //     (total, promo) => total + promo.discountAmount,
  //     0
  //   );
  //   const pointsDiscount = pointsUsage?.discountAmount || 0;
  //   return promotionDiscount + pointsDiscount;
  // };

  const getTotalAmount = () => {
    // return getSubtotal() - getTotalDiscount();
    return getSubtotal(); // TODO: Add discount calculation when API is ready
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // TODO: Implement when points API is ready
  // const getPointsToEarn = () => {
  //   if (!selectedCustomer?.customer_rank) return 0;
  //   return calculatePointsToEarn(getTotalAmount(), selectedCustomer.customer_rank.toLowerCase());
  // };

  const handleCheckout = () => {
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
    setIsPaymentModalVisible(true);
  };

  const handlePayment = async () => {
    if (paymentMethod === "cash" && receivedAmount < getTotalAmount()) {
      message.error("Số tiền nhận không đủ!");
      return;
    }

    if (!selectedBranch || !warehouse) {
      message.error("Thiếu thông tin chi nhánh hoặc kho!");
      return;
    }

    try {
      // Create sales order
      const orderRequest: CreateSORequest = {
        branch_id: selectedBranch.branch_id,
        warehouse_id: warehouse.id,
        customer_id: selectedCustomer?.user_id,
        lines: cart.map((item) => ({
          product_id: item.productId,
          qty: item.quantity,
          unit_price: item.price,
        })),
      };

      // Create draft order
      const draftOrder = await createDraft(orderRequest);

      // Confirm order (reserve inventory and lock prices)
      const confirmedOrder = await confirm(draftOrder.id);

      // Fulfill order (complete the sale)
      await fulfill(confirmedOrder.id);

      // TODO: Calculate and award points when API is ready
      // const pointsToEarn = getPointsToEarn();

      message.success("Thanh toán thành công!");
      // TODO: Show points earned message
      // message.success(
      //   `Thanh toán thành công! ${
      //     pointsToEarn > 0 ? `Tích được ${pointsToEarn} điểm.` : ""
      //   }`
      // );

      // Reset states
      setCart([]);
      setSelectedCustomer(null);
      // setAppliedPromotions([]);
      // setPointsUsage(null);
      setIsPaymentModalVisible(false);
      setReceivedAmount(0);
    } catch (error: any) {
      message.error(error?.message || "Có lỗi xảy ra khi thanh toán!");
    }
  };

  const handleCustomerTypeChange = (type: string) => {
    setCustomerType(type);
    if (type === "guest") {
      setSelectedCustomer({
        user_id: "",
        full_name: "Khách lẻ",
        phone_number: "N/A",
        email: "N/A",
      } as UserManagementInfo);
    } else {
      setSelectedCustomer(null);
    }
  };

  const handleSearchCustomer = async () => {
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
  };

  const handleSelectBranch = (branch: BranchDisplay) => {
    setSelectedBranch(branch);
    setCart([]); // Clear cart when switching branch
    setIsBranchModalVisible(false);
    message.success(`Đã chọn chi nhánh: ${branch.branch_name}`);
  };

  // ============ PROMOTION FUNCTIONS (TODO: Implement when API is ready) ============
  // const getAvailablePromotions = () => {
  //   if (!selectedCustomer) return [];
  //   const currentDate = new Date().toISOString().split("T")[0];
  //   return promotionsData.filter(
  //     (promo) =>
  //       promo.status === "active" &&
  //       promo.startDate <= currentDate &&
  //       promo.endDate >= currentDate &&
  //       (promo.usageLimit ? promo.usedCount < promo.usageLimit : true)
  //   );
  // };

  // const applyPromotion = (promotion: Promotion) => {
  //   const subtotal = getSubtotal();
  //   let discountAmount = 0;
  //   const minAmountCondition = promotion.conditions.find(
  //     (condition) => condition.type === "min_amount"
  //   );
  //   if (minAmountCondition?.value && subtotal < minAmountCondition.value) {
  //     message.warning(
  //       `Đơn hàng tối thiểu ${minAmountCondition.value.toLocaleString()} VNĐ`
  //     );
  //     return;
  //   }
  //   if (promotion.type === "percentage") {
  //     discountAmount = (subtotal * promotion.value) / 100;
  //   } else if (promotion.type === "fixed") {
  //     discountAmount = promotion.value;
  //   }
  //   const appliedPromo: AppliedPromotion = {
  //     id: promotion.id,
  //     name: promotion.name,
  //     type: promotion.type,
  //     value: promotion.value,
  //     discountAmount: discountAmount,
  //   };
  //   setAppliedPromotions((prev) => [...prev, appliedPromo]);
  //   message.success(`Áp dụng khuyến mãi: ${promotion.name}`);
  // };

  // const removePromotion = (promotionId: number) => {
  //   setAppliedPromotions((prev) => prev.filter((p) => p.id !== promotionId));
  //   message.success("Đã xóa khuyến mãi");
  // };

  // const clearPointsUsage = () => {
  //   setPointsUsage(null);
  //   message.success("Đã xóa sử dụng điểm");
  // };
  // ============ END PROMOTION FUNCTIONS ============

  const cartColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `₫${price.toLocaleString()}`,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number, record: CartItem) => (
        <Space>
          <Button
            size="small"
            icon={<MinusOutlined/>}
            onClick={() => updateQuantity(record.productId, quantity - 1)}
          />
          <InputNumber
            size="small"
            value={quantity}
            min={1}
            max={record.availableStock}
            style={{width: 60}}
            onChange={(value) => updateQuantity(record.productId, value || 1)}
          />
          <Button
            size="small"
            icon={<PlusOutlined/>}
            onClick={() => updateQuantity(record.productId, quantity + 1)}
          />
        </Space>
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "total",
      key: "total",
      render: (total: number) => `₫${total.toLocaleString()}`,
    },
    {
      title: "Thao tác",
      key: "action",
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

  const filteredProducts = availableProducts.filter((product: any) => {
    const matchesSearch =
      product.productName.toLowerCase().includes(searchText.toLowerCase()) ||
      product.categoryName.toLowerCase().includes(searchText.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || product.categoryName === categoryFilter;

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "in_stock" && product.availableStock > 10) ||
      (stockFilter === "low_stock" &&
        product.availableStock > 0 &&
        product.availableStock <= 10) ||
      (stockFilter === "out_of_stock" && product.availableStock === 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

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
        <Col xs={24} lg={14} style={{height: "100%"}}>
          <Card
            title="Sản phẩm"
            style={{height: "100%", borderRadius: "12px"}}
            styles={{
              body: {height: "calc(100% - 57px)", overflow: "auto"},
            }}
          >
            <Row gutter={[16, 16]} style={{marginBottom: "16px"}}>
              <Col span={8}>
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  prefix={<SearchOutlined/>}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  size="large"
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
                    <Text
                      ellipsis={{tooltip: true}}
                      style={{color: "white"}}
                    >
                      {selectedBranch.branch_name}
                    </Text>
                  ) : (
                    <Text ellipsis={{tooltip: true}}>
                      "Chọn chi nhánh"
                    </Text>
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
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 20px",
                  color: "#999",
                }}
              >
                <ShopOutlined style={{fontSize: "64px", marginBottom: "16px"}}/>
                <Title level={4} style={{color: "#999"}}>
                  Vui lòng chọn chi nhánh để xem sản phẩm
                </Title>
              </div>
            ) : isLoading ? (
              <div style={{textAlign: "center", padding: "80px 20px"}}>
                <Spin size="large"/>
                <div style={{marginTop: "16px"}}>Đang tải sản phẩm...</div>
              </div>
            ) : (
              <Row gutter={[16, 16]}>
                {filteredProducts.map((product: any) => (
                  <Col xs={12} sm={8} md={6} key={product.productId}>
                    <Card
                      hoverable
                      style={{
                        borderRadius: "8px",
                        opacity: product.availableStock === 0 ? 0.5 : 1,
                      }}
                      styles={{
                        body: {padding: "12px"},
                      }}
                      onClick={() =>
                        product.availableStock > 0 && addToCart(product)
                      }
                    >
                      <div style={{textAlign: "center"}}>
                        <div
                          style={{
                            height: "60px",
                            backgroundColor: "#f5f5f5",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <BarcodeOutlined
                            style={{fontSize: "24px", color: "#999"}}
                          />
                        </div>
                        <Text
                          strong
                          style={{
                            fontSize: "12px",
                            display: "block",
                            marginBottom: "4px",
                          }}
                        >
                          {product.productName}
                        </Text>
                        <Text
                          style={{
                            color: "#1890ff",
                            fontSize: "14px",
                            fontWeight: "bold",
                          }}
                        >
                          ₫{product.sellingPrice?.toLocaleString()}
                        </Text>
                        <div style={{marginTop: "4px"}}>
                          <Tag color="blue" style={{fontSize: "10px"}}>
                            {product.categoryName}
                          </Tag>
                          <Tag
                            color={
                              product.availableStock > 10
                                ? "green"
                                : product.availableStock > 0
                                  ? "orange"
                                  : "red"
                            }
                            style={{fontSize: "10px"}}
                          >
                            Tồn: {product.availableStock}
                          </Tag>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10} style={{height: "100%"}}>
          <Card
            title="Giỏ hàng"
            style={{height: "100%", borderRadius: "12px"}}
            styles={{
              body: {
                height: "calc(100% - 57px)",
                display: "flex",
                flexDirection: "column",
              },
            }}
          >
            <div style={{flex: 1, overflow: "auto", marginBottom: "16px"}}>
              <Table
                dataSource={cart}
                columns={cartColumns}
                pagination={false}
                size="small"
                rowKey="productId"
              />
            </div>

            <Divider/>

            <div style={{marginBottom: "16px"}}>
              <Row justify="space-between" style={{marginBottom: "8px"}}>
                <Text>Tổng sản phẩm:</Text>
                <Text strong>{getTotalItems()}</Text>
              </Row>
              <Row justify="space-between" style={{marginBottom: "8px"}}>
                <Text>Khách hàng:</Text>
                <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                  <Text>{selectedCustomer?.full_name || "Khách lẻ"}</Text>
                  {/* TODO: Show customer tier when API is ready */}
                  {/* {selectedCustomer?.customer_rank && (
                    <Tag color={getTierInfo(selectedCustomer.customer_rank.toLowerCase())?.color}>
                      {getTierInfo(selectedCustomer.customer_rank.toLowerCase())?.label}
                    </Tag>
                  )} */}
                </div>
              </Row>
              <Row justify="space-between" style={{marginBottom: "8px"}}>
                <Text>Chi nhánh:</Text>
                <Text>{selectedBranch?.branch_name || "Chưa chọn"}</Text>
              </Row>

              {/* TODO: Show customer points when API is ready */}
              {/* {selectedCustomer?.accumulated_points && (
                <Row justify="space-between" style={{ marginBottom: "8px" }}>
                  <Text>Điểm hiện có:</Text>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Text strong style={{ color: "#52c41a" }}>
                      {selectedCustomer.accumulated_points.toLocaleString()} điểm
                    </Text>
                    <Button
                      size="small"
                      icon={<StarOutlined />}
                      onClick={() => setIsPointsModalVisible(true)}
                    >
                      Sử dụng
                    </Button>
                  </div>
                </Row>
              )} */}

              {/* TODO: Show applied promotions when API is ready */}
              {/* {appliedPromotions.length > 0 && (
                <div style={{ marginBottom: "8px" }}>
                  <Text strong style={{ color: "#1890ff" }}>
                    Khuyến mãi đã áp dụng:
                  </Text>
                  {appliedPromotions.map((promo) => (
                    <div
                      key={promo.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "4px",
                        padding: "4px 8px",
                        backgroundColor: "#f6ffed",
                        borderRadius: "4px",
                      }}
                    >
                      <Text style={{ fontSize: "12px" }}>{promo.name}</Text>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Text style={{ fontSize: "12px", color: "#52c41a" }}>
                          -₫{promo.discountAmount.toLocaleString()}
                        </Text>
                        <Button
                          size="small"
                          type="text"
                          danger
                          onClick={() => removePromotion(promo.id)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )} */}

              {/* TODO: Show points usage when API is ready */}
              {/* {pointsUsage && (
                <div style={{ marginBottom: "8px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "4px 8px",
                      backgroundColor: "#fff7e6",
                      borderRadius: "4px",
                    }}
                  >
                    <Text style={{ fontSize: "12px" }}>
                      Sử dụng {pointsUsage.pointsUsed.toLocaleString()} điểm
                    </Text>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Text style={{ fontSize: "12px", color: "#fa8c16" }}>
                        -₫{pointsUsage.discountAmount.toLocaleString()}
                      </Text>
                      <Button size="small" type="text" danger onClick={clearPointsUsage}>
                        ×
                      </Button>
                    </div>
                  </div>
                </div>
              )} */}

              <Divider style={{margin: "8px 0"}}/>

              <Row justify="space-between" style={{marginBottom: "4px"}}>
                <Text>Tạm tính:</Text>
                <Text>₫{getSubtotal().toLocaleString()}</Text>
              </Row>

              {/* TODO: Show discount when API is ready */}
              {/* {getTotalDiscount() > 0 && (
                <Row justify="space-between" style={{ marginBottom: "4px" }}>
                  <Text style={{ color: "#52c41a" }}>Giảm giá:</Text>
                  <Text style={{ color: "#52c41a" }}>
                    -₫{getTotalDiscount().toLocaleString()}
                  </Text>
                </Row>
              )} */}

              <Row justify="space-between">
                <Title level={4} style={{margin: 0}}>
                  Tổng cộng:
                </Title>
                <Title level={4} style={{margin: 0, color: "#1890ff"}}>
                  ₫{getTotalAmount().toLocaleString()}
                </Title>
              </Row>

              {/* TODO: Show points to earn when API is ready */}
              {/* {selectedCustomer?.customer_rank && getPointsToEarn() > 0 && (
                <Row justify="space-between" style={{ marginTop: "8px" }}>
                  <Text style={{ fontSize: "12px", color: "#52c41a" }}>
                    Sẽ tích được:
                  </Text>
                  <Text style={{ fontSize: "12px", color: "#52c41a" }}>
                    +{getPointsToEarn()} điểm
                  </Text>
                </Row>
              )} */}
            </div>

            <Space direction="vertical" style={{width: "100%"}}>
              {/* TODO: Uncomment when promotion/points API is ready */}
              {/* <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Button
                    size="large"
                    icon={<GiftOutlined />}
                    onClick={() => setIsPromotionModalVisible(true)}
                    disabled={!selectedCustomer || cart.length === 0}
                    style={{ width: "100%" }}
                  >
                    Khuyến mãi
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    size="large"
                    icon={<StarOutlined />}
                    onClick={() => setIsPointsModalVisible(true)}
                    disabled={!selectedCustomer?.accumulated_points || cart.length === 0}
                    style={{ width: "100%" }}
                  >
                    Điểm thưởng
                  </Button>
                </Col>
              </Row> */}

              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined/>}
                onClick={handleCheckout}
                disabled={cart.length === 0 || !selectedBranch}
                loading={orderLoading}
                style={{width: "100%"}}
              >
                Thanh toán
              </Button>
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Button
                    size="large"
                    icon={<SaveOutlined/>}
                    style={{width: "100%"}}
                  >
                    Lưu hóa đơn tạm
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    size="large"
                    icon={<PrinterOutlined/>}
                    style={{width: "100%"}}
                  >
                    In hóa đơn
                  </Button>
                </Col>
              </Row>
            </Space>
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
                        branch.operating_status === "ACTIVE"
                          ? "green"
                          : "orange"
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
              <Radio value="new">Khách hàng mới</Radio>
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
                      }}
                    >
                      Chọn
                    </Button>
                  ),
                },
              ]}
              pagination={false}
              rowKey="user_id"
              size="small"
            />
          </div>
        )}

        {customerType === "new" && (
          //    TODO: Create new customer functionality
          <></>
        )
        }
      </Modal>

      {/* TODO: Promotion Modal - Uncomment when API is ready */}
      {/* <Modal
        title="Áp dụng khuyến mãi"
        open={isPromotionModalVisible}
        onCancel={() => setIsPromotionModalVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ maxHeight: "500px", overflowY: "auto" }}>
          <Text strong style={{ marginBottom: "16px", display: "block" }}>
            Khuyến mãi có thể áp dụng cho khách hàng: {selectedCustomer?.full_name}
          </Text>

          <Row gutter={[16, 16]}>
            {getAvailablePromotions().map((promotion) => (
              <Col span={24} key={promotion.id}>
                <Card
                  hoverable
                  style={{ marginBottom: "8px" }}
                  actions={[
                    <Button
                      key="apply"
                      type="primary"
                      icon={<GiftOutlined />}
                      onClick={() => {
                        applyPromotion(promotion);
                        setIsPromotionModalVisible(false);
                      }}
                    >
                      Áp dụng
                    </Button>,
                  ]}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <Title level={5} style={{ margin: 0, marginBottom: "8px" }}>
                        {promotion.name}
                      </Title>
                      <Text style={{ color: "#666", fontSize: "12px" }}>
                        {promotion.description}
                      </Text>
                      <div style={{ marginTop: "8px" }}>
                        {promotion.type === "percentage" && (
                          <Tag color="blue">
                            <PercentageOutlined /> Giảm {promotion.value}%
                          </Tag>
                        )}
                        {promotion.type === "fixed" && (
                          <Tag color="green">
                            <DollarOutlined /> Giảm {promotion.value.toLocaleString()} VNĐ
                          </Tag>
                        )}
                        {promotion.conditions
                          .filter((condition) => condition.type === "min_amount")
                          .map((condition) => (
                            <Tag key={condition.id} color="orange">
                              Đơn tối thiểu: {condition.value?.toLocaleString()} VNĐ
                            </Tag>
                          ))}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Text style={{ fontSize: "12px", color: "#999" }}>
                        HSD: {new Date(promotion.endDate).toLocaleDateString("vi-VN")}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {getAvailablePromotions().length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
              <GiftOutlined style={{ fontSize: "48px", marginBottom: "16px" }} />
              <div>Không có khuyến mãi nào khả dụng</div>
            </div>
          )}
        </div>
      </Modal> */}

      {/* TODO: Points Modal - Uncomment when API is ready */}
      {/* <Modal
        title="Sử dụng điểm thưởng"
        open={isPointsModalVisible}
        onCancel={() => setIsPointsModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedCustomer && (
          <div>
            <div
              style={{
                backgroundColor: "#f6ffed",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              <Row justify="space-between" style={{ marginBottom: "8px" }}>
                <Text strong>Khách hàng:</Text>
                <Text>{selectedCustomer.full_name}</Text>
              </Row>
              <Row justify="space-between" style={{ marginBottom: "8px" }}>
                <Text strong>Hạng:</Text>
                <Tag color={getTierInfo(selectedCustomer.customer_rank?.toLowerCase() || "bronze")?.color}>
                  {getTierInfo(selectedCustomer.customer_rank?.toLowerCase() || "bronze")?.label}
                </Tag>
              </Row>
              <Row justify="space-between">
                <Text strong>Điểm hiện có:</Text>
                <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
                  {selectedCustomer.accumulated_points?.toLocaleString()} điểm
                </Text>
              </Row>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <Text strong style={{ marginBottom: "8px", display: "block" }}>
                Tỷ lệ quy đổi:
              </Text>
              <div
                style={{
                  backgroundColor: "#fff7e6",
                  padding: "12px",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              >
                {selectedCustomer.customer_rank?.toLowerCase() === "bronze" && "1,000 điểm = 10,000 VNĐ"}
                {selectedCustomer.customer_rank?.toLowerCase() === "silver" && "950 điểm = 10,000 VNĐ"}
                {selectedCustomer.customer_rank?.toLowerCase() === "gold" && "900 điểm = 10,000 VNĐ"}
                {selectedCustomer.customer_rank?.toLowerCase() === "platinum" && "850 điểm = 10,000 VNĐ"}
                {selectedCustomer.customer_rank?.toLowerCase() === "diamond" && "800 điểm = 10,000 VNĐ"}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <Text strong style={{ marginBottom: "8px", display: "block" }}>
                Số điểm muốn sử dụng:
              </Text>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Nhập số điểm"
                min={100}
                max={selectedCustomer.accumulated_points}
                step={100}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ""))}
                onChange={(value) => {
                  if (value) {
                    const discountAmount = Math.floor(value / 100) * 1000;
                    setPointsUsage({
                      pointsUsed: value,
                      discountAmount: discountAmount,
                    });
                  }
                }}
              />
            </div>

            {pointsUsage && (
              <div
                style={{
                  backgroundColor: "#e6f7ff",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "16px",
                }}
              >
                <Row justify="space-between">
                  <Text>Số tiền được giảm:</Text>
                  <Text strong style={{ color: "#1890ff" }}>
                    ₫{pointsUsage.discountAmount.toLocaleString()}
                  </Text>
                </Row>
              </div>
            )}

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Button onClick={() => setIsPointsModalVisible(false)}>Hủy</Button>
              <Button
                type="primary"
                onClick={() => {
                  if (pointsUsage) {
                    message.success(`Đã sử dụng ${pointsUsage.pointsUsed.toLocaleString()} điểm`);
                    setIsPointsModalVisible(false);
                  }
                }}
                disabled={!pointsUsage}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        )}
      </Modal> */}

      {/* Payment Modal */}
      <Modal
        title="Thanh toán"
        open={isPaymentModalVisible}
        onCancel={() => setIsPaymentModalVisible(false)}
        onOk={handlePayment}
        confirmLoading={orderLoading}
        width={400}
      >
        <Space direction="vertical" style={{width: "100%"}}>
          <div>
            <Text strong>Tổng tiền: </Text>
            <Text style={{fontSize: "18px", color: "#1890ff"}}>
              ₫{getTotalAmount().toLocaleString()}
            </Text>
          </div>

          <div>
            <Text strong>Phương thức thanh toán:</Text>
            <Select
              value={paymentMethod}
              onChange={setPaymentMethod}
              style={{width: "100%", marginTop: "8px"}}
            >
              <Option value="cash">
                <DollarOutlined/> Tiền mặt
              </Option>
              <Option value="card">Thẻ</Option>
              <Option value="transfer">Chuyển khoản</Option>
            </Select>
          </div>

          {paymentMethod === "cash" && (
            <div>
              <Text strong>Số tiền nhận:</Text>
              <InputNumber
                value={receivedAmount}
                onChange={(value) => setReceivedAmount(value || 0)}
                style={{width: "100%", marginTop: "8px"}}
                formatter={(value) =>
                  `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => Number(value!.replace(/₫\s?|(,*)/g, ""))}
              />
              {receivedAmount > getTotalAmount() && (
                <Text style={{color: "#52c41a", fontSize: "12px"}}>
                  Tiền thừa: ₫
                  {(receivedAmount - getTotalAmount()).toLocaleString()}
                </Text>
              )}
            </div>
          )}
        </Space>
      </Modal>
    </div>
  );
};

export default POSPage;
