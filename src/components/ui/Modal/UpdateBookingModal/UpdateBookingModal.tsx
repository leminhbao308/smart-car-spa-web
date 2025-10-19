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
  Steps,
  Card,
  Row,
  Col,
  Alert,
  Tag,
  Space,
  Spin,
  Divider,
  Typography,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  ShopOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { BookingInfoDto, UpdateBookingRequest, Priority } from "@/lib/api/types";
import { useUpdateBooking } from "@/lib/api/hooks/useBooking";
import { useCustomersDropdown } from "@/lib/api/hooks/useUsers";
import { useVehicleProfiles } from "@/lib/api/hooks/useVehicleProfiles";
import { useBranches } from "@/lib/api/hooks/useBranches";
import { useAllPriceBooks } from "@/lib/api/hooks/usePricing";
import { useActiveServiceBays } from "@/lib/api/hooks/useServiceBays";
import { UserManagementInfo } from "@/lib/api/types/user.types";
import { VehicleProfile, VehicleProfileDisplay } from "@/lib/api/types/vehicle-profile.types";
import { BranchDisplay } from "@/lib/api/types/branch.types";
import { PriceBookItem } from "@/lib/api/types/price-book.types";
import { ServiceBay } from "@/lib/api/types/service-bay.types";
import { BookingScheduleService, TimeSlotDto } from "@/lib/api/services/booking-schedule.service";
import { MemoizedTextArea } from "@/components/ui/MemoizedComponents";

const { Option } = Select;
const { Text } = Typography;
const { Step } = Steps;

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

// Priority levels
const priorityLevels = [
  { value: "NORMAL", label: "Bình thường", icon: "🟢" },
  { value: "HIGH", label: "Cao", icon: "🟡" },
  { value: "URGENT", label: "Khẩn cấp", icon: "🔴" },
];


interface UpdateBookingModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (bookingData: UpdateBookingRequest) => void;
  initialData: BookingInfoDto;
  loading?: boolean;
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
}) => {
  const [form] = Form.useForm();

  // Step management
  const [currentStep, setCurrentStep] = useState(0);

  // Selection states
  const [selectedCustomer, setSelectedCustomer] = useState<UserManagementInfo | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleProfileDisplay | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchDisplay | null>(null);
  const [selectedItems, setSelectedItems] = useState<PriceBookItem[]>([]);
  const [selectedBay, setSelectedBay] = useState<ServiceBay | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);

  // Data states
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [bookingDate, setBookingDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<SlotInfo[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // API hooks
  const updateBookingMutation = useUpdateBooking();

  // Data hooks
  const { customers } = useCustomersDropdown();
  const { profiles: allVehicles, loading: isLoadingVehicles } =
    useVehicleProfiles({ params: { size: 1000 } });
  const { branches, loading: isLoadingBranches } = useBranches();
  const { data: priceBooks, isLoading: isLoadingPriceBooks, error: priceBooksError } =
    useAllPriceBooks();
  const { data: serviceBays, isLoading: isLoadingServiceBays } = useActiveServiceBays(selectedBranch?.branch_id);

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
      console.error("Error loading price books:", priceBooksError);
      return [];
    }

    if (!priceBooks || priceBooks.length === 0) {
      console.log("No price books available");
      return [];
    }

    const services: PriceBookItem[] = [];
    priceBooks.forEach((priceBook) => {
      if (priceBook.items && priceBook.items.length > 0) {
        priceBook.items.forEach((item) => {
          // Only include items that have a service (not service package)
          if (item.service && !item.servicePackage) {
            console.log(
              `✓ Adding service: ${item.item_name} - ${item.service.service_name}`
            );
            services.push(item);
          } else {
            console.log(
              `✗ Skipped item: ${item.item_name} - ${
                item.service ? "has service" : "no service"
              }, ${item.servicePackage ? "has package" : "no package"}`
            );
          }
        });
      }
    });

    console.log(`Total services found: ${services.length}`);
    return services;
  }, [priceBooks, priceBooksError]);

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
      const uniqueSlots = slots.filter((slot, index, self) => 
        index === self.findIndex(s => 
          s.startTime === slot.startTime && s.endTime === slot.endTime
        )
      );
      
      console.log("Unique slots after deduplication:", uniqueSlots);
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
      const currentSlotIndex = availableSlots.findIndex(s => s.startTime === slot.startTime);
      
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
      return slot.isAvailable && slot.status === "AVAILABLE" && isSlotSuitable(slot);
    },
    [isSlotSuitable]
  );


  // Initialize form with initial data
  useEffect(() => {
    console.log("UpdateBookingModal useEffect triggered:", { initialData, open });
    if (initialData && open) {
      console.log("Initializing form with data:", initialData);
      // Set customer (read-only in edit mode)
      if (initialData.customer_id) {
        console.log("Looking for customer with ID:", initialData.customer_id);
        console.log("Available customers:", customers);
        const customer = customers.find(
          (c) => c.user_id === initialData.customer_id
        );
        console.log("Found customer:", customer);
        if (customer) {
          setSelectedCustomer(customer);
        }
      }

      // Set vehicle (editable in edit mode)
      if (initialData.vehicle_id) {
        console.log("Looking for vehicle with ID:", initialData.vehicle_id);
        console.log("Available vehicles:", allVehicles);
        const vehicle = allVehicles.find(
          (v) => v.vehicle_id === initialData.vehicle_id
        );
        console.log("Found vehicle:", vehicle);
        if (vehicle) {
          setSelectedVehicle(vehicle);
        }
      }

      // Set branch (editable in edit mode)
      if (initialData.branch_id) {
        const branch = branches.find(
          (b) => b.branch_id === initialData.branch_id
        );
        if (branch) {
          setSelectedBranch(branch);
        }
      }

      // Set form values
      form.setFieldsValue({
        customerId: initialData.customer_id,
        vehicleId: initialData.vehicle_id,
        branchId: initialData.branch_id,
        customerName: initialData.customer_name,
        customerPhone: initialData.customer_phone,
        customerEmail: initialData.customer_email,
        vehicleLicensePlate: initialData.vehicle_license_plate,
        vehicleBrandName: initialData.vehicle_brand_name,
        vehicleModelName: initialData.vehicle_model_name,
        vehicleTypeName: initialData.vehicle_type_name,
        vehicleYear: initialData.vehicle_year,
        vehicleColor: initialData.vehicle_color,
        bookingDate: dayjs(
          initialData.scheduled_start_at || initialData.preferred_start_at
        ),
        notes: initialData.notes,
        priority: initialData.priority,
      });

      // Set booking date
      if (initialData.scheduled_start_at) {
        const date = dayjs(initialData.scheduled_start_at).format(
          "YYYY-MM-DD"
        );
        setBookingDate(date);
      }

      // Set selected services from booking items
      if (initialData.booking_items && initialData.booking_items.length > 0) {
        const services: PriceBookItem[] = [];
        initialData.booking_items.forEach((item) => {
          if (item.service_id) {
            // Find the service in price books
            const priceBookItem = availableServices.find(
              (service) => service.service?.service_id === item.service_id
            );
            if (priceBookItem) {
              services.push(priceBookItem);
            }
          }
        });
        setSelectedItems(services);
      }

      // Set selected bay and slot if available
      if (initialData.bay_id && serviceBays) {
        const bay = serviceBays.find((b: ServiceBay) => b.bay_id === initialData.bay_id);
        if (bay) {
          setSelectedBay(bay);
        }
      }

      if (initialData.slot_start_time && initialData.scheduled_start_at) {
        const slotDate = dayjs(initialData.scheduled_start_at).format(
          "YYYY-MM-DD"
        );
        const slotTime = initialData.slot_start_time;

        setSelectedSlot({
          bayId: initialData.bay_id || "",
          bayName: initialData.bay_name || "",
          date: slotDate,
          startTime: slotTime,
          serviceDurationMinutes: initialData.slot_duration_minutes || 60,
        });
      }

      setTotalPrice(initialData.total_price || 0);
      setTotalDuration(initialData.estimated_duration_minutes || 0);
      setCurrentStep(0); // Start from step 1 for edit mode
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
  ]);

  const calculateTotals = useCallback((items: PriceBookItem[]) => {
    const price = items.reduce((sum, item) => sum + (item.fixed_price || 0), 0);
    const duration = items.reduce((sum, item) => {
      if (item.service) {
        return sum + (item.service.estimated_duration || 60);
      }
      return sum;
    }, 0);
    setTotalPrice(price);
    setTotalDuration(duration);
  }, []);

  // Handle service selection change
  const handleServiceChange = useCallback(
    (selectedServiceIds: string[]) => {
      const selectedServices = availableServices.filter((service) =>
        selectedServiceIds.includes(service.item_id)
      );
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
      const bay = serviceBays?.find((b) => b.bay_id === bayId);
      setSelectedBay(bay || null);
      setSelectedSlot(null);
    },
    [serviceBays]
  );

  // Handle slot selection (same logic as BookingModal)
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

  // Step navigation
  const handleNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  // Handle submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Validation for edit mode
      if (!selectedSlot) {
        console.error("Vui lòng chọn slot thời gian");
        return;
      }

      // Handle edit mode with existing API
      const updateRequest: UpdateBookingRequest = {
        // Customer info (read-only in edit mode, keep existing)
        customer_name: initialData.customer_name,
        customer_phone: initialData.customer_phone,
        customer_email: initialData.customer_email,

        // Vehicle info (editable)
        vehicle_license_plate:
          selectedVehicle?.license_plate || initialData.vehicle_license_plate,
        vehicle_brand_name: initialData.vehicle_brand_name,
        vehicle_model_name: initialData.vehicle_model_name,
        vehicle_type_name: initialData.vehicle_type_name,
        vehicle_year: initialData.vehicle_year,
        vehicle_color: initialData.vehicle_color,

        // Branch and bay info (editable)
        branch_id: selectedBranch?.branch_id || initialData.branch_id,
        service_bay_id: selectedBay?.bay_id || initialData.bay_id,

        // Slot info (editable)
        slot_date:
          selectedSlot?.date ||
          dayjs(initialData.scheduled_start_at).format("YYYY-MM-DD"),
        slot_start_time:
          selectedSlot?.startTime || initialData.slot_start_time,

        // Scheduling info
        preferred_start_at: selectedSlot
          ? dayjs(`${selectedSlot.date} ${selectedSlot.startTime}`).toISOString()
          : initialData.preferred_start_at,
        scheduled_start_at: selectedSlot
          ? dayjs(`${selectedSlot.date} ${selectedSlot.startTime}`).toISOString()
          : initialData.scheduled_start_at,
        scheduled_end_at: selectedSlot
          ? dayjs(`${selectedSlot.date} ${selectedSlot.startTime}`)
              .add(totalDuration, "minutes")
              .toISOString()
          : initialData.scheduled_end_at,

        // Duration info
        estimated_duration_minutes: totalDuration,
        buffer_minutes: initialData.buffer_minutes || 15,

        // Pricing info
        total_price: totalPrice,
        currency: initialData.currency || "VND",
        deposit_amount: initialData.deposit_amount || 0,

        // Additional info
        notes: values.notes || initialData.notes,
        special_requests: initialData.special_requests || [],
        priority: (values.priority as Priority) || initialData.priority,
      };

      await updateBookingMutation.mutateAsync({
        bookingId: initialData.booking_id,
        request: updateRequest,
      });

      onOk(updateRequest);
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  // Step content components
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderCustomerVehicleStep();
      case 1:
        return renderServiceSelectionStep();
      case 2:
        return renderDateTimeBranchStep();
      case 3:
        return renderSlotSelectionStep();
      default:
        return null;
    }
  };

  const renderCustomerVehicleStep = () => (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Card
            size="small"
            title="Thông tin khách hàng"
            style={{ marginBottom: 16 }}
          >
            {/* Display customer info in edit mode (read-only) */}
            {selectedCustomer ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Khách hàng hiện tại
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">
                          {selectedCustomer.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedCustomer.full_name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {selectedCustomer.phone_number}
                      </p>
                      {selectedCustomer.email && (
                        <p className="text-sm text-gray-500 truncate">
                          {selectedCustomer.email}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <Tag color="blue">Không thể thay đổi</Tag>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {selectedCustomer && (
              <Alert
                message={`Khách hàng: ${selectedCustomer.full_name}`}
                description={`SĐT: ${selectedCustomer.phone_number} • Email: ${selectedCustomer.email}`}
                type="success"
                showIcon
                style={{ marginTop: 8 }}
              />
            )}
          </Card>
        </Col>

        <Col span={12}>
          <Card size="small" title="Thông tin xe" style={{ marginBottom: 16 }}>
            <Form.Item
              name="vehicleId"
              label="Chọn xe"
              rules={[]}
            >
              <Select
                placeholder="Chọn xe khác (tùy chọn)"
                loading={isLoadingVehicles}
                onChange={handleVehicleChange}
                disabled={false}
                optionLabelProp="label"
                notFoundContent={
                  isLoadingVehicles
                    ? "Đang tải danh sách xe..."
                    : vehicles.length === 0
                    ? `Khách hàng "${
                        selectedCustomer?.full_name || "này"
                      }" chưa có xe nào trong hệ thống`
                    : "Không tìm thấy xe phù hợp"
                }
              >
                {vehicles.map((vehicle: VehicleProfile) => (
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
                        Vehicle ID: {vehicle.vehicle_id}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {selectedVehicle && (
              <Alert
                message={`Xe: ${selectedVehicle.license_plate}`}
                description={`Vehicle ID: ${selectedVehicle.vehicle_id}`}
                type="info"
                showIcon
                style={{ marginTop: 8 }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderServiceSelectionStep = () => (
    <div>
      <Card size="small" title="Chọn dịch vụ" style={{ marginBottom: 16 }}>
        <Form.Item
          name="services"
          label="Dịch vụ chăm sóc xe"
          rules={[]}
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
                    calculateTotals(newItems);
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
              rules={[]}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Chọn ngày"
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
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
              rules={[]}
            >
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

  const renderSlotSelectionStep = () => (
    <div>
      <Card
        size="small"
        title="Chọn Service Bay và Slot"
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
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={24}>
                <Text strong>Chọn Service Bay (8 khu vực):</Text>
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
                              {bay.bay_code || `Bay ${bay.bay_id.slice(-2)}`} •
                              60 phút/slot
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
                <Text strong>Chọn Slot trong {selectedBay.bay_name}:</Text>
                <div style={{ marginTop: 8 }}>

                  {loadingSlots ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <Spin />
                      <div
                        style={{ marginTop: 8, fontSize: 12, color: "#666" }}
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
                          selectedSlot?.startTime === slot.startTime;

                        return (
                          <Col span={4} key={`${slot.startTime}-${slot.endTime}-${index}`}>
                            <Tooltip
                              title={
                                canSelect
                                  ? totalDuration > 60
                                    ? `Chọn ${Math.ceil(totalDuration / 60)} slot liên tiếp từ ${slot.startTime} (${totalDuration} phút)`
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
                                  ? `Cần ${Math.ceil(totalDuration / 60)} slot liên tiếp - không đủ`
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
                                      : slot.status === "CANCELLED"
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
                    message={`Slot đã chọn: ${selectedSlot.startTime} - ${dayjs(
                      selectedSlot.startTime,
                      "HH:mm"
                    )
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

      <Card size="small" title="Thông tin bổ sung">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="priority" label="Mức độ ưu tiên" initialValue="NORMAL">
              <Select placeholder="Chọn mức độ ưu tiên">
                {priorityLevels.map((priority) => (
                  <Option key={priority.value} value={priority.value}>
                    <Space>
                      <span>{priority.icon}</span>
                      <span>{priority.label}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="couponCode" label="Mã giảm giá">
              <Select placeholder="Nhập mã giảm giá (tùy chọn)" allowClear />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="notes" label="Ghi chú">
          <MemoizedTextArea
            rows={3}
            placeholder="Nhập ghi chú cho booking (tùy chọn)"
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
          <span>Cập nhật booking</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      width={1200}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        ...(currentStep > 0
          ? [
              <Button key="prev" onClick={handlePrev}>
                Quay lại
              </Button>,
            ]
          : []),
        ...(currentStep < 3
          ? [
              <Button key="next" type="primary" onClick={handleNext}>
                Tiếp theo
              </Button>,
            ]
          : []),
        ...(currentStep === 3
          ? [
              <Button
                key="submit"
                type="primary"
                loading={
                  loading || updateBookingMutation.isPending
                }
                onClick={handleSubmit}
                disabled={!selectedSlot}
              >
                Cập nhật booking
              </Button>,
            ]
          : []),
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          priority: "NORMAL",
        }}
      >
        {/* Steps Navigation */}
        <Steps
          current={currentStep}
          style={{ marginBottom: 24 }}
          onChange={(step) => {
            setCurrentStep(step);
          }}
        >
          <Step title="Khách hàng & Xe" icon={<UserOutlined />} />
          <Step title="Dịch vụ" icon={<ShopOutlined />} />
          <Step title="Thời gian & Chi nhánh" icon={<CalendarOutlined />} />
          <Step title="Chọn Slot" icon={<ClockCircleOutlined />} />
        </Steps>

        {/* Step Content */}
        {renderStepContent()}
      </Form>
    </Modal>
  );
};

export default UpdateBookingModal;
