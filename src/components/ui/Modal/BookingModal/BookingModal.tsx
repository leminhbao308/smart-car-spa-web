"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Button,
  Card,
  Tag,
  Row,
  Col,
  Typography,
  Alert,
  Spin,
  Tooltip,
  Divider,
  Tabs,
  Input,
  Table,
  App,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ShopOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { formatDurationVer01 } from "@/components/utils/helper/duration.format.helper";
import { MemoizedTextArea } from "@/components/ui/MemoizedComponents";
import { useCreateBookingWithSlot } from "@/lib/api/hooks/useBooking";
import { useCustomersDropdown } from "@/lib/api/hooks/useUsers";
import { useVehicleProfiles } from "@/lib/api/hooks/useVehicleProfiles";
import { useBranches } from "@/lib/api/hooks/useBranches";
import { useAllPriceBooks } from "@/lib/api/hooks/usePricing";
import { useActiveServiceBays } from "@/lib/api/hooks/useServiceBays";
import { BookingScheduleService } from "@/lib/api/services/booking-schedule.service";
import { AvailableTimeRangesResponse } from "@/lib/api/types/booking.types";
import { useWalkInBooking } from "@/lib/api/hooks/useWalkInBooking";
import { UserManagementInfo } from "@/lib/api/types/user.types";
import { VehicleProfileDisplay } from "@/lib/api/types/vehicle-profile.types";
import { BranchDisplay } from "@/lib/api/types/branch.types";
import { PriceBookItem } from "@/lib/api/types/price-book.types";
// import { SkillLevel } from "@/lib/api/types/service.types"; // Removed unused import
import { ServiceBay } from "@/lib/api/types/service-bay.types";
import { BookingType } from "@/lib/api/types/booking.types";
import { useServicesWithInventory } from "@/lib/api/hooks/useServicesWithInventory";
import { getErrorMessage } from "@/components/utils/helper/error.helper";
import {
  useVehicleBrandsDropdown,
  useVehicleTypesDropdown,
  useVehicleModelsDropdown,
} from "@/lib/api/hooks";

const { Option } = Select;
const { Text } = Typography;

interface BookingModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (bookingData: unknown) => void;
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

const BookingModal: React.FC<BookingModalProps> = ({
  open,
  onCancel,
  onOk,
  loading = false,
  onRefresh,
}) => {
  // Lazy initialization: only create form instance when modal is open or was opened
  const [form] = Form.useForm();

  // Selection states
  const [selectedCustomer, setSelectedCustomer] =
    useState<UserManagementInfo | null>(null);
  const [selectedVehicle, setSelectedVehicle] =
    useState<VehicleProfileDisplay | null>(null);

  // New customer states
  const [newCustomer, setNewCustomer] = useState<{
    full_name: string;
    phone_number: string;
    email?: string;
  } | null>(null);
  const [newVehicle, setNewVehicle] = useState<{
    license_plate: string;
    brand_id?: string;
    brand_name: string;
    type_id?: string;
    type_name: string;
    model_id?: string;
    model_name: string;
    color: string;
    year?: number;
  } | null>(null);

  // Vehicle filter states for new customer
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  // Track customer type (existing vs new)
  const [customerType, setCustomerType] = useState<"existing" | "new">(
    "existing"
  );

  // Load vehicle brands, types, and models
  const { dropdownData: brands, loading: loadingBrands } =
    useVehicleBrandsDropdown();
  const { dropdownData: types, loading: loadingTypes } =
    useVehicleTypesDropdown();
  const { dropdownData: models, loading: loadingModels } =
    useVehicleModelsDropdown(selectedBrandId || undefined, selectedTypeId || undefined);

  // Debug: Log filter states
  useEffect(() => {
    if (customerType === "new") {
      console.log("Vehicle filter states:", {
        selectedBrandId,
        selectedTypeId,
        selectedModelId,
        modelsCount: models.length,
        loadingModels,
      });
    }
  }, [selectedBrandId, selectedTypeId, selectedModelId, models.length, loadingModels, customerType]);
  const [selectedBranch, setSelectedBranch] = useState<BranchDisplay | null>(
    null
  );

  // Walk-in booking state
  const [selectedWalkInBay, setSelectedWalkInBay] = useState<string | null>(
    null
  );
  const [manualBaySelection, setManualBaySelection] = useState(false);
  const [selectedItems, setSelectedItems] = useState<PriceBookItem[]>([]);
  const [selectedBay, setSelectedBay] = useState<ServiceBay | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);

  // Debug selectedSlot state changes
  useEffect(() => {
    console.log(" selectedSlot state changed:", {
      selectedSlot,
      hasSelectedSlot: !!selectedSlot,
      details: selectedSlot,
      timestamp: new Date().toISOString(),
    });
  }, [selectedSlot]);

  // Bay recommendation state
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

  // Notification
  const { notification } = App.useApp();

  // API hooks
  const createBookingWithSlotMutation = useCreateBookingWithSlot();
  const { createWalkInBooking, recommendBay, getBayQueue } = useWalkInBooking();

  // Helper function to ensure queueItems is always an array
  const getSafeQueueItems = useCallback(() => {
    if (!Array.isArray(queueItems)) {
      return [];
    }
    return queueItems;
  }, [queueItems]);

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
  const vehicles = React.useMemo(() => {
    if (!selectedCustomer?.user_id) return [];
    return allVehicles.filter(
      (vehicle) => vehicle.owner_id === selectedCustomer.user_id
    );
  }, [allVehicles, selectedCustomer?.user_id]);

  // Debug: Log để kiểm tra việc lọc xe
  useEffect(() => {}, [
    selectedCustomer,
    vehicles,
    allVehicles,
    isLoadingVehicles,
  ]);

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
    // IMPORTANT: All services in servicesForInventoryCheck should have been checked
    // If a service is in availableServiceIds, it passed the inventory check
    // If a service is NOT in availableServiceIds but was checked, it failed (should be hidden)
    return allPriceBookServices.filter((item) => {
      if (!item.service) return false;

      // Check if this service was in the inventory check list
      const wasChecked = servicesForInventoryCheck.some(
        (s) => s.service_id === item.service!.service_id
      );

      if (!wasChecked) {
        // Service was not in the check list - this shouldn't happen if logic is correct
        // But to be safe, hide it (we can't verify its inventory status)
        console.warn(
          `[BookingModal] Service ${item.service.service_name} (${item.service.service_id}) was not in inventory check list`
        );
        return false;
      }

      // Service was checked - only show if it passed inventory check (is in availableServiceIds)
      const isAvailable = availableServiceIds.has(item.service.service_id);

      if (!isAvailable) {
        console.log(
          `[BookingModal] Hiding service ${item.service.service_name} - failed inventory check`
        );
      }

      return isAvailable;
    });
  }, [
    allPriceBookServices,
    selectedBranch,
    servicesWithInventory,
    isLoadingInventory,
    servicesForInventoryCheck,
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
          `[BookingModal] Removing service ${item.service.service_name} from selectedItems - no longer available in branch ${selectedBranch.branch_name}`
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
    // Note: form is stable (same reference) so including it won't cause re-renders
    // calculateTotals is also stable (empty deps) but defined later, so we exclude it to avoid hoisting issues
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedBranch,
    servicesWithInventory,
    isLoadingInventory,
    selectedItems,
    form,
  ]);

  // Load available time ranges from API and convert to slots
  const loadAvailableSlots = useCallback(async () => {
    if (!selectedBranch || !selectedBay || !bookingDate || totalDuration <= 0) {
      setAvailableSlots([]);
      setTimeRangesData(null);
      return;
    }

    setLoadingSlots(true);
    try {
      // Get available time ranges from backend
      const timeRangesResponse =
        await BookingScheduleService.getAvailableTimeRanges({
          bay_id: selectedBay.bay_id,
          date: bookingDate,
          duration_minutes: totalDuration,
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
        setAvailableSlots(slots);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.log("Error loading available time ranges:", error);
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

  // Auto recommend bay for walk-in booking
  useEffect(() => {
    const getBayRecommendation = async () => {
      if (!selectedBranch || selectedItems.length === 0 || totalDuration <= 0) {
        setBayRecommendation(null);
        setQueueItems([]);
        return;
      }

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
        setSelectedWalkInBay(recommendation?.recommended_bay?.bay_id || null);
        setManualBaySelection(false); // Reset manual selection flag

        // Use queue from recommendation first, then load from API if needed
        if (recommendation?.queue && Array.isArray(recommendation.queue)) {
          setQueueItems(recommendation.queue as unknown as typeof queueItems);
        } else if (recommendation?.recommended_bay?.bay_id) {
          const queue = await getBayQueue(
            recommendation.recommended_bay.bay_id,
            bookingDate
          );

          setQueueItems(queue as unknown as typeof queueItems);
        } else {
          setQueueItems([]);
        }
      } catch (error) {
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
  const isSlotSuitable = useCallback(
    (slot: SlotInfo) => {
      console.log(" isSlotSuitable check:", {
        slot: {
          time: slot.time,
          isAvailable: slot.isAvailable,
        },
        totalDuration,
        availableSlotsCount: availableSlots.length,
      });

      // Slot is suitable if it's available
      // convertTimeRangesToSlots already validates that slot + serviceDuration fits within range
      return slot.isAvailable;
    },
    [availableSlots.length]
  );

  // Check if slot can be selected (available and suitable)
  const canSelectSlot = useCallback(
    (slot: SlotInfo) => {
      const isSuitable = isSlotSuitable(slot);

      console.log(" canSelectSlot check:", {
        slot: {
          time: slot.time,
          isAvailable: slot.isAvailable,
        },
        checks: {
          isSuitable,
        },
        result: isSuitable,
      });

      return isSuitable;
    },
    [isSlotSuitable]
  );

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      // Reset everything for create mode
      form.resetFields();
      setSelectedCustomer(null);
      setSelectedVehicle(null);
      setNewCustomer(null);
      setNewVehicle(null);
      setCustomerType("existing");
      setSelectedBranch(null);
      setSelectedItems([]);
      setSelectedBay(null);
      setSelectedSlot(null);
      setSelectedWalkInBay(null);
      setManualBaySelection(false);
      setTotalPrice(0);
      setTotalDuration(0);
      // Set default date to today when modal opens
      const today = dayjs().format("YYYY-MM-DD");
      setBookingDate(today);
      form.setFieldsValue({ bookingDate: dayjs(today) });
    }
    // Note: form is stable (same reference) so including it won't cause re-renders
    // but it's required to keep dependency array size constant
  }, [open, form]);

  const calculateTotals = useCallback((items: PriceBookItem[]) => {
    const price = items.reduce((sum, item) => sum + (item.fixed_price || 0), 0);
    const duration = items.reduce((sum, item) => {
      if (item.service) {
        return sum + (item.service.estimated_duration || 0);
      } else if (item.servicePackage) {
        return sum + (item.servicePackage.total_duration || 0);
      }
      return sum;
    }, 0);
    setTotalPrice(price);
    setTotalDuration(duration);
  }, []);

  // Selection handlers
  const handleCustomerChange = useCallback(
    (customerId: string) => {
      const customer = customers.find((c) => c.user_id === customerId);
      setSelectedCustomer(customer || null);
      setSelectedVehicle(null);
      // Reset vehicle field in form
      form.setFieldValue("vehicleId", undefined);
    },
    // Note: form is stable (same reference) so including it won't cause re-renders
    [customers, form]
  );

  const handleVehicleChange = useCallback(
    (vehicleId: string) => {
      if (!vehicleId) {
        setSelectedVehicle(null);
        return;
      }
      const vehicle = allVehicles.find((v) => v.vehicle_id === vehicleId);
      setSelectedVehicle(vehicle || null);
    },
    [allVehicles]
  );

  const handleBranchChange = useCallback(
    (branchId: string) => {
      const branch = branches.find((b) => b.branch_id === branchId);
      setSelectedBranch(branch || null);
      setSelectedBay(null);
      setSelectedSlot(null);
      // Clear selected items when branch changes (inventory may be different)
      setSelectedItems([]);
      // Also clear form field
      form.setFieldsValue({ services: [] });
    },
    // Note: form is stable (same reference) so including it won't cause re-renders
    [branches, form]
  );

  const handleServiceChange = useCallback(
    (itemIds: string[]) => {
      const items = availableServices.filter(
        (item) => itemIds.includes(item.item_id) // item_id is from PriceBookItem, used for UI selection
      );
      setSelectedItems(items);
      calculateTotals(items);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [availableServices] // Remove calculateTotals to avoid circular reference
  );

  const handleBayChange = useCallback(
    (bayId: string) => {
      const bay = serviceBays?.find((b) => b.bay_id === bayId);
      setSelectedBay(bay || null);
      setSelectedSlot(null);
    },
    [serviceBays]
  );

  const handleSlotSelect = useCallback(
    (slot: SlotInfo) => {
      console.log(" handleSlotSelect called:", {
        slot: {
          time: slot.time,
          isAvailable: slot.isAvailable,
        },
        canSelect: canSelectSlot(slot),
        totalDuration,
        bookingDate,
        selectedBay,
      });

      if (canSelectSlot(slot) && selectedBay) {
        const newSlot = {
          bayId: selectedBay.bay_id,
          bayName: selectedBay.bay_name,
          date: bookingDate,
          startTime: slot.time,
          serviceDurationMinutes: totalDuration,
        };
        console.log(" Setting selectedSlot:", newSlot);
        setSelectedSlot(newSlot);

        // Reset walk-in bay selection when selecting a slot
        setSelectedWalkInBay(null);
        setManualBaySelection(false);
        console.log(" Reset walk-in bay selection for slot booking");

        console.log(" selectedSlot state updated, will trigger re-render");
      } else {
        console.log(
          " Cannot select slot - canSelectSlot returned false or no bay selected"
        );
      }
    },
    [canSelectSlot, bookingDate, totalDuration, selectedBay]
  );

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

      // Check if using new customer or existing customer
      const isNewCustomer = customerType === "new" && newCustomer && newVehicle;
      const isExistingCustomer =
        customerType === "existing" && selectedCustomer && selectedVehicle;

      console.log("Customer checks:", { isNewCustomer, isExistingCustomer });

      if (!isNewCustomer && !isExistingCustomer) {
        console.log(" Missing required information for booking");
        console.log(
          "isNewCustomer:",
          isNewCustomer,
          "isExistingCustomer:",
          isExistingCustomer
        );
        return;
      }

      console.log(
        " Customer validation passed, proceeding with booking creation..."
      );
      console.log(" Booking type conditions:", {
        isNewCustomer,
        isExistingCustomer,
        customerType,
        selectedSlot: !!selectedSlot,
        selectedWalkInBay: !!selectedWalkInBay,
        selectedSlotDetails: selectedSlot,
        selectedWalkInBayDetails: selectedWalkInBay,
      });

      console.log(" Debug booking conditions:", {
        isNewCustomer: isNewCustomer,
        isExistingCustomer: isExistingCustomer,
        customerType: customerType,
        selectedSlot: !!selectedSlot,
        selectedWalkInBay: !!selectedWalkInBay,
        condition1_newCustomer: isNewCustomer,
        condition2_existingWalkIn:
          isExistingCustomer &&
          customerType === "existing" &&
          selectedWalkInBay &&
          !selectedSlot,
        condition3_existingSlot:
          isExistingCustomer && selectedSlot && !selectedWalkInBay,
      });

      // Handle new customer (walk-in booking)
      if (isNewCustomer) {
        if (!selectedBranch || !selectedWalkInBay) {
          console.log("Missing branch or bay information for new customer");
          return;
        }

        console.log("Creating walk-in booking for new customer");
        try {
          // For walk-in booking, let backend calculate the timing based on queue
          // Don't send specific times, let backend handle queue-based scheduling

          const walkInData = {
            customerType: "NEW" as const,
            customerId: undefined,
            vehicleId: undefined,
            newCustomer: {
              name: newCustomer!.full_name,
              phone: newCustomer!.phone_number,
              email: newCustomer!.email || "",
            },
            newVehicle: {
              licensePlate: newVehicle!.license_plate,
              brand: newVehicle!.brand_name,
              model: newVehicle!.model_name,
              type: newVehicle!.type_name,
              color: newVehicle!.color,
              year: newVehicle!.year || new Date().getFullYear(),
            },
            services: selectedItems.map((item) => ({
              service_id: item.service?.service_id || item.item_id,
              service_name: item.service?.service_name || item.item_name, // Use service_name from service object if available
              duration_minutes: item.service?.estimated_duration || 60,
              price: item.fixed_price || 0,
            })),
            assignedBayId: selectedWalkInBay,
            notes: values.notes || "",
            // Add missing fields for walk-in booking
            estimated_duration_minutes: totalDuration,
            booking_date: bookingDate, // Send the selected date
          };

          console.log(" DEBUG: Final walkInData payload:", walkInData);
          console.log(" DEBUG: bookingDate being sent:", bookingDate);

          const walkInResponse = await createWalkInBooking(
            walkInData,
            selectedBranch.branch_id
          );
          console.log("Walk-in booking created:", walkInResponse);

          // Show success notification
          notification.success({
            message: "Đặt lịch thành công!",
            description: `Đã tạo booking xử lý tại chỗ cho khách hàng ${newCustomer.full_name}`,
            placement: "topRight",
            duration: 2,
          });

          // Wait a bit before closing modal
          await new Promise((resolve) => setTimeout(resolve, 1500));

          onOk(walkInResponse);
          // Refresh table data
          if (onRefresh) {
            onRefresh();
          }
          return;
        } catch (walkInError: any) {
          console.log("Error creating walk-in booking:", walkInError);

          // Extract and display error message
          const errorMessage = getErrorMessage(walkInError);
          notification.error({
            message: "Lỗi đặt lịch",
            description: errorMessage,
            placement: "topRight",
            duration: 5,
          });

          // Don't call onOk when there's an error - let user retry
          return;
        }
      }

      // Handle existing customer for walk-in booking (onsite processing)
      console.log(" Checking existing customer walk-in condition:", {
        isExistingCustomer,
        customerType,
        selectedWalkInBay: !!selectedWalkInBay,
        selectedSlot: !!selectedSlot,
        condition:
          isExistingCustomer &&
          customerType === "existing" &&
          selectedWalkInBay &&
          !selectedSlot,
      });

      if (
        isExistingCustomer &&
        customerType === "existing" &&
        selectedWalkInBay &&
        !selectedSlot
      ) {
        if (!selectedBranch) {
          console.log(
            "Missing branch information for existing customer walk-in"
          );
          return;
        }

        console.log("Creating walk-in booking for existing customer");
        console.log(" DEBUG: Selected vehicle data:", {
          vehicle_id: selectedVehicle!.vehicle_id,
          license_plate: selectedVehicle!.license_plate,
          brand_name: selectedVehicle!.brand_name,
          model_name: selectedVehicle!.model_name,
          type_name: selectedVehicle!.type_name,
          color: selectedVehicle!.color,
          model_year: selectedVehicle!.model_year,
        });

        try {
          // For walk-in booking, let backend calculate the timing based on queue
          // Don't send specific times, let backend handle queue-based scheduling

          const walkInData = {
            customerType: "EXISTING" as const,
            customerId: selectedCustomer!.user_id,
            vehicleId: selectedVehicle!.vehicle_id,
            newCustomer: undefined,
            newVehicle: undefined,
            // Send vehicle info in existingVehicle object (as expected by hook)
            existingVehicle: {
              license_plate: selectedVehicle!.license_plate,
              brand_name: selectedVehicle!.brand_name || "",
              model_name: selectedVehicle!.model_name || "",
              type_name: selectedVehicle!.type_name || "",
              color: selectedVehicle!.color || "",
              year: selectedVehicle!.model_year || new Date().getFullYear(),
            },
            services: selectedItems.map((item) => ({
              service_id: item.service?.service_id || item.item_id,
              service_name: item.service?.service_name || item.item_name, // Use service_name from service object if available
              duration_minutes: item.service?.estimated_duration || 60,
              price: item.fixed_price || 0,
            })),
            assignedBayId: selectedWalkInBay,
            notes: values.notes || "",
            // Add missing fields for walk-in booking
            estimated_duration_minutes: totalDuration,
            booking_date: bookingDate, // Send the selected date
          };

          console.log(
            "🔍 DEBUG: Final walkInData payload for existing customer:",
            walkInData
          );
          console.log(" DEBUG: bookingDate being sent:", bookingDate);

          const walkInResponse = await createWalkInBooking(
            walkInData,
            selectedBranch.branch_id
          );
          console.log(
            "Walk-in booking created for existing customer:",
            walkInResponse
          );

          // Show success notification
          notification.success({
            message: "Đặt lịch thành công!",
            description: `Đã tạo booking xử lý tại chỗ cho khách hàng ${selectedCustomer.full_name}`,
            placement: "topRight",
            duration: 2,
          });

          // Wait a bit before closing modal
          await new Promise((resolve) => setTimeout(resolve, 1500));

          onOk(walkInResponse);
          // Refresh table data
          if (onRefresh) {
            onRefresh();
          }
          return;
        } catch (walkInError: any) {
          console.log(
            "Error creating walk-in booking for existing customer:",
            walkInError
          );

          // Extract and display error message
          const errorMessage = getErrorMessage(walkInError);
          notification.error({
            message: "Lỗi đặt lịch",
            description: errorMessage,
            placement: "topRight",
            duration: 5,
          });

          // Don't call onOk when there's an error - let user retry
          return;
        }
      }

      // Handle existing customer (slot booking)
      console.log(" Checking existing customer slot booking condition:", {
        isExistingCustomer,
        selectedSlot: !!selectedSlot,
        selectedWalkInBay: !!selectedWalkInBay,
        condition: isExistingCustomer && selectedSlot && !selectedWalkInBay,
      });

      if (isExistingCustomer && selectedSlot && !selectedWalkInBay) {
        console.log(" Processing existing customer slot booking...");
        if (!selectedBranch) {
          console.log(
            "Missing branch information for existing customer slot booking"
          );
          return;
        }

        console.log("Creating slot booking for existing customer");
        try {
          // Calculate slot end time
          // Use format() instead of toISOString() to avoid timezone conversion
          // Backend expects LocalDateTime format (YYYY-MM-DDTHH:mm:ss) without timezone
          const slotStartTime = dayjs(
            `${selectedSlot.date} ${selectedSlot.startTime}`
          );
          const slotEndTime = slotStartTime.add(
            selectedSlot.serviceDurationMinutes,
            "minute"
          );

          const createRequest = {
            // booking_type is automatically set by backend to SCHEDULED for this API
            customer_id: selectedCustomer?.user_id,
            customer_name: selectedCustomer!.full_name,
            customer_phone: selectedCustomer!.phone_number,
            customer_email: selectedCustomer!.email,
            vehicle_id: selectedVehicle?.vehicle_id,
            vehicle_license_plate: selectedVehicle!.license_plate,
            vehicle_brand_name: selectedVehicle!.brand_name || "",
            vehicle_model_name: selectedVehicle!.model_name || "",
            vehicle_type_name: selectedVehicle!.type_name || "",
            vehicle_year:
              selectedVehicle!.model_year || new Date().getFullYear(),
            vehicle_color: selectedVehicle!.color || "",
            branch_id: selectedBranch.branch_id,
            selected_schedule: {
              bay_id: selectedSlot.bayId,
              date: selectedSlot.date,
              start_time: selectedSlot.startTime,
              service_duration_minutes: selectedSlot.serviceDurationMinutes,
            },
            booking_items: selectedItems.map((item) => ({
              service_id: item.service?.service_id || item.item_id,
              service_name: item.service?.service_name || item.item_name, // REQUIRED - Use service_name from service object if available
              service_description: item.service?.description || "",
            })),
            total_price: totalPrice,
            currency: "VND",
            // Add missing fields for slot booking
            estimated_duration_minutes: totalDuration,
            // Format as LocalDateTime (YYYY-MM-DDTHH:mm:ss) without timezone
            preferred_start_at: slotStartTime.format("YYYY-MM-DDTHH:mm:ss"),
            scheduled_start_at: slotStartTime.format("YYYY-MM-DDTHH:mm:ss"),
            scheduled_end_at: slotEndTime.format("YYYY-MM-DDTHH:mm:ss"),
            notes: values.notes || "",
          };

          console.log(" Creating regular booking with request:", createRequest);
          const createResponse =
            await createBookingWithSlotMutation.mutateAsync(createRequest);
          console.log(" Booking creation response:", createResponse);

          // Show success notification
          const bookingCode = createResponse?.booking_code || "N/A";
          notification.success({
            message: "Đặt lịch thành công!",
            description: `Đã tạo booking đặt trước thành công. Mã booking: ${bookingCode}`,
            placement: "topRight",
            duration: 2,
          });

          // Wait a bit before closing modal
          await new Promise((resolve) => setTimeout(resolve, 1500));

          onOk(createRequest);
          // Refresh table data
          if (onRefresh) {
            onRefresh();
          }
          return;
        } catch (bookingError: any) {
          console.log("Error creating slot booking:", bookingError);

          // Extract and display error message
          const errorMessage = getErrorMessage(bookingError);
          notification.error({
            message: "Lỗi đặt lịch",
            description: errorMessage,
            placement: "topRight",
            duration: 5,
          });

          // Don't call onOk when there's an error - let user retry
          return;
        }
      }

      // If no condition was met, log the issue
      console.log(" No booking condition was met. This should not happen.");
      console.log(" Final state check:", {
        isNewCustomer,
        isExistingCustomer,
        customerType,
        selectedSlot: !!selectedSlot,
        selectedWalkInBay: !!selectedWalkInBay,
        selectedBranch: !!selectedBranch,
      });
    } catch (error: any) {
      console.log("Booking submission failed:", error);

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

        // Show validation error notification
        const firstError = errorFields[0]?.errors?.[0];
        if (firstError) {
          notification.error({
            message: "Lỗi xác thực",
            description: firstError,
            placement: "topRight",
            duration: 5,
          });
        }
      } else {
        // Show API error notification
        const errorMessage = getErrorMessage(error);
        notification.error({
          message: "Lỗi đặt lịch",
          description: errorMessage,
          placement: "topRight",
          duration: 5,
        });
      }
    }
  };

  // Render all content in single form
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
                    console.log("New customer name changed:", e.target.value);
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
                  message={`Khách vãng lai: ${newCustomer.full_name}`}
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
                    console.log(
                      " New vehicle license plate changed:",
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
                        message: "Vui lòng chọn hãng xe",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Chọn hãng xe"
                      loading={loadingBrands}
                      allowClear
                      value={selectedBrandId || undefined}
                      onChange={(value) => {
                        console.log("🔵 Brand changed:", value);
                        setSelectedBrandId(value || null);
                        setSelectedModelId(null); // Reset model when brand changes
                        const selectedBrand = brands.find(
                          (b) => b.brand_id === value
                        );
                        console.log("🔵 Selected brand:", selectedBrand);
                        setNewVehicle((prev) => ({
                          ...prev,
                          license_plate: prev?.license_plate || "",
                          brand_id: value || undefined,
                          brand_name: selectedBrand?.brand_name || "",
                          model_id: undefined,
                          model_name: "",
                          type_id: prev?.type_id || undefined,
                          type_name: prev?.type_name || "",
                          color: prev?.color || "",
                          year: prev?.year || new Date().getFullYear(),
                        }));
                        form.setFieldsValue({ newVehicleModel: undefined });
                      }}
                    >
                      {brands.map((brand) => (
                        <Option key={brand.brand_id} value={brand.brand_id}>
                          {brand.brand_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="newVehicleType"
                    label="Loại xe"
                    rules={[
                      {
                        required: customerType === "new",
                        message: "Vui lòng chọn loại xe",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Chọn loại xe"
                      loading={loadingTypes}
                      allowClear
                      value={selectedTypeId || undefined}
                      onChange={(value) => {
                        console.log("🟢 Type changed:", value);
                        setSelectedTypeId(value || null);
                        setSelectedModelId(null); // Reset model when type changes
                        const selectedType = types.find(
                          (t) => t.type_id === value
                        );
                        console.log("🟢 Selected type:", selectedType);
                        setNewVehicle((prev) => ({
                          ...prev,
                          license_plate: prev?.license_plate || "",
                          brand_id: prev?.brand_id || undefined,
                          brand_name: prev?.brand_name || "",
                          model_id: undefined,
                          model_name: "",
                          type_id: value || undefined,
                          type_name: selectedType?.type_name || "",
                          color: prev?.color || "",
                          year: prev?.year || new Date().getFullYear(),
                        }));
                        form.setFieldsValue({ newVehicleModel: undefined });
                      }}
                    >
                      {types.map((type) => (
                        <Option key={type.type_id} value={type.type_id}>
                          {type.type_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item
                    name="newVehicleModel"
                    label="Model xe"
                    rules={[
                      {
                        required: customerType === "new",
                        message: "Vui lòng chọn model xe",
                      },
                    ]}
                  >
                    <Select
                      placeholder={
                        !selectedBrandId || !selectedTypeId
                          ? "Vui lòng chọn Hãng xe và Loại xe trước"
                          : "Chọn model xe"
                      }
                      disabled={!selectedBrandId || !selectedTypeId}
                      loading={loadingModels}
                      allowClear
                      value={selectedModelId || undefined}
                      onChange={(value) => {
                        console.log("🟡 Model changed:", value);
                        setSelectedModelId(value || null);
                        const selectedModel = models.find(
                          (m) => m.model_id === value
                        );
                        console.log("🟡 Selected model:", selectedModel);
                        setNewVehicle((prev) => ({
                          ...prev,
                          license_plate: prev?.license_plate || "",
                          brand_id: prev?.brand_id || undefined,
                          brand_name: prev?.brand_name || "",
                          model_id: value || undefined,
                          model_name: selectedModel?.model_name || "",
                          type_id: prev?.type_id || undefined,
                          type_name: prev?.type_name || "",
                          color: prev?.color || "",
                          year: prev?.year || new Date().getFullYear(),
                        }));
                      }}
                    >
                      {models.map((model) => (
                        <Option key={model.model_id} value={model.model_id}>
                          {model.model_name}
                        </Option>
                      ))}
                    </Select>
                    {selectedBrandId &&
                      selectedTypeId &&
                      models.length === 0 &&
                      !loadingModels && (
                        <div style={{ color: "#ff4d4f", fontSize: "12px", marginTop: 4 }}>
                          Không tìm thấy model nào phù hợp với Hãng xe và Loại xe đã chọn
                        </div>
                      )}
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

  const renderCustomerVehicleStep = () => (
    <div>
      <Card
        size="small"
        title="Thông tin khách hàng và xe"
        style={{ marginBottom: 16 }}
      >
        <Tabs
          defaultActiveKey="existing"
          onChange={(key) => {
            console.log(" Switching customer type tab:", key);
            setCustomerType(key as "existing" | "new");
            // Reset all customer and vehicle data when switching tabs
            setSelectedCustomer(null);
            setSelectedVehicle(null);
            setNewCustomer(null);
            setNewVehicle(null);
            // Reset vehicle filter states
            setSelectedBrandId(null);
            setSelectedTypeId(null);
            setSelectedModelId(null);

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
            {
              key: "existing",
              label: <span>Khách hàng thành viên</span>,
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
                            onChange={handleCustomerChange}
                            filterOption={(input, option) => {
                              const label = option?.label?.toString() || "";
                              const customer = customers.find(
                                (c) => c.user_id === option?.value
                              );
                              const phoneNumber = customer?.phone_number || "";
                              const searchText = input.toLowerCase();
                              return (
                                label.toLowerCase().includes(searchText) ||
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
                                  <div style={{ fontSize: 12, color: "#666" }}>
                                    {customer.phone_number} • {customer.email}
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
                            {vehicles.map((vehicle: VehicleProfileDisplay) => (
                              <Option
                                key={vehicle.vehicle_id}
                                value={vehicle.vehicle_id}
                                label={vehicle.license_plate}
                              >
                                <div>
                                  <div style={{ fontWeight: 500 }}>
                                    {vehicle.license_plate}
                                  </div>
                                  <div style={{ fontSize: 12, color: "#666" }}>
                                    {vehicle.brand_name} {vehicle.model_name} •{" "}
                                    {vehicle.type_name}
                                  </div>
                                </div>
                              </Option>
                            ))}
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
            {
              key: "new",
              label: <span>Khách vãng lai</span>,
              children: renderNewCustomerForm(),
            },
          ]}
        />
      </Card>
    </div>
  );

  const renderServiceSelectionStep = () => (
    <div>
      <Card size="small" title="Chọn dịch vụ" style={{ marginBottom: 16 }}>
        {selectedBranch && isLoadingInventory && (
          <Alert
            message="Đang kiểm tra tồn kho..."
            description="Vui lòng đợi trong giây lát"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        {selectedBranch &&
          !isLoadingInventory &&
          availableServices.length === 0 &&
          allPriceBookServices.length > 0 && (
            <Alert
              message="Không có dịch vụ khả dụng"
              description="Tất cả dịch vụ tại chi nhánh này đều thiếu hàng. Vui lòng chọn chi nhánh khác hoặc liên hệ quản lý để nhập hàng."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
        <Form.Item
          name="services"
          label="Dịch vụ chăm sóc xe"
          rules={[
            { required: true, message: "Vui lòng chọn ít nhất một dịch vụ" },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Chọn dịch vụ chăm sóc xe"
            onChange={handleServiceChange}
            optionLabelProp="label"
            loading={isLoadingPriceBooks || isLoadingInventory}
            showSearch
            filterOption={(input, option) => {
              const label = option?.label?.toString() || "";
              const searchText = input.toLowerCase();
              // Tìm kiếm theo tên dịch vụ
              if (label.toLowerCase().includes(searchText)) {
                return true;
              }
              // Tìm kiếm theo mô tả dịch vụ
              const item = availableServices.find(
                (s) => s.item_id === option?.value
              );
              if (item?.service?.description) {
                return item.service.description
                  .toLowerCase()
                  .includes(searchText);
              }
              return false;
            }}
            notFoundContent={
              isLoadingPriceBooks || isLoadingInventory
                ? "Đang tải dịch vụ..."
                : priceBooksError
                ? `Lỗi tải dịch vụ: ${
                    (priceBooksError as { response?: { data?: unknown } })
                      ?.response?.data || "Không thể tải danh sách dịch vụ"
                  }`
                : availableServices.length === 0 && selectedBranch
                ? "Không có dịch vụ khả dụng tại chi nhánh này (thiếu hàng)"
                : availableServices.length === 0
                ? "Không có dịch vụ nào trong hệ thống"
                : "Không tìm thấy dịch vụ phù hợp"
            }
          >
            {availableServices.map((item, index) => (
              <Option
                key={`${item.item_id}-${index}`}
                value={item.item_id}
                label={item.item_name}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {item.item_name}
                      <Tag color="blue" style={{ marginLeft: 8, fontSize: 10 }}>
                        Dịch vụ
                      </Tag>
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {item.service?.description || "Không có mô tả"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#52c41a", fontWeight: 500 }}>
                      {item.fixed_price?.toLocaleString()} VNĐ
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {item.service?.estimated_duration || 0} phút
                    </div>
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedItems.length > 0 && (
          <div style={{ marginTop: 16 }}>
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
                      {formatDurationVer01(totalDuration)}
                    </Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Thời gian dự kiến
                  </Text>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Card>
    </div>
  );

  const renderDateTimeBranchStep = () => (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Card size="small" title="Thời gian" style={{ marginBottom: 16 }}>
            <Form.Item
              name="bookingDate"
              label="Ngày đặt lịch"
              rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Chọn ngày"
                disabledDate={(current) => {
                  return false; // Allow all dates for testing
                }}
                onChange={(date) => {
                  const newDate = date ? date.format("YYYY-MM-DD") : "";
                  setBookingDate(newDate);
                }}
              />
            </Form.Item>
          </Card>
        </Col>

        <Col span={12}>
          <Card size="small" title="Chi nhánh" style={{ marginBottom: 16 }}>
            <Form.Item
              name="branchId"
              label="Chọn chi nhánh"
              rules={[{ required: true, message: "Vui lòng chọn chi nhánh" }]}
            >
              <Select
                placeholder="Chọn chi nhánh"
                optionLabelProp="label"
                onChange={handleBranchChange}
                loading={isLoadingBranches}
                showSearch
                filterOption={(input, option) => {
                  const childrenText =
                    typeof option?.children === "string" ? option.children : "";
                  const labelText =
                    typeof option?.label === "string" ? option.label : "";
                  return (
                    childrenText.toLowerCase().includes(input.toLowerCase()) ||
                    labelText.toLowerCase().includes(input.toLowerCase())
                  );
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
                        {branch.address}
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

  // Render bay recommendation and queue
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
                            if (
                              bayRecommendation?.queue &&
                              Array.isArray(bayRecommendation.queue)
                            ) {
                              console.log(
                                " Restoring original queue from recommendation"
                              );
                              setQueueItems(
                                bayRecommendation.queue as unknown as typeof queueItems
                              );
                            } else if (
                              bayRecommendation?.recommended_bay?.bay_id
                            ) {
                              console.log(
                                " Loading queue for recommended bay:",
                                bayRecommendation.recommended_bay.bay_id
                              );
                              const queue = await getBayQueue(
                                bayRecommendation.recommended_bay.bay_id,
                                bookingDate
                              );
                              console.log(
                                " Queue loaded for recommended bay:",
                                queue
                              );
                              setQueueItems(
                                queue as unknown as typeof queueItems
                              );
                            }
                          } catch (error) {
                            console.log(
                              " Error loading queue for recommended bay:",
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
                            const queue = await getBayQueue(
                              bay.bay_id,
                              bookingDate
                            );
                            console.log(" Queue loaded for bay:", queue);
                            setQueueItems(
                              queue as unknown as typeof queueItems
                            );
                          } catch (error) {
                            console.log(" Error loading queue for bay:", error);
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
              console.log(" Queue items debug:", {
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
        <div>
          <Alert
            message="Chưa có đề xuất bay"
            description="Vui lòng chọn chi nhánh và dịch vụ để hệ thống đề xuất bay phù hợp"
            type="warning"
            style={{ marginBottom: 16 }}
          />

          {/* Fallback: Manual bay selection */}
          {selectedBranch && selectedItems.length > 0 && (
            <Card title="Chọn bay thủ công" style={{ marginBottom: 16 }}>
              <Text strong style={{ marginBottom: 16, display: "block" }}>
                Các bay xử lý tại chỗ có sẵn:
              </Text>
              {isLoadingServiceBays ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Spin />
                  <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                    Đang tải danh sách bay...
                  </div>
                </div>
              ) : onSiteBays.length === 0 ? (
                <Alert
                  message="Không có bay xử lý tại chỗ"
                  description="Tất cả bay đều cho phép đặt lịch trước"
                  type="info"
                />
              ) : (
                <Row gutter={8}>
                  {onSiteBays.map((bay) => (
                    <Col span={6} key={bay.bay_id}>
                      <Card
                        size="small"
                        hoverable
                        style={{
                          textAlign: "center",
                          border:
                            selectedWalkInBay === bay.bay_id
                              ? "2px solid #52c41a"
                              : "1px solid #fa8c16",
                          backgroundColor:
                            selectedWalkInBay === bay.bay_id
                              ? "#f6ffed"
                              : "#fff7e6",
                          opacity: 0.9,
                        }}
                        onClick={async () => {
                          setSelectedWalkInBay(bay.bay_id);
                          setManualBaySelection(true);

                          // Load queue for the selected bay
                          setIsLoadingQueue(true);
                          try {
                            console.log(
                              " Loading queue for selected bay:",
                              bay.bay_id
                            );
                            const queue = await getBayQueue(
                              bay.bay_id,
                              bookingDate
                            );
                            console.log(" Queue loaded for bay:", queue);
                            setQueueItems(
                              queue as unknown as typeof queueItems
                            );
                          } catch (error) {
                            console.log(" Error loading queue for bay:", error);
                            setQueueItems([]);
                          } finally {
                            setIsLoadingQueue(false);
                          }
                        }}
                      >
                        <ShopOutlined
                          style={{ fontSize: 24, color: "#fa8c16" }}
                        />
                        <div style={{ marginTop: 8 }}>
                          <Text strong style={{ color: "#fa8c16" }}>
                            {bay.bay_name}
                          </Text>
                        </div>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          {bay.bay_code || `Bay ${bay.bay_id.slice(-2)}`}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "#fa8c16",
                            marginTop: 4,
                          }}
                        >
                          🔧 Xử lý tại chỗ
                        </div>
                        {selectedWalkInBay === bay.bay_id && (
                          <div
                            style={{
                              fontSize: 10,
                              color: "#52c41a",
                              marginTop: 4,
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
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );

  const renderSlotSelectionStep = () => {
    console.log(" renderSlotSelectionStep:", {
      selectedBranch: !!selectedBranch,
      bookingDate: !!bookingDate,
      bookingDateValue: bookingDate,
      customerType,
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
              message="Vui lòng chọn dịch vụ, chi nhánh và ngày trước"
              description="Bạn cần chọn dịch vụ, chi nhánh và ngày để xem các thời gian có sẵn"
              type="warning"
              showIcon
            />
          ) : (
            <Tabs
              defaultActiveKey={customerType === "new" ? "onsite" : "booking"}
              onChange={(key) => {
                // Reset slot selection when switching between booking and onsite tabs
                if (key === "onsite") {
                  setSelectedBay(null);
                  setSelectedSlot(null);
                  setAvailableSlots([]);
                }
              }}
              items={[
                // Only show booking tab for existing customers
                ...(customerType === "existing"
                  ? [
                      {
                        key: "booking",
                        label: <span>Đặt lịch</span>,
                        children: (
                          <div>
                            <Row gutter={16} style={{ marginBottom: 16 }}>
                              <Col span={24}>
                                <Text strong>Chọn khu vực chăm sóc:</Text>
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
                                <Text strong>Chọn giờ chăm sóc:</Text>
                                <div style={{ marginTop: 8 }}>
                                  {loadingSlots ? (
                                    <div
                                      style={{
                                        textAlign: "center",
                                        padding: "20px",
                                      }}
                                    >
                                      <Spin />
                                      <div
                                        style={{
                                          marginTop: 8,
                                          fontSize: 12,
                                          color: "#666",
                                        }}
                                      >
                                        Đang tải thời gian...
                                      </div>
                                    </div>
                                  ) : availableSlots.length === 0 ? (
                                    <Alert
                                      message="Không có thời gian khả dụng"
                                      description="Không có thời gian nào phù hợp với thời gian dịch vụ đã chọn"
                                      type="warning"
                                      showIcon
                                    />
                                  ) : (
                                    <Row gutter={8}>
                                      {availableSlots.map((slot, index) => {
                                        const canSelect = canSelectSlot(slot);
                                        const isSelected =
                                          selectedSlot?.startTime === slot.time;
                                        return (
                                          <Col
                                            span={2}
                                            key={`${slot.time}-${index}`}
                                          >
                                            <Tooltip
                                              title={
                                                canSelect
                                                  ? `Chọn thời gian ${slot.time} (${totalDuration} phút)`
                                                  : "Thời gian không khả dụng"
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
                                              </Card>
                                            </Tooltip>
                                          </Col>
                                        );
                                      })}
                                    </Row>
                                  )}
                                </div>

                                {selectedSlot && (
                                  <Alert
                                    message={`Thời Gian Đã Chọn: ${selectedSlot.startTime}`}
                                    description={`Khu Vực Chăm Sóc: ${
                                      selectedSlot.bayName
                                    } • Ngày: ${
                                      selectedSlot.date
                                    } - Thời lượng: ${
                                      selectedSlot.serviceDurationMinutes
                                    } phút - Thời gian kết thúc dự kiến: ${dayjs(
                                      selectedSlot.startTime,
                                      "HH:mm"
                                    )
                                      .add(
                                        selectedSlot.serviceDurationMinutes,
                                        "minute"
                                      )
                                      .format("HH:mm")}`}
                                    type="success"
                                    showIcon
                                    style={{ marginTop: 16 }}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        ),
                      },
                    ]
                  : []),
                // Always show onsite tab
                {
                  key: "onsite",
                  label: <span>Xử lý tại chỗ ({onSiteBays.length})</span>,
                  children: renderBayRecommendation(),
                },
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
    <App>
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarOutlined style={{ color: "#1890ff" }} />
            <span>Đặt lịch chăm sóc xe</span>
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
            loading={loading || createBookingWithSlotMutation.isPending}
            onClick={handleSubmit}
            disabled={(() => {
              console.log(
                "🔍 Button disabled check called at:",
                new Date().toISOString()
              );
              console.log(" Current selectedSlot state:", selectedSlot);

              // Check if new customer has all required fields
              const newCustomerValid =
                customerType === "new"
                  ? newCustomer?.full_name &&
                    newCustomer?.phone_number &&
                    // Email is optional, not required
                    newVehicle?.license_plate &&
                    newVehicle?.brand_name &&
                    newVehicle?.model_name &&
                    newVehicle?.type_name &&
                    newVehicle?.color
                  : true;

              const isDisabled =
                !selectedBranch ||
                selectedItems.length === 0 ||
                (customerType === "existing" &&
                  (!selectedCustomer || !selectedVehicle)) ||
                (customerType === "new" && !newCustomerValid) ||
                // For walk-in booking (onsite processing), need selectedWalkInBay
                (customerType === "new" && !selectedWalkInBay) ||
                // For existing customer, need either selectedWalkInBay OR selectedSlot
                (customerType === "existing" &&
                  !selectedWalkInBay &&
                  !selectedSlot);

              console.log(" Button disabled check:", {
                selectedBranch: !!selectedBranch,
                selectedItems: selectedItems.length,
                customerType,
                selectedCustomer: !!selectedCustomer,
                selectedVehicle: !!selectedVehicle,
                newCustomer: !!newCustomer,
                newVehicle: !!newVehicle,
                newCustomerValid,
                selectedWalkInBay: !!selectedWalkInBay,
                selectedSlot: !!selectedSlot,
                selectedSlotDetails: selectedSlot,
                isDisabled,
                // Debug the specific condition
                existingCustomerCondition:
                  customerType === "existing" &&
                  !selectedWalkInBay &&
                  !selectedSlot,
                walkInCondition: customerType === "new" && !selectedWalkInBay,
                newCustomerDetails:
                  customerType === "new"
                    ? {
                        name: newCustomer?.full_name,
                        phone: newCustomer?.phone_number,
                        email: newCustomer?.email,
                        plate: newVehicle?.license_plate,
                        brand: newVehicle?.brand_name,
                        model: newVehicle?.model_name,
                        type: newVehicle?.type_name,
                        color: newVehicle?.color,
                      }
                    : null,
              });

              return isDisabled;
            })()}
          >
            Đặt lịch
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
          initialValues={{
            priority: "NORMAL",
            bookingDate: dayjs(), // Set default date to today
          }}
        >
          {/* All Content */}
          {renderAllContent()}
        </Form>
      </Modal>
    </App>
  );
};

export default BookingModal;
