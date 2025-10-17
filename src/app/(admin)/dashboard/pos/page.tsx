"use client";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {App, Col, Form, Row, Select, Typography,} from "antd";
import {useBranches, useCatalogForSale, useCreateAndPay, useFulfillSalesOrder, useInventoryLevels, usePricing, useUserManagement, useVerifyPayment,} from "@/lib/api/hooks";
import {Product, UserManagementInfo} from "@/lib/api";
import {useCategories} from "@/lib/api/hooks/useCategory";
import type {BranchDisplay} from "@/lib/api/types/branch.types";
import type {CatalogItem} from "@/lib/api/types/catalog.types";
import {PaymentModal} from "@/components/ui/Modal/PaymentModal";
import BranchSelectionModal from "@/components/ui/Modal/PosModal/BranchSelectionModal";
import CustomerSelectionModal from "@/components/ui/Modal/PosModal/CustomerSelectionModal";
import CartSection, {CartItem} from "@/components/ui/Pos/CartSection";
import ProductSection from "@/components/ui/Pos/ProductSection";

interface ProductWithStock extends Product {
  sellingPrice: number;
  availableStock: number;
}

const POSPage = () => {
  // Ant Design Message
  const {message, modal} = App.useApp();

  // State Management
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<UserManagementInfo | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchDisplay | null>(
    null
  );
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [isBranchModalVisible, setIsBranchModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK">("CASH");
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [customerSearchText, setCustomerSearchText] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [form] = Form.useForm();

  // PayOS State
  const [paymentQRCode, setPaymentQRCode] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<number | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // API Hooks
  const {branches, loading: branchesLoading} = useBranches({});
  const {
    catalog,
    loading: catalogLoading,
    refresh: refreshCatalog,
  } = useCatalogForSale(selectedBranch?.branch_id || "");
  const {previewBatch, loading: pricingLoading} = usePricing();
  const {levelsBatch, loading: inventoryLoading} = useInventoryLevels();
  const {mutateAsync: createAndPay, isPending: isCreatingOrder} =
    useCreateAndPay();
  const {mutateAsync: fulfillOrder, isPending: isFulfilling} =
    useFulfillSalesOrder();

  // Payment verification with polling
  const {data: paymentStatus, isLoading: isVerifying} = useVerifyPayment(
    orderCode,
    {
      enabled: isPolling && !!orderCode,
      refetchInterval: 3000,
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

  // Cart Management Functions
  const addToCart = useCallback((product: ProductWithStock) => {
    if (product.availableStock <= 0) {
      message.warning("Sản phẩm đã hết hàng!");
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.productId === product.product_id
      );
      const currentQty = existingItem ? existingItem.quantity : 0;

      if (currentQty + 1 > product.availableStock) {
        message.warning(
          `Chỉ còn ${product.availableStock} sản phẩm trong kho!`
        );
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
    setCart((prevCart) =>
      prevCart.filter((item) => item.productId !== productId)
    );
    message.info("Đã xóa sản phẩm khỏi giỏ hàng");
  }, []);

  const clearCart = useCallback(() => {
    modal.confirm({
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

  // Branch Management
  const handleSelectBranch = useCallback((branch: BranchDisplay) => {
    setSelectedBranch(branch);
    setCart([]);
    setIsBranchModalVisible(false);
    message.success(`Đã chọn chi nhánh: ${branch.branch_name}`);
  }, []);

  // Customer Management
  const handleCustomerTypeChange = useCallback((type: string) => {
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
        message.error(
          "Thanh toán thành công nhưng lỗi khi hoàn thành đơn hàng: " +
          (error?.message || "")
        );
      }
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
    setCurrentOrderId(null);

    // Refresh catalog
    refreshCatalog();
  }, [currentOrderId, fulfillOrder, refreshCatalog]);

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
    setReceivedAmount(getTotalAmount());
    setPaymentMethod("CASH");
    setPaymentQRCode(null);
    setPaymentUrl(null);
    setOrderCode(null);
    setIsPolling(false);
    setIsPaymentModalVisible(true);
  }, [cart.length, selectedBranch, getTotalAmount]);

  useEffect(() => {
    if (!paymentStatus || !isPolling) return;

    if (paymentStatus.status === "COMPLETED") {
      handlePaymentSuccess();
    } else if (paymentStatus.status === "CANCELED") {
      handlePaymentCancelled();
    }
  }, [paymentStatus, isPolling, handlePaymentSuccess, handlePaymentCancelled]);

  const handlePayment = useCallback(async () => {
    // Validation for cash payment
    if (paymentMethod === "CASH" && receivedAmount < getTotalAmount()) {
      message.error("Số tiền nhận không đủ!");
      return;
    }

    if (!selectedBranch) {
      message.error("Thiếu thông tin chi nhánh!");
      return;
    }

    const hide = message.loading("Đang xử lý thanh toán...", 0);

    try {
      const baseUrl = window.location.origin;
      const orderRequest = {
        branch_id: selectedBranch.branch_id,
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
            message.error(
              "Lỗi khi hoàn thành đơn hàng: " + (error?.message || "")
            );
          }
        }

        // Reset states
        setCart([]);
        setSelectedCustomer(null);
        setIsPaymentModalVisible(false);
        setReceivedAmount(0);
        setPaymentMethod("CASH");

        // Refresh catalog
        refreshCatalog();
      }
      // Handle BANK payment
      else if (paymentMethod === "BANK") {
        if (response.payment.payment_url) {
          setPaymentUrl(response.payment.payment_url);
          setPaymentQRCode(response.payment.qr_code || null);
          setOrderCode(response.payment.order_code || null);
          setIsPolling(true); // Start polling

          message.success(
            "Đã tạo đơn hàng! Vui lòng quét mã QR hoặc truy cập link thanh toán"
          );
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
    selectedCustomer,
    cart,
    createAndPay,
    refreshCatalog,
  ]);

  const handleOpenPaymentLink = useCallback(() => {
    if (paymentUrl) {
      window.open(paymentUrl, "_blank");
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

  const isLoading =
    catalogLoading || pricingLoading || inventoryLoading || branchesLoading || isFulfilling;

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
          <ProductSection
            products={availableProducts}
            categories={categories}
            selectedBranch={selectedBranch}
            selectedCustomer={selectedCustomer}
            isLoading={isLoading}
            onAddToCart={addToCart}
            onRefresh={refreshCatalog}
            onBranchClick={() => setIsBranchModalVisible(true)}
            onCustomerClick={() => setIsCustomerModalVisible(true)}
          />
        </Col>

        {/* Cart Section */}
        <Col xs={24} lg={10} style={{height: "100%"}}>
          <CartSection
            cart={cart}
            selectedCustomer={selectedCustomer}
            selectedBranch={selectedBranch}
            isCreatingOrder={isCreatingOrder}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            onCheckout={handleCheckout}
          />
        </Col>

        {/* Branch Selection Modal */}
        <BranchSelectionModal
          isVisible={isBranchModalVisible}
          branches={branches}
          selectedBranch={selectedBranch}
          onSelect={handleSelectBranch}
          onCancel={() => setIsBranchModalVisible(false)}
        />

        {/* Customer Modal */}
        <CustomerSelectionModal
          isVisible={isCustomerModalVisible}
          customers={users}
          selectedCustomer={selectedCustomer}
          isLoading={isUsersLoading}
          onSelect={(customer) => {
            setSelectedCustomer(customer);
            setIsCustomerModalVisible(false);
            message.success(`Đã chọn khách hàng: ${customer.full_name}`);
          }}
          onCancel={() => {
            setIsCustomerModalVisible(false);
            refreshUsers().then(() => {
              form.resetFields();
            });
          }}
          onSearch={handleSearchCustomer}
          onCustomerTypeChange={handleCustomerTypeChange}
        />

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
      </Row>
    </div>
  );
};

export default POSPage;
