"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Card,
  Tag,
  Typography,
  Row,
  Col,
  Button,
  Space,
  Statistic,
  Progress,
  App,
} from "antd";
import {
  EyeOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CarOutlined,
  ToolOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import TrackingDetailModal from "../TrackingDetailModal";
import {
  ServiceProcessTrackingInfoDto,
  TrackingStatus,
} from "@/lib/api/types/service-process-tracking.types";
import { BookingInfoDto } from "@/lib/api/types/booking.types";

const { Text } = Typography;

interface VehicleTrackingModalProps {
  open: boolean;
  onCancel: () => void;
  booking: BookingInfoDto;
  trackings: ServiceProcessTrackingInfoDto[];
  shouldCreateTracking?: boolean;
  onTrackingCreated?: () => void;
}

interface ServiceWithSteps {
  serviceId: string;
  serviceName: string;
  processId: string;
  steps: {
    stepId: string;
    stepName: string;
    stepOrder: number;
    estimatedTime: number;
    isRequired: boolean;
    tracking?: ServiceProcessTrackingInfoDto;
  }[];
}

const VehicleTrackingModal: React.FC<VehicleTrackingModalProps> = ({
  open,
  onCancel,
  booking,
  trackings,
  shouldCreateTracking = false,
  onTrackingCreated,
}) => {
  const [selectedTracking, setSelectedTracking] =
    useState<ServiceProcessTrackingInfoDto | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [servicesWithSteps, setServicesWithSteps] = useState<
    ServiceWithSteps[]
  >([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [trackingsState, setTrackingsState] =
    useState<ServiceProcessTrackingInfoDto[]>(trackings);
  const hasCreatedTrackingRef = useRef(false);

  const { notification } = App.useApp();

  const getStatusConfig = (status: TrackingStatus) => {
    const statusConfigs = {
      [TrackingStatus.PENDING]: {
        label: "Chờ thực hiện",
        color: "default",
        icon: <ClockCircleOutlined />,
      },
      [TrackingStatus.IN_PROGRESS]: {
        label: "Đang thực hiện",
        color: "blue",
        icon: <PlayCircleOutlined />,
      },
      [TrackingStatus.COMPLETED]: {
        label: "Hoàn thành",
        color: "green",
        icon: <CheckCircleOutlined />,
      },
      [TrackingStatus.CANCELLED]: {
        label: "Đã hủy",
        color: "red",
        icon: <ExclamationCircleOutlined />,
      },
    };
    return (
      statusConfigs[status] || {
        label: "Unknown",
        color: "default",
        icon: <ClockCircleOutlined />,
      }
    );
  };

  // Calculate overall statistics
  const totalSteps = servicesWithSteps.reduce(
    (sum, service) => sum + service.steps.length,
    0
  );
  const completedSteps = trackingsState.filter(
    (t) => t.status === TrackingStatus.COMPLETED
  ).length;
  const inProgressSteps = trackingsState.filter(
    (t) => t.status === TrackingStatus.IN_PROGRESS
  ).length;

  const totalEstimatedTime = servicesWithSteps.reduce(
    (sum, service) =>
      sum +
      service.steps.reduce(
        (stepSum, step) => stepSum + (step.estimatedTime || 0),
        0
      ),
    0
  );
  const totalActualTime = trackingsState.reduce(
    (sum, t) => sum + (t.actualDuration || 0),
    0
  );

  // Initialize services with steps (display only - no tracking creation)
  useEffect(() => {
    if (open && booking.booking_items && booking.booking_items.length > 0) {
      // Only create tracking if shouldCreateTracking is true AND we haven't created tracking yet
      if (shouldCreateTracking && !hasCreatedTrackingRef.current) {
        hasCreatedTrackingRef.current = true;
        initializeServicesWithSteps();
      } else if (!shouldCreateTracking) {
        // Just display existing data without creating tracking
        initializeServicesWithStepsDisplayOnly();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, booking.booking_items, shouldCreateTracking]);

  // Reset hasCreatedTrackingRef when modal closes
  useEffect(() => {
    if (!open) {
      hasCreatedTrackingRef.current = false;
    }
  }, [open]);

  // Update trackingsState when trackings prop changes
  useEffect(() => {
    setTrackingsState(trackings);
  }, [trackings]);

  // Initialize services with steps (display only - no tracking creation)
  const initializeServicesWithStepsDisplayOnly = async () => {
    console.log(
      "🚀 Starting initializeServicesWithStepsDisplayOnly for booking:",
      booking.booking_id
    );
    setIsInitializing(true);
    try {
      let servicesData: ServiceWithSteps[] = [];

      console.log("📋 Booking items:", booking.booking_items);

      // Cache service process data to avoid multiple API calls
      const serviceProcessCache = new Map<
        string,
        { processId: string; stepIds: string[] }
      >();

      // Pre-load service process data for all services
      const { ServiceProcessService } = await import(
        "@/lib/api/services/service-process.service"
      );

      for (const bookingItem of booking.booking_items || []) {
        if (bookingItem.service_id) {
          try {
            const serviceProcess =
              await ServiceProcessService.getServiceProcessByServiceId(
                bookingItem.service_id
              );
            if (serviceProcess?.id) {
              const processSteps =
                await ServiceProcessService.getServiceProcessSteps(
                  serviceProcess.id
                );
              const stepIds = processSteps.map((step) => step.id);
              serviceProcessCache.set(bookingItem.service_id, {
                processId: serviceProcess.id,
                stepIds,
              });
            }
          } catch (error) {
            console.warn(
              `Error loading service process for service ${bookingItem.service_id}:`,
              error
            );
          }
        }
      }

      // Create service groups first (similar to BookingTrackingManagementModal)
      const serviceMap = new Map<string, ServiceWithSteps>();

      // First, create service groups based on booking_items
      for (const bookingItem of booking.booking_items || []) {
        if (bookingItem.service_id) {
          const serviceId = bookingItem.service_id;
          const serviceName = bookingItem.item_name || "Unknown Service";

          if (!serviceMap.has(serviceId)) {
            serviceMap.set(serviceId, {
              serviceId,
              serviceName,
              processId: "",
              steps: [],
            });
          }
        }
      }

      // Now process each service and assign steps correctly
      for (const bookingItem of booking.booking_items || []) {
        console.log("🔍 Processing booking item:", bookingItem);

        if (bookingItem.service_id) {
          console.log("✅ Found service_id:", bookingItem.service_id);

          const serviceProcessData = serviceProcessCache.get(
            bookingItem.service_id
          );
          if (serviceProcessData) {
            // Get service process steps
            const processSteps =
              await ServiceProcessService.getServiceProcessSteps(
                serviceProcessData.processId
              );

            console.log(
              "📝 Process steps for service:",
              bookingItem.item_name,
              processSteps
            );

            if (processSteps && processSteps.length > 0) {
              const stepsWithTracking = processSteps.map((step) => {
                // Find existing tracking for this step
                // Priority 1: Find by carServiceId if available
                // Priority 2: Find by serviceStepId only (for backward compatibility)
                let existingTracking = trackingsState.find(
                  (t) => t.serviceStepId === step.id && t.carServiceId === bookingItem.service_id
                );

                // Fallback: Find by serviceStepId only if no carServiceId match
                if (!existingTracking) {
                  existingTracking = trackingsState.find(
                    (t) => t.serviceStepId === step.id && !t.carServiceId
                  );
                }

                console.log(
                  `🔍 Step ${step.name} (Service: ${bookingItem.item_name}) - existing tracking:`,
                  existingTracking
                );

                return {
                  stepId: step.id,
                  stepName: step.name,
                  stepOrder: step.step_order,
                  estimatedTime: step.estimated_time,
                  isRequired: step.is_required,
                  tracking: existingTracking,
                };
              });

              // Update the service in the map
              const service = serviceMap.get(bookingItem.service_id);
              if (service) {
                service.processId = serviceProcessData.processId;
                service.steps = stepsWithTracking.sort(
                  (a, b) => a.stepOrder - b.stepOrder
                );
              }
            }
          } else {
            console.log(
              "❌ No service process found for service_id:",
              bookingItem.service_id
            );
          }
        } else {
          console.log("❌ No service_id in booking item:", bookingItem);
        }
      }

      // Convert map to array
      servicesData = Array.from(serviceMap.values());

      console.log("📊 Final services data:", servicesData.map(service => ({
        serviceName: service.serviceName,
        serviceId: service.serviceId,
        stepCount: service.steps.length,
        steps: service.steps.map(step => ({
          stepName: step.stepName,
          stepOrder: step.stepOrder,
          hasTracking: !!step.tracking,
          trackingId: step.tracking?.trackingId,
          carServiceId: step.tracking?.carServiceId,
          status: step.tracking?.status
        }))
      })));
      setServicesWithSteps(servicesData);
    } catch (error) {
      console.error("❌ Error initializing services with steps:", error);
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi khởi tạo quy trình chăm sóc",
        placement: "topRight",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  // Initialize services with steps and create tracking records
  const initializeServicesWithSteps = async () => {
    console.log(
      "🚀 Starting initializeServicesWithSteps for booking:",
      booking.booking_id
    );
    setIsInitializing(true);
    try {
      let servicesData: ServiceWithSteps[] = [];

      console.log("📋 Booking items:", booking.booking_items);

      // Cache service process data to avoid multiple API calls
      const serviceProcessCache = new Map<
        string,
        { processId: string; stepIds: string[] }
      >();

      // Pre-load service process data for all services
      const { ServiceProcessService } = await import(
        "@/lib/api/services/service-process.service"
      );

      for (const bookingItem of booking.booking_items || []) {
        if (bookingItem.service_id) {
          try {
            const serviceProcess =
              await ServiceProcessService.getServiceProcessByServiceId(
                bookingItem.service_id
              );
            if (serviceProcess?.id) {
              const processSteps =
                await ServiceProcessService.getServiceProcessSteps(
                  serviceProcess.id
                );
              const stepIds = processSteps.map((step) => step.id);
              serviceProcessCache.set(bookingItem.service_id, {
                processId: serviceProcess.id,
                stepIds,
              });
            }
          } catch (error) {
            console.warn(
              `Error loading service process for service ${bookingItem.service_id}:`,
              error
            );
          }
        }
      }

      // Create service groups first (similar to BookingTrackingManagementModal)
      const serviceMap = new Map<string, ServiceWithSteps>();

      // First, create service groups based on booking_items
      for (const bookingItem of booking.booking_items || []) {
        if (bookingItem.service_id) {
          const serviceId = bookingItem.service_id;
          const serviceName = bookingItem.item_name || "Unknown Service";

          if (!serviceMap.has(serviceId)) {
            serviceMap.set(serviceId, {
              serviceId,
              serviceName,
              processId: "",
              steps: [],
            });
          }
        }
      }

      // Now process each service and assign steps correctly
      for (const bookingItem of booking.booking_items || []) {
        console.log("🔍 Processing booking item:", bookingItem);

        if (bookingItem.service_id) {
          console.log("✅ Found service_id:", bookingItem.service_id);

          const serviceProcessData = serviceProcessCache.get(
            bookingItem.service_id
          );
          if (serviceProcessData) {
            // Get service process steps
            const processSteps =
              await ServiceProcessService.getServiceProcessSteps(
                serviceProcessData.processId
              );

            console.log(
              "📝 Process steps for service:",
              bookingItem.item_name,
              processSteps
            );

            if (processSteps && processSteps.length > 0) {
              const stepsWithTracking = await Promise.all(
                processSteps.map(async (step) => {
                  // Find existing tracking for this step
                  // Priority 1: Find by carServiceId if available
                  // Priority 2: Find by serviceStepId only (for backward compatibility)
                  let existingTracking = trackingsState.find(
                    (t) => t.serviceStepId === step.id && t.carServiceId === bookingItem.service_id
                  );

                  // Fallback: Find by serviceStepId only if no carServiceId match
                  if (!existingTracking) {
                    existingTracking = trackingsState.find(
                      (t) => t.serviceStepId === step.id && !t.carServiceId
                    );
                  }

                  console.log(
                    `🔍 Step ${step.name} (Service: ${bookingItem.item_name}) - existing tracking:`,
                    existingTracking
                  );

                  // If no existing tracking, create one
                  if (!existingTracking && shouldCreateTracking) {
                    console.log(
                      `🆕 Creating tracking for step: ${step.name} (Service: ${bookingItem.item_name})`
                    );
                    try {
                      const { ServiceProcessTrackingService } = await import(
                        "@/lib/api/services/service-process-tracking.service"
                      );

                      const createTrackingRequest = {
                        booking_id: booking.booking_id,
                        service_step_id: step.id,
                        bay_id: booking.bay_id,
                        car_service_id: bookingItem.service_id,
                        status: TrackingStatus.PENDING,
                        notes: `Tự động tạo tracking cho bước: ${step.name} (Dịch vụ: ${bookingItem.item_name})`,
                      };

                      console.log(
                        "📤 Creating tracking with request:",
                        createTrackingRequest
                      );
                      console.log("🏢 Booking bay_id:", booking.bay_id);

                      const newTracking =
                        await ServiceProcessTrackingService.createTracking(
                          createTrackingRequest
                        );

                      console.log("✅ Created tracking:", newTracking);
                      existingTracking = newTracking;

                      // Add to trackings array
                      setTrackingsState((prev) => [...prev, newTracking]);

                      // Notify parent component
                      if (onTrackingCreated) {
                        onTrackingCreated();
                      }
                    } catch (error) {
                      console.error(
                        `❌ Error creating tracking for step ${step.name}:`,
                        error
                      );
                    }
                  }

                  return {
                    stepId: step.id,
                    stepName: step.name,
                    stepOrder: step.step_order,
                    estimatedTime: step.estimated_time,
                    isRequired: step.is_required,
                    tracking: existingTracking,
                  };
                })
              );

              // Update the service in the map
              const service = serviceMap.get(bookingItem.service_id);
              if (service) {
                service.processId = serviceProcessData.processId;
                service.steps = stepsWithTracking.sort(
                  (a, b) => a.stepOrder - b.stepOrder
                );
              }
            }
          } else {
            console.log(
              "❌ No service process found for service_id:",
              bookingItem.service_id
            );
          }
        } else {
          console.log("❌ No service_id in booking item:", bookingItem);
        }
      }

      // Convert map to array
      servicesData = Array.from(serviceMap.values());

      console.log("📊 Final services data:", servicesData.map(service => ({
        serviceName: service.serviceName,
        serviceId: service.serviceId,
        stepCount: service.steps.length,
        steps: service.steps.map(step => ({
          stepName: step.stepName,
          stepOrder: step.stepOrder,
          hasTracking: !!step.tracking,
          trackingId: step.tracking?.trackingId,
          carServiceId: step.tracking?.carServiceId,
          status: step.tracking?.status
        }))
      })));
      setServicesWithSteps(servicesData);
    } catch (error) {
      console.error("❌ Error initializing services with steps:", error);
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi khởi tạo quy trình chăm sóc",
        placement: "topRight",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleViewDetail = (tracking: ServiceProcessTrackingInfoDto) => {
    setSelectedTracking(tracking);
    setDetailModalOpen(true);
  };

  return (
    <App>
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CarOutlined style={{ color: "#1890ff" }} />
            <span>Quá trình chăm sóc xe</span>
            <Tag color="blue">{booking.booking_code}</Tag>
          </div>
        }
        open={open}
        onCancel={onCancel}
        footer={null}
        width={1400}
        destroyOnHidden
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Vehicle Information */}
          <Card size="small">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <CarOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                  <Text strong>Thông tin xe</Text>
                </div>
                <div style={{ marginLeft: 24 }}>
                  <div>
                    <Text strong>Biển số:</Text> {booking.vehicle_license_plate}
                  </div>
                  <div>
                    <Text strong>Khách hàng:</Text> {booking.customer_name}
                  </div>
                  <div>
                    <Text strong>SĐT:</Text> {booking.customer_phone}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <ToolOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                  <Text strong>Thông tin dịch vụ</Text>
                </div>
                <div style={{ marginLeft: 24 }}>
                  <div>
                    <Text strong>Số bước:</Text> {totalSteps} bước
                  </div>
                  <div>
                    <Text strong>Thời gian ước tính:</Text> {totalEstimatedTime}{" "}
                    phút
                  </div>
                  <div>
                    <Text strong>Thời gian thực tế:</Text> {totalActualTime}{" "}
                    phút
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <EnvironmentOutlined
                    style={{ marginRight: 8, color: "#fa8c16" }}
                  />
                  <Text strong>Chi nhánh</Text>
                </div>
                <div style={{ marginLeft: 24 }}>
                  <div>
                    <Text strong>{booking.branch_name}</Text>
                  </div>
                  <div>
                    <Text style={{ fontSize: 12, color: "#666" }}>
                      {booking.branch_code}
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Overall Statistics */}
          <Card size="small" title="Thống kê tổng quan">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Đang thực hiện"
                  value={inProgressSteps}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Đã hoàn thành"
                  value={completedSteps}
                  suffix={`/ ${totalSteps}`}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
            </Row>
          </Card>

          {/* Services with Steps */}
          {isInitializing ? (
            <Card size="small" title="Đang tải thông tin tracking...">
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Progress type="circle" percent={75} />
                <div style={{ marginTop: 16 }}>
                  <Text>Đang tải thông tin dịch vụ và tracking...</Text>
                </div>
              </div>
            </Card>
          ) : (
            <div>
              {servicesWithSteps.map((service) => (
                <Card
                  key={service.serviceId}
                  size="small"
                  title={
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <ToolOutlined style={{ color: "#1890ff" }} />
                      <span>{service.serviceName}</span>
                      <Tag color="blue">{service.steps.length} bước</Tag>
                    </div>
                  }
                  style={{ marginBottom: 16 }}
                >
                  <div>
                    {service.steps.map((step) => {
                      // Determine visual state
                      const isCompleted =
                        step.tracking?.status === TrackingStatus.COMPLETED;
                      const isInProgress =
                        step.tracking?.status === TrackingStatus.IN_PROGRESS;
                      const isPending =
                        step.tracking?.status === TrackingStatus.PENDING;
                      const hasTracking = !!step.tracking;

                      return (
                        <div key={step.stepId} style={{ marginBottom: 12 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "12px",
                              backgroundColor: isCompleted
                                ? "#f6ffed"
                                : isInProgress
                                ? "#e6f7ff"
                                : isPending
                                ? "#fff7e6"
                                : hasTracking
                                ? "#f5f5f5"
                                : "#fafafa",
                              borderRadius: "6px",
                              border: isCompleted
                                ? "1px solid #b7eb8f"
                                : isInProgress
                                ? "1px solid #91d5ff"
                                : isPending
                                ? "1px solid #ffd591"
                                : hasTracking
                                ? "1px solid #d9d9d9"
                                : "1px solid #e8e8e8",
                            }}
                          >
                            <div style={{ marginRight: 12 }}>
                              <Tag
                                color={
                                  hasTracking
                                    ? getStatusConfig(step.tracking!.status)
                                        .color
                                    : "default"
                                }
                                icon={
                                  hasTracking ? (
                                    getStatusConfig(step.tracking!.status).icon
                                  ) : (
                                    <ClockCircleOutlined />
                                  )
                                }
                              >
                                Bước {step.stepOrder}
                              </Tag>
                            </div>

                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontWeight: 500,
                                  marginBottom: 4,
                                  color: hasTracking ? "#000" : "#999",
                                }}
                              >
                                {step.stepName}
                                {!hasTracking && (
                                  <Text
                                    style={{
                                      fontSize: 11,
                                      color: "#999",
                                      marginLeft: 8,
                                    }}
                                  >
                                    (Chưa có tracking)
                                  </Text>
                                )}
                              </div>
                              <div style={{ fontSize: 12, color: "#666" }}>
                                {step.isRequired && (
                                  <Tag
                                    color="red"
                                    style={{ marginLeft: 8, fontSize: 10 }}
                                  >
                                    Bắt buộc
                                  </Tag>
                                )}
                                {!hasTracking && (
                                  <Tag
                                    color="orange"
                                    style={{ marginLeft: 8, fontSize: 10 }}
                                  >
                                    Chưa tạo tracking
                                  </Tag>
                                )}
                              </div>
                              {step.tracking?.notes && (
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "#666",
                                    marginTop: 4,
                                  }}
                                >
                                  Ghi chú: {step.tracking.notes}
                                </div>
                              )}
                            </div>

                            <div style={{ marginLeft: 12 }}>
                              {hasTracking ? (
                                <Button
                                  type="primary"
                                  size="small"
                                  icon={<EyeOutlined />}
                                  onClick={() =>
                                    handleViewDetail(step.tracking!)
                                  }
                                >
                                  Chi tiết
                                </Button>
                              ) : (
                                <Button
                                  type="default"
              size="small"
                                  disabled
                                  style={{ color: "#999" }}
                                >
                                  Chưa có tracking
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
          </Card>
              ))}
            </div>
          )}
        </Space>
      </Modal>

      {/* Tracking Detail Modal */}
      {selectedTracking && (
        <TrackingDetailModal
          open={detailModalOpen}
          onCancel={() => {
            setDetailModalOpen(false);
            setSelectedTracking(null);
          }}
          tracking={selectedTracking}
        />
      )}
    </App>
  );
};

export default VehicleTrackingModal;
