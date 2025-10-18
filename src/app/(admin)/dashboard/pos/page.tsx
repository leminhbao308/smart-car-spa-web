"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { App, Col, Form, Row, Select, Typography } from "antd";
import {
  useBranches,
  useCatalogForSale,
  useCreateAndPay,
  useFulfillSalesOrder,
  useInventoryLevels,
  usePricing,
  useUserManagement,
  useVerifyPayment,
} from "@/lib/api/hooks";
import { Product, UserManagementInfo } from "@/lib/api";
import { useCategories } from "@/lib/api/hooks/useCategory";
import type { BranchDisplay } from "@/lib/api/types/branch.types";
import type { CatalogItem } from "@/lib/api/types/catalog.types";
import { PaymentModal } from "@/components/ui/Modal/PaymentModal";
import BranchSelectionModal from "@/components/ui/Modal/PosModal/BranchSelectionModal";
import CustomerSelectionModal from "@/components/ui/Modal/PosModal/CustomerSelectionModal";
import PromotionModal from "@/components/ui/Modal/PosModal/PromotionModal";
import CartSection, { CartItem } from "@/components/ui/Pos/CartSection";
import ProductSection from "@/components/ui/Pos/ProductSection";
import { useActivePromotions } from "@/lib/api/hooks/usePromotions";
import type { Promotion } from "@/lib/api/types/promotion.types";
import {
  calculateTotalDiscounts,
  isPromotionApplicable,
} from "@/lib/utils/promotion-calculator";
import {
  recalculateAllFreeItems,
  removeFreeItemsByPromotion,
} from "@/lib/utils/free-item-manager";

interface ProductWithStock extends Product {
  sellingPrice: number;
  availableStock: number;
}

const POSPage = () => {
  // Ant Design Message
  const { message, modal } = App.useApp();

  // State Management
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPromotions, setSelectedPromotions] = useState<Promotion[]>([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState<UserManagementInfo | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchDisplay | null>(
    null
  );
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [isBranchModalVisible, setIsBranchModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isPromotionModalVisible, setIsPromotionModalVisible] = useState(false);
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
  const { branches, loading: branchesLoading } = useBranches({});
  const {
    catalog,
    loading: catalogLoading,
    refresh: refreshCatalog,
  } = useCatalogForSale(selectedBranch?.branch_id || "");
  const { previewBatch, loading: pricingLoading } = usePricing();
  const { levelsBatch, loading: inventoryLoading } = useInventoryLevels();
  const { mutateAsync: createAndPay, isPending: isCreatingOrder } =
    useCreateAndPay();
  const { mutateAsync: fulfillOrder, isPending: isFulfilling } =
    useFulfillSalesOrder();

  // Fetch active promotions (not filtered by branch since promotions can be global)
  const {
    data: promotionsData,
    isLoading: isLoadingPromotions,
    refetch: refetchPromotions,
  } = useActivePromotions({
    // Don't filter by branch_id - promotions with branch=null apply to all branches
    is_active: true,
    page: 0,
    size: 100,
  });

  // Debug: Log promotions data
  useEffect(() => {
    console.log("🎁 Promotions Data:", promotionsData);
    console.log("🏢 Selected Branch:", selectedBranch);
    console.log(
      "📦 Available Promotions Count:",
      promotionsData?.content?.length
    );
  }, [promotionsData, selectedBranch]);

  // Payment verification with polling
  const { data: paymentStatus, isLoading: isVerifying } = useVerifyPayment(
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

  // Get available promotions
  const availablePromotions = useMemo(() => {
    return promotionsData?.content || [];
  }, [promotionsData]);

  // Create product lookup map for free item calculations
  const productLookup = useMemo(() => {
    const map = new Map<
      string,
      { name: string; price: number; stock: number; category: string }
    >();

    if (catalog?.items) {
      for (const item of catalog.items) {
        map.set(item.product.product_id, {
          name: item.product.product_name,
          price: item.price,
          stock: item.inventory?.available || 0,
          category: "Sản phẩm", // Generic category for now
        });
      }
    }

    return map;
  }, [catalog]);

  // Calculate cart summary with promotions
  const cartSummary = useMemo(() => {
    return calculateTotalDiscounts(selectedPromotions, cart);
  }, [selectedPromotions, cart]);

  // Auto-remove non-applicable promotions when cart changes
  useEffect(() => {
    if (selectedPromotions.length === 0) return;

    const nonApplicablePromotions = selectedPromotions.filter(
      (promo) => !isPromotionApplicable(promo, cart)
    );

    if (nonApplicablePromotions.length > 0) {
      setSelectedPromotions((prev) => {
        const newPromotions = prev.filter((promo) =>
          isPromotionApplicable(promo, cart)
        );

        // Show message for removed promotions
        for (const promo of nonApplicablePromotions) {
          message.warning(
            `Khuyến mãi "${promo.name}" không còn áp dụng và đã bị bỏ chọn`
          );
        }

        // Remove free items from non-applicable promotions
        setCart((currentCart) => {
          let updatedCart = currentCart;
          for (const promo of nonApplicablePromotions) {
            updatedCart = removeFreeItemsByPromotion(
              updatedCart,
              promo.promotion_id
            );
          }
          return updatedCart;
        });

        return newPromotions;
      });
    }
  }, [cart, selectedPromotions, message]);

  // Cart Management Functions
  const addToCart = useCallback(
    (product: ProductWithStock) => {
      if (product.availableStock <= 0) {
        message.warning("Sản phẩm đã hết hàng!");
        return;
      }

      let shouldShowMessage = false;
      let messageText = "";

      setCart((prevCart) => {
        const existingItem = prevCart.find(
          (item) => item.productId === product.product_id
        );
        const currentQty = existingItem ? existingItem.quantity : 0;

        if (currentQty + 1 > product.availableStock) {
          return prevCart;
        }

        if (existingItem) {
          shouldShowMessage = true;
          messageText = `Đã tăng số lượng ${product.product_name}`;
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
          shouldShowMessage = true;
          messageText = `Đã thêm ${product.product_name} vào giỏ hàng`;
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
          return [...prevCart, newItem];
        }
      });

      if (shouldShowMessage) {
        message.success(messageText);
      }
    },
    [message]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        // Remove from cart
        setCart((prevCart) =>
          prevCart.filter((item) => item.productId !== productId)
        );
        message.info("Đã xóa sản phẩm khỏi giỏ hàng");
        return;
      }

      setCart((prevCart) => {
        const item = prevCart.find((i) => i.productId === productId);

        // Don't allow editing free items quantity
        if (item?.isFreeItem) {
          message.warning("Không thể thay đổi số lượng sản phẩm tặng");
          return prevCart;
        }

        if (item && quantity > item.availableStock) {
          message.warning(`Chỉ còn ${item.availableStock} sản phẩm trong kho!`);
          return prevCart;
        }

        // Update quantity
        const updatedCart = prevCart.map((cartItem) =>
          cartItem.productId === productId
            ? { ...cartItem, quantity, total: quantity * cartItem.price }
            : cartItem
        );

        // Recalculate free items for BUY_X_GET_Y promotions
        return recalculateAllFreeItems(
          updatedCart,
          selectedPromotions,
          productLookup
        );
      });
    },
    [message, selectedPromotions, productLookup]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      setCart((prevCart) => {
        const item = prevCart.find((i) => i.productId === productId);

        // Don't allow removing free items directly
        if (item?.isFreeItem) {
          message.warning("Sản phẩm tặng sẽ tự động bị xóa khi bỏ khuyến mãi");
          return prevCart;
        }

        // Remove item
        const updatedCart = prevCart.filter(
          (cartItem) => cartItem.productId !== productId
        );

        // Recalculate free items
        return recalculateAllFreeItems(
          updatedCart,
          selectedPromotions,
          productLookup
        );
      });
      message.info("Đã xóa sản phẩm khỏi giỏ hàng");
    },
    [message, selectedPromotions, productLookup]
  );

  const clearCart = useCallback(() => {
    modal.confirm({
      title: "Xóa toàn bộ giỏ hàng?",
      content: "Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
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
  const handleSelectBranch = useCallback(
    (branch: BranchDisplay) => {
      setSelectedBranch(branch);
      setCart([]);
      setSelectedPromotions([]); // Reset promotions when changing branch
      setIsBranchModalVisible(false);
      message.success(`Đã chọn chi nhánh: ${branch.branch_name}`);
    },
    [message]
  );

  // Promotion Management
  const handleTogglePromotion = useCallback(
    (promotion: Promotion) => {
      setSelectedPromotions((prev) => {
        const isSelected = prev.some(
          (p) => p.promotion_id === promotion.promotion_id
        );

        // Update selected promotions
        const newPromotions = isSelected
          ? prev.filter((p) => p.promotion_id !== promotion.promotion_id)
          : [...prev, promotion];

        // Update cart with free items
        setCart((currentCart) => {
          let updatedCart = currentCart;

          if (isSelected) {
            // Remove free items from this promotion
            updatedCart = removeFreeItemsByPromotion(
              currentCart,
              promotion.promotion_id
            );
            message.info(`Đã bỏ khuyến mãi: ${promotion.name}`);
          } else {
            // Recalculate all free items with new promotion list
            updatedCart = recalculateAllFreeItems(
              currentCart,
              newPromotions,
              productLookup
            );
            message.success(`Đã áp dụng khuyến mãi: ${promotion.name}`);
          }

          return updatedCart;
        });

        return newPromotions;
      });
    },
    [productLookup, message]
  );

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
      } catch (error: unknown) {
        message.error(
          "Thanh toán thành công nhưng lỗi khi hoàn thành đơn hàng: " +
            (error instanceof Error ? error.message : "")
        );
      }
    }

    // Reset all states
    setCart([]);
    setSelectedCustomer(null);
    setSelectedPromotions([]);
    setIsPaymentModalVisible(false);
    setReceivedAmount(0);
    setPaymentMethod("CASH");
    setPaymentQRCode(null);
    setPaymentUrl(null);
    setOrderCode(null);
    setCurrentOrderId(null);

    // Refresh catalog and promotions
    refreshCatalog();
    refetchPromotions();
  }, [
    currentOrderId,
    fulfillOrder,
    refreshCatalog,
    refetchPromotions,
    message,
  ]);

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
    if (
      paymentMethod === "CASH" &&
      receivedAmount < (cartSummary?.finalTotal || getTotalAmount())
    ) {
      message.error("Số tiền nhận không đủ!");
      return;
    }

    if (!selectedBranch) {
      message.error("Thiếu thông tin chi nhánh!");
      return;
    }

    const hide = message.loading("Đang xử lý thanh toán...", 0);

    try {
      const baseUrl = globalThis.location.origin;

      // Only send purchased items (not free items) to backend
      // Backend will calculate free items based on promotion_ids
      // Send ALL cart items (purchased + free) with is_free_item flag
      // Backend will save all items and create PromotionUsage records

      // Calculate discount data
      const originalAmount = cart.reduce(
        (sum, item) => (item.isFreeItem ? sum : sum + item.total),
        0
      );
      const discountAmount = cartSummary?.totalDiscount || 0;
      const finalAmount = originalAmount - discountAmount;
      const discountPercent =
        originalAmount > 0 ? (discountAmount / originalAmount) * 100 : 0;

      // Create promotion snapshot (preserve promotion details at order time)
      const promotionSnapshot = selectedPromotions.map((promo) => ({
        promotion_id: promo.promotion_id,
        code: promo.promotion_code || "",
        name: promo.name,
        description: promo.description || "",
        discount_lines: promo.promotion_lines.map((line) => ({
          line_type: line.line_type,
          discount_type: line.discount_type,
          discount_value: line.discount_value,
          buy_qty: line.buy_qty,
          get_qty: line.get_qty,
          free_product_name: line.free_product?.product_name,
          free_quantity: line.free_quantity,
        })),
        priority: promo.priority,
        is_stackable: promo.is_stackable,
      }));

      const orderRequest = {
        branch_id: selectedBranch.branch_id,
        warehouse_id: selectedBranch.branch_id, // Using branch_id as warehouse_id
        customer_id: selectedCustomer?.user_id || undefined,
        promotion_ids: selectedPromotions.map((p) => p.promotion_id),
        lines: cart.map((item) => ({
          product_id: item.productId,
          qty: item.quantity,
          unit_price: item.price,
          is_free_item: item.isFreeItem || false,
        })),
        payment_method: paymentMethod,
        return_url: `${baseUrl}/payment/success`,
        cancel_url: `${baseUrl}/payment/cancel`,
        // Discount tracking with promotion snapshot
        original_amount: originalAmount,
        total_discount_amount: discountAmount,
        final_amount: finalAmount,
        discount_percentage: discountPercent,
        promotion_snapshot: JSON.stringify(promotionSnapshot),
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
    } catch (error: unknown) {
      hide();
      message.error(
        (error instanceof Error ? error.message : undefined) ||
          "Có lỗi xảy ra khi thanh toán!"
      );
    }
  }, [
    paymentMethod,
    receivedAmount,
    selectedBranch,
    selectedCustomer,
    cart,
    selectedPromotions,
    cartSummary,
    createAndPay,
    fulfillOrder,
    refreshCatalog,
    message,
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
    catalogLoading ||
    pricingLoading ||
    inventoryLoading ||
    branchesLoading ||
    isFulfilling;

  return (
    <div
      style={{
        height: "calc(100vh - 13.9rem)",
        padding: "0",
        overflow: "hidden",
      }}
    >
      <Row
        gutter={[16, 16]}
        style={{ height: "100%" }}
      >
        {/* Products Section */}
        <Col
          xs={24}
          lg={14}
          style={{ height: "100%" }}
        >
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
        <Col
          xs={24}
          lg={10}
          style={{ height: "100%" }}
        >
          <CartSection
            cart={cart}
            selectedCustomer={selectedCustomer}
            selectedBranch={selectedBranch}
            isCreatingOrder={isCreatingOrder}
            cartSummary={cartSummary}
            selectedPromotionsCount={selectedPromotions.length}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            onCheckout={handleCheckout}
            onOpenPromotions={() => setIsPromotionModalVisible(true)}
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
          activeUserOnly={true}
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
          cartSummary={cartSummary}
          onCancel={handleCancelPayment}
          onPayment={handlePayment}
          onPaymentMethodChange={setPaymentMethod}
          onReceivedAmountChange={setReceivedAmount}
          onOpenPaymentLink={handleOpenPaymentLink}
        />

        {/* Promotion Modal */}
        <PromotionModal
          isVisible={isPromotionModalVisible}
          promotions={availablePromotions}
          selectedPromotions={selectedPromotions}
          cart={cart}
          productLookup={productLookup}
          selectedBranch={selectedBranch}
          onTogglePromotion={handleTogglePromotion}
          onCancel={() => setIsPromotionModalVisible(false)}
        />
      </Row>
    </div>
  );
};

export default POSPage;
