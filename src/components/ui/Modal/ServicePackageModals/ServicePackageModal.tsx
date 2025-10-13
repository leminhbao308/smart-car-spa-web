"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Button,
  Space,
  Divider,
  Card,
  Row,
  Col,
  Typography,
  Alert,
  Spin,
  App,
  Tag,
} from "antd";
import {
  DeleteOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import {
  ServicePackage,
  CreateServicePackageRequest,
  UpdateServicePackageRequest,
  ServicePackageServiceItem,
} from "@/lib/api/types/service-package.types";
import { ServicePackageType } from "@/lib/api/types/service-package-type.types";
import { Category } from "@/lib/api/types/category.types";
import { ServiceProcessInfoDto } from "@/lib/api/types/service-process.types";
import { Service } from "@/lib/api/types/service.types";
import { servicePackageService } from "@/lib/api/services/service-package.service";
import { servicePackageTypeService } from "@/lib/api/services/service-package-type.service";
import { categoryService } from "@/lib/api/services/category.service";
import { ServiceProcessService } from "@/lib/api/services/service-process.service";
import { ServiceService } from "@/lib/api/services/service.service";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

export interface ServicePackageModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editData?: ServicePackage | null;
  mode: "create" | "edit";
}

type PackageType = "combo" | "process";

const ServicePackageModal: React.FC<ServicePackageModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData,
  mode,
}) => {
  const [form] = useForm();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [packageType, setPackageType] = useState<PackageType>("combo");
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [serviceItems, setServiceItems] = useState<ServicePackageServiceItem[]>(
    []
  );

  // Data states
  const [packageTypes, setPackageTypes] = useState<ServicePackageType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [serviceProcesses, setServiceProcesses] = useState<
    ServiceProcessInfoDto[]
  >([]);
  const [selectedServiceProcess, setSelectedServiceProcess] =
    useState<ServiceProcessInfoDto | null>(null);

  // Calculate total price from process steps
  const calculateProcessPrice = useCallback(
    (process: ServiceProcessInfoDto | null) => {
      if (!process || !process.process_steps) return 0;

      return process.process_steps.reduce((total, step) => {
        if (!step.step_products) return total;
        return (
          total +
          step.step_products.reduce((stepTotal, product) => {
            return stepTotal + product.product_cost * product.quantity;
          }, 0)
        );
      }, 0);
    },
    []
  );
  const [services, setServices] = useState<Service[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const loadInitialData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [packageTypesRes, categoriesRes, serviceProcessesRes, servicesRes] =
        await Promise.all([
          servicePackageTypeService.getAllServicePackageTypes(),
          categoryService.getAllCategories(),
          ServiceProcessService.getAllServiceProcesses(),
          ServiceService.getAllServices(),
        ]);

      setPackageTypes(
        Array.isArray(packageTypesRes.data)
          ? packageTypesRes.data
          : packageTypesRes.data?.content || []
      );
      setCategories(
        Array.isArray(categoriesRes.data)
          ? (categoriesRes.data as Category[])
          : (categoriesRes.data?.content as Category[]) || []
      );
      setServiceProcesses(
        Array.isArray(serviceProcessesRes) ? serviceProcessesRes : []
      );
      setServices(
        Array.isArray(servicesRes.data)
          ? servicesRes.data
          : servicesRes.data?.content || []
      );
    } catch (error) {
      console.error("Error loading initial data:", error);
      message.error("Không thể tải dữ liệu khởi tạo");
    } finally {
      setLoadingData(false);
    }
  }, [message]);

  const initializeForm = useCallback(() => {
    if (!editData) return;

    // Determine package type based on data
    const hasServices =
      editData.package_services && editData.package_services.length > 0;

    const determinedType: PackageType = hasServices ? "combo" : "process";
    setPackageType(determinedType);

    // Set form values
    form.setFieldsValue({
      package_name: editData.package_name,
      package_url: editData.package_url,
      category_id: editData.category_id,
      description: editData.description,
      total_duration: editData.total_duration,
      service_package_type_id: editData.service_package_type_id,
      service_process_id: editData.service_process_id,
      is_default_process: editData.is_default_process,
      is_active: editData.is_active,
    });

    // Set selected service process for edit mode
    if (editData.service_process_id) {
      const process = serviceProcesses.find(
        (p) => p.id === editData.service_process_id
      );
      setSelectedServiceProcess(process || null);
    }

    // Set service items for combo type
    if (hasServices) {
      console.log("EditData package_services:", editData.package_services);
      setServiceItems(editData.package_services);
      const serviceIds = editData.package_services
        .map((item) => item.service_id)
        .filter(Boolean);
      console.log("Service IDs from editData:", serviceIds);

      // Only set selected services if services are loaded
      if (services.length > 0) {
        const selectedServicesData = services.filter((service) =>
          serviceIds.includes(service.service_id)
        );
        setSelectedServices(selectedServicesData);
      }
    }
  }, [editData, form, services, serviceProcesses]);

  const resetForm = useCallback(() => {
    form.resetFields();
    setPackageType("combo");
    setSelectedServices([]);
    setServiceItems([]);
    setSelectedServiceProcess(null);
  }, [form]);

  // Load initial data
  useEffect(() => {
    if (visible) {
      loadInitialData();
    }
  }, [visible, loadInitialData]);

  // Initialize form when editData changes
  useEffect(() => {
    if (visible && editData && mode === "edit") {
      initializeForm();
    } else if (visible && mode === "create") {
      resetForm();
    }
  }, [visible, editData, mode, initializeForm, resetForm]);

  // Handle services loading after editData is set
  useEffect(() => {
    if (visible && editData && mode === "edit" && services.length > 0) {
      const hasServices =
        editData.package_services && editData.package_services.length > 0;
      if (hasServices && selectedServices.length === 0) {
        const serviceIds = editData.package_services
          .map((item) => item.service_id)
          .filter(Boolean);
        const selectedServicesData = services.filter((service) =>
          serviceIds.includes(service.service_id)
        );
        setSelectedServices(selectedServicesData);
      }
    }
  }, [visible, editData, mode, services, selectedServices.length]);

  const handlePackageTypeChange = (type: PackageType) => {
    // In edit mode, don't allow changing package type
    if (mode === "edit") {
      return;
    }

    setPackageType(type);
    if (type === "process") {
      setSelectedServices([]);
      setServiceItems([]);
    }
  };

  const handleServiceSelect = (serviceIds: string[]) => {
    console.log("handleServiceSelect called with:", serviceIds);
    const selectedServicesData = services.filter((service) =>
      serviceIds.includes(service.service_id)
    );
    console.log("selectedServicesData:", selectedServicesData);
    setSelectedServices(selectedServicesData);

    // Get current service IDs in serviceItems
    const currentServiceIds = serviceItems
      .filter((item) => item.service_id)
      .map((item) => item.service_id);

    // Find services to add (new ones)
    const servicesToAdd = selectedServicesData.filter(
      (service) => !currentServiceIds.includes(service.service_id)
    );

    // Remove services that are no longer selected
    const updatedServiceItems = serviceItems.filter(
      (item) => item.service_id && serviceIds.includes(item.service_id)
    );

    // Add new services
    const newServiceItems: ServicePackageServiceItem[] = servicesToAdd.map(
      (service) => ({
        service_id: service.service_id,
        service_name: service.service_name,
        service_url: service.service_url,
        service_description: service.description,
        service_standard_duration: service.standard_duration,
        service_base_price: service.base_price,
        quantity: 1,
        unit_price: service.base_price,
        total_price: service.base_price,
        is_required: true,
        is_active: true,
      })
    );

    const finalServiceItems = [...updatedServiceItems, ...newServiceItems];
    console.log("Final serviceItems:", finalServiceItems);
    setServiceItems(finalServiceItems);
  };

  const updateServiceItem = (
    servicePackageServiceId: string,
    field: keyof ServicePackageServiceItem,
    value: unknown
  ) => {
    setServiceItems((prev) =>
      prev.map((item) => {
        if (item.service_package_service_id === servicePackageServiceId) {
          const updated = { ...item, [field]: value };
          if (field === "quantity") {
            updated.total_price = updated.quantity * updated.unit_price;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const removeServiceItem = (servicePackageServiceId: string) => {
    setServiceItems((prev) =>
      prev.filter(
        (item) =>
          item.service_package_service_id &&
          item.service_package_service_id !== servicePackageServiceId
      )
    );

    // For existing packages, we don't need to update selectedServices
    // as they might not have service_id
    if (mode === "create") {
      setSelectedServices((prev) =>
        prev.filter((service) => service.service_id !== servicePackageServiceId)
      );

      // Update form field to reflect the change
      const currentSelectedIds = selectedServices
        .filter((service) => service.service_id !== servicePackageServiceId)
        .map((service) => service.service_id);
      form.setFieldValue("selected_services", currentSelectedIds);
    }
  };

  const calculateTotalPrice = useMemo(() => {
    return serviceItems
      .filter((item) => item.service_name) // Filter by service_name instead of service_id
      .reduce((total, item) => total + (item.total_price || 0), 0);
  }, [serviceItems]);

  const calculateTotalDuration = useMemo(() => {
    const total = serviceItems
      .filter((item) => item.service_name) // Filter by service_name instead of service_id
      .reduce(
        (total, item) => total + (item.service_standard_duration || 0),
        0
      );
    return Math.max(total, 1); // Đảm bảo ít nhất 1 phút
  }, [serviceItems]);

  // Update form fields when combo package changes
  const updateFormFields = useCallback(() => {
    if (packageType === "combo") {
      form.setFieldValue("total_duration", calculateTotalDuration);
      form.setFieldValue("package_price", calculateTotalPrice);
    }
  }, [packageType, calculateTotalDuration, calculateTotalPrice, form]);

  useEffect(() => {
    updateFormFields();
  }, [updateFormFields]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const requestData = {
        ...values,
        total_duration:
          packageType === "combo"
            ? calculateTotalDuration
            : selectedServiceProcess?.estimated_duration || 1,
        package_price:
          packageType === "combo"
            ? calculateTotalPrice
            : calculateProcessPrice(selectedServiceProcess) ||
              values.package_price,
        package_services:
          packageType === "combo"
            ? serviceItems
                .filter((item) => item.service_id)
                .map((item) => ({
                  service_id: item.service_id,
                  quantity: item.quantity,
                  unit_price: item.unit_price,
                  notes: item.notes,
                  is_required: item.is_required,
                }))
            : [],
      };

      if (mode === "create") {
        await servicePackageService.createServicePackage(
          requestData as CreateServicePackageRequest
        );
        message.success("Tạo gói dịch vụ thành công");
      } else {
        await servicePackageService.updateServicePackage(
          editData!.package_id,
          requestData as UpdateServicePackageRequest
        );
        message.success("Cập nhật gói dịch vụ thành công");
      }

      onSuccess();
      onCancel();
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error(
        mode === "create"
          ? "Tạo gói dịch vụ thất bại"
          : "Cập nhật gói dịch vụ thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderComboPackageForm = () => (
    <div>
      <Alert
        message="Gói dịch vụ Combo"
        description="Chọn các dịch vụ để tạo gói combo. Giá và thời gian sẽ được tính tự động từ các dịch vụ được chọn."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form.Item label="Chọn dịch vụ" name="selected_services">
        <Select
          mode="multiple"
          placeholder="Chọn các dịch vụ cho gói combo"
          value={selectedServices.map((s) => s.service_id)}
          onChange={handleServiceSelect}
          optionFilterProp="children"
          filterOption={(input, option) =>
            String(option?.children).toLowerCase().includes(input.toLowerCase())
          }
        >
          {services.map((service) => (
            <Option key={service.service_id} value={service.service_id}>
              <div>
                <div>{service.service_name}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {formatCurrency(service.base_price)} •{" "}
                  {service.standard_duration} phút
                </Text>
              </div>
            </Option>
          ))}
        </Select>
      </Form.Item>

      {serviceItems.length > 0 && (
        <Card
          title={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Chi tiết dịch vụ trong gói</span>
              <Tag color="blue">{serviceItems.length} dịch vụ</Tag>
            </div>
          }
          size="small"
        >
          <Row gutter={[16, 16]}>
            {serviceItems.map((item, index) => {
              // Debug: Log item data
              console.log("ServiceItem:", item);

              // Skip items without service_name (service_id can be null for existing packages)
              if (!item.service_name) {
                console.log("Skipping item without service_name:", item);
                return null;
              }

              return (
                <Col
                  span={24}
                  key={item.service_package_service_id || `service-${index}`}
                >
                  <Card size="small" style={{ backgroundColor: "#fafafa" }}>
                    <Row gutter={16} align="middle">
                      <Col span={8}>
                        <Text strong>{item.service_name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.service_standard_duration} phút
                        </Text>
                      </Col>
                      <Col span={4}>
                        <Form.Item label="Số lượng" style={{ marginBottom: 0 }}>
                          <InputNumber
                            min={1}
                            value={item.quantity}
                            onChange={(value) =>
                              updateServiceItem(
                                item.service_package_service_id!,
                                "quantity",
                                value
                              )
                            }
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item label="Đơn giá" style={{ marginBottom: 0 }}>
                          <div
                            style={{
                              padding: "4px 11px",
                              border: "1px solid #d9d9d9",
                              borderRadius: "6px",
                              backgroundColor: "#f5f5f5",
                              color: "#666",
                            }}
                          >
                            {formatCurrency(item.unit_price)}
                          </div>
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          label="Thành tiền"
                          style={{ marginBottom: 0 }}
                        >
                          <Text strong style={{ color: "#1890ff" }}>
                            {formatCurrency(item.total_price)}
                          </Text>
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Form.Item label="Bắt buộc" style={{ marginBottom: 0 }}>
                          <Switch
                            checked={item.is_required}
                            onChange={(checked) =>
                              updateServiceItem(
                                item.service_package_service_id!,
                                "is_required",
                                checked
                              )
                            }
                            size="small"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() =>
                            removeServiceItem(item.service_package_service_id!)
                          }
                          size="small"
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              );
            })}
          </Row>

          <Divider />

          <Row justify="space-between" align="middle">
            <Col>
              <Text strong>Tổng cộng:</Text>
            </Col>
            <Col>
              <Space direction="vertical" align="end">
                <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
                  {formatCurrency(calculateTotalPrice)}
                </Text>
                <Text type="secondary">{calculateTotalDuration} phút</Text>
              </Space>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );

  const renderProcessPackageForm = () => (
    <div>
      <Alert
        message="Gói dịch vụ theo quy trình"
        description="Tạo gói dịch vụ với quy trình chăm sóc xe cụ thể. Giá và thời gian sẽ được tính từ quy trình được chọn."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form.Item
        label="Quy trình chăm sóc"
        name="service_process_id"
        rules={[
          { required: true, message: "Vui lòng chọn quy trình chăm sóc" },
        ]}
      >
        <Select
          placeholder="Chọn quy trình chăm sóc xe"
          optionFilterProp="children"
          filterOption={(input, option) =>
            String(option?.children).toLowerCase().includes(input.toLowerCase())
          }
          labelInValue={false}
          onChange={(value) => {
            const process = serviceProcesses.find((p) => p.id === value);
            setSelectedServiceProcess(process || null);
            // Update form fields with the process data
            if (process) {
              form.setFieldValue("total_duration", process.estimated_duration);
              const processPrice = calculateProcessPrice(process);
              if (processPrice > 0) {
                form.setFieldValue("package_price", processPrice);
              }
            }
          }}
        >
          {serviceProcesses.map((process) => (
            <Option key={process.id} value={process.id} title={process.name}>
              <div>{process.name}</div>
            </Option>
          ))}
        </Select>
      </Form.Item>
    </div>
  );

  return (
    <Modal
      title={
        <Space>
          <ShoppingCartOutlined />
          {mode === "create" ? "Tạo gói dịch vụ mới" : "Chỉnh sửa gói dịch vụ"}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {mode === "create" ? "Tạo gói dịch vụ" : "Cập nhật"}
        </Button>,
      ]}
      destroyOnHidden
    >
      <Spin spinning={loadingData}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            is_active: true,
            is_default_process: false,
          }}
        >
          {/* Package Type Selection */}
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>Loại gói dịch vụ</span>
                {mode === "edit" && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    (Không thể thay đổi loại gói khi chỉnh sửa)
                  </Text>
                )}
              </div>
            }
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Card
                  hoverable={mode === "create"}
                  style={{
                    border:
                      packageType === "combo"
                        ? "2px solid #1890ff"
                        : "1px solid #d9d9d9",
                    backgroundColor:
                      packageType === "combo" ? "#f0f8ff" : "#fff",
                    cursor: mode === "create" ? "pointer" : "default",
                    opacity:
                      mode === "edit" && packageType !== "combo" ? 0.5 : 1,
                  }}
                  onClick={() => handlePackageTypeChange("combo")}
                >
                  <div style={{ textAlign: "center" }}>
                    <ShoppingCartOutlined
                      style={{
                        fontSize: 24,
                        color: "#1890ff",
                        marginBottom: 8,
                      }}
                    />
                    <div>
                      <Text strong>Gói Combo</Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Kết hợp nhiều dịch vụ
                    </Text>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  hoverable={mode === "create"}
                  style={{
                    border:
                      packageType === "process"
                        ? "2px solid #1890ff"
                        : "1px solid #d9d9d9",
                    backgroundColor:
                      packageType === "process" ? "#f0f8ff" : "#fff",
                    cursor: mode === "create" ? "pointer" : "default",
                    opacity:
                      mode === "edit" && packageType !== "process" ? 0.5 : 1,
                  }}
                  onClick={() => handlePackageTypeChange("process")}
                >
                  <div style={{ textAlign: "center" }}>
                    <SettingOutlined
                      style={{
                        fontSize: 24,
                        color: "#1890ff",
                        marginBottom: 8,
                      }}
                    />
                    <div>
                      <Text strong>Gói theo quy trình</Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Sử dụng quy trình chăm sóc
                    </Text>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Basic Information */}
          <Card
            title="Thông tin cơ bản"
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Tên gói dịch vụ"
                  name="package_name"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập tên gói dịch vụ",
                    },
                  ]}
                >
                  <Input placeholder="Nhập tên gói dịch vụ" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="URL gói dịch vụ"
                  name="package_url"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập URL gói dịch vụ",
                    },
                  ]}
                >
                  <Input placeholder="Nhập URL gói dịch vụ" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Danh mục"
                  name="category_id"
                  rules={[
                    { required: true, message: "Vui lòng chọn danh mục" },
                  ]}
                >
                  <Select placeholder="Chọn danh mục">
                    {categories.map((category) => (
                      <Option
                        key={category.category_id}
                        value={category.category_id}
                      >
                        {category.category_name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Loại gói dịch vụ"
                  name="service_package_type_id"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn loại gói dịch vụ",
                    },
                  ]}
                >
                  <Select placeholder="Chọn loại gói dịch vụ">
                    {packageTypes.map((type) => (
                      <Option
                        key={type.service_package_type_id}
                        value={type.service_package_type_id}
                      >
                        {type.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Mô tả" name="description">
              <TextArea rows={3} placeholder="Nhập mô tả gói dịch vụ" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Thời gian dự kiến (phút)"
                  name="total_duration"
                >
                  {packageType === "combo" ? (
                    <div
                      style={{
                        padding: "4px 11px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "6px",
                        backgroundColor: "#f5f5f5",
                        color: "#666",
                        minHeight: "32px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {calculateTotalDuration} phút (tự động tính từ các dịch
                      vụ)
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "4px 11px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "6px",
                        backgroundColor: "#f5f5f5",
                        color: "#666",
                        minHeight: "32px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {selectedServiceProcess
                        ? `${selectedServiceProcess.estimated_duration} phút (từ quy trình)`
                        : "Chọn quy trình để hiển thị thời gian"}
                    </div>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Trạng thái"
                  name="is_active"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Hoạt động"
                    unCheckedChildren="Tạm dừng"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Giá gói (VNĐ)"
                  name="package_price"
                  rules={[
                    { required: true, message: "Vui lòng nhập giá gói" },
                    {
                      type: "number",
                      min: 0,
                      message: "Giá gói phải lớn hơn 0",
                    },
                  ]}
                >
                  {packageType === "combo" ? (
                    <div
                      style={{
                        padding: "4px 11px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "6px",
                        backgroundColor: "#f5f5f5",
                        color: "#666",
                        minHeight: "32px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {formatCurrency(calculateTotalPrice)} (tự động tính từ các
                      dịch vụ)
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "4px 11px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "6px",
                        backgroundColor: "#f5f5f5",
                        color: "#666",
                        minHeight: "32px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {selectedServiceProcess
                        ? `${formatCurrency(
                            calculateProcessPrice(selectedServiceProcess)
                          )} (từ quy trình)`
                        : "Chọn quy trình để hiển thị giá"}
                    </div>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Package Type Specific Forms */}
          {packageType === "combo" && renderComboPackageForm()}
          {packageType === "process" && renderProcessPackageForm()}
        </Form>
      </Spin>
    </Modal>
  );
};

export default ServicePackageModal;
