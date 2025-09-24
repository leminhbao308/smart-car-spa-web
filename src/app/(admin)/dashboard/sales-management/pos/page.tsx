"use client";
import React, { useState } from "react";
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
  FilterOutlined,
  GiftOutlined,
  StarOutlined,
  PercentageOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import {
  promotionsData,
  Promotion,
} from "@/components/utils/data/promotions.data";
import {
  getTierInfo,
  calculatePointsToEarn,
} from "@/components/utils/data/points.data";

const { Title, Text } = Typography;
const { Option } = Select;

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  category: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gender?: string;
  address?: string;
  points?: number;
  tier?: string;
}

interface AppliedPromotion {
  id: number;
  name: string;
  type: string;
  value: number;
  discountAmount: number;
}

interface PointsUsage {
  pointsUsed: number;
  discountAmount: number;
}

const POSPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isPromotionModalVisible, setIsPromotionModalVisible] = useState(false);
  const [isPointsModalVisible, setIsPointsModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [customerType, setCustomerType] = useState("guest");
  const [customerSearchText, setCustomerSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceRange] = useState<[number, number]>([0, 10000000]);
  const [stockFilter, setStockFilter] = useState("all");
  const [appliedPromotions, setAppliedPromotions] = useState<
    AppliedPromotion[]
  >([]);
  const [pointsUsage, setPointsUsage] = useState<PointsUsage | null>(null);
  const [form] = Form.useForm();

  // Mock data for products
  const products = [
    {
      id: "1",
      name: "Dầu nhớt Castrol 5W-30",
      price: 450000,
      category: "Dầu nhớt",
      stock: 50,
    },
    {
      id: "2",
      name: "Lọc gió động cơ",
      price: 120000,
      category: "Phụ tùng",
      stock: 30,
    },
    {
      id: "3",
      name: "Phanh đĩa trước",
      price: 850000,
      category: "Phụ tùng",
      stock: 15,
    },
    {
      id: "4",
      name: "Nước làm mát",
      price: 180000,
      category: "Chất lỏng",
      stock: 25,
    },
    {
      id: "5",
      name: "Bugi NGK",
      price: 95000,
      category: "Phụ tùng",
      stock: 40,
    },
    {
      id: "6",
      name: "Dầu phanh DOT 4",
      price: 220000,
      category: "Chất lỏng",
      stock: 20,
    },
  ];

  const customers = [
    {
      id: "1",
      name: "Nguyễn Văn A",
      phone: "0123456789",
      email: "nguyenvana@email.com",
      gender: "Nam",
      address: "Hà Nội",
      points: 2500,
      tier: "silver",
    },
    {
      id: "2",
      name: "Trần Thị B",
      phone: "0987654321",
      email: "tranthib@email.com",
      gender: "Nữ",
      address: "TP.HCM",
      points: 8500,
      tier: "gold",
    },
    {
      id: "3",
      name: "Lê Văn C",
      phone: "0369852147",
      email: "levanc@email.com",
      gender: "Nam",
      address: "Đà Nẵng",
      points: 15000,
      tier: "platinum",
    },
  ];

  const categories = ["Tất cả", "Dầu nhớt", "Phụ tùng", "Chất lỏng", "Dịch vụ"];

  const addToCart = (product: {
    id: string;
    name: string;
    price: number;
    category: string;
    stock: number;
  }) => {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
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
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        total: product.price,
        category: product.category,
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(
      cart.map((item) =>
        item.id === id
          ? { ...item, quantity, total: quantity * item.price }
          : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.total, 0);
  };

  const getTotalDiscount = () => {
    const promotionDiscount = appliedPromotions.reduce(
      (total, promo) => total + promo.discountAmount,
      0
    );
    const pointsDiscount = pointsUsage?.discountAmount || 0;
    return promotionDiscount + pointsDiscount;
  };

  const getTotalAmount = () => {
    return getSubtotal() - getTotalDiscount();
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getPointsToEarn = () => {
    if (!selectedCustomer?.tier) return 0;
    return calculatePointsToEarn(getTotalAmount(), selectedCustomer.tier);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      message.warning("Giỏ hàng trống!");
      return;
    }
    setIsPaymentModalVisible(true);
  };

  const handlePayment = () => {
    if (paymentMethod === "cash" && receivedAmount < getTotalAmount()) {
      message.error("Số tiền nhận không đủ!");
      return;
    }

    // Calculate points to earn
    const pointsToEarn = getPointsToEarn();

    message.success(
      `Thanh toán thành công! ${
        pointsToEarn > 0 ? `Tích được ${pointsToEarn} điểm.` : ""
      }`
    );

    // Reset all states
    setCart([]);
    setSelectedCustomer(null);
    setAppliedPromotions([]);
    setPointsUsage(null);
    setIsPaymentModalVisible(false);
    setReceivedAmount(0);
  };

  const handleCustomerTypeChange = (type: string) => {
    setCustomerType(type);
    if (type === "guest") {
      setSelectedCustomer({
        id: "guest",
        name: "Khách lẻ",
        phone: "N/A",
        email: "N/A",
      });
    } else {
      setSelectedCustomer(null);
    }
  };

  const handleAddNewCustomer = (values: {
    name: string;
    phone: string;
    email?: string;
    gender?: string;
    address?: string;
  }) => {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: values.name,
      phone: values.phone,
      email: values.email,
      gender: values.gender,
      address: values.address,
    };
    setSelectedCustomer(newCustomer);
    setIsCustomerModalVisible(false);
    form.resetFields();
    message.success("Thêm khách hàng thành công!");
  };

  const handleSearchCustomer = () => {
    const foundCustomer = customers.find(
      (customer) =>
        customer.phone.includes(customerSearchText) ||
        (customer.email && customer.email.includes(customerSearchText))
    );

    if (foundCustomer) {
      setSelectedCustomer(foundCustomer);
      setCustomerSearchText("");
      message.success("Tìm thấy khách hàng!");
    } else {
      message.warning("Không tìm thấy khách hàng!");
    }
  };

  // Promotion functions
  const getAvailablePromotions = () => {
    if (!selectedCustomer) return [];

    const currentDate = new Date().toISOString().split("T")[0];
    return promotionsData.filter(
      (promo) =>
        promo.status === "active" &&
        promo.startDate <= currentDate &&
        promo.endDate >= currentDate &&
        (promo.usageLimit ? promo.usedCount < promo.usageLimit : true)
    );
  };

  const applyPromotion = (promotion: Promotion) => {
    const subtotal = getSubtotal();
    let discountAmount = 0;

    // Check conditions - find min_amount condition
    const minAmountCondition = promotion.conditions.find(
      (condition) => condition.type === "min_amount"
    );
    if (minAmountCondition?.value && subtotal < minAmountCondition.value) {
      message.warning(
        `Đơn hàng tối thiểu ${minAmountCondition.value.toLocaleString()} VNĐ`
      );
      return;
    }

    // Calculate discount
    if (promotion.type === "percentage") {
      discountAmount = (subtotal * promotion.value) / 100;
      // Note: maxDiscountAmount is not available in current Promotion interface
      // This would need to be added to the interface if needed
    } else if (promotion.type === "fixed") {
      discountAmount = promotion.value;
    }

    const appliedPromo: AppliedPromotion = {
      id: promotion.id,
      name: promotion.name,
      type: promotion.type,
      value: promotion.value,
      discountAmount: discountAmount,
    };

    setAppliedPromotions((prev) => [...prev, appliedPromo]);
    message.success(`Áp dụng khuyến mãi: ${promotion.name}`);
  };

  const removePromotion = (promotionId: number) => {
    setAppliedPromotions((prev) => prev.filter((p) => p.id !== promotionId));
    message.success("Đã xóa khuyến mãi");
  };

  // Points functions - removed unused function

  const clearPointsUsage = () => {
    setPointsUsage(null);
    message.success("Đã xóa sử dụng điểm");
  };

  const cartColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
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
            icon={<MinusOutlined />}
            onClick={() => updateQuantity(record.id, quantity - 1)}
          />
          <InputNumber
            size="small"
            value={quantity}
            min={1}
            style={{ width: 60 }}
            onChange={(value) => updateQuantity(record.id, value || 1)}
          />
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => updateQuantity(record.id, quantity + 1)}
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
          icon={<DeleteOutlined />}
          onClick={() => removeFromCart(record.id)}
        />
      ),
    },
  ];

  const filteredProducts = products.filter(
    (product: {
      id: string;
      name: string;
      price: number;
      category: string;
      stock: number;
    }) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.category.toLowerCase().includes(searchText.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in_stock" && product.stock > 0) ||
        (stockFilter === "low_stock" &&
          product.stock > 0 &&
          product.stock <= 10) ||
        (stockFilter === "out_of_stock" && product.stock === 0);

      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    }
  );

  return (
    <div
      style={{
        height: "calc(100vh - 13.9rem)",
        padding: "0",
        overflow: "hidden",
      }}
    >
      <Row gutter={[24, 24]} style={{ height: "100%" }}>
        {/* Left Panel - Products */}
        <Col xs={24} lg={14} style={{ height: "100%" }}>
          <Card
            title={"Sản phẩm"}
            style={{ height: "100%", borderRadius: "12px" }}
            styles={{
              body: { height: "calc(100% - 57px)", overflow: "auto" },
            }}
          >
            {/* Search and Filters */}
            <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
              <Col span={8}>
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  prefix={<SearchOutlined />}
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
                  style={{ width: "100%" }}
                  size="large"
                >
                  <Option value="all">Tất cả</Option>
                  {categories.slice(1).map((cat) => (
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
                  style={{ width: "100%" }}
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
                  icon={<FilterOutlined />}
                  style={{ width: "100%" }}
                >
                  Lọc
                </Button>
              </Col>
              <Col span={4}>
                <Button
                  size="large"
                  icon={<UserOutlined />}
                  onClick={() => setIsCustomerModalVisible(true)}
                  style={{ width: "100%" }}
                >
                  {selectedCustomer ? selectedCustomer.name : "Khách hàng"}
                </Button>
              </Col>
            </Row>

            {/* Products Grid */}
            <Row gutter={[16, 16]}>
              {filteredProducts.map((product) => (
                <Col xs={12} sm={8} md={6} key={product.id}>
                  <Card
                    hoverable
                    style={{ borderRadius: "8px" }}
                    styles={{
                      body: { padding: "12px" },
                    }}
                    onClick={() => addToCart(product)}
                  >
                    <div style={{ textAlign: "center" }}>
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
                          style={{ fontSize: "24px", color: "#999" }}
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
                        {product.name}
                      </Text>
                      <Text
                        style={{
                          color: "#1890ff",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      >
                        ₫{product.price.toLocaleString()}
                      </Text>
                      <div style={{ marginTop: "4px" }}>
                        <Tag color="blue" style={{ fontSize: "10px" }}>
                          {product.category}
                        </Tag>
                        <Tag
                          color={
                            product.stock > 10
                              ? "green"
                              : product.stock > 0
                              ? "orange"
                              : "red"
                          }
                          style={{ fontSize: "10px" }}
                        >
                          Tồn: {product.stock}
                        </Tag>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Right Panel - Cart */}
        <Col xs={24} lg={10} style={{ height: "100%" }}>
          <Card
            title={"Giỏ hàng"}
            style={{ height: "100%", borderRadius: "12px" }}
            styles={{
              body: {
                height: "calc(100% - 57px)",
                display: "flex",
                flexDirection: "column",
              },
            }}
          >
            <div style={{ flex: 1, overflow: "auto", marginBottom: "16px" }}>
              <Table
                dataSource={cart}
                columns={cartColumns}
                pagination={false}
                size="small"
                rowKey="id"
              />
            </div>

            <Divider />

            <div style={{ marginBottom: "16px" }}>
              <Row justify="space-between" style={{ marginBottom: "8px" }}>
                <Text>Tổng sản phẩm:</Text>
                <Text strong>{getTotalItems()}</Text>
              </Row>
              <Row justify="space-between" style={{ marginBottom: "8px" }}>
                <Text>Khách hàng:</Text>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Text>{selectedCustomer?.name || "Khách lẻ"}</Text>
                  {selectedCustomer?.tier && (
                    <Tag color={getTierInfo(selectedCustomer.tier)?.color}>
                      {getTierInfo(selectedCustomer.tier)?.label}
                    </Tag>
                  )}
                </div>
              </Row>

              {/* Customer Points Info */}
              {selectedCustomer?.points && (
                <Row justify="space-between" style={{ marginBottom: "8px" }}>
                  <Text>Điểm hiện có:</Text>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Text strong style={{ color: "#52c41a" }}>
                      {selectedCustomer.points.toLocaleString()} điểm
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
              )}

              {/* Applied Promotions */}
              {appliedPromotions.length > 0 && (
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
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
              )}

              {/* Points Usage */}
              {pointsUsage && (
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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Text style={{ fontSize: "12px", color: "#fa8c16" }}>
                        -₫{pointsUsage.discountAmount.toLocaleString()}
                      </Text>
                      <Button
                        size="small"
                        type="text"
                        danger
                        onClick={clearPointsUsage}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <Divider style={{ margin: "8px 0" }} />

              {/* Subtotal */}
              <Row justify="space-between" style={{ marginBottom: "4px" }}>
                <Text>Tạm tính:</Text>
                <Text>₫{getSubtotal().toLocaleString()}</Text>
              </Row>

              {/* Total Discount */}
              {getTotalDiscount() > 0 && (
                <Row justify="space-between" style={{ marginBottom: "4px" }}>
                  <Text style={{ color: "#52c41a" }}>Giảm giá:</Text>
                  <Text style={{ color: "#52c41a" }}>
                    -₫{getTotalDiscount().toLocaleString()}
                  </Text>
                </Row>
              )}

              {/* Final Total */}
              <Row justify="space-between">
                <Title level={4} style={{ margin: 0 }}>
                  Tổng cộng:
                </Title>
                <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
                  ₫{getTotalAmount().toLocaleString()}
                </Title>
              </Row>

              {/* Points to Earn */}
              {selectedCustomer?.tier && getPointsToEarn() > 0 && (
                <Row justify="space-between" style={{ marginTop: "8px" }}>
                  <Text style={{ fontSize: "12px", color: "#52c41a" }}>
                    Sẽ tích được:
                  </Text>
                  <Text style={{ fontSize: "12px", color: "#52c41a" }}>
                    +{getPointsToEarn()} điểm
                  </Text>
                </Row>
              )}
            </div>

            <Space direction="vertical" style={{ width: "100%" }}>
              {/* Promotion and Points Buttons */}
              <Row gutter={[8, 8]}>
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
                    disabled={!selectedCustomer?.points || cart.length === 0}
                    style={{ width: "100%" }}
                  >
                    Điểm thưởng
                  </Button>
                </Col>
              </Row>

              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={handleCheckout}
                disabled={cart.length === 0}
                style={{ width: "100%" }}
              >
                Thanh toán
              </Button>
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Button
                    size="large"
                    icon={<SaveOutlined />}
                    style={{ width: "100%" }}
                  >
                    Lưu hóa đơn tạm
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    size="large"
                    icon={<PrinterOutlined />}
                    style={{ width: "100%" }}
                  >
                    In hóa đơn
                  </Button>
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Customer Modal */}
      <Modal
        title="Quản lý khách hàng"
        open={isCustomerModalVisible}
        onCancel={() => {
          setIsCustomerModalVisible(false);
          form.resetFields();
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
            style={{ marginTop: "8px" }}
          >
            <Space>
              <Radio value="guest">Khách lẻ</Radio>
              <Radio value="existing">Khách hàng có sẵn</Radio>
              <Radio value="new">Khách hàng mới</Radio>
            </Space>
          </Radio.Group>
        </div>

        {customerType === "guest" && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <UserOutlined style={{ fontSize: "48px", color: "#d9d9d9" }} />
            <div style={{ marginTop: "16px" }}>
              <Text type="secondary">Sử dụng thông tin khách lẻ mặc định</Text>
            </div>
            <Button
              type="primary"
              onClick={() => {
                handleCustomerTypeChange("guest");
                setIsCustomerModalVisible(false);
              }}
              style={{ marginTop: "16px" }}
            >
              Xác nhận
            </Button>
          </div>
        )}

        {customerType === "existing" && (
          <div>
            <Space.Compact style={{ width: "100%", marginBottom: "16px" }}>
              <Input
                placeholder="Tìm kiếm theo tên, SĐT hoặc email"
                prefix={<SearchOutlined />}
                value={customerSearchText}
                onChange={(e) => setCustomerSearchText(e.target.value)}
                onPressEnter={handleSearchCustomer}
              />
              <Button type="primary" onClick={handleSearchCustomer}>
                <SearchOutlined />
              </Button>
            </Space.Compact>

            <Table
              dataSource={customers}
              columns={[
                { title: "Tên", dataIndex: "name", key: "name" },
                { title: "SĐT", dataIndex: "phone", key: "phone" },
                { title: "Email", dataIndex: "email", key: "email" },
                {
                  title: "Thao tác",
                  key: "action",
                  render: (_: unknown, record: Customer) => (
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
              rowKey="id"
              size="small"
            />
          </div>
        )}

        {customerType === "new" && (
          <Form form={form} layout="vertical" onFinish={handleAddNewCustomer}>
            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số điện thoại",
                },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: "Số điện thoại không hợp lệ",
                },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[{ type: "email", message: "Email không hợp lệ" }]}
            >
              <Input placeholder="Nhập email (tùy chọn)" />
            </Form.Item>

            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
            >
              <Radio.Group>
                <Radio value="Nam">Nam</Radio>
                <Radio value="Nữ">Nữ</Radio>
                <Radio value="Khác">Khác</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item label="Địa chỉ" name="address">
              <Input placeholder="Nhập địa chỉ (tùy chọn)" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: "100%" }}
              >
                Thêm khách hàng
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Promotion Modal */}
      <Modal
        title="Áp dụng khuyến mãi"
        open={isPromotionModalVisible}
        onCancel={() => setIsPromotionModalVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ maxHeight: "500px", overflowY: "auto" }}>
          <Text strong style={{ marginBottom: "16px", display: "block" }}>
            Khuyến mãi có thể áp dụng cho khách hàng: {selectedCustomer?.name}
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
                      <Title
                        level={5}
                        style={{ margin: 0, marginBottom: "8px" }}
                      >
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
                            <DollarOutlined /> Giảm{" "}
                            {promotion.value.toLocaleString()} VNĐ
                          </Tag>
                        )}
                        {promotion.conditions
                          .filter(
                            (condition) => condition.type === "min_amount"
                          )
                          .map((condition) => (
                            <Tag key={condition.id} color="orange">
                              Đơn tối thiểu: {condition.value?.toLocaleString()}{" "}
                              VNĐ
                            </Tag>
                          ))}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Text style={{ fontSize: "12px", color: "#999" }}>
                        HSD:{" "}
                        {new Date(promotion.endDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {getAvailablePromotions().length === 0 && (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#999" }}
            >
              <GiftOutlined
                style={{ fontSize: "48px", marginBottom: "16px" }}
              />
              <div>Không có khuyến mãi nào khả dụng</div>
            </div>
          )}
        </div>
      </Modal>

      {/* Points Modal */}
      <Modal
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
                <Text>{selectedCustomer.name}</Text>
              </Row>
              <Row justify="space-between" style={{ marginBottom: "8px" }}>
                <Text strong>Hạng:</Text>
                <Tag
                  color={getTierInfo(selectedCustomer.tier || "bronze")?.color}
                >
                  {getTierInfo(selectedCustomer.tier || "bronze")?.label}
                </Tag>
              </Row>
              <Row justify="space-between">
                <Text strong>Điểm hiện có:</Text>
                <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
                  {selectedCustomer.points?.toLocaleString()} điểm
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
                {selectedCustomer.tier === "bronze" &&
                  "1,000 điểm = 10,000 VNĐ"}
                {selectedCustomer.tier === "silver" && "950 điểm = 10,000 VNĐ"}
                {selectedCustomer.tier === "gold" && "900 điểm = 10,000 VNĐ"}
                {selectedCustomer.tier === "platinum" &&
                  "850 điểm = 10,000 VNĐ"}
                {selectedCustomer.tier === "diamond" && "800 điểm = 10,000 VNĐ"}
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
                max={selectedCustomer.points}
                step={100}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
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

            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <Button onClick={() => setIsPointsModalVisible(false)}>
                Hủy
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  if (pointsUsage) {
                    message.success(
                      `Đã sử dụng ${pointsUsage.pointsUsed.toLocaleString()} điểm`
                    );
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
      </Modal>

      {/* Payment Modal */}
      <Modal
        title="Thanh toán"
        open={isPaymentModalVisible}
        onCancel={() => setIsPaymentModalVisible(false)}
        onOk={handlePayment}
        width={400}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <Text strong>Tổng tiền: </Text>
            <Text style={{ fontSize: "18px", color: "#1890ff" }}>
              ₫{getTotalAmount().toLocaleString()}
            </Text>
          </div>

          <div>
            <Text strong>Phương thức thanh toán:</Text>
            <Select
              value={paymentMethod}
              onChange={setPaymentMethod}
              style={{ width: "100%", marginTop: "8px" }}
            >
              <Option value="cash">Tiền mặt</Option>
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
                style={{ width: "100%", marginTop: "8px" }}
                formatter={(value) =>
                  `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => Number(value!.replace(/₫\s?|(,*)/g, ""))}
              />
              {receivedAmount > getTotalAmount() && (
                <Text style={{ color: "#52c41a", fontSize: "12px" }}>
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
