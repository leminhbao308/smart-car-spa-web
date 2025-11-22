import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
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
  App,
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
import {
  BookingInfoDto,
  BookingStatus,
  BookingType,
  CreateBookingItemRequest,
} from "@/lib/api/types";
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
import { useServicesWithInventory } from "@/lib/api/hooks/useServicesWithInventory";
import { UserManagementInfo } from "@/lib/api/types/user.types";
import { VehicleProfileDisplay } from "@/lib/api/types/vehicle-profile.types";
import { BranchDisplay } from "@/lib/api/types/branch.types";
import { PriceBookItem } from "@/lib/api/types/price-book.types";
import { ServiceBay } from "@/lib/api/types/service-bay.types";
import { BookingScheduleService } from "@/lib/api/services/booking-schedule.service";
import { AvailableTimeRangesResponse } from "@/lib/api/types/booking.types";
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

// Priority config removed - priority field no longer exists

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

// Types for slot selection - using time-range-based system
interface SlotInfo {
  time: string; // HH:mm format
  isAvailable: boolean;
}

interface SelectedSlot {
  bayId: string;
  bayName: string;
  date: string;
  startTime: string;
  serviceDurationMinutes: number;
}

// Helper function to detect booking type with fallback to booking_code
const detectBookingType = (
  booking: BookingInfoDto
): {
  isWalkIn: boolean;
  isSlot: boolean;
  bookingType: BookingType | null;
} => {
  // First, try to use booking_type from backend
  if (booking.booking_type === BookingType.WALK_IN) {
    return { isWalkIn: true, isSlot: false, bookingType: BookingType.WALK_IN };
  }
  if (booking.booking_type === BookingType.SCHEDULED) {
    return {
      isWalkIn: false,
      isSlot: true,
      bookingType: BookingType.SCHEDULED,
    };
  }

  // Fallback: detect from booking_code if booking_type is undefined
  if (booking.booking_code) {
    if (booking.booking_code.startsWith("WALK-IN-")) {
      return {
        isWalkIn: true,
        isSlot: false,
        bookingType: BookingType.WALK_IN,
      };
    }
    if (booking.booking_code.startsWith("BK-")) {
      return {
        isWalkIn: false,
        isSlot: true,
        bookingType: BookingType.SCHEDULED,
      };
    }
  }

  // Default: unknown type
  return { isWalkIn: false, isSlot: false, bookingType: null };
};

const UpdateBookingModal: React.FC<UpdateBookingModalProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
  loading = false,
  onRefresh,
}) => {
  const { message } = App.useApp();
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
  const [originalItems, setOriginalItems] = useState<PriceBookItem[]>([]); // Store original services from initialData
  const [originalTotalDuration, setOriginalTotalDuration] = useState<number>(0); // Store original total duration
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

  // Track if form has been initialized to prevent resetting when dependencies change
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Ref to track if we're currently resetting slot to prevent infinite loops
  const isResettingSlotRef = useRef(false);
  const lastResetDurationRef = useRef<number | null>(null);

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
  const [timeRangesData, setTimeRangesData] =
    useState<AvailableTimeRangesResponse | null>(null);

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
      console.warn(" queueItems is not an array:", queueItems);
      return [];
    }
    return queueItems;
  }, [queueItems]);

  // Load bay recommendation for existing walk-in booking
  const loadBayRecommendation = useCallback(
    async (bayId: string) => {
      if (!selectedBranch || !totalDuration) return;

      console.log(" Loading bay recommendation for existing booking:", bayId);
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
        // Include current booking ID to ensure it appears in queue even if scheduledEndAt < currentTime
        const isOriginalBay = bayId === initialData?.bay_id;
        const includeBookingId = isOriginalBay ? initialData?.booking_id : undefined;
        const queue = await getBayQueue(bayId, bookingDate, includeBookingId);
        
        // Don't filter out current booking when loading queue for the original bay
        // The current booking should be visible in the queue for its original bay
        // Only filter when selecting a different bay
        console.log(" Queue loaded for original bay (including current booking):", {
          queueLength: queue?.length || 0,
          currentBookingId: initialData?.booking_id,
          bayId: bayId,
          isOriginalBay: isOriginalBay,
          includeBookingId: includeBookingId,
        });
        
        // Filter out current booking only if selecting a different bay
        const filteredQueue = initialData?.booking_id && !isOriginalBay
          ? (queue as any[]).filter(
              (item: any) => item.booking_id !== initialData.booking_id
            )
          : queue;
        
        setQueueItems(filteredQueue as unknown as typeof queueItems);
      } catch (error) {
        console.log(" Error loading bay recommendation:", error);
      } finally {
        setIsLoadingRecommendation(false);
      }
    },
    [selectedBranch, totalDuration, bookingDate, recommendBay, getBayQueue, initialData]
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
  const allPriceBookServices = useMemo(() => {
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
              `✗ Skipped item: ${item.item_name || "Unknown"} - ${
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

  // Extract services from PriceBookItems for inventory check
  const servicesForInventoryCheck = useMemo(() => {
    return allPriceBookServices
      .map((item) => item.service)
      .filter(
        (service): service is NonNullable<typeof service> =>
          service !== undefined
      );
  }, [allPriceBookServices]);

  // Check inventory for services when branch is selected
  const {
    data: servicesWithInventory,
    isLoading: isLoadingInventory,
  } = useServicesWithInventory({
    services: servicesForInventoryCheck,
    branchId: selectedBranch?.branch_id || null,
    enabled: !!selectedBranch && servicesForInventoryCheck.length > 0,
  });

  // Filter PriceBookItems to only show services with enough inventory
  const availableServices = useMemo(() => {
    // If no branch selected, show all services (no inventory check)
    if (!selectedBranch) {
      return allPriceBookServices;
    }

    // If inventory check is still loading, show all services temporarily
    // (to avoid flickering and allow user to see services while loading)
    if (isLoadingInventory) {
      return allPriceBookServices;
    }

    // If no services with inventory data, return empty array
    // This means all services are out of stock
    if (!servicesWithInventory || servicesWithInventory.length === 0) {
      // Only return empty if we actually have services to check
      // (if servicesForInventoryCheck is empty, it means no services have products, so show all)
      if (servicesForInventoryCheck.length === 0) {
        return allPriceBookServices;
      }
      return [];
    }

    // Create a Set of service IDs that have enough inventory
    const availableServiceIds = new Set(
      servicesWithInventory.map((s) => s.service_id)
    );

    // Filter PriceBookItems to only include services with enough inventory
    return allPriceBookServices.filter((item) => {
      const serviceId = item.service?.service_id;
      // If service doesn't have service_id, show it (assume it doesn't need inventory)
      if (!serviceId) {
        return true;
      }
      // Only show if service passed inventory check
      return availableServiceIds.has(serviceId);
    });
  }, [
    allPriceBookServices,
    selectedBranch,
    servicesWithInventory,
    isLoadingInventory,
    servicesForInventoryCheck.length,
  ]);

  // Load available time ranges from API and convert to slots
  const loadAvailableSlots = useCallback(async () => {
    // Only load if we have all required data
    if (!selectedBranch || !selectedBay || !bookingDate || totalDuration <= 0) {
      // Clear slots if we don't have all required data
      if (!selectedBranch || !selectedBay || !bookingDate) {
        setAvailableSlots([]);
        setTimeRangesData(null);
      }
      return;
    }

    setLoadingSlots(true);
    try {
      console.log(" Loading available slots:", {
        bay_id: selectedBay.bay_id,
        date: bookingDate,
        duration_minutes: totalDuration,
      });

      // Get available time ranges from backend
      const timeRangesResponse =
        await BookingScheduleService.getAvailableTimeRanges({
          bay_id: selectedBay.bay_id,
          date: bookingDate,
          duration_minutes: totalDuration,
        });

      console.log("📊 Backend time ranges response (UpdateBookingModal):", {
        working_hours: timeRangesResponse.working_hours,
        available_time_ranges: timeRangesResponse.available_time_ranges,
        rangesCount: timeRangesResponse.available_time_ranges?.length || 0,
        rangesDetail: timeRangesResponse.available_time_ranges?.map(
          (range) => ({
            start_time: range.start_time,
            end_time: range.end_time,
            note: `Range: ${range.start_time} to ${range.end_time}`,
          })
        ),
        requestedDuration: totalDuration,
        currentBooking: initialData?.booking_id
          ? {
              booking_id: initialData.booking_id,
              scheduled_start_at: initialData.scheduled_start_at,
              scheduled_end_at: initialData.scheduled_end_at,
              note: "Current booking time slot - backend should exclude this when calculating available ranges",
            }
          : null,
      });

      setTimeRangesData(timeRangesResponse);

      // Convert time ranges to slots for UI display
      if (
        timeRangesResponse.working_hours &&
        timeRangesResponse.available_time_ranges
      ) {
        const slots = BookingScheduleService.convertTimeRangesToSlots(
          timeRangesResponse.available_time_ranges,
          timeRangesResponse.working_hours,
          totalDuration,
          30 // 30 minutes interval
        );
        console.log(" Loaded slots:", slots.length);

        // Debug: Check specific slots
        const slot8_00 = slots.find((s) => s.time === "08:00");
        const slot8_30 = slots.find((s) => s.time === "08:30");
        const slot9_00 = slots.find((s) => s.time === "09:00");
        const slot17_30 = slots.find((s) => s.time === "17:30");
        console.log(" Slot availability check:", {
          slot8_00: slot8_00
            ? { time: slot8_00.time, isAvailable: slot8_00.isAvailable }
            : null,
          slot8_30: slot8_30
            ? { time: slot8_30.time, isAvailable: slot8_30.isAvailable }
            : null,
          slot9_00: slot9_00
            ? { time: slot9_00.time, isAvailable: slot9_00.isAvailable }
            : null,
          slot17_30: slot17_30
            ? { time: slot17_30.time, isAvailable: slot17_30.isAvailable }
            : null,
          note: "If slot 8:30 is unavailable but 17:30 is available, check backend response for range covering 8:30-9:00",
        });

        setAvailableSlots(slots);
      } else {
        console.log(" No working hours or time ranges in response");
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("❌ Error loading available time ranges:", error);
      setAvailableSlots([]);
      setTimeRangesData(null);
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedBranch, selectedBay, bookingDate, totalDuration]);

  // Load slots when dependencies change
  useEffect(() => {
    loadAvailableSlots();
  }, [loadAvailableSlots]);

  // Reset slot when booking date changes and slot date doesn't match
  useEffect(() => {
    if (selectedSlot && bookingDate && selectedSlot.date !== bookingDate) {
      console.log(" Booking date changed, resetting slot:", {
        slotDate: selectedSlot.date,
        newBookingDate: bookingDate,
      });
      setSelectedSlot(null);
      setIsSlotChanged(false);
      // Clear slot from baySlotStates
      if (selectedBay) {
        setBaySlotStates((prev) => ({
          ...prev,
          [selectedBay.bay_id]: {
            slot: null,
            isChanged: false,
          },
        }));
      }
    }
  }, [bookingDate, selectedSlot, selectedBay]);

  // Reset slot when totalDuration changes and current slot is not suitable
  // Only reset if slot is not the original slot (user has already selected a slot)
  useEffect(() => {
    // Don't run during initialization - only when user makes changes
    if (!isFormInitialized || isResettingSlotRef.current) {
      return;
    }

    // Prevent infinite loop: only reset once per duration change
    if (lastResetDurationRef.current === totalDuration) {
      return;
    }

    if (selectedSlot && totalDuration > 0 && selectedBranch && selectedBay) {
      // Check if current slot is still suitable for new duration
      // For original slot, compare with total slot time (number of slots × 60 minutes)
      // For new slot, compare with selected slot duration
      const isOriginalSlot =
        originalSlot &&
        originalSlot.bayId === selectedSlot.bayId &&
        originalSlot.startTime === selectedSlot.startTime &&
        originalSlot.date === selectedSlot.date;

      let slotDuration: number;
      if (isOriginalSlot) {
        // Calculate total time from scheduled_start_at and scheduled_end_at (actual time range)
        const originalSlotTime = calculateOriginalSlotTime();
        if (originalSlotTime && originalSlotTime > 0) {
          slotDuration = originalSlotTime;
        } else {
          // Fallback: use selected slot duration
          slotDuration = selectedSlot.serviceDurationMinutes;
        }
      } else {
        // For new slot, use selected slot duration
        slotDuration = selectedSlot.serviceDurationMinutes;
      }

      // Only reset if:
      // 1. New duration exceeds current slot duration
      // 2. Slot is different from original slot (user has changed it) OR duration has increased from original
      const originalDuration =
        originalTotalDuration || originalSlot?.serviceDurationMinutes || 0;
      const durationIncreased = totalDuration > originalDuration;

      if (
        totalDuration > slotDuration &&
        (!isOriginalSlot || durationIncreased)
      ) {
        // Mark that we're resetting to prevent loops
        isResettingSlotRef.current = true;
        lastResetDurationRef.current = totalDuration;

        console.log(" Service duration increased, resetting slot:", {
          currentSlotDuration: slotDuration,
          newTotalDuration: totalDuration,
          isOriginalSlot,
          originalDuration,
          slotInfo: selectedSlot,
        });

        setSelectedSlot(null);
        setIsSlotChanged(true); // Mark as changed so user knows they need to select new slot

        // Clear slot from baySlotStates
        if (selectedBay) {
          setBaySlotStates((prev) => ({
            ...prev,
            [selectedBay.bay_id]: {
              slot: null,
              isChanged: true,
            },
          }));
        }

        // Reset the flag after a short delay to allow state updates to complete
        setTimeout(() => {
          isResettingSlotRef.current = false;
        }, 100);
      }
      // If duration changed but slot is still valid (and it's a new slot, not original)
      // Only update slot duration for new slots, not original slots
      else if (!isOriginalSlot && totalDuration !== slotDuration) {
        console.log(" Service duration changed, updating slot duration:", {
          currentSlotDuration: slotDuration,
          newTotalDuration: totalDuration,
          isOriginalSlot,
        });
        // Update slot duration to match totalDuration (actual service duration)
        // Only for new slots, not original slots
        setSelectedSlot((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            serviceDurationMinutes: totalDuration,
          };
        });
      }
    }
  }, [
    totalDuration,
    selectedSlot,
    selectedBranch,
    selectedBay,
    isFormInitialized,
    originalSlot,
    originalTotalDuration,
  ]);

  // Sync selectedVehicle from form value when vehicleId changes in form
  useEffect(() => {
    if (form && allVehicles.length > 0 && isFormInitialized) {
      const formVehicleId = form.getFieldValue("vehicleId");
      if (formVehicleId) {
        const vehicle = allVehicles.find((v) => v.vehicle_id === formVehicleId);
        if (
          vehicle &&
          (!selectedVehicle || selectedVehicle.vehicle_id !== formVehicleId)
        ) {
          console.log(
            " Syncing selectedVehicle from form value:",
            vehicle.vehicle_id
          );
          setSelectedVehicle(vehicle);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, allVehicles, isFormInitialized]);

  // Auto recommend bay for walk-in booking
  useEffect(() => {
    const getBayRecommendation = async () => {
      console.log(" Checking bay recommendation conditions:", {
        selectedBranch: !!selectedBranch,
        selectedItems: selectedItems.length,
        totalDuration,
        branchId: selectedBranch?.branch_id,
      });

      if (!selectedBranch || selectedItems.length === 0 || totalDuration <= 0) {
        console.log(" Missing required data for bay recommendation");
        setBayRecommendation(null);
        setQueueItems([]);
        return;
      }

      console.log(" Starting bay recommendation...");
      setIsLoadingRecommendation(true);
      try {
        const recommendation = await recommendBay(
          selectedBranch.branch_id,
          totalDuration,
          "GENERAL",
          "NORMAL",
          bookingDate
        );

        console.log(" Bay recommendation received:", recommendation);
        console.log(" Recommendation structure:", {
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
            " Loading queue for bay:",
            recommendation.recommended_bay.bay_id
          );
          const queue = await getBayQueue(
            recommendation.recommended_bay.bay_id,
            bookingDate
          );
          console.log(" Queue loaded:", queue);
          console.log(" Queue structure:", {
            queueType: typeof queue,
            queueIsArray: Array.isArray(queue),
            queueLength: queue?.length,
            queueFirstItem: queue?.[0],
          });
          setQueueItems(queue as unknown as typeof queueItems);
        } else {
          console.log(" No queue data available");
          setQueueItems([]);
        }
      } catch (error) {
        console.log(" Error getting bay recommendation:", error);
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

  // Check if slot is suitable for service duration
  // With time-range-based system, availability is already calculated in convertTimeRangesToSlots
  const isSlotSuitable = useCallback((slot: SlotInfo) => {
    // Slot is suitable if it's available
    // convertTimeRangesToSlots already validates that slot + serviceDuration fits within range
    return slot.isAvailable;
  }, []);

  // Calculate original slot time from scheduled_start_at and scheduled_end_at (actual time range)
  const calculateOriginalSlotTime = useCallback(() => {
    const { isSlot: isSlotBooking } = detectBookingType(initialData);
    
    if (!isSlotBooking) {
      return null;
    }

    // Use actual time range from scheduled_start_at and scheduled_end_at
    if (initialData.scheduled_start_at && initialData.scheduled_end_at) {
      const startTime = dayjs(initialData.scheduled_start_at);
      const endTime = dayjs(initialData.scheduled_end_at);
      const diffMinutes = endTime.diff(startTime, 'minute');
      
      if (diffMinutes > 0) {
        return diffMinutes;
      }
    }

    // Fallback: use estimated_duration_minutes if available
    if (initialData.estimated_duration_minutes) {
      return initialData.estimated_duration_minutes;
    }

    // Last fallback: use originalTotalDuration
    return originalTotalDuration || null;
  }, [initialData, originalTotalDuration]);

  // Check if service duration exceeds original duration
  // NOTE: Không còn ràng buộc về thời gian tối đa cho cả slot và walk-in booking
  // Backend sẽ kiểm tra conflict và đề xuất slot/bay mới nếu cần
  // Giữ lại logic này chỉ để hiển thị warning (không disable button)
  const isDurationExceedsOriginal = useMemo(() => {
    const { isSlot: isSlotBooking } = detectBookingType(initialData);

    if (isSlotBooking) {
      // For slot booking: Compare with actual time range from scheduled_start_at and scheduled_end_at
      const totalOriginalSlotTime = calculateOriginalSlotTime();
      
      if (totalOriginalSlotTime && totalOriginalSlotTime > 0) {
        return totalDuration > totalOriginalSlotTime;
      }
    }

    // Walk-in booking: Không còn ràng buộc
    return false;
  }, [totalDuration, calculateOriginalSlotTime, initialData.booking_code]);

  // Check if slot can be selected (available and suitable)
  // NOTE: Không còn disable slot selection khi duration exceeds - backend sẽ kiểm tra và đề xuất slot mới
  const canSelectSlot = useCallback(
    (slot: SlotInfo) => {
      return isSlotSuitable(slot);
    },
    [isSlotSuitable]
  );

  // Initialize form with initial data (only when modal opens or initialData changes)
  useEffect(() => {
    console.log("UpdateBookingModal useEffect triggered:", {
      initialData,
      open,
      isFormInitialized,
    });
    // Only initialize if modal is open and form hasn't been initialized yet, or initialData changed
    if (initialData && open && (!isFormInitialized || initialData.booking_id)) {
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
      const { isWalkIn: isWalkInBookingForLog } =
        detectBookingType(initialData);
      console.log(" Setting booking date:", {
        scheduled_start_at: initialData.scheduled_start_at,
        booking_type: initialData.booking_type,
        booking_code: initialData.booking_code,
        isWalkInBooking: isWalkInBookingForLog,
      });

      // Determine booking type first
      const { isWalkIn: isWalkInBookingForDate } =
        detectBookingType(initialData);

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
          " No booking date set - no scheduled_start_at for slot booking"
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
      console.log(" Initializing services from booking items:", {
        booking_items: initialData.booking_items,
        availableServicesCount: availableServices.length,
      });

      if (initialData.booking_items && initialData.booking_items.length > 0) {
        const services: PriceBookItem[] = [];
        const seenServiceIds = new Set<string>(); // Track already added services

        initialData.booking_items.forEach((item) => {
          console.log(" Processing booking item:", {
            service_id: item.service_id,
            service_name: item.service_name,
            booking_item_id: item.booking_item_id,
          });

          if (item.service_id && !seenServiceIds.has(item.service_id)) {
            // Find the service in price books by service_id
            const priceBookItem = availableServices.find(
              (service) => service.service?.service_id === item.service_id
            );
            if (priceBookItem && !seenServiceIds.has(priceBookItem.item_id)) {
              console.log(" Found matching service by service_id:", {
                item_id: priceBookItem.item_id,
                item_name: priceBookItem.item_name,
                service: priceBookItem.service
                  ? priceBookItem.service.service_name
                  : null,
                duration: priceBookItem.service?.estimated_duration || 60,
                booking_item_id: item.booking_item_id,
              });
              services.push(priceBookItem);
              seenServiceIds.add(item.service_id);
              seenServiceIds.add(priceBookItem.item_id);
            } else {
              console.log(
                "❌ No matching service found or duplicate for service_id:",
                item.service_id
              );
            }
          } else if (!item.service_id && item.service_name) {
            // FALLBACK: Backend trả về service_id null (BUG BACKEND)
            // Tạm thời match bằng service_name để frontend không crash
            console.warn(
              " BACKEND BUG: Booking item has null service_id! Attempting fallback match by service_name:",
              item.service_name
            );
            const priceBookItem = availableServices.find(
              (service) =>
                service.item_name === item.service_name &&
                service.service && // Ensure it's a service, not a product
                !seenServiceIds.has(service.item_id)
            );
            if (priceBookItem) {
              console.log(" Fallback match successful by service_name:", {
                item_id: priceBookItem.item_id,
                item_name: priceBookItem.item_name,
                service: priceBookItem.service
                  ? priceBookItem.service.service_name
                  : null,
                duration: priceBookItem.service?.estimated_duration || 60,
                booking_item_id: item.booking_item_id,
              });
              services.push(priceBookItem);
              if (priceBookItem.service?.service_id) {
                seenServiceIds.add(priceBookItem.service.service_id);
              }
              seenServiceIds.add(priceBookItem.item_id);
            } else {
              console.error(
                "❌ Fallback match failed - cannot find service by service_name:",
                item.service_name,
                "- This booking item will be missing!"
              );
            }
          } else {
            console.warn(
              " Skipping booking item - missing both service_id and service_name:",
              item
            );
          }
        });

        // Remove duplicates by item_id (additional safety check)
        const uniqueServices = services.filter(
          (service, index, self) =>
            index === self.findIndex((s) => s.item_id === service.item_id)
        );

        console.log(" Final services array:", {
          originalCount: services.length,
          uniqueCount: uniqueServices.length,
          services: uniqueServices.map((s) => ({
            item_id: s.item_id,
            item_name: s.item_name,
            duration: s.service?.estimated_duration || 60,
            service: s.service ? s.service.service_name : null,
          })),
        });

        setSelectedItems(uniqueServices);
        setOriginalItems([...uniqueServices]); // Store original services
        calculateTotals(uniqueServices);
        // Calculate and store original total duration
        const originalDuration = uniqueServices.reduce((sum, item) => {
          if (item.service) {
            return sum + (item.service.estimated_duration || 60);
          }
          return sum;
        }, 0);
        setOriginalTotalDuration(originalDuration);

        // Update form value to sync with selectedItems (only item_ids, not null values)
        // This ensures form displays correctly even if backend returns null service_ids
        const serviceItemIds = uniqueServices
          .map((s) => s.item_id)
          .filter((id): id is string => !!id);
        form.setFieldValue("services", serviceItemIds);
      } else {
        console.log(" No booking items found in initialData");
        setOriginalItems([]);
        setOriginalTotalDuration(0);
      }

      // Filter selectedItems to remove services that are no longer available when branch/inventory changes
      // Note: This should run after services are initialized, but also when branch/inventory changes
      // We'll add a separate useEffect for this below

      // Determine if this is a walk-in booking or slot booking
      const {
        isWalkIn: isWalkInBooking,
        isSlot: isSlotBooking,
        bookingType,
      } = detectBookingType(initialData);
      console.log("Booking type detection:", {
        booking_code: initialData.booking_code,
        booking_type: initialData.booking_type,
        detectedType: bookingType,
        isWalkInBooking,
        isSlotBooking,
      });

      // Walk-in and slot booking bay/slot setup will be handled in separate useEffect after data loads

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
          initialData.booking_items
            ?.map((item) => item.service_id)
            .filter((id): id is string => !!id) || [], // Filter out null/undefined to prevent duplicate key error
        notes: initialData.notes,
      });

      // Bay and slot will be set in separate useEffect after serviceBays are loaded

      // If services were not set above, set original values from initialData
      if (
        !initialData.booking_items ||
        initialData.booking_items.length === 0
      ) {
        const originalDuration = initialData.estimated_duration_minutes || 0;
        setOriginalTotalDuration(originalDuration);
      }

      setTotalPrice(initialData.total_price || 0);
      // Don't set totalDuration from initialData here - it will be set by calculateTotals
      // after selectedItems are loaded. This ensures we use actual service duration, not slot duration
      // If no booking_items, calculate from estimated_duration_minutes minus buffer (if present)
      if (
        !initialData.booking_items ||
        initialData.booking_items.length === 0
      ) {
        const serviceDuration = initialData.estimated_duration_minutes || 0;
        setTotalDuration(serviceDuration);
      }
      // Otherwise, totalDuration will be set by calculateTotals when selectedItems are loaded
      setIsSlotChanged(false); // Reset slot change flag
      setIsFormInitialized(true);

      // Reset refs when initializing
      isResettingSlotRef.current = false;
      lastResetDurationRef.current = null;
      // setCurrentStep(0); // Start from step 1 for edit mode
    } else if (!open) {
      // Reset initialization flag when modal closes
      setIsFormInitialized(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialData?.booking_id, // Only depend on booking_id to detect data change
    open,
    isFormInitialized,
    // Other dependencies are intentionally excluded to prevent resetting user changes
  ]);

  // Separate useEffect to set bay and slot after serviceBays are loaded
  useEffect(() => {
    if (!isFormInitialized || !initialData || !open || !selectedBranch) {
      return;
    }

    const { isSlot: isSlotBookingType, isWalkIn: isWalkInBookingType } =
      detectBookingType(initialData);

    // Set bay for slot booking (need serviceBays to be loaded)
    if (isSlotBookingType && initialData.bay_id) {
      if (isLoadingServiceBays) {
        // Wait for serviceBays to load
        return;
      }

      // First try to find in filtered serviceBays
      let bay = serviceBays.find(
        (b: ServiceBay) => b.bay_id === initialData.bay_id
      );

      // If not found in filtered list, try allServiceBays as fallback
      // This ensures we can set the bay even if it doesn't pass the allow_booking filter
      if (!bay && allServiceBays && allServiceBays.length > 0) {
        bay = allServiceBays.find(
          (b: ServiceBay) => b.bay_id === initialData.bay_id
        );
      }

      if (bay && !selectedBay) {
        console.log("🔧 Setting selectedBay from initialData:", bay);
        setSelectedBay(bay);
      } else if (initialData.bay_id && !bay) {
        console.warn(" Bay not found:", {
          bayId: initialData.bay_id,
          bayName: initialData.bay_name,
          serviceBaysLength: serviceBays.length,
          allServiceBaysLength: allServiceBays?.length || 0,
        });
      }
    }

    // Set slot for slot booking (after bay is set)
    // Only set if slot hasn't been set yet and form is initialized
    if (
      isSlotBookingType &&
      initialData.scheduled_start_at &&
      initialData.bay_id &&
      selectedBay &&
      !selectedSlot &&
      isFormInitialized
    ) {
      const slotDate = dayjs(initialData.scheduled_start_at).format(
        "YYYY-MM-DD"
      );
      const slotTime = initialData.scheduled_start_at
        ? dayjs(initialData.scheduled_start_at).format("HH:mm")
        : "";

      // Calculate actual service duration from booking items (not slot duration which may include buffer)
      const actualServiceDuration =
        selectedItems.length > 0
          ? selectedItems.reduce((sum, item) => {
              if (item.service) {
                return sum + (item.service.estimated_duration || 60);
              }
              return sum;
            }, 0)
          : initialData.estimated_duration_minutes || 60;

      const initialSlot = {
        bayId: initialData.bay_id || "",
        bayName: initialData.bay_name || "",
        date: slotDate,
        startTime: slotTime || "",
        serviceDurationMinutes: actualServiceDuration,
      };

      console.log("🔧 Setting selectedSlot from initialData:", initialSlot);
      setSelectedSlot(initialSlot);

      // Only set originalSlot if it hasn't been set yet (first time initialization)
      if (!originalSlot) {
        setOriginalSlot(initialSlot); // Store original slot for restoration
      }

      // Save initial slot state for the bay (only if not already set)
      if (selectedBay.bay_id && !baySlotStates[selectedBay.bay_id]?.slot) {
        setBaySlotStates((prev) => ({
          ...prev,
          [String(initialData.bay_id)]: {
            slot: initialSlot,
            isChanged: false,
          },
        }));
      }
    }

    // Set walk-in bay (doesn't need serviceBays)
    if (isWalkInBookingType && initialData.bay_id && !selectedWalkInBay) {
      console.log(
        "🔧 Setting selectedWalkInBay from initialData:",
        initialData.bay_id
      );
      setSelectedWalkInBay(initialData.bay_id);
      setManualBaySelection(true);

      // Save initial walk-in bay state
      if (initialData.bay_id) {
        setBayWalkInStates((prev) => ({
          ...prev,
          [String(initialData.bay_id)]: {
            selectedWalkInBay: initialData.bay_id || null,
            bayRecommendation: null,
            queueItems: [],
            manualBaySelection: true,
          },
        }));
      }

      // Load bay recommendation and queue
      loadBayRecommendation(initialData.bay_id);
    }
  }, [
    isFormInitialized,
    initialData,
    open,
    selectedBranch,
    serviceBays,
    allServiceBays,
    isLoadingServiceBays,
    selectedBay,
    selectedSlot,
    selectedWalkInBay,
    originalSlot,
    baySlotStates,
    loadBayRecommendation,
    selectedItems,
  ]);

  // Filter selectedItems to remove services that are no longer available when branch/inventory changes
  useEffect(() => {
    if (!selectedBranch || isLoadingInventory || !servicesWithInventory) {
      return;
    }

    // Create a Set of available service IDs
    const availableServiceIds = new Set(
      servicesWithInventory.map((s) => s.service_id)
    );

    // Filter selectedItems to only keep services that are still available
    const filteredSelectedItems = selectedItems.filter((item) => {
      if (!item.service) return false;

      // Check if service is still available in the new branch
      const isStillAvailable = availableServiceIds.has(item.service.service_id);

      if (!isStillAvailable) {
        console.log(
          `[UpdateBookingModal] Removing service ${item.service.service_name} from selectedItems - no longer available in branch ${selectedBranch.branch_name}`
        );
      }

      return isStillAvailable;
    });

    // If any items were removed, update selectedItems and form
    if (filteredSelectedItems.length !== selectedItems.length) {
      setSelectedItems(filteredSelectedItems);
      form.setFieldsValue({
        services: filteredSelectedItems.map((item) => item.item_id),
      });
      // Recalculate totals with filtered items
      calculateTotals(filteredSelectedItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch, servicesWithInventory, isLoadingInventory, selectedItems, form]);

  const calculateTotals = useCallback((items: PriceBookItem[]) => {
    // Remove duplicates by item_id to prevent double counting
    const uniqueItems = items.filter(
      (item, index, self) =>
        index === self.findIndex((i) => i.item_id === item.item_id)
    );

    console.log("🧮 Calculating totals:", {
      originalItemsCount: items.length,
      uniqueItemsCount: uniqueItems.length,
      itemsData: uniqueItems.map((item) => ({
        item_id: item.item_id,
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

    const price = uniqueItems.reduce(
      (sum, item) => sum + (item.fixed_price || 0),
      0
    );
    const duration = uniqueItems.reduce((sum, item) => {
      if (item.service) {
        const duration = item.service.estimated_duration || 60;
        console.log(`  + ${item.item_name}: ${duration} phút`);
        return sum + duration;
      }
      return sum;
    }, 0);

    console.log("💰 Calculated totals:", {
      price,
      duration,
      fromItems: uniqueItems.length,
    });
    setTotalPrice(price);
    setTotalDuration(duration);
  }, []);

  // Handle service selection change
  const handleServiceChange = useCallback(
    (selectedServiceIds: string[]) => {
      console.log(" Service selection changed (from Select component):", {
        selectedServiceIds,
        selectedServiceIdsCount: selectedServiceIds.length,
        currentSelectedItemsCount: selectedItems.length,
        availableServicesCount: availableServices.length,
      });

      // Remove duplicates from selectedServiceIds
      const uniqueServiceIds = Array.from(new Set(selectedServiceIds));

      const selectedServices = availableServices.filter((service) =>
        uniqueServiceIds.includes(service.item_id)
      );

      // Ensure no duplicates in selectedServices
      const uniqueSelectedServices = selectedServices.filter(
        (service, index, self) =>
          index === self.findIndex((s) => s.item_id === service.item_id)
      );

      // Log comparison with previous state to detect deletions
      const previousServiceIds = new Set(
        selectedItems
          .map((item) => item.service?.service_id)
          .filter((id): id is string => !!id)
      );
      const newServiceIds = new Set(
        uniqueSelectedServices
          .map((item) => item.service?.service_id)
          .filter((id): id is string => !!id)
      );

      // Find removed services
      const removedServiceIds = Array.from(previousServiceIds).filter(
        (id) => !newServiceIds.has(id)
      );

      console.log(" Selected services:", {
        uniqueIdsCount: uniqueServiceIds.length,
        selectedServicesCount: uniqueSelectedServices.length,
        previousCount: selectedItems.length,
        services: uniqueSelectedServices.map((s) => ({
          item_id: s.item_id,
          item_name: s.item_name,
          service_id: s.service?.service_id,
          duration: s.service?.estimated_duration || 60,
        })),
        removedServiceIds:
          removedServiceIds.length > 0 ? removedServiceIds : undefined,
      });

      setSelectedItems(uniqueSelectedServices);
      calculateTotals(uniqueSelectedServices);
    },
    [availableServices, calculateTotals, selectedItems]
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
      console.log("🏢 Branch change:", {
        branchId,
        currentSelectedBranch: selectedBranch?.branch_id,
        currentSelectedBay: selectedBay?.bay_id,
        currentSelectedSlot: selectedSlot,
        currentSelectedVehicle: selectedVehicle?.vehicle_id,
        formVehicleId: form?.getFieldValue("vehicleId"),
      });
      const branch = branches.find((b) => b.branch_id === branchId);
      setSelectedBranch(branch || null);
      // Reset bay and slot when branch changes
      setSelectedBay(null);
      setSelectedSlot(null);
      setAvailableSlots([]);
      // Clear bay slot states when branch changes to prevent restoring old slots
      setBaySlotStates({});
      setBayWalkInStates({});
      setIsSlotChanged(false);
      setOriginalSlot(null);
      // Update form value
      if (form) {
        const currentVehicleId = form.getFieldValue("vehicleId");
        form.setFieldsValue({
          branchId: branchId,
          serviceBayId: undefined,
        });

        // Restore vehicle from form value if it exists and vehicle is in allVehicles
        if (currentVehicleId && allVehicles.length > 0) {
          const vehicle = allVehicles.find(
            (v) => v.vehicle_id === currentVehicleId
          );
          if (vehicle) {
            console.log(
              " Restoring vehicle from form value:",
              vehicle.vehicle_id
            );
            setSelectedVehicle(vehicle);
          } else {
            console.log(
              " Vehicle not found in allVehicles:",
              currentVehicleId
            );
          }
        }
      }
    },
    [
      branches,
      form,
      selectedBranch,
      selectedBay,
      selectedSlot,
      selectedVehicle,
      allVehicles,
    ]
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

      // IMPORTANT: Always reset slot when changing bay
      // Slot from old bay is not valid for new bay
      setSelectedSlot(null);
      setIsSlotChanged(false);

      setSelectedBay(bay || null);

      // Restore slot state for the new bay, but only if it matches current branch and date
      // Only restore if the slot actually belongs to the new bay
      if (bay && baySlotStates[bay.bay_id]) {
        const bayState = baySlotStates[bay.bay_id];
        // Only restore slot if it belongs to current branch and date AND the new bay
        if (
          bayState.slot &&
          bayState.slot.bayId === bay.bay_id && // Ensure slot belongs to the new bay
          bayState.slot.date === bookingDate &&
          selectedBranch &&
          bay.branch_id === selectedBranch.branch_id
        ) {
          console.log(" Restoring slot for bay:", {
            bayId: bay.bay_id,
            slot: bayState.slot,
            bookingDate,
            slotDate: bayState.slot.date,
            branchId: bay.branch_id,
            selectedBranchId: selectedBranch.branch_id,
          });
          setSelectedSlot(bayState.slot);
          setIsSlotChanged(bayState.isChanged);
        } else {
          console.log(" Not restoring slot - mismatch:", {
            hasSlot: !!bayState.slot,
            slotBayId: bayState.slot?.bayId,
            currentBayId: bay.bay_id,
            slotDate: bayState.slot?.date,
            currentBookingDate: bookingDate,
            bayBranchId: bay.branch_id,
            selectedBranchId: selectedBranch?.branch_id,
            branchMatch: selectedBranch
              ? bay.branch_id === selectedBranch.branch_id
              : false,
          });
          // Already reset above, no need to reset again
        }
      }
      // If no state found, slot is already reset above

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
      bookingDate,
      selectedBranch,
    ]
  );

  // Handle slot selection (same logic as BookingModal)
  const handleSlotSelect = useCallback(
    (slot: SlotInfo) => {
      // NOTE: Không còn chặn slot selection khi duration exceeds - backend sẽ kiểm tra và đề xuất slot mới
      if (canSelectSlot(slot) && selectedBay) {
        const newSlot = {
          bayId: selectedBay.bay_id,
          bayName: selectedBay.bay_name,
          date: bookingDate,
          startTime: slot.time,
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
    [
      canSelectSlot,
      bookingDate,
      totalDuration,
      selectedBay,
      isDurationExceedsOriginal,
      message,
    ]
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

  // Helper function to build booking_items array for API
  const buildBookingItemsArray = useCallback((): CreateBookingItemRequest[] => {
    const bookingItems: CreateBookingItemRequest[] = [];

    // Get service IDs from original and selected items
    const originalServiceIds = new Set(
      originalItems
        .map((item) => item.service?.service_id)
        .filter((id): id is string => !!id)
    );
    const selectedServiceIds = new Set(
      selectedItems
        .map((item) => item.service?.service_id)
        .filter((id): id is string => !!id)
    );

    console.log(" Building booking_items array:", {
      originalServiceIds: Array.from(originalServiceIds),
      selectedServiceIds: Array.from(selectedServiceIds),
      originalItemsCount: originalItems.length,
      selectedItemsCount: selectedItems.length,
      originalItems: originalItems.map((i) => ({
        item_name: i.item_name,
        service_id: i.service?.service_id,
      })),
      selectedItems: selectedItems.map((i) => ({
        item_name: i.item_name,
        service_id: i.service?.service_id,
      })),
    });

    // Step 1: Handle DELETE operations (items in original but not in selected)
    // Backend processes DELETE first, so we add them first
    // Use service_id only for deletion (not booking_item_id)
    originalServiceIds.forEach((serviceId) => {
      if (!selectedServiceIds.has(serviceId) && serviceId) {
        // Item needs to be deleted - use service_id only
        const originalItem = originalItems.find(
          (item) => item.service?.service_id === serviceId
        );
        // service_name is required in CreateBookingItemRequest, so we need to include it
        bookingItems.push({
          service_id: serviceId,
          service_name:
            originalItem?.service?.service_name ||
            originalItem?.item_name ||
            "",
          operation: "DELETE",
        });
        console.log("🗑️ Adding DELETE item (by service_id):", {
          service_id: serviceId,
          service_name:
            originalItem?.service?.service_name || originalItem?.item_name,
          reason: "Item exists in original but not in selected",
        });
      }
    });

    // Step 2: Handle ADD/UPDATE operations (items in selected)
    // For items that exist in both original and selected, it's an UPDATE
    // For items only in selected, it's an ADD
    selectedItems.forEach((item) => {
      const serviceId = item.service?.service_id;
      if (!serviceId) {
        console.warn(" Skipping item without service_id:", item);
        return;
      }

      const isUpdate = originalServiceIds.has(serviceId);
      const originalItem = originalItems.find(
        (orig) => orig.service?.service_id === serviceId
      );

      if (isUpdate && originalItem) {
        // UPDATE: Send service_id and service_name
        const bookingItem: CreateBookingItemRequest = {
          service_id: serviceId,
          service_name: item.service?.service_name || item.item_name, // REQUIRED - Use service_name from service object if available
          service_description: item.service?.description,
        };
        bookingItems.push(bookingItem);
        console.log("✏️ Adding UPDATE item:", {
          service_id: serviceId,
          service_name: item.service?.service_name || item.item_name,
        });
      } else {
        // ADD: New item - send service_id and service_name
        const bookingItem: CreateBookingItemRequest = {
          service_id: serviceId,
          service_name: item.service?.service_name || item.item_name, // REQUIRED - Use service_name from service object if available
          service_description: item.service?.description,
        };
        bookingItems.push(bookingItem);
        console.log("➕ Adding NEW item:", {
          service_id: serviceId,
          service_name: item.service?.service_name || item.item_name,
          reason: "Item exists in selected but not in original",
        });
      }
    });

    console.log("📦 Final booking_items array:", bookingItems);
    return bookingItems;
  }, [originalItems, selectedItems]);

  // Handle submit
  const handleSubmit = async () => {
    try {
      console.log(" Starting handleSubmit...");
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

      // Determine booking type with fallback to booking_code
      const { isWalkIn: isWalkInBooking, isSlot: isSlotBooking } =
        detectBookingType(initialData);

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
        console.log(" Missing required information for booking");
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

        // Note: Không còn ràng buộc về thời gian tối đa cho walk-in booking
        // Backend sẽ kiểm tra và đề xuất bay khác nếu cần

        // Validate: Check inventory for newly added services
        if (selectedBranch && servicesWithInventory && selectedItems.length > 0) {
          const availableServiceIds = new Set(
            servicesWithInventory.map((s) => s.service_id)
          );

          // Check if any selected service doesn't have enough inventory
          const servicesWithoutInventory = selectedItems.filter((item) => {
            const serviceId = item.service?.service_id;
            if (!serviceId) return false; // Skip items without service_id
            
            // Check if this is a new service (not in originalItems)
            const isNewService = !originalItems.some(
              (orig) => orig.service?.service_id === serviceId
            );
            
            // Only validate new services
            if (isNewService && !availableServiceIds.has(serviceId)) {
              return true;
            }
            return false;
          });

          if (servicesWithoutInventory.length > 0) {
            const serviceNames = servicesWithoutInventory
              .map((item) => item.item_name)
              .join(", ");
            message.error({
              content: `Các dịch vụ sau không đủ tồn kho trong chi nhánh ${selectedBranch.branch_name}: ${serviceNames}. Vui lòng chọn dịch vụ khác.`,
              duration: 5,
            });
            return;
          }
        }

        console.log("Updating walk-in booking");
        try {
          // Build booking_items array for API
          const bookingItems = buildBookingItemsArray();

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
            // For walk-in booking, send service_bay_id if we have a selected bay
            // This tells backend which bay to use (or keep if unchanged)
            // If user changed bay, send the new bay; otherwise send the original bay
            service_bay_id: isWalkInBooking
              ? selectedWalkInBay || initialData.bay_id || undefined
              : undefined,
            // For walk-in booking, we don't set scheduled times or slot info
            preferred_start_at: undefined,
            scheduled_start_at: undefined,
            scheduled_end_at: undefined,
            estimated_duration_minutes: totalDuration,
            total_price: totalPrice,
            currency: "VND",
            payment_status: initialData.payment_status,
            status: initialData.status,
            notes: values.notes || "",
            // Booking items - send array for add/update/delete
            booking_items: bookingItems.length > 0 ? bookingItems : undefined,
          };

          console.log(" Updating walk-in booking with request:",
            updateRequest
          );
          const updateResponse = await updateBookingMutation.mutateAsync({
            bookingId: initialData.booking_id,
            request: updateRequest,
          });
          console.log(" Walk-in booking update response:", updateResponse);
          console.log(" Response branch info:", {
            branch_id: updateResponse?.branch_id,
            branch_name: updateResponse?.branch_name,
            branch_code: updateResponse?.branch_code,
            bay_id: updateResponse?.bay_id,
            bay_name: updateResponse?.bay_name,
          });

          // Show success message
          message.success({
            content: "Cập nhật booking thành công!",
            duration: 3,
          });

          // Wait for message to disappear before closing modal
          setTimeout(() => {
            onOk(updateResponse); // Pass response data instead of request
            // Refresh table data
            if (onRefresh) {
              onRefresh();
            }
          }, 3000); // Wait 3 seconds (duration of message)
          return;
        } catch (walkInError: any) {
          console.log("Error updating walk-in booking:", walkInError);
          
          // Kiểm tra xem có phải lỗi cần đề xuất bay mới không
          const errorCode = walkInError?.error_code || walkInError?.response?.data?.error_code;
          const errorMessage = walkInError?.message || walkInError?.response?.data?.message || "Có lỗi xảy ra khi cập nhật booking";
          
          // Hiển thị error message đơn giản - user tự chọn bay/slot khác
          message.error({
            content: errorMessage,
            duration: 5,
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

        // Note: Không còn ràng buộc về thời gian tối đa cho slot booking
        // Backend sẽ kiểm tra conflict và đề xuất slot mới nếu cần

        // Validate: Check inventory for newly added services
        if (selectedBranch && servicesWithInventory && selectedItems.length > 0) {
          const availableServiceIds = new Set(
            servicesWithInventory.map((s) => s.service_id)
          );

          // Check if any selected service doesn't have enough inventory
          const servicesWithoutInventory = selectedItems.filter((item) => {
            const serviceId = item.service?.service_id;
            if (!serviceId) return false; // Skip items without service_id
            
            // Check if this is a new service (not in originalItems)
            const isNewService = !originalItems.some(
              (orig) => orig.service?.service_id === serviceId
            );
            
            // Only validate new services
            if (isNewService && !availableServiceIds.has(serviceId)) {
              return true;
            }
            return false;
          });

          if (servicesWithoutInventory.length > 0) {
            const serviceNames = servicesWithoutInventory
              .map((item) => item.item_name)
              .join(", ");
            message.error({
              content: `Các dịch vụ sau không đủ tồn kho trong chi nhánh ${selectedBranch.branch_name}: ${serviceNames}. Vui lòng chọn dịch vụ khác.`,
              duration: 5,
            });
            return;
          }
        }

        console.log("Updating slot booking");
        try {
          // Additional safety checks
          if (isNewCustomer && (!newCustomer || !newVehicle)) {
            console.log(" New customer data is incomplete");
            return;
          }
          if (!isNewCustomer && (!selectedCustomer || !selectedVehicle)) {
            console.log(" Existing customer data is incomplete");
            return;
          }

          // Build booking_items array for API
          const bookingItems = buildBookingItemsArray();

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
            // For slot booking, always send slot info if slot is selected (backend will handle if changed)
            service_bay_id: selectedSlot ? selectedSlot.bayId : undefined,
            // Calculate scheduled_start_at and scheduled_end_at for backend
            // Use format() instead of toISOString() to avoid timezone conversion
            // Backend expects LocalDateTime format (YYYY-MM-DDTHH:mm:ss) without timezone
            scheduled_start_at: selectedSlot
              ? dayjs(`${selectedSlot.date} ${selectedSlot.startTime}`).format(
                  "YYYY-MM-DDTHH:mm:ss"
                )
              : undefined,
            scheduled_end_at: selectedSlot
              ? dayjs(`${selectedSlot.date} ${selectedSlot.startTime}`)
                  .add(totalDuration, "minute")
                  .format("YYYY-MM-DDTHH:mm:ss")
              : undefined,
            estimated_duration_minutes: totalDuration,
            total_price: totalPrice,
            currency: "VND",
            payment_status: initialData.payment_status,
            status: initialData.status,
            notes: values.notes || "",
            // Booking items - send array for add/update/delete
            booking_items: bookingItems.length > 0 ? bookingItems : undefined,
          };

          console.log(" Updating slot booking with request:", updateRequest);
          console.log(" Schedule booking data:", {
            selectedSlot: selectedSlot,
            service_bay_id: selectedSlot?.bayId,
            schedule_date: selectedSlot?.date,
            schedule_start_time: selectedSlot?.startTime,
            scheduled_start_at: updateRequest.scheduled_start_at,
            scheduled_end_at: updateRequest.scheduled_end_at,
            estimated_duration_minutes: selectedSlot?.serviceDurationMinutes,
            isSlotChanged,
            originalSlot,
            branch_id: selectedBranch.branch_id,
            initialBranchId: initialData.branch_id,
            initialBayId: initialData.bay_id,
          });
          const updateResponse = await updateBookingMutation.mutateAsync({
            bookingId: initialData.booking_id,
            request: updateRequest,
          });
          console.log(" Booking update response:", updateResponse);
          console.log(" Response branch info:", {
            branch_id: updateResponse?.branch_id,
            branch_name: updateResponse?.branch_name,
            branch_code: updateResponse?.branch_code,
            bay_id: updateResponse?.bay_id,
            bay_name: updateResponse?.bay_name,
          });

          // Show success message
          message.success({
            content: "Cập nhật booking thành công!",
            duration: 3,
          });

          // Wait for message to disappear before closing modal
          setTimeout(() => {
            onOk(updateResponse); // Pass response data instead of request
            // Refresh table data
            if (onRefresh) {
              onRefresh();
            }
          }, 3000); // Wait 3 seconds (duration of message)
          return;
        } catch (bookingError: any) {
          console.log("Error updating slot booking:", bookingError);
          
          // Kiểm tra xem có phải lỗi cần đề xuất slot mới không
          const errorCode = bookingError?.error_code || bookingError?.response?.data?.error_code;
          const errorMessage = bookingError?.message || bookingError?.response?.data?.message || "Có lỗi xảy ra khi cập nhật booking";
          
          // Hiển thị error message đơn giản - user tự chọn slot khác
          message.error({
            content: errorMessage,
            duration: 5,
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
            console.log(" Switching customer type tab:", key);
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
                                label="Khách hàng"
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
                                  disabled={!!initialData.customer_id} // Disable if customer_id exists (existing customer)
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
                                  description={
                                    initialData.customer_id
                                      ? "Thông tin khách hàng không thể thay đổi. Chỉ có thể cập nhật xe."
                                      : `SĐT: ${selectedCustomer.phone_number} • Email: ${selectedCustomer.email}`
                                  }
                                  type={
                                    initialData.customer_id ? "info" : "success"
                                  }
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
                                  value={
                                    selectedVehicle?.vehicle_id ||
                                    form?.getFieldValue("vehicleId") ||
                                    undefined
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
    console.log(" Rendering new customer form:", {
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
              title="Thông tin khách hàng vãng lai"
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
              title="Thông tin xe"
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
                    console.log(" New vehicle license plate changed:",
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
    return (
      <div>
        <Card size="small" title="Dịch vụ" style={{ marginBottom: 16 }}>
          {isLoadingInventory && selectedBranch && (
            <Alert
              message="Đang kiểm tra tồn kho..."
              description="Vui lòng đợi trong giây lát"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          {!isLoadingInventory &&
            selectedBranch &&
            availableServices.length === 0 &&
            allPriceBookServices.length > 0 && (
              <Alert
                message="Không có dịch vụ nào khả dụng"
                description="Tất cả dịch vụ trong chi nhánh này đều không đủ tồn kho. Vui lòng chọn chi nhánh khác hoặc liên hệ nhân viên."
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
          {/* Show editable service selection for both walk-in and slot bookings */}
          <div>
            <Form.Item name="services" label="Dịch vụ chăm sóc xe" rules={[]}>
              <Select
                mode="multiple"
                placeholder="Chọn dịch vụ chăm sóc xe"
                onChange={handleServiceChange}
                optionLabelProp="label"
                loading={isLoadingPriceBooks || isLoadingInventory}
                notFoundContent={
                  isLoadingPriceBooks || isLoadingInventory
                    ? "Đang tải dịch vụ..."
                    : priceBooksError
                    ? `Lỗi tải dịch vụ: ${
                        (priceBooksError as { response?: { data?: unknown } })
                          ?.response?.data || "Không thể tải danh sách dịch vụ"
                      }`
                    : availableServices.length === 0
                    ? selectedBranch
                      ? "Không có dịch vụ nào khả dụng trong chi nhánh này"
                      : "Vui lòng chọn chi nhánh trước"
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
                      onClose={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const newItems = selectedItems.filter(
                          (i) => i.item_id !== item.item_id
                        );
                        console.log("🗑️ Removed service from Tag:", {
                          removedItem: item.item_name,
                          removedServiceId: item.service?.service_id,
                          remainingItems: newItems.map((i) => i.item_name),
                          remainingServiceIds: newItems.map(
                            (i) => i.service?.service_id
                          ),
                        });
                        setSelectedItems(newItems);
                        calculateTotals(newItems);
                        // Sync form value to match selectedItems (without triggering onChange)
                        // Use setTimeout to avoid circular reference
                        setTimeout(() => {
                          form.setFieldValue(
                            "services",
                            newItems.map((i) => i.item_id)
                          );
                        }, 0);
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

            {/* Warning when service duration exceeds original duration */}
            {(() => {
              const { isSlot: isSlotBooking, isWalkIn: isWalkInBooking } =
                detectBookingType(initialData);

              // For slot bookings: show warning when exceeds slot time
              if (isSlotBooking && !selectedSlot) return null;

              // Skip if not slot booking (walk-in booking không còn ràng buộc về thời gian)
              if (!isSlotBooking) return null;

              // Calculate total time from scheduled_start_at and scheduled_end_at (actual time range)
              const totalOriginalSlotTime = calculateOriginalSlotTime() || 0;
              const isServicesChanged =
                JSON.stringify(
                  selectedItems.map((item) => item.item_id).sort()
                ) !==
                JSON.stringify(
                  originalItems.map((item) => item.item_id).sort()
                );

              // For slot booking: show warning when exceeds time time
              if (
                isSlotBooking &&
                isServicesChanged &&
                totalDuration > totalOriginalSlotTime
              ) {
                return (
                  <Alert
                    message="Thông báo về thời gian dịch vụ"
                    description={
                      <div>
                        <div>
                          Tổng thời gian dịch vụ bạn đã chọn:{" "}
                          <strong>{totalDuration} phút</strong>
                        </div>
                        <div>
                          Tổng thời gian slot đã đặt ban đầu:{" "}
                          <strong>{totalOriginalSlotTime} phút</strong>
                        </div>
                        <div style={{ marginTop: 8, color: "#faad14" }}>
                          Tổng thời gian dịch vụ vượt quá thời gian slot hiện tại. 
                          Bạn có thể tiếp tục, hệ thống sẽ kiểm tra và thông báo nếu cần chọn slot khác.
                        </div>
                      </div>
                    }
                    type="warning"
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                );
              }

              // Walk-in booking: Không còn hiển thị warning về thời gian
              // Backend sẽ kiểm tra và đề xuất bay khác nếu cần
              return null;
            })()}

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
                  <DollarOutlined style={{ color: "#52c41a", fontSize: 24 }} />
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
        </Card>
      </div>
    );
  };

  const renderDateTimeBranchStep = () => {
    // Determine if this is a walk-in booking with fallback to booking_code
    const { isWalkIn: isWalkInBookingType } = detectBookingType(initialData);

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
                      currentSelectedSlot: selectedSlot,
                      slotDate: selectedSlot?.date,
                    });
                    setBookingDate(newDate);
                    // Reset slot if the current slot's date doesn't match the new date
                    if (selectedSlot && selectedSlot.date !== newDate) {
                      console.log(
                        "📅 Date changed, resetting slot because date mismatch"
                      );
                      setSelectedSlot(null);
                      setIsSlotChanged(false);
                      // Also clear slot from baySlotStates for the current bay
                      if (selectedBay) {
                        setBaySlotStates((prev) => ({
                          ...prev,
                          [selectedBay.bay_id]: {
                            slot: null,
                            isChanged: false,
                          },
                        }));
                      }
                    }
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
                  value={selectedBranch?.branch_id}
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
        message=" Đề xuất bay thông minh"
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
                            let queueToSet: any[] = [];
                            
                            if (
                              bayRecommendation?.queue &&
                              Array.isArray(bayRecommendation.queue)
                            ) {
                              console.log(" Restoring original queue from recommendation"
                              );
                              queueToSet = bayRecommendation.queue;
                            } else if (
                              bayRecommendation?.recommended_bay?.bay_id
                            ) {
                              console.log(" Loading queue for recommended bay:",
                                bayRecommendation.recommended_bay.bay_id
                              );
                              // Include current booking ID if recommended bay is the original bay
                              const recommendedBayId = bayRecommendation.recommended_bay.bay_id;
                              const isOriginalBay = recommendedBayId === initialData?.bay_id;
                              const includeBookingId = isOriginalBay ? initialData?.booking_id : undefined;
                              const queue = await getBayQueue(
                                recommendedBayId,
                                bookingDate,
                                includeBookingId
                              );
                              console.log(" Queue loaded for recommended bay:",
                                queue
                              );
                              queueToSet = queue as any[];
                            }
                            
                            // Only filter out current booking if recommended bay is different from original bay
                            // If recommended bay is the original bay, show current booking in queue
                            const recommendedBayId = bayRecommendation?.recommended_bay?.bay_id;
                            const isOriginalBay = recommendedBayId === initialData?.bay_id;
                            const filteredQueue = initialData?.booking_id && !isOriginalBay
                              ? queueToSet.filter(
                                  (item: any) => item.booking_id !== initialData.booking_id
                                )
                              : queueToSet;
                            
                            console.log(" Queue filtering (restore recommendation):", {
                              originalQueueLength: queueToSet?.length || 0,
                              filteredQueueLength: filteredQueue?.length || 0,
                              currentBookingId: initialData?.booking_id,
                              recommendedBayId: recommendedBayId,
                              originalBayId: initialData?.bay_id,
                              isOriginalBay: isOriginalBay,
                              filtered: !isOriginalBay && initialData?.booking_id,
                            });
                            
                            setQueueItems(filteredQueue as unknown as typeof queueItems);
                          } catch (error) {
                            console.log(" Error loading queue for recommended bay:",
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
                              " Loading queue for selected bay:",
                              bay.bay_id,
                              "using selected date:",
                              bookingDate
                            );
                            // Include current booking ID if selecting the original bay
                            const isOriginalBay = bay.bay_id === initialData?.bay_id;
                            const includeBookingId = isOriginalBay ? initialData?.booking_id : undefined;
                            const queue = await getBayQueue(
                              bay.bay_id,
                              bookingDate,
                              includeBookingId
                            );
                            console.log(" Queue loaded for bay:", queue);
                            
                            // Only filter out current booking if selecting a different bay
                            // If selecting the original bay, show current booking in queue
                            const filteredQueue = initialData?.booking_id && !isOriginalBay
                              ? (queue as any[]).filter(
                                  (item: any) => item.booking_id !== initialData.booking_id
                                )
                              : queue;
                            
                            console.log(" Queue filtering:", {
                              originalQueueLength: queue?.length || 0,
                              filteredQueueLength: filteredQueue?.length || 0,
                              currentBookingId: initialData?.booking_id,
                              selectedBayId: bay.bay_id,
                              originalBayId: initialData?.bay_id,
                              isOriginalBay: isOriginalBay,
                              filtered: !isOriginalBay && initialData?.booking_id,
                            });
                            
                            setQueueItems(
                              filteredQueue as unknown as typeof queueItems
                            );
                          } catch (error) {
                            console.log(" Error loading queue for bay:",
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
            <Card
              title={`Hàng chờ hiện tại (${
                getSafeQueueItems().length
              } khách hàng)`}
              style={{ marginBottom: 16 }}
            >
              {(() => {
                const safeQueueItems = getSafeQueueItems();
                console.log(" Queue items debug:", {
                  queueItems,
                  safeQueueItems,
                  isArray: Array.isArray(queueItems),
                  length: queueItems?.length,
                  source: "Bay Recommendation Queue Data",
                });
                return null; // Just for logging, table will render below
              })()}
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
                  rowKey={(record: unknown) => {
                    const queueRecord = record as {
                      queue_id?: string;
                      booking_id?: string;
                      bookingId?: string;
                      booking_customer_name?: string;
                      customer_name?: string;
                      booking_vehicle_license_plate?: string;
                    };
                    // Use queue_id first, then booking_id, then create a stable key from record content
                    if (queueRecord.queue_id) return queueRecord.queue_id;
                    if (queueRecord.booking_id) return queueRecord.booking_id;
                    if (queueRecord.bookingId) return queueRecord.bookingId;
                    // Fallback: create stable key from record content
                    const customerName =
                      queueRecord.booking_customer_name ||
                      queueRecord.customer_name ||
                      "";
                    const licensePlate =
                      queueRecord.booking_vehicle_license_plate || "";
                    return `queue-${customerName}-${licensePlate}`
                      .replace(/\s+/g, "-")
                      .toLowerCase();
                  }}
                  rowClassName={(record: unknown, index?: number) => {
                    // Use index from dataSource array position instead of parameter
                    const queueItems = getSafeQueueItems();
                    const recordIndex = queueItems.findIndex((item) => {
                      const queueRecord = record as {
                        queue_id?: string;
                        booking_id?: string;
                        bookingId?: string;
                      };
                      const itemRecord = item as {
                        queue_id?: string;
                        booking_id?: string;
                        bookingId?: string;
                      };
                      return (
                        (queueRecord.queue_id &&
                          queueRecord.queue_id === itemRecord.queue_id) ||
                        (queueRecord.booking_id &&
                          queueRecord.booking_id === itemRecord.booking_id) ||
                        (queueRecord.bookingId &&
                          queueRecord.bookingId === itemRecord.bookingId)
                      );
                    });
                    const actualIndex =
                      recordIndex >= 0 ? recordIndex : index || 0;
                    return actualIndex === 0
                      ? "queue-first-row"
                      : actualIndex % 2 === 0
                      ? "queue-even-row"
                      : "queue-odd-row";
                  }}
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
              {(() => {
                // Calculate from selectedItems if available, otherwise use initialData
                if (selectedItems.length > 0) {
                  return selectedItems.reduce((sum, item) => {
                    if (item.service) {
                      return sum + (item.service.estimated_duration || 60);
                    }
                    return sum;
                  }, 0);
                }
                // Fallback: calculate from initialData.booking_items if available
                if (
                  initialData.booking_items &&
                  initialData.booking_items.length > 0
                ) {
                  // This is a fallback - ideally we should have selectedItems loaded
                  return initialData.estimated_duration_minutes || 0;
                }
                return initialData.estimated_duration_minutes || 0;
              })()}{" "}
              phút
            </div>
          </div>
        </div>

        {/* Status */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                {initialData.customer_phone || "N/A"}
              </div>
              {initialData.customer_email && (
                <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
                  {initialData.customer_email}
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
                        {item.service_name ||
                          `Dịch vụ ${item.service_id?.substring(0, 8)}...`}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#666",
                          marginTop: 2,
                        }}
                      >
                        {item.unit_price?.toLocaleString() || 0}{" "}
                        {initialData.currency || "VND"}
                      </div>
                      {item.service_description && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#999",
                            marginTop: 2,
                          }}
                        >
                          Ghi chú: {item.service_description}
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
                      {(() => {
                        // Calculate from selectedItems if available, otherwise use initialData
                        if (selectedItems.length > 0) {
                          return selectedItems.reduce((sum, item) => {
                            if (item.service) {
                              return (
                                sum + (item.service.estimated_duration || 60)
                              );
                            }
                            return sum;
                          }, 0);
                        }
                        // Fallback: calculate from initialData.booking_items if available
                        if (
                          initialData.booking_items &&
                          initialData.booking_items.length > 0
                        ) {
                          // This is a fallback - ideally we should have selectedItems loaded
                          return initialData.estimated_duration_minutes || 0;
                        }
                        return initialData.estimated_duration_minutes || 0;
                      })()}{" "}
                      phút
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

      {/* Date, Time & Branch Section */}
      {renderDateTimeBranchStep()}

      {/* Service Selection Section */}
      {renderServiceSelectionStep()}

      {/* Slot Selection Section */}
      {renderSlotSelectionStep()}
    </div>
  );

  const renderSlotSelectionStep = () => {
    // Determine booking type with fallback to booking_code
    const {
      isWalkIn: isWalkInBooking,
      isSlot: isSlotBooking,
      bookingType,
    } = detectBookingType(initialData);

    console.log(" Booking type detection:", {
      booking_code: initialData.booking_code,
      booking_type: initialData.booking_type,
      detectedType: bookingType,
      isWalkInBooking,
      isSlotBooking,
      scheduled_start_at: initialData.scheduled_start_at,
      bayId: initialData.bay_id,
    });

    return (
      <div>
        <Card
          size="small"
          title="Chọn Khu Vực Chăm Sóc Và Thời Gian"
          style={{ marginBottom: 16 }}
        >
          {!selectedBranch || !bookingDate ? (
            <Alert
              message="Vui lòng chọn chi nhánh và ngày trước"
              description="Bạn cần chọn chi nhánh và ngày để xem các thời gian có sẵn"
              type="warning"
              showIcon
            />
          ) : (
            <>
              {totalDuration <= 0 && (
                <Alert
                  message="Vui lòng chọn dịch vụ để xem các mốc thời gian khả dụng"
                  description="Bạn có thể chọn bay trước, nhưng cần chọn dịch vụ để xem và chọn mốc thời gian phù hợp"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}
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
                          label: (
                            <span>📅 Đặt lịch ({serviceBays.length})</span>
                          ),
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
                                        {/* Show selected bay first if it's not in the filtered list */}
                                        {selectedBay &&
                                          !serviceBays.find(
                                            (b) =>
                                              b.bay_id === selectedBay.bay_id
                                          ) && (
                                            <Col
                                              span={6}
                                              key={selectedBay.bay_id}
                                            >
                                              <Card
                                                size="small"
                                                hoverable
                                                style={{
                                                  textAlign: "center",
                                                  border: "2px solid #1890ff",
                                                  backgroundColor: "#e6f7ff",
                                                }}
                                                onClick={() =>
                                                  handleBayChange(
                                                    selectedBay.bay_id
                                                  )
                                                }
                                              >
                                                <ShopOutlined
                                                  style={{
                                                    fontSize: 24,
                                                    color: "#1890ff",
                                                  }}
                                                />
                                                <div style={{ marginTop: 8 }}>
                                                  <Text strong>
                                                    {selectedBay.bay_name}
                                                  </Text>
                                                </div>
                                                <div
                                                  style={{
                                                    fontSize: 10,
                                                    color: "#1890ff",
                                                    marginTop: 4,
                                                  }}
                                                >
                                                  (Đã chọn)
                                                </div>
                                              </Card>
                                            </Col>
                                          )}
                                        {/* Show all available bays */}
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
                                                <Text strong>
                                                  {bay.bay_name}
                                                </Text>
                                              </div>
                                            </Card>
                                          </Col>
                                        ))}
                                      </Row>
                                    )}
                                  </div>
                                </Col>
                              </Row>

                              {/* Show slot selection section if bay is selected AND services are selected (need duration to load slots) */}
                              {(selectedBay || selectedSlot) &&
                                totalDuration > 0 && (
                                  <div>
                                    <Divider />
                                    <Text strong>
                                      {selectedBay
                                        ? `Chọn Thời Gian Chăm Sóc Trong ${selectedBay.bay_name}:`
                                        : selectedSlot
                                        ? `Thời Gian Đã Chọn (${selectedSlot.bayName}):`
                                        : "Chọn Thời Gian Chăm Sóc:"}
                                    </Text>
                                    {isDurationExceedsOriginal &&
                                      (() => {
                                        const totalOriginalSlotTime = calculateOriginalSlotTime() || 0;

                                        if (totalOriginalSlotTime > 0) {
                                          return (
                                            <Alert
                                              message="Lưu ý về thời gian dịch vụ"
                                              description={`Tổng thời gian dịch vụ bạn đã chọn (${totalDuration} phút) vượt quá thời gian slot đã đặt ban đầu (${totalOriginalSlotTime} phút). Bạn có thể tiếp tục, hệ thống sẽ kiểm tra và thông báo nếu cần chọn slot khác.`}
                                              type="warning"
                                              showIcon
                                              style={{
                                                marginTop: 8,
                                                marginBottom: 8,
                                              }}
                                            />
                                          );
                                        }
                                        return null;
                                      })()}
                                    {totalDuration > 60 &&
                                      !isDurationExceedsOriginal && (
                                        <Alert
                                          message={`Dịch vụ yêu cầu ${Math.ceil(
                                            totalDuration / 60
                                          )} thời gian chăm sóc liên tiếp (${totalDuration} phút)`}
                                          description="Vui lòng chọn thời gian chăm sóc đầu tiên, hệ thống sẽ tự động sử dụng các thời gian chăm sóc liên tiếp sau đó."
                                          type="info"
                                          showIcon
                                          style={{
                                            marginTop: 8,
                                            marginBottom: 8,
                                          }}
                                        />
                                      )}
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
                                            Đang tải danh sách thời gian...
                                          </div>
                                        </div>
                                      ) : availableSlots.length > 0 ? (
                                        <Row gutter={8}>
                                          {availableSlots.map((slot, index) => {
                                            const canSelect =
                                              canSelectSlot(slot);
                                            // Check if slot is selected: must match date and startTime
                                            const isSelected =
                                              selectedSlot &&
                                              selectedSlot.date ===
                                                bookingDate &&
                                              selectedSlot.startTime ===
                                                slot.time;

                                            // Calculate end time for display
                                            const slotStartMinutes =
                                              parseInt(
                                                slot.time.split(":")[0]
                                              ) *
                                                60 +
                                              parseInt(slot.time.split(":")[1]);
                                            const slotEndMinutes =
                                              slotStartMinutes + totalDuration;
                                            const slotEndHours = Math.floor(
                                              slotEndMinutes / 60
                                            );
                                            const slotEndMins =
                                              slotEndMinutes % 60;
                                            const slotEndTime = `${slotEndHours
                                              .toString()
                                              .padStart(2, "0")}:${slotEndMins
                                              .toString()
                                              .padStart(2, "0")}`;

                                            // Check why slot is not selectable
                                            let tooltipMessage = "";
                                            if (canSelect) {
                                              tooltipMessage = `Chọn thời gian ${slot.time} (${totalDuration} phút)`;
                                            } else {
                                              if (isDurationExceedsOriginal) {
                                                const totalOriginalSlotTime = calculateOriginalSlotTime() || 0;
                                                if (totalOriginalSlotTime > 0) {
                                                  tooltipMessage = `Tổng thời gian dịch vụ (${totalDuration} phút) vượt quá thời gian slot hiện tại (${totalOriginalSlotTime} phút). Bạn vẫn có thể chọn slot này, hệ thống sẽ kiểm tra và thông báo nếu cần chọn slot khác.`;
                                                }
                                              } else {
                                                tooltipMessage =
                                                  "Thời gian không khả dụng";
                                              }
                                            }

                                            return (
                                              <Col
                                                span={4}
                                                key={`${slot.time}-${index}`}
                                              >
                                                <Tooltip title={tooltipMessage}>
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
                                                      backgroundColor:
                                                        isSelected
                                                          ? "#f6ffed"
                                                          : canSelect
                                                          ? "#fff"
                                                          : "#f5f5f5",
                                                      cursor: canSelect
                                                        ? "pointer"
                                                        : "not-allowed",
                                                      opacity: canSelect
                                                        ? 1
                                                        : 0.6,
                                                      marginBottom: 8,
                                                    }}
                                                    onClick={() =>
                                                      canSelect &&
                                                      handleSlotSelect(slot)
                                                    }
                                                  >
                                                    <div
                                                      style={{
                                                        color: canSelect
                                                          ? "#52c41a"
                                                          : "#ff4d4f",
                                                        fontSize: 16,
                                                      }}
                                                    >
                                                      {canSelect ? (
                                                        <CheckCircleOutlined />
                                                      ) : (
                                                        <CloseCircleOutlined />
                                                      )}
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
                                                      {slot.time}
                                                    </div>
                                                    {!canSelect && (
                                                      <div
                                                        style={{
                                                          fontSize: 8,
                                                          color: "#ff4d4f",
                                                          marginTop: 2,
                                                        }}
                                                      >
                                                        Không khả dụng
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
                                          message="Không có thời gian khả dụng"
                                          description={
                                            totalDuration > 60
                                              ? `Không có ${Math.ceil(
                                                  totalDuration / 60
                                                )} thời gian chăm sóc liên tiếp khả dụng cho dịch vụ ${totalDuration} phút trong ngày này. Vui lòng thử ngày khác hoặc giảm số lượng dịch vụ.`
                                              : "Không có thời gian chăm sóc khả dụng trong ngày này."
                                          }
                                          type="warning"
                                          showIcon
                                        />
                                      )}
                                    </div>

                                    {/* Show selected slot info - display even if bay is not yet set */}
                                    {selectedSlot &&
                                      (() => {
                                        // Only show selected slot alert if it belongs to current bay
                                        // Calculate consecutive slots if service duration > 60 minutes
                                        const requiredSlots =
                                          totalDuration > 60
                                            ? Math.ceil(totalDuration / 60)
                                            : 1;
                                        // Only try to find slot index if we have availableSlots and selectedBay
                                        const selectedSlotIndex =
                                          selectedBay &&
                                          availableSlots.length > 0
                                            ? availableSlots.findIndex(
                                                (s) =>
                                                  s.time ===
                                                  selectedSlot.startTime
                                              )
                                            : -1;

                                        const consecutiveSlots: Array<{
                                          time: string;
                                          endTime: string;
                                        }> = [];
                                        if (
                                          selectedSlotIndex >= 0 &&
                                          requiredSlots > 1
                                        ) {
                                          for (
                                            let i = 0;
                                            i < requiredSlots &&
                                            selectedSlotIndex + i <
                                              availableSlots.length;
                                            i++
                                          ) {
                                            const slot =
                                              availableSlots[
                                                selectedSlotIndex + i
                                              ];
                                            if (slot) {
                                              // Calculate end time for each slot (30 minutes interval)
                                              const slotStartMinutes =
                                                parseInt(
                                                  slot.time.split(":")[0]
                                                ) *
                                                  60 +
                                                parseInt(
                                                  slot.time.split(":")[1]
                                                );
                                              const slotEndMinutes =
                                                slotStartMinutes + 30; // 30 minutes per slot
                                              const slotEndHours = Math.floor(
                                                slotEndMinutes / 60
                                              );
                                              const slotEndMins =
                                                slotEndMinutes % 60;
                                              const slotEndTime = `${slotEndHours
                                                .toString()
                                                .padStart(2, "0")}:${slotEndMins
                                                .toString()
                                                .padStart(2, "0")}`;

                                              consecutiveSlots.push({
                                                time: slot.time,
                                                endTime: slotEndTime,
                                              });
                                            }
                                          }
                                        }

                                        const endTime = dayjs(
                                          `2000-01-01 ${selectedSlot.startTime}`
                                        )
                                          .add(totalDuration, "minute")
                                          .format("HH:mm");

                                        return (
                                          <Alert
                                            message={
                                              <div>
                                                <div
                                                  style={{ marginBottom: 4 }}
                                                >
                                                  <strong>
                                                    Thời Gian Đã Chọn:
                                                  </strong>{" "}
                                                  {selectedSlot.startTime}
                                                </div>
                                                {consecutiveSlots.length >
                                                  1 && (
                                                  <div
                                                    style={{
                                                      fontSize: 12,
                                                      color: "#666",
                                                      marginTop: 4,
                                                    }}
                                                  >
                                                    <div
                                                      style={{
                                                        marginBottom: 2,
                                                      }}
                                                    >
                                                      <strong>
                                                        Bao gồm{" "}
                                                        {
                                                          consecutiveSlots.length
                                                        }{" "}
                                                        thời gian chăm sóc liên
                                                        tiếp:
                                                      </strong>
                                                    </div>
                                                    <div
                                                      style={{
                                                        display: "flex",
                                                        flexWrap: "wrap",
                                                        gap: 4,
                                                      }}
                                                    >
                                                      {consecutiveSlots.map(
                                                        (slot, idx) => (
                                                          <Tag
                                                            key={`${slot.time}-${idx}`}
                                                            color="blue"
                                                            style={{
                                                              margin: 0,
                                                            }}
                                                          >
                                                            {slot.time} -{" "}
                                                            {slot.endTime}
                                                          </Tag>
                                                        )
                                                      )}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            }
                                            description={`Khu Vực Chăm Sóc: ${selectedSlot.bayName} • Ngày: ${selectedSlot.date}`}
                                            type={
                                              isSlotChanged ? "success" : "info"
                                            }
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
                                                      setSelectedSlot(
                                                        originalSlot
                                                      );
                                                    } else {
                                                      setSelectedSlot(null);
                                                    }
                                                    setIsSlotChanged(false);

                                                    // Update bay slot state
                                                    if (selectedBay) {
                                                      setBaySlotStates(
                                                        (prev) => ({
                                                          ...prev,
                                                          [selectedBay.bay_id]:
                                                            {
                                                              slot: originalSlot,
                                                              isChanged: false,
                                                            },
                                                        })
                                                      );
                                                    }
                                                  }}
                                                >
                                                  Hủy chọn thời gian
                                                </Button>
                                              ) : null
                                            }
                                          />
                                        );
                                      })()}
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
                            <span>Xử lý tại chỗ ({onSiteBays.length})</span>
                          ),
                          children: renderBayRecommendation(),
                        },
                      ]
                    : []),
                ]}
              />
            </>
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
            label: <span>Thông tin & Thao tác</span>,
            children: renderBookingStatusTab(),
          },
          {
            key: "update",
            label: <span>Cập nhật thông tin</span>,
            children: (
              <Form form={form} layout="vertical" initialValues={{}}>
                {renderAllContent()}
                <div style={{ marginTop: 24, textAlign: "right" }}>
                  {(() => {
                    // Check if service duration exceeds slot duration for slot bookings
                    const { isSlot: isSlotBooking } =
                      detectBookingType(initialData);

                    return (
                      <>
                        {isSlotBooking && isDurationExceedsOriginal &&
                          (() => {
                            const totalOriginalSlotTime = calculateOriginalSlotTime() || 0;

                            if (totalOriginalSlotTime > 0) {
                              return (
                                <Alert
                                  message="Lưu ý về thời gian dịch vụ"
                                  description={`Tổng thời gian dịch vụ bạn đã chọn (${totalDuration} phút) vượt quá thời gian slot đã đặt ban đầu (${totalOriginalSlotTime} phút). Bạn có thể tiếp tục cập nhật, hệ thống sẽ kiểm tra và thông báo nếu cần chọn slot khác.`}
                                  type="warning"
                                  showIcon
                                  style={{ marginBottom: 16 }}
                                />
                              );
                            }
                            return null;
                          })()}
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
                            (customerType === "existing" &&
                              !selectedCustomer) ||
                            (customerType === "new" && !newCustomer) ||
                            (isSlotBooking && !selectedSlot) // Disable if slot booking but no slot selected
                            // Note: Không disable khi duration exceeds original - backend sẽ kiểm tra và đề xuất slot mới
                          }
                        >
                          Cập nhật booking
                        </Button>
                      </>
                    );
                  })()}
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
