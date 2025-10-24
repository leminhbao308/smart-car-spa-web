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
  Space,
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
import { CreateBookingWithSlotRequest } from "@/lib/api/types/booking.types";
import { UserManagementInfo } from "@/lib/api/types/user.types";
import { VehicleProfileDisplay } from "@/lib/api/types/vehicle-profile.types";
import { BranchDisplay } from "@/lib/api/types/branch.types";
import { PriceBookItem } from "@/lib/api/types/price-book.types";
// import { SkillLevel } from "@/lib/api/types/service.types"; // Removed unused import
import { ServiceBay } from "@/lib/api/types/service-bay.types";

const { Option } = Select;
const { Text } = Typography;

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

  // Selection handlers
  const handleCustomerChange = useCallback(
    (customerId: string) => {
      const customer = customers.find((c) => c.user_id === customerId);
      setSelectedCustomer(customer || null);
      setSelectedVehicle(null);
      // Use formRef to avoid circular reference
      formRef.current.setFieldValue("vehicleId", undefined);
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

  // Function để lấy danh sách sản phẩm cần thiết cho các service và reserve inventory
  const fetchRequiredProductsAndReserve = async (
    services: { item_type: string; item_id: string }[],
    bookingId: string
  ) => {
    try {
      const allProducts: any[] = [];

      for (const service of services) {
        if (service.item_type === "SERVICE") {
          // Import ServiceService để lấy service products trực tiếp
          const { ServiceService } = await import(
            "@/lib/api/services/service.service"
          );

          try {
            // Lấy service details với service_products
            const serviceDetails = await ServiceService.getServiceById(
              service.item_id
            );

            if (
              serviceDetails?.service_products &&
              serviceDetails.service_products.length > 0
            ) {
              // Process service products
              for (const serviceProduct of serviceDetails.service_products) {
                if (serviceProduct.is_required) {
                  const productInfo = {
                    product_id: serviceProduct.product_id,
                    product_name: serviceProduct.product_info.product_name,
                    product_code:
                      serviceProduct.product_info.sku ||
                      serviceProduct.product_id,
                    quantity: serviceProduct.quantity,
                    unit_of_measure: serviceProduct.unit,
                    notes: serviceProduct.notes,
                    service_id: serviceProduct.service_id,
                    service_name: serviceDetails.service_name,
                  };
                  allProducts.push(productInfo);
                } else {
                  console.log(
                    `ℹ️ Skipping optional product: ${serviceProduct.product_info.product_name}`
                  );
                }
              }
            } else {
              console.log(
                `ℹ️ Service ${serviceDetails.service_name} has no required products`
              );
            }
          } catch (serviceError) {
            console.error(
              `❌ Error fetching service ${service.item_id}:`,
              serviceError
            );
            // Continue with other services
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
      // Reserve inventory nếu có branch và products
      if (selectedBranch?.branch_id && uniqueProducts.length > 0) {
        try {
          // Validate products có productId
          const validProducts = uniqueProducts.filter(
            (product) => product.productId
          );
          if (validProducts.length === 0) {
            return uniqueProducts;
          }

          const { InventoryService } = await import(
            "@/lib/api/services/inventory.service"
          );

          const productsToReserve = validProducts.map((product) => ({
            productId: product.productId,
            quantity: product.quantity,
          }));

          await InventoryService.reserveMultipleForBooking(
            selectedBranch.branch_id,
            productsToReserve,
            bookingId
          );
        } catch (inventoryError) {
          console.error("❌ Error reserving inventory:", inventoryError);
          // Không throw error để không làm fail booking
        }
      } else {
        if (!selectedBranch?.branch_id) {
          console.warn("⚠️ No selected branch - cannot reserve inventory");
        }
        if (uniqueProducts.length === 0) {
          console.warn(
            "⚠️ No products to reserve - services may not have required products"
          );
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
      console.log("🚀 Creating booking with request:", createRequest);
      const createResponse = await createBookingWithSlotMutation.mutateAsync(
        createRequest as CreateBookingWithSlotRequest
      );
      console.log("📋 Booking creation response:", createResponse);
      console.log("📋 Response data structure:", createResponse?.data);

      // Try different possible bookingId locations
      const bookingId =
        createResponse?.data?.bookingId ||
        createResponse?.data?.id ||
        createResponse?.data?.booking_id ||
        createResponse?.bookingId ||
        createResponse?.id;

      if (bookingId) {
        try {
          await fetchRequiredProductsAndReserve(
            createRequest.booking_items.map((item) => ({
              item_type: "SERVICE",
              item_id: item.service_id,
            })),
            bookingId
          );
        } catch (inventoryError) {
          console.error("❌ Inventory reservation failed:", inventoryError);
        }
      } else {
        console.warn("⚠️ No bookingId found in response:", createResponse);
        console.warn(
          "⚠️ Available fields in data:",
          Object.keys(createResponse?.data || {})
        );
      }

      onOk(createRequest);
    } catch (error) {
      console.error("Booking submission failed:", error);
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
                showIcon
                style={{ marginTop: 8 }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Render on-site processing bays (Tab 2)
  const renderOnSiteBays = () => (
    <div>
      <Text strong style={{ marginBottom: 16, display: "block" }}>
        Các khu vực xử lý tại chỗ (Không cho phép đặt lịch):
      </Text>
      {isLoadingServiceBays ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin />
          <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            Đang tải danh sách khu vực...
          </div>
        </div>
      ) : onSiteBays.length === 0 ? (
        <Alert
          message="Không có khu vực xử lý tại chỗ"
          description="Tất cả khu vực đều cho phép đặt lịch"
          type="info"
          showIcon
        />
      ) : (
        <Row gutter={8}>
          {onSiteBays.map((bay) => (
            <Col span={6} key={bay.bay_id}>
              <Card
                size="small"
                style={{
                  textAlign: "center",
                  border: "1px solid #fa8c16",
                  backgroundColor: "#fff7e6",
                  opacity: 0.8,
                }}
              >
                <ShopOutlined style={{ fontSize: 24, color: "#fa8c16" }} />
                <div style={{ marginTop: 8 }}>
                  <Text strong style={{ color: "#fa8c16" }}>
                    {bay.bay_name}
                  </Text>
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {bay.bay_code || `Bay ${bay.bay_id.slice(-2)}`}
                </div>
                <div style={{ fontSize: 10, color: "#fa8c16", marginTop: 4 }}>
                  🔧 Xử lý tại chỗ
                </div>
              </Card>
            </Col>
          ))}
        </Row>
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
            defaultActiveKey="booking"
            items={[
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
                                    onClick={() => handleBayChange(bay.bay_id)}
                                  >
                                    <ShopOutlined
                                      style={{ fontSize: 24, color: "#1890ff" }}
                                    />
                                    <div style={{ marginTop: 8 }}>
                                      <Text strong>{bay.bay_name}</Text>
                                    </div>
                                    <div
                                      style={{ fontSize: 12, color: "#666" }}
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
                              style={{ textAlign: "center", padding: "20px" }}
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
              {
                key: "onsite",
                label: <span>🔧 Xử lý tại chỗ ({onSiteBays.length})</span>,
                children: renderOnSiteBays(),
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
            !selectedSlot ||
            !selectedCustomer ||
            !selectedVehicle ||
            !selectedBranch ||
            selectedItems.length === 0
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
