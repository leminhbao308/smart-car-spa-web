"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { App, Col, Form, Row } from "antd";
import {
  useBranches,
  useCatalogForSale,
  useCreateAndPay,
  useFulfillSalesOrder,
  useInventoryLevels,
  usePricing,
  useUserManagement,
  useVerifyPayment,
  useBookingsPendingPayment,
  useServicesForSale,
  useActivePriceBooks,
  useAllPriceBooks,
} from "@/lib/api/hooks";
import { BookingService } from "@/lib/api/services/booking.service";
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
import { BookingInfoDto } from "@/lib/api/types/booking.types";
import { Service } from "@/lib/api/types/service.types";
import { PricingService } from "@/lib/api/services/pricing.service";
import { UserService } from "@/lib/api/services/user.service";
import {
  calculatePointsToEarn,
  isEligibleForPoints,
} from "@/lib/utils/loyalty-points";

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

  // Booking state
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );

  // PayOS State
  const [paymentQRCode, setPaymentQRCode] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<number | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [paymentStartTime, setPaymentStartTime] = useState<number | null>(null);
  const [earnedPointsForOrder, setEarnedPointsForOrder] = useState<number>(0); // Store earned points for current order

  // API Hooks
  const { branches, loading: branchesLoading } = useBranches({});
  const {
    catalog,
    loading: catalogLoading,
    refresh: refreshCatalog,
  } = useCatalogForSale(selectedBranch?.branch_id || "");
  const { loading: pricingLoading } = usePricing();
  const { loading: inventoryLoading } = useInventoryLevels();
  const { mutateAsync: createAndPay, isPending: isCreatingOrder } =
    useCreateAndPay();
  const { mutateAsync: fulfillOrder, isPending: isFulfilling } =
    useFulfillSalesOrder();

  // Fetch active promotions (not filtered by branch since promotions can be global)
  const { data: promotionsData, refetch: refetchPromotions } =
    useActivePromotions({
      // Don't filter by branch_id - promotions with branch=null apply to all branches
      is_active: true,
      page: 0,
      size: 100,
    });

  // Fetch bookings pending payment
  const {
    data: bookingsPendingPayment,
    isLoading: isLoadingBookings,
    error: bookingsError,
    refetch: refetchBookings,
  } = useBookingsPendingPayment();

  // Fetch services for sale by branch
  const {
    data: servicesForSale,
    isLoading: isLoadingServices,
    error: servicesError,
  } = useServicesForSale(selectedBranch?.branch_id || "");

  // Fetch active price books
  const {
    data: activePriceBooks,
    isLoading: isLoadingPriceBooks,
    error: priceBooksError,
  } = useActivePriceBooks();

  // Fetch all price books (including inactive ones)
  const {
    data: allPriceBooks,
    isLoading: isLoadingAllPriceBooks,
    error: allPriceBooksError,
  } = useAllPriceBooks();

  // Get current price book (system-wide, not branch-specific, not filtered by active)
  const currentPriceBook = useMemo(() => {
    if (!allPriceBooks) return null;

    // Use the first price book (system-wide, regardless of active status)
    // Price books are shared across the system, not branch-specific
    return allPriceBooks[0] || null;
  }, [allPriceBooks]);

  // Payment verification with polling
  const { data: paymentStatus } = useVerifyPayment(orderCode, {
    enabled: isPolling && !!orderCode,
    refetchInterval: 3000,
  });

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

  // Service lookup for booking items
  const serviceLookup = useMemo(() => {
    const lookup = new Map<string, Service>();
    servicesForSale?.forEach((service) => {
      lookup.set(service.service_id, service);
    });
    return lookup;
  }, [servicesForSale]);

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
  }, [message, modal]);

  // Add booking to cart - OPTIMIZED with batch pricing to prevent N+1 queries
  const handleAddBookingToCart = useCallback(
    async (booking: BookingInfoDto) => {
      if (!booking.booking_items || booking.booking_items.length === 0) {
        message.warning("Booking này không có dịch vụ nào");
        return;
      }

      if (!currentPriceBook) {
        message.error(
          "Không tìm thấy bảng giá hệ thống. Vui lòng thử lại sau."
        );
        return;
      }

      try {
        // Step 1: Collect all service IDs from booking items
        const serviceIds = booking.booking_items
          .filter((item) => item.service_id)
          .map((item) => item.service_id!);

        if (serviceIds.length === 0) {
          message.warning("Booking không có service hợp lệ");
          return;
        }

        // Step 2: Batch fetch ALL service prices in ONE API call! 🚀
        // This prevents N+1 query pattern (5 services = 5 API calls → 1 API call)
        const servicePrices = await PricingService.getServicePricesBatch(
          serviceIds,
          currentPriceBook.id
        );

        // Step 3: Fetch customer info (can run in parallel with pricing if needed)
        let customerInfo: UserManagementInfo | null = null;
        if (booking.customer_id) {
          try {
            customerInfo = await UserService.getUserById(booking.customer_id);
            setSelectedCustomer(customerInfo);
            message.success(
              `Đã tự động chọn khách hàng: ${customerInfo.full_name}`
            );
          } catch (error) {
            console.log(
              `❌ Failed to fetch customer info for ${booking.customer_id}:`,
              error
            );
            message.warning("Không thể lấy thông tin khách hàng từ booking");
          }
        }

        // Step 4: Process all booking items with cached prices (NO MORE API CALLS!) ✅
        const newServiceItems: CartItem[] = [];
        let addedServicesCount = 0;
        let skippedCount = 0;

        for (const bookingItem of booking.booking_items) {
          if (!bookingItem.service_id) continue;

          // Find the service in our service lookup
          const service = serviceLookup.get(bookingItem.service_id);
          if (!service) {
            console.warn(
              `Service not found for service_id: ${bookingItem.service_id}`
            );
            skippedCount++;
            continue;
          }

          // Check if already in cart
          const existingServiceItem = cart.find(
            (item) =>
              item.isServiceItem &&
              item.serviceId === bookingItem.service_id &&
              item.originalBookingId === booking.booking_id
          );

          if (existingServiceItem) {
            skippedCount++;
            continue;
          }

          // Get price from batch result (NO API CALL!) ✅
          const servicePrice = servicePrices[bookingItem.service_id] || 0;

          if (servicePrice === 0) {
            console.warn(
              `No price found for service ${bookingItem.service_id} in price book`
            );
            skippedCount++;
            continue;
          }

          // Create service cart item
          const serviceCartItem: CartItem = {
            productId: bookingItem.service_id,
            productName: bookingItem.item_name || service.service_name,
            price: servicePrice,
            quantity: 1,
            total: servicePrice,
            categoryName: "Dịch vụ",
            availableStock: 1,
            maxQuantity: 1,
            isServiceItem: true,
            serviceId: bookingItem.service_id,
            serviceName: bookingItem.item_name || service.service_name,
            serviceDescription:
              bookingItem.item_description || service.description,
            estimatedDuration: service.estimated_duration,
            // Booking context
            originalBookingId: booking.booking_id,
            originalBookingCode: booking.booking_code,
            customerName: customerInfo?.full_name || booking.customer_name,
            vehicleLicensePlate: booking.vehicle_license_plate,
          };

          newServiceItems.push(serviceCartItem);
          addedServicesCount++;
        }

        // Step 5: Add all items to cart at once
        if (newServiceItems.length === 0) {
          if (skippedCount > 0) {
            message.warning(
              `${skippedCount} dịch vụ đã bỏ qua (không có giá hoặc đã có trong giỏ)`
            );
          } else {
            message.warning("Không tìm thấy dịch vụ phù hợp trong booking này");
          }
          return;
        }

        setCart((prevCart) => {
          // Check if any services from this booking are already in cart
          const existingServices = prevCart.filter(
            (item) =>
              item.isServiceItem &&
              item.originalBookingId === booking.booking_id
          );

          if (existingServices.length > 0) {
            message.warning("Các dịch vụ từ booking này đã có trong giỏ hàng");
            return prevCart;
          }

          message.success(
            `✅ Đã thêm ${addedServicesCount} dịch vụ từ booking ${booking.booking_code}` +
              (skippedCount > 0 ? ` (${skippedCount} bỏ qua)` : "")
          );

          // Set selected booking ID to hide the card
          setSelectedBookingId(booking.booking_id);

          return [...prevCart, ...newServiceItems];
        });
      } catch (error) {
        console.log("Error adding booking to cart:", error);
        message.error("Lỗi khi thêm booking vào giỏ hàng");
      }
    },
    [
      message,
      serviceLookup,
      cart,
      currentPriceBook,
      setSelectedCustomer,
      setSelectedBookingId,
    ]
  );

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

  // Check if cart has booking services
  const hasBookingInCart = useMemo(() => {
    return cart.some((item) => item.isServiceItem && item.originalBookingId);
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

    // Show success message with loyalty points if applicable
    if (earnedPointsForOrder > 0) {
      message.success(
        `Thanh toán thành công! Bạn đã tích được ${earnedPointsForOrder} điểm.`
      );
    } else {
      message.success("Thanh toán thành công!");
    }

    // Collect unique booking IDs from service items in cart
    const bookingIds = new Set<string>();

    cart.forEach((item) => {
      if (item.isServiceItem && item.originalBookingId) {
        bookingIds.add(item.originalBookingId);
      }
    });

    // Mark bookings as paid
    if (bookingIds.size > 0) {
      try {
        const hide = message.loading(
          "Đang cập nhật trạng thái thanh toán booking...",
          0
        );

        // Call mark-paid API for each unique booking
        const markPaidPromises = Array.from(bookingIds).map((bookingId) =>
          BookingService.markBookingAsPaid(bookingId)
        );

        await Promise.all(markPaidPromises);
        hide();

        message.success(
          `Đã cập nhật trạng thái thanh toán cho ${bookingIds.size} booking!`
        );

        // Refresh bookings list to remove paid bookings
        refetchBookings();
      } catch (error: unknown) {
        console.log("❌ Error marking bookings as paid:", error);
        message.error(
          "Thanh toán thành công nhưng lỗi khi cập nhật trạng thái booking: " +
            (error instanceof Error ? error.message : "")
        );
      }
    }

    if (currentOrderId) {
      try {
        const hide = message.loading("Đang hoàn thành đơn hàng...", 0);
        await fulfillOrder(currentOrderId);
        hide();
        message.success("Thanh toán thành công và đã hoàn thành đơn hàng!");
      } catch (error: unknown) {
        console.log("❌ Error fulfilling order:", error);
        message.error(
          "Thanh toán thành công nhưng lỗi khi hoàn thành đơn hàng: " +
            (error instanceof Error ? error.message : "")
        );
      }
    } else {
      console.log("⚠️ No currentOrderId to fulfill");
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
    setPaymentStartTime(null);
    setEarnedPointsForOrder(0); // Reset earned points

    // Refresh catalog and promotions
    refreshCatalog();
    refetchPromotions();
  }, [
    cart,
    currentOrderId,
    earnedPointsForOrder,
    fulfillOrder,
    refreshCatalog,
    refetchPromotions,
    refetchBookings,
    message,
  ]);

  // Payment Cancelled Handler
  const handlePaymentCancelled = useCallback(() => {
    setIsPolling(false);
    message.warning("Thanh toán đã bị hủy");

    setPaymentQRCode(null);
    setPaymentUrl(null);
    setOrderCode(null);
    setPaymentStartTime(null);
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

    // Check for completed payment
    const isPaymentCompleted =
      paymentStatus.status === "COMPLETED" ||
      (paymentStatus.status === "PENDING" && paymentStatus.transaction_id);

    if (isPaymentCompleted) {
      handlePaymentSuccess();
    } else if (paymentStatus.status === "CANCELED") {
      handlePaymentCancelled();
    } else {
      console.log("⏳ Payment still pending, continuing to poll...");
    }
  }, [
    paymentStatus,
    isPolling,
    handlePaymentSuccess,
    handlePaymentCancelled,
    orderCode,
  ]);

  // Timeout effect for bank payment (auto-complete after 30 seconds)
  useEffect(() => {
    if (!isPolling || !paymentStartTime || paymentMethod !== "BANK") return;

    const timeoutDuration = 30000; // 30 seconds
    const elapsed = Date.now() - paymentStartTime;
    const remaining = timeoutDuration - elapsed;

    if (remaining <= 0) {
      handlePaymentSuccess();
      return;
    }

    const timeoutId = setTimeout(() => {
      handlePaymentSuccess();
    }, remaining);

    return () => clearTimeout(timeoutId);
  }, [isPolling, paymentStartTime, paymentMethod, handlePaymentSuccess]);

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

      // Prepare full promotion snapshot - snapshot all promotion details
      const promotionSnapshot = selectedPromotions.map((promo) => ({
        promotion_id: promo.promotion_id,
        code: promo.promotion_code,
        name: promo.name,
        description: promo.description,
        start_at: promo.start_at,
        end_at: promo.end_at,
        usage_limit: promo.usage_limit,
        per_customer_limit: promo.per_customer_limit,
        priority: promo.priority,
        is_stackable: promo.is_stackable,
        coupon_redeem_once: promo.coupon_redeem_once,
        branch: promo.branch
          ? {
              branch_id: promo.branch.branch_id,
              branch_name: promo.branch.branch_name,
              branch_url: promo.branch.branch_url,
            }
          : null,
        discount_lines: promo.promotion_lines.map((line) => ({
          promotion_line_id: line.promotion_line_id,
          line_type: line.line_type,
          target_id: line.target_id,
          discount_type: line.discount_type,
          discount_value: line.discount_value,
          max_discount_amount: line.max_discount_amount,
          min_order_value: line.min_order_value,
          min_quantity: line.min_quantity,
          buy_qty: line.buy_qty,
          get_qty: line.get_qty,
          free_product_name: line.free_product?.product_name,
          free_quantity: line.free_quantity,
          line_priority: line.line_priority,
          is_active: line.is_active,
        })),
      }));

      // Calculate loyalty points (10,000 VNĐ = 1 point)
      const finalAmount = cartSummary?.finalTotal || 0;
      const earnedPoints = isEligibleForPoints(selectedCustomer?.user_id)
        ? calculatePointsToEarn(finalAmount)
        : 0;

      // Store earned points for later use in success handler
      setEarnedPointsForOrder(earnedPoints);

      const orderRequest = {
        branch_id: selectedBranch.branch_id,
        warehouse_id: selectedBranch.branch_id, // Using branch_id as warehouse_id
        customer_id: selectedCustomer?.user_id || undefined,
        promotion_ids: selectedPromotions.map((p) => p.promotion_id),
        promotion_snapshot: JSON.stringify(promotionSnapshot),
        original_amount: cartSummary?.subtotal || 0,
        total_discount_amount: cartSummary?.totalDiscount || 0,
        final_amount: finalAmount,
        discount_percentage:
          cartSummary?.subtotal && cartSummary.subtotal > 0
            ? (cartSummary.totalDiscount / cartSummary.subtotal) * 100
            : 0,
        earned_points: earnedPoints, // Loyalty points earned from this purchase
        // Shipping address - default to branch address for POS orders
        shipping_full_name:
          selectedCustomer?.full_name || "Khách hàng tại quầy",
        shipping_phone: selectedCustomer?.email || selectedBranch.phone,
        shipping_address: selectedBranch.address,
        shipping_ward: "",
        shipping_district: "",
        shipping_city: "",
        shipping_notes: "Đơn hàng bán tại quầy",
        lines: cart.map((item) => {
          const lineItem: any = {
            qty: item.quantity,
            unit_price: item.price,
            is_free_item: item.isFreeItem || false,
          };

          // Set product_id based on item type
          if (item.isServiceItem) {
            // For service items, set product_id to null (no foreign key constraint)
            lineItem.product_id = null;
          } else {
            // For product items, use the actual product_id
            lineItem.product_id = item.productId;
          }

          // Add service item fields if present
          if (item.isServiceItem && item.serviceId) {
            lineItem.service_id = item.serviceId;
          }
          if (item.originalBookingId) {
            lineItem.original_booking_id = item.originalBookingId;
          }
          if (item.originalBookingCode) {
            lineItem.original_booking_code = item.originalBookingCode;
          }

          return lineItem;
        }),
        payment_method: paymentMethod,
        return_url: `${baseUrl}/payment/success`,
        cancel_url: `${baseUrl}/payment/cancel`,
      };

      const response = await createAndPay(orderRequest);

      hide();

      if (response.order?.id) {
        setCurrentOrderId(response.order.id);
      } else {
        console.log("⚠️ No order ID in response:", response);
      }

      // Handle CASH payment
      if (paymentMethod === "CASH") {
        // Show success message with loyalty points if applicable
        if (earnedPoints > 0) {
          message.success(
            `Thanh toán thành công! Bạn đã tích được ${earnedPoints} điểm.`
          );
        } else {
          message.success("Thanh toán tiền mặt thành công!");
        }

        // Collect unique booking IDs from service items in cart
        const bookingIds = new Set<string>();

        cart.forEach((item) => {
          if (item.isServiceItem && item.originalBookingId) {
            bookingIds.add(item.originalBookingId);
          }
        });

        // Mark bookings as paid
        if (bookingIds.size > 0) {
          try {
            const hide = message.loading(
              "Đang cập nhật trạng thái thanh toán booking...",
              0
            );

            // Call mark-paid API for each unique booking
            const markPaidPromises = Array.from(bookingIds).map((bookingId) =>
              BookingService.markBookingAsPaid(bookingId)
            );

            await Promise.all(markPaidPromises);
            hide();

            message.success(
              `Đã cập nhật trạng thái thanh toán cho ${bookingIds.size} booking!`
            );

            // Refresh bookings list to remove paid bookings
            refetchBookings();
          } catch (error: unknown) {
            console.log("❌ CASH Error marking bookings as paid:", error);
            message.error(
              "Thanh toán thành công nhưng lỗi khi cập nhật trạng thái booking: " +
                (error instanceof Error ? error.message : "")
            );
          }
        }

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
          setPaymentStartTime(Date.now()); // Record payment start time

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
    setPaymentStartTime(null);
    setEarnedPointsForOrder(0); // Reset earned points
    message.info("Đã hủy thanh toán");
  }, [message]);

  // Cancel booking payment - clear cart and reset booking selection
  const handleCancelBookingPayment = useCallback(() => {
    modal.confirm({
      title: "Hủy thanh toán Booking",
      content:
        "Bạn có chắc muốn hủy thanh toán booking này? Giỏ hàng sẽ được xóa và booking sẽ hiển thị lại.",
      okText: "Hủy thanh toán",
      cancelText: "Quay lại",
      okButtonProps: { danger: true },
      onOk: () => {
        setCart([]);
        setSelectedBookingId(null);
        refetchBookings();
        message.success(
          "Đã hủy thanh toán booking. Booking đã được hiển thị lại."
        );
      },
    });
  }, [modal, message, refetchBookings]);

  const isLoading =
    catalogLoading ||
    pricingLoading ||
    inventoryLoading ||
    branchesLoading ||
    isFulfilling ||
    isLoadingBookings ||
    isLoadingServices ||
    isLoadingPriceBooks ||
    isLoadingAllPriceBooks;

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
            // New props for booking integration
            bookings={bookingsPendingPayment || []}
            isLoadingBookings={isLoadingBookings}
            bookingsError={bookingsError?.message || null}
            onAddBookingToCart={handleAddBookingToCart}
            onRefreshBookings={refetchBookings}
            // Services data for booking items
            services={servicesForSale || []}
            isLoadingServices={isLoadingServices}
            servicesError={servicesError?.message || null}
            // Price books data
            activePriceBooks={activePriceBooks || []}
            isLoadingPriceBooks={isLoadingPriceBooks}
            priceBooksError={priceBooksError?.message || null}
            // All price books data
            allPriceBooks={allPriceBooks || []}
            isLoadingAllPriceBooks={isLoadingAllPriceBooks}
            allPriceBooksError={allPriceBooksError?.message || null}
            // Cart and selected booking
            cart={cart}
            selectedBookingId={selectedBookingId}
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
            onCancelBookingPayment={handleCancelBookingPayment}
            hasBookingInCart={hasBookingInCart}
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
