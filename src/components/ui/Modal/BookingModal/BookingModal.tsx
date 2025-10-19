"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Button,
  Space,
  Card,
  Tag,
  Row,
  Col,
  Typography,
  Steps,
  Alert,
  Spin,
  Tooltip,
  Divider,
  // message, // Removed to avoid static function warning
} from "antd";
import {
  UserOutlined,
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
import {
  useCreateBookingWithSlot,
} from "@/lib/api/hooks/useBooking";
import { useCustomersDropdown } from "@/lib/api/hooks/useUsers";
import { useVehicleProfiles } from "@/lib/api/hooks/useVehicleProfiles";
import { useBranches } from "@/lib/api/hooks/useBranches";
import { useAllPriceBooks } from "@/lib/api/hooks/usePricing";
import { useActiveServiceBays } from "@/lib/api/hooks/useServiceBays";
import {
  BookingScheduleService,
  TimeSlotDto,
} from "@/lib/api/services/booking-schedule.service";
import {
  CreateBookingWithSlotRequest,
} from "@/lib/api/types/booking.types";
import { UserManagementInfo } from "@/lib/api/types/user.types";
import { VehicleProfileDisplay } from "@/lib/api/types/vehicle-profile.types";
import { BranchDisplay } from "@/lib/api/types/branch.types";
import { PriceBookItem } from "@/lib/api/types/price-book.types";
// import { SkillLevel } from "@/lib/api/types/service.types"; // Removed unused import
import { ServiceProcessStepProductInfoDto } from "@/lib/api/types/service-process.types";
import { ServiceBay } from "@/lib/api/types/service-bay.types";

const { Option } = Select;
const { Text } = Typography;
const { Step } = Steps;

// Priority levels
const priorityLevels = [
  { value: "NORMAL", label: "Bình thường", icon: "⚪" },
  { value: "HIGH", label: "Cao", icon: "🟡" },
  { value: "URGENT", label: "Khẩn cấp", icon: "🔴" },
];

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

  // Step management
  const [currentStep, setCurrentStep] = useState(0);

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

  // Data states
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [bookingDate, setBookingDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<SlotInfo[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // API hooks
  const createBookingWithSlotMutation = useCreateBookingWithSlot();

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
  const { data: serviceBays, isLoading: isLoadingServiceBays } =
    useActiveServiceBays(selectedBranch?.branch_id);

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
      console.log("No priceBooksData available");
      return [];
    }

    if (!Array.isArray(priceBooksData)) {
      console.error("PriceBooksData is not an array:", priceBooksData);
      return [];
    }

    const allItems: PriceBookItem[] = [];
    priceBooksData.forEach((priceBook) => {
      if (priceBook.items && Array.isArray(priceBook.items)) {
        priceBook.items.forEach((item) => {
          // Filter for services only: serviceId != null AND servicePackageId == null
          if (item.service && !item.servicePackage) {
            allItems.push(item);
            console.log(`✓ Added service: ${item.item_name} (${item.item_id})`);
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

    console.log(`Total services found: ${allItems.length}`);
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
      console.log("Available slots from API:", slots);
      setAvailableSlots(slots);
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

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      // Reset everything for create mode
      form.resetFields();
      setCurrentStep(0);
      setSelectedCustomer(null);
      setSelectedVehicle(null);
      setSelectedBranch(null);
      setSelectedItems([]);
      setSelectedBay(null);
      setSelectedSlot(null);
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

  // Step navigation handlers
  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Selection handlers
  const handleCustomerChange = useCallback(
    (customerId: string) => {
      const customer = customers.find((c) => c.user_id === customerId);
      setSelectedCustomer(customer || null);
      setSelectedVehicle(null);
      // Use setTimeout to avoid circular reference with form
      setTimeout(() => {
        form.setFieldValue("vehicleId", undefined);
      }, 0);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customers] // Remove form from dependencies to avoid circular reference
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

  // Function để lấy danh sách sản phẩm cần thiết cho các service và reserve inventory
  const fetchRequiredProductsAndReserve = async (
    services: { item_type: string; item_id: string }[],
    bookingId: string
  ) => {
    try {
      const allProducts: ServiceProcessStepProductInfoDto[] = [];

      for (const service of services) {
        if (service.item_type === "SERVICE") {
          // Gọi trực tiếp service thay vì sử dụng hook
          const { ServiceProcessService } = await import(
            "@/lib/api/services/service-process.service"
          );

          // Lấy service process từ serviceId
          const serviceProcess =
            await ServiceProcessService.getServiceProcessByServiceId(
              service.item_id
            );

          if (serviceProcess?.id) {
            // Lấy products từ processId
            const products =
              await ServiceProcessService.getServiceProcessProducts(
                serviceProcess.id
              );
            console.log(`Products for service ${service.item_id}:`, products);
            if (products && products.length > 0) {
              allProducts.push(...products);
            }
          } else {
            console.log(
              `No service process found for service ${service.item_id}`
            );
          }
        }
      }

      // Gộp các sản phẩm trùng lặp và tính tổng số lượng
      const productMap = new Map();
      allProducts.forEach((product) => {
        const key = product.product_id;
        if (productMap.has(key)) {
          const existingProduct = productMap.get(key);
          existingProduct.quantity += product.quantity;
        } else {
          productMap.set(key, {
            productId: product.product_id,
            productName: product.product_name,
            productCode: product.product_code,
            quantity: product.quantity,
            unitOfMeasure: product.unit_of_measure,
            notes: product.notes,
          });
        }
      });

      const uniqueProducts = Array.from(productMap.values());

      console.log("All products before grouping:", allProducts);
      console.log("Unique products after grouping:", uniqueProducts);
      console.log("Required products for booking:", uniqueProducts);

      // Reserve inventory nếu có branch và products
      if (selectedBranch?.branch_id && uniqueProducts.length > 0) {
        try {
          // Validate products có productId
          const validProducts = uniqueProducts.filter(
            (product) => product.productId
          );
          if (validProducts.length === 0) {
            console.error(
              "No valid products with productId found:",
              uniqueProducts
            );
            return uniqueProducts;
          }

          const { InventoryService } = await import(
            "@/lib/api/services/inventory.service"
          );

          const productsToReserve = validProducts.map((product) => ({
            productId: product.productId,
            quantity: product.quantity,
          }));

          console.log("Valid products to reserve:", productsToReserve);
          console.log("Branch ID:", selectedBranch.branch_id);
          console.log("Booking ID:", bookingId);

          await InventoryService.reserveMultipleForBooking(
            selectedBranch.branch_id,
            productsToReserve,
            bookingId
          );

          console.log(
            "Successfully reserved inventory for booking:",
            bookingId
          );
        } catch (inventoryError) {
          console.error("Error reserving inventory:", inventoryError);
          // Không throw error để không làm fail booking
        }
      }

      return uniqueProducts;
    } catch (error) {
      console.error("Error fetching required products:", error);
      return [];
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (
        !selectedCustomer ||
        !selectedVehicle ||
        !selectedBranch ||
        !selectedSlot
      ) {
        console.error("Missing required information for booking");
        return;
      }

      // Create request for new integrated API
      const createRequest = {
        customer_id: selectedCustomer.user_id,
        customer_name: selectedCustomer.full_name,
        customer_phone: selectedCustomer.phone_number,
        customer_email: selectedCustomer.email,
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
      };

      // Use new integrated booking API
      const createResponse = await createBookingWithSlotMutation.mutateAsync(
        createRequest as CreateBookingWithSlotRequest
      );

      if (createResponse?.data?.bookingId) {
        console.log(
          "Booking created successfully:",
          createResponse.data.bookingId
        );
        await fetchRequiredProductsAndReserve(
          createRequest.booking_items.map((item) => ({
            item_type: "SERVICE",
            item_id: item.service_id,
          })),
          createResponse.data.bookingId
        );
      }

      onOk(createRequest);
    } catch (error) {
      console.error("Booking submission failed:", error);
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
            <Form.Item
              name="customerId"
              label="Chọn khách hàng"
              rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}
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
              rules={[{ required: true, message: "Vui lòng chọn xe" }]}
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
                showIcon
                style={{ marginTop: 8 }}
              />
            )}
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
                          <Col span={4} key={index}>
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
            <Form.Item
              name="priority"
              label="Mức độ ưu tiên"
              initialValue="NORMAL"
            >
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
                  loading || createBookingWithSlotMutation.isPending
                }
                onClick={handleSubmit}
                disabled={!selectedSlot}
              >
                Đặt lịch
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
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
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

export default BookingModal;
