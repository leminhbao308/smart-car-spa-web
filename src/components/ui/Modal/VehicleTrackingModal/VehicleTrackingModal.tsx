"use client";
import React, { useState, useEffect } from "react";
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
}) => {
  const [selectedTracking, setSelectedTracking] =
    useState<ServiceProcessTrackingInfoDto | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [servicesWithSteps, setServicesWithSteps] = useState<
    ServiceWithSteps[]
  >([]);
  const [isInitializing, setIsInitializing] = useState(false);

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

  // Calculate overall statistics (only for existing trackings)
  const totalSteps = trackings.length;
  const completedSteps = trackings.filter(
    (t) => t.status === TrackingStatus.COMPLETED
  ).length;
  const inProgressSteps = trackings.filter(
    (t) => t.status === TrackingStatus.IN_PROGRESS
  ).length;

  const totalEstimatedTime = trackings.reduce(
    (sum, t) => sum + (t.estimatedTime || 0),
    0
  );
  const totalActualTime = trackings.reduce(
    (sum, t) => sum + (t.actualDuration || 0),
    0
  );

  // Initialize services with steps (display only - no tracking creation)
  useEffect(() => {
    if (open && booking.booking_items && booking.booking_items.length > 0) {
      initializeServicesWithSteps();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, booking.booking_items, trackings]);

  // Initialize services with steps (display only - no tracking creation)
  const initializeServicesWithSteps = async () => {
    console.log(
      "🚀 Starting initializeServicesWithSteps for booking:",
      booking.booking_id
    );
    setIsInitializing(true);
    try {
      const servicesData: ServiceWithSteps[] = [];

      console.log("📋 Booking items:", booking.booking_items);

      for (const bookingItem of booking.booking_items || []) {
        console.log("🔍 Processing booking item:", bookingItem);

        if (bookingItem.service_id) {
          console.log("✅ Found service_id:", bookingItem.service_id);

          // Get service process for this service
          const { ServiceProcessService } = await import(
            "@/lib/api/services/service-process.service"
          );
          const serviceProcess =
            await ServiceProcessService.getServiceProcessByServiceId(
              bookingItem.service_id
            );

          console.log("📊 Service process:", serviceProcess);

          if (serviceProcess?.id) {
            // Get service process steps
            const processSteps =
              await ServiceProcessService.getServiceProcessSteps(
                serviceProcess.id
              );

            console.log("📝 Process steps:", processSteps);

            if (processSteps && processSteps.length > 0) {
              const stepsWithTracking = processSteps.map((step) => {
                // Find existing tracking for this step
                const existingTracking = trackings.find(
                  (t) => t.serviceStepId === step.id
                );

                console.log(
                  `🔍 Step ${step.name} - existing tracking:`,
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

              servicesData.push({
                serviceId: bookingItem.service_id,
                serviceName: bookingItem.item_name,
                processId: serviceProcess.id,
                steps: stepsWithTracking.sort(
                  (a, b) => a.stepOrder - b.stepOrder
                ),
              });
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

      console.log("📊 Final services data:", servicesData);
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
                      <Tag color="blue">
                        {service.steps.filter((step) => step.tracking).length}{" "}
                        bước
                      </Tag>
                    </div>
                  }
                  style={{ marginBottom: 16 }}
                >
                  <div>
                    {service.steps
                      .filter((step) => step.tracking) // Only show steps that have tracking
                      .map((step) => {
                        // Determine visual state
                        const isCompleted =
                          step.tracking?.status === TrackingStatus.COMPLETED;
                        const isInProgress =
                          step.tracking?.status === TrackingStatus.IN_PROGRESS;
                        const isPending =
                          step.tracking?.status === TrackingStatus.PENDING;

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
                                  : "#f5f5f5",
                                borderRadius: "6px",
                                border: isCompleted
                                  ? "1px solid #b7eb8f"
                                  : isInProgress
                                  ? "1px solid #91d5ff"
                                  : isPending
                                  ? "1px solid #ffd591"
                                  : "1px solid #d9d9d9",
                              }}
                            >
                              <div style={{ marginRight: 12 }}>
                                <Tag
                                  color={
                                    getStatusConfig(step.tracking!.status).color
                                  }
                                  icon={
                                    getStatusConfig(step.tracking!.status).icon
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
                                    color: "#000",
                                  }}
                                >
                                  {step.stepName}
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
