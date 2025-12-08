"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Timeline,
  Space,
  Avatar,
} from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  CarOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import {
  ServiceProcessTrackingInfoDto,
  TrackingStatus,
} from "@/lib/api/types/service-process-tracking.types";
import { formatDate } from "@/components/utils/helper/date.format.helper";
import { ServiceBayService } from "@/lib/api/services/service-bay.service";
import { TechnicianInfo } from "@/lib/api/types/service-bay.types";

const { Text } = Typography;

interface TrackingDetailModalProps {
  open: boolean;
  onCancel: () => void;
  tracking: ServiceProcessTrackingInfoDto | null;
}

const TrackingDetailModal: React.FC<TrackingDetailModalProps> = ({
  open,
  onCancel,
  tracking,
}) => {
  const [technicians, setTechnicians] = useState<TechnicianInfo[]>([]);

  // Load technicians by bay when modal opens
  useEffect(() => {
    const loadTechnicians = async () => {
      if (!tracking?.bayId) {
        console.log("No bayId found in tracking:", tracking);
        setTechnicians([]);
        return;
      }
      try {
        console.log("Loading technicians for bay_id:", tracking.bayId);
        const bay = await ServiceBayService.getServiceBayById(tracking.bayId);
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
    if (open && tracking?.bayId) loadTechnicians();
  }, [open, tracking?.bayId, tracking]);

  if (!tracking) return null;

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

  const statusConfig = getStatusConfig(tracking.status);

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ToolOutlined style={{ color: "#1890ff" }} />
          <span>Chi tiết tracking</span>
          <Tag color={statusConfig.color} icon={statusConfig.icon}>
            {statusConfig.label}
          </Tag>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
      destroyOnHidden
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header Information */}
        <Card size="small">
          <Row gutter={[16, 16]}>
            <Col span={12}>
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
                  <Text strong>Biển số:</Text> {tracking.vehicleLicensePlate}
                </div>
                <div>
                  <Text strong>Khách hàng:</Text> {tracking.customerName}
                </div>
                <div>
                  <Text strong>SĐT:</Text> {tracking.customerPhone}
                </div>
                <div>
                  <Text strong>Mã booking:</Text> {tracking.bookingCode}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <ToolOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                <Text strong>Thông tin bước dịch vụ</Text>
              </div>
              <div style={{ marginLeft: 24 }}>
                <div>
                  <Text strong>Bước {tracking.serviceStepOrder}:</Text>{" "}
                  {tracking.serviceStepName}
                </div>
                <div>
                  <Text strong>Mô tả:</Text> {tracking.serviceStepDescription}
                </div>
                <div>
                  <Text strong>Bắt buộc:</Text>
                  <Tag
                    color={tracking.isRequired ? "red" : "blue"}
                    style={{ marginLeft: 4 }}
                  >
                    {tracking.isRequired ? "Có" : "Không"}
                  </Tag>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Bay Information */}
        <Card size="small" title="Thông tin nhân viên và khu vực">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <UserOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                <Text strong>Kỹ thuật viên</Text>
              </div>
              <div style={{ marginLeft: 24 }}>
                {/* Current technician from tracking */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Avatar
                    size="small"
                    icon={<UserOutlined />}
                    style={{ marginRight: 8 }}
                  />
                  <div>
                    <div>
                      <Text strong>{tracking.technicianName}</Text>
                      <Tag
                        color="green"
                        style={{ marginLeft: 8, fontSize: 10 }}
                      >
                        Đang thực hiện
                      </Tag>
                    </div>
                    <div>
                      <Text style={{ fontSize: 12, color: "#666" }}>
                        {tracking.technicianCode}
                      </Text>
                    </div>
                  </div>
                </div>

                {/* All technicians in bay */}
                {technicians && technicians.length > 0 && (
                  <div>
                    <Text strong style={{ fontSize: 12, color: "#666" }}>
                      Tất cả kỹ thuật viên trong bay:
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      {technicians.map((t) => (
                        <Tag
                          key={t.technician_id}
                          color={
                            t.technician_id === tracking.technicianId
                              ? "green"
                              : "blue"
                          }
                          style={{ marginBottom: 2, fontSize: 10 }}
                        >
                          {t.technician_name}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Col>
            <Col span={12}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <EnvironmentOutlined
                  style={{ marginRight: 8, color: "#52c41a" }}
                />
                <Text strong>Khu vực dịch vụ</Text>
              </div>
              <div style={{ marginLeft: 24 }}>
                <div>
                  <Text strong>{tracking.bayName}</Text>
                </div>
                <div>
                  <Text style={{ fontSize: 12, color: "#666" }}>
                    Mã: {tracking.bayCode}
                  </Text>
                </div>
                {technicians && technicians.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Text style={{ fontSize: 12, color: "#666" }}>
                      Số kỹ thuật viên: {technicians.length}
                    </Text>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Card>

        {/* Timeline */}
        <Card size="small" title="Timeline thực hiện">
          <Timeline
            items={[
              {
                children: (
                  <div>
                    <Text strong>Tạo tracking</Text>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {formatDate(tracking.createdAt)}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      Bởi: {tracking.createdBy}
                    </div>
                  </div>
                ),
                color: "blue",
              },
              ...(tracking.startTime
                ? [
                    {
                      children: (
                        <div>
                          <Text strong>Bắt đầu thực hiện</Text>
                          <div style={{ fontSize: 12, color: "#666" }}>
                            {formatDate(tracking.startTime)}
                          </div>
                        </div>
                      ),
                      color: "green",
                    },
                  ]
                : []),
              ...(tracking.endTime
                ? [
                    {
                      children: (
                        <div>
                          <Text strong>Hoàn thành</Text>
                          <div style={{ fontSize: 12, color: "#666" }}>
                            {formatDate(tracking.endTime)}
                          </div>
                        </div>
                      ),
                      color: "green",
                    },
                  ]
                : []),
              {
                children: (
                  <div>
                    <Text strong>Cập nhật cuối</Text>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {tracking.lastUpdatedAt
                        ? formatDate(tracking.lastUpdatedAt)
                        : "Chưa có"}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      Bởi: {tracking.lastUpdatedByName || "N/A"}
                    </div>
                  </div>
                ),
                color: "gray",
              },
            ]}
          />
        </Card>

        {/* Notes */}
        {tracking.notes && (
          <Card size="small" title="Ghi chú">
            <Text>{tracking.notes}</Text>
          </Card>
        )}

        {/* Evidence Media */}
        {tracking.evidenceMediaUrls && (
          <Card size="small" title="Bằng chứng">
            <Text>{tracking.evidenceMediaUrls}</Text>
          </Card>
        )}
      </Space>
    </Modal>
  );
};

export default TrackingDetailModal;
