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
  CreateServiceProcessTrackingRequest,
} from "@/lib/api/types/service-process-tracking.types";
import { BookingInfoDto } from "@/lib/api/types/booking.types";
import { ServiceProcessTrackingService } from "@/lib/api/services/service-process-tracking.service";
import { ServiceBayService } from "@/lib/api/services/service-bay.service";
import { TechnicianInfo } from "@/lib/api/types/service-bay.types";
import { ServiceProcessService } from "@/lib/api/services/service-process.service";

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
  const [technicians, setTechnicians] = useState<TechnicianInfo[]>([]);
  const [isCreatingTracking, setIsCreatingTracking] = useState(false);

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

  // Simplified loader: fetch trackings by bookingId on open and build view model
  useEffect(() => {
    const loadTrackingsForBooking = async () => {
      try {
        setIsInitializing(true);
        const data = await ServiceProcessTrackingService.getTrackingsByBooking(
          booking.booking_id
        );

        const fetchedTrackings: ServiceProcessTrackingInfoDto[] = Array.isArray(
          data
        )
          ? (data as unknown as ServiceProcessTrackingInfoDto[])
          : (data as unknown as { data?: ServiceProcessTrackingInfoDto[] })
              ?.data || [];

        setTrackingsState(fetchedTrackings);

        // Group by carServiceId and order by serviceStepOrder
        const serviceMap = new Map<string, ServiceWithSteps>();

        // Create groups from booking items for better names
        (booking.booking_items || []).forEach((item) => {
          if (item.service_id && !serviceMap.has(item.service_id)) {
            serviceMap.set(item.service_id, {
              serviceId: item.service_id,
              serviceName: item.item_name || "Dịch vụ",
              processId: "",
              steps: [],
            });
          }
        });

        fetchedTrackings.forEach((t) => {
          const svcId =
            t.carServiceId ||
            booking.booking_items?.[0]?.service_id ||
            "unknown";
          if (!serviceMap.has(svcId)) {
            serviceMap.set(svcId, {
              serviceId: svcId,
              serviceName:
                booking.booking_items?.find((bi) => bi.service_id === svcId)
                  ?.item_name || "Dịch vụ",
              processId: "",
              steps: [],
            });
          }
          const group = serviceMap.get(svcId)!;
          group.steps.push({
            stepId: t.serviceStepId,
            stepName: t.serviceStepName || "Bước",
            stepOrder: t.serviceStepOrder || 0,
            estimatedTime: t.estimatedDuration || 0,
            isRequired: t.isRequired ?? true,
            tracking: t,
          });
        });

        // Sort steps inside each group
        const servicesData = Array.from(serviceMap.values()).map((svc) => ({
          ...svc,
          steps: svc.steps.sort((a, b) => a.stepOrder - b.stepOrder),
        }));

        setServicesWithSteps(servicesData);
      } catch (error) {
        console.log("Failed to load trackings by booking:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    if (open && booking.booking_id) {
      // Always fetch fresh data each time the modal opens
      loadTrackingsForBooking();
    }
  }, [open, booking.booking_id, booking.booking_items]);

  // Load technicians by bay when modal opens
  useEffect(() => {
    const loadTechnicians = async () => {
      if (!booking.bay_id) {
        console.log("No bay_id found in booking:", booking);
        setTechnicians([]);
        return;
      }
      try {
        console.log("Loading technicians for bay_id:", booking.bay_id);
        const bay = await ServiceBayService.getServiceBayById(booking.bay_id);
        console.log("Bay data received:", bay);
        console.log("Technicians from bay:", bay?.technicians);
        const techArray = bay?.technicians || [];
        console.log("Setting technicians array:", techArray);
        setTechnicians(techArray);
      } catch (e) {
        console.log("Failed to load bay technicians:", e);
        setTechnicians([]);
      }
    };
    if (open && booking.bay_id) loadTechnicians();
  }, [open, booking.bay_id, booking]);

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

  // Auto-create tracking when shouldCreateTracking is true
  useEffect(() => {
    const autoCreateTracking = async () => {
      if (!shouldCreateTracking || !open || hasCreatedTrackingRef.current || isCreatingTracking) {
        console.log("🚫 Skipping auto-create tracking:", {
          shouldCreateTracking,
          open,
          hasCreated: hasCreatedTrackingRef.current,
          isCreating: isCreatingTracking
        });
        return;
      }

      try {
        setIsCreatingTracking(true);
        console.log("🚀 Auto-creating tracking for booking:", booking.booking_id);

        // Get service steps for each service in booking - create tracking for each service separately
        const serviceStepsByService = [];
        for (const item of booking.booking_items || []) {
          if (item.service_id) {
            try {
              console.log(`🔍 Processing service: ${item.service_id} - ${item.item_name}`);
              // Get service process for this service
              const serviceProcess = await ServiceProcessService.getServiceProcessByServiceId(item.service_id);
              if (serviceProcess?.process_steps || serviceProcess?.processSteps) {
                const steps = serviceProcess.process_steps || serviceProcess.processSteps || [];
                console.log(`📋 Found ${steps.length} steps for service ${item.service_id}`);
                
                serviceStepsByService.push({
                  service_id: item.service_id,
                  service_name: item.item_name,
                  steps: steps.map(step => ({
                    ...step,
                    service_id: item.service_id,
                    service_name: item.item_name
                  }))
                });
              }
            } catch (error) {
              console.warn(`Failed to get service process for service ${item.service_id}:`, error);
            }
          }
        }

        if (serviceStepsByService.length === 0) {
          console.warn("No service steps found for booking services");
          notification.warning({
            message: "Cảnh báo",
            description: "Không tìm thấy quy trình dịch vụ để tạo tracking",
        placement: "topRight",
      });
          return;
        }

        // Create tracking for each step in each service
        const createdTrackings = [];
        for (const serviceData of serviceStepsByService) {
          console.log(`🎯 Creating trackings for service: ${serviceData.service_name} (${serviceData.service_id})`);
          
          for (const step of serviceData.steps) {
            try {
              const trackingRequest: CreateServiceProcessTrackingRequest = {
                booking_id: booking.booking_id,
                service_step_id: step.id,
                car_service_id: step.service_id, // ID của service mà booking đã đặt
                bay_id: booking.bay_id || "",
                status: TrackingStatus.PENDING,
                notes: `Tự động tạo tracking cho bước: ${step.name} (${serviceData.service_name})`,
              };

              const createdTracking = await ServiceProcessTrackingService.createTracking(trackingRequest);
              createdTrackings.push(createdTracking);
              console.log(`✅ Created tracking for step: ${step.name} in service: ${serviceData.service_name}`);
            } catch (error) {
              console.log(`❌ Failed to create tracking for step ${step.name} in service ${serviceData.service_name}:`, error);
            }
          }
        }

        if (createdTrackings.length > 0) {
          notification.success({
            message: "Thành công",
            description: `Đã tạo ${createdTrackings.length} tracking tự động`,
            placement: "topRight",
          });

          // Mark as created and call callback
          hasCreatedTrackingRef.current = true;
                      if (onTrackingCreated) {
                        onTrackingCreated();
          }

          // Refresh tracking data
          const freshTrackings = await ServiceProcessTrackingService.getTrackingsByBooking(booking.booking_id);
          setTrackingsState(freshTrackings);
        } else {
          notification.error({
            message: "Lỗi",
            description: "Không thể tạo tracking tự động",
            placement: "topRight",
          });
        }
    } catch (error) {
        console.log("❌ Auto-create tracking error:", error);
      notification.error({
        message: "Lỗi",
          description: "Có lỗi xảy ra khi tạo tracking tự động",
        placement: "topRight",
      });
    } finally {
        setIsCreatingTracking(false);
    }
  };

    autoCreateTracking();
  }, [shouldCreateTracking, open, booking.booking_id, booking.booking_items, booking.bay_id, technicians, onTrackingCreated, notification, isCreatingTracking]);

  const handleViewDetail = (tracking: ServiceProcessTrackingInfoDto) => {
    console.log("🔍 Opening tracking detail modal for:", tracking.trackingId);
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
                  {booking.bay_id && (
                    <div style={{ marginTop: 8 }}>
                      <div>
                        <Text strong>Service Bay:</Text> {booking.bay_name}
                      </div>

                      {technicians && technicians.length > 0 ? (
                        <div style={{ marginTop: 6 }}>
                          <Text strong>Kỹ thuật viên:</Text>
                          <div style={{ marginTop: 6 }}>
                            {technicians.map((t) => (
                              <Tag
                                key={t.technician_id}
                                color="blue"
                                style={{ marginBottom: 4 }}
                              >
                                {t.technician_name}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginTop: 6 }}>
                          <Text strong>Kỹ thuật viên:</Text>
                          <Text style={{ color: "#999", fontSize: 12 }}>
                            {technicians.length === 0
                              ? "Chưa có kỹ thuật viên"
                              : "Đang tải..."}
                          </Text>
                        </div>
                      )}
                    </div>
                  )}
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
          {isInitializing || isCreatingTracking ? (
            <Card size="small" title={isCreatingTracking ? "Đang tạo tracking tự động..." : "Đang tải thông tin tracking..."}>
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Progress type="circle" percent={75} />
                <div style={{ marginTop: 16 }}>
                  <Text>
                    {isCreatingTracking 
                      ? "Đang tạo tracking tự động cho các bước dịch vụ..." 
                      : "Đang tải thông tin dịch vụ và tracking..."
                    }
                  </Text>
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
