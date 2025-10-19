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
import { useQueryClient } from "@tanstack/react-query";

const { Text } = Typography;

interface VehicleTrackingModalProps {
  open: boolean;
  onCancel: () => void;
  booking: BookingInfoDto;
  trackings: ServiceProcessTrackingInfoDto[];
  shouldCreateTracking?: boolean; // New prop to control tracking creation
  onTrackingCreated?: () => void; // Callback when tracking creation is completed
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
  const [servicesWithSteps, setServicesWithSteps] = useState<ServiceWithSteps[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const hasCreatedTrackingRef = useRef(false);
  
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


  // Calculate overall statistics
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

  // Reset tracking creation flag when modal closes or shouldCreateTracking changes
  useEffect(() => {
    if (!open) {
      hasCreatedTrackingRef.current = false;
      console.log("🔄 Modal closed, reset hasCreatedTrackingRef");
    }
  }, [open]);

  // Initialize services with steps (controlled by shouldCreateTracking prop)
  useEffect(() => {
    console.log("🔄 useEffect triggered - open:", open, "shouldCreateTracking:", shouldCreateTracking, "booking_items:", booking.booking_items?.length, "hasCreatedTracking:", hasCreatedTrackingRef.current);
    
    if (open && booking.booking_items && booking.booking_items.length > 0) {
      if (shouldCreateTracking && !hasCreatedTrackingRef.current) {
        console.log("✅ Conditions met, calling initializeServicesWithSteps (with tracking creation)");
        hasCreatedTrackingRef.current = true;
        initializeServicesWithSteps();
      } else if (!shouldCreateTracking) {
        console.log("✅ Conditions met, calling initializeServicesWithStepsDisplayOnly (display only)");
        initializeServicesWithStepsDisplayOnly();
      } else {
        console.log("⚠️ Tracking already created, skipping initialization");
      }
    } else {
      console.log("❌ Conditions not met for initializeServicesWithSteps");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, shouldCreateTracking, booking.booking_items]);

  // Display only version - no auto-creation of tracking
  const initializeServicesWithStepsDisplayOnly = async () => {
    console.log("🚀 Starting initializeServicesWithStepsDisplayOnly for booking:", booking.booking_id);
    setIsInitializing(true);
    try {
      const servicesData: ServiceWithSteps[] = [];

      console.log("📋 Booking items:", booking.booking_items);

      for (const bookingItem of booking.booking_items || []) {
        console.log("🔍 Processing booking item:", bookingItem);
        
        if (bookingItem.service_id) {
          console.log("✅ Found service_id:", bookingItem.service_id);
          
          // Get service process for this service
          const { ServiceProcessService } = await import("@/lib/api/services/service-process.service");
          const serviceProcess = await ServiceProcessService.getServiceProcessByServiceId(bookingItem.service_id);
          
          console.log("📊 Service process:", serviceProcess);
          
          if (serviceProcess?.id) {
            // Get service process steps
            const processSteps = await ServiceProcessService.getServiceProcessSteps(serviceProcess.id);
            
            console.log("📝 Process steps:", processSteps);
            
            if (processSteps && processSteps.length > 0) {
              const stepsWithTracking = processSteps.map(step => {
                // Find existing tracking for this step
                const existingTracking = trackings.find(t => t.serviceStepId === step.id);
                
                console.log(`🔍 Step ${step.name} - existing tracking:`, existingTracking);
                
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
                steps: stepsWithTracking.sort((a, b) => a.stepOrder - b.stepOrder),
              });
            }
          } else {
            console.log("❌ No service process found for service_id:", bookingItem.service_id);
          }
        } else {
          console.log("❌ No service_id in booking item:", bookingItem);
        }
      }

      console.log("📊 Final services data (display only):", servicesData);
      setServicesWithSteps(servicesData);
      
    } catch (error) {
      console.error("❌ Error initializing services with steps (display only):", error);
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi khởi tạo quy trình chăm sóc",
        placement: "topRight",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  // Full version with tracking creation (called from external)
  const initializeServicesWithSteps = async () => {
    console.log("🚀 Starting initializeServicesWithSteps for booking:", booking.booking_id);
    setIsInitializing(true);
    try {
      const servicesData: ServiceWithSteps[] = [];

      console.log("📋 Booking items:", booking.booking_items);

      for (const bookingItem of booking.booking_items || []) {
        console.log("🔍 Processing booking item:", bookingItem);
        
        if (bookingItem.service_id) {
          console.log("✅ Found service_id:", bookingItem.service_id);
          
          // Get service process for this service
          const { ServiceProcessService } = await import("@/lib/api/services/service-process.service");
          const serviceProcess = await ServiceProcessService.getServiceProcessByServiceId(bookingItem.service_id);
          
          console.log("📊 Service process:", serviceProcess);
          
          if (serviceProcess?.id) {
            // Get service process steps
            const processSteps = await ServiceProcessService.getServiceProcessSteps(serviceProcess.id);
            
            console.log("📝 Process steps:", processSteps);
            
            if (processSteps && processSteps.length > 0) {
              const stepsWithTracking = processSteps.map(step => {
                // Find existing tracking for this step
                const existingTracking = trackings.find(t => t.serviceStepId === step.id);
                
                console.log(`🔍 Step ${step.name} - existing tracking:`, existingTracking);
                
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
                steps: stepsWithTracking.sort((a, b) => a.stepOrder - b.stepOrder),
              });
            }
          } else {
            console.log("❌ No service process found for service_id:", bookingItem.service_id);
          }
        } else {
          console.log("❌ No service_id in booking item:", bookingItem);
        }
      }

      console.log("📊 Final services data:", servicesData);
      setServicesWithSteps(servicesData);
      
      // Auto-create tracking for steps that don't have tracking yet
      await createMissingTrackings(servicesData);
      
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

  const createMissingTrackings = async (servicesData: ServiceWithSteps[]) => {
    console.log("🔧 Starting createMissingTrackings with services:", servicesData);
    const trackingPromises: Promise<void>[] = [];

    for (const service of servicesData) {
      console.log(`🔍 Processing service: ${service.serviceName}`);
      
      for (const step of service.steps) {
        console.log(`📝 Checking step: ${step.stepName}, has tracking: ${!!step.tracking}`);
        
        if (!step.tracking) {
          console.log(`➕ Need to create tracking for step: ${step.stepName}`);
          
          // Create tracking for this step using direct API call
          const trackingPromise = createTrackingForStep(step).then(() => {
            // Refresh tracking data after creation
            return queryClient.invalidateQueries({ queryKey: ['vehicle-tracking', booking.booking_id] });
          });
          
          trackingPromises.push(trackingPromise);
        }
      }
    }

    console.log(`📊 Total tracking promises to create: ${trackingPromises.length}`);

    if (trackingPromises.length > 0) {
      console.log("🚀 Creating tracking records...");
      await Promise.all(trackingPromises);
      
      // Refresh the services with steps data to get updated tracking info (display only)
      await initializeServicesWithStepsDisplayOnly();
      
      notification.success({
        message: "Thành công",
        description: `Đã tạo ${trackingPromises.length} tracking cho quy trình chăm sóc`,
        placement: "topRight",
      });
      
      // Notify parent that tracking creation is completed
      if (onTrackingCreated) {
        onTrackingCreated();
      }
    } else {
      console.log("ℹ️ No missing trackings to create");
      
      // Still notify parent even if no tracking was created
      if (onTrackingCreated) {
        onTrackingCreated();
      }
    }
  };

  const createTrackingForStep = async (step: ServiceWithSteps['steps'][0]) => {
    try {
      console.log(`🎯 Creating tracking for step: ${step.stepName} (ID: ${step.stepId})`);
      
      const { default: apiClient } = await import('@/lib/api/axios');
      
      const requestData = {
        booking_id: booking.booking_id,
        service_step_id: step.stepId,
        bay_id: booking.bay_id || "",
        status: "PENDING",
        notes: `Tự động tạo tracking cho bước: ${step.stepName}`
      };

      console.log("📤 Request data:", requestData);
      console.log("🔑 Using configured apiClient with base URL:", process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api");

      const response = await apiClient.post('/service-process-trackings/create', requestData);

      console.log("📥 Response:", response.data);

      if (response.data.success) {
        console.log(`✅ Successfully created tracking for step: ${step.stepName}`);
      } else {
        throw new Error(response.data.message || 'Failed to create tracking');
      }
    } catch (error) {
      console.error(`❌ Error creating tracking for step ${step.stepName}:`, error);
      throw error;
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
            <Card size="small" title="Đang khởi tạo quy trình chăm sóc...">
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Progress type="circle" percent={75} />
                <div style={{ marginTop: 16 }}>
                  <Text>Đang tải thông tin dịch vụ và tạo tracking...</Text>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ToolOutlined style={{ color: '#1890ff' }} />
                      <span>{service.serviceName}</span>
                      <Tag color="blue">{service.steps.length} bước</Tag>
                    </div>
                  }
                  style={{ marginBottom: 16 }}
                >
                  <div>
                    {service.steps.map((step, stepIndex) => {
                      const isStepVisible = stepIndex === 0 || 
                        (stepIndex > 0 && service.steps[stepIndex - 1].tracking?.status === TrackingStatus.COMPLETED);
                      
                      if (!isStepVisible) return null;

                      return (
                        <div key={step.stepId} style={{ marginBottom: 12 }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            padding: '12px',
                            backgroundColor: step.tracking ? '#f0f8ff' : '#f5f5f5',
                            borderRadius: '6px',
                            border: step.tracking ? '1px solid #d6e4ff' : '1px solid #d9d9d9'
                          }}>
                            <div style={{ marginRight: 12 }}>
                              <Tag 
                                color={step.tracking ? getStatusConfig(step.tracking.status).color : 'default'}
                                icon={step.tracking ? getStatusConfig(step.tracking.status).icon : <ClockCircleOutlined />}
                              >
                                Bước {step.stepOrder}
                              </Tag>
                            </div>
                            
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, marginBottom: 4 }}>
                                {step.stepName}
                              </div>
                              <div style={{ fontSize: 12, color: '#666' }}>
                                Thời gian ước tính: {step.estimatedTime} phút
                                {step.isRequired && <Tag color="red" style={{ marginLeft: 8, fontSize: 10 }}>Bắt buộc</Tag>}
                              </div>
                            </div>

                            {step.tracking && (
                              <div style={{ marginLeft: 12 }}>
                                <Button
                                  type="primary"
              size="small"
                                  icon={<EyeOutlined />}
                                  onClick={() => handleViewDetail(step.tracking!)}
                                >
                                  Chi tiết
                                </Button>
                              </div>
                            )}
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
