/**
 * Update Booking Modal
 * Modal chuyên dụng cho việc cập nhật booking
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Button,
  Card,
  Row,
  Col,
  Alert,
  Tag,
  Spin,
  Divider,
  Typography,
  Tabs,
  Input,
  Table,
  Tooltip,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
  PhoneOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { BookingInfoDto, BookingStatus, Priority } from "@/lib/api/types";
import {
  useUpdateBooking,
  useCreateBookingWithSlot,
  useConfirmBooking,
  useCancelBooking,
  useCheckInBooking,
} from "@/lib/api/hooks/useBooking";
import { useCustomersDropdown } from "@/lib/api/hooks/useUsers";
import { useVehicleProfiles } from "@/lib/api/hooks/useVehicleProfiles";
import { useBranches } from "@/lib/api/hooks/useBranches";
import { useAllPriceBooks } from "@/lib/api/hooks/usePricing";
import { useActiveServiceBays } from "@/lib/api/hooks/useServiceBays";
import { useWalkInBooking } from "@/lib/api/hooks/useWalkInBooking";
import { UserManagementInfo } from "@/lib/api/types/user.types";
import { VehicleProfileDisplay } from "@/lib/api/types/vehicle-profile.types";
import { BranchDisplay } from "@/lib/api/types/branch.types";
import { PriceBookItem } from "@/lib/api/types/price-book.types";
import { ServiceBay } from "@/lib/api/types/service-bay.types";
import {
  BookingScheduleService,
  TimeSlotDto,
} from "@/lib/api/services/booking-schedule.service";
import { MemoizedTextArea } from "@/components/ui/MemoizedComponents";

const { Option } = Select;
const { Text } = Typography;

// Helper functions for status and priority
const getStatusConfig = (status: BookingStatus) => {
  const statusConfigs = {
    [BookingStatus.PENDING]: {
      label: "Chờ xác nhận",
      color: "orange",
      icon: <CheckCircleOutlined />,
    },
    [BookingStatus.CONFIRMED]: {
      label: "Đã xác nhận",
      color: "blue",
      icon: <CheckCircleOutlined />,
    },
    [BookingStatus.CHECKED_IN]: {
      label: "Đã check-in",
      color: "cyan",
      icon: <CheckCircleOutlined />,
    },
    [BookingStatus.IN_PROGRESS]: {
      label: "Đang thực hiện",
      color: "green",
      icon: <CheckCircleOutlined />,
    },
    [BookingStatus.PAUSED]: {
      label: "Tạm dừng",
      color: "yellow",
      icon: <CheckCircleOutlined />,
    },
    [BookingStatus.COMPLETED]: {
      label: "Hoàn thành",
      color: "green",
      icon: <CheckCircleOutlined />,
    },
    [BookingStatus.CANCELLED]: {
      label: "Đã hủy",
      color: "red",
      icon: <CloseCircleOutlined />,
    },
    [BookingStatus.NO_SHOW]: {
      label: "Không đến",
      color: "red",
      icon: <CloseCircleOutlined />,
    },
  };
  return (
    statusConfigs[status] || {
      label: "Unknown",
      color: "default",
      icon: <CheckCircleOutlined />,
    }
  );
};

const getPriorityConfig = (priority: Priority) => {
  const priorityConfigs = {
    [Priority.NORMAL]: {
      label: "Bình thường",
      color: "default",
      icon: <CheckCircleOutlined />,
    },
    [Priority.HIGH]: {
      label: "Cao",
      color: "orange",
      icon: <CheckCircleOutlined />,
    },
    [Priority.URGENT]: {
      label: "Khẩn cấp",
      color: "red",
      icon: <CheckCircleOutlined />,
    },
  };
  return (
    priorityConfigs[priority] || {
      label: "Unknown",
      color: "default",
      icon: <CheckCircleOutlined />,
    }
  );
};

// Slot status colors
const slotStatusColors = {
  AVAILABLE: "#52c41a",
  BOOKED: "#ff4d4f",
  IN_PROGRESS: "#1890ff",
  COMPLETED: "#52c41a",
  CANCELLED: "#8c8c8c",
  BLOCKED: "#faad14",
  MAINTENANCE: "#722ed1",
  UNAVAILABLE: "#d9d9d9",
};

// Slot status icons
const slotStatusIcons = {
  AVAILABLE: <CheckCircleOutlined />,
  BOOKED: <CloseCircleOutlined />,
  IN_PROGRESS: <ClockCircleOutlined />,
  COMPLETED: <CheckCircleOutlined />,
  CANCELLED: <CloseCircleOutlined />,
  BLOCKED: <ExclamationCircleOutlined />,
  MAINTENANCE: <SettingOutlined />,
  UNAVAILABLE: <CloseCircleOutlined />,
};

interface UpdateBookingModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (bookingData: unknown) => void;
  initialData: BookingInfoDto;
  loading?: boolean;
  onRefresh?: () => void; // Callback để refresh table data
}

// Types for slot selection
type SlotInfo = TimeSlotDto;

interface SelectedSlot {
  bayId: string;
  bayName: string;
  date: string;
  startTime: string;
  serviceDurationMinutes: number;
}

const UpdateBookingModal: React.FC<UpdateBookingModalProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
  loading = false,
  onRefresh,
}) => {
  const [form] = Form.useForm();
  // Step management (removed as we use single form layout)
  // const [currentStep, setCurrentStep] = useState(0);

  // Selection states
  const [selectedCustomer, setSelectedCustomer] =
    useState<UserManagementInfo | null>(null);
  const [selectedVehicle, setSelectedVehicle] =
    useState<VehicleProfileDisplay | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchDisplay | null>(
    null
  );
  const [selectedItems, setSelectedItems] = useState<PriceBookItem[]>([]);
  const [selectedBay, setSelectedBay] = useState<ServiceBay | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [isSlotChanged, setIsSlotChanged] = useState(false); // Track if slot was changed from original
  const [originalSlot, setOriginalSlot] = useState<SelectedSlot | null>(null); // Store original slot from initialData
  const [baySlotStates, setBaySlotStates] = useState<
    Record<string, { slot: SelectedSlot | null; isChanged: boolean }>
  >({}); // Store slot state for each bay
  const [bayWalkInStates, setBayWalkInStates] = useState<
    Record<
      string,
      {
        selectedWalkInBay: string | null;
        bayRecommendation: typeof bayRecommendation;
        queueItems: typeof queueItems;
        manualBaySelection: boolean;
      }
    >
  >({}); // Store walk-in bay state for each bay

  // New customer states (for walk-in booking)
  const [newCustomer, setNewCustomer] = useState<{
    full_name: string;
    phone_number: string;
    email?: string;
  } | null>(null);
  const [newVehicle, setNewVehicle] = useState<{
    license_plate: string;
    brand_name: string;
    model_name: string;
    type_name: string;
    color: string;
    year?: number;
  } | null>(null);

  // Track customer type (existing vs new)
  const [customerType, setCustomerType] = useState<"existing" | "new">(
    "existing"
  );

  // Walk-in booking state
  const [selectedWalkInBay, setSelectedWalkInBay] = useState<string | null>(
    null
  );
  const [manualBaySelection, setManualBaySelection] = useState(false);
  const [bayRecommendation, setBayRecommendation] = useState<{
    recommended_bay?: {
      bay_id: string;
      bay_name: string;
      bay_code?: string;
    };
    reason?: string;
    estimated_wait_time_minutes?: number;
    alternative_bays?: Array<{
      bay_id: string;
      bay_name: string;
      bay_code?: string;
    }>;
    queue?: Array<{
      queue_id?: string;
      queue_position?: number;
      booking_customer_name?: string;
      booking_vehicle_license_plate?: string;
      booking_service_names?: string[];
      booking_total_price?: number;
      estimated_start_time?: string;
      estimated_completion_time?: string;
      [key: string]: unknown;
    }>;
  } | null>(null);
  const [queueItems, setQueueItems] = useState<
    Array<{
      queue_id?: string;
      queue_position?: number;
      booking_customer_name?: string;
      booking_vehicle_license_plate?: string;
      booking_service_names?: string[];
      booking_total_price?: number;
      estimated_start_time?: string;
      estimated_completion_time?: string;
      [key: string]: unknown;
    }>
  >([]);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);

  // Data states
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [bookingDate, setBookingDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<SlotInfo[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // API hooks
  const updateBookingMutation = useUpdateBooking();
  const createBookingWithSlotMutation = useCreateBookingWithSlot();
  const confirmBookingMutation = useConfirmBooking();
  const cancelBookingMutation = useCancelBooking();
  const checkInBookingMutation = useCheckInBooking();
  const { recommendBay, getBayQueue } = useWalkInBooking();

  // Helper function to ensure queueItems is always an array
  const getSafeQueueItems = useCallback(() => {
    if (!Array.isArray(queueItems)) {
      console.warn("⚠️ queueItems is not an array:", queueItems);
      return [];
    }
    return queueItems;
  }, [queueItems]);

  // Load bay recommendation for existing walk-in booking
  const loadBayRecommendation = useCallback(
    async (bayId: string) => {
      if (!selectedBranch || !totalDuration) return;

      console.log("🔄 Loading bay recommendation for existing booking:", bayId);
      setIsLoadingRecommendation(true);
      try {
        const recommendation = await recommendBay(
          selectedBranch.branch_id,
          totalDuration,
          "GENERAL",
          "NORMAL",
          bookingDate
        );

        setBayRecommendation(
          recommendation as unknown as typeof bayRecommendation
        );

        // Load queue for the current bay
        const queue = await getBayQueue(bayId, bookingDate);
        setQueueItems(queue as unknown as typeof queueItems);
      } catch (error) {
        console.log("❌ Error loading bay recommendation:", error);
      } finally {
        setIsLoadingRecommendation(false);
      }
    },
    [selectedBranch, totalDuration, bookingDate, recommendBay, getBayQueue]
  );

  // Data hooks
  const { customers, loading: isLoadingCustomers } = useCustomersDropdown();
  const { profiles: allVehicles, loading: isLoadingVehicles } =
    useVehicleProfiles({ params: { size: 1000 } });
  const { branches, loading: isLoadingBranches } = useBranches();
  const {
    data: priceBooksData,
    isLoading: isLoadingPriceBooks,
    error: priceBooksError,
  } = useAllPriceBooks();
  const { data: allServiceBays, isLoading: isLoadingServiceBays } =
    useActiveServiceBays(selectedBranch?.branch_id);

  // Filter service bays to only show those that allow booking
  const serviceBays = useMemo(() => {
    if (!allServiceBays) return [];
    return allServiceBays.filter((bay) => bay.allow_booking === true);
  }, [allServiceBays]);

  // Filter service bays for on-site processing (allow_booking: false)
  const onSiteBays = useMemo(() => {
    if (!allServiceBays) return [];
    return allServiceBays.filter((bay) => bay.allow_booking === false);
  }, [allServiceBays]);

  // Filter vehicles by selected customer
  const vehicles = useMemo(() => {
    if (!selectedCustomer || !allVehicles) return [];
    return allVehicles.filter(
      (vehicle) => vehicle.owner_id === selectedCustomer.user_id
    );
  }, [allVehicles, selectedCustomer]);

  // Get all services from price books (filter for services only, not service packages)
  const availableServices = useMemo(() => {
    if (priceBooksError) {
      console.log("Error loading price books:", priceBooksError);
      return [];
    }

    if (!priceBooksData) {
      return [];
    }

    if (!Array.isArray(priceBooksData)) {
      return [];
    }

    const allItems: PriceBookItem[] = [];
    priceBooksData.forEach((priceBook) => {
      if (priceBook.items && Array.isArray(priceBook.items)) {
        priceBook.items.forEach((item) => {
          // Filter for services only: serviceId != null AND servicePackageId == null
          if (item.service && !item.servicePackage) {
            allItems.push(item);
          } else {
            console.log(
              `✗ Skipped item: ${item.item_name} - ${
                item.service ? "has service" : "no service"
              }, ${item.servicePackage ? "has package" : "no package"}`
            );
          }
        });
      } else {
        console.log(
          "PriceBook has no items or items is not an array:",
          priceBook
        );
      }
    });
    return allItems;
  }, [priceBooksData, priceBooksError]);

  // Load available slots from API (same logic as BookingModal)
  const loadAvailableSlots = useCallback(async () => {
    if (!selectedBranch || !selectedBay || !bookingDate || totalDuration <= 0) {
      setAvailableSlots([]);
      return;
    }

    setLoadingSlots(true);
    try {
      const slots = await BookingScheduleService.getAvailableSlots({
        branchId: selectedBranch.branch_id,
        date: bookingDate,
        serviceDurationMinutes: totalDuration,
        bayId: selectedBay.bay_id,
      });
      console.log("Available slots from API:", slots);

      // Remove duplicate slots based on startTime and endTime
      const uniqueSlots = slots.filter(
        (slot, index, self) =>
          index ===
          self.findIndex(
            (s) => s.startTime === slot.startTime && s.endTime === slot.endTime
          )
      );

      console.log("Unique slots after deduplication:", uniqueSlots);
      setAvailableSlots(uniqueSlots);
    } catch (error) {
      console.log("Error loading available slots:", error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedBranch, selectedBay, bookingDate, totalDuration]);

  // Load slots when dependencies change
  useEffect(() => {
    loadAvailableSlots();
  }, [loadAvailableSlots]);

  // Auto recommend bay for walk-in booking
  useEffect(() => {
    const getBayRecommendation = async () => {
      console.log("🔍 Checking bay recommendation conditions:", {
        selectedBranch: !!selectedBranch,
        selectedItems: selectedItems.length,
        totalDuration,
        branchId: selectedBranch?.branch_id,
      });

      if (!selectedBranch || selectedItems.length === 0 || totalDuration <= 0) {
        console.log("❌ Missing required data for bay recommendation");
        setBayRecommendation(null);
        setQueueItems([]);
        return;
      }

      console.log("🚀 Starting bay recommendation...");
      setIsLoadingRecommendation(true);
      try {
        const recommendation = await recommendBay(
          selectedBranch.branch_id,
          totalDuration,
          "GENERAL",
          "NORMAL",
          bookingDate
        );

        console.log("✅ Bay recommendation received:", recommendation);
        console.log("🔍 Recommendation structure:", {
          hasRecommendedBay: !!recommendation?.recommended_bay,
          hasQueue: !!recommendation?.queue,
          queueType: typeof recommendation?.queue,
          queueIsArray: Array.isArray(recommendation?.queue),
          queueLength: recommendation?.queue?.length,
        });

        setBayRecommendation(
          recommendation as unknown as typeof bayRecommendation
        );
        setSelectedWalkInBay(recommendation?.recommended_bay?.bay_id || null);
        setManualBaySelection(false); // Reset manual selection flag

        // Use queue from recommendation first, then load from API if needed
        if (recommendation?.queue && Array.isArray(recommendation.queue)) {
          console.log(
            "📋 Using queue from recommendation:",
            recommendation.queue
          );
          setQueueItems(recommendation.queue as unknown as typeof queueItems);
        } else if (recommendation?.recommended_bay?.bay_id) {
          console.log(
            "🔄 Loading queue for bay:",
            recommendation.recommended_bay.bay_id
          );
          const queue = await getBayQueue(
            recommendation.recommended_bay.bay_id,
            bookingDate
          );
          console.log("✅ Queue loaded:", queue);
          console.log("🔍 Queue structure:", {
            queueType: typeof queue,
            queueIsArray: Array.isArray(queue),
            queueLength: queue?.length,
            queueFirstItem: queue?.[0],
          });
          setQueueItems(queue as unknown as typeof queueItems);
        } else {
          console.log("⚠️ No queue data available");
          setQueueItems([]);
        }
      } catch (error) {
        console.log("❌ Error getting bay recommendation:", error);
        setBayRecommendation(null);
        setQueueItems([]);
      } finally {
        setIsLoadingRecommendation(false);
      }
    };

    getBayRecommendation();
  }, [
    selectedBranch,
    selectedItems,
    totalDuration,
    bookingDate,
    recommendBay,
    getBayQueue,
  ]);

  // Reset bay recommendation when booking date changes
  useEffect(() => {
    if (bookingDate) {
      console.log(
        "📅 Booking date changed, resetting bay recommendation:",
        bookingDate
      );
      setBayRecommendation(null);
      setSelectedWalkInBay(null);
      setQueueItems([]);
      setManualBaySelection(false);
    }
  }, [bookingDate]);

  // Check if slot is suitable for service duration (same logic as BookingModal)
  const isSlotSuitable = useCallback(
    (slot: SlotInfo) => {
      // For single slot services (≤ 60 minutes)
      if (totalDuration <= 60) {
        return slot.isAvailable && slot.durationMinutes >= totalDuration;
      }

      // For multi-slot services (> 60 minutes)
      // Check if this slot and consecutive slots are available
      const requiredSlots = Math.ceil(totalDuration / 60);
      const currentSlotIndex = availableSlots.findIndex(
        (s) => s.startTime === slot.startTime
      );

      if (currentSlotIndex === -1) return false;

      // Check if we have enough consecutive available slots
      for (let i = 0; i < requiredSlots; i++) {
        const checkSlotIndex = currentSlotIndex + i;
        if (checkSlotIndex >= availableSlots.length) return false;

        const checkSlot = availableSlots[checkSlotIndex];
        if (!checkSlot.isAvailable || checkSlot.status !== "AVAILABLE") {
          return false;
        }
      }

      return true;
    },
    [totalDuration, availableSlots]
  );

  // Check if slot can be selected (available and suitable)
  const canSelectSlot = useCallback(
    (slot: SlotInfo) => {
      return (
        slot.isAvailable && slot.status === "AVAILABLE" && isSlotSuitable(slot)
      );
    },
    [isSlotSuitable]
  );

  // Initialize form with initial data
  useEffect(() => {
    console.log("UpdateBookingModal useEffect triggered:", {
      initialData,
      open,
    });
    if (initialData && open) {
      console.log("Initializing form with data:", initialData);

      // Determine customer type based on customer_id
      const hasCustomerId =
        initialData.customer_id && initialData.customer_id !== "";
      const customerType = hasCustomerId ? "existing" : "new";
      setCustomerType(customerType);
      console.log("Determined customer type:", customerType);

      // Set branch
      if (initialData.branch_id) {
        const branch = branches.find(
          (b) => b.branch_id === initialData.branch_id
        );
        if (branch) {
          setSelectedBranch(branch);
        }
      }

      // Set booking date
      console.log("🔍 Setting booking date:", {
        scheduled_start_at: initialData.scheduled_start_at,
        slot_start_time: initialData.slot_start_time,
        booking_code: initialData.booking_code,
        isWalkInBooking: initialData.booking_code?.startsWith("WALK") || false,
      });

      // Determine booking type first
      const isWalkInBookingForDate =
        initialData.booking_code?.startsWith("WALK") || false;

      if (isWalkInBookingForDate) {
        // For walk-in bookings, always use current date (processing date)
        const currentDate = dayjs().format("YYYY-MM-DD");
        console.log("📅 Using current date for walk-in booking:", currentDate);
        setBookingDate(currentDate);
      } else if (initialData.scheduled_start_at) {
        // For slot bookings, use scheduled_start_at
        const date = dayjs(initialData.scheduled_start_at).format("YYYY-MM-DD");
        console.log("📅 Using scheduled_start_at for slot booking:", date);
        setBookingDate(date);
      } else {
        console.log(
          "⚠️ No booking date set - no scheduled_start_at for slot booking"
        );
      }

      // Set customer data
      if (hasCustomerId) {
        // Customer exists in system
        const customer = customers.find(
          (c) => c.user_id === initialData.customer_id
        );
        if (customer) {
          setSelectedCustomer(customer);
        }
      } else {
        // New customer - populate form fields
        setNewCustomer({
          full_name: initialData.customer_name || "",
          phone_number: initialData.customer_phone || "",
          email: initialData.customer_email || "",
        });
      }

      // Set vehicle data
      if (initialData.vehicle_id && initialData.vehicle_id !== "") {
        // Vehicle exists in system
        const vehicle = allVehicles.find(
          (v) => v.vehicle_id === initialData.vehicle_id
        );
        if (vehicle) {
          setSelectedVehicle(vehicle);
        }
      } else {
        // New vehicle - populate form fields
        setNewVehicle({
          license_plate: initialData.vehicle_license_plate || "",
          brand_name: initialData.vehicle_brand_name || "",
          model_name: initialData.vehicle_model_name || "",
          type_name: initialData.vehicle_type_name || "",
          color: initialData.vehicle_color || "",
          year: initialData.vehicle_year || new Date().getFullYear(),
        });
      }

      // Set selected services from booking items
      console.log("🔍 Initializing services from booking items:", {
        booking_items: initialData.booking_items,
        availableServicesCount: availableServices.length,
      });

      if (initialData.booking_items && initialData.booking_items.length > 0) {
        const services: PriceBookItem[] = [];
        initialData.booking_items.forEach((item) => {
          console.log("🔍 Processing booking item:", {
            service_id: item.service_id,
            item_name: item.item_name,
          });

          if (item.service_id) {
            // Find the service in price books
            const priceBookItem = availableServices.find(
              (service) => service.service?.service_id === item.service_id
            );
            if (priceBookItem) {
              console.log("✅ Found matching service:", {
                item_name: priceBookItem.item_name,
                service: priceBookItem.service
                  ? priceBookItem.service.service_name
                  : null,
              });
              services.push(priceBookItem);
            } else {
              console.log(
                "❌ No matching service found for service_id:",
                item.service_id
              );
            }
          }
        });

        console.log("📋 Final services array:", {
          count: services.length,
          services: services.map((s) => ({
            item_name: s.item_name,
            service: s.service ? s.service.service_name : null,
          })),
        });

        setSelectedItems(services);
        calculateTotals(services);
      } else {
        console.log("⚠️ No booking items found in initialData");
      }

      // Determine if this is a walk-in booking or slot booking based on booking code prefix
      const isWalkInBooking =
        initialData.booking_code?.startsWith("WALK") || false;
      const isSlotBooking = initialData.booking_code?.startsWith("BK") || false;
      console.log("Booking type detection:", {
        booking_code: initialData.booking_code,
        isWalkInBooking,
        isSlotBooking,
      });

      if (isWalkInBooking) {
        // This is a walk-in booking
        setSelectedWalkInBay(initialData.bay_id || null);
        setManualBaySelection(true);

        // Load bay recommendation and queue
        if (initialData.bay_id) {
          loadBayRecommendation(initialData.bay_id);
        }
      } else {
        // This is a slot booking
        if (initialData.bay_id && serviceBays) {
          const bay = serviceBays.find(
            (b: ServiceBay) => b.bay_id === initialData.bay_id
          );
          if (bay) {
            setSelectedBay(bay);
          }
        }

        if (initialData.slot_start_time) {
          setSelectedSlot({
            bayId: initialData.bay_id || "",
            bayName: initialData.bay_name || "",
            date: initialData.scheduled_start_at
              ? dayjs(initialData.scheduled_start_at).format("YYYY-MM-DD")
              : "",
            startTime: initialData.slot_start_time,
            serviceDurationMinutes:
              initialData.estimated_duration_minutes || 60,
          });
        }
      }

      // Set form values
      form.setFieldsValue({
        customerId: initialData.customer_id,
        vehicleId: initialData.vehicle_id,
        newCustomerName: initialData.customer_name || "",
        newCustomerPhone: initialData.customer_phone || "",
        newCustomerEmail: initialData.customer_email || "",
        newVehicleLicensePlate: initialData.vehicle_license_plate || "",
        newVehicleBrand: initialData.vehicle_brand_name || "",
        newVehicleModel: initialData.vehicle_model_name || "",
        newVehicleType: initialData.vehicle_type_name || "",
        newVehicleColor: initialData.vehicle_color || "",
        newVehicleYear: initialData.vehicle_year || new Date().getFullYear(),
        branchId: initialData.branch_id,
        bookingDate: dayjs(
          initialData.scheduled_start_at || initialData.preferred_start_at
        ),
        serviceBayId: initialData.bay_id,
        slotDate: initialData.scheduled_start_at
          ? dayjs(initialData.scheduled_start_at)
          : null,
        services:
          initialData.booking_items?.map((item) => item.service_id) || [],
        notes: initialData.notes,
        priority: initialData.priority,
      });

      // Check if it's a slot booking or walk-in booking based on booking code prefix
      const isWalkInBookingType =
        initialData.booking_code?.startsWith("WALK") || false;
      const isSlotBookingType =
        initialData.booking_code?.startsWith("BK") || false;

      if (isSlotBookingType && initialData.scheduled_start_at) {
        const slotDate = dayjs(initialData.scheduled_start_at).format(
          "YYYY-MM-DD"
        );
        const slotTime = initialData.slot_start_time;

        const initialSlot = {
          bayId: initialData.bay_id || "",
          bayName: initialData.bay_name || "",
          date: slotDate,
          startTime: slotTime || "",
          serviceDurationMinutes: initialData.slot_duration_minutes || 60,
        };

        setSelectedSlot(initialSlot);
        setOriginalSlot(initialSlot); // Store original slot for restoration

        // Save initial slot state for the bay
        if (initialData.bay_id) {
          setBaySlotStates((prev) => ({
            ...prev,
            [String(initialData.bay_id)]: {
              slot: initialSlot,
              isChanged: false,
            },
          }));
        }
      } else if (isWalkInBookingType) {
        // Set walk-in bay if available
        if (initialData.bay_id) {
          setSelectedWalkInBay(initialData.bay_id);
        }
      }

      // Save initial walk-in bay state for the bay (for both slot and walk-in bookings)
      if (initialData.bay_id) {
        setBayWalkInStates((prev) => ({
          ...prev,
          [String(initialData.bay_id)]: {
            selectedWalkInBay: isWalkInBookingType
              ? initialData.bay_id || null
              : null,
            bayRecommendation: null,
            queueItems: [],
            manualBaySelection: false,
          },
        }));
      }

      setTotalPrice(initialData.total_price || 0);
      setTotalDuration(initialData.estimated_duration_minutes || 0);
      setIsSlotChanged(false); // Reset slot change flag
      // setCurrentStep(0); // Start from step 1 for edit mode
    }
  }, [
    initialData,
    open,
    customers,
    allVehicles,
    branches,
    serviceBays,
    availableServices,
    form,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // calculateTotals and loadBayRecommendation are intentionally excluded to prevent infinite loops
  ]);

  const calculateTotals = useCallback((items: PriceBookItem[]) => {
    console.log("🧮 Calculating totals:", {
      items: items.length,
      itemsData: items.map((item) => ({
        item_name: item.item_name,
        fixed_price: item.fixed_price,
        service: item.service
          ? {
              service_name: item.service.service_name,
              estimated_duration: item.service.estimated_duration,
            }
          : null,
      })),
    });

    const price = items.reduce((sum, item) => sum + (item.fixed_price || 0), 0);
    const duration = items.reduce((sum, item) => {
      if (item.service) {
        return sum + (item.service.estimated_duration || 60);
      }
      return sum;
    }, 0);

    console.log("💰 Calculated totals:", { price, duration });
    setTotalPrice(price);
    setTotalDuration(duration);
  }, []);

  // Handle service selection change
  const handleServiceChange = useCallback(
    (selectedServiceIds: string[]) => {
      console.log("🔄 Service selection changed:", {
        selectedServiceIds,
        availableServicesCount: availableServices.length,
      });

      const selectedServices = availableServices.filter((service) =>
        selectedServiceIds.includes(service.item_id)
      );

      console.log("✅ Selected services:", {
        count: selectedServices.length,
        services: selectedServices.map((s) => ({
          item_name: s.item_name,
          service: s.service ? s.service.service_name : null,
        })),
      });

      setSelectedItems(selectedServices);
      calculateTotals(selectedServices);
    },
    [availableServices, calculateTotals]
  );

  // Handle vehicle change
  const handleVehicleChange = useCallback(
    (vehicleId: string) => {
      const vehicle = allVehicles.find((v) => v.vehicle_id === vehicleId);
      setSelectedVehicle(vehicle || null);
      if (vehicle) {
        form.setFieldValue("vehicleLicensePlate", vehicle.license_plate);
        form.setFieldValue("vehicleBrandName", "");
        form.setFieldValue("vehicleModelName", "");
        form.setFieldValue("vehicleTypeName", "");
        form.setFieldValue("vehicleYear", new Date().getFullYear());
        form.setFieldValue("vehicleColor", "");
      }
    },
    [allVehicles, form]
  );

  // Handle branch change
  const handleBranchChange = useCallback(
    (branchId: string) => {
      const branch = branches.find((b) => b.branch_id === branchId);
      setSelectedBranch(branch || null);
      setSelectedBay(null);
      setSelectedSlot(null);
      setAvailableSlots([]);
    },
    [branches]
  );

  // Handle bay change (same logic as BookingModal)
  const handleBayChange = useCallback(
    (bayId: string) => {
      // Save current slot state for current bay
      if (selectedBay) {
        setBaySlotStates((prev) => ({
          ...prev,
          [selectedBay.bay_id]: {
            slot: selectedSlot,
            isChanged: isSlotChanged,
          },
        }));

        // Save current walk-in bay state for current bay
        setBayWalkInStates((prev) => ({
          ...prev,
          [selectedBay.bay_id]: {
            selectedWalkInBay,
            bayRecommendation,
            queueItems,
            manualBaySelection,
          },
        }));
      }

      const bay = serviceBays?.find((b) => b.bay_id === bayId);
      setSelectedBay(bay || null);

      // Restore slot state for the new bay
      if (bay && baySlotStates[bay.bay_id]) {
        const bayState = baySlotStates[bay.bay_id];
        setSelectedSlot(bayState.slot);
        setIsSlotChanged(bayState.isChanged);
      } else {
        setSelectedSlot(null);
        setIsSlotChanged(false);
      }

      // Restore walk-in bay state for the new bay
      if (bay && bayWalkInStates[bay.bay_id]) {
        const walkInState = bayWalkInStates[bay.bay_id];
        setSelectedWalkInBay(walkInState.selectedWalkInBay);
        setBayRecommendation(walkInState.bayRecommendation);
        setQueueItems(walkInState.queueItems);
        setManualBaySelection(walkInState.manualBaySelection);
      } else {
        setSelectedWalkInBay(null);
        setBayRecommendation(null);
        setQueueItems([]);
        setManualBaySelection(false);
      }
    },
    [
      serviceBays,
      selectedBay,
      selectedSlot,
      isSlotChanged,
      baySlotStates,
      selectedWalkInBay,
      bayRecommendation,
      queueItems,
      manualBaySelection,
      bayWalkInStates,
    ]
  );

  // Handle slot selection (same logic as BookingModal)
  const handleSlotSelect = useCallback(
    (slot: SlotInfo) => {
      if (canSelectSlot(slot)) {
        const newSlot = {
          bayId: slot.bayId,
          bayName: slot.bayName,
          date: bookingDate,
          startTime: slot.startTime,
          serviceDurationMinutes: totalDuration,
        };

        setSelectedSlot(newSlot);
        setIsSlotChanged(true); // Mark slot as changed

        // Save slot state for current bay
        if (selectedBay) {
          setBaySlotStates((prev) => ({
            ...prev,
            [selectedBay.bay_id]: {
              slot: newSlot,
              isChanged: true,
            },
          }));
        }
      }
    },
    [canSelectSlot, bookingDate, totalDuration, selectedBay]
  );

  // Handle booking actions
  const handleConfirm = async () => {
    try {
      await confirmBookingMutation.mutateAsync(initialData.booking_id);
      // Close modal and refresh data
      onOk({ action: "confirm", bookingId: initialData.booking_id });
      // Refresh table data
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.log("Error confirming booking:", error);
    }
  };

  const handleCheckIn = async () => {
    try {
      await checkInBookingMutation.mutateAsync(initialData.booking_id);
      // Close modal and refresh data
      onOk({ action: "checkin", bookingId: initialData.booking_id });
      // Refresh table data
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.log("Error checking in booking:", error);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelBookingMutation.mutateAsync({
        bookingId: initialData.booking_id,
        reason: "Hủy bởi admin",
        cancelledBy: "admin",
      });
      // Close modal and refresh data
      onOk({ action: "cancel", bookingId: initialData.booking_id });
      // Refresh table data
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.log("Error cancelling booking:", error);
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    try {
      console.log("🚀 Starting handleSubmit...");
      console.log("Current state:", {
        customerType,
        selectedCustomer: !!selectedCustomer,
        selectedVehicle: !!selectedVehicle,
        newCustomer: !!newCustomer,
        newVehicle: !!newVehicle,
        selectedBranch: !!selectedBranch,
        selectedSlot: !!selectedSlot,
        selectedItems: selectedItems.length,
      });

      const values = await form.validateFields();
      console.log("Form values:", values);

      // Determine booking type based on booking code prefix
      const isWalkInBooking =
        initialData.booking_code?.startsWith("WALK") || false;
      const isSlotBooking = initialData.booking_code?.startsWith("BK") || false;

      console.log("Booking type:", { isWalkInBooking, isSlotBooking });

      // Check if using new customer or existing customer
      const isNewCustomer = customerType === "new" && newCustomer && newVehicle;
      const isExistingCustomer =
        customerType === "existing" && selectedCustomer && selectedVehicle;

      console.log("Customer checks:", {
        isNewCustomer,
        isExistingCustomer,
        customerType,
        hasNewCustomer: !!newCustomer,
        hasNewVehicle: !!newVehicle,
        hasSelectedCustomer: !!selectedCustomer,
        hasSelectedVehicle: !!selectedVehicle,
      });

      if (!isNewCustomer && !isExistingCustomer) {
        console.log("❌ Missing required information for booking");
        console.log(
          "isNewCustomer:",
          isNewCustomer,
          "isExistingCustomer:",
          isExistingCustomer,
          "customerType:",
          customerType,
          "selectedCustomer:",
          selectedCustomer,
          "selectedVehicle:",
          selectedVehicle,
          "newCustomer:",
          newCustomer,
          "newVehicle:",
          newVehicle
        );
        return;
      }

      // Handle walk-in booking (both new and existing customers)
      if (isWalkInBooking) {
        if (!selectedBranch) {
          console.log("Missing branch information for walk-in booking");
          return;
        }

        console.log("Updating walk-in booking");
        try {
          // For walk-in booking, we need to use the regular updateBooking API
          // but with walk-in specific data structure
          const updateRequest = {
            customer_name: isNewCustomer
              ? newCustomer!.full_name
              : selectedCustomer!.full_name,
            customer_phone: isNewCustomer
              ? newCustomer!.phone_number
              : selectedCustomer!.phone_number,
            customer_email: isNewCustomer
              ? newCustomer!.email
              : selectedCustomer!.email,
            vehicle_license_plate: isNewCustomer
              ? newVehicle!.license_plate
              : selectedVehicle!.license_plate,
            vehicle_brand_name: isNewCustomer
              ? newVehicle!.brand_name
              : selectedVehicle!.brand_name || "",
            vehicle_model_name: isNewCustomer
              ? newVehicle!.model_name
              : selectedVehicle!.model_name || "",
            vehicle_type_name: isNewCustomer
              ? newVehicle!.type_name
              : selectedVehicle!.type_name || "",
            vehicle_year: isNewCustomer
              ? newVehicle!.year
              : selectedVehicle!.model_year || new Date().getFullYear(),
            vehicle_color: isNewCustomer
              ? newVehicle!.color
              : selectedVehicle!.color || "",
            // For walk-in booking, don't send branch_id as it cannot be changed
            branch_id: isWalkInBooking ? undefined : selectedBranch.branch_id,
            // For walk-in booking, only set service_bay_id if it's different from original
            service_bay_id:
              selectedWalkInBay && selectedWalkInBay !== initialData.bay_id
                ? selectedWalkInBay
                : undefined,
            // For walk-in booking, we don't set scheduled times or slot info
            preferred_start_at: undefined,
            scheduled_start_at: undefined,
            scheduled_end_at: undefined,
            slot_date: undefined,
            slot_start_time: undefined,
            estimated_duration_minutes: totalDuration,
            buffer_minutes: 15,
            total_price: totalPrice,
            currency: "VND",
            deposit_amount: 0,
            payment_status: initialData.payment_status,
            status: initialData.status,
            priority: initialData.priority,
            coupon_code: values.couponCode || undefined,
            notes: values.notes || "",
            special_requests: values.specialRequests || [],
          };

          console.log(
            "🚀 Updating walk-in booking with request:",
            updateRequest
          );
          const updateResponse = await updateBookingMutation.mutateAsync({
            bookingId: initialData.booking_id,
            request: updateRequest,
          });
          console.log("📋 Walk-in booking update response:", updateResponse);
          onOk(updateRequest);
          // Refresh table data
          if (onRefresh) {
            onRefresh();
          }
          return;
        } catch (walkInError) {
          console.log("Error updating walk-in booking:", walkInError);
          onOk({
            customerType: isNewCustomer ? "new" : "existing",
            customer: isNewCustomer ? newCustomer : selectedCustomer,
            vehicle: isNewCustomer ? newVehicle : selectedVehicle,
            branch: selectedBranch,
            services: selectedItems,
            totalPrice,
            totalDuration,
            notes: values.notes || "",
          });
          return;
        }
      }

      // Handle slot booking (both new and existing customers)
      if (isSlotBooking) {
        if (!selectedBranch || !selectedSlot) {
          console.log("Missing branch or slot information for slot booking");
          return;
        }

        console.log("Updating slot booking");
        try {
          // Additional safety checks
          if (isNewCustomer && (!newCustomer || !newVehicle)) {
            console.log("❌ New customer data is incomplete");
            return;
          }
          if (!isNewCustomer && (!selectedCustomer || !selectedVehicle)) {
            console.log("❌ Existing customer data is incomplete");
            return;
          }

          const updateRequest = {
            customer_name: isNewCustomer
              ? newCustomer!.full_name
              : selectedCustomer!.full_name,
            customer_phone: isNewCustomer
              ? newCustomer!.phone_number
              : selectedCustomer!.phone_number,
            customer_email: isNewCustomer
              ? newCustomer!.email
              : selectedCustomer!.email,
            vehicle_license_plate: isNewCustomer
              ? newVehicle!.license_plate
              : selectedVehicle!.license_plate,
            vehicle_brand_name: isNewCustomer
              ? newVehicle!.brand_name
              : selectedVehicle!.brand_name || "",
            vehicle_model_name: isNewCustomer
              ? newVehicle!.model_name
              : selectedVehicle!.model_name || "",
            vehicle_type_name: isNewCustomer
              ? newVehicle!.type_name
              : selectedVehicle!.type_name || "",
            vehicle_year: isNewCustomer
              ? newVehicle!.year
              : selectedVehicle!.model_year || new Date().getFullYear(),
            vehicle_color: isNewCustomer
              ? newVehicle!.color
              : selectedVehicle!.color || "",
            branch_id: selectedBranch.branch_id,
            // For slot booking, only set service_bay_id if it's different from original or slot changed
            service_bay_id:
              isSlotChanged || selectedSlot.bayId !== initialData.bay_id
                ? selectedSlot.bayId
                : undefined,
            // For slot booking, only set slot info if slot changed
            slot_date: isSlotChanged ? selectedSlot.date : undefined,
            slot_start_time: isSlotChanged ? selectedSlot.startTime : undefined,
            estimated_duration_minutes: selectedSlot.serviceDurationMinutes,
            buffer_minutes: 15,
            total_price: totalPrice,
            currency: "VND",
            deposit_amount: 0,
            payment_status: initialData.payment_status,
            status: initialData.status,
            priority: initialData.priority,
            coupon_code: values.couponCode || undefined,
            notes: values.notes || "",
            special_requests: values.specialRequests || [],
          };

          console.log("🚀 Updating slot booking with request:", updateRequest);
          console.log("🔍 Slot booking data:", {
            service_bay_id: selectedSlot.bayId,
            slot_date: selectedSlot.date,
            slot_start_time: selectedSlot.startTime,
            estimated_duration_minutes: selectedSlot.serviceDurationMinutes,
            isSlotChanged,
            originalSlot,
          });
          const updateResponse = await updateBookingMutation.mutateAsync({
            bookingId: initialData.booking_id,
            request: updateRequest,
          });
          console.log("📋 Booking update response:", updateResponse);
          onOk(updateRequest);
          return;
        } catch (bookingError) {
          console.log("Error updating slot booking:", bookingError);
          onOk({
            customerType: isNewCustomer ? "new" : "existing",
            customer: isNewCustomer ? newCustomer : selectedCustomer,
            vehicle: isNewCustomer ? newVehicle : selectedVehicle,
            branch: selectedBranch,
            slot: selectedSlot,
            services: selectedItems,
            totalPrice,
            totalDuration,
            notes: values.notes || "",
          });
          return;
        }
      }
    } catch (error) {
      console.log("Booking update failed:", error);

      // Debug form validation errors
      if (error && typeof error === "object" && "errorFields" in error) {
        const errorFields = (
          error as {
            errorFields: Array<{
              name: string[];
              errors: string[];
              warnings?: string[];
            }>;
          }
        ).errorFields;
        console.log("Validation errors:", errorFields);
        errorFields.forEach((field, index: number) => {
          console.log(`Field ${index + 1}:`, {
            name: field.name,
            errors: field.errors,
            warnings: field.warnings,
          });
        });
      }
    }
  };

  const renderCustomerVehicleStep = () => (
    <div>
      <Card
        size="small"
        title="Thông tin khách hàng và xe"
        style={{ marginBottom: 16 }}
      >
        <Tabs
          defaultActiveKey={customerType}
          onChange={(key) => {
            console.log("🔄 Switching customer type tab:", key);
            setCustomerType(key as "existing" | "new");
            // Reset all customer and vehicle data when switching tabs
            setSelectedCustomer(null);
            setSelectedVehicle(null);
            setNewCustomer(null);
            setNewVehicle(null);

            // Reset slot selection when switching customer types
            setSelectedBay(null);
            setSelectedSlot(null);
            setAvailableSlots([]);
            setSelectedWalkInBay(null);
            setManualBaySelection(false);

            // Reset form fields for customer/vehicle sections
            form.setFieldsValue({
              customerId: undefined,
              vehicleId: undefined,
              newCustomerName: "",
              newCustomerPhone: "",
              newCustomerEmail: "",
              newVehicleLicensePlate: "",
              newVehicleBrand: "",
              newVehicleModel: "",
              newVehicleType: "",
              newVehicleColor: "",
              newVehicleYear: new Date().getFullYear(),
            });
          }}
          items={[
            // Only show existing customer tab if customer exists in system
            ...(customerType === "existing"
              ? [
                  {
                    key: "existing",
                    label: <span>👤 Khách hàng có sẵn</span>,
                    children: (
                      <div>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Card
                              size="small"
                              title="Thông tin khách hàng"
                              style={{ marginBottom: 16 }}
                            >
                              <Form.Item
                                name="customerId"
                                label="Chọn khách hàng"
                                rules={[
                                  {
                                    required: customerType === "existing",
                                    message: "Vui lòng chọn khách hàng",
                                  },
                                ]}
                              >
                                <Select
                                  placeholder="Tìm kiếm theo tên hoặc số điện thoại"
                                  showSearch
                                  loading={isLoadingCustomers}
                                  onChange={(customerId) => {
                                    const customer = customers.find(
                                      (c) => c.user_id === customerId
                                    );
                                    setSelectedCustomer(customer || null);
                                    setSelectedVehicle(null);
                                    if (form) {
                                      form.setFieldValue(
                                        "vehicleId",
                                        undefined
                                      );
                                    }
                                  }}
                                  filterOption={(input, option) => {
                                    const label =
                                      option?.label?.toString() || "";
                                    const customer = customers.find(
                                      (c) => c.user_id === option?.value
                                    );
                                    const phoneNumber =
                                      customer?.phone_number || "";
                                    const searchText = input.toLowerCase();
                                    return (
                                      label
                                        .toLowerCase()
                                        .includes(searchText) ||
                                      phoneNumber.includes(searchText)
                                    );
                                  }}
                                  optionLabelProp="label"
                                >
                                  {customers.map((customer) => (
                                    <Option
                                      key={customer.user_id}
                                      value={customer.user_id}
                                      label={customer.full_name}
                                    >
                                      <div>
                                        <div style={{ fontWeight: 500 }}>
                                          {customer.full_name}
                                        </div>
                                        <div
                                          style={{
                                            fontSize: 12,
                                            color: "#666",
                                          }}
                                        >
                                          {customer.phone_number} •{" "}
                                          {customer.email}
                                        </div>
                                      </div>
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>

                              {selectedCustomer && (
                                <Alert
                                  message={`Khách hàng: ${selectedCustomer.full_name}`}
                                  description={`SĐT: ${selectedCustomer.phone_number} • Email: ${selectedCustomer.email}`}
                                  type="success"
                                  style={{ marginTop: 8 }}
                                />
                              )}
                            </Card>
                          </Col>

                          <Col span={12}>
                            <Card
                              size="small"
                              title="Thông tin xe"
                              style={{ marginBottom: 16 }}
                            >
                              <Form.Item
                                name="vehicleId"
                                label="Chọn xe"
                                rules={[
                                  {
                                    required: customerType === "existing",
                                    message: "Vui lòng chọn xe",
                                  },
                                ]}
                              >
                                <Select
                                  placeholder={
                                    selectedCustomer
                                      ? "Chọn xe của khách hàng"
                                      : "Vui lòng chọn khách hàng trước"
                                  }
                                  loading={isLoadingVehicles}
                                  onChange={handleVehicleChange}
                                  disabled={!selectedCustomer}
                                  optionLabelProp="label"
                                  notFoundContent={
                                    !selectedCustomer
                                      ? "Vui lòng chọn khách hàng trước"
                                      : isLoadingVehicles
                                      ? "Đang tải danh sách xe..."
                                      : vehicles.length === 0
                                      ? `Khách hàng "${selectedCustomer.full_name}" chưa có xe nào trong hệ thống`
                                      : "Không tìm thấy xe phù hợp"
                                  }
                                >
                                  {vehicles.map(
                                    (vehicle: VehicleProfileDisplay) => (
                                      <Option
                                        key={vehicle.vehicle_id}
                                        value={vehicle.vehicle_id}
                                        label={vehicle.license_plate}
                                      >
                                        <div>
                                          <div style={{ fontWeight: 500 }}>
                                            {vehicle.license_plate}
                                          </div>
                                          <div
                                            style={{
                                              fontSize: 12,
                                              color: "#666",
                                            }}
                                          >
                                            {vehicle.brand_name}{" "}
                                            {vehicle.model_name} •{" "}
                                            {vehicle.type_name}
                                          </div>
                                        </div>
                                      </Option>
                                    )
                                  )}
                                </Select>
                              </Form.Item>

                              {selectedVehicle && (
                                <Alert
                                  message={`Xe: ${selectedVehicle.license_plate}`}
                                  description={`${selectedVehicle.brand_name} ${selectedVehicle.model_name} • ${selectedVehicle.type_name}`}
                                  type="info"
                                  style={{ marginTop: 8 }}
                                />
                              )}
                            </Card>
                          </Col>
                        </Row>
                      </div>
                    ),
                  },
                ]
              : []),
            // Only show new customer tab if customer is new
            ...(customerType === "new"
              ? [
                  {
                    key: "new",
                    label: <span>➕ Khách hàng mới</span>,
                    children: renderNewCustomerForm(),
                  },
                ]
              : []),
          ]}
        />
      </Card>
    </div>
  );

  // Render new customer form (Tab 2)
  const renderNewCustomerForm = () => {
    console.log("🔍 Rendering new customer form:", {
      customerType,
      newCustomer,
      newVehicle,
    });

    return (
      <div>
        <Row gutter={16}>
          <Col span={12}>
            <Card
              size="small"
              title="Thông tin khách hàng mới"
              style={{ marginBottom: 16 }}
            >
              <Form.Item
                name="newCustomerName"
                label="Họ và tên"
                rules={[
                  {
                    required: customerType === "new",
                    message: "Vui lòng nhập họ và tên",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập họ và tên khách hàng"
                  onChange={(e) => {
                    console.log(
                      "📝 New customer name changed:",
                      e.target.value
                    );
                    setNewCustomer((prev) => ({
                      ...prev,
                      full_name: e.target.value,
                      phone_number: prev?.phone_number || "",
                      email: prev?.email || "",
                    }));
                  }}
                />
              </Form.Item>

              <Form.Item
                name="newCustomerPhone"
                label="Số điện thoại"
                rules={[
                  {
                    required: customerType === "new",
                    message: "Vui lòng nhập số điện thoại",
                  },
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: "Số điện thoại không hợp lệ",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập số điện thoại"
                  onChange={(e) => {
                    setNewCustomer((prev) => ({
                      ...prev,
                      full_name: prev?.full_name || "",
                      phone_number: e.target.value,
                      email: prev?.email || "",
                    }));
                  }}
                />
              </Form.Item>

              <Form.Item name="newCustomerEmail" label="Email (tùy chọn)">
                <Input
                  placeholder="Nhập email (tùy chọn)"
                  onChange={(e) => {
                    setNewCustomer((prev) => ({
                      ...prev,
                      full_name: prev?.full_name || "",
                      phone_number: prev?.phone_number || "",
                      email: e.target.value,
                    }));
                  }}
                />
              </Form.Item>

              {newCustomer && (
                <Alert
                  message={`Khách hàng mới: ${newCustomer.full_name}`}
                  description={`SĐT: ${newCustomer.phone_number}${
                    newCustomer.email ? ` • Email: ${newCustomer.email}` : ""
                  }`}
                  type="success"
                  style={{ marginTop: 8 }}
                />
              )}
            </Card>
          </Col>

          <Col span={12}>
            <Card
              size="small"
              title="Thông tin xe mới"
              style={{ marginBottom: 16 }}
            >
              <Form.Item
                name="newVehicleLicensePlate"
                label="Biển số xe"
                rules={[
                  {
                    required: customerType === "new",
                    message: "Vui lòng nhập biển số xe",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập biển số xe"
                  onChange={(e) => {
                    console.log(
                      "🚗 New vehicle license plate changed:",
                      e.target.value
                    );
                    setNewVehicle((prev) => ({
                      ...prev,
                      license_plate: e.target.value,
                      brand_name: prev?.brand_name || "",
                      model_name: prev?.model_name || "",
                      type_name: prev?.type_name || "",
                      color: prev?.color || "",
                      year: prev?.year || new Date().getFullYear(),
                    }));
                  }}
                />
              </Form.Item>

              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item
                    name="newVehicleBrand"
                    label="Hãng xe"
                    rules={[
                      {
                        required: customerType === "new",
                        message: "Vui lòng nhập hãng xe",
                      },
                    ]}
                  >
                    <Input
                      placeholder="VD: Toyota, Honda"
                      onChange={(e) => {
                        setNewVehicle((prev) => ({
                          ...prev,
                          license_plate: prev?.license_plate || "",
                          brand_name: e.target.value,
                          model_name: prev?.model_name || "",
                          type_name: prev?.type_name || "",
                          color: prev?.color || "",
                          year: prev?.year || new Date().getFullYear(),
                        }));
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="newVehicleModel"
                    label="Model xe"
                    rules={[
                      {
                        required: customerType === "new",
                        message: "Vui lòng nhập model xe",
                      },
                    ]}
                  >
                    <Input
                      placeholder="VD: Camry, Civic"
                      onChange={(e) => {
                        setNewVehicle((prev) => ({
                          ...prev,
                          license_plate: prev?.license_plate || "",
                          brand_name: prev?.brand_name || "",
                          model_name: e.target.value,
                          type_name: prev?.type_name || "",
                          color: prev?.color || "",
                          year: prev?.year || new Date().getFullYear(),
                        }));
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item
                    name="newVehicleType"
                    label="Loại xe"
                    rules={[
                      {
                        required: customerType === "new",
                        message: "Vui lòng nhập loại xe",
                      },
                    ]}
                  >
                    <Input
                      placeholder="VD: Sedan, SUV"
                      onChange={(e) => {
                        setNewVehicle((prev) => ({
                          ...prev,
                          license_plate: prev?.license_plate || "",
                          brand_name: prev?.brand_name || "",
                          model_name: prev?.model_name || "",
                          type_name: e.target.value,
                          color: prev?.color || "",
                          year: prev?.year || new Date().getFullYear(),
                        }));
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="newVehicleColor"
                    label="Màu sắc"
                    rules={[
                      {
                        required: customerType === "new",
                        message: "Vui lòng nhập màu sắc",
                      },
                    ]}
                  >
                    <Input
                      placeholder="VD: Đen, Trắng, Xám"
                      onChange={(e) => {
                        setNewVehicle((prev) => ({
                          ...prev,
                          license_plate: prev?.license_plate || "",
                          brand_name: prev?.brand_name || "",
                          model_name: prev?.model_name || "",
                          type_name: prev?.type_name || "",
                          color: e.target.value,
                          year: prev?.year || new Date().getFullYear(),
                        }));
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {newVehicle && (
                <Alert
                  message={`Xe mới: ${newVehicle.license_plate}`}
                  description={`${newVehicle.brand_name} ${newVehicle.model_name} • ${newVehicle.type_name} • ${newVehicle.color}`}
                  type="info"
                  style={{ marginTop: 8 }}
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const renderServiceSelectionStep = () => {
    // Determine if this is a walk-in booking based on booking code prefix
    const isWalkInBookingType =
      initialData.booking_code?.startsWith("WALK") || false;

    return (
      <div>
        <Card size="small" title="Dịch vụ" style={{ marginBottom: 16 }}>
          {isWalkInBookingType ? (
            // For walk-in bookings, show services as read-only
            <div>
              {selectedItems.length > 0 && (
                <div>
                  <Text strong>Dịch vụ đã chọn:</Text>
                  <div style={{ marginTop: 8 }}>
                    {selectedItems.map((item) => (
                      <Tag
                        key={item.item_id}
                        color="blue"
                        style={{ marginBottom: 4 }}
                      >
                        {item.item_name} - {item.fixed_price?.toLocaleString()}{" "}
                        VNĐ
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              <Divider />
              <Row gutter={16}>
                <Col span={12}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: 16,
                      backgroundColor: "#f0f0f0",
                      borderRadius: 8,
                    }}
                  >
                    <DollarOutlined
                      style={{ color: "#52c41a", fontSize: 24 }}
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text strong style={{ color: "#52c41a", fontSize: 18 }}>
                        {totalPrice.toLocaleString()} VNĐ
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Tổng giá
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: 16,
                      backgroundColor: "#f0f0f0",
                      borderRadius: 8,
                    }}
                  >
                    <ClockCircleOutlined
                      style={{ color: "#1890ff", fontSize: 24 }}
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text strong style={{ color: "#1890ff", fontSize: 18 }}>
                        {totalDuration} phút
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Tổng thời gian
                    </Text>
                  </div>
                </Col>
              </Row>
            </div>
          ) : (
            // For slot bookings, show editable service selection
            <div>
              <Form.Item name="services" label="Dịch vụ chăm sóc xe" rules={[]}>
                <Select
                  mode="multiple"
                  placeholder="Chọn dịch vụ chăm sóc xe"
                  onChange={handleServiceChange}
                  optionLabelProp="label"
                  loading={isLoadingPriceBooks}
                  notFoundContent={
                    isLoadingPriceBooks
                      ? "Đang tải dịch vụ..."
                      : priceBooksError
                      ? `Lỗi tải dịch vụ: ${
                          (priceBooksError as { response?: { data?: unknown } })
                            ?.response?.data ||
                          "Không thể tải danh sách dịch vụ"
                        }`
                      : availableServices.length === 0
                      ? "Không có dịch vụ nào khả dụng"
                      : "Không tìm thấy dịch vụ phù hợp"
                  }
                  filterOption={(input, option) => {
                    const label = option?.label?.toString() || "";
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {availableServices.map((item) => (
                    <Option
                      key={item.item_id}
                      value={item.item_id}
                      label={item.item_name}
                    >
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {item.item_name}
                          <Tag
                            color="blue"
                            style={{ marginLeft: 8, fontSize: 10 }}
                          >
                            Dịch vụ
                          </Tag>
                        </div>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          {item.service?.service_name} •{" "}
                          {item.fixed_price?.toLocaleString()} VNĐ
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedItems.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Text strong>Dịch vụ đã chọn:</Text>
                  <div style={{ marginTop: 8 }}>
                    {selectedItems.map((item) => (
                      <Tag
                        key={item.item_id}
                        closable
                        onClose={() => {
                          const newItems = selectedItems.filter(
                            (i) => i.item_id !== item.item_id
                          );
                          setSelectedItems(newItems);
                          calculateTotals(newItems);
                        }}
                        style={{ marginBottom: 4 }}
                      >
                        {item.item_name} - {item.fixed_price?.toLocaleString()}{" "}
                        VNĐ
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              <Divider />
              <Row gutter={16}>
                <Col span={12}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: 16,
                      backgroundColor: "#f0f0f0",
                      borderRadius: 8,
                    }}
                  >
                    <DollarOutlined
                      style={{ color: "#52c41a", fontSize: 24 }}
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text strong style={{ color: "#52c41a", fontSize: 18 }}>
                        {totalPrice.toLocaleString()} VNĐ
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Tổng giá
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: 16,
                      backgroundColor: "#f0f0f0",
                      borderRadius: 8,
                    }}
                  >
                    <ClockCircleOutlined
                      style={{ color: "#1890ff", fontSize: 24 }}
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text strong style={{ color: "#1890ff", fontSize: 18 }}>
                        {totalDuration} phút
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Tổng thời gian
                    </Text>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Card>
      </div>
    );
  };

  const renderDateTimeBranchStep = () => {
    // Determine if this is a walk-in booking based on booking code prefix
    const isWalkInBookingType =
      initialData.booking_code?.startsWith("WALK") || false;

    // Hide time and branch section completely for walk-in bookings
    if (isWalkInBookingType) {
      return null;
    }

    return (
      <div>
        <Row gutter={16}>
          <Col span={12}>
            <Card size="small" title="Thời gian" style={{ marginBottom: 16 }}>
              <Form.Item name="bookingDate" label="Ngày đặt lịch" rules={[]}>
                <DatePicker
                  style={{ width: "100%" }}
                  value={bookingDate ? dayjs(bookingDate) : null}
                  placeholder="Chọn ngày"
                  // Debug log
                  onOpenChange={(open) => {
                    if (open) {
                      console.log("🗓️ DatePicker opened:", {
                        bookingDate,
                        dayjsValue: bookingDate ? dayjs(bookingDate) : null,
                        isValid: bookingDate
                          ? dayjs(bookingDate).isValid()
                          : false,
                        isWalkInBookingType,
                      });
                    }
                  }}
                  disabledDate={(current) => {
                    const today = dayjs();
                    const currentHour = today.hour();

                    // For slot bookings, apply the 17:00 rule
                    if (currentHour >= 17) {
                      return (
                        current && current < today.add(1, "day").startOf("day")
                      );
                    }

                    return current && current < today.startOf("day");
                  }}
                  onChange={(date) => {
                    const newDate = date ? date.format("YYYY-MM-DD") : "";
                    console.log("📅 DatePicker onChange:", {
                      date,
                      newDate,
                      isValid: date ? date.isValid() : false,
                    });
                    setBookingDate(newDate);
                  }}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col span={12}>
            <Card size="small" title="Chi nhánh" style={{ marginBottom: 16 }}>
              <Form.Item name="branchId" label="Chọn chi nhánh" rules={[]}>
                <Select
                  placeholder="Chọn chi nhánh"
                  optionLabelProp="label"
                  onChange={handleBranchChange}
                  loading={isLoadingBranches}
                  showSearch
                  filterOption={(input, option) => {
                    const childrenText =
                      option?.children?.toString().toLowerCase() || "";
                    return childrenText.includes(input.toLowerCase());
                  }}
                >
                  {branches.map((branch) => (
                    <Option
                      key={branch.branch_id}
                      value={branch.branch_id}
                      label={branch.branch_name}
                    >
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {branch.branch_name}
                        </div>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          {branch.branch_code} • {branch.address}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // Render bay recommendation for walk-in booking (copied from BookingModal)
  const renderBayRecommendation = () => (
    <div>
      <Alert
        message="🎯 Đề xuất bay thông minh"
        description="Hệ thống đã tự động đề xuất bay tốt nhất dựa trên tình trạng hiện tại"
        type="info"
        style={{ marginBottom: 16 }}
      />

      {isLoadingRecommendation ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin />
          <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            Đang phân tích và đề xuất bay...
          </div>
        </div>
      ) : bayRecommendation ? (
        <div>
          {/* Recommended Bay */}
          <Card title="Bay được đề xuất" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ textAlign: "center", padding: "16px" }}>
                  <ShopOutlined
                    style={{
                      fontSize: 32,
                      color:
                        selectedWalkInBay ===
                        bayRecommendation.recommended_bay?.bay_id
                          ? "#52c41a"
                          : "#d9d9d9",
                      marginBottom: 8,
                    }}
                  />
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 18,
                      color:
                        selectedWalkInBay ===
                        bayRecommendation.recommended_bay?.bay_id
                          ? "#52c41a"
                          : "#d9d9d9",
                    }}
                  >
                    {bayRecommendation.recommended_bay?.bay_name}
                  </div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    {bayRecommendation.recommended_bay?.bay_code ||
                      "Bay được đề xuất"}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color:
                        selectedWalkInBay ===
                        bayRecommendation.recommended_bay?.bay_id
                          ? "#52c41a"
                          : "#d9d9d9",
                      marginTop: 4,
                      fontWeight: 500,
                    }}
                  >
                    {selectedWalkInBay ===
                    bayRecommendation.recommended_bay?.bay_id
                      ? "Đã chọn"
                      : "Được đề xuất"}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ padding: "16px" }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Lý do đề xuất:</Text>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      {bayRecommendation.reason}
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Thời gian chờ dự kiến:</Text>
                    <div
                      style={{ fontSize: 12, color: "#1890ff", marginTop: 4 }}
                    >
                      {bayRecommendation.estimated_wait_time_minutes || 0} phút
                    </div>
                  </div>
                  <div>
                    <Text strong>Hàng chờ hiện tại:</Text>
                    <div
                      style={{ fontSize: 12, color: "#faad14", marginTop: 4 }}
                    >
                      {queueItems.length} khách hàng
                    </div>
                    {manualBaySelection && (
                      <div
                        style={{ fontSize: 10, color: "#1890ff", marginTop: 2 }}
                      >
                        Bay:{" "}
                        {onSiteBays.find(
                          (bay: ServiceBay) => bay.bay_id === selectedWalkInBay
                        )?.bay_name || "Đã chọn"}
                      </div>
                    )}
                  </div>
                  {manualBaySelection && (
                    <div style={{ marginTop: 12 }}>
                      <Button
                        size="small"
                        type="primary"
                        onClick={async () => {
                          setSelectedWalkInBay(
                            bayRecommendation.recommended_bay?.bay_id || null
                          );
                          setManualBaySelection(false);

                          // Restore original queue from recommendation
                          setIsLoadingQueue(true);
                          try {
                            if (
                              bayRecommendation?.queue &&
                              Array.isArray(bayRecommendation.queue)
                            ) {
                              console.log(
                                "🔄 Restoring original queue from recommendation"
                              );
                              setQueueItems(
                                bayRecommendation.queue as unknown as typeof queueItems
                              );
                            } else if (
                              bayRecommendation?.recommended_bay?.bay_id
                            ) {
                              console.log(
                                "🔄 Loading queue for recommended bay:",
                                bayRecommendation.recommended_bay.bay_id
                              );
                              const queue = await getBayQueue(
                                bayRecommendation.recommended_bay.bay_id,
                                bookingDate
                              );
                              console.log(
                                "✅ Queue loaded for recommended bay:",
                                queue
                              );
                              setQueueItems(
                                queue as unknown as typeof queueItems
                              );
                            }
                          } catch (error) {
                            console.log(
                              "❌ Error loading queue for recommended bay:",
                              error
                            );
                            setQueueItems([]);
                          } finally {
                            setIsLoadingQueue(false);
                          }
                        }}
                      >
                        Quay lại bay đề xuất
                      </Button>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Card>
          {/* Alternative Bays */}
          {bayRecommendation.alternative_bays &&
            bayRecommendation.alternative_bays.length > 0 && (
              <Card title="Bay thay thế" style={{ marginBottom: 16 }}>
                <Text strong style={{ marginBottom: 8, display: "block" }}>
                  Các bay khác có thể chọn:
                </Text>
                {manualBaySelection && (
                  <Alert
                    message="Bạn đã chọn bay khác với đề xuất"
                    description="Thông tin hàng chờ và thời gian chờ có thể thay đổi. Bạn có thể quay lại bay được đề xuất bằng nút bên trên."
                    type="warning"
                    style={{ marginBottom: 16 }}
                  />
                )}
                <Row gutter={8}>
                  {bayRecommendation.alternative_bays.map((bay) => (
                    <Col span={6} key={bay.bay_id}>
                      <Card
                        size="small"
                        hoverable
                        style={{
                          textAlign: "center",
                          border:
                            selectedWalkInBay === bay.bay_id
                              ? "2px solid #1890ff"
                              : "1px solid #d9d9d9",
                          backgroundColor:
                            selectedWalkInBay === bay.bay_id
                              ? "#e6f7ff"
                              : "#fff",
                        }}
                        onClick={async () => {
                          setSelectedWalkInBay(bay.bay_id);
                          setManualBaySelection(true);

                          // Load queue for the selected bay
                          setIsLoadingQueue(true);
                          try {
                            // Use the date selected by user
                            console.log(
                              "🔄 Loading queue for selected bay:",
                              bay.bay_id,
                              "using selected date:",
                              bookingDate
                            );
                            const queue = await getBayQueue(
                              bay.bay_id,
                              bookingDate
                            );
                            console.log("✅ Queue loaded for bay:", queue);
                            setQueueItems(
                              queue as unknown as typeof queueItems
                            );
                          } catch (error) {
                            console.log(
                              "❌ Error loading queue for bay:",
                              error
                            );
                            setQueueItems([]);
                          } finally {
                            setIsLoadingQueue(false);
                          }
                        }}
                      >
                        <ShopOutlined
                          style={{ fontSize: 20, color: "#1890ff" }}
                        />
                        <div style={{ marginTop: 4 }}>
                          <Text strong style={{ fontSize: 12 }}>
                            {bay.bay_name}
                          </Text>
                        </div>
                        <div style={{ fontSize: 10, color: "#666" }}>
                          {bay.bay_code || "Bay thay thế"}
                        </div>
                        {selectedWalkInBay === bay.bay_id && (
                          <div
                            style={{
                              fontSize: 8,
                              color: "#1890ff",
                              marginTop: 2,
                              fontWeight: 500,
                            }}
                          >
                            Đã chọn
                          </div>
                        )}
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            )}
          {/* Queue Information */}
          {isLoadingQueue ? (
            <Card title="Đang tải hàng chờ..." style={{ marginBottom: 16 }}>
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin />
                <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                  Đang tải thông tin hàng chờ...
                </div>
              </div>
            </Card>
          ) : (
            (() => {
              const safeQueueItems = getSafeQueueItems();
              console.log("🔍 Queue items debug:", {
                queueItems,
                safeQueueItems,
                isArray: Array.isArray(queueItems),
                length: queueItems?.length,
                source: "Bay Recommendation Queue Data",
              });
              return safeQueueItems.length > 0;
            })() && (
              <Card
                title={`Hàng chờ hiện tại (${
                  getSafeQueueItems().length
                } khách hàng)`}
                style={{ marginBottom: 16 }}
              >
                <style>
                  {`
                  .queue-first-row {
                    background-color: #f6ffed !important;
                  }
                  .queue-even-row {
                    background-color: #fafafa !important;
                  }
                  .queue-odd-row {
                    background-color: #ffffff !important;
                  }
                `}
                </style>
                <Table
                  dataSource={getSafeQueueItems()}
                  columns={[
                    {
                      title: "STT",
                      dataIndex: "queue_position",
                      key: "queue_position",
                      width: 60,
                      align: "center",
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      render: (value: number, record: any, index: number) => (
                        <span
                          style={{
                            fontWeight: "600",
                            color: index === 0 ? "#52c41a" : "#1890ff",
                          }}
                        >
                          #{value || index + 1}
                        </span>
                      ),
                    },
                    {
                      title: "Khách hàng",
                      key: "customer",
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      render: (record: any) => (
                        <div>
                          <div style={{ fontWeight: "500", color: "#262626" }}>
                            {String(
                              record.booking_customer_name ||
                                record.customer_name ||
                                record.customerName ||
                                "N/A"
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: "10px",
                              color: "#999",
                              marginTop: "2px",
                            }}
                          >
                            {String(
                              record.booking_code ||
                                record.booking_id ||
                                record.bookingId ||
                                ""
                            )}
                          </div>
                        </div>
                      ),
                    },
                    {
                      title: "Biển số",
                      key: "license_plate",
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      render: (record: any) => (
                        <span
                          style={{
                            color: "#666",
                            fontFamily: "monospace",
                            fontSize: "11px",
                          }}
                        >
                          {String(
                            record.booking_vehicle_license_plate ||
                              record.vehicle_license_plate ||
                              record.vehicleLicensePlate ||
                              "N/A"
                          )}
                        </span>
                      ),
                    },
                    {
                      title: "Dịch vụ",
                      key: "services",
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      render: (record: any) => (
                        <div>
                          {record.booking_service_names &&
                          record.booking_service_names.length > 0 ? (
                            <>
                              <div style={{ marginBottom: "2px" }}>
                                {record.booking_service_names
                                  .slice(0, 1)
                                  .join(", ")}
                              </div>
                              {record.booking_service_names.length > 1 && (
                                <div
                                  style={{ fontSize: "10px", color: "#999" }}
                                >
                                  +{record.booking_service_names.length - 1}{" "}
                                  dịch vụ khác
                                </div>
                              )}
                            </>
                          ) : (
                            "N/A"
                          )}
                        </div>
                      ),
                    },
                    {
                      title: "Giá",
                      key: "price",
                      align: "right",
                      width: 100,
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      render: (record: any) => (
                        <span
                          style={{
                            fontWeight: "500",
                            color: "#fa8c16",
                          }}
                        >
                          {record.booking_total_price
                            ? `${record.booking_total_price.toLocaleString()} VND`
                            : "N/A"}
                        </span>
                      ),
                    },
                    {
                      title: "Thời gian",
                      key: "time",
                      align: "center",
                      width: 120,
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      render: (record: any) => (
                        <div style={{ fontSize: "10px" }}>
                          {record.estimated_start_time ||
                          record.estimatedStartTime ? (
                            <div>
                              <div
                                style={{
                                  color: "#52c41a",
                                  marginBottom: "2px",
                                }}
                              >
                                Bắt đầu:{" "}
                                {new Date(
                                  String(
                                    record.estimated_start_time ||
                                      record.estimatedStartTime
                                  )
                                ).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              {record.estimated_completion_time ||
                              record.estimatedCompletionTime ? (
                                <div style={{ color: "#1890ff" }}>
                                  Hoàn thành:{" "}
                                  {new Date(
                                    String(
                                      record.estimated_completion_time ||
                                        record.estimatedCompletionTime
                                    )
                                  ).toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <div style={{ color: "#999" }}>
                              Đang tính toán...
                            </div>
                          )}
                        </div>
                      ),
                    },
                  ]}
                  pagination={false}
                  size="small"
                  scroll={{ y: 200 }}
                  rowKey={(record: unknown, index?: number) =>
                    (record as { queue_id?: string }).queue_id ||
                    `queue-${index || 0}`
                  }
                  rowClassName={(record: unknown, index?: number) =>
                    (index || 0) === 0
                      ? "queue-first-row"
                      : (index || 0) % 2 === 0
                      ? "queue-even-row"
                      : "queue-odd-row"
                  }
                  locale={{
                    emptyText: (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "40px 20px",
                          color: "#999",
                          fontSize: "14px",
                        }}
                      >
                        Không có khách hàng nào trong hàng chờ
                      </div>
                    ),
                  }}
                />
              </Card>
            )
          )}
        </div>
      ) : (
        <Alert
          message="Không tìm thấy bay phù hợp"
          description="Vui lòng thử lại sau hoặc chọn bay khác"
          type="warning"
          showIcon
        />
      )}
    </div>
  );

  // Render all content in single form (vertical layout like BookingModal)
  // Render booking status and actions tab
  const renderBookingStatusTab = () => (
    <div>
      {/* Action Buttons */}
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          backgroundColor: "#fafafa",
          borderRadius: 6,
          border: "1px solid #e8e8e8",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
          Thao tác booking
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {initialData.status === BookingStatus.PENDING && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleConfirm}
              loading={confirmBookingMutation.isPending}
            >
              Xác nhận
            </Button>
          )}
          {initialData.status === BookingStatus.CONFIRMED && (
            <Button
              type="default"
              icon={<LoginOutlined />}
              onClick={handleCheckIn}
              loading={checkInBookingMutation.isPending}
            >
              Check-in
            </Button>
          )}
          {(initialData.status === BookingStatus.PENDING ||
            initialData.status === BookingStatus.CONFIRMED ||
            initialData.status === BookingStatus.CHECKED_IN) && (
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={handleCancel}
              loading={cancelBookingMutation.isPending}
            >
              Hủy booking
            </Button>
          )}
        </div>
      </div>
      {/* Header Info */}
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          backgroundColor: "#f8f9fa",
          borderRadius: 8,
          border: "1px solid #e9ecef",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div>
            <Text style={{ fontSize: 18, fontWeight: 600, color: "#1890ff" }}>
              {initialData.booking_code}
            </Text>
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              ID: {initialData.booking_id}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              {initialData.total_price?.toLocaleString()}{" "}
              {initialData.currency || "VND"}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {initialData.estimated_duration_minutes || 0} phút
            </div>
          </div>
        </div>

        {/* Priority and Status */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Tag
            color={
              getPriorityConfig(initialData.priority || Priority.NORMAL).color
            }
            icon={
              getPriorityConfig(initialData.priority || Priority.NORMAL).icon
            }
          >
            {getPriorityConfig(initialData.priority || Priority.NORMAL).label}
          </Tag>
          <Tag
            color={getStatusConfig(initialData.status).color}
            icon={getStatusConfig(initialData.status).icon}
          >
            {getStatusConfig(initialData.status).label}
          </Tag>
          {initialData.payment_status && (
            <Tag color="blue">Thanh toán: {initialData.payment_status}</Tag>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
        }}
      >
        {/* Left Column */}
        <div>
          {/* Customer Info */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 12,
                color: "#262626",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <PhoneOutlined style={{ color: "#1890ff" }} />
              Thông tin khách hàng
            </div>
            <div
              style={{
                padding: 16,
                backgroundColor: "#fff",
                border: "1px solid #d9d9d9",
                borderRadius: 6,
              }}
            >
              <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 8 }}>
                {initialData.customer_name || "N/A"}
              </div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
                📞 {initialData.customer_phone || "N/A"}
              </div>
              {initialData.customer_email && (
                <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
                  📧 {initialData.customer_email}
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Info */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 12,
                color: "#262626",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>🚗</span>
              Thông tin xe
            </div>
            <div
              style={{
                padding: 16,
                backgroundColor: "#fff",
                border: "1px solid #d9d9d9",
                borderRadius: 6,
              }}
            >
              <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 8 }}>
                {initialData.vehicle_license_plate || "N/A"}
              </div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
                {initialData.vehicle_brand_name || "N/A"}{" "}
                {initialData.vehicle_model_name || ""}
              </div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
                {initialData.vehicle_type_name || "N/A"} •{" "}
                {initialData.vehicle_year || "N/A"} •{" "}
                {initialData.vehicle_color || "N/A"}
              </div>
            </div>
          </div>

          {/* Branch Info */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 12,
                color: "#262626",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>🏢</span>
              Chi nhánh
            </div>
            <div
              style={{
                padding: 16,
                backgroundColor: "#fff",
                border: "1px solid #d9d9d9",
                borderRadius: 6,
              }}
            >
              <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 8 }}>
                {initialData.branch_name || "N/A"}
              </div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
                Bay: {initialData.bay_name || "Chưa chọn bay"}
              </div>
              {initialData.branch_code && (
                <div style={{ fontSize: 12, color: "#999" }}>
                  Mã: {initialData.branch_code}
                </div>
              )}
              {initialData.bay_type && (
                <div style={{ fontSize: 12, color: "#999" }}>
                  Loại: {initialData.bay_type}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Services */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 12,
                color: "#262626",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>🔧</span>
              Dịch vụ ({initialData.booking_items?.length || 0})
            </div>
            <div
              style={{
                padding: 16,
                backgroundColor: "#fff",
                border: "1px solid #d9d9d9",
                borderRadius: 6,
              }}
            >
              {initialData.booking_items?.length ? (
                <div>
                  {initialData.booking_items.map((item, index: number) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: 8,
                        padding: 8,
                        backgroundColor: "#f0f8ff",
                        borderRadius: 4,
                        border: "1px solid #d6e4ff",
                      }}
                    >
                      <div style={{ fontWeight: 500, fontSize: 13 }}>
                        {item.item_name ||
                          `Service ${item.service_id?.substring(0, 8)}...`}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#666",
                          marginTop: 2,
                        }}
                      >
                        {item.unit_price?.toLocaleString() || 0} VND • Số lượng:{" "}
                        {item.quantity || 1}
                      </div>
                      {item.item_description && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#999",
                            marginTop: 2,
                          }}
                        >
                          Ghi chú: {item.item_description}
                        </div>
                      )}
                    </div>
                  ))}
                  <div
                    style={{
                      marginTop: 12,
                      padding: 8,
                      backgroundColor: "#f6ffed",
                      borderRadius: 4,
                      border: "1px solid #b7eb8f",
                    }}
                  >
                    <div style={{ fontWeight: 600, color: "#52c41a" }}>
                      Tổng: {initialData.total_price?.toLocaleString() || 0}{" "}
                      {initialData.currency || "VND"}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      Thời gian ước tính:{" "}
                      {initialData.estimated_duration_minutes || 0} phút
                    </div>
                  </div>
                </div>
              ) : (
                <Text type="secondary">Không có dịch vụ</Text>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 12,
                color: "#262626",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>⏰</span>
              Thời gian
            </div>
            <div
              style={{
                padding: 16,
                backgroundColor: "#fff",
                border: "1px solid #d9d9d9",
                borderRadius: 6,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: "#666" }}>
                  Thời gian đặt lịch
                </div>
                <div style={{ fontWeight: 500 }}>
                  {dayjs(
                    initialData.scheduled_start_at ||
                      initialData.preferred_start_at ||
                      initialData.created_at
                  ).format("DD/MM/YYYY HH:mm")}
                </div>
              </div>

              {initialData.actual_start_at && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    Bắt đầu thực hiện
                  </div>
                  <div style={{ fontWeight: 500, color: "#52c41a" }}>
                    {dayjs(initialData.actual_start_at).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </div>
                </div>
              )}

              {initialData.actual_end_at && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: "#666" }}>Hoàn thành</div>
                  <div style={{ fontWeight: 500, color: "#1890ff" }}>
                    {dayjs(initialData.actual_end_at).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAllContent = () => (
    <div>
      {/* Customer & Vehicle Section */}
      {renderCustomerVehicleStep()}

      {/* Service Selection Section */}
      {renderServiceSelectionStep()}

      {/* Date, Time & Branch Section */}
      {renderDateTimeBranchStep()}

      {/* Slot Selection Section */}
      {renderSlotSelectionStep()}
    </div>
  );

  const renderSlotSelectionStep = () => {
    // Determine booking type based on booking code prefix
    const isWalkInBooking =
      initialData.booking_code?.startsWith("WALK") || false;
    const isSlotBooking = initialData.booking_code?.startsWith("BK") || false;

    console.log("🔍 Booking type detection:", {
      isWalkInBooking,
      isSlotBooking,
      slotStartTime: initialData.slot_start_time,
      bayId: initialData.bay_id,
    });

    return (
      <div>
        <Card
          size="small"
          title="Chọn Khu Vực Chăm Sóc Và Slot"
          style={{ marginBottom: 16 }}
        >
          {!selectedBranch || !bookingDate ? (
            <Alert
              message="Vui lòng chọn chi nhánh và ngày trước"
              description="Bạn cần chọn chi nhánh và ngày để xem các slot có sẵn"
              type="warning"
              showIcon
            />
          ) : (
            <Tabs
              defaultActiveKey={isWalkInBooking ? "onsite" : "booking"}
              onChange={(key) => {
                if (key === "onsite") {
                  setSelectedBay(null);
                  setSelectedSlot(null);
                  setAvailableSlots([]);
                }
              }}
              items={[
                // Show booking tab only for slot bookings (existing customers with slot)
                ...(isSlotBooking
                  ? [
                      {
                        key: "booking",
                        label: <span>📅 Đặt lịch ({serviceBays.length})</span>,
                        children: (
                          <div>
                            <Row gutter={16} style={{ marginBottom: 16 }}>
                              <Col span={24}>
                                <Text strong>
                                  Chọn Service Bay cho đặt lịch:
                                </Text>
                                <div style={{ marginTop: 8 }}>
                                  {isLoadingServiceBays ? (
                                    <Spin />
                                  ) : (
                                    <Row gutter={8}>
                                      {serviceBays?.slice(0, 8).map((bay) => (
                                        <Col span={6} key={bay.bay_id}>
                                          <Card
                                            size="small"
                                            hoverable
                                            style={{
                                              textAlign: "center",
                                              border:
                                                selectedBay?.bay_id ===
                                                bay.bay_id
                                                  ? "2px solid #1890ff"
                                                  : "1px solid #d9d9d9",
                                              backgroundColor:
                                                selectedBay?.bay_id ===
                                                bay.bay_id
                                                  ? "#e6f7ff"
                                                  : "#fff",
                                            }}
                                            onClick={() =>
                                              handleBayChange(bay.bay_id)
                                            }
                                          >
                                            <ShopOutlined
                                              style={{
                                                fontSize: 24,
                                                color: "#1890ff",
                                              }}
                                            />
                                            <div style={{ marginTop: 8 }}>
                                              <Text strong>{bay.bay_name}</Text>
                                            </div>
                                            <div
                                              style={{
                                                fontSize: 12,
                                                color: "#666",
                                              }}
                                            >
                                              {bay.bay_code ||
                                                `Bay ${bay.bay_id.slice(
                                                  -2
                                                )}`}{" "}
                                              • 60 phút/slot
                                            </div>
                                          </Card>
                                        </Col>
                                      ))}
                                    </Row>
                                  )}
                                </div>
                              </Col>
                            </Row>

                            {selectedBay && (
                              <div>
                                <Divider />
                                <Text strong>
                                  Chọn Slot trong {selectedBay.bay_name}:
                                </Text>
                                <div style={{ marginTop: 8 }}>
                                  {loadingSlots ? (
                                    <div
                                      style={{
                                        textAlign: "center",
                                        padding: 20,
                                      }}
                                    >
                                      <Spin size="large" />
                                      <div style={{ marginTop: 8 }}>
                                        Đang tải danh sách slot...
                                      </div>
                                    </div>
                                  ) : availableSlots.length > 0 ? (
                                    <Row gutter={8}>
                                      {availableSlots.map((slot, index) => {
                                        const canSelect = canSelectSlot(slot);
                                        const isSelected =
                                          selectedSlot?.startTime ===
                                          slot.startTime;

                                        return (
                                          <Col
                                            span={4}
                                            key={`${slot.startTime}-${slot.endTime}-${index}`}
                                          >
                                            <Tooltip
                                              title={
                                                canSelect
                                                  ? totalDuration > 60
                                                    ? `Chọn ${Math.ceil(
                                                        totalDuration / 60
                                                      )} slot liên tiếp từ ${
                                                        slot.startTime
                                                      } (${totalDuration} phút)`
                                                    : `Chọn slot ${slot.startTime} - ${slot.endTime}`
                                                  : slot.status === "BOOKED"
                                                  ? "Slot đã được đặt"
                                                  : slot.status ===
                                                    "IN_PROGRESS"
                                                  ? "Slot đang được sử dụng"
                                                  : slot.status === "COMPLETED"
                                                  ? "Slot đã hoàn thành"
                                                  : slot.status === "CANCELLED"
                                                  ? "Slot đã bị hủy"
                                                  : totalDuration > 60
                                                  ? `Cần ${Math.ceil(
                                                      totalDuration / 60
                                                    )} slot liên tiếp - không đủ`
                                                  : "Slot không khả dụng"
                                              }
                                            >
                                              <Card
                                                size="small"
                                                hoverable={canSelect}
                                                style={{
                                                  textAlign: "center",
                                                  border: isSelected
                                                    ? "2px solid #52c41a"
                                                    : canSelect
                                                    ? "1px solid #d9d9d9"
                                                    : "1px solid #ff4d4f",
                                                  backgroundColor: isSelected
                                                    ? "#f6ffed"
                                                    : canSelect
                                                    ? "#fff"
                                                    : slot.status === "BOOKED"
                                                    ? "#fff2f0"
                                                    : slot.status ===
                                                      "IN_PROGRESS"
                                                    ? "#e6f7ff"
                                                    : "#f5f5f5",
                                                  cursor: canSelect
                                                    ? "pointer"
                                                    : "not-allowed",
                                                  opacity: canSelect ? 1 : 0.6,
                                                  marginBottom: 8,
                                                }}
                                                onClick={() =>
                                                  canSelect &&
                                                  handleSlotSelect(slot)
                                                }
                                              >
                                                <div
                                                  style={{
                                                    color:
                                                      slotStatusColors[
                                                        slot.status as keyof typeof slotStatusColors
                                                      ],
                                                    fontSize: 16,
                                                  }}
                                                >
                                                  {
                                                    slotStatusIcons[
                                                      slot.status as keyof typeof slotStatusIcons
                                                    ]
                                                  }
                                                </div>
                                                <div
                                                  style={{
                                                    marginTop: 4,
                                                    fontSize: 12,
                                                    fontWeight: 500,
                                                    color: canSelect
                                                      ? "#000"
                                                      : "#999",
                                                  }}
                                                >
                                                  {slot.startTime}
                                                </div>
                                                <div
                                                  style={{
                                                    fontSize: 10,
                                                    color: "#666",
                                                  }}
                                                >
                                                  {slot.endTime}
                                                </div>
                                                {totalDuration > 60 &&
                                                  canSelect && (
                                                    <div
                                                      style={{
                                                        fontSize: 8,
                                                        color: "#52c41a",
                                                        marginTop: 2,
                                                        fontWeight: 500,
                                                      }}
                                                    >
                                                      {Math.ceil(
                                                        totalDuration / 60
                                                      )}{" "}
                                                      slot
                                                    </div>
                                                  )}
                                                {!canSelect && (
                                                  <div
                                                    style={{
                                                      fontSize: 8,
                                                      color: "#ff4d4f",
                                                      marginTop: 2,
                                                    }}
                                                  >
                                                    {slot.status === "BOOKED"
                                                      ? "Đã đặt"
                                                      : slot.status ===
                                                        "IN_PROGRESS"
                                                      ? "Đang dùng"
                                                      : slot.status ===
                                                        "CANCELLED"
                                                      ? "Đã hủy"
                                                      : totalDuration > 60
                                                      ? "Không đủ slot"
                                                      : "Không khả dụng"}
                                                  </div>
                                                )}
                                              </Card>
                                            </Tooltip>
                                          </Col>
                                        );
                                      })}
                                    </Row>
                                  ) : (
                                    <Alert
                                      message="Không có slot khả dụng"
                                      description="Không có slot nào phù hợp với thời gian dịch vụ đã chọn"
                                      type="warning"
                                      showIcon
                                    />
                                  )}
                                </div>

                                {selectedSlot && (
                                  <Alert
                                    message={`Slot đã chọn: ${
                                      selectedSlot.startTime
                                    } - ${dayjs(
                                      `2000-01-01 ${selectedSlot.startTime}`
                                    )
                                      .add(
                                        selectedSlot.serviceDurationMinutes,
                                        "minute"
                                      )
                                      .format("HH:mm")}`}
                                    description={`Service Bay: ${selectedSlot.bayName} • Ngày: ${selectedSlot.date}`}
                                    type={isSlotChanged ? "success" : "info"}
                                    showIcon
                                    style={{ marginTop: 16 }}
                                    action={
                                      isSlotChanged ? (
                                        <Button
                                          size="small"
                                          type="text"
                                          danger
                                          onClick={() => {
                                            // Restore original slot
                                            if (originalSlot) {
                                              setSelectedSlot(originalSlot);
                                            } else {
                                              setSelectedSlot(null);
                                            }
                                            setIsSlotChanged(false);

                                            // Update bay slot state
                                            if (selectedBay) {
                                              setBaySlotStates((prev) => ({
                                                ...prev,
                                                [selectedBay.bay_id]: {
                                                  slot: originalSlot,
                                                  isChanged: false,
                                                },
                                              }));
                                            }
                                          }}
                                        >
                                          Hủy chọn slot
                                        </Button>
                                      ) : null
                                    }
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        ),
                      },
                    ]
                  : []),
                // Show onsite tab only for walk-in bookings
                ...(isWalkInBooking
                  ? [
                      {
                        key: "onsite",
                        label: (
                          <span>🔧 Xử lý tại chỗ ({onSiteBays.length})</span>
                        ),
                        children: renderBayRecommendation(),
                      },
                    ]
                  : []),
              ]}
            />
          )}
        </Card>

        <Card size="small" title="Thông tin bổ sung">
          <Form.Item name="notes" label="Ghi chú">
            <MemoizedTextArea
              rows={3}
              placeholder="Nhập ghi chú cho lịch đặt..."
            />
          </Form.Item>
        </Card>
      </div>
    );
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CalendarOutlined style={{ color: "#1890ff" }} />
          <span>Cập nhật booking - {initialData.booking_code}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      width={1400}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
    >
      <Tabs
        defaultActiveKey="status"
        items={[
          {
            key: "status",
            label: <span>📊 Thông tin & Thao tác</span>,
            children: renderBookingStatusTab(),
          },
          {
            key: "update",
            label: <span>✏️ Cập nhật thông tin</span>,
            children: (
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  priority: "NORMAL",
                }}
              >
                {renderAllContent()}
                <div style={{ marginTop: 24, textAlign: "right" }}>
                  <Button
                    type="primary"
                    loading={
                      loading ||
                      updateBookingMutation.isPending ||
                      createBookingWithSlotMutation.isPending
                    }
                    onClick={handleSubmit}
                    disabled={
                      !selectedBranch ||
                      selectedItems.length === 0 ||
                      (customerType === "existing" && !selectedCustomer) ||
                      (customerType === "new" && !newCustomer)
                    }
                  >
                    Cập nhật booking
                  </Button>
                </div>
              </Form>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default UpdateBookingModal;
