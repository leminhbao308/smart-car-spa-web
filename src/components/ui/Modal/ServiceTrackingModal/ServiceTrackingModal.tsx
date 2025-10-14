"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Card,
  Table,
  Button,
  Tag,
  Typography,
  Space,
  Row,
  Col,
  Progress,
  message,
  Spin,
} from "antd";
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  useServiceProcessByServiceId,
  useServiceProcess,
} from "@/lib/api/hooks/useServiceProcess";
import { useServiceProcessTrackings } from "@/lib/api/hooks/useServiceProcessTracking";
import { useEmployeesDropdown } from "@/lib/api/hooks/useEmployees";
import { useServiceBaysByBranch } from "@/lib/api/hooks/useServiceBays";
import { useServicePackage } from "@/lib/api/hooks/useServicePackage";
import {
  useCreateTracking,
  useStartStep,
  useUpdateProgress,
  useCompleteStep,
  useCancelStep,
} from "@/lib/api/hooks/useTracking";
import { BookingInfoDto } from "@/lib/api/types/booking.types";
import {
  ServiceProcessInfoDto,
  ServiceProcessStepInfoDto,
} from "@/lib/api/types/service-process.types";
import {
  ServiceProcessTrackingInfoDto,
  TrackingStatus,
} from "@/lib/api/types/service-process-tracking.types";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import { formatDurationVer01 } from "@/components/utils/helper/duration.format.helper";

const { Text } = Typography;

interface ServiceTrackingModalProps {
  open: boolean;
  onCancel: () => void;
  booking: BookingInfoDto;
}

const ServiceTrackingModal: React.FC<ServiceTrackingModalProps> = ({
  open,
  onCancel,
  booking,
}) => {
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    type: string;
  } | null>(null);
  const [serviceProcess, setServiceProcess] =
    useState<ServiceProcessInfoDto | null>(null);
  const [trackings, setTrackings] = useState<ServiceProcessTrackingInfoDto[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  // Initialize data when modal opens
  useEffect(() => {
    if (open && booking.bookingItems && booking.bookingItems.length > 0) {
      const firstItem = booking.bookingItems[0];
      console.log("Setting selectedItem:", {
        id: firstItem.itemId,
        type: firstItem.itemType,
      });
      if (firstItem.itemId && firstItem.itemType) {
        setSelectedItem({ id: firstItem.itemId, type: firstItem.itemType });
      } else {
        console.warn("First item has no itemId or itemType:", firstItem);
      }
    }
  }, [open, booking]);

  // API hooks - handle both SERVICE and SERVICE_PACKAGE
  const shouldCallServiceProcessAPI = selectedItem?.type === "SERVICE";
  const shouldCallServicePackageAPI = selectedItem?.type === "SERVICE_PACKAGE";

  // For SERVICE: get service process directly
  const {
    data: serviceProcessData,
    isLoading: isLoadingServiceProcess,
    error: serviceProcessError,
  } = useServiceProcessByServiceId(
    shouldCallServiceProcessAPI ? selectedItem.id : ""
  );

  // For SERVICE_PACKAGE: get package first, then get service process
  const {
    data: servicePackageData,
    isLoading: isLoadingServicePackage,
    error: servicePackageError,
  } = useServicePackage(shouldCallServicePackageAPI ? selectedItem.id : "");

  // Get service process for package
  const packageServiceProcessId = servicePackageData?.service_process_id;
  const {
    data: packageServiceProcessData,
    isLoading: isLoadingPackageProcess,
    error: packageProcessError,
  } = useServiceProcess(packageServiceProcessId || "");

  // Determine which service process data to use
  const finalServiceProcessData = shouldCallServiceProcessAPI
    ? serviceProcessData
    : packageServiceProcessData;
  const isLoadingProcess = shouldCallServiceProcessAPI
    ? isLoadingServiceProcess
    : isLoadingPackageProcess;

  const { data: trackingsData } = useServiceProcessTrackings({
    bookingId: booking.bookingId,
  });
  const { data: employees } = useEmployeesDropdown();
  const { data: serviceBays } = useServiceBaysByBranch(booking.branchId);

  // Mutations
  const createTrackingMutation = useCreateTracking();
  const startStepMutation = useStartStep();
  const updateProgressMutation = useUpdateProgress();
  const completeStepMutation = useCompleteStep();
  const cancelStepMutation = useCancelStep();

  // Set service process when data is available
  useEffect(() => {
    if (finalServiceProcessData) {
      console.log("Service process data:", finalServiceProcessData);
      console.log("Process steps:", finalServiceProcessData.processSteps);
      console.log(
        "Process steps length:",
        finalServiceProcessData.processSteps?.length
      );
      setServiceProcess(finalServiceProcessData);
    }
  }, [finalServiceProcessData]);

  // Set trackings when data is available
  useEffect(() => {
    if (trackingsData) {
      console.log("Trackings data:", trackingsData);
      console.log("Trackings data type:", typeof trackingsData);
      console.log("Is array:", Array.isArray(trackingsData));
      // Ensure trackingsData is an array
      const trackingsArray = Array.isArray(trackingsData) ? trackingsData : [];
      setTrackings(trackingsArray);
    }
  }, [trackingsData]);

  // Helper function to get tracking for a specific step
  const getTrackingForStep = (
    stepId: string
  ): ServiceProcessTrackingInfoDto | undefined => {
    if (!Array.isArray(trackings)) {
      console.warn("Trackings is not an array:", trackings);
      return undefined;
    }
    return trackings.find((tracking) => tracking.serviceStepId === stepId);
  };

  // Helper function to get step status
  const getStepStatus = (
    step: ServiceProcessStepInfoDto
  ): TrackingStatus | null => {
    const tracking = getTrackingForStep(step.id);
    return tracking?.status || null;
  };

  // Helper function to get process steps (handle both camelCase and snake_case)
  const getProcessSteps = (): ServiceProcessStepInfoDto[] => {
    if (!serviceProcess) return [];
    return serviceProcess.processSteps || serviceProcess.process_steps || [];
  };

  // Helper function to get overall progress
  const getOverallProgress = (): number => {
    const steps = getProcessSteps();
    if (!steps.length) return 0;
    const completedSteps = steps.filter((step) => {
      const tracking = getTrackingForStep(step.id);
      return tracking?.status === TrackingStatus.COMPLETED;
    }).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  // Helper function to check if all steps are completed
  const isAllStepsCompleted = (): boolean => {
    const steps = getProcessSteps();
    if (!steps.length) return false;
    return steps.every((step) => {
      const tracking = getTrackingForStep(step.id);
      return tracking?.status === TrackingStatus.COMPLETED;
    });
  };

  // Handle create tracking
  const handleCreateTracking = async (step: ServiceProcessStepInfoDto) => {
    try {
      setLoading(true);
      await createTrackingMutation.mutateAsync({
        booking_id: booking.bookingId,
        service_step_id: step.id,
        technician_id: employees?.[0]?.user_id || "",
        bay_id: serviceBays?.[0]?.bay_id || "",
        estimated_duration: step.estimatedTime || 60,
        notes: `Tạo tracking cho bước: ${step.name}`,
      });
      message.success("Tạo tracking thành công");
    } catch (error) {
      console.error("Create tracking error:", error);
      message.error("Có lỗi xảy ra khi tạo tracking");
    } finally {
      setLoading(false);
    }
  };

  // Handle start step
  const handleStartStep = async (step: ServiceProcessStepInfoDto) => {
    const tracking = getTrackingForStep(step.id);
    if (!tracking) return;

    try {
      setLoading(true);
      await startStepMutation.mutateAsync({
        trackingId: tracking.trackingId,
        request: {
          technician_id: employees?.[0]?.user_id || "",
          notes: `Bắt đầu thực hiện: ${step.name}`,
        },
      });
      message.success("Bắt đầu bước thành công");
    } catch (error) {
      console.error("Start step error:", error);
      message.error("Có lỗi xảy ra khi bắt đầu bước");
    } finally {
      setLoading(false);
    }
  };

  // Handle update progress
  const handleUpdateProgress = async (
    step: ServiceProcessStepInfoDto,
    progress: number
  ) => {
    const tracking = getTrackingForStep(step.id);
    if (!tracking) return;

    try {
      setLoading(true);
      await updateProgressMutation.mutateAsync({
        trackingId: tracking.trackingId,
        request: {
          progress_percent: progress,
          notes: `Cập nhật tiến độ: ${progress}%`,
        },
      });
      message.success("Cập nhật tiến độ thành công");
    } catch (error) {
      console.error("Update progress error:", error);
      message.error("Có lỗi xảy ra khi cập nhật tiến độ");
    } finally {
      setLoading(false);
    }
  };

  // Handle complete step
  const handleCompleteStep = async (step: ServiceProcessStepInfoDto) => {
    const tracking = getTrackingForStep(step.id);
    if (!tracking) return;

    try {
      setLoading(true);
      await completeStepMutation.mutateAsync({
        trackingId: tracking.trackingId,
        request: {
          notes: `Hoàn thành: ${step.name}`,
        },
      });
      message.success("Hoàn thành bước thành công");
    } catch (error) {
      console.error("Complete step error:", error);
      message.error("Có lỗi xảy ra khi hoàn thành bước");
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel step
  const handleCancelStep = async (step: ServiceProcessStepInfoDto) => {
    const tracking = getTrackingForStep(step.id);
    if (!tracking) return;

    try {
      setLoading(true);
      await cancelStepMutation.mutateAsync({
        trackingId: tracking.trackingId,
        request: {
          reason: "Hủy bởi admin",
        },
      });
      message.success("Hủy bước thành công");
    } catch (error) {
      console.error("Cancel step error:", error);
      message.error("Có lỗi xảy ra khi hủy bước");
    } finally {
      setLoading(false);
    }
  };

  // Render action buttons for each step
  const renderStepActions = (step: ServiceProcessStepInfoDto) => {
    const tracking = getTrackingForStep(step.id);
    const status = getStepStatus(step);

    if (!tracking) {
      return (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleCreateTracking(step)}
          loading={loading}
        >
          Tạo Tracking
        </Button>
      );
    }

    switch (status) {
      case TrackingStatus.PENDING:
        return (
          <Space>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStartStep(step)}
              loading={loading}
            >
              Bắt đầu
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleCancelStep(step)}
              loading={loading}
            >
              Hủy
            </Button>
          </Space>
        );
      case TrackingStatus.IN_PROGRESS:
        return (
          <Space>
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => handleUpdateProgress(step, 50)}
              loading={loading}
            >
              Cập nhật 50%
            </Button>
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => handleUpdateProgress(step, 100)}
              loading={loading}
            >
              Cập nhật 100%
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleCompleteStep(step)}
              loading={loading}
            >
              Hoàn thành
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleCancelStep(step)}
              loading={loading}
            >
              Hủy
            </Button>
          </Space>
        );
      case TrackingStatus.COMPLETED:
        return (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Đã hoàn thành
          </Tag>
        );
      case TrackingStatus.CANCELLED:
        return (
          <Tag color="red" icon={<CloseCircleOutlined />}>
            Đã hủy
          </Tag>
        );
      default:
        return null;
    }
  };

  // Render progress for each step
  const renderStepProgress = (step: ServiceProcessStepInfoDto) => {
    const tracking = getTrackingForStep(step.id);
    if (!tracking) return null;

    return (
      <Progress
        percent={tracking.progressPercent || 0}
        size="small"
        status={
          tracking.status === TrackingStatus.COMPLETED ? "success" : "active"
        }
      />
    );
  };

  // Render step status
  const renderStepStatus = (step: ServiceProcessStepInfoDto) => {
    const status = getStepStatus(step);
    if (!status) return <Tag color="default">Chưa tạo</Tag>;

    const statusConfig = {
      [TrackingStatus.PENDING]: { color: "orange", label: "Chờ thực hiện" },
      [TrackingStatus.IN_PROGRESS]: { color: "blue", label: "Đang thực hiện" },
      [TrackingStatus.COMPLETED]: { color: "green", label: "Đã hoàn thành" },
      [TrackingStatus.CANCELLED]: { color: "red", label: "Đã hủy" },
    };

    const config = statusConfig[status] || {
      color: "default",
      label: "Unknown",
    };
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  // Render step products
  const renderStepProducts = (step: ServiceProcessStepInfoDto) => {
    if (!step.stepProducts?.length)
      return <Text type="secondary">Không có sản phẩm</Text>;

    return (
      <div>
        {step.stepProducts.map((product, index) => (
          <div key={index} style={{ fontSize: 12, marginBottom: 2 }}>
            • {product.productName} ({product.quantity}{" "}
            {(product as { unit?: string }).unit || "cái"})
          </div>
        ))}
      </div>
    );
  };

  // Define columns for steps table
  const stepColumns = [
    {
      title: "STT",
      key: "stepOrder",
      width: 60,
      align: "center" as const,
      render: (
        _: ServiceProcessStepInfoDto,
        __: ServiceProcessStepInfoDto,
        index: number
      ) => index + 1,
    },
    {
      title: "Tên bước",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (name: string, step: ServiceProcessStepInfoDto) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{name}</div>
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 200,
      render: (description: string) => (
        <Text style={{ fontSize: 13 }}>{description || "Không có mô tả"}</Text>
      ),
    },

    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      align: "center" as const,
      render: (_: ServiceProcessStepInfoDto, step: ServiceProcessStepInfoDto) =>
        renderStepStatus(step),
    },
    {
      title: "Tiến độ",
      key: "progress",
      width: 120,
      align: "center" as const,
      render: (_: ServiceProcessStepInfoDto, step: ServiceProcessStepInfoDto) =>
        renderStepProgress(step),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      align: "center" as const,
      render: (_: ServiceProcessStepInfoDto, step: ServiceProcessStepInfoDto) =>
        renderStepActions(step),
    },
  ];

  return (
    <Modal
      title="Theo dõi quá trình chăm sóc xe"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1400}
      destroyOnHidden
    >
      {/* {console.log("debug quy trinh ", serviceProcess)} */}
      <Spin spinning={loading}>
        {/* Basic booking information */}
        <Card title="Thông tin cơ bản" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <div>
                <Text strong>Mã đặt lịch:</Text>
                <div
                  style={{ fontSize: 16, fontWeight: 500, color: "#1890ff" }}
                >
                  {booking.bookingCode}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div>
                <Text strong>Khách hàng:</Text>
                <div style={{ fontSize: 14 }}>{booking.customerName}</div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {booking.customerPhone}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div>
                <Text strong>Xe:</Text>
                <div style={{ fontSize: 14 }}>
                  {booking.vehicleLicensePlate}
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {booking.vehicleBrandName} {booking.vehicleModelName}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div>
                <Text strong>Chi nhánh:</Text>
                <div style={{ fontSize: 14 }}>{booking.branchName}</div>
              </div>
            </Col>
            <Col span={8}>
              <div>
                <Text strong>Tổng giá:</Text>
                <div
                  style={{ fontSize: 14, color: "#52c41a", fontWeight: 500 }}
                >
                  {formatCurrency(booking.totalPrice || 0)}{" "}
                  {booking.currency || "VND"}
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div>
                <Text strong>Thời gian ước tính:</Text>
                <div style={{ fontSize: 14 }}>
                  {formatDurationVer01(booking.estimatedDurationMinutes || 0)}
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Service process information */}
        {isLoadingProcess ? (
          <Card>
            <div style={{ textAlign: "center", padding: 20 }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                Đang tải thông tin quy trình...
              </div>
            </div>
          </Card>
        ) : serviceProcessError || packageProcessError ? (
          <Card>
            <div style={{ textAlign: "center", padding: 20, color: "#ff4d4f" }}>
              <CloseCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
              <div>Lỗi khi tải thông tin quy trình</div>
              <div style={{ fontSize: 12, marginTop: 8 }}>
                {(serviceProcessError || packageProcessError)?.message ||
                  "Không thể tải dữ liệu"}
              </div>
            </div>
          </Card>
        ) : serviceProcess ? (
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>Quy trình: {serviceProcess.name}</span>
                <Tag color="blue">{serviceProcess.code}</Tag>
                <Tag color="green">{getProcessSteps().length} bước</Tag>
              </div>
            }
            extra={
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div>
                  <Text strong>Tiến độ tổng thể:</Text>
                  <Progress
                    percent={getOverallProgress()}
                    size="small"
                    style={{ marginLeft: 8 }}
                  />
                </div>
                {isAllStepsCompleted() && (
                  <Button
                    type="primary"
                    size="large"
                    icon={<CheckCircleOutlined />}
                  >
                    Hoàn thành dịch vụ
                  </Button>
                )}
              </div>
            }
          >
            <div style={{ marginBottom: 16 }}>
              <Text>{serviceProcess.description}</Text>
            </div>

            <Table
              dataSource={getProcessSteps()}
              columns={stepColumns}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 1200 }}
            />
          </Card>
        ) : (
          <Card>
            <div style={{ textAlign: "center", padding: 20, color: "#999" }}>
              <EyeOutlined style={{ fontSize: 48, marginBottom: 16 }} />
              <div>Chưa có thông tin quy trình</div>
              <div style={{ fontSize: 12, marginTop: 8 }}>
                Vui lòng kiểm tra lại thông tin dịch vụ
              </div>
            </div>
          </Card>
        )}

        {/* Debug information */}
        {/* <Card title="Debug Info" style={{ marginTop: 16 }}>
          <Row gutter={[16, 8]}>
            <Col span={6}>
              <Text strong>Selected Item:</Text>
              <div style={{ fontSize: 12, fontFamily: "monospace" }}>
                {selectedItem
                  ? `${selectedItem.type}: ${selectedItem.id}`
                  : "N/A"}
              </div>
            </Col>
            <Col span={6}>
              <Text strong>Service Process Status:</Text>
              <div style={{ fontSize: 12 }}>
                {isLoadingProcess
                  ? "Loading..."
                  : serviceProcess
                  ? "Loaded"
                  : "Not loaded"}
              </div>
            </Col>
            <Col span={6}>
              <Text strong>Trackings Count:</Text>
              <div style={{ fontSize: 12 }}>
                {Array.isArray(trackings) ? trackings.length : "Not an array"}
              </div>
            </Col>
            <Col span={6}>
              <Text strong>Overall Progress:</Text>
              <div style={{ fontSize: 12 }}>{getOverallProgress()}%</div>
            </Col>
          </Row>
          <Row gutter={[16, 8]} style={{ marginTop: 8 }}>
            <Col span={6}>
              <Text strong>processSteps (camelCase):</Text>
              <div style={{ fontSize: 12, fontFamily: "monospace" }}>
                {serviceProcess?.processSteps
                  ? `Array length: ${serviceProcess.processSteps.length}`
                  : "No processSteps property"}
              </div>
            </Col>
            <Col span={6}>
              <Text strong>process_steps (snake_case):</Text>
              <div style={{ fontSize: 12, fontFamily: "monospace" }}>
                {serviceProcess?.process_steps
                  ? `Array length: ${serviceProcess.process_steps.length}`
                  : "No process_steps property"}
              </div>
            </Col>
            <Col span={12}>
              <Text strong>Final Steps (getProcessSteps):</Text>
              <div style={{ fontSize: 12, fontFamily: "monospace" }}>
                Array length: {getProcessSteps().length}
              </div>
            </Col>
          </Row>
          <Row gutter={[16, 8]} style={{ marginTop: 8 }}>
            <Col span={12}>
              <Text strong>Raw Service Process Data:</Text>
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "monospace",
                  maxHeight: 150,
                  overflow: "auto",
                  backgroundColor: "#f5f5f5",
                  padding: 8,
                }}
              >
                {JSON.stringify(serviceProcess || "null", null, 2)}
              </div>
            </Col>
            <Col span={12}>
              <Text strong>Raw Trackings Data:</Text>
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "monospace",
                  maxHeight: 150,
                  overflow: "auto",
                  backgroundColor: "#f5f5f5",
                  padding: 8,
                }}
              >
                {JSON.stringify(trackingsData || "null", null, 2)}
              </div>
            </Col>
          </Row>
          {shouldCallServicePackageAPI && (
            <Row gutter={[16, 8]} style={{ marginTop: 8 }}>
              <Col span={8}>
                <Text strong>Loading Service Package:</Text>
                <div style={{ fontSize: 12 }}>
                  {isLoadingServicePackage ? "Yes" : "No"}
                </div>
              </Col>
              <Col span={8}>
                <Text strong>Package Service Process ID:</Text>
                <div style={{ fontSize: 12, fontFamily: "monospace" }}>
                  {packageServiceProcessId || "N/A"}
                </div>
              </Col>
              <Col span={8}>
                <Text strong>Package Error:</Text>
                <div style={{ fontSize: 12 }}>
                  {servicePackageError
                    ? String(servicePackageError)
                    : packageProcessError
                    ? String(packageProcessError)
                    : "None"}
                </div>
              </Col>
            </Row>
          )}
        </Card> */}
      </Spin>
    </Modal>
  );
};

export default ServiceTrackingModal;
