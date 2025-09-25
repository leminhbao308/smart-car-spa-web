"use client";
import React, { useState } from "react";
import {
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Button,
  Avatar,
  Modal,
  Form,
  Input,
  Radio,
  Space,
} from "antd";
import {
  EyeOutlined,
  ClockCircleOutlined,
  CarOutlined,
  UserOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CameraOutlined,
  VideoCameraOutlined,
  StarOutlined,
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import {
  vehiclesInCareData,
  VehicleInCare,
  StepProgress,
} from "@/components/utils/data/care-processes.data";
import { formatDate } from "@/components/utils/helper/date.format.helper";
import { formatTime } from "@/components/utils/helper/duration.format.helper";
import {
  getStepCategoryIcon,
  getStepStatusColor,
  getStepStatusLabel,
  getStatusColor,
  getStatusLabel,
  getStepProgress,
} from "@/components/utils/helper/vehicle.in.care.helper";

const { Text } = Typography;

const VehiclesInCarePage = () => {
  const [data, setData] = useState<VehicleInCare[]>(vehiclesInCareData);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleInCare | null>(
    null
  );
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const { showModal } = useConfirmationModalContext();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_progress":
        return <PlayCircleOutlined />;
      case "completed":
        return <CheckCircleOutlined />;
      case "paused":
        return <PauseCircleOutlined />;
      case "cancelled":
        return <ExclamationCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const columns = [
    {
      title: "Thông tin xe",
      dataIndex: "vehicleInfo",
      key: "vehicleInfo",
      width: 250,
      render: (
        vehicleInfo: VehicleInCare["vehicleInfo"],
        record: VehicleInCare
      ) => (
        <div>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
          >
            <CarOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            <Text strong style={{ fontSize: 14 }}>
              {vehicleInfo.brand} {vehicleInfo.model}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {vehicleInfo.licensePlate} • {vehicleInfo.year} •{" "}
            {vehicleInfo.color}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 11, color: "#8c8c8c" }}>
              Khách hàng: {record.customerName}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Quy trình",
      dataIndex: "careProcessName",
      key: "careProcessName",
      width: 150,
      render: (processName: string, record: VehicleInCare) => (
        <div>
          <Text strong style={{ fontSize: 12 }}>
            {processName}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 11, color: "#8c8c8c" }}>
              Bước hiện tại: {record.currentStepName}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
      width: 180,
      render: (_: unknown, record: VehicleInCare) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 12 }}>
              Bắt đầu: {formatDate(record.startTime)}
            </Text>
          </div>
          <div style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 12 }}>
              Dự kiến: {formatDate(record.estimatedEndTime)}
            </Text>
          </div>
          {record.actualEndTime && (
            <div>
              <Text style={{ fontSize: 12, color: "#52c41a" }}>
                Hoàn thành: {formatDate(record.actualEndTime)}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Nhân viên",
      dataIndex: "assignedStaff",
      key: "assignedStaff",
      width: 150,
      render: (staff: VehicleInCare["assignedStaff"]) => (
        <div>
          {staff.map((member, index) => (
            <div
              key={index}
              style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
            >
              <Avatar
                size="small"
                icon={<UserOutlined />}
                style={{ marginRight: 4 }}
              />
              <div>
                <Text style={{ fontSize: 11 }}>{member.name}</Text>
                <div>
                  <Text style={{ fontSize: 10, color: "#8c8c8c" }}>
                    {member.role}
                  </Text>
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
  ];

  const actions = [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: <EyeOutlined />,
      onClick: (record: VehicleInCare) => {
        setSelectedVehicle(record);
        setDetailModalOpen(true);
      },
    },
    {
      key: "pause",
      label: "Tạm dừng",
      icon: <PauseCircleOutlined />,
      condition: (record: VehicleInCare) => record.status === "in_progress",
      onClick: (record: VehicleInCare) => {
        showModal({
          title: "Xác nhận tạm dừng",
          content: `Bạn có chắc chắn muốn tạm dừng chăm sóc xe "${record.vehicleInfo.brand} ${record.vehicleInfo.model}"?`,
          type: "warning",
          onConfirm: () => {
            setData(
              data.map((item) =>
                item.id === record.id
                  ? { ...item, status: "paused" as const }
                  : item
              )
            );
          },
        });
      },
    },
    {
      key: "resume",
      label: "Tiếp tục",
      icon: <PlayCircleOutlined />,
      condition: (record: VehicleInCare) => record.status === "paused",
      onClick: (record: VehicleInCare) => {
        showModal({
          title: "Xác nhận tiếp tục",
          content: `Bạn có chắc chắn muốn tiếp tục chăm sóc xe "${record.vehicleInfo.brand} ${record.vehicleInfo.model}"?`,
          type: "success",
          onConfirm: () => {
            setData(
              data.map((item) =>
                item.id === record.id
                  ? { ...item, status: "in_progress" as const }
                  : item
              )
            );
          },
        });
      },
    },
    {
      key: "complete",
      label: "Hoàn thành",
      icon: <CheckCircleOutlined />,
      condition: (record: VehicleInCare) =>
        record.status === "in_progress" && record.progress === 100,
      onClick: (record: VehicleInCare) => {
        showModal({
          title: "Xác nhận hoàn thành",
          content: `Bạn có chắc chắn muốn hoàn thành chăm sóc xe "${record.vehicleInfo.brand} ${record.vehicleInfo.model}"?`,
          type: "success",
          onConfirm: () => {
            setData(
              data.map((item) =>
                item.id === record.id
                  ? {
                      ...item,
                      status: "completed" as const,
                      actualEndTime: new Date().toISOString(),
                    }
                  : item
              )
            );
          },
        });
      },
    },
    {
      key: "cancel",
      label: "Hủy",
      icon: <ExclamationCircleOutlined />,
      danger: true,
      condition: (record: VehicleInCare) =>
        record.status === "in_progress" || record.status === "paused",
      onClick: (record: VehicleInCare) => {
        showModal({
          title: "Xác nhận hủy",
          content: `Bạn có chắc chắn muốn hủy chăm sóc xe "${record.vehicleInfo.brand} ${record.vehicleInfo.model}"?`,
          type: "error",
          onConfirm: () => {
            setData(
              data.map((item) =>
                item.id === record.id
                  ? { ...item, status: "cancelled" as const }
                  : item
              )
            );
          },
        });
      },
    },
  ];

  // Thống kê tổng quan
  const totalVehicles = data.length;
  const inProgressVehicles = data.filter(
    (item) => item.status === "in_progress"
  ).length;
  const completedVehicles = data.filter(
    (item) => item.status === "completed"
  ).length;
  const pausedVehicles = data.filter((item) => item.status === "paused").length;
  const cancelledVehicles = data.filter(
    (item) => item.status === "cancelled"
  ).length;
  const averageProgress =
    data.length > 0
      ? data.reduce((sum, item) => sum + item.progress, 0) / data.length
      : 0;
  const urgentVehicles = data.filter(
    (item) => item.priority === "urgent"
  ).length;
  const highPriorityVehicles = data.filter(
    (item) => item.priority === "high"
  ).length;

  return (
    <div>
      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng xe đang chăm sóc"
              value={totalVehicles}
              valueStyle={{ color: "#1890ff" }}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang thực hiện"
              value={inProgressVehicles}
              valueStyle={{ color: "#52c41a" }}
              prefix={<PlayCircleOutlined />}
            />
            <Progress
              percent={Math.round((inProgressVehicles / totalVehicles) * 100)}
              size="small"
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={completedVehicles}
              valueStyle={{ color: "#13c2c2" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tạm dừng"
              value={pausedVehicles}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<PauseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Thống kê bổ sung */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tiến độ TB"
              value={averageProgress}
              precision={1}
              valueStyle={{ color: "#722ed1" }}
              prefix={<ClockCircleOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khẩn cấp"
              value={urgentVehicles}
              valueStyle={{ color: "#f5222d" }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ưu tiên cao"
              value={highPriorityVehicles}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<StarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã hủy"
              value={cancelledVehicles}
              valueStyle={{ color: "#8c8c8c" }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <AdminTable
        title="Danh sách xe đang chăm sóc"
        dataSource={data}
        columns={columns}
        actions={actions}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} xe`,
        }}
      />

      {/* Modal chi tiết xe */}
      {selectedVehicle && (
        <VehicleDetailModal
          open={detailModalOpen}
          onCancel={() => {
            setDetailModalOpen(false);
            setSelectedVehicle(null);
          }}
          vehicle={selectedVehicle}
          stepProgress={getStepProgress(selectedVehicle.id)}
        />
      )}
    </div>
  );
};

// Component modal chi tiết xe
interface VehicleDetailModalProps {
  open: boolean;
  onCancel: () => void;
  vehicle: VehicleInCare;
  stepProgress: StepProgress[];
}

const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  open,
  onCancel,
  vehicle,
  stepProgress,
}) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [stepDetailModalOpen, setStepDetailModalOpen] = useState(false);
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<StepProgress | null>(null);
  const [currentStepId, setCurrentStepId] = useState<number | null>(null);
  const [stepProgressData, setStepProgressData] = useState<StepProgress[]>(stepProgress);

  const handleUploadImage = (stepId: number) => {
    setCurrentStepId(stepId);
    setUploadModalOpen(true);
  };

  const handleViewStepDetail = (step: StepProgress) => {
    setSelectedStep(step);
    setStepDetailModalOpen(true);
  };

  const handleViewImage = (url: string) => {
    // Mở ảnh trong tab mới
    window.open(url, "_blank");
  };

  const handleUpdateStepStatus = (step: StepProgress, stepIndex: number) => {
    setSelectedStep({ ...step, stepIndex, allSteps: stepProgressData } as StepProgress & { stepIndex: number; allSteps: StepProgress[] });
    setUpdateStatusModalOpen(true);
  };

  const handleStatusUpdate = (stepId: number, newStatus: string, notes?: string) => {
    const updatedSteps = stepProgressData.map(step => {
      if (step.id === stepId) {
        const updatedStep = { ...step, status: newStatus as StepProgress['status'] };
        
        // Cập nhật thời gian dựa trên trạng thái
        if (newStatus === "in_progress" && !step.startTime) {
          updatedStep.startTime = new Date().toISOString();
        } else if (newStatus === "completed" && !step.endTime) {
          updatedStep.endTime = new Date().toISOString();
          if (step.startTime) {
            const start = new Date(step.startTime);
            const end = new Date();
            updatedStep.actualDuration = Math.round((end.getTime() - start.getTime()) / 1000 / 60); // phút
          }
        }
        
        // Cập nhật ghi chú nếu có
        if (notes) {
          updatedStep.notes = notes;
        }
        
        return updatedStep;
      }
      return step;
    });
    
    setStepProgressData(updatedSteps);
    setUpdateStatusModalOpen(false);
    setSelectedStep(null);
  };
  return (
    <Modal
      title={`Chi tiết xe ${vehicle.vehicleInfo.brand} ${vehicle.vehicleInfo.model}`}
      open={open}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
    >
      <div>
        {/* Thông tin xe */}
        <Card title="Thông tin xe" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Text strong>Khách hàng:</Text>
              <div>{vehicle.customerName}</div>
            </Col>
            <Col span={8}>
              <Text strong>Biển số:</Text>
              <div>{vehicle.vehicleInfo.licensePlate}</div>
            </Col>
            <Col span={8}>
              <Text strong>Năm sản xuất:</Text>
              <div>{vehicle.vehicleInfo.year}</div>
            </Col>
            <Col span={8}>
              <Text strong>Màu sắc:</Text>
              <div>{vehicle.vehicleInfo.color}</div>
            </Col>
            <Col span={8}>
              <Text strong>Loại xe:</Text>
              <div>{vehicle.vehicleInfo.type}</div>
            </Col>
            <Col span={8}>
              <Text strong>Quy trình:</Text>
              <div>{vehicle.careProcessName}</div>
            </Col>
          </Row>
        </Card>

        {/* Tiến độ tổng quan */}
        <Card
          title="Tiến độ tổng quan"
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Tiến độ hoàn thành:</Text>
                <Progress
                  percent={vehicle.progress}
                  strokeColor={vehicle.progress === 100 ? "#52c41a" : "#1890ff"}
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Thời gian:</Text>
                <div>Bắt đầu: {formatDate(vehicle.startTime)}</div>
                <div>Dự kiến: {formatDate(vehicle.estimatedEndTime)}</div>
                {vehicle.actualEndTime && (
                  <div>Hoàn thành: {formatDate(vehicle.actualEndTime)}</div>
                )}
              </div>
            </Col>
          </Row>
        </Card>

        {/* Các bước chăm sóc */}
        <Card title="Chi tiết các bước chăm sóc" size="small">
          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            {stepProgressData.map((step, index) => {
              const getStepBackgroundColor = (status: string) => {
                switch (status) {
                  case "completed":
                    return "#f6ffed";
                  case "in_progress":
                    return "#e6f7ff";
                  case "pending":
                    return "#fafafa";
                  case "skipped":
                    return "#fff2f0";
                  default:
                    return "#fafafa";
                }
              };

              const getStepBorderColor = (status: string) => {
                switch (status) {
                  case "completed":
                    return "#b7eb8f";
                  case "in_progress":
                    return "#91d5ff";
                  case "pending":
                    return "#d9d9d9";
                  case "skipped":
                    return "#ffccc7";
                  default:
                    return "#d9d9d9";
                }
              };

              return (
                <Card
                  key={step.id}
                  size="small"
                  style={{
                    marginBottom: 16,
                    backgroundColor: getStepBackgroundColor(step.status),
                    border: `2px solid ${getStepBorderColor(step.status)}`,
                    borderRadius: 8,
                  }}
                  bodyStyle={{ padding: 16 }}
                >
                  {/* Header của bước */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                      paddingBottom: 8,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          backgroundColor:
                            getStepStatusColor(step.status) === "green"
                              ? "#52c41a"
                              : getStepStatusColor(step.status) === "blue"
                              ? "#1890ff"
                              : "#d9d9d9",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                          fontSize: 14,
                          fontWeight: "bold",
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 4,
                          }}
                        >
                          <span style={{ fontSize: 18, marginRight: 8 }}>
                            {getStepCategoryIcon("inspection")}
                          </span>
                          <Text strong style={{ fontSize: 16 }}>
                            {step.stepName}
                          </Text>
                          <Tag
                            color={getStepStatusColor(step.status)}
                            style={{ marginLeft: 8 }}
                          >
                            {getStepStatusLabel(step.status)}
                          </Tag>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <UserOutlined
                            style={{ marginRight: 4, color: "#1890ff" }}
                          />
                          <Text style={{ color: "#666", fontSize: 12 }}>
                            Nhân viên: {step.staffName}
                          </Text>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {step.status !== "completed" && (
                        <Button
                          type="primary"
                          size="small"
                          icon={<CameraOutlined />}
                          onClick={() => handleUploadImage(step.id)}
                        >
                          Upload ảnh
                        </Button>
                      )}
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewStepDetail(step)}
                      >
                        Xem chi tiết
                      </Button>
                      {(() => {
                        const isNextStep = index === 0 || stepProgressData[index - 1].status === "completed";
                        const canUpdate = step.status !== "completed" && (isNextStep || step.status === "in_progress" || step.status === "paused");
                        
                        if (!canUpdate) return null;
                        
                        return (
                          <Button
                            type="default"
                            size="small"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleUpdateStepStatus(step, index)}
                          >
                            Cập nhật trạng thái
                          </Button>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Thông tin thời gian */}
                  <Row gutter={[16, 8]} style={{ marginBottom: 12 }}>
                    {step.startTime && (
                      <Col span={8}>
                        <Text style={{ fontSize: 12, color: "#666" }}>
                          <ClockCircleOutlined style={{ marginRight: 4 }} />
                          Bắt đầu: {formatDate(step.startTime)}
                        </Text>
                      </Col>
                    )}
                    {step.endTime && (
                      <Col span={8}>
                        <Text style={{ fontSize: 12, color: "#666" }}>
                          <CheckCircleOutlined style={{ marginRight: 4 }} />
                          Kết thúc: {formatDate(step.endTime)}
                        </Text>
                      </Col>
                    )}
                    {step.actualDuration && (
                      <Col span={8}>
                        <Text style={{ fontSize: 12, color: "#666" }}>
                          <ClockCircleOutlined style={{ marginRight: 4 }} />
                          Thời gian: {formatTime(step.actualDuration)}
                        </Text>
                      </Col>
                    )}
                  </Row>

                  {/* Đánh giá và ghi chú */}
                  {(step.rating || step.notes) && (
                    <Row gutter={[16, 8]} style={{ marginBottom: 12 }}>
                      {step.rating && (
                        <Col span={12}>
                          <Text style={{ fontSize: 12, color: "#666" }}>
                            <StarOutlined
                              style={{ marginRight: 4, color: "#faad14" }}
                            />
                            Đánh giá: {step.rating}/5 ⭐
                          </Text>
                        </Col>
                      )}
                      {step.notes && (
                        <Col span={12}>
                          <Text style={{ fontSize: 12, color: "#666" }}>
                            <ExclamationCircleOutlined
                              style={{ marginRight: 4 }}
                            />
                            Ghi chú: {step.notes}
                          </Text>
                        </Col>
                      )}
                    </Row>
                  )}

                  {/* Media files */}
                  {step.mediaFiles.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#666",
                          marginBottom: 4,
                          display: "block",
                        }}
                      >
                        Hình ảnh đã upload ({step.mediaFiles.length}):
                      </Text>
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        {step.mediaFiles.map((file, idx) => (
                          <div
                            key={idx}
                            style={{
                              width: 60,
                              height: 60,
                              border: "1px solid #d9d9d9",
                              borderRadius: 4,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "#fafafa",
                              cursor: "pointer",
                            }}
                            onClick={() => handleViewImage(file.url)}
                          >
                            {file.type === "image" ? (
                              <CameraOutlined
                                style={{ fontSize: 20, color: "#1890ff" }}
                              />
                            ) : (
                              <VideoCameraOutlined
                                style={{ fontSize: 20, color: "#52c41a" }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Issues */}
                  {step.issues.length > 0 && (
                    <div>
                      <Text style={{ fontSize: 12, color: "#f5222d" }}>
                        <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                        Vấn đề: {step.issues.length} vấn đề cần xử lý
                      </Text>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Modal upload ảnh */}
      <UploadImageModal
        open={uploadModalOpen}
        onCancel={() => {
          setUploadModalOpen(false);
          setCurrentStepId(null);
        }}
        stepId={currentStepId}
      />

      {/* Modal chi tiết bước */}
      {selectedStep && (
        <StepDetailModal
          open={stepDetailModalOpen}
          onCancel={() => {
            setStepDetailModalOpen(false);
            setSelectedStep(null);
          }}
          step={selectedStep}
        />
      )}

      {/* Modal cập nhật trạng thái bước */}
      {selectedStep && (
        <UpdateStepStatusModal
          open={updateStatusModalOpen}
          onCancel={() => {
            setUpdateStatusModalOpen(false);
            setSelectedStep(null);
          }}
          step={selectedStep}
          onUpdate={handleStatusUpdate}
        />
      )}
    </Modal>
  );
};

// Component modal upload ảnh
interface UploadImageModalProps {
  open: boolean;
  onCancel: () => void;
  stepId: number | null;
}

const UploadImageModal: React.FC<UploadImageModalProps> = ({
  open,
  onCancel,
  stepId,
}) => {
  const [fileList, setFileList] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (fileList.length === 0) return;

    setUploading(true);
    try {
      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Uploading files:", fileList);
      // TODO: Implement actual upload logic
      onCancel();
    } catch (error) {
      console.log("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      title="Upload hình ảnh"
      open={open}
      onCancel={onCancel}
      onOk={handleUpload}
      confirmLoading={uploading}
      okText="Upload"
      cancelText="Hủy"
    >
      <div>
        <Text>Bước ID: {stepId}</Text>
        <div style={{ marginTop: 16 }}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setFileList(files);
            }}
            style={{ width: "100%" }}
          />
        </div>
        {fileList.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text>Đã chọn {fileList.length} file(s)</Text>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Component modal chi tiết bước
interface StepDetailModalProps {
  open: boolean;
  onCancel: () => void;
  step: StepProgress;
}

const StepDetailModal: React.FC<StepDetailModalProps> = ({
  open,
  onCancel,
  step,
}) => {
  return (
    <Modal
      title={`Chi tiết bước: ${step.stepName}`}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
      width={800}
    >
      <div>
        {/* Thông tin cơ bản */}
        <Card
          title="Thông tin cơ bản"
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Text strong>Trạng thái:</Text>
              <div>
                <Tag color={getStepStatusColor(step.status)}>
                  {getStepStatusLabel(step.status)}
                </Tag>
              </div>
            </Col>
            <Col span={12}>
              <Text strong>Nhân viên thực hiện:</Text>
              <div>{step.staffName}</div>
            </Col>
            {step.startTime && (
              <Col span={12}>
                <Text strong>Thời gian bắt đầu:</Text>
                <div>{formatDate(step.startTime)}</div>
              </Col>
            )}
            {step.endTime && (
              <Col span={12}>
                <Text strong>Thời gian kết thúc:</Text>
                <div>{formatDate(step.endTime)}</div>
              </Col>
            )}
            {step.actualDuration && (
              <Col span={12}>
                <Text strong>Thời gian thực tế:</Text>
                <div>{formatTime(step.actualDuration)}</div>
              </Col>
            )}
            {step.rating && (
              <Col span={12}>
                <Text strong>Đánh giá chất lượng:</Text>
                <div>
                  <StarOutlined style={{ color: "#faad14" }} />
                  {step.rating}/5
                </div>
              </Col>
            )}
          </Row>
        </Card>

        {/* Ghi chú */}
        {step.notes && (
          <Card title="Ghi chú" size="small" style={{ marginBottom: 16 }}>
            <Text>{step.notes}</Text>
          </Card>
        )}

        {/* Hình ảnh */}
        {step.mediaFiles.length > 0 && (
          <Card
            title="Hình ảnh đã upload"
            size="small"
            style={{ marginBottom: 16 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: 16,
              }}
            >
              {step.mediaFiles.map((file, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid #d9d9d9",
                    borderRadius: 8,
                    padding: 8,
                    textAlign: "center",
                  }}
                >
                  <div style={{ marginBottom: 8 }}>
                    {file.type === "image" ? (
                      <CameraOutlined
                        style={{ fontSize: 24, color: "#1890ff" }}
                      />
                    ) : (
                      <VideoCameraOutlined
                        style={{ fontSize: 24, color: "#52c41a" }}
                      />
                    )}
                  </div>
                  <Text style={{ fontSize: 12, display: "block" }}>
                    {file.description || `File ${idx + 1}`}
                  </Text>
                  <Text style={{ fontSize: 10, color: "#8c8c8c" }}>
                    {formatDate(file.uploadedAt)}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Danh sách kiểm tra chất lượng */}
        {step.qualityChecklist.length > 0 && (
          <Card
            title="Danh sách kiểm tra chất lượng"
            size="small"
            style={{ marginBottom: 16 }}
          >
            <div>
              {step.qualityChecklist.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <CheckCircleOutlined
                    style={{
                      color: item.checked ? "#52c41a" : "#d9d9d9",
                      marginRight: 8,
                    }}
                  />
                  <Text
                    style={{
                      textDecoration: item.checked ? "line-through" : "none",
                      color: item.checked ? "#8c8c8c" : "#000",
                    }}
                  >
                    {item.item}
                  </Text>
                  {item.notes && (
                    <Text
                      style={{ fontSize: 12, color: "#666", marginLeft: 8 }}
                    >
                      ({item.notes})
                    </Text>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Vấn đề */}
        {step.issues.length > 0 && (
          <Card title="Vấn đề phát hiện" size="small">
            <div>
              {step.issues.map((issue, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: 12,
                    padding: 12,
                    backgroundColor: "#fff2f0",
                    border: "1px solid #ffccc7",
                    borderRadius: 4,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <Text strong style={{ color: "#f5222d" }}>
                      {issue.description}
                    </Text>
                    <Tag
                      color={
                        issue.severity === "high"
                          ? "red"
                          : issue.severity === "medium"
                          ? "orange"
                          : "green"
                      }
                    >
                      {issue.severity}
                    </Tag>
                  </div>
                  <Text style={{ fontSize: 12, color: "#666" }}>
                    Trạng thái: {issue.resolved ? "Đã xử lý" : "Chưa xử lý"}
                  </Text>
                  {issue.resolution && (
                    <div style={{ marginTop: 4 }}>
                      <Text style={{ fontSize: 12 }}>
                        Giải pháp: {issue.resolution}
                      </Text>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
};

// Component modal cập nhật trạng thái bước
interface UpdateStepStatusModalProps {
  open: boolean;
  onCancel: () => void;
  step: StepProgress & { stepIndex?: number; allSteps?: StepProgress[] };
  onUpdate: (stepId: number, newStatus: string, notes?: string) => void;
}

const UpdateStepStatusModal: React.FC<UpdateStepStatusModalProps> = ({
  open,
  onCancel,
  step,
  onUpdate,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const getAvailableStatuses = (currentStatus: string, stepIndex: number, allSteps: StepProgress[]) => {
    // Kiểm tra xem có phải bước tiếp theo cần thực hiện không
    const isNextStep = stepIndex === 0 || allSteps[stepIndex - 1].status === "completed";
    
    switch (currentStatus) {
      case "pending":
        if (isNextStep) {
          return [
            { value: "in_progress", label: "Bắt đầu thực hiện", color: "blue" },
            { value: "skipped", label: "Bỏ qua bước này", color: "orange" },
          ];
        }
        return []; // Không cho phép cập nhật nếu chưa đến lượt
      case "in_progress":
        return [
          { value: "completed", label: "Hoàn thành", color: "green" },
          { value: "paused", label: "Tạm dừng", color: "orange" },
          { value: "skipped", label: "Bỏ qua bước này", color: "red" },
        ];
      case "paused":
        return [
          { value: "in_progress", label: "Tiếp tục thực hiện", color: "blue" },
          { value: "skipped", label: "Bỏ qua bước này", color: "red" },
        ];
      case "skipped":
        if (isNextStep) {
          return [
            { value: "in_progress", label: "Thực hiện lại", color: "blue" },
          ];
        }
        return [];
      default:
        return [];
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onUpdate(step.id, values.status, values.notes);
      form.resetFields();
    } catch (error) {
      console.log("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const availableStatuses = getAvailableStatuses(
    step.status, 
    step.stepIndex || 0, 
    step.allSteps || []
  );

  return (
    <Modal
      title={`Cập nhật trạng thái: ${step.stepName}`}
      open={open}
      onCancel={onCancel}
      onOk={availableStatuses.length > 0 ? handleSubmit : undefined}
      confirmLoading={loading}
      okText="Cập nhật"
      cancelText="Đóng"
      width={600}
      okButtonProps={{
        disabled: availableStatuses.length === 0
      }}
    >
      <div>
        {/* Thông tin bước hiện tại */}
        <Card size="small" style={{ marginBottom: 16, backgroundColor: "#fafafa" }}>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Text strong>Trạng thái hiện tại:</Text>
              <div>
                <Tag color={getStepStatusColor(step.status)}>
                  {getStepStatusLabel(step.status)}
                </Tag>
              </div>
            </Col>
            <Col span={12}>
              <Text strong>Nhân viên:</Text>
              <div>{step.staffName}</div>
            </Col>
            {step.startTime && (
              <Col span={12}>
                <Text strong>Bắt đầu:</Text>
                <div>{formatDate(step.startTime)}</div>
              </Col>
            )}
            {step.endTime && (
              <Col span={12}>
                <Text strong>Kết thúc:</Text>
                <div>{formatDate(step.endTime)}</div>
              </Col>
            )}
          </Row>
        </Card>

        {/* Form cập nhật */}
        {availableStatuses.length > 0 ? (
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              status: step.status,
            }}
          >
            <Form.Item
              name="status"
              label="Trạng thái mới"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            >
              <Radio.Group>
                <Space direction="vertical">
                  {availableStatuses.map((status) => (
                    <Radio key={status.value} value={status.value}>
                      <Space>
                        <Tag color={status.color}>{status.label}</Tag>
                      </Space>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </Form.Item>
          </Form>
        ) : (
          <div style={{ 
            padding: 16, 
            backgroundColor: "#fff7e6", 
            border: "1px solid #ffd591",
            borderRadius: 4,
            textAlign: "center"
          }}>
            <Text style={{ color: "#d46b08" }}>
              <ExclamationCircleOutlined style={{ marginRight: 8 }} />
              Bước này chưa đến lượt thực hiện. Vui lòng hoàn thành các bước trước đó.
            </Text>
          </div>
        )}

        {availableStatuses.length > 0 && (
          <Form.Item
            name="notes"
            label="Ghi chú (tùy chọn)"
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập ghi chú về việc cập nhật trạng thái..."
            />
          </Form.Item>
        )}

        {/* Thông tin bổ sung */}
        <div style={{ marginTop: 16, padding: 12, backgroundColor: "#e6f7ff", borderRadius: 4 }}>
          <Text style={{ fontSize: 12, color: "#1890ff" }}>
            <ExclamationCircleOutlined style={{ marginRight: 4 }} />
            <strong>Lưu ý:</strong> Khi cập nhật trạng thái, hệ thống sẽ tự động ghi nhận thời gian thực hiện.
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default VehiclesInCarePage;
