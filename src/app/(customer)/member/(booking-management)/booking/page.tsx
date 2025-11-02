"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Card,
  Form,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Typography,
  Alert,
  Spin,
  Divider,
  App,
  Space,
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
  UserOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { formatDurationVer01 } from "@/components/utils/helper/duration.format.helper";
import { MemoizedTextArea } from "@/components/ui/MemoizedComponents";
import { useCreateBookingWithSlot } from "@/lib/api/hooks/useBooking";
import { useVehicleProfiles } from "@/lib/api/hooks/useVehicleProfiles";
import { useBranches } from "@/lib/api/hooks/useBranches";
import { useAllPriceBooks } from "@/lib/api/hooks/usePricing";
import { useActiveServiceBays } from "@/lib/api/hooks/useServiceBays";
import {
  BookingScheduleService,
  TimeSlotDto,
} from "@/lib/api/services/booking-schedule.service";
import { useAuth } from "@/lib/api/hooks/useAuth";
import { VehicleProfileDisplay } from "@/lib/api/types/vehicle-profile.types";
import { BranchDisplay } from "@/lib/api/types/branch.types";
import { PriceBookItem } from "@/lib/api/types/price-book.types";
import { ServiceBay } from "@/lib/api/types/service-bay.types";
import CreateVehicleProfileModal from "@/components/ui/Modal/CarProfileModal/CreateVehicleProfileModal";

const { Option } = Select;
const { Text, Title } = Typography;

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

// Types for slot selection
type SlotInfo = TimeSlotDto;

interface SelectedSlot {
  bayId: string;
  bayName: string;
  date: string;
  startTime: string;
  serviceDurationMinutes: number;
}

const CustomerBookingPage = () => {
  const [form] = Form.useForm();
  const formRef = useRef(form);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { message } = App.useApp();

  // Selection states
  const [selectedVehicle, setSelectedVehicle] =
    useState<VehicleProfileDisplay | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchDisplay | null>(
    null
  );
  const [selectedItems, setSelectedItems] = useState<PriceBookItem[]>([]);
  const [selectedBay, setSelectedBay] = useState<ServiceBay | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);

  // Data states
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [bookingDate, setBookingDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<SlotInfo[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [createVehicleModalVisible, setCreateVehicleModalVisible] =
    useState(false);
  const [isCreatingVehicle, setIsCreatingVehicle] = useState(false);

  // Update form ref when form changes
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  // API hooks
  const createBookingWithSlotMutation = useCreateBookingWithSlot();

  // Data hooks
  const {
    profiles: allVehicles,
    loading: isLoadingVehicles,
    createProfile: createVehicleProfile,
  } = useVehicleProfiles({
    ownerId: user?.user_id, // Chỉ lấy xe của user đã đăng nhập
    params: { size: 1000 },
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

  // Vehicles are already filtered by ownerId in the API call
  const userVehicles = React.useMemo(() => {
    return allVehicles || [];
  }, [allVehicles]);

  // Get all services from price books
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

  // Reset slot when booking date changes and slot date doesn't match
  useEffect(() => {
    if (selectedSlot && bookingDate && selectedSlot.date !== bookingDate) {
      console.log("🔄 Booking date changed, resetting slot:", {
        slotDate: selectedSlot.date,
        newBookingDate: bookingDate,
      });
      setSelectedSlot(null);
    }
  }, [bookingDate, selectedSlot]);

  // Reset slot when totalDuration changes and current slot is not suitable
  useEffect(() => {
    if (
      selectedSlot &&
      totalDuration > 0 &&
      selectedBranch &&
      selectedBay &&
      selectedSlot.serviceDurationMinutes !== totalDuration
    ) {
      // Check if current slot is still suitable for new duration
      // If duration increased, reset slot
      if (totalDuration > selectedSlot.serviceDurationMinutes) {
        console.log("🔄 Service duration increased, resetting slot:", {
          currentSlotDuration: selectedSlot.serviceDurationMinutes,
          newTotalDuration: totalDuration,
        });
        setSelectedSlot(null);
      } else {
        // Duration decreased, update slot duration but keep selection if still valid
        const updatedSlot = {
          ...selectedSlot,
          serviceDurationMinutes: totalDuration,
        };
        setSelectedSlot(updatedSlot);
      }
    }
  }, [totalDuration, selectedSlot, selectedBranch, selectedBay]);

  // Check if slot is suitable for service duration
  const isSlotSuitable = useCallback(
    (slot: SlotInfo) => {
      // For single slot services (≤ 60 minutes)
      if (totalDuration <= 60) {
        return slot.isAvailable && slot.durationMinutes >= totalDuration;
      }

      // For multi-slot services (> 60 minutes)
      const requiredSlots = Math.ceil(totalDuration / 60);
      const currentSlotIndex = availableSlots.findIndex(
        (s) => s.startTime === slot.startTime
      );

      if (currentSlotIndex === -1) {
        return false;
      }

      // Check if we have enough consecutive available slots
      for (let i = 0; i < requiredSlots; i++) {
        const checkSlotIndex = currentSlotIndex + i;
        if (checkSlotIndex >= availableSlots.length) {
          return false;
        }

        const checkSlot = availableSlots[checkSlotIndex];
        if (!checkSlot.isAvailable || checkSlot.status !== "AVAILABLE") {
          return false;
        }
      }

      return true;
    },
    [totalDuration, availableSlots]
  );

  // Check if slot can be selected
  const canSelectSlot = useCallback(
    (slot: SlotInfo) => {
      const isAvailable = slot.isAvailable;
      const isStatusAvailable = slot.status === "AVAILABLE";
      const isSuitable = isSlotSuitable(slot);

      return isAvailable && isStatusAvailable && isSuitable;
    },
    [isSlotSuitable]
  );

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
  const handleVehicleChange = useCallback(
    (vehicleId: string) => {
      if (!vehicleId) {
        setSelectedVehicle(null);
        return;
      }

      const vehicle = userVehicles.find((v) => v.vehicle_id === vehicleId);
      setSelectedVehicle(vehicle || null);
    },
    [userVehicles]
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
    [availableServices, calculateTotals]
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
        const newSlot = {
          bayId: slot.bayId,
          bayName: slot.bayName,
          date: bookingDate,
          startTime: slot.startTime,
          serviceDurationMinutes: totalDuration,
        };
        setSelectedSlot(newSlot);
      }
    },
    [canSelectSlot, bookingDate, totalDuration]
  );

  const handleSubmit = async () => {
    if (!user || !selectedVehicle || !selectedBranch || !selectedSlot) {
      message.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsSubmitting(true);
    try {
      const values = await form.validateFields();

      // Calculate slot end time
      const slotStartTime = dayjs(
        `${selectedSlot.date} ${selectedSlot.startTime}`
      );
      const slotEndTime = slotStartTime.add(
        selectedSlot.serviceDurationMinutes,
        "minute"
      );

      const createRequest = {
        customer_id: user.user_id,
        customer_name: user.full_name,
        customer_phone: user.phone_number,
        customer_email: user.email,
        vehicle_id: selectedVehicle.vehicle_id,
        vehicle_license_plate: selectedVehicle.license_plate,
        vehicle_brand_name: selectedVehicle.brand_name || "",
        vehicle_model_name: selectedVehicle.model_name || "",
        vehicle_type_name: selectedVehicle.type_name || "",
        vehicle_year: selectedVehicle.model_year || new Date().getFullYear(),
        vehicle_color: selectedVehicle.color || "",
        branch_id: selectedBranch.branch_id,
        selected_slot: {
          bay_id: selectedSlot.bayId,
          date: selectedSlot.date,
          start_time: selectedSlot.startTime,
          service_duration_minutes: selectedSlot.serviceDurationMinutes,
        },
        booking_items: selectedItems.map((item) => ({
          service_id: item.service?.service_id || item.item_id,
          item_name: item.item_name,
          item_description: item.service?.description || "",
          discount_amount: 0,
          tax_amount: Math.round((item.fixed_price || 0) * 0.1),
        })),
        total_price: totalPrice,
        currency: "VND",
        deposit_amount: 0,
        coupon_code: values.couponCode || undefined,
        notes: values.notes || "",
        special_requests: values.specialRequests || [],
        estimated_duration_minutes: totalDuration,
        preferent_start_at: slotStartTime.toISOString(),
        schedule_start_at: slotStartTime.toISOString(),
        schedule_end_at: slotEndTime.toISOString(),
        slot_start_time: selectedSlot.startTime,
        slot_end_time: slotEndTime.format("HH:mm"),
      };

      await createBookingWithSlotMutation.mutateAsync(createRequest);
      message.success("Đặt lịch thành công! Chuyển đến danh sách đặt lịch...");

      // Reset form
      form.resetFields();
      setSelectedVehicle(null);
      setSelectedBranch(null);
      setSelectedItems([]);
      setSelectedBay(null);
      setSelectedSlot(null);
      setTotalPrice(0);
      setTotalDuration(0);
      setBookingDate("");

      // Redirect to booking list after 2 seconds
      setTimeout(() => {
        router.push("/member/booking-list");
      }, 2000);
    } catch (error) {
      console.log("Booking submission failed:", error);
      message.error("Đặt lịch thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Handle add vehicle modal
  const handleAddVehicle = useCallback(() => {
    setCreateVehicleModalVisible(true);
  }, []);

  const handleCreateVehicleSuccess = async (vehicleData: {
    license_plate: string;
    description?: string;
    vehicle_brand_id: string;
    vehicle_type_id: string;
    vehicle_model_id: string;
    owner_id: string;
    distance_traveled: number;
  }) => {
    if (!user?.user_id) return;

    setIsCreatingVehicle(true);
    try {
      // Create vehicle profile
      const createData = {
        ...vehicleData,
        owner_id: user.user_id,
      };

      const response = await createVehicleProfile(createData);

      // Auto-select the newly created vehicle
      if (response && response.data && response.data.vehicle_id) {
        // Convert VehicleProfile to VehicleProfileDisplay for UI
        const vehicleDisplay: VehicleProfileDisplay = {
          ...response.data,
          brand_name: "", // Will be populated when data refreshes
          type_name: "",
          model_name: "",
        };

        setSelectedVehicle(vehicleDisplay);
        form.setFieldValue("vehicleId", response.data.vehicle_id);
        message.success("Thêm xe thành công và đã được chọn!");
      }

      setCreateVehicleModalVisible(false);
    } catch (error) {
      console.log("Error creating vehicle:", error);
      message.error("Có lỗi xảy ra khi tạo xe mới!");
    } finally {
      setIsCreatingVehicle(false);
    }
  };

  const handleCreateVehicleCancel = () => {
    setCreateVehicleModalVisible(false);
  };

  if (authLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải thông tin...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <App>
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <CalendarOutlined
              style={{
                fontSize: "48px",
                color: "#1890ff",
                marginBottom: "16px",
              }}
            />
            <Title level={2}>Đặt lịch chăm sóc xe</Title>
            <Text type="secondary">
              Chào mừng {user.full_name}, hãy chọn dịch vụ và thời gian phù hợp
              cho xe của bạn
            </Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              priority: "NORMAL",
            }}
          >
            {/* Customer Info - Auto-filled */}
            <Card
              size="small"
              style={{
                marginBottom: 16,
                backgroundColor: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              }}
            >
              <div style={{ color: "#262626" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <UserOutlined
                      style={{ color: "#1890ff", fontSize: "18px" }}
                    />
                  </div>
                  <div>
                    <Text
                      style={{
                        color: "#262626",
                        fontSize: "18px",
                        fontWeight: "600",
                      }}
                    >
                      {user.full_name}
                    </Text>
                  </div>
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <div
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginBottom: "2px",
                        }}
                      >
                        📞 Số điện thoại
                      </div>
                      <div style={{ color: "#262626", fontWeight: "500" }}>
                        {user.phone_number}
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginBottom: "2px",
                        }}
                      >
                        ✉️ Email
                      </div>
                      <div style={{ color: "#262626", fontWeight: "500" }}>
                        {user.email}
                      </div>
                    </div>
                  </Col>
                </Row>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    color: "#52c41a",
                    marginTop: "8px",
                  }}
                >
                  <CheckCircleOutlined />
                  Thông tin được xác thực tự động
                </div>
              </div>
            </Card>

            {/* Vehicle Selection */}
            <Card
              size="small"
              title="Thông tin xe"
              style={{ marginBottom: 16 }}
            >
              {userVehicles.length === 0 ? (
                <Alert
                  message="Bạn chưa có xe nào trong hệ thống"
                  description={
                    <div>
                      <p>
                        Vui lòng thêm thông tin xe để có thể đặt lịch chăm sóc.
                      </p>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddVehicle}
                        style={{ marginTop: "8px" }}
                      >
                        Thêm xe mới
                      </Button>
                    </div>
                  }
                  type="warning"
                  showIcon
                />
              ) : (
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
                        : "Không tìm thấy xe phù hợp"
                    }
                    popupRender={(menu) => (
                      <div>
                        {menu}
                        <Divider style={{ margin: "8px 0" }} />
                        <div
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "4px",
                            margin: "4px 8px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            color: "#1890ff",
                            fontWeight: 500,
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddVehicle();
                          }}
                        >
                          <PlusOutlined />
                          Thêm xe mới
                        </div>
                      </div>
                    )}
                  >
                    {userVehicles.map((vehicle: VehicleProfileDisplay) => (
                      <Option
                        key={vehicle.vehicle_id}
                        value={vehicle.vehicle_id}
                        label={vehicle.license_plate}
                      >
                        <div style={{ padding: "4px 0" }}>
                          <div style={{ fontWeight: 500, fontSize: "14px", marginBottom: "4px" }}>
                            {vehicle.license_plate}
                          </div>
                          <div style={{ fontSize: "12px", color: "#666", lineHeight: "1.4" }}>
                            <div>
                              <span style={{ fontWeight: 500 }}>Hãng:</span> {vehicle.brand_name || "Chưa cập nhật"}
                            </div>
                            <div>
                              <span style={{ fontWeight: 500 }}>Dòng:</span> {vehicle.model_name || "Chưa cập nhật"}
                            </div>
                            <div>
                              <span style={{ fontWeight: 500 }}>Loại:</span> {vehicle.type_name || "Chưa cập nhật"}
                            </div>
                            {vehicle.distance_traveled && (
                              <div>
                                <span style={{ fontWeight: 500 }}>Số km:</span> {vehicle.distance_traveled.toLocaleString()} km
                              </div>
                            )}
                          </div>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              {selectedVehicle && (
                <Alert
                  message={
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: "4px" }}>
                        Xe đã chọn: {selectedVehicle.license_plate}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        {selectedVehicle.brand_name && selectedVehicle.model_name && selectedVehicle.type_name
                          ? `${selectedVehicle.brand_name} ${selectedVehicle.model_name} - ${selectedVehicle.type_name}`
                          : "Thông tin xe đang được cập nhật"
                        }
                        {selectedVehicle.distance_traveled && (
                          <span> • {selectedVehicle.distance_traveled.toLocaleString()} km</span>
                        )}
                      </div>
                    </div>
                  }
                  type="success"
                  style={{ marginTop: 8 }}
                />
              )}
            </Card>

            {/* Service Selection */}
            <Card
              size="small"
              title="Chọn dịch vụ"
              style={{ marginBottom: 16 }}
            >
              <Form.Item
                name="services"
                label="Dịch vụ chăm sóc xe"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất một dịch vụ",
                  },
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
                            ?.response?.data ||
                          "Không thể tải danh sách dịch vụ"
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
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 500 }}>
                            {item.item_name}
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
                      <div
                        key={`${item.item_id}-${index}`}
                        style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          margin: "2px",
                          backgroundColor: "#e6f7ff",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        {item.item_name} - {item.fixed_price?.toLocaleString()}{" "}
                        VNĐ
                      </div>
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
                        <DollarOutlined
                          style={{ color: "#52c41a", fontSize: 24 }}
                        />
                        <div style={{ marginTop: 8 }}>
                          <Text
                            strong
                            style={{ color: "#52c41a", fontSize: 18 }}
                          >
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
                          <Text
                            strong
                            style={{ color: "#1890ff", fontSize: 18 }}
                          >
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

            {/* Date, Time & Branch Section */}
            <Row gutter={16}>
              <Col span={12}>
                <Card
                  size="small"
                  title="Thời gian"
                  style={{ marginBottom: 16 }}
                >
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
                            current &&
                            current < today.add(1, "day").startOf("day")
                          );
                        }

                        // Nếu hiện tại < 17h, chỉ disable các ngày trong quá khứ
                        return current && current < today.startOf("day");
                      }}
                      onChange={(date) => {
                        const newDate = date ? date.format("YYYY-MM-DD") : "";
                        setBookingDate(newDate);
                        // Reset slot when date changes
                        if (selectedSlot && selectedSlot.date !== newDate) {
                          setSelectedSlot(null);
                        }
                      }}
                    />
                  </Form.Item>
                </Card>
              </Col>

              <Col span={12}>
                <Card
                  size="small"
                  title="Chi nhánh"
                  style={{ marginBottom: 16 }}
                >
                  <Form.Item
                    name="branchId"
                    label="Chọn chi nhánh"
                    rules={[
                      { required: true, message: "Vui lòng chọn chi nhánh" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn chi nhánh"
                      optionLabelProp="label"
                      onChange={handleBranchChange}
                      loading={isLoadingBranches}
                      showSearch
                      filterOption={(input, option) => {
                        const childrenText =
                          typeof option?.children === "string"
                            ? option.children
                            : "";
                        const labelText =
                          typeof option?.label === "string" ? option.label : "";
                        return (
                          childrenText
                            .toLowerCase()
                            .includes(input.toLowerCase()) ||
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

            {/* Slot Selection Section */}
            <Card
              size="small"
              title="Chọn Khu Vực Chăm Sóc Và Slot"
              style={{ marginBottom: 16 }}
            >
              {!selectedBranch || !bookingDate ? (
                <Alert
                  message="Vui lòng chọn dịch vụ, chi nhánh và ngày trước"
                  description="Bạn cần chọn dịch vụ, chi nhánh và ngày để xem các slot có sẵn"
                  type="warning"
                  showIcon
                />
              ) : (
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
                                  onClick={() => handleBayChange(bay.bay_id)}
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
                                      `Bay ${bay.bay_id.slice(-2)}`}{" "}
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
                              // Check if slot is selected: must match bayId, date, and startTime
                              const isSelected =
                                selectedSlot &&
                                selectedSlot.bayId === slot.bayId &&
                                selectedSlot.date === bookingDate &&
                                selectedSlot.startTime === slot.startTime;

                              return (
                                <Col
                                  span={4}
                                  key={`${slot.startTime}-${slot.endTime}-${index}`}
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
                                        : slot.status === "IN_PROGRESS"
                                        ? "#e6f7ff"
                                        : "#f5f5f5",
                                      cursor: canSelect
                                        ? "pointer"
                                        : "not-allowed",
                                      opacity: canSelect ? 1 : 0.6,
                                      marginBottom: 8,
                                    }}
                                    onClick={() =>
                                      canSelect && handleSlotSelect(slot)
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
                                        color: canSelect ? "#000" : "#999",
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
                                    {totalDuration > 60 && canSelect && (
                                      <div
                                        style={{
                                          fontSize: 8,
                                          color: "#52c41a",
                                          marginTop: 2,
                                          fontWeight: 500,
                                        }}
                                      >
                                        {Math.ceil(totalDuration / 60)} slot
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
                                          : slot.status === "IN_PROGRESS"
                                          ? "Đang dùng"
                                          : slot.status === "CANCELLED"
                                          ? "Đã hủy"
                                          : totalDuration > 60
                                          ? "Không đủ slot"
                                          : "Không khả dụng"}
                                      </div>
                                    )}
                                  </Card>
                                </Col>
                              );
                            })}
                          </Row>
                        )}
                      </div>

                      {selectedSlot && selectedBay && selectedSlot.bayId === selectedBay.bay_id && (
                        <Alert
                          message={`Slot đã chọn: ${
                            selectedSlot.startTime
                          } - ${dayjs(selectedSlot.startTime, "HH:mm")
                            .add(selectedSlot.serviceDurationMinutes, "minute")
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
              )}
            </Card>

            {/* Additional Information */}
            <Card size="small" title="Thông tin bổ sung">
              <Form.Item name="notes" label="Ghi chú">
                <MemoizedTextArea
                  rows={3}
                  placeholder="Nhập ghi chú cho lịch đặt..."
                />
              </Form.Item>
            </Card>

            {/* Submit Button */}
            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <Button
                type="primary"
                size="large"
                icon={<CalendarOutlined />}
                loading={
                  isSubmitting || createBookingWithSlotMutation.isPending
                }
                onClick={handleSubmit}
                disabled={
                  !selectedBranch ||
                  selectedItems.length === 0 ||
                  !selectedVehicle ||
                  !selectedSlot ||
                  userVehicles.length === 0
                }
              >
                {isSubmitting ? "Đang xử lý..." : "Đặt lịch"}
              </Button>
            </div>
          </Form>
        </Space>
      </Card>

      {/* Create Vehicle Modal */}
      <CreateVehicleProfileModal
        ownerId={user?.user_id}
        visible={createVehicleModalVisible}
        onCancel={handleCreateVehicleCancel}
        onSuccess={handleCreateVehicleSuccess}
        loading={isCreatingVehicle}
      />
      </div>
    </App>
  );
};

export default CustomerBookingPage;
