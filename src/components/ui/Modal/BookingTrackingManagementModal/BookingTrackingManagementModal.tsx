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
  Progress,
  App,
  Form,
  Input,
  Alert,
} from "antd";
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ToolOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { BookingInfoDto } from "@/lib/api/types/booking.types";
import {
  ServiceProcessTrackingInfoDto,
  TrackingStatus,
} from "@/lib/api/types/service-process-tracking.types";
import { ServiceProcessTrackingService } from "@/lib/api/services/service-process-tracking.service";
import { useQueryClient } from "@tanstack/react-query";
import { BookingService, ServiceProcessService } from "@/lib/api";

const { Text } = Typography;
const { TextArea } = Input;

// Prop types
interface BookingTrackingManagementModalProps {
  open: boolean;
  onCancel: () => void;
  booking: BookingInfoDto;
}

interface ServiceWithTrackings {
  serviceId: string;
  serviceName: string;
  trackings: ServiceProcessTrackingInfoDto[];
}

const BookingTrackingManagementModal: React.FC<
  BookingTrackingManagementModalProps
> = ({ open, onCancel, booking }) => {
  const [servicesWithTrackings, setServicesWithTrackings] = useState<
    ServiceWithTrackings[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [completingTracking, setCompletingTracking] = useState<string | null>(
    null
  );
  const [form] = Form.useForm();

  const { notification } = App.useApp();
  const queryClient = useQueryClient();

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

  // Load tracking data when modal opens
  useEffect(() => {
    if (open && booking.booking_id) {
      loadTrackingData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, booking.booking_id]);

  const loadTrackingData = async () => {
    setLoading(true);
    try {
      const trackings =
        await ServiceProcessTrackingService.getTrackingsByBooking(
          booking.booking_id
        );

      // Group trackings by actual service from booking_items
      const serviceMap = new Map<string, ServiceWithTrackings>();

      // First, create service groups based on booking_items
      for (const bookingItem of booking.booking_items || []) {
        if (bookingItem.service_id) {
          const serviceId = bookingItem.service_id;
          const serviceName = bookingItem.service_name || "Unknown Service";

          if (!serviceMap.has(serviceId)) {
            serviceMap.set(serviceId, {
              serviceId,
              serviceName,
              trackings: [],
            });
          }
        }
      }

      // Cache service process data to avoid multiple API calls
      const serviceProcessCache = new Map<
        string,
        { processId: string; stepIds: string[] }
      >();

      // Pre-load service process data for all services

      for (const [serviceId] of serviceMap.entries()) {
        try {
          const serviceProcess =
            await ServiceProcessService.getServiceProcessByServiceId(serviceId);
          if (serviceProcess?.id) {
            const processSteps =
              await ServiceProcessService.getServiceProcessSteps(
                serviceProcess.id
              );
            const stepIds = processSteps.map((step) => step.id);
            serviceProcessCache.set(serviceId, {
              processId: serviceProcess.id,
              stepIds,
            });
          }
        } catch (error) {
          console.warn(
            `Error loading service process for service ${serviceId}:`,
            error
          );
        }
      }

      // Then, assign trackings to their corresponding services using carServiceId
      for (const tracking of trackings) {
        let assignedServiceId: string | null = null;

        // Priority 1: Use carServiceId if available and valid
        if (tracking.carServiceId && serviceMap.has(tracking.carServiceId)) {
          assignedServiceId = tracking.carServiceId;
        } else {
          // Priority 2: Try to find which service this tracking belongs to using cached data
          for (const [serviceId, cachedData] of serviceProcessCache.entries()) {
            const stepBelongsToService = cachedData.stepIds.includes(
              tracking.serviceStepId
            );

            if (stepBelongsToService) {
              assignedServiceId = serviceId;
              break; // Found the correct service, stop looking
            }
          }

          // Priority 3: If we couldn't determine the service, assign to the first available service
          if (!assignedServiceId && serviceMap.size > 0) {
            assignedServiceId = Array.from(serviceMap.keys())[0];
          }
        }

        if (assignedServiceId && serviceMap.has(assignedServiceId)) {
          const service = serviceMap.get(assignedServiceId)!;
          service.trackings.push(tracking);
        } else {
          console.log(
            `❌ Could not assign tracking ${tracking.trackingId} to any service`
          );
        }
      }

      // Filter out services that have no trackings and sort trackings by step order
      const services = Array.from(serviceMap.values())
        .filter((service) => service.trackings.length > 0)
        .map((service) => ({
          ...service,
          trackings: service.trackings.sort(
            (a, b) => (a.serviceStepOrder || 0) - (b.serviceStepOrder || 0)
          ),
        }));

      setServicesWithTrackings(services);
    } catch (error) {
      console.log("Error loading tracking data:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tải dữ liệu tracking",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const canStartTracking = (
    tracking: ServiceProcessTrackingInfoDto,
    serviceTrackings: ServiceProcessTrackingInfoDto[]
  ) => {
    const currentIndex = serviceTrackings.findIndex(
      (t) => t.trackingId === tracking.trackingId
    );

    // Only the first tracking of service can start
    return currentIndex === 0;
  };

  const handleStartTracking = async (
    tracking: ServiceProcessTrackingInfoDto
  ) => {
    setUpdating(tracking.trackingId);
    try {
      await ServiceProcessTrackingService.startStep(tracking.trackingId, {
        notes: "Bắt đầu thực hiện bước",
      });

      notification.success({
        message: "Thành công",
        description: "Đã bắt đầu thực hiện bước",
        placement: "topRight",
      });

      // Refresh data
      await loadTrackingData();
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    } catch (error) {
      console.log("Error starting tracking:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể bắt đầu thực hiện bước",
        placement: "topRight",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleCompleteTracking = async (
    tracking: ServiceProcessTrackingInfoDto
  ) => {
    const values = await form.validateFields();

    setUpdating(tracking.trackingId);

    try {
      await ServiceProcessTrackingService.completeStep(tracking.trackingId, {
        notes: values.notes || "Hoàn thành bước",
        evidence_media_urls: values.evidence_media_urls || undefined,
      });

      notification.success({
        message: "Thành công",
        description: "Đã hoàn thành bước",
        placement: "topRight",
      });
      const currentService = servicesWithTrackings.find((service) =>
        service.trackings.some((t) => t.trackingId === tracking.trackingId)
      );
      if (currentService) {
        // Auto start next tracking in Current Service
        await autoStartNextTracking(tracking, currentService.trackings);
      }

      await loadTrackingData();
      setCompletingTracking(null);
      form.resetFields();
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    } catch (error) {
      console.log("Error completing tracking:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể hoàn thành bước",
        placement: "topRight",
      });
    } finally {
      setUpdating(null);
    }
  };

  const autoStartNextTracking = async (
    completedTracking: ServiceProcessTrackingInfoDto,
    serviceTrackings: ServiceProcessTrackingInfoDto[]
  ) => {
    try {
      // 1. Tìm index của tracking vừa hoàn thành
      const currentIndex = serviceTrackings.findIndex(
        (t) => t.trackingId === completedTracking.trackingId
      );

      // 2. Kiểm tra có tracking tiếp theo không
      const nextTracking = serviceTrackings[currentIndex + 1];

      // 3. Nếu có tracking tiếp theo và đang ở trạng thái PENDING
      if (nextTracking && nextTracking.status === TrackingStatus.PENDING) {
        // 4. Tự động gọi API start tracking tiếp theo
        await ServiceProcessTrackingService.startStep(nextTracking.trackingId, {
          notes: `Bắt đầu thực hiện bước ${nextTracking.serviceStepOrder}`,
        });
      }
    } catch (error) {
      console.log("Auto-start next tracking failed:", error);
    }
  };

  // handle open form complete tracking ----- form complete tracking
  const handleOpenFormCompleteTracking = (
    tracking: ServiceProcessTrackingInfoDto
  ) => {
    setCompletingTracking(tracking.trackingId);
    form.setFieldsValue({
      notes: tracking.notes || "",
      evidence_media_urls: tracking.evidenceMediaUrls || "",
    });
  };

  // handle close form complete tracking ----- form complete tracking
  const handleCloseFormCompleteTracking = () => {
    setCompletingTracking(null);
    form.resetFields();
  };

  const handleCompleteBooking = async () => {
    setUpdating("complete-booking");
    console.log("handleCompleteBooking");
    try {
      await BookingService.completeService(booking.booking_id);

      notification.success({
        message: "Hoàn thành booking",
        description: "Booking đã được hoàn thành thành công.",
        placement: "topRight",
        duration: 5,
      });

      // Refresh booking data
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({
        queryKey: ["bookings", booking.booking_id],
      });

      // Close modal after successful completion
      setTimeout(() => {
        onCancel();
      }, 2000);
    } catch (error) {
      console.log("Error completing booking:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể hoàn thành booking",
        placement: "topRight",
      });
    } finally {
      setUpdating(null);
    }
  };

  // Calculate overall progress
  const totalSteps = servicesWithTrackings.reduce(
    (sum, service) => sum + service.trackings.length,
    0
  );
  const completedSteps = servicesWithTrackings.reduce(
    (sum, service) =>
      sum +
      service.trackings.filter((t) => t.status === TrackingStatus.COMPLETED)
        .length,
    0
  );
  const overallProgress =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <App>
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ToolOutlined style={{ color: "#1890ff" }} />
            <span>Quản lý tracking - {booking.booking_code}</span>
          </div>
        }
        open={open}
        onCancel={onCancel}
        footer={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              {overallProgress === 100 && (
                <Tag
                  color="green"
                  icon={<CheckCircleOutlined />}
                  style={{ fontSize: 12 }}
                >
                  Tất cả bước đã hoàn thành - Sẵn sàng hoàn thành booking
                </Tag>
              )}
            </div>
            <Space>
              <Button onClick={onCancel}>Đóng</Button>
              {overallProgress === 100 && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={updating === "complete-booking"}
                  onClick={() => handleCompleteBooking()}
                  style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                >
                  Hoàn thành booking
                </Button>
              )}
            </Space>
          </div>
        }
        width={1200}
        destroyOnHidden
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Booking Info */}
          <Card size="small">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div>
                  <Text strong>Khách hàng:</Text> {booking.customer_name}
                </div>
                <div>
                  <Text strong>Biển số:</Text> {booking.vehicle_license_plate}
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <Text strong>Tổng bước:</Text> {totalSteps} bước
                </div>
                <div>
                  <Text strong>Đã hoàn thành:</Text> {completedSteps} bước
                </div>
                {overallProgress === 100 && (
                  <div style={{ marginTop: 8 }}>
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                      Sẵn sàng hoàn thành booking
                    </Tag>
                  </div>
                )}
              </Col>
              <Col span={8}>
                <div>
                  <Text strong>Tiến độ tổng thể:</Text>
                </div>
                <Progress
                  percent={overallProgress}
                  strokeColor={overallProgress === 100 ? "#52c41a" : "#1890ff"}
                  size="small"
                />
                {overallProgress === 100 && (
                  <div style={{ marginTop: 4, fontSize: 12, color: "#52c41a" }}>
                    ✅ Tất cả bước đã hoàn thành
                  </div>
                )}
              </Col>
            </Row>
          </Card>

          {/* Services Summary */}
          {servicesWithTrackings.length > 0 && (
            <Card size="small" title="Tổng quan dịch vụ">
              <Row gutter={[16, 8]}>
                {servicesWithTrackings.map((service, index) => {
                  const completedInService = service.trackings.filter(
                    (t) => t.status === TrackingStatus.COMPLETED
                  ).length;
                  const serviceProgress =
                    service.trackings.length > 0
                      ? Math.round(
                          (completedInService / service.trackings.length) * 100
                        )
                      : 0;

                  return (
                    <Col span={12} key={service.serviceId}>
                      <div
                        style={{
                          padding: "12px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "6px",
                          border: "1px solid #e9ecef",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 8,
                          }}
                        >
                          <Tag color="blue" style={{ fontSize: 10 }}>
                            Dịch vụ {index + 1}
                          </Tag>
                          <Text strong style={{ fontSize: 14 }}>
                            {service.serviceName}
                          </Text>
                        </div>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          <div>
                            Bước: {completedInService}/
                            {service.trackings.length}
                          </div>
                          <Progress
                            percent={serviceProgress}
                            size="small"
                            strokeColor={
                              serviceProgress === 100 ? "#52c41a" : "#1890ff"
                            }
                          />
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          )}

          {/* Services and Trackings */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Progress type="circle" percent={75} />
              <div style={{ marginTop: 16 }}>
                <Text>Đang tải dữ liệu tracking...</Text>
              </div>
            </div>
          ) : (
            <div>
              {servicesWithTrackings.map((service, serviceIndex) => (
                <Card
                  key={service.serviceId}
                  size="small"
                  title={
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <ToolOutlined style={{ color: "#1890ff" }} />
                      <span>{service.serviceName}</span>
                      <Tag color="blue">{service.trackings.length} bước</Tag>
                      <Tag color="green" style={{ fontSize: 10 }}>
                        Dịch vụ {serviceIndex + 1}
                      </Tag>
                    </div>
                  }
                  style={{
                    marginBottom: 16,
                    border: "2px solid #e6f7ff",
                    borderRadius: "8px",
                  }}
                  styles={{
                    header: {
                      backgroundColor: "#f0f8ff",
                      borderBottom: "1px solid #d6e4ff",
                    },
                  }}
                >
                  <div>
                    {service.trackings.map((tracking, index) => {
                      const statusConfig = getStatusConfig(tracking.status);
                      const canStart = canStartTracking(
                        tracking,
                        service.trackings
                      );
                      const isUpdating = updating === tracking.trackingId;

                      return (
                        <div
                          key={tracking.trackingId}
                          style={{ marginBottom: 16 }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "16px",
                              backgroundColor:
                                tracking.status === TrackingStatus.COMPLETED
                                  ? "#f6ffed"
                                  : tracking.status ===
                                    TrackingStatus.IN_PROGRESS
                                  ? "#e6f7ff"
                                  : canStart
                                  ? "#f0f8ff"
                                  : "#f5f5f5",
                              borderRadius: "8px",
                              border:
                                tracking.status === TrackingStatus.COMPLETED
                                  ? "1px solid #b7eb8f"
                                  : tracking.status ===
                                    TrackingStatus.IN_PROGRESS
                                  ? "1px solid #91d5ff"
                                  : canStart
                                  ? "1px solid #d6e4ff"
                                  : "1px solid #d9d9d9",
                              opacity: canStart || tracking.status === TrackingStatus.IN_PROGRESS ? 1 : 0.6,
                            }}
                          >
                            <div style={{ marginRight: 16 }}>
                              <Tag
                                color={statusConfig.color}
                                icon={statusConfig.icon}
                                style={{ fontSize: 12 }}
                              >
                                Bước {index + 1}
                              </Tag>
                            </div>

                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontWeight: 500,
                                  marginBottom: 4,
                                  color: canStart || tracking.status === TrackingStatus.IN_PROGRESS ? "#000" : "#999",
                                }}
                              >
                                {tracking.serviceStepName}
                                {!canStart &&
                                  tracking.status ===
                                    TrackingStatus.PENDING && (
                                    <Text
                                      style={{
                                        fontSize: 11,
                                        color: "#999",
                                        marginLeft: 8,
                                      }}
                                    >
                                      (Tự động bắt đầu khi bước trước hoàn
                                      thành)
                                    </Text>
                                  )}
                              </div>
                              <div style={{ fontSize: 12, color: "#666" }}>
                                {tracking.actualDuration && (
                                  <span
                                    style={{ marginLeft: 8, color: "#52c41a" }}
                                  >
                                    • Thời gian thực tế:{" "}
                                    {tracking.actualDuration} phút
                                  </span>
                                )}
                                {tracking.carServiceId && (
                                  <span
                                    style={{ marginLeft: 8, color: "#1890ff" }}
                                  >
                                    • Service ID: {tracking.carServiceId}
                                  </span>
                                )}
                              </div>
                              {tracking.notes && (
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "#666",
                                    marginTop: 4,
                                  }}
                                >
                                  Ghi chú: {tracking.notes}
                                </div>
                              )}
                            </div>

                            <div style={{ marginLeft: 16 }}>
                              <Space>
                                {tracking.status === TrackingStatus.PENDING &&
                                  canStart && (
                                    <Button
                                      type="primary"
                                      size="small"
                                      icon={<PlayCircleOutlined />}
                                      loading={isUpdating}
                                      onClick={() =>
                                        handleStartTracking(tracking)
                                      }
                                    >
                                      Bắt đầu
                                    </Button>
                                  )}

                                {tracking.status ===
                                  TrackingStatus.IN_PROGRESS && (
                                  <Button
                                    type="primary"
                                    size="small"
                                    icon={<CheckCircleOutlined />}
                                    loading={isUpdating}
                                    onClick={() =>
                                      handleOpenFormCompleteTracking(tracking)
                                    }
                                  >
                                    Hoàn thành
                                  </Button>
                                )}

                                {tracking.status ===
                                  TrackingStatus.COMPLETED && (
                                  <Tag
                                    color="green"
                                    icon={<CheckCircleOutlined />}
                                  >
                                    Đã hoàn thành
                                  </Tag>
                                )}
                              </Space>
                            </div>
                          </div>

                          {/* Confirm Form */}
                          {completingTracking === tracking.trackingId && (
                            <Card
                              size="small"
                              style={{
                                marginTop: 8,
                                backgroundColor: "#fafafa",
                              }}
                            >
                              <Form form={form} layout="vertical">
                                <Row gutter={16}>
                                  <Col span={12}>
                                    <Form.Item name="notes" label="Ghi chú">
                                      <TextArea
                                        rows={3}
                                        placeholder="Nhập ghi chú về quá trình thực hiện..."
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>
                                <div style={{ textAlign: "right" }}>
                                  <Space>
                                    <Button
                                      onClick={handleCloseFormCompleteTracking}
                                    >
                                      Hủy
                                    </Button>
                                    <Button
                                      type="primary"
                                      icon={<SaveOutlined />}
                                      loading={isUpdating}
                                      onClick={() =>
                                        handleCompleteTracking(tracking)
                                      }
                                    >
                                      Hoàn thành
                                    </Button>
                                  </Space>
                                </div>
                              </Form>
                            </Card>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {servicesWithTrackings.length === 0 && !loading && (
            <Alert
              message="Không có tracking"
              description="Chưa có tracking nào được tạo cho booking này."
              type="info"
              showIcon
            />
          )}
        </Space>
      </Modal>
    </App>
  );
};

export default BookingTrackingManagementModal;
