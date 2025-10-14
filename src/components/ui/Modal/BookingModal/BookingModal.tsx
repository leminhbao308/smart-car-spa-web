"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  DatePicker,
  TimePicker,
  Button,
  Space,
  Card,
  Tag,
  Row,
  Col,
  Typography,
  // message, // Removed to avoid static function warning
} from "antd";
import {
  CarOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { formatDurationVer01 } from "@/components/utils/helper/duration.format.helper";
import SlotSelectionModal from "../SlotSelectionModal";
import { MemoizedTextArea } from "@/components/ui/MemoizedComponents";
import { useCreateBooking, useUpdateBooking } from "@/lib/api/hooks/useBooking";
import { useCustomersDropdown } from "@/lib/api/hooks/useUsers";
import { useVehicleProfiles } from "@/lib/api/hooks/useVehicleProfiles";
import { useBranches } from "@/lib/api/hooks/useBranches";
import { useActivePriceBooks } from "@/lib/api/hooks/usePricing";
import {
  BookingInfoDto,
  CreateBookingRequest,
  UpdateBookingRequest,
  Priority,
} from "@/lib/api/types/booking.types";
import { UserManagementInfo } from "@/lib/api/types/user.types";
import { VehicleProfileDisplay } from "@/lib/api/types/vehicle-profile.types";
import { BranchDisplay } from "@/lib/api/types/branch.types";
import { PriceBookItem } from "@/lib/api/types/price-book.types";
import { ServiceProcessStepProductInfoDto } from "@/lib/api/types/service-process.types";
import { useWarehouseByBranch } from "@/lib/api/hooks/useWarehouseByBranch";

const { Option } = Select;
const { Text } = Typography;

// Priority levels
const priorityLevels = [
  { value: "NORMAL", label: "Bình thường", icon: "⚪" },
  { value: "HIGH", label: "Cao", icon: "🟡" },
  { value: "URGENT", label: "Khẩn cấp", icon: "🔴" },
];

interface BookingModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (bookingData: unknown) => void;
  initialData?: BookingInfoDto;
  mode?: "create" | "edit";
  loading?: boolean;
}

const BookingModal: React.FC<BookingModalProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
  mode = "create",
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [selectedCustomer, setSelectedCustomer] =
    useState<UserManagementInfo | null>(null);
  const [selectedVehicle, setSelectedVehicle] =
    useState<VehicleProfileDisplay | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchDisplay | null>(
    null
  );
  const [selectedItems, setSelectedItems] = useState<PriceBookItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    bayId: string;
    name: string;
    type: string;
  } | null>(null);
  const [bookingDate, setBookingDate] = useState<string>("");
  const [bookingTime, setBookingTime] = useState<string>("");
  const [requiredProducts, setRequiredProducts] = useState<
    ServiceProcessStepProductInfoDto[]
  >([]);

  // API hooks
  const createBookingMutation = useCreateBooking();
  const updateBookingMutation = useUpdateBooking();

  // Data hooks
  const { customers, loading: isLoadingCustomers } = useCustomersDropdown();
  const { profiles: allVehicles, loading: isLoadingVehicles } =
    useVehicleProfiles({ size: 1000 });
  const { branches, loading: isLoadingBranches } = useBranches();
  const { data: priceBooksData, isLoading: isLoadingPriceBooks } =
    useActivePriceBooks();

  // Warehouse hook - lấy warehouse từ branch đã chọn
  const { warehouse, loading: isLoadingWarehouse } = useWarehouseByBranch(
    selectedBranch?.branch_id || null
  );

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

  // Get services and packages from price books
  const availableServices = React.useMemo(() => {
    if (!priceBooksData) return [];

    const allItems: PriceBookItem[] = [];
    priceBooksData.forEach((priceBook) => {
      priceBook.items.forEach((item) => {
        if (
          item.item_type === "SERVICE" ||
          item.item_type === "SERVICE_PACKAGE"
        ) {
          allItems.push(item);
        }
      });
    });

    return allItems;
  }, [priceBooksData]);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        form.setFieldsValue({
          customerId: initialData.customerId,
          vehicleId: initialData.vehicleId,
          branchId: initialData.branchId,
          bookingDate: dayjs(
            initialData.scheduledStartAt || initialData.preferredStartAt
          ),
          notes: initialData.notes,
          priority: initialData.priority,
        });
        // Convert BookingItemInfoDto to our item format
        const items = (initialData.bookingItems || []).map(
          (item) =>
            ({
              item_id: item.serviceId,
              item_name: item.serviceName || "Dịch vụ",
              item_type: "SERVICE" as const,
              fixed_price: 0, // Will be set from price book data
              policy_type: "FIXED" as const,
              markup_percent: null,
              service: null,
              servicePackage: null,
              product: null,
            } as unknown as PriceBookItem)
        );
        setSelectedItems(items);
        setTotalPrice(initialData.totalPrice || 0);
        setTotalDuration(initialData.estimatedDurationMinutes || 0);
      } else {
        form.resetFields();
        setSelectedCustomer(null);
        setSelectedVehicle(null);
        setSelectedBranch(null);
        setSelectedItems([]);
        setTotalPrice(0);
        setTotalDuration(0);
        setSelectedSlot(null);
        setBookingDate("");
        setBookingTime("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, initialData]);

  const calculateTotals = React.useCallback((items: PriceBookItem[]) => {
    const price = items.reduce((sum, item) => sum + (item.fixed_price || 0), 0);
    const duration = items.reduce((sum, item) => {
      if (item.service) {
        return sum + (item.service.standard_duration || 0);
      } else if (item.servicePackage) {
        return sum + (item.servicePackage.total_duration || 0);
      }
      return sum;
    }, 0);
    setTotalPrice(price);
    setTotalDuration(duration);
  }, []);

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
        const key = product.productId;
        if (productMap.has(key)) {
          const existingProduct = productMap.get(key);
          existingProduct.quantity += product.quantity;
        } else {
          productMap.set(key, {
            productId: product.productId,
            productName: product.productName,
            productCode: product.productCode,
            quantity: product.quantity,
            unitOfMeasure: product.unitOfMeasure,
            notes: product.notes,
          });
        }
      });

      const uniqueProducts = Array.from(productMap.values());
      setRequiredProducts(uniqueProducts);

      console.log("All products before grouping:", allProducts);
      console.log("Unique products after grouping:", uniqueProducts);
      console.log("Required products for booking:", uniqueProducts);

      // Reserve inventory nếu có warehouse và products
      if (warehouse?.id && uniqueProducts.length > 0) {
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
          console.log("Warehouse ID:", warehouse.id);
          console.log("Booking ID:", bookingId);

          await InventoryService.reserveMultipleForBooking(
            warehouse.id,
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

  // Function để release inventory khi booking bị cancel
  const releaseInventoryForBooking = async (bookingId: string) => {
    try {
      if (!warehouse?.id || requiredProducts.length === 0) {
        console.log(
          "No warehouse or products to release for booking:",
          bookingId
        );
        return;
      }

      const { InventoryService } = await import(
        "@/lib/api/services/inventory.service"
      );

      const productsToRelease = requiredProducts.map((product) => ({
        productId: product.productId,
        quantity: product.quantity,
      }));

      await InventoryService.releaseMultipleForBooking(
        warehouse.id,
        productsToRelease,
        bookingId
      );

      console.log("Successfully released inventory for booking:", bookingId);
    } catch (error) {
      console.error("Error releasing inventory:", error);
    }
  };

  // Function để fulfill inventory khi booking chuyển sang IN_PROGRESS
  const fulfillInventoryForBooking = async (bookingId: string) => {
    try {
      if (!warehouse?.id || requiredProducts.length === 0) {
        console.log(
          "No warehouse or products to fulfill for booking:",
          bookingId
        );
        return;
      }

      const { InventoryService } = await import(
        "@/lib/api/services/inventory.service"
      );

      const productsToFulfill = requiredProducts.map((product) => ({
        productId: product.productId,
        quantity: product.quantity,
      }));

      await InventoryService.fulfillMultipleForBooking(
        warehouse.id,
        productsToFulfill,
        bookingId
      );

      console.log("Successfully fulfilled inventory for booking:", bookingId);
    } catch (error) {
      console.error("Error fulfilling inventory:", error);
    }
  };

  const handleCustomerChange = React.useCallback(
    (customerId: string) => {
      const customer = customers.find((c) => c.user_id === customerId);
      setSelectedCustomer(customer || null);
      setSelectedVehicle(null); // Reset vehicle when customer changes

      // Reset form vehicle field
      setTimeout(() => {
        form.setFieldValue("vehicleId", undefined);
      }, 0);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customers]
  );

  const handleVehicleChange = React.useCallback(
    (vehicleId: string) => {
      if (!vehicleId) {
        setSelectedVehicle(null);
        return;
      }
      // Use allVehicles directly to avoid circular reference
      const vehicle = allVehicles.find((v) => v.vehicle_id === vehicleId);
      setSelectedVehicle(vehicle || null);
    },
    [allVehicles]
  );

  const handleBranchChange = React.useCallback(
    (branchId: string) => {
      const branch = branches.find((b) => b.branch_id === branchId);
      setSelectedBranch(branch || null);
    },
    [branches]
  );

  const handleServiceChange = React.useCallback(
    (itemIds: string[]) => {
      const items = availableServices.filter((item) =>
        itemIds.includes(item.item_id)
      );
      setSelectedItems(items);
      calculateTotals(items);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [availableServices]
  );

  const handleOpenSlotSelection = () => {
    if (!selectedBranch || !bookingDate || !bookingTime) {
      return;
    }
    setSlotModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (mode === "create") {
        if (!selectedCustomer || !selectedVehicle || !selectedBranch) {
          // message.error(
          //   "Vui lòng chọn đầy đủ thông tin khách hàng, xe và chi nhánh"
          // ); // Removed to avoid static function warning
          return;
        }

        const createRequest: CreateBookingRequest = {
          customer_id: selectedCustomer.user_id,
          customer_name: selectedCustomer.full_name,
          customer_phone: selectedCustomer.phone_number,
          customer_email: selectedCustomer.email,
          vehicle_id: selectedVehicle.vehicle_id,
          vehicle_license_plate: selectedVehicle.license_plate,
          vehicle_brand_id: selectedVehicle.vehicle_brand_id,
          vehicle_brand_name: selectedVehicle.brand_name || "",
          vehicle_model_name: selectedVehicle.model_name || "",
          vehicle_type_name: selectedVehicle.type_name || "",
          vehicle_year: selectedVehicle.model_year || new Date().getFullYear(),
          vehicle_color: selectedVehicle.color || "",
          branch_id: selectedBranch.branch_id,
          preferred_start_at: `${values.bookingDate.format(
            "YYYY-MM-DD"
          )}T${values.bookingTime.format("HH:mm:ss")}`,
          estimated_duration_minutes: totalDuration,
          buffer_minutes: 15, // Default buffer time
          total_price: totalPrice,
          currency: "VND",
          deposit_amount: 0,
          priority: values.priority as Priority,
          special_requests: values.specialRequests || [],
          booking_items: selectedItems.map((item, index) => ({
            item_type: item.item_type,
            item_id: item.item_id,
            item_name: item.item_name,
            item_url: item.service?.service_url || "",
            item_description:
              item.service?.description ||
              item.servicePackage?.description ||
              "",
            unit_price: item.fixed_price || 0,
            quantity: 1,
            duration_minutes:
              item.service?.standard_duration ||
              item.servicePackage?.total_duration ||
              0,
            discount_amount: 0,
            tax_amount: Math.round((item.fixed_price || 0) * 0.1), // 10% tax
            notes:
              item.service?.description ||
              item.servicePackage?.description ||
              "",
            display_order: index + 1,
          })),
          assignments: [],
          payments: [],
        };

        const createResponse = await createBookingMutation.mutateAsync(
          createRequest
        );

        // Nếu booking thành công và trạng thái là PENDING, lấy danh sách sản phẩm cần thiết và reserve inventory
        if (values.status === "pending" && createResponse?.data?.bookingId) {
          console.log(
            "Creating booking with ID:",
            createResponse.data.bookingId
          );
          await fetchRequiredProductsAndReserve(
            createRequest.booking_items,
            createResponse.data.bookingId
          );
        }

        // message.success("Tạo booking thành công"); // Removed to avoid static function warning
        onOk(createRequest);
      } else if (mode === "edit" && initialData) {
        const updateRequest: UpdateBookingRequest = {
          customer_id: selectedCustomer?.user_id || initialData.customerId,
          customer_name:
            selectedCustomer?.full_name || initialData.customerName,
          customer_phone:
            selectedCustomer?.phone_number || initialData.customerPhone,
          customer_email: selectedCustomer?.email || initialData.customerEmail,
          vehicle_id: selectedVehicle?.vehicle_id || initialData.vehicleId,
          vehicle_license_plate:
            selectedVehicle?.license_plate || initialData.vehicleLicensePlate,
          vehicle_brand_id: selectedVehicle?.vehicle_brand_id || "",
          vehicle_brand_name:
            selectedVehicle?.brand_name || initialData.vehicleBrandName,
          vehicle_model_name:
            selectedVehicle?.model_name || initialData.vehicleModelName,
          vehicle_type_name:
            selectedVehicle?.type_name || initialData.vehicleTypeName,
          vehicle_year: selectedVehicle?.model_year || initialData.vehicleYear,
          vehicle_color: selectedVehicle?.color || initialData.vehicleColor,
          branch_id: selectedBranch?.branch_id || initialData.branchId,
          preferred_start_at: `${values.bookingDate.format(
            "YYYY-MM-DD"
          )}T${values.bookingTime.format("HH:mm:ss")}`,
          estimated_duration_minutes: totalDuration,
          total_price: totalPrice,
          priority: values.priority as Priority,
          notes: values.notes,
          booking_items: selectedItems.map((item, index) => ({
            item_type: item.item_type,
            item_id: item.item_id,
            item_name: item.item_name,
            item_url: item.service?.service_url || "",
            item_description:
              item.service?.description ||
              item.servicePackage?.description ||
              "",
            unit_price: item.fixed_price || 0,
            quantity: 1,
            duration_minutes:
              item.service?.standard_duration ||
              item.servicePackage?.total_duration ||
              0,
            discount_amount: 0,
            tax_amount: Math.round((item.fixed_price || 0) * 0.1), // 10% tax
            notes:
              item.service?.description ||
              item.servicePackage?.description ||
              "",
            display_order: index + 1,
          })),
          assignments: [],
        };

        await updateBookingMutation.mutateAsync({
          bookingId: initialData.bookingId,
          request: updateRequest,
        });

        // Xử lý inventory theo trạng thái booking
        if (initialData.bookingId) {
          const oldStatus = initialData.status;
          const newStatus = values.status;

          if (newStatus === "pending" && updateRequest.booking_items) {
            // Nếu chuyển sang PENDING, reserve inventory
            await fetchRequiredProductsAndReserve(
              updateRequest.booking_items,
              initialData.bookingId
            );
          } else if (newStatus === "cancelled" && oldStatus !== "CANCELLED") {
            // Nếu chuyển sang CANCELLED, release inventory
            await releaseInventoryForBooking(initialData.bookingId);
          } else if (
            newStatus === "in_progress" &&
            oldStatus !== "IN_PROGRESS"
          ) {
            // Nếu chuyển sang IN_PROGRESS, fulfill inventory
            await fulfillInventoryForBooking(initialData.bookingId);
          }
        }

        // message.success("Cập nhật booking thành công"); // Removed to avoid static function warning
        onOk(updateRequest);
      }
    } catch (error) {
      console.log("Validation failed:", error);
      // message.error("Có lỗi xảy ra khi xử lý booking"); // Removed to avoid static function warning
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CalendarOutlined style={{ color: "#1890ff" }} />
          <span>
            {mode === "create" ? "Đặt lịch chăm sóc xe" : "Chỉnh sửa lịch đặt"}
          </span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={
            loading ||
            createBookingMutation.isPending ||
            updateBookingMutation.isPending
          }
          onClick={handleSubmit}
        >
          {mode === "create" ? "Đặt lịch" : "Cập nhật"}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          priority: "NORMAL",
          status: "pending",
        }}
      >
        <Row gutter={16}>
          {/* Thông tin khách hàng */}
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
                  { required: true, message: "Vui lòng chọn khách hàng" },
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
                <div
                  style={{
                    padding: 8,
                    backgroundColor: "#f6ffed",
                    border: "1px solid #b7eb8f",
                    borderRadius: 4,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <UserOutlined style={{ color: "#52c41a" }} />
                      <Text strong style={{ color: "#52c41a" }}>
                        Khách hàng đã chọn:
                      </Text>
                    </div>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        setSelectedCustomer(null);
                        setSelectedVehicle(null);
                        form.setFieldValue("customerId", undefined);
                        form.setFieldValue("vehicleId", undefined);
                      }}
                      style={{ padding: 0, height: "auto", fontSize: 12 }}
                    >
                      Thay đổi
                    </Button>
                  </div>
                  <div style={{ fontSize: 13, color: "#666" }}>
                    <div>
                      <strong>{selectedCustomer.full_name}</strong>
                    </div>
                    <div>{selectedCustomer.phone_number}</div>
                    {selectedCustomer.email && (
                      <div>{selectedCustomer.email}</div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </Col>

          {/* Thông tin xe */}
          <Col span={12}>
            <Card
              size="small"
              title="Thông tin xe"
              style={{ marginBottom: 16 }}
            >
              <Form.Item
                name="vehicleId"
                label={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span>Chọn xe</span>
                    {selectedCustomer && (
                      <Tag color="blue" style={{ fontSize: 11 }}>
                        {vehicles.length} xe
                      </Tag>
                    )}
                  </div>
                }
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
                <div
                  style={{
                    padding: 8,
                    backgroundColor: "#e6f7ff",
                    border: "1px solid #91d5ff",
                    borderRadius: 4,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <CarOutlined style={{ color: "#1890ff" }} />
                      <Text strong style={{ color: "#1890ff" }}>
                        Xe đã chọn:
                      </Text>
                    </div>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        setSelectedVehicle(null);
                        form.setFieldValue("vehicleId", undefined);
                      }}
                      style={{ padding: 0, height: "auto", fontSize: 12 }}
                    >
                      Thay đổi
                    </Button>
                  </div>
                  <div style={{ fontSize: 13, color: "#666" }}>
                    <div>
                      <strong>{selectedVehicle.license_plate}</strong>
                    </div>
                    <div>
                      {selectedVehicle.brand_name} {selectedVehicle.model_name}
                    </div>
                    <div>{selectedVehicle.type_name}</div>
                  </div>
                </div>
              )}

              {!selectedCustomer && (
                <div
                  style={{
                    padding: 12,
                    backgroundColor: "#fff7e6",
                    border: "1px solid #ffd591",
                    borderRadius: 4,
                    textAlign: "center",
                  }}
                >
                  <Text style={{ color: "#d46b08" }}>
                    Vui lòng chọn khách hàng trước để xem danh sách xe
                  </Text>
                </div>
              )}

              {selectedCustomer &&
                vehicles.length === 0 &&
                !isLoadingVehicles && (
                  <div
                    style={{
                      padding: 12,
                      backgroundColor: "#fff1f0",
                      border: "1px solid #ffccc7",
                      borderRadius: 4,
                      textAlign: "center",
                    }}
                  >
                    <Text style={{ color: "#ff4d4f" }}>
                      ⚠️ Khách hàng &quot;{selectedCustomer.full_name}&quot;
                      chưa có xe nào trong hệ thống
                    </Text>
                    <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                      Vui lòng thêm thông tin xe cho khách hàng trước khi đặt
                      lịch
                    </div>
                  </div>
                )}
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Dịch vụ */}
          <Col span={12}>
            <Card
              size="small"
              title="Dịch vụ & Gói dịch vụ"
              style={{ marginBottom: 16 }}
            >
              <Form.Item
                name="services"
                label="Chọn dịch vụ"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất một dịch vụ",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn dịch vụ hoặc gói dịch vụ"
                  onChange={handleServiceChange}
                  optionLabelProp="label"
                  loading={isLoadingPriceBooks}
                  notFoundContent={
                    isLoadingPriceBooks
                      ? "Đang tải..."
                      : availableServices.length === 0
                      ? "Không có dịch vụ nào"
                      : "Không tìm thấy dịch vụ"
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
                            <Tag
                              color={
                                item.item_type === "SERVICE" ? "blue" : "green"
                              }
                              style={{ marginLeft: 8, fontSize: 10 }}
                            >
                              {item.item_type === "SERVICE"
                                ? "Dịch vụ"
                                : "Gói dịch vụ"}
                            </Tag>
                          </div>
                          <div style={{ fontSize: 12, color: "#666" }}>
                            {item.service?.description ||
                              item.servicePackage?.description ||
                              ""}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: "#52c41a", fontWeight: 500 }}>
                            {item.fixed_price?.toLocaleString()} VNĐ
                          </div>
                          <div style={{ fontSize: 12, color: "#666" }}>
                            {item.service?.standard_duration ||
                              item.servicePackage?.total_duration ||
                              0}{" "}
                            phút
                          </div>
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedItems.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Text strong>Dịch vụ đã chọn:</Text>
                  <div style={{ marginTop: 4 }}>
                    {selectedItems.map((item, index) => (
                      <Tag
                        key={`${item.item_id}-${index}`}
                        color={item.item_type === "SERVICE" ? "blue" : "green"}
                        style={{ marginBottom: 4 }}
                      >
                        {item.item_name} - {item.fixed_price?.toLocaleString()}{" "}
                        VNĐ
                        <span style={{ fontSize: 10, marginLeft: 4 }}>
                          ({item.item_type === "SERVICE" ? "Dịch vụ" : "Gói"})
                        </span>
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </Col>

          {/* Thời gian và địa điểm */}
          <Col span={12}>
            <Card
              size="small"
              title="Thời gian và địa điểm"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={8}>
                <Col span={12}>
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
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="bookingTime"
                    label="Giờ đặt lịch"
                    rules={[{ required: true, message: "Vui lòng chọn giờ" }]}
                  >
                    <TimePicker
                      style={{ width: "100%" }}
                      format="HH:mm"
                      placeholder="Chọn giờ"
                      onChange={(time) => {
                        setBookingTime(time ? time.format("HH:mm") : "");
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="branchId"
                label="Chi nhánh"
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
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          maxWidth: "100%",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 500,
                            marginBottom: 2,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {branch.branch_name}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#666",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "250px",
                          }}
                        >
                          {branch.address}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedBranch && (
                <div
                  style={{
                    marginTop: 8,
                    padding: 8,
                    backgroundColor: "#f6ffed",
                    border: "1px solid #b7eb8f",
                    borderRadius: 4,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <EnvironmentOutlined style={{ color: "#52c41a" }} />
                      <Text strong style={{ color: "#52c41a" }}>
                        Chi nhánh đã chọn:
                      </Text>
                    </div>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        setSelectedBranch(null);
                        form.setFieldValue("branchId", undefined);
                      }}
                      style={{ padding: 0, height: "auto", fontSize: 12 }}
                    >
                      Thay đổi
                    </Button>
                  </div>
                  <div style={{ fontSize: 13, color: "#666" }}>
                    <div style={{ fontWeight: 500, marginBottom: 2 }}>
                      {selectedBranch.branch_name}
                    </div>
                    <div>{selectedBranch.address}</div>
                    <div style={{ marginTop: 2 }}>
                      <PhoneOutlined style={{ marginRight: 4 }} />
                      {selectedBranch.phone}
                    </div>
                  </div>
                  {selectedSlot && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: 8,
                        backgroundColor: "#e6f7ff",
                        borderRadius: 4,
                      }}
                    >
                      <Text strong style={{ color: "#1890ff" }}>
                        Slot đã chọn: {selectedSlot.name} (
                        {selectedSlot.type === "basic"
                          ? "Cơ bản"
                          : selectedSlot.type === "premium"
                          ? "Cao cấp"
                          : "VIP"}
                        )
                      </Text>
                    </div>
                  )}
                </div>
              )}

              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item
                    name="priority"
                    label="Mức độ ưu tiên"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn mức độ ưu tiên",
                      },
                    ]}
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
                  <Form.Item
                    name="status"
                    label="Trạng thái"
                    rules={[
                      { required: true, message: "Vui lòng chọn trạng thái" },
                    ]}
                  >
                    <Select placeholder="Chọn trạng thái">
                      <Option value="pending">Chờ xác nhận</Option>
                      <Option value="confirmed">Đã xác nhận</Option>
                      <Option value="in_progress">Đang thực hiện</Option>
                      <Option value="completed">Hoàn thành</Option>
                      <Option value="cancelled">Đã hủy</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Tổng kết */}
          <Col span={12}>
            <Card size="small" title="Tổng kết" style={{ marginBottom: 16 }}>
              <Row gutter={8}>
                <Col span={12}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: 8,
                      backgroundColor: "#f0f0f0",
                      borderRadius: 4,
                    }}
                  >
                    <DollarOutlined
                      style={{ color: "#52c41a", fontSize: 20 }}
                    />
                    <div style={{ marginTop: 4 }}>
                      <Text strong style={{ color: "#52c41a" }}>
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
                      padding: 8,
                      backgroundColor: "#f0f0f0",
                      borderRadius: 4,
                    }}
                  >
                    <ClockCircleOutlined
                      style={{ color: "#1890ff", fontSize: 20 }}
                    />
                    <div style={{ marginTop: 4 }}>
                      <Text strong style={{ color: "#1890ff" }}>
                        {formatDurationVer01(totalDuration)}
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Thời gian
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Ghi chú và yêu cầu đặc biệt */}
        <Card size="small" title="Ghi chú và yêu cầu đặc biệt">
          <Form.Item name="notes" label="Ghi chú">
            <MemoizedTextArea
              rows={3}
              placeholder="Nhập ghi chú cho lịch đặt..."
            />
          </Form.Item>
        </Card>

        {/* Hiển thị danh sách sản phẩm cần thiết */}
        {requiredProducts.length > 0 && (
          <Card
            size="small"
            title="Sản phẩm cần thiết"
            style={{ marginTop: 16 }}
          >
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {requiredProducts.map((product, index) => (
                <div
                  key={product.productId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom:
                      index < requiredProducts.length - 1
                        ? "1px solid #f0f0f0"
                        : "none",
                  }}
                >
                  <div>
                    <Text strong>{product.productName}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {product.productCode}
                    </Text>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Tag color="blue">
                      {product.quantity} {product.unitOfMeasure}
                    </Tag>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </Form>
    </Modal>
  );
};

export default BookingModal;
