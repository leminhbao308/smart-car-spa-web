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

  // Debug: Log promotions, services, and price books data
  useEffect(() => {
    console.log("🎁 Promotions Data:", promotionsData);
    console.log("🏢 Selected Branch:", selectedBranch);
    console.log("🔧 Services Data:", servicesForSale);
    console.log("💰 All Price Books (System-wide):", allPriceBooks);
    console.log("💰 Active Price Books (System-wide):", activePriceBooks);
    console.log("💰 Current Price Book (System-wide):", currentPriceBook);
    console.log(
      "📦 Available Promotions Count:",
      promotionsData?.content?.length
    );
    console.log("🔧 Available Services Count:", servicesForSale?.length);
    console.log(
      "💰 All Price Books Count (System-wide):",
      allPriceBooks?.length
    );
    console.log(
      "💰 Active Price Books Count (System-wide):",
      activePriceBooks?.length
    );

    // Debug price book items if available
    if (currentPriceBook) {
      console.log("💰 Current Price Book ID:", currentPriceBook.id);
      console.log("💰 Current Price Book Name:", currentPriceBook.name);
      console.log("💰 Current Price Book Active:", currentPriceBook.active);
      console.log(
        "💰 Current Price Book Items Count:",
        currentPriceBook.items?.length || 0
      );
    } else {
      console.log("❌ No price book available for pricing");
    }

    // Log all price books and filter active ones
    if (allPriceBooks && allPriceBooks.length > 0) {
      console.log("=".repeat(80));
      console.log("📊 COMPLETE PRICE BOOKS ANALYSIS (NO BRANCH FILTER, NO ACTIVE FILTER)");
      console.log("=".repeat(80));

      // Filter active price books from all price books (no branch filter)
      const activePriceBooksFiltered = allPriceBooks.filter(
        (book) => book.active === true
      );
      const inactivePriceBooks = allPriceBooks.filter(
        (book) => book.active === false
      );

      console.log(`📊 Total Price Books: ${allPriceBooks.length}`);
      console.log(`✅ Active Price Books: ${activePriceBooksFiltered.length}`);
      console.log(`❌ Inactive Price Books: ${inactivePriceBooks.length}`);

      // Log all price books first (no branch filter)
      console.log("\n📋 ALL PRICE BOOKS (NO BRANCH FILTER):");
      allPriceBooks.forEach((priceBook, index) => {
        const status = priceBook.active ? "✅ ACTIVE" : "❌ INACTIVE";
        console.log(
          `  ${index + 1}. ${priceBook.name} (${priceBook.code}) - ${status}`
        );
        console.log(
          `     ID: ${priceBook.id}, Branch ID: ${
            priceBook.branch_id || "NULL"
          }, Items: ${priceBook.items?.length || 0}`
        );
      });

      // Log detailed analysis of ACTIVE price books only
      if (activePriceBooksFiltered.length > 0) {
        console.log("\n" + "=".repeat(60));
        console.log(
          "📊 DETAILED ANALYSIS OF ACTIVE PRICE BOOKS (NO BRANCH FILTER)"
        );
        console.log("=".repeat(60));

        activePriceBooksFiltered.forEach((priceBook, index) => {
          console.log(`\n📋 Active Price Book ${index + 1}:`);
          console.log(`  - ID: ${priceBook.id}`);
          console.log(`  - Name: ${priceBook.name}`);
          console.log(`  - Code: ${priceBook.code}`);
          console.log(`  - Active: ${priceBook.active}`);
          console.log(`  - Currency: ${priceBook.currency}`);
          console.log(`  - Valid From: ${priceBook.valid_from}`);
          console.log(`  - Valid To: ${priceBook.valid_to}`);
          console.log(`  - Branch ID: ${priceBook.branch_id}`);
          console.log(`  - Items Count: ${priceBook.items?.length || 0}`);

          if (priceBook.items && priceBook.items.length > 0) {
            console.log(`\n  📦 Price Book Items:`);
            priceBook.items.forEach((item, itemIndex) => {
              console.log(`    ${itemIndex + 1}. Item ID: ${item.id}`);
              console.log(`       - Item Type: ${item.item_type}`);
              console.log(`       - Item ID: ${item.item_id}`);
              console.log(`       - Item Name: ${item.item_name}`);
              console.log(`       - Policy Type: ${item.policy_type}`);
              console.log(`       - Fixed Price: ${item.fixed_price}`);
              console.log(`       - Markup Percent: ${item.markup_percent}`);

              // Log service details if it's a service item
              if (item.item_type === "SERVICE" && item.service) {
                console.log(`       - Service ID: ${item.service.service_id}`);
                console.log(
                  `       - Service Name: ${item.service.service_name}`
                );
                console.log(
                  `       - Service Description: ${item.service.description}`
                );
              }

              // Log product details if it's a product item
              if (item.item_type === "PRODUCT" && item.product) {
                console.log(`       - Product ID: ${item.product.product_id}`);
                console.log(
                  `       - Product Name: ${item.product.product_name}`
                );
                console.log(`       - Product SKU: ${item.product.sku}`);
              }

              console.log(`       - Created At: ${item.created_at}`);
              console.log(`       - Updated At: ${item.updated_at}`);
              console.log(`       ---`);
            });
          } else {
            console.log(`  📦 No items found in this price book`);
          }
        });
      } else {
        console.log("\n❌ No active price books found in the system");
      }

      console.log("=".repeat(80));
      console.log("📊 END OF COMPLETE PRICE BOOKS ANALYSIS (NO BRANCH FILTER, NO ACTIVE FILTER)");
      console.log("=".repeat(80));
    } else {
      console.log("❌ No price books found in the system (no branch filter, no active filter)");
    }
  }, [
    promotionsData,
    selectedBranch,
    servicesForSale,
    allPriceBooks,
    activePriceBooks,
    currentPriceBook,
  ]);

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

  // Function to get service price from price book using fixed_price (NO FALLBACK)
  const getServicePrice = useCallback(
    async (serviceId: string): Promise<number> => {
      try {
        if (!currentPriceBook) {
          console.warn("No price book found for service pricing");
          return 0;
        }

        // Get detailed price book with items
        const priceBookDetails = await PricingService.getPriceBookById(
          currentPriceBook.id
        );

        // Find the service in price book items
        const serviceItem = priceBookDetails.items?.find(
          (item) => item.item_type === "SERVICE" && item.item_id === serviceId
        );

        if (serviceItem && serviceItem.fixed_price !== null && serviceItem.fixed_price > 0) {
          console.log(
            `💰 Found service ${serviceId} in price book with fixed_price: ${serviceItem.fixed_price}`
          );
          return serviceItem.fixed_price;
        }

        console.warn(
          `Service ${serviceId} not found in price book or no valid fixed_price`
        );
        return 0;
      } catch (error) {
        console.error(`Failed to get pricing for service ${serviceId}:`, error);
        return 0;
      }
    },
    [currentPriceBook]
  );

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

  // Add booking to cart - now adds individual services from booking items
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

      const newServiceItems: CartItem[] = [];
      let addedServicesCount = 0;

      // Process each booking item (service) and add to cart
      for (const bookingItem of booking.booking_items) {
        if (!bookingItem.service_id) continue;

        // Find the service in our service lookup
        const service = serviceLookup.get(bookingItem.service_id);
        if (!service) {
          console.warn(
            `Service not found for service_id: ${bookingItem.service_id}`
          );
          continue;
        }

        // Check if this service is already in cart from this booking
        const existingServiceItem = cart.find(
          (item) =>
            item.isServiceItem &&
            item.serviceId === bookingItem.service_id &&
            item.originalBookingId === booking.booking_id
        );

        if (existingServiceItem) {
          continue; // Skip if already added
        }

         // Get service price from price book (NO FALLBACK to tax_amount)
         const servicePrice = await getServicePrice(bookingItem.service_id);
         console.log(
           `🔍 Service ${bookingItem.service_id} (${bookingItem.item_name}):`
         );
         console.log(`  - Price from price book: ${servicePrice}`);
         console.log(`  - Booking tax_amount (IGNORED): ${bookingItem.tax_amount || 0}`);

         if (servicePrice === 0) {
           console.warn(
             `No price found in price book for service ${bookingItem.service_id}, skipping this service`
           );
           continue; // Skip this service if no price in price book
         }

         // Use ONLY price from price book
         const finalPrice = servicePrice;
         console.log(`  - Final price used (from price book only): ${finalPrice}`);

        // Create service cart item
        const serviceCartItem: CartItem = {
          productId: bookingItem.service_id, // Use service_id as productId
          productName: bookingItem.item_name || service.service_name,
          price: finalPrice, // Use price from price book or fallback to tax_amount
          quantity: 1,
          total: finalPrice,
          categoryName: "Dịch vụ",
          availableStock: 1,
          maxQuantity: 1,
          isServiceItem: true, // Flag to identify service items
          serviceId: bookingItem.service_id,
          serviceName: bookingItem.item_name || service.service_name,
          serviceDescription:
            bookingItem.item_description || service.description,
          estimatedDuration: service.estimated_duration,
          // Booking context
          originalBookingId: booking.booking_id,
          originalBookingCode: booking.booking_code,
          customerName: booking.customer_name,
          vehicleLicensePlate: booking.vehicle_license_plate,
        };

        newServiceItems.push(serviceCartItem);
        addedServicesCount++;
      }

      if (newServiceItems.length === 0) {
        message.warning("Không tìm thấy dịch vụ phù hợp trong booking này");
        return;
      }

      setCart((prevCart) => {
        // Check if any services from this booking are already in cart
        const existingServices = prevCart.filter(
          (item) =>
            item.isServiceItem && item.originalBookingId === booking.booking_id
        );

        if (existingServices.length > 0) {
          message.warning("Các dịch vụ từ booking này đã có trong giỏ hàng");
          return prevCart;
        }

        message.success(
          `Đã thêm ${addedServicesCount} dịch vụ từ booking ${booking.booking_code} vào giỏ hàng`
        );
        return [...prevCart, ...newServiceItems];
      });
    },
    [message, serviceLookup, cart, currentPriceBook, getServicePrice]
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
      <Row gutter={[16, 16]} style={{ height: "100%" }}>
        {/* Products Section */}
        <Col xs={24} lg={14} style={{ height: "100%" }}>
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
          />
        </Col>

        {/* Cart Section */}
        <Col xs={24} lg={10} style={{ height: "100%" }}>
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
