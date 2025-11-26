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
  EnvironmentOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  BookingInfoDto,
  BookingStatus,
  BookingType,
  CreateBookingItemRequest,
} from "@/lib/api/types";
import { useUpdateBooking } from "@/lib/api/hooks/useBooking";
import { useAuth } from "@/lib/api/hooks/useAuth";
import { useVehicleProfiles } from "@/lib/api/hooks/useVehicleProfiles";
import { useBranches } from "@/lib/api/hooks/useBranches";
import { useAllPriceBooks } from "@/lib/api/hooks/usePricing";
import { useActiveServiceBays } from "@/lib/api/hooks/useServiceBays";
import { useServicesWithInventory } from "@/lib/api/hooks/useServicesWithInventory";
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

interface CustomerUpdateBookingModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (bookingData: unknown) => void;
  initialData: BookingInfoDto;
  loading?: boolean;
  onRefresh?: () => void;
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

const CustomerUpdateBookingModal: React.FC<CustomerUpdateBookingModalProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
  loading = false,
  onRefresh,
}) => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const { message } = App.useApp();

  // Selection states - simplified for customer context
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
  const [isSlotChanged, setIsSlotChanged] = useState(false);
  const [originalSlot, setOriginalSlot] = useState<SelectedSlot | null>(null);

  // Data states
  const [bookingDate, setBookingDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<SlotInfo[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [timeRangesData, setTimeRangesData] =
    useState<AvailableTimeRangesResponse | null>(null);

  // Use refs and state to track initialization to prevent infinite loops
  const isInitialized = useRef(false);
  const lastInitialData = useRef<BookingInfoDto | null>(null);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const isSlotInitialized = useRef(false); // Track if slot has been initialized from initialData

  // Calculate totals using useMemo to avoid infinite loops
  const { totalPrice, totalDuration } = useMemo(() => {
    const price = selectedItems.reduce(
      (sum, item) => sum + (item.fixed_price || 0),
      0
    );
    const duration = selectedItems.reduce((sum, item) => {
      if (item.service) {
        return sum + (item.service.estimated_duration || 60);
      }
      return sum;
    }, 0);
    return { totalPrice: price, totalDuration: duration };
  }, [selectedItems]);

  // API hooks
  const updateBookingMutation = useUpdateBooking();

  // Data hooks - optimized for customer context
  const { profiles: userVehicles, loading: isLoadingVehicles } =
    useVehicleProfiles({
      params: { size: 1000 },
      ownerId: user?.user_id,
    });
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

  // Get display bays: show all serviceBays, but also include the current booking's bay if it exists
  const displayBays = useMemo(() => {
    const bays = [...(serviceBays || [])];
    // If initialData has a bay_id that's not in serviceBays (e.g., filtered out), add it
    if (initialData?.bay_id && open) {
      const bayInList = bays.find((b) => b.bay_id === initialData.bay_id);
      if (!bayInList && allServiceBays && allServiceBays.length > 0) {
        const originalBay = allServiceBays.find(
          (b) => b.bay_id === initialData.bay_id
        );
        if (originalBay) {
          console.log(" Adding original bay to displayBays:", originalBay);
          bays.push(originalBay); // Add the original bay even if it doesn't pass filter
        }
      }
      // Also include selectedBay if it exists (might be from allServiceBays)
      if (selectedBay && !bayInList) {
        const selectedBayInList = bays.find(
          (b) => b.bay_id === selectedBay.bay_id
        );
        if (!selectedBayInList) {
          console.log(" Adding selectedBay to displayBays:", selectedBay);
          bays.push(selectedBay);
        }
      }
    }
    return bays;
  }, [serviceBays, allServiceBays, initialData?.bay_id, open, selectedBay]);

  // Get all services from price books (filter for services only)
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
          }
        });
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
  const { data: servicesWithInventory, isLoading: isLoadingInventory } =
    useServicesWithInventory({
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
  const loadAvailableSlots = useCallback(
    async (duration: number) => {
      // Only load if we have all required data
      if (!selectedBranch || !selectedBay || !bookingDate || duration <= 0) {
        // Clear slots if we don't have all required data
        if (!selectedBranch || !selectedBay || !bookingDate) {
          setAvailableSlots([]);
          setTimeRangesData(null);
        }
        return;
      }

      setLoadingSlots(true);
      try {
        // Get available time ranges from backend
        const timeRangesResponse =
          await BookingScheduleService.getAvailableTimeRanges({
            bay_id: selectedBay.bay_id,
            date: bookingDate,
            duration_minutes: duration,
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
            duration,
            30 // 30 minutes interval
          );

          setAvailableSlots(slots);
        } else {
          console.log(" No working hours or time ranges in response");
          setAvailableSlots([]);
        }
      } catch (error) {
        console.log("Error loading available time ranges:", error);
        setAvailableSlots([]);
        setTimeRangesData(null);
      } finally {
        setLoadingSlots(false);
      }
    },
    [selectedBranch, selectedBay, bookingDate]
  );

  // Load slots when dependencies change - with debounce to prevent infinite loops
  useEffect(() => {
    if (totalDuration > 0 && selectedBranch && selectedBay && bookingDate) {
      const timeoutId = setTimeout(() => {
        loadAvailableSlots(totalDuration);
      }, 100); // Small delay to prevent rapid calls

      return () => clearTimeout(timeoutId);
    }
  }, [
    loadAvailableSlots,
    totalDuration,
    selectedBranch,
    selectedBay,
    bookingDate,
  ]);

  // Reset slot when booking date changes and slot date doesn't match
  useEffect(() => {
    if (selectedSlot && bookingDate && selectedSlot.date !== bookingDate) {
      console.log(" Booking date changed, resetting slot:", {
        slotDate: selectedSlot.date,
        newBookingDate: bookingDate,
      });
      setSelectedSlot(null);
      setIsSlotChanged(false);
    }
  }, [bookingDate, selectedSlot]);

  // Calculate totals function - same as UpdateBookingModal
  const calculateTotals = useCallback((items: PriceBookItem[]) => {
    // Remove duplicates by item_id to prevent double counting
    const uniqueItems = items.filter(
      (item, index, self) =>
        index === self.findIndex((i) => i.item_id === item.item_id)
    );

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

    console.log("Calculated totals:", {
      price,
      duration,
      fromItems: uniqueItems.length,
    });
    // Note: CustomerUpdateBookingModal uses useMemo for totals, so we don't need to set state here
    // The totals will be calculated automatically from selectedItems
  }, []);

  // Initialize form with initial data (same logic as UpdateBookingModal)
  useEffect(() => {
    console.log("CustomerUpdateBookingModal useEffect triggered:", {
      initialData,
      open,
      isFormInitialized,
    });
    // Only initialize if modal is open and form hasn't been initialized yet, or initialData changed
    if (initialData && open && (!isFormInitialized || initialData.booking_id)) {
      console.log("Initializing customer update form with data:", initialData);

      // Set branch
      if (initialData.branch_id) {
        const branch = branches.find(
          (b) => b.branch_id === initialData.branch_id
        );
        if (branch) {
          setSelectedBranch(branch);
        }
      }

      // Determine booking type first with fallback
      const { isWalkIn: isWalkInBookingForDate } =
        detectBookingType(initialData);

      if (isWalkInBookingForDate) {
        // For walk-in bookings, always use current date (processing date)
        const currentDate = dayjs().format("YYYY-MM-DD");
        console.log("Using current date for walk-in booking:", currentDate);
        setBookingDate(currentDate);
      } else if (initialData.scheduled_start_at) {
        // For slot bookings, use scheduled_start_at
        const date = dayjs(initialData.scheduled_start_at).format("YYYY-MM-DD");
        console.log("Using scheduled_start_at for slot booking:", date);
        setBookingDate(date);
      } else {
        console.log(
          " No booking date set - no scheduled_start_at for slot booking"
        );
      }

      // Set vehicle data
      // Note: userVehicles might not be loaded yet, so we'll handle this in a separate useEffect
      // Just set the form value for now
      if (initialData.vehicle_id && initialData.vehicle_id !== "") {
        // Try to find vehicle if userVehicles are already loaded
        if (userVehicles && userVehicles.length > 0) {
          const vehicle = userVehicles.find(
            (v) => v.vehicle_id === initialData.vehicle_id
          );
          if (vehicle) {
            console.log("Setting selectedVehicle from initialData:", vehicle);
            setSelectedVehicle(vehicle);
          } else {
            console.log(" Vehicle not found in userVehicles:", {
              vehicleId: initialData.vehicle_id,
              userVehiclesLength: userVehicles.length,
            });
          }
        } else {
          console.log(
            "userVehicles not loaded yet, will set in separate useEffect"
          );
        }
      }

      // Services initialization will be handled in separate useEffect after availableServices are loaded

      // Set form values
      form.setFieldsValue({
        vehicleId: initialData.vehicle_id,
        branchId: initialData.branch_id,
        bookingDate: dayjs(
          initialData.scheduled_start_at || initialData.preferred_start_at
        ),
        serviceBayId: initialData.bay_id,
        services:
          initialData.booking_items?.map((item) => item.service_id) || [],
        notes: initialData.notes,
      });

      // If services were not set above, set original values from initialData
      if (
        !initialData.booking_items ||
        initialData.booking_items.length === 0
      ) {
        const originalDuration = initialData.estimated_duration_minutes || 0;
        setOriginalTotalDuration(originalDuration);
      }

      // Don't set totalDuration from initialData here - it will be set by calculateTotals
      // after selectedItems are loaded. This ensures we use actual service duration, not slot duration
      // Note: CustomerUpdateBookingModal uses useMemo for totalDuration, so it will be calculated automatically

      setIsSlotChanged(false); // Reset slot change flag
      setIsFormInitialized(true);

      // Update refs
      isInitialized.current = true;
      lastInitialData.current = initialData;
    } else if (!open) {
      // Reset initialization flag when modal closes
      setIsFormInitialized(false);
      isInitialized.current = false;
      lastInitialData.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialData?.booking_id, // Only depend on booking_id to detect data change
    open,
    isFormInitialized,
    // Other dependencies are intentionally excluded to prevent resetting user changes
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
          `[CustomerUpdateBookingModal] Removing service ${item.service.service_name} from selectedItems - no longer available in branch ${selectedBranch.branch_name}`
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
  }, [
    selectedBranch,
    servicesWithInventory,
    isLoadingInventory,
    selectedItems,
    form,
  ]);

  // Initialize services when availableServices are loaded (separate useEffect to handle async loading)
  useEffect(() => {
    if (
      initialData &&
      open &&
      isFormInitialized &&
      availableServices.length > 0 &&
      initialData.booking_items &&
      initialData.booking_items.length > 0
    ) {
      // Only initialize services once when availableServices are loaded
      // Check if services haven't been initialized yet (avoid re-initializing if user already made changes)
      // Initialize if selectedItems is empty OR if selectedItems don't match booking_items
      const shouldInitialize =
        selectedItems.length === 0 ||
        !selectedItems.some((item) =>
          initialData.booking_items?.some(
            (bookingItem) => bookingItem.service_id === item.service?.service_id
          )
        );

      if (shouldInitialize) {
        const services: PriceBookItem[] = [];
        const seenServiceIds = new Set<string>(); // Track already added services

        initialData.booking_items.forEach((item) => {
          if (item.service_id && !seenServiceIds.has(item.service_id)) {
            // Find the service in price books
            const priceBookItem = availableServices.find(
              (service) => service.service?.service_id === item.service_id
            );
            if (priceBookItem && !seenServiceIds.has(priceBookItem.item_id)) {
              services.push(priceBookItem);
              seenServiceIds.add(item.service_id);
              seenServiceIds.add(priceBookItem.item_id);
            } else {
              console.log(
                "No matching service found or duplicate for service_id:",
                item.service_id
              );
            }
          }
        });

        // Remove duplicates by item_id (additional safety check)
        const uniqueServices = services.filter(
          (service, index, self) =>
            index === self.findIndex((s) => s.item_id === service.item_id)
        );

        if (uniqueServices.length > 0) {
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
        } else {
          console.log(" No matching services found in availableServices");
          setOriginalItems([]);
          setOriginalTotalDuration(0);
        }
      }
    } else if (
      initialData &&
      open &&
      isFormInitialized &&
      (!initialData.booking_items || initialData.booking_items.length === 0) &&
      selectedItems.length === 0 &&
      originalItems.length === 0
    ) {
      console.log(" No booking items found in initialData");
      setOriginalItems([]);
      const originalDuration = initialData.estimated_duration_minutes || 0;
      setOriginalTotalDuration(originalDuration);
    }
  }, [
    initialData?.booking_id,
    open,
    isFormInitialized,
    availableServices.length,
  ]);

  // Initialize vehicle when userVehicles are loaded
  useEffect(() => {
    if (
      initialData &&
      open &&
      isFormInitialized &&
      userVehicles &&
      userVehicles.length > 0 &&
      initialData.vehicle_id &&
      initialData.vehicle_id !== "" &&
      !selectedVehicle
    ) {
      const vehicle = userVehicles.find(
        (v) => v.vehicle_id === initialData.vehicle_id
      );
      if (vehicle) {
        console.log(
          "Setting selectedVehicle from initialData (after userVehicles loaded):",
          vehicle
        );
        setSelectedVehicle(vehicle);
      } else {
        console.log(" Vehicle not found in userVehicles:", {
          vehicleId: initialData.vehicle_id,
          userVehiclesLength: userVehicles.length,
          vehicleIds: userVehicles.map((v) => v.vehicle_id),
        });
      }
    }
  }, [initialData?.vehicle_id, open, isFormInitialized, userVehicles.length]);

  // Reset initialization when modal closes
  useEffect(() => {
    if (!open) {
      isInitialized.current = false;
      lastInitialData.current = null;
      setIsFormInitialized(false);
      isSlotInitialized.current = false; // Reset slot initialization flag
      // Reset state when modal closes
      setSelectedBay(null);
      setSelectedSlot(null);
      setOriginalSlot(null);
      setIsSlotChanged(false);
    }
  }, [open]);

  // Separate useEffect to set bay and slot after serviceBays are loaded
  // Logic copied from UpdateBookingModal.tsx to ensure consistency
  useEffect(() => {
    if (!isFormInitialized || !initialData || !open || !selectedBranch) {
      return;
    }

    const { isSlot: isSlotBookingType } = detectBookingType(initialData);

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
        console.log("Setting selectedBay from initialData:", bay);
        setSelectedBay(bay);
      } else if (initialData.bay_id && !bay) {
        console.log(" Bay not found:", {
          bayId: initialData.bay_id,
          bayName: initialData.bay_name,
          serviceBaysLength: serviceBays.length,
          allServiceBaysLength: allServiceBays?.length || 0,
        });
      }
    }

    // Set slot for slot booking (after bay is set)
    // Only set if slot hasn't been initialized yet and form is initialized
    if (
      isSlotBookingType &&
      initialData.scheduled_start_at &&
      initialData.bay_id &&
      selectedBay &&
      !isSlotInitialized.current &&
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

      console.log("Setting selectedSlot from initialData:", initialSlot);
      setSelectedSlot(initialSlot);
      isSlotInitialized.current = true; // Mark slot as initialized

      // Only set originalSlot if it hasn't been set yet (first time initialization)
      if (!originalSlot) {
        setOriginalSlot(initialSlot); // Store original slot for restoration
      }
    }
  }, [
    isFormInitialized,
    initialData?.booking_id, // Only depend on booking_id to detect data change
    open,
    selectedBranch,
    serviceBays,
    isLoadingServiceBays,
    allServiceBays,
    selectedBay,
    originalSlot,
    selectedItems,
  ]);

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

        // Only include optional fields if they exist
        // Note: Since we don't have discount/tax in PriceBookItem, we can't update them here
        // But we include the structure for future use
        bookingItems.push(bookingItem);
      } else {
        // ADD: New item - send service_id and service_name
        const bookingItem: CreateBookingItemRequest = {
          service_id: serviceId,
          service_name: item.service?.service_name || item.item_name, // REQUIRED - Use service_name from service object if available
          service_description: item.service?.description,
        };
        bookingItems.push(bookingItem);
      }
    });

    console.log("Final booking_items array:", bookingItems);
    return bookingItems;
  }, [originalItems, selectedItems]);

  // Handle service selection change (same logic as UpdateBookingModal)
  const handleServiceChange = useCallback(
    (selectedServiceIds: string[]) => {
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

      setSelectedItems(uniqueSelectedServices);
      calculateTotals(uniqueSelectedServices);
    },
    [availableServices, calculateTotals, selectedItems]
  );

  // Handle vehicle change
  const handleVehicleChange = useCallback(
    (vehicleId: string) => {
      const vehicle = userVehicles.find((v) => v.vehicle_id === vehicleId);
      setSelectedVehicle(vehicle || null);
    },
    [userVehicles]
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

  // Handle bay change
  const handleBayChange = useCallback(
    (bayId: string) => {
      const bay = serviceBays?.find((b) => b.bay_id === bayId);
      setSelectedBay(bay || null);
      setSelectedSlot(null);
      setIsSlotChanged(false);
    },
    [serviceBays]
  );

  // Check if slot is suitable for service duration
  // With time-range-based system, availability is already calculated in convertTimeRangesToSlots
  const isSlotSuitable = useCallback((slot: SlotInfo) => {
    // Slot is suitable if it's available
    // convertTimeRangesToSlots already validates that slot + serviceDuration fits within range
    return slot.isAvailable;
  }, []);

  // Calculate original slot time from scheduled_start_at and scheduled_end_at (actual time range)
  const calculateOriginalSlotTime = useCallback(() => {
    // Customer bookings are always slot bookings
    if (!initialData.scheduled_start_at || !initialData.scheduled_end_at) {
      // Fallback: use estimated_duration_minutes if available
      if (initialData.estimated_duration_minutes) {
        return initialData.estimated_duration_minutes;
      }
      // Last fallback: use originalTotalDuration
      return originalTotalDuration || null;
    }

    // Use actual time range from scheduled_start_at and scheduled_end_at
    const startTime = dayjs(initialData.scheduled_start_at);
    const endTime = dayjs(initialData.scheduled_end_at);
    const diffMinutes = endTime.diff(startTime, "minute");

    if (diffMinutes > 0) {
      return diffMinutes;
    }

    // Fallback: use estimated_duration_minutes if available
    if (initialData.estimated_duration_minutes) {
      return initialData.estimated_duration_minutes;
    }

    // Last fallback: use originalTotalDuration
    return originalTotalDuration || null;
  }, [initialData, originalTotalDuration]);

  // Check if service duration exceeds total time of originally booked slots
  // Compare: total service duration vs actual time range from scheduled_start_at and scheduled_end_at
  const isDurationExceedsOriginal = useMemo(() => {
    const { isSlot: isSlotBooking } = detectBookingType(initialData);
    if (!isSlotBooking) {
      return false;
    }

    // Compare with actual time range from scheduled_start_at and scheduled_end_at
    const totalOriginalSlotTime = calculateOriginalSlotTime();

    if (totalOriginalSlotTime && totalOriginalSlotTime > 0) {
      return totalDuration > totalOriginalSlotTime;
    }

    return false;
  }, [totalDuration, calculateOriginalSlotTime, initialData.booking_code]);

  // Check if slot can be selected
  const canSelectSlot = useCallback(
    (slot: SlotInfo) => {
      // If duration exceeds original slot, disable all slot selection
      if (isDurationExceedsOriginal) {
        return false;
      }
      return isSlotSuitable(slot);
    },
    [isSlotSuitable, isDurationExceedsOriginal]
  );

  // Handle time selection
  const handleSlotSelect = useCallback(
    (slot: SlotInfo) => {
      // Prevent time selection if duration exceeds original time
      if (isDurationExceedsOriginal) {
        message.warning({
          content:
            "Tổng thời gian dịch vụ bạn chọn vượt quá thời gian slot hiện tại. Bạn có thể tiếp tục, hệ thống sẽ kiểm tra và thông báo nếu cần chọn slot khác.",
          duration: 4,
        });
        return;
      }

      if (canSelectSlot(slot) && selectedBay) {
        const newSlot = {
          bayId: selectedBay.bay_id,
          bayName: selectedBay.bay_name,
          date: bookingDate,
          startTime: slot.time,
          serviceDurationMinutes: totalDuration,
        };

        console.log(" Setting new slot:", newSlot);
        setSelectedSlot(newSlot);
        setIsSlotChanged(true);
      } else {
        console.log(" Cannot select slot:", {
          canSelect: canSelectSlot(slot),
          hasSelectedBay: !!selectedBay,
        });
      }
    },
    [
      canSelectSlot,
      bookingDate,
      totalDuration,
      isDurationExceedsOriginal,
      message,
      selectedBay, // Add selectedBay to dependencies
    ]
  );

  // Handle submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Check if this is a slot booking with fallback
      const { isSlot: isSlotBooking } = detectBookingType(initialData);

      if (!selectedBranch || !selectedVehicle) {
        message.error("Vui lòng điền đầy đủ thông tin");
        return;
      }

      // Only require slot for slot bookings
      if (isSlotBooking && !selectedSlot) {
        message.error(
          "Vui lòng chọn thời gian chăm sóc cho lịch đặt thời gian chăm sóc"
        );
        return;
      }

      // Validate: Check if total duration exceeds total time of originally booked slots
      // User can only select services that fit within the total slot time originally booked
      if (isDurationExceedsOriginal && originalTotalDuration) {
        const totalOriginalSlotTime = calculateOriginalSlotTime() || 0;

        if (totalOriginalSlotTime > 0) {
          message.warning({
            content: `Tổng thời gian dịch vụ bạn đã chọn (${totalDuration} phút) vượt quá thời gian slot đã đặt ban đầu (${totalOriginalSlotTime} phút). Bạn có thể tiếp tục, hệ thống sẽ kiểm tra và thông báo nếu cần chọn slot khác.`,
            duration: 5,
          });
        }
        return;
      }

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

      // Build booking_items array for API
      const bookingItems = buildBookingItemsArray();

      const updateRequest = {
        // Vehicle information - only allow changing vehicle
        vehicle_license_plate: selectedVehicle.license_plate,
        vehicle_brand_name: selectedVehicle.brand_name || "",
        vehicle_model_name: selectedVehicle.model_name || "",
        vehicle_type_name: selectedVehicle.type_name || "",
        vehicle_year: selectedVehicle.model_year || new Date().getFullYear(),
        vehicle_color: selectedVehicle.color || "",

        // Branch and bay - only allow changing if slot changed
        branch_id: selectedBranch.branch_id,
        // For slot booking, always send slot info if slot is selected (backend will handle if changed)
        service_bay_id: selectedSlot ? selectedSlot.bayId : undefined,

        // Calculate scheduled_start_at and scheduled_end_at for backend
        // Use format() instead of toISOString() to avoid timezone conversion
        // Backend expects LocalDateTime format (YYYY-MM-DDTHH:mm:ss) without timezone
        scheduled_start_at:
          selectedSlot && isSlotBooking
            ? dayjs(`${selectedSlot.date} ${selectedSlot.startTime}`).format(
                "YYYY-MM-DDTHH:mm:ss"
              )
            : undefined,
        scheduled_end_at:
          selectedSlot && isSlotBooking
            ? dayjs(`${selectedSlot.date} ${selectedSlot.startTime}`)
                .add(totalDuration, "minute")
                .format("YYYY-MM-DDTHH:mm:ss")
            : undefined,
        estimated_duration_minutes: totalDuration, // Always use totalDuration (actual service duration)

        // Pricing - recalculate based on selected services
        total_price: totalPrice,
        currency: "VND",

        // Additional information
        notes: values.notes || "",

        // Booking items - send array for add/update/delete
        booking_items: bookingItems.length > 0 ? bookingItems : undefined,
      };

      const updateResponse = await updateBookingMutation.mutateAsync({
        bookingId: initialData.booking_id,
        request: updateRequest,
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
    } catch (error) {
      console.log("Booking update failed:", error);
      message.error("Cập nhật booking thất bại!");
    }
  };

  // Render customer info (read-only)
  const renderCustomerInfo = () => (
    <Card
      size="small"
      title="Thông tin khách hàng"
      style={{ marginBottom: 16 }}
    >
      <Row gutter={16}>
        <Col span={8}>
          <Text strong>Tên:</Text>
          <div>{user?.full_name || initialData.customer_name}</div>
        </Col>
        <Col span={8}>
          <Text strong>SĐT:</Text>
          <div>{user?.phone_number || initialData.customer_phone}</div>
        </Col>
        <Col span={8}>
          <Text strong>Email:</Text>
          <div>{user?.email || initialData.customer_email}</div>
        </Col>
      </Row>
    </Card>
  );

  // Render vehicle selection
  const renderVehicleSelection = () => (
    <Card size="small" title="Thông tin xe" style={{ marginBottom: 16 }}>
      <Form.Item
        name="vehicleId"
        rules={[{ required: true, message: "Vui lòng chọn xe" }]}
      >
        <Select
          placeholder="Chọn xe của bạn"
          loading={isLoadingVehicles}
          onChange={handleVehicleChange}
          optionLabelProp="label"
          notFoundContent={
            isLoadingVehicles
              ? "Đang tải danh sách xe..."
              : userVehicles.length === 0
              ? "Bạn chưa có xe nào trong hệ thống"
              : "Không tìm thấy xe phù hợp"
          }
        >
          {userVehicles.map((vehicle: VehicleProfileDisplay) => (
            <Option
              key={vehicle.vehicle_id}
              value={vehicle.vehicle_id}
              label={vehicle.license_plate}
            >
              <div>
                <div style={{ fontWeight: 500 }}>{vehicle.license_plate}</div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {vehicle.brand_name} {vehicle.model_name} •{" "}
                  {vehicle.type_name}
                </div>
              </div>
            </Option>
          ))}
        </Select>
      </Form.Item>
    </Card>
  );

  // Render service selection
  const renderServiceSelection = () => (
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
                  <Tag color="blue" style={{ marginLeft: 8, fontSize: 10 }}>
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

      {/* Warning when service duration exceeds slot duration for slot bookings */}
      {/* Warning when service duration exceeds slot duration for slot bookings */}
      {(() => {
        const { isSlot: isSlotBooking } = detectBookingType(initialData);
        if (!isSlotBooking || !selectedSlot) return null;

        // Calculate total time of originally booked slots
        const SLOT_DURATION_MINUTES = 60;
        const originalSlotCount =
          originalTotalDuration > 0
            ? Math.ceil(originalTotalDuration / SLOT_DURATION_MINUTES)
            : 1;
        const totalOriginalSlotTime = originalSlotCount * SLOT_DURATION_MINUTES;
        const isServicesChanged =
          JSON.stringify(selectedItems.map((item) => item.item_id).sort()) !==
          JSON.stringify(originalItems.map((item) => item.item_id).sort());

        if (isServicesChanged && totalDuration > totalOriginalSlotTime) {
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
                    <strong>{totalOriginalSlotTime} phút</strong> (
                    {originalSlotCount} slot × {SLOT_DURATION_MINUTES}{" "}
                    phút/slot)
                  </div>
                  <div style={{ marginTop: 8, color: "#faad14" }}>
                    Tổng thời gian dịch vụ vượt quá thời gian slot hiện tại. Bạn
                    có thể tiếp tục, hệ thống sẽ kiểm tra và thông báo nếu cần
                    chọn slot khác.
                  </div>
                </div>
              }
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
            />
          );
        }
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
            <ClockCircleOutlined style={{ color: "#1890ff", fontSize: 24 }} />
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
    </Card>
  );

  // Render branch and slot selection
  const renderBranchAndSlotSelection = () => {
    // Always show branch and slot selection for all bookings
    return (
      <>
        <Row gutter={16}>
          <Col span={8}>{renderVehicleSelection()}</Col>
          <Col span={8}>
            <Card
              size="small"
              title="Ngày đặt lịch"
              style={{ marginBottom: 16 }}
            >
              <Form.Item name="bookingDate">
                <DatePicker
                  style={{ width: "100%" }}
                  value={bookingDate ? dayjs(bookingDate) : null}
                  placeholder="Chọn ngày"
                  disabledDate={(current) => {
                    const today = dayjs();
                    const currentHour = today.hour();
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
                    }
                  }}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col span={8}>
            <Card
              size="small"
              title="Chọn chi nhánh"
              style={{ marginBottom: 16 }}
            >
              <Form.Item name="branchId">
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

        {/* Service Selection */}
        {renderServiceSelection()}

        {!selectedBranch || !bookingDate ? (
          <Alert
            message="Vui lòng chọn chi nhánh và ngày trước"
            description="Bạn cần chọn chi nhánh và ngày để xem các thời gian có sẵn"
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        ) : (
          <>
            {totalDuration <= 0 && (
              <Alert
                message="Vui lòng chọn dịch vụ để xem các mốc thời gian khả dụng"
                description="Bạn có thể chọn bay trước, nhưng cần chọn dịch vụ để xem và chọn mốc thời gian phù hợp"
                type="info"
                showIcon
                style={{ marginTop: 16, marginBottom: 16 }}
              />
            )}
            <div style={{ marginTop: 16 }}>
              <Text strong>Chọn Khu Vực Chăm Sóc Cho Đặt Lịch:</Text>
              {isDurationExceedsOriginal &&
                (() => {
                  const totalOriginalSlotTime =
                    calculateOriginalSlotTime() || 0;

                  if (totalOriginalSlotTime > 0) {
                    return (
                      <Alert
                        message="Lưu ý về thời gian dịch vụ"
                        description={`Tổng thời gian dịch vụ bạn đã chọn (${totalDuration} phút) vượt quá thời gian slot đã đặt ban đầu (${totalOriginalSlotTime} phút). Bạn có thể tiếp tục, hệ thống sẽ kiểm tra và thông báo nếu cần chọn slot khác.`}
                        type="warning"
                        showIcon
                        style={{ marginTop: 8, marginBottom: 8 }}
                      />
                    );
                  }
                  return null;
                })()}
              {totalDuration > 60 && !isDurationExceedsOriginal && (
                <Alert
                  message={`Dịch vụ yêu cầu ${Math.ceil(
                    totalDuration / 60
                  )} thời gian chăm sóc liên tiếp (${totalDuration} phút)`}
                  description="Vui lòng chọn thời gian chăm sóc đầu tiên, hệ thống sẽ tự động sử dụng các thời gian chăm sóc liên tiếp sau đó."
                  type="info"
                  showIcon
                  style={{ marginTop: 8, marginBottom: 8 }}
                />
              )}
              <div style={{ marginTop: 8 }}>
                {isLoadingServiceBays ? (
                  <Spin />
                ) : displayBays && displayBays.length > 0 ? (
                  <Row gutter={8}>
                    {/* Show selected bay first if it's not in the filtered list */}
                    {selectedBay &&
                      !serviceBays.find(
                        (b) => b.bay_id === selectedBay.bay_id
                      ) && (
                        <Col span={6} key={selectedBay.bay_id}>
                          <Card
                            size="small"
                            hoverable
                            style={{
                              textAlign: "center",
                              border: "2px solid #1890ff",
                              backgroundColor: "#e6f7ff",
                            }}
                            onClick={() => handleBayChange(selectedBay.bay_id)}
                          >
                            <ShopOutlined
                              style={{ fontSize: 24, color: "#1890ff" }}
                            />
                            <div style={{ marginTop: 8 }}>
                              <Text strong>{selectedBay.bay_name}</Text>
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
                              selectedBay?.bay_id === bay.bay_id
                                ? "2px solid #1890ff"
                                : "1px solid #d9d9d9",
                            backgroundColor:
                              selectedBay?.bay_id === bay.bay_id
                                ? "#e6f7ff"
                                : "#fff",
                          }}
                          onClick={() => handleBayChange(bay.bay_id)}
                        >
                          <ShopOutlined
                            style={{ fontSize: 24, color: "#1890ff" }}
                          />
                          <div style={{ marginTop: 8 }}>
                            <Text strong>{bay.bay_name}</Text>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert
                    message="Không có khu vực chăm sóc nào khả dụng"
                    description="Chi nhánh này chưa có khu vực chăm sóc nào cho phép đặt lịch"
                    type="warning"
                    showIcon
                  />
                )}
              </div>
            </div>

            {/* Show slot selection section if bay is selected AND services are selected (need duration to load slots) */}
            {(selectedBay || selectedSlot) && totalDuration > 0 && (
              <div style={{ marginTop: 16 }}>
                <Divider />
                <Text strong>
                  {selectedBay
                    ? `Chọn Thời Gian Chăm Sóc:`
                    : selectedSlot
                    ? `Thời Gian Đã Chọn (${selectedSlot.bayName}):`
                    : "Chọn Thời Gian Chăm Sóc:"}
                </Text>
                <div style={{ marginTop: 8 }}>
                  {loadingSlots ? (
                    <div style={{ textAlign: "center", padding: 20 }}>
                      <Spin size="large" />
                      <div style={{ marginTop: 8 }}>
                        Đang tải danh sách thời gian...
                      </div>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <Row gutter={8}>
                      {availableSlots.map((slot, index) => {
                        const canSelect = canSelectSlot(slot);
                        // Check if slot is selected: must match date and startTime
                        const isSelected =
                          selectedSlot &&
                          selectedSlot.date === bookingDate &&
                          selectedSlot.startTime === slot.time;

                        // Calculate end time for display
                        const slotStartMinutes =
                          parseInt(slot.time.split(":")[0]) * 60 +
                          parseInt(slot.time.split(":")[1]);
                        const slotEndMinutes = slotStartMinutes + totalDuration;
                        const slotEndHours = Math.floor(slotEndMinutes / 60);
                        const slotEndMins = slotEndMinutes % 60;
                        const slotEndTime = `${slotEndHours
                          .toString()
                          .padStart(2, "0")}:${slotEndMins
                          .toString()
                          .padStart(2, "0")}`;

                        // Check why slot is not selectable for multi-slot services
                        let tooltipMessage = "";
                        if (canSelect) {
                          tooltipMessage = `Chọn thời gian ${slot.time} (${totalDuration} phút)`;
                        } else {
                          if (isDurationExceedsOriginal) {
                            const totalOriginalSlotTime =
                              calculateOriginalSlotTime() || 0;
                            if (totalOriginalSlotTime > 0) {
                              tooltipMessage = `Tổng thời gian dịch vụ (${totalDuration} phút) vượt quá thời gian slot hiện tại (${totalOriginalSlotTime} phút). Bạn vẫn có thể chọn slot này, hệ thống sẽ kiểm tra và thông báo nếu cần chọn slot khác.`;
                            }
                          } else {
                            tooltipMessage = "Thời gian không khả dụng";
                          }
                        }

                        return (
                          <Col span={2} key={`${slot.time}-${index}`}>
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
                                  backgroundColor: isSelected
                                    ? "#f6ffed"
                                    : canSelect
                                    ? "#fff"
                                    : "#f5f5f5",
                                  cursor: canSelect ? "pointer" : "not-allowed",
                                  opacity: canSelect ? 1 : 0.6,
                                  marginBottom: 8,
                                }}
                                onClick={() =>
                                  canSelect && handleSlotSelect(slot)
                                }
                              >
                                <div
                                  style={{
                                    marginTop: 4,
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color: canSelect ? "#000" : "#999",
                                  }}
                                >
                                  {slot.time}
                                </div>
                              </Card>
                            </Tooltip>
                          </Col>
                        );
                      })}
                    </Row>
                  ) : (
                    <Alert
                      message="Không có thời gian khả dụng"
                      description="Không có thời gian nào phù hợp với thời gian dịch vụ đã chọn"
                      type="warning"
                      showIcon
                    />
                  )}
                </div>

                {/* Show selected slot info - display even if bay is not yet set */}
                {selectedSlot && (
                  <Alert
                    message={`Thời Gian Đã Chọn: ${selectedSlot.startTime}`}
                    description={`Khu Vực Chăm Sóc: ${
                      selectedSlot.bayName
                    } • Ngày: ${selectedSlot.date} - Thời lượng: ${
                      selectedSlot.serviceDurationMinutes
                    } phút - Thời gian kết thúc dự kiến: ${dayjs(
                      selectedSlot.startTime,
                      "HH:mm"
                    )
                      .add(selectedSlot.serviceDurationMinutes, "minute")
                      .format("HH:mm")}`}
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
                            if (originalSlot) {
                              setSelectedSlot(originalSlot);
                            } else {
                              setSelectedSlot(null);
                            }
                            setIsSlotChanged(false);
                          }}
                        >
                          Hủy chọn thời gian
                        </Button>
                      ) : null
                    }
                  />
                )}
              </div>
            )}
          </>
        )}
      </>
    );
  };

  // Render booking info (read-only)
  const renderBookingInfo = () => (
    <Card size="small" title="Thông tin booking" style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={8}>
          <Text strong>Mã booking:</Text>
          <div style={{ fontFamily: "monospace" }}>
            {initialData.booking_code}
          </div>
        </Col>
        <Col span={8}>
          <Text strong>Trạng thái:</Text>
          <div>
            <Tag
              color={getStatusConfig(initialData.status).color}
              icon={getStatusConfig(initialData.status).icon}
            >
              {getStatusConfig(initialData.status).label}
            </Tag>
          </div>
        </Col>
        <Col span={8}>
          <Text strong>Chi nhánh hiện tại:</Text>
          <div>
            <EnvironmentOutlined style={{ marginRight: 4 }} />
            {initialData.branch_name}
          </div>
        </Col>
      </Row>
    </Card>
  );

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
      width={1200}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading || updateBookingMutation.isPending}
          onClick={handleSubmit}
          disabled={(() => {
            const { isSlot: isSlotBooking } = detectBookingType(initialData);
            const isDisabled =
              !selectedBranch ||
              selectedItems.length === 0 ||
              !selectedVehicle ||
              (isSlotBooking && !selectedSlot) ||
              isDurationExceedsOriginal;

            // Debug logging
            console.log(" Button disabled check:", {
              selectedBranch: !!selectedBranch,
              selectedItemsLength: selectedItems.length,
              selectedVehicle: !!selectedVehicle,
              isSlotBooking,
              selectedSlot: !!selectedSlot,
              isDurationExceedsOriginal,
              isDisabled,
              availableServicesLength: availableServices.length,
              bookingItemsLength: initialData.booking_items?.length || 0,
            });

            return isDisabled;
          })()}
        >
          Cập nhật booking
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          priority: "NORMAL",
        }}
      >
        {/* Booking Info */}
        {renderBookingInfo()}

        {/* Customer Info */}
        {renderCustomerInfo()}

        {/* Branch and Slot Selection */}
        {renderBranchAndSlotSelection()}

        {/* Notes */}
        <Card size="small" title="Ghi chú">
          <Form.Item name="notes" label="Ghi chú">
            <MemoizedTextArea
              rows={3}
              placeholder="Nhập ghi chú cho lịch đặt..."
            />
          </Form.Item>
        </Card>
      </Form>
    </Modal>
  );
};

export default CustomerUpdateBookingModal;
