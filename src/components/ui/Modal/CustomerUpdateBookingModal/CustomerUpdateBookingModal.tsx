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
          console.log("🔍 Adding original bay to displayBays:", originalBay);
          bays.push(originalBay); // Add the original bay even if it doesn't pass filter
        }
      }
      // Also include selectedBay if it exists (might be from allServiceBays)
      if (selectedBay && !bayInList) {
        const selectedBayInList = bays.find(
          (b) => b.bay_id === selectedBay.bay_id
        );
        if (!selectedBayInList) {
          console.log("🔍 Adding selectedBay to displayBays:", selectedBay);
          bays.push(selectedBay);
        }
      }
    }
    return bays;
  }, [serviceBays, allServiceBays, initialData?.bay_id, open, selectedBay]);

  // Get all services from price books (filter for services only)
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
          }
        });
      }
    });
    return allItems;
  }, [priceBooksData, priceBooksError]);

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
        console.log("🔄 Loading available slots:", {
          bay_id: selectedBay.bay_id,
          date: bookingDate,
          duration_minutes: duration,
          totalDuration: duration,
          selectedItems: selectedItems.map((item) => ({
            item_name: item.item_name,
            service_name: item.service?.service_name,
            estimated_duration: item.service?.estimated_duration,
          })),
          calculatedDuration: selectedItems.reduce((sum, item) => {
            if (item.service) {
              return sum + (item.service.estimated_duration || 60);
            }
            return sum;
          }, 0),
        });

        // Get available time ranges from backend
        const timeRangesResponse =
          await BookingScheduleService.getAvailableTimeRanges({
            bay_id: selectedBay.bay_id,
            date: bookingDate,
            duration_minutes: duration,
          });

        // Extract current booking time for analysis
        const currentBookingStart = initialData?.scheduled_start_at
          ? initialData.scheduled_start_at.split("T")[1]?.substring(0, 5)
          : null;
        const currentBookingEnd = initialData?.scheduled_end_at
          ? initialData.scheduled_end_at.split("T")[1]?.substring(0, 5)
          : null;

        console.log("📊 Backend time ranges response:", {
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
          requestedDuration: duration,
          currentBooking: initialData?.booking_id
            ? {
                booking_id: initialData.booking_id,
                scheduled_start_at: initialData.scheduled_start_at,
                scheduled_end_at: initialData.scheduled_end_at,
                start_time: currentBookingStart,
                end_time: currentBookingEnd,
                note: "Current booking time slot (should be excluded from available ranges)",
              }
            : null,
          note: "Requested duration should match totalDuration (sum of service estimated_duration). Backend should exclude current booking automatically.",
        });

        // Detailed analysis of ranges
        if (
          timeRangesResponse.available_time_ranges &&
          timeRangesResponse.available_time_ranges.length > 0
        ) {
          const range1 = timeRangesResponse.available_time_ranges[0];
          const range2 = timeRangesResponse.available_time_ranges[1];

          // Parse times for comparison
          const parseTimeToMinutes = (timeStr: string) => {
            const [hours, minutes] = timeStr.split(":").map(Number);
            return hours * 60 + minutes;
          };

          const range1StartMin = range1
            ? parseTimeToMinutes(range1.start_time)
            : 0;
          const range1EndMin = range1 ? parseTimeToMinutes(range1.end_time) : 0;
          const range2StartMin = range2
            ? parseTimeToMinutes(range2.start_time)
            : 0;
          const range2EndMin = range2 ? parseTimeToMinutes(range2.end_time) : 0;
          const slot8_30StartMin = parseTimeToMinutes("08:30");
          const slot8_30EndMin = parseTimeToMinutes("09:00");
          const slot9_00StartMin = parseTimeToMinutes("09:00");
          const slot9_00EndMin = parseTimeToMinutes("09:30");

          console.log("🔍 Detailed range analysis:", {
            range1: range1
              ? {
                  start: range1.start_time,
                  end: range1.end_time,
                  startMinutes: range1StartMin,
                  endMinutes: range1EndMin,
                  canCover8_30_9_00:
                    range1StartMin <= slot8_30StartMin &&
                    range1EndMin >= slot8_30EndMin,
                  canCover9_00_9_30:
                    range1StartMin <= slot9_00StartMin &&
                    range1EndMin >= slot9_00EndMin,
                  explanation: `Range ${range1.start_time}-${range1.end_time} ${
                    range1StartMin <= slot8_30StartMin &&
                    range1EndMin >= slot8_30EndMin
                      ? "CAN"
                      : "CANNOT"
                  } cover slot 8:30-9:00, ${
                    range1StartMin <= slot9_00StartMin &&
                    range1EndMin >= slot9_00EndMin
                      ? "CAN"
                      : "CANNOT"
                  } cover slot 9:00-9:30`,
                }
              : null,
            range2: range2
              ? {
                  start: range2.start_time,
                  end: range2.end_time,
                  startMinutes: range2StartMin,
                  endMinutes: range2EndMin,
                  canCover8_30_9_00:
                    range2StartMin <= slot8_30StartMin &&
                    range2EndMin >= slot8_30EndMin,
                  canCover9_00_9_30:
                    range2StartMin <= slot9_00StartMin &&
                    range2EndMin >= slot9_00EndMin,
                  explanation: `Range ${range2.start_time}-${range2.end_time} ${
                    range2StartMin <= slot8_30StartMin &&
                    range2EndMin >= slot8_30EndMin
                      ? "CAN"
                      : "CANNOT"
                  } cover slot 8:30-9:00, ${
                    range2StartMin <= slot9_00StartMin &&
                    range2EndMin >= slot9_00EndMin
                      ? "CAN"
                      : "CANNOT"
                  } cover slot 9:00-9:30`,
                }
              : null,
            currentBooking:
              currentBookingStart && currentBookingEnd
                ? {
                    start: currentBookingStart,
                    end: currentBookingEnd,
                    startMinutes: parseTimeToMinutes(currentBookingStart),
                    endMinutes: parseTimeToMinutes(currentBookingEnd),
                    note: "This booking should be excluded from available ranges. Backend should merge ranges around this booking.",
                  }
                : null,
            expectedForSlot8_30:
              "Backend should return a range that covers 8:30-9:00 (e.g., 8:00-9:00 or 8:30-9:00) if booking 9:00-9:30 is excluded",
            expectedForSlot9_00:
              "Backend should return a range that covers 9:00-9:30 (e.g., 9:00-18:00) if booking 9:00-9:30 is excluded, OR slot 9:00 should be marked as current booking",
            allRanges: timeRangesResponse.available_time_ranges.map(
              (r, idx) => ({
                index: idx + 1,
                start: r.start_time,
                end: r.end_time,
                startMinutes: parseTimeToMinutes(r.start_time),
                endMinutes: parseTimeToMinutes(r.end_time),
              })
            ),
            conclusion:
              "If no range covers 8:30-9:00, backend is NOT excluding current booking correctly. Backend should merge 8:00-8:30 and 8:30-9:00 into 8:00-9:00 when booking 9:00-9:30 is excluded.",
          });
        }

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
          console.log("✅ Loaded slots:", slots.length);
          const slot8_00 = slots.find((s) => s.time === "08:00");
          const slot8_30 = slots.find((s) => s.time === "08:30");
          const slot9_00 = slots.find((s) => s.time === "09:00");
          console.log("📋 Slots availability:", {
            slots8_00: slot8_00,
            slots8_30: slot8_30,
            slots9_00: slot9_00,
            slot8_00Available: slot8_00?.isAvailable,
            slot8_30Available: slot8_30?.isAvailable,
            slot9_00Available: slot9_00?.isAvailable,
            allSlots: slots.map((s) => ({
              time: s.time,
              isAvailable: s.isAvailable,
            })),
          });

          // Debug: Why slot 8:00 or 8:30 is not available?
          if (slot8_00 && !slot8_00.isAvailable) {
            console.warn("⚠️ Slot 8:00 is NOT available! Checking why...", {
              slot8_00,
              timeRanges: timeRangesResponse.available_time_ranges,
              serviceDuration: duration,
              requestedDuration: duration,
              note: "If slot 8:00 is not available, it means no time range covers 8:00-8:30",
            });
          }
          if (slot8_30 && !slot8_30.isAvailable) {
            console.warn("⚠️ Slot 8:30 is NOT available! Checking why...", {
              slot8_30,
              timeRanges: timeRangesResponse.available_time_ranges,
              serviceDuration: duration,
              requestedDuration: duration,
              note: "If slot 8:30 is not available, it means no time range covers 8:30-9:00 (or there's a booking at 8:30)",
            });
          }
          setAvailableSlots(slots);
        } else {
          console.log("⚠️ No working hours or time ranges in response");
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error("❌ Error loading available time ranges:", error);
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
      console.log("🔄 Booking date changed, resetting slot:", {
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

      // Set booking date
      console.log("🔍 Setting booking date:", {
        scheduled_start_at: initialData.scheduled_start_at,
        booking_code: initialData.booking_code,
      });

      // Determine booking type first with fallback
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
          "⚠️ No booking date set - no scheduled_start_at for slot booking"
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
            console.log(
              "🔧 Setting selectedVehicle from initialData:",
              vehicle
            );
            setSelectedVehicle(vehicle);
          } else {
            console.warn("⚠️ Vehicle not found in userVehicles:", {
              vehicleId: initialData.vehicle_id,
              userVehiclesLength: userVehicles.length,
            });
          }
        } else {
          console.log(
            "⏳ userVehicles not loaded yet, will set in separate useEffect"
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
        console.log(
          "🔍 Initializing services from booking items (after availableServices loaded):",
          {
            booking_items: initialData.booking_items,
            availableServicesCount: availableServices.length,
          }
        );

        const services: PriceBookItem[] = [];
        const seenServiceIds = new Set<string>(); // Track already added services

        initialData.booking_items.forEach((item) => {
          console.log("🔍 Processing booking item:", {
            service_id: item.service_id,
            service_name: item.service_name,
          });

          if (item.service_id && !seenServiceIds.has(item.service_id)) {
            // Find the service in price books
            const priceBookItem = availableServices.find(
              (service) => service.service?.service_id === item.service_id
            );
            if (priceBookItem && !seenServiceIds.has(priceBookItem.item_id)) {
              console.log("✅ Found matching service:", {
                item_id: priceBookItem.item_id,
                item_name: priceBookItem.item_name,
                service: priceBookItem.service
                  ? priceBookItem.service.service_name
                  : null,
                duration: priceBookItem.service?.estimated_duration || 60,
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
          }
        });

        // Remove duplicates by item_id (additional safety check)
        const uniqueServices = services.filter(
          (service, index, self) =>
            index === self.findIndex((s) => s.item_id === service.item_id)
        );

        console.log("📋 Final services array:", {
          originalCount: services.length,
          uniqueCount: uniqueServices.length,
          services: uniqueServices.map((s) => ({
            item_id: s.item_id,
            item_name: s.item_name,
            duration: s.service?.estimated_duration || 60,
            service: s.service ? s.service.service_name : null,
          })),
        });

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
          console.log("⚠️ No matching services found in availableServices");
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
      console.log("⚠️ No booking items found in initialData");
      setOriginalItems([]);
      const originalDuration = initialData.estimated_duration_minutes || 0;
      setOriginalTotalDuration(originalDuration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          "🔧 Setting selectedVehicle from initialData (after userVehicles loaded):",
          vehicle
        );
        setSelectedVehicle(vehicle);
      } else {
        console.warn("⚠️ Vehicle not found in userVehicles:", {
          vehicleId: initialData.vehicle_id,
          userVehiclesLength: userVehicles.length,
          vehicleIds: userVehicles.map((v) => v.vehicle_id),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        console.log("🔧 Setting selectedBay from initialData:", bay);
        setSelectedBay(bay);
      } else if (initialData.bay_id && !bay) {
        console.warn("⚠️ Bay not found:", {
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

      console.log("🔧 Setting selectedSlot from initialData:", initialSlot);
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

    console.log("🔍 Building booking_items array:", {
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
        console.warn("⚠️ Skipping item without service_id:", item);
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

  // Handle service selection change (same logic as UpdateBookingModal)
  const handleServiceChange = useCallback(
    (selectedServiceIds: string[]) => {
      console.log("🔄 Service selection changed (from Select component):", {
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

      console.log("✅ Selected services:", {
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

  // Check if service duration exceeds total time of originally booked slots
  // Compare: total service duration vs total slot time (number of slots × 60 minutes per slot)
  const isDurationExceedsOriginal = useMemo(() => {
    const { isSlot: isSlotBooking } = detectBookingType(initialData);
    if (!isSlotBooking || !originalTotalDuration) {
      return false;
    }

    // Calculate number of slots originally booked based on original service duration
    // Each slot is 60 minutes
    const SLOT_DURATION_MINUTES = 60;
    const originalSlotCount = Math.ceil(
      originalTotalDuration / SLOT_DURATION_MINUTES
    );
    const totalOriginalSlotTime = originalSlotCount * SLOT_DURATION_MINUTES;

    // Compare new service duration with total original slot time
    return totalDuration > totalOriginalSlotTime;
  }, [totalDuration, originalTotalDuration, initialData.booking_code]);

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
      console.log("🖱️ handleSlotSelect called:", {
        slotTime: slot.time,
        canSelect: canSelectSlot(slot),
        selectedBay: selectedBay?.bay_id,
        isDurationExceedsOriginal,
        bookingDate,
        totalDuration,
      });

      // Prevent time selection if duration exceeds original time
      if (isDurationExceedsOriginal) {
        message.warning({
          content:
            "Không thể đổi thời gian khi dịch vụ vượt quá thời gian chăm sóc ban đầu. Vui lòng chọn lại dịch vụ.",
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

        console.log("✅ Setting new slot:", newSlot);
        setSelectedSlot(newSlot);
        setIsSlotChanged(true);
      } else {
        console.log("❌ Cannot select slot:", {
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
        const SLOT_DURATION_MINUTES = 60;
        const originalSlotCount = Math.ceil(
          originalTotalDuration / SLOT_DURATION_MINUTES
        );
        const totalOriginalSlotTime = originalSlotCount * SLOT_DURATION_MINUTES;

        message.error({
          content: `Tổng thời gian dịch vụ (${totalDuration} phút) vượt quá tổng thời gian các thời gian đã đặt ban đầu (${totalOriginalSlotTime} phút - ${originalSlotCount} thời gian × ${SLOT_DURATION_MINUTES} phút/thời gian). Vui lòng chọn lại dịch vụ phù hợp với thời gian thời gian chăm sóc hiện tại.`,
          duration: 5,
        });
        return;
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
        label="Chọn xe"
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

      {selectedVehicle && (
        <Alert
          message={`Xe: ${selectedVehicle.license_plate}`}
          description={`${selectedVehicle.brand_name} ${selectedVehicle.model_name} • ${selectedVehicle.type_name}`}
          type="info"
          style={{ marginTop: 8 }}
        />
      )}
    </Card>
  );

  // Render service selection
  const renderServiceSelection = () => (
    <Card size="small" title="Dịch vụ" style={{ marginBottom: 16 }}>
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
                {item.item_name} - {item.fixed_price?.toLocaleString()} VNĐ
              </Tag>
            ))}
          </div>
        </div>
      )}

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
              message="Cảnh báo thời gian dịch vụ"
              description={
                <div>
                  <div>
                    Tổng thời gian dịch vụ hiện tại:{" "}
                    <strong>{totalDuration} phút</strong>
                  </div>
                  <div>
                    Tổng thời gian các slot đã đặt:{" "}
                    <strong>{totalOriginalSlotTime} phút</strong> (
                    {originalSlotCount} slot × {SLOT_DURATION_MINUTES}{" "}
                    phút/slot)
                  </div>
                  <div style={{ marginTop: 8, color: "#ff4d4f" }}>
                    ⚠️ Tổng thời gian dịch vụ vượt quá tổng thời gian các thời
                    gian đã đặt ban đầu. Vui lòng chọn lại dịch vụ hoặc đặt lại
                    thời gian.
                  </div>
                </div>
              }
              type="error"
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
      <Card
        size="small"
        title="Thời gian và địa điểm"
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="bookingDate" label="Ngày đặt lịch" rules={[]}>
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
          </Col>

          <Col span={12}>
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
                  const SLOT_DURATION_MINUTES = 60;
                  const originalSlotCount =
                    originalTotalDuration > 0
                      ? Math.ceil(originalTotalDuration / SLOT_DURATION_MINUTES)
                      : 1;
                  const totalOriginalSlotTime =
                    originalSlotCount * SLOT_DURATION_MINUTES;

                  return (
                    <Alert
                      message="Không thể đổi thời gian"
                      description={`Tổng thời gian dịch vụ (${totalDuration} phút) vượt quá tổng thời gian các thời gian đã đặt ban đầu (${totalOriginalSlotTime} phút - ${originalSlotCount} thời gian × ${SLOT_DURATION_MINUTES} phút/thời gian). Bạn chỉ có thể chọn lại dịch vụ phù hợp với thời gian thời gian chăm sóc hiện tại.`}
                      type="error"
                      showIcon
                      style={{ marginTop: 8, marginBottom: 8 }}
                    />
                  );
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
                    ? `Chọn Thời Gian Chăm Sóc Trong ${selectedBay.bay_name}:`
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
                            const SLOT_DURATION_MINUTES = 60;
                            const originalSlotCount =
                              originalTotalDuration > 0
                                ? Math.ceil(
                                    originalTotalDuration /
                                      SLOT_DURATION_MINUTES
                                  )
                                : 1;
                            const totalOriginalSlotTime =
                              originalSlotCount * SLOT_DURATION_MINUTES;
                            tooltipMessage = `Không thể đổi thời gian. Dịch vụ (${totalDuration} phút) vượt quá tổng thời gian các thời gian đã đặt ban đầu (${totalOriginalSlotTime} phút - ${originalSlotCount} thời gian). Vui lòng chọn lại dịch vụ.`;
                          } else {
                            tooltipMessage = "Thời gian không khả dụng";
                          }
                        }

                        return (
                          <Col span={4} key={`${slot.time}-${index}`}>
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
                                    color: canSelect ? "#52c41a" : "#ff4d4f",
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
                                    color: canSelect ? "#000" : "#999",
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
      </Card>
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
            console.log("🔍 Button disabled check:", {
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

        {/* Vehicle Selection */}
        {renderVehicleSelection()}

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
