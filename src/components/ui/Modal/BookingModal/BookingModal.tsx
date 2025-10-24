"use client";
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
import {
  BookingScheduleService,
  TimeSlotDto,
} from "@/lib/api/services/booking-schedule.service";
import { useWalkInBooking } from "@/lib/api/hooks/useWalkInBooking";
import { UserManagementInfo } from "@/lib/api/types/user.types";
import { VehicleProfileDisplay } from "@/lib/api/types/vehicle-profile.types";
import { BranchDisplay } from "@/lib/api/types/branch.types";
import { PriceBookItem } from "@/lib/api/types/price-book.types";
// import { SkillLevel } from "@/lib/api/types/service.types"; // Removed unused import
import { ServiceBay } from "@/lib/api/types/service-bay.types";

const { Option } = Select;
const { Text } = Typography;

// Priority levels (commented out as not used)
// const priorityLevels = [
//   { value: "NORMAL", label: "Bình thường", icon: "⚪" },
//   { value: "HIGH", label: "Cao", icon: "🟡" },
//   { value: "URGENT", label: "Khẩn cấp", icon: "🔴" },
// ];

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

interface BookingModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (bookingData: unknown) => void;
  loading?: boolean;
}

// Types for slot selection - now using TimeSlotDto from API
type SlotInfo = TimeSlotDto;

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
}) => {
  const [form] = Form.useForm();
  const formRef = useRef(form);

  // Update form ref when form changes
  useEffect(() => {
    formRef.current = form;
  }, [form]);

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
  const [selectedBranch, setSelectedBranch] = useState<BranchDisplay | null>(
    null
  );

  // Walk-in booking state
  const [selectedWalkInBay, setSelectedWalkInBay] = useState<string | null>(
    null
  );
  const [selectedItems, setSelectedItems] = useState<PriceBookItem[]>([]);
  const [selectedBay, setSelectedBay] = useState<ServiceBay | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);

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

  // Data states
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [bookingDate, setBookingDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<SlotInfo[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // API hooks
  const createBookingWithSlotMutation = useCreateBookingWithSlot();
  const { createWalkInBooking, recommendBay, getBayQueue } = useWalkInBooking();

  // Helper function to ensure queueItems is always an array
  const getSafeQueueItems = useCallback(() => {
    if (!Array.isArray(queueItems)) {
      console.warn("⚠️ queueItems is not an array:", queueItems);
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
  const availableServices = useMemo(() => {
    if (priceBooksError) {
      console.error("Error loading price books:", priceBooksError);
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

  // Load available slots from API
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

      // Remove duplicate slots based on startTime and endTime
      const uniqueSlots = slots.filter(
        (slot, index, self) =>
          index ===
          self.findIndex(
            (s) => s.startTime === slot.startTime && s.endTime === slot.endTime
          )
      );
      setAvailableSlots(uniqueSlots);
    } catch (error) {
      console.error("Error loading available slots:", error);
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
          "NORMAL"
        );

        console.log("✅ Bay recommendation received:", recommendation);
        console.log("🔍 Recommendation structure:", {
          hasRecommendedBay: !!recommendation?.recommended_bay,
          hasQueue: !!recommendation?.queue,
          queueType: typeof recommendation?.queue,
          queueIsArray: Array.isArray(recommendation?.queue),
          queueLength: recommendation?.queue?.length,
        });

        setBayRecommendation(recommendation);
        setSelectedWalkInBay(recommendation?.recommended_bay?.bay_id || null);

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
            recommendation.recommended_bay.bay_id
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
        console.error("❌ Error getting bay recommendation:", error);
        setBayRecommendation(null);
        setQueueItems([]);
      } finally {
        setIsLoadingRecommendation(false);
      }
    };

    getBayRecommendation();
  }, [selectedBranch, selectedItems, totalDuration, recommendBay, getBayQueue]);

  // Check if slot is suitable for service duration
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
      setTotalPrice(0);
      setTotalDuration(0);
      setBookingDate("");
    }
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
      // Use formRef to avoid circular reference
      if (formRef.current) {
        formRef.current.setFieldValue("vehicleId", undefined);
      }
    },
    [customers]
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
    },
    [branches]
  );

  const handleServiceChange = useCallback(
    (itemIds: string[]) => {
      const items = availableServices.filter((item) =>
        itemIds.includes(item.item_id)
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
      if (canSelectSlot(slot)) {
        setSelectedSlot({
          bayId: slot.bayId,
          bayName: slot.bayName,
          date: bookingDate,
          startTime: slot.startTime,
          serviceDurationMinutes: totalDuration,
        });
      }
    },
    [canSelectSlot, bookingDate, totalDuration]
  );

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

      // Check if using new customer or existing customer
      const isNewCustomer = customerType === "new" && newCustomer && newVehicle;
      const isExistingCustomer =
        customerType === "existing" && selectedCustomer && selectedVehicle;

      console.log("Customer checks:", { isNewCustomer, isExistingCustomer });

      if (!isNewCustomer && !isExistingCustomer) {
        console.error("❌ Missing required information for booking");
        console.error(
          "isNewCustomer:",
          isNewCustomer,
          "isExistingCustomer:",
          isExistingCustomer
        );
        return;
      }

      // For both new and existing customers, use walk-in booking (no slot selection)
      if (isNewCustomer || isExistingCustomer) {
        if (!selectedBranch) {
          console.error("Missing branch information for new customer");
          return;
        }

        // Create Walk-in Booking for both new and existing customers
        console.log(
          "Creating walk-in booking for customer type:",
          customerType
        );
        try {
          const walkInData = {
            customerType: isNewCustomer
              ? ("NEW" as const)
              : ("EXISTING" as const),
            customerId: isNewCustomer ? undefined : selectedCustomer?.user_id,
            vehicleId: isNewCustomer ? undefined : selectedVehicle?.vehicle_id,
            newCustomer: isNewCustomer
              ? {
                  name: newCustomer!.full_name,
                  phone: newCustomer!.phone_number,
                  email: newCustomer!.email || "",
                }
              : undefined,
            newVehicle: isNewCustomer
              ? {
                  licensePlate: newVehicle!.license_plate,
                  brand: newVehicle!.brand_name,
                  model: newVehicle!.model_name,
                  type: newVehicle!.type_name,
                  color: newVehicle!.color,
                  year: newVehicle!.year || new Date().getFullYear(),
                }
              : undefined,
            services: selectedItems.map((item) => ({
              service_id: item.service?.service_id || item.item_id,
              service_name: item.item_name,
              duration_minutes: item.service?.estimated_duration || 60,
              price: item.fixed_price || 0,
            })),
            assignedBayId: selectedWalkInBay || "",
            branchId: selectedBranch.branch_id,
            notes: values.notes || "",
            priority: "NORMAL" as const,
            specialRequests: [],
          };

          const walkInResponse = await createWalkInBooking(
            walkInData,
            selectedBranch.branch_id
          );
          console.log("Walk-in booking created:", walkInResponse);
          onOk(walkInResponse);
          return;
        } catch (walkInError) {
          console.error("Error creating walk-in booking:", walkInError);
          // Fallback to regular booking
          onOk({
            customerType: "new",
            customer: newCustomer,
            vehicle: newVehicle,
            branch: selectedBranch,
            services: selectedItems,
            totalPrice,
            totalDuration,
            notes: values.notes || "",
          });
          return;
        }
      }
    } catch (error) {
      console.error("Booking submission failed:", error);

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
        console.error("Validation errors:", errorFields);
        errorFields.forEach((field, index: number) => {
          console.error(`Field ${index + 1}:`, {
            name: field.name,
            errors: field.errors,
            warnings: field.warnings,
          });
        });
      }
    }
  };

  // Render all content in single form
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

              {/* Debug info */}
              <div
                style={{
                  marginTop: 8,
                  padding: 8,
                  backgroundColor: "#f0f0f0",
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                <div>
                  <strong>Debug Info:</strong>
                </div>
                <div>Customer Type: {customerType}</div>
                <div>New Customer: {newCustomer ? "Yes" : "No"}</div>
                <div>New Vehicle: {newVehicle ? "Yes" : "No"}</div>
                {newCustomer && (
                  <div>Customer Name: {newCustomer.full_name}</div>
                )}
                {newVehicle && (
                  <div>Vehicle Plate: {newVehicle.license_plate}</div>
                )}
              </div>
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

              {/* Debug info for vehicle */}
              <div
                style={{
                  marginTop: 8,
                  padding: 8,
                  backgroundColor: "#f0f0f0",
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                <div>
                  <strong>Vehicle Debug:</strong>
                </div>
                <div>License Plate: {newVehicle?.license_plate || "None"}</div>
                <div>Brand: {newVehicle?.brand_name || "None"}</div>
                <div>Model: {newVehicle?.model_name || "None"}</div>
                <div>Type: {newVehicle?.type_name || "None"}</div>
                <div>Color: {newVehicle?.color || "None"}</div>
              </div>
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
              label: <span>➕ Khách hàng mới</span>,
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
            loading={isLoadingPriceBooks}
            notFoundContent={
              isLoadingPriceBooks
                ? "Đang tải dịch vụ..."
                : priceBooksError
                ? `Lỗi tải dịch vụ: ${
                    (priceBooksError as { response?: { data?: unknown } })
                      ?.response?.data || "Không thể tải danh sách dịch vụ"
                  }`
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
            <Text strong>Dịch vụ đã chọn ({selectedItems.length}):</Text>
            <div style={{ marginTop: 8 }}>
              {selectedItems.map((item, index) => (
                <Tag
                  key={`${item.item_id}-${index}`}
                  color="blue"
                  style={{ marginBottom: 4 }}
                >
                  {item.item_name} - {item.fixed_price?.toLocaleString()} VNĐ
                </Tag>
              ))}
            </div>
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
                  const today = dayjs();
                  const currentHour = today.hour();

                  // Nếu hiện tại >= 17h, disable ngày hôm nay
                  if (currentHour >= 17) {
                    return (
                      current && current < today.add(1, "day").startOf("day")
                    );
                  }

                  // Nếu hiện tại < 17h, chỉ disable các ngày trong quá khứ
                  return current && current < today.startOf("day");
                }}
                onChange={(date) => {
                  setBookingDate(date ? date.format("YYYY-MM-DD") : "");
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

            {selectedBranch && (
              <Alert
                message={`Chi nhánh: ${selectedBranch.branch_name}`}
                description={`${selectedBranch.address} • ${selectedBranch.phone}`}
                type="info"
                style={{ marginTop: 8 }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Render bay recommendation and queue
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
                    style={{ fontSize: 32, color: "#52c41a", marginBottom: 8 }}
                  />
                  <div
                    style={{ fontWeight: 600, fontSize: 18, color: "#52c41a" }}
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
                      color: "#52c41a",
                      marginTop: 4,
                      fontWeight: 500,
                    }}
                  >
                    Được đề xuất
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
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Queue Information */}
          {(() => {
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
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {getSafeQueueItems().map((item, index) => {
                  console.log("🔍 Queue item data:", {
                    index,
                    item,
                    keys: Object.keys(item),
                  });
                  return (
                    <div
                      key={item.queue_id || `queue-${index}`}
                      style={{
                        padding: "8px",
                        border: "1px solid #f0f0f0",
                        borderRadius: "4px",
                        marginBottom: "8px",
                        backgroundColor: index === 0 ? "#f6ffed" : "#fff",
                      }}
                    >
                      <Row gutter={8}>
                        <Col span={2}>
                          <div
                            style={{
                              textAlign: "center",
                              fontWeight: 600,
                              color: index === 0 ? "#52c41a" : "#1890ff",
                            }}
                          >
                            #{item.queue_position}
                          </div>
                        </Col>
                        <Col span={8}>
                          <div style={{ fontWeight: 500 }}>
                            {String(
                              item.booking_customer_name ||
                                item.customer_name ||
                                item.customerName ||
                                "N/A"
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: "#666" }}>
                            {String(
                              item.booking_vehicle_license_plate ||
                                item.vehicle_license_plate ||
                                item.vehicleLicensePlate ||
                                "N/A"
                            )}
                          </div>
                          <div style={{ fontSize: 10, color: "#999" }}>
                            {String(
                              item.booking_code ||
                                item.booking_id ||
                                item.bookingId ||
                                "N/A"
                            )}
                          </div>
                        </Col>
                        <Col span={8}>
                          <div style={{ fontSize: 12, color: "#666" }}>
                            Bắt đầu:{" "}
                            {item.estimated_start_time ||
                            item.estimatedStartTime
                              ? new Date(
                                  String(
                                    item.estimated_start_time ||
                                      item.estimatedStartTime
                                  )
                                ).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Đang tính toán..."}
                          </div>
                          <div style={{ fontSize: 12, color: "#1890ff" }}>
                            Hoàn thành:{" "}
                            {item.estimated_completion_time ||
                            item.estimatedCompletionTime
                              ? new Date(
                                  String(
                                    item.estimated_completion_time ||
                                      item.estimatedCompletionTime
                                  )
                                ).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Đang tính toán..."}
                          </div>
                          <div style={{ fontSize: 10, color: "#999" }}>
                            Vị trí: #
                            {String(
                              item.queue_position ||
                                item.queuePosition ||
                                index + 1
                            )}
                          </div>
                        </Col>
                      </Row>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Alternative Bays */}
          {bayRecommendation.alternative_bays &&
            bayRecommendation.alternative_bays.length > 0 && (
              <Card title="Bay thay thế" style={{ marginBottom: 16 }}>
                <Text strong style={{ marginBottom: 8, display: "block" }}>
                  Các bay khác có thể chọn:
                </Text>
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
                        onClick={() => setSelectedWalkInBay(bay.bay_id)}
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
                        onClick={() => setSelectedWalkInBay(bay.bay_id)}
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

  const renderSlotSelectionStep = () => (
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
                      label: <span>📅 Đặt lịch ({serviceBays.length})</span>,
                      children: (
                        <div>
                          <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={24}>
                              <Text strong>Chọn Service Bay cho đặt lịch:</Text>
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
                                              selectedBay?.bay_id === bay.bay_id
                                                ? "2px solid #1890ff"
                                                : "1px solid #d9d9d9",
                                            backgroundColor:
                                              selectedBay?.bay_id === bay.bay_id
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
                                      Đang tải slot...
                                    </div>
                                  </div>
                                ) : availableSlots.length === 0 ? (
                                  <Alert
                                    message="Không có slot khả dụng"
                                    description="Không có slot nào phù hợp với thời gian dịch vụ đã chọn"
                                    type="warning"
                                    showIcon
                                  />
                                ) : (
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
                                                : slot.status === "IN_PROGRESS"
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
                                )}
                              </div>

                              {selectedSlot && (
                                <Alert
                                  message={`Slot đã chọn: ${
                                    selectedSlot.startTime
                                  } - ${dayjs(selectedSlot.startTime, "HH:mm")
                                    .add(
                                      selectedSlot.serviceDurationMinutes,
                                      "minute"
                                    )
                                    .format("HH:mm")}`}
                                  description={`Service Bay: ${selectedSlot.bayName} • Ngày: ${selectedSlot.date}`}
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
                label: <span>🔧 Xử lý tại chỗ ({onSiteBays.length})</span>,
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

  return (
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
          disabled={
            !selectedBranch ||
            selectedItems.length === 0 ||
            (customerType === "existing" &&
              (!selectedCustomer || !selectedVehicle)) ||
            (customerType === "new" && (!newCustomer || !newVehicle)) ||
            !selectedWalkInBay
          }
        >
          Đặt lịch
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
        {/* All Content */}
        {renderAllContent()}
      </Form>
    </Modal>
  );
};

export default BookingModal;
