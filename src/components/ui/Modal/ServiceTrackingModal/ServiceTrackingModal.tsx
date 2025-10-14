"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Card,
  Table,
  Button,
  Tag,
  Typography,
  Row,
  Col,
  Progress,
  Spin,
  App,
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
import { useServiceProcessTrackingsByBooking } from "@/lib/api/hooks/useServiceProcessTracking";
import { useEmployeesDropdown } from "@/lib/api/hooks/useEmployees";
import { useServicePackage } from "@/lib/api/hooks/useServicePackage";
import { useStartStep, useCompleteStep } from "@/lib/api/hooks/useTracking";
import CreateTrackingModal from "../CreateTrackingModal";
import UpdateTrackingModal from "../UpdateTrackingModal";
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
  const { message } = App.useApp();
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
  const [createTrackingModalOpen, setCreateTrackingModalOpen] = useState(false);
  const [updateTrackingModalOpen, setUpdateTrackingModalOpen] = useState(false);
  const [selectedStepForCreate, setSelectedStepForCreate] =
    useState<ServiceProcessStepInfoDto | null>(null);
  const [selectedTrackingForUpdate, setSelectedTrackingForUpdate] =
    useState<ServiceProcessTrackingInfoDto | null>(null);

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
  const { data: servicePackageData } = useServicePackage(
    shouldCallServicePackageAPI ? selectedItem.id : ""
  );

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

  const { data: trackingsData, refetch: refetchTrackings } =
    useServiceProcessTrackingsByBooking(booking.bookingId);
  const { data: employees } = useEmployeesDropdown();

  // Mutations
  const startStepMutation = useStartStep();
  const completeStepMutation = useCompleteStep();

  // Set service process when data is available
  useEffect(() => {
    if (finalServiceProcessData) {
      setServiceProcess(finalServiceProcessData);
    }
  }, [finalServiceProcessData]);

  // Set trackings when data is available
  useEffect(() => {
    if (trackingsData) {
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
    console.log(
      "Đang lấy serviceProcess và booking: ",
      serviceProcess,
      booking
    );
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
  const handleCreateTracking = (step: ServiceProcessStepInfoDto) => {
    setSelectedStepForCreate(step);
    setCreateTrackingModalOpen(true);
  };

  const handleCreateTrackingSuccess = async () => {
    setCreateTrackingModalOpen(false);
    setSelectedStepForCreate(null);
    message.success("Tạo tracking thành công");

    // Refresh trackings data to update UI
    try {
      await refetchTrackings();
    } catch (error) {
      console.error("Error refetching trackings:", error);
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
          technician_id: tracking.technicianId || employees?.[0]?.user_id || "",
        },
      });
      message.success("Bắt đầu tracking thành công");

      // Refresh trackings data to update UI
      await refetchTrackings();
    } catch (error) {
      console.error("Start step error:", error);
      message.error("Có lỗi xảy ra khi bắt đầu tracking");
    } finally {
      setLoading(false);
    }
  };

  // Handle update tracking
  const handleUpdateTracking = (step: ServiceProcessStepInfoDto) => {
    const tracking = getTrackingForStep(step.id);
    if (!tracking) return;

    setSelectedTrackingForUpdate(tracking);
    setUpdateTrackingModalOpen(true);
  };

  const handleUpdateTrackingSuccess = async () => {
    setUpdateTrackingModalOpen(false);
    setSelectedTrackingForUpdate(null);
    message.success("Cập nhật tracking thành công");

    // Refresh trackings data to update UI
    try {
      await refetchTrackings();
    } catch (error) {
      console.error("Error refetching trackings:", error);
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
      message.success("Hoàn thành tracking thành công");

      // Refresh trackings data to update UI
      await refetchTrackings();
    } catch (error) {
      console.error("Complete step error:", error);
      message.error("Có lỗi xảy ra khi hoàn thành tracking");
    } finally {
      setLoading(false);
    }
  };

  // Render create tracking button
  const renderCreateTracking = (step: ServiceProcessStepInfoDto) => {
    const tracking = getTrackingForStep(step.id);

    if (tracking) {
      return <Tag color="green">Đã tạo</Tag>;
    }

    return (
      <Button
        type="primary"
        size="small"
        icon={<PlusOutlined />}
        onClick={() => handleCreateTracking(step)}
        loading={loading}
      >
        Tạo
      </Button>
    );
  };

  // Render start tracking button
  const renderStartTracking = (step: ServiceProcessStepInfoDto) => {
    const tracking = getTrackingForStep(step.id);
    const status = getStepStatus(step);

    if (!tracking) {
      return <Text type="secondary">Chưa tạo</Text>;
    }

    if (status === TrackingStatus.PENDING) {
      return (
        <Button
          type="primary"
          size="small"
          icon={<PlayCircleOutlined />}
          onClick={() => handleStartStep(step)}
          loading={loading}
        >
          Bắt đầu
        </Button>
      );
    }

    if (
      status === TrackingStatus.IN_PROGRESS ||
      status === TrackingStatus.COMPLETED
    ) {
      return <Tag color="blue">Đã bắt đầu</Tag>;
    }

    return <Text type="secondary">-</Text>;
  };

  // Render update tracking button
  const renderUpdateTracking = (step: ServiceProcessStepInfoDto) => {
    const tracking = getTrackingForStep(step.id);
    const status = getStepStatus(step);

    if (!tracking) {
      return <Text type="secondary">Chưa tạo</Text>;
    }

    if (status === TrackingStatus.IN_PROGRESS) {
      return (
        <Button
          type="default"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleUpdateTracking(step)}
          loading={loading}
        >
          Cập nhật
        </Button>
      );
    }

    if (status === TrackingStatus.COMPLETED) {
      return <Tag color="green">Đã cập nhật</Tag>;
    }

    return <Text type="secondary">-</Text>;
  };

  // Render complete tracking button
  const renderCompleteTracking = (step: ServiceProcessStepInfoDto) => {
    const tracking = getTrackingForStep(step.id);
    const status = getStepStatus(step);

    if (!tracking) {
      return <Text type="secondary">Chưa tạo</Text>;
    }

    if (status === TrackingStatus.IN_PROGRESS) {
      return (
        <Button
          type="primary"
          size="small"
          icon={<CheckCircleOutlined />}
          onClick={() => handleCompleteStep(step)}
          loading={loading}
        >
          Hoàn thành
        </Button>
      );
    }

    if (status === TrackingStatus.COMPLETED) {
      return (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          Hoàn thành
        </Tag>
      );
    }

    if (status === TrackingStatus.CANCELLED) {
      return (
        <Tag color="red" icon={<CloseCircleOutlined />}>
          Đã hủy
        </Tag>
      );
    }

    return <Text type="secondary">-</Text>;
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
      render: (name: string) => (
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
      title: "Tạo Tracking",
      key: "create",
      width: 120,
      align: "center" as const,
      render: (_: ServiceProcessStepInfoDto, step: ServiceProcessStepInfoDto) =>
        renderCreateTracking(step),
    },
    {
      title: "Bắt đầu",
      key: "start",
      width: 100,
      align: "center" as const,
      render: (_: ServiceProcessStepInfoDto, step: ServiceProcessStepInfoDto) =>
        renderStartTracking(step),
    },
    {
      title: "Cập nhật",
      key: "update",
      width: 100,
      align: "center" as const,
      render: (_: ServiceProcessStepInfoDto, step: ServiceProcessStepInfoDto) =>
        renderUpdateTracking(step),
    },
    {
      title: "Hoàn thành",
      key: "complete",
      width: 100,
      align: "center" as const,
      render: (_: ServiceProcessStepInfoDto, step: ServiceProcessStepInfoDto) =>
        renderCompleteTracking(step),
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
              scroll={{ x: 1400 }}
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

      {/* Create Tracking Modal */}
      {selectedStepForCreate && (
        <CreateTrackingModal
          open={createTrackingModalOpen}
          onCancel={() => {
            setCreateTrackingModalOpen(false);
            setSelectedStepForCreate(null);
          }}
          onSuccess={handleCreateTrackingSuccess}
          booking={booking}
          preSelectedStepId={selectedStepForCreate.id}
          preSelectedStepName={selectedStepForCreate.name}
        />
      )}

      {/* Update Tracking Modal */}
      {selectedTrackingForUpdate && (
        <UpdateTrackingModal
          open={updateTrackingModalOpen}
          onCancel={() => {
            setUpdateTrackingModalOpen(false);
            setSelectedTrackingForUpdate(null);
          }}
          onSuccess={handleUpdateTrackingSuccess}
          tracking={selectedTrackingForUpdate}
          stepName={
            getProcessSteps().find(
              (step) =>
                getTrackingForStep(step.id)?.trackingId ===
                selectedTrackingForUpdate.trackingId
            )?.name
          }
        />
      )}
    </Modal>
  );
};

export default ServiceTrackingModal;
