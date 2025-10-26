/**
 * Customer Update Booking Modal
 * Modal chuyên dụng cho việc cập nhật booking của khách hàng
 * Tối ưu hóa cho customer context - chỉ cho phép cập nhật thông tin cần thiết
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import { BookingInfoDto, BookingStatus } from "@/lib/api/types";
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

// Types for slot selection
type SlotInfo = TimeSlotDto;

interface SelectedSlot {
  bayId: string;
  bayName: string;
  date: string;
  startTime: string;
  serviceDurationMinutes: number;
}

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
  const [selectedBay, setSelectedBay] = useState<ServiceBay | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [isSlotChanged, setIsSlotChanged] = useState(false);
  const [originalSlot, setOriginalSlot] = useState<SelectedSlot | null>(null);

  // Data states
  const [bookingDate, setBookingDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<SlotInfo[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Use refs to track initialization to prevent infinite loops
  const isInitialized = useRef(false);
  const lastInitialData = useRef<BookingInfoDto | null>(null);

  // Calculate totals using useMemo to avoid infinite loops
  const { totalPrice, totalDuration } = useMemo(() => {
    const price = selectedItems.reduce((sum, item) => sum + (item.fixed_price || 0), 0);
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

  // Get all services from price books (filter for services only)
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
          }
        });
      }
    });
    return allItems;
  }, [priceBooksData, priceBooksError]);

  // Load available slots from API
  const loadAvailableSlots = useCallback(
    async (duration: number) => {
      if (!selectedBranch || !selectedBay || !bookingDate || duration <= 0) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const slots = await BookingScheduleService.getAvailableSlots({
          branchId: selectedBranch.branch_id,
          date: bookingDate,
          serviceDurationMinutes: duration,
          bayId: selectedBay.bay_id,
        });

        // Remove duplicate slots
        const uniqueSlots = slots.filter(
          (slot, index, self) =>
            index ===
            self.findIndex(
              (s) =>
                s.startTime === slot.startTime && s.endTime === slot.endTime
            )
        );

        setAvailableSlots(uniqueSlots);
      } catch (error) {
        console.error("Error loading available slots:", error);
        setAvailableSlots([]);
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

  // Initialize form with initial data - only run once when modal opens
  useEffect(() => {
    if (initialData && open && !isInitialized.current) {
      console.log("Initializing customer update form with data:", initialData);
      isInitialized.current = true;
      lastInitialData.current = initialData;

      // Set branch
      if (initialData.branch_id) {
        const branch = branches.find(
          (b) => b.branch_id === initialData.branch_id
        );
        console.log("🔍 Setting branch:", { branchId: initialData.branch_id, found: !!branch });
        if (branch) {
          setSelectedBranch(branch);
        }
      }

      // Set booking date
      if (initialData.scheduled_start_at) {
        const date = dayjs(initialData.scheduled_start_at).format("YYYY-MM-DD");
        setBookingDate(date);
      }

      // Set vehicle data
      if (initialData.vehicle_id && initialData.vehicle_id !== "") {
        const vehicle = userVehicles.find(
          (v) => v.vehicle_id === initialData.vehicle_id
        );
        console.log("🔍 Setting vehicle:", { vehicleId: initialData.vehicle_id, found: !!vehicle, userVehiclesLength: userVehicles.length });
        if (vehicle) {
          setSelectedVehicle(vehicle);
        }
      }

      // Set slot data for slot bookings
      const isSlotBooking = initialData.booking_code?.startsWith("BK") || false;
      if (isSlotBooking && initialData.scheduled_start_at) {
        if (initialData.bay_id && serviceBays) {
          const bay = serviceBays.find(
            (b: ServiceBay) => b.bay_id === initialData.bay_id
          );
          if (bay) {
            setSelectedBay(bay);
          }
        }

        if (initialData.slot_start_time) {
          const slotDate = dayjs(initialData.scheduled_start_at).format(
            "YYYY-MM-DD"
          );
          const initialSlot = {
            bayId: initialData.bay_id || "",
            bayName: initialData.bay_name || "",
            date: slotDate,
            startTime: initialData.slot_start_time,
            serviceDurationMinutes:
              initialData.estimated_duration_minutes || 60,
          };
          setSelectedSlot(initialSlot);
          setOriginalSlot(initialSlot);
        }
      }

      // Set form values
      form.setFieldsValue({
        vehicleId: initialData.vehicle_id,
        branchId: initialData.branch_id,
        bookingDate: dayjs(initialData.scheduled_start_at),
        serviceBayId: initialData.bay_id,
        services:
          initialData.booking_items?.map((item) => item.service_id) || [],
        notes: initialData.notes,
      });

      setIsSlotChanged(false);
    }
  }, [initialData, open, userVehicles, branches, serviceBays, form]);

  // Reset initialization when modal closes
  useEffect(() => {
    if (!open) {
      isInitialized.current = false;
      lastInitialData.current = null;
    }
  }, [open]);

  // Handle services initialization when availableServices changes - only run once
  useEffect(() => {
    if (
      initialData && 
      open && 
      availableServices.length > 0 && 
      isInitialized.current &&
      lastInitialData.current === initialData
    ) {
      console.log("🔍 Initializing services:", {
        initialData: initialData.booking_code,
        availableServicesLength: availableServices.length,
        bookingItems: initialData.booking_items?.length || 0
      });
      
      if (initialData.booking_items && initialData.booking_items.length > 0) {
        const services: PriceBookItem[] = [];
        initialData.booking_items.forEach((item) => {
          if (item.service_id) {
            const priceBookItem = availableServices.find(
              (service) => service.service?.service_id === item.service_id
            );
            if (priceBookItem) {
              services.push(priceBookItem);
            }
          }
        });
        console.log("🔍 Found services:", services.length);
        setSelectedItems(services);
      }
    }
  }, [initialData, open, availableServices]);

  // Handle service selection change
  const handleServiceChange = useCallback(
    (selectedServiceIds: string[]) => {
      const selectedServices = availableServices.filter((service) =>
        selectedServiceIds.includes(service.item_id)
      );
      setSelectedItems(selectedServices);
    },
    [availableServices]
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
  const isSlotSuitable = useCallback(
    (slot: SlotInfo) => {
      if (totalDuration <= 60) {
        return slot.isAvailable && slot.durationMinutes >= totalDuration;
      }

      const requiredSlots = Math.ceil(totalDuration / 60);
      const currentSlotIndex = availableSlots.findIndex(
        (s) => s.startTime === slot.startTime
      );

      if (currentSlotIndex === -1) return false;

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

  // Check if slot can be selected
  const canSelectSlot = useCallback(
    (slot: SlotInfo) => {
      return (
        slot.isAvailable && slot.status === "AVAILABLE" && isSlotSuitable(slot)
      );
    },
    [isSlotSuitable]
  );

  // Handle slot selection
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
        setIsSlotChanged(true);
      }
    },
    [canSelectSlot, bookingDate, totalDuration]
  );

  // Handle submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Check if this is a slot booking
      const isSlotBooking = initialData.booking_code?.startsWith("BK") || false;

      if (!selectedBranch || !selectedVehicle) {
        message.error("Vui lòng điền đầy đủ thông tin");
        return;
      }

      // Only require slot for slot bookings
      if (isSlotBooking && !selectedSlot) {
        message.error("Vui lòng chọn slot cho lịch đặt slot booking");
        return;
      }

      // Note: slotStartTime calculation removed as it's not used in the update request

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
        service_bay_id: isSlotChanged && selectedSlot ? selectedSlot.bayId : undefined,

        // Slot information - only allow changing if slot changed and is slot booking
        slot_date: isSlotChanged && selectedSlot && isSlotBooking ? selectedSlot.date : undefined,
        slot_start_time: isSlotChanged && selectedSlot && isSlotBooking ? selectedSlot.startTime : undefined,
        estimated_duration_minutes: selectedSlot ? selectedSlot.serviceDurationMinutes : totalDuration,

        // Pricing - recalculate based on selected services
        total_price: totalPrice,
        currency: "VND",

        // Additional information
        notes: values.notes || "",
      };

      console.log("🚀 Updating customer booking with request:", updateRequest);

      await updateBookingMutation.mutateAsync({
        bookingId: initialData.booking_id,
        request: updateRequest,
      });

      message.success("Cập nhật booking thành công!");
      onOk(updateRequest);

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Booking update failed:", error);
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
                onClose={() => {
                  const newItems = selectedItems.filter(
                    (i) => i.item_id !== item.item_id
                  );
                  setSelectedItems(newItems);
                }}
                style={{ marginBottom: 4 }}
              >
                {item.item_name} - {item.fixed_price?.toLocaleString()} VNĐ
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
                  setBookingDate(newDate);
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

        {selectedBranch && bookingDate && (
          <div style={{ marginTop: 16 }}>
            <Text strong>Chọn Service Bay:</Text>
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
                          style={{ fontSize: 24, color: "#1890ff" }}
                        />
                        <div style={{ marginTop: 8 }}>
                          <Text strong>{bay.bay_name}</Text>
                        </div>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          {bay.bay_code || `Bay ${bay.bay_id.slice(-2)}`} • 60
                          phút/slot
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          </div>
        )}

        {selectedBay && (
          <div style={{ marginTop: 16 }}>
            <Divider />
            <Text strong>Chọn Slot trong {selectedBay.bay_name}:</Text>
            <div style={{ marginTop: 8 }}>
              {loadingSlots ? (
                <div style={{ textAlign: "center", padding: 20 }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 8 }}>Đang tải danh sách slot...</div>
                </div>
              ) : availableSlots.length > 0 ? (
                <Row gutter={8}>
                  {availableSlots.map((slot, index) => {
                    const canSelect = canSelectSlot(slot);
                    const isSelected =
                      selectedSlot?.startTime === slot.startTime;

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
                                : slot.status === "IN_PROGRESS"
                                ? "#e6f7ff"
                                : "#f5f5f5",
                              cursor: canSelect ? "pointer" : "not-allowed",
                              opacity: canSelect ? 1 : 0.6,
                              marginBottom: 8,
                            }}
                            onClick={() => canSelect && handleSlotSelect(slot)}
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
                            <div style={{ fontSize: 10, color: "#666" }}>
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
                message={`Slot đã chọn: ${selectedSlot.startTime} - ${dayjs(
                  `2000-01-01 ${selectedSlot.startTime}`
                )
                  .add(selectedSlot.serviceDurationMinutes, "minute")
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
                        if (originalSlot) {
                          setSelectedSlot(originalSlot);
                        } else {
                          setSelectedSlot(null);
                        }
                        setIsSlotChanged(false);
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
            const isSlotBooking = initialData.booking_code?.startsWith("BK");
            const isDisabled = !selectedBranch ||
              selectedItems.length === 0 ||
              !selectedVehicle ||
              (isSlotBooking && !selectedSlot);
            
            // Debug logging
            console.log("🔍 Button disabled check:", {
              selectedBranch: !!selectedBranch,
              selectedItemsLength: selectedItems.length,
              selectedVehicle: !!selectedVehicle,
              isSlotBooking,
              selectedSlot: !!selectedSlot,
              isDisabled
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

        {/* Service Selection */}
        {renderServiceSelection()}

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
