"use client";
import React, { useState, useCallback, useMemo } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  Button,
  Spin,
  Empty,
  App,
  Badge,
  Modal,
  Timeline,
  Progress,
  Divider,
} from "antd";
import {
  ReloadOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/lib/api/hooks/useAuth";
import { useCustomerBookings } from "@/lib/api/hooks/useUsers";
import { BookingInfoDto, BookingStatus } from "@/lib/api/types/booking.types";
import { BookingService } from "@/lib/api/services/bookingService";
import { ServiceProcessTrackingService } from "@/lib/api/services/service-process-tracking.service";
import {
  ServiceProcessTrackingInfoDto,
  TrackingStatus,
} from "@/lib/api/types/service-process-tracking.types";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface ServiceWithTrackings {
  serviceId: string;
  serviceName: string;
  trackings: ServiceProcessTrackingInfoDto[];
}

const CareTrackingPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { message } = App.useApp();

  // State for detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingInfoDto | null>(null);
  const [servicesWithTrackings, setServicesWithTrackings] = useState<ServiceWithTrackings[]>([]);
  const [loadingTracking, setLoadingTracking] = useState(false);

  // Get customer bookings
  const { bookings, loading, error, refetch } = useCustomerBookings(
    user?.user_id || null
  );

  // Filter bookings with status CHECKED_IN, IN_PROGRESS, COMPLETED
  const careBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter(
      (b) =>
        b.status === BookingStatus.CHECKED_IN ||
        b.status === BookingStatus.IN_PROGRESS ||
        b.status === BookingStatus.COMPLETED
    );
  }, [bookings]);

  const statusToColor = (status?: string) => {
    switch ((status || "").toUpperCase()) {
      case BookingStatus.CHECKED_IN:
        return "purple";
      case BookingStatus.IN_PROGRESS:
        return "processing";
      case BookingStatus.COMPLETED:
        return "success";
      default:
        return "default";
    }
  };

  const statusToLabel = (status?: string) => {
    switch ((status || "").toUpperCase()) {
      case BookingStatus.CHECKED_IN:
        return "Đã check-in";
      case BookingStatus.IN_PROGRESS:
        return "Đang chăm sóc";
      case BookingStatus.COMPLETED:
        return "Hoàn thành";
      default:
        return status || "";
    }
  };

  const loadTrackingData = useCallback(async (bookingId: string) => {
    setLoadingTracking(true);
    try {
      // Fetch booking details and trackings in parallel
      const [bookingData, trackingsData] = await Promise.all([
        BookingService.getBookingById(bookingId),
        ServiceProcessTrackingService.getTrackingsByBooking(bookingId),
      ]);

      // Group trackings by service
      const serviceMap = new Map<string, ServiceWithTrackings>();

      // First, create service groups based on booking_items
      if (bookingData?.booking_items) {
        for (const bookingItem of bookingData.booking_items) {
          if (bookingItem.service_id) {
            const serviceId = bookingItem.service_id;
            const serviceName = bookingItem.service_name || "Dịch vụ chưa có tên";

            if (!serviceMap.has(serviceId)) {
              serviceMap.set(serviceId, {
                serviceId,
                serviceName,
                trackings: [],
              });
            }
          }
        }
      }

      // Then, assign trackings to their corresponding services using carServiceId
      for (const tracking of trackingsData) {
        let assignedServiceId: string | null = null;

        // Priority 1: Use carServiceId if available and valid
        if (tracking.carServiceId && serviceMap.has(tracking.carServiceId)) {
          assignedServiceId = tracking.carServiceId;
        } else if (serviceMap.size > 0) {
          // Priority 2: If no carServiceId, assign to first available service
          assignedServiceId = Array.from(serviceMap.keys())[0];
        }

        if (assignedServiceId && serviceMap.has(assignedServiceId)) {
          const service = serviceMap.get(assignedServiceId)!;
          service.trackings.push(tracking);
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
      console.error("Error loading tracking data:", error);
      message.error("Không thể tải thông tin quy trình chăm sóc");
      setServicesWithTrackings([]);
    } finally {
      setLoadingTracking(false);
    }
  }, [message]);

  const handleViewDetails = useCallback(
    async (booking: BookingInfoDto) => {
      setSelectedBooking(booking);
      setDetailModalOpen(true);
      await loadTrackingData(booking.booking_id);
    },
    [loadTrackingData]
  );

  const getStatusConfig = (status: string) => {
    switch (status) {
      case TrackingStatus.PENDING:
        return { label: "Chờ thực hiện", color: "default" };
      case TrackingStatus.IN_PROGRESS:
        return { label: "Đang thực hiện", color: "processing" };
      case TrackingStatus.COMPLETED:
        return { label: "Hoàn thành", color: "success" };
      case TrackingStatus.CANCELLED:
        return { label: "Đã hủy", color: "error" };
      default:
        return { label: status || "", color: "default" };
    }
  };

  const columns = [
    {
      title: "Mã booking",
      dataIndex: "booking_code",
      key: "booking_code",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Thời gian",
      key: "scheduled_start_at",
      render: (record: BookingInfoDto) => (
        <Space direction="vertical" size={0}>
          <Text>
            <ClockCircleOutlined />{" "}
            {dayjs(record.scheduled_start_at).format("DD/MM/YYYY HH:mm")}
          </Text>
          {record.branch_name && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <EnvironmentOutlined /> {record.branch_name}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Xe",
      key: "vehicle",
      render: (record: BookingInfoDto) => (
        <Space direction="vertical" size={0}>
          <Text>
            <CarOutlined /> {record.vehicle_license_plate}
          </Text>
          {(record.vehicle_brand_name || record.vehicle_model_name) && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {[record.vehicle_brand_name, record.vehicle_model_name]
                .filter(Boolean)
                .join(" • ")}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Khu vực",
      dataIndex: "bay_name",
      key: "bay_name",
      render: (text: string) => text || "N/A",
    },
    {
      title: "Tổng tiền",
      key: "total_price",
      render: (record: BookingInfoDto) => (
        <Text strong>
          {record.total_price?.toLocaleString()} {record.currency || "VND"}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusToColor(status)}>{statusToLabel(status)}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: BookingInfoDto) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  if (authLoading || loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Empty description="Vui lòng đăng nhập để xem lịch sử chăm sóc" />
    );
  }

  return (
    <App>
      <div style={{ padding: "24px" }}>
        <Card>
          <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}>
            <Title level={2} style={{ margin: 0 }}>
              Theo dõi quy trình chăm sóc
            </Title>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>

          {error ? (
            <Empty description="Không thể tải dữ liệu. Vui lòng thử lại." />
          ) : careBookings.length === 0 ? (
            <Empty description="Bạn chưa có lịch chăm sóc nào" />
          ) : (
            <Table
              dataSource={careBookings}
              columns={columns}
              rowKey="booking_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total: number, range: [number, number]) =>
                  `${range[0]}-${range[1]} của ${total} booking`,
              }}
            />
          )}
        </Card>

        {/* Detail Modal */}
        <Modal
          title={
            <Space>
              <Text strong>Chi tiết quy trình chăm sóc</Text>
              {selectedBooking && (
                <Badge
                  status={statusToColor(selectedBooking.status) as any}
                  text={statusToLabel(selectedBooking.status)}
                />
              )}
            </Space>
          }
          open={detailModalOpen}
          onCancel={() => {
            setDetailModalOpen(false);
            setSelectedBooking(null);
            setServicesWithTrackings([]);
          }}
          footer={[
            <Button key="close" onClick={() => setDetailModalOpen(false)}>
              Đóng
            </Button>,
          ]}
          width={900}
        >
          {selectedBooking && (
            <div style={{ marginBottom: 24 }}>
              <Card size="small" style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: "100%" }} size="small">
                  <div>
                    <Text strong>Mã booking: </Text>
                    <Text>{selectedBooking.booking_code}</Text>
                  </div>
                  <div>
                    <Text strong>Xe: </Text>
                    <Text>{selectedBooking.vehicle_license_plate}</Text>
                    {(selectedBooking.vehicle_brand_name ||
                      selectedBooking.vehicle_model_name) && (
                      <Text type="secondary">
                        {" • "}
                        {[
                          selectedBooking.vehicle_brand_name,
                          selectedBooking.vehicle_model_name,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </Text>
                    )}
                  </div>
                  <div>
                    <Text strong>Chi nhánh: </Text>
                    <Text>{selectedBooking.branch_name}</Text>
                  </div>
                  <div>
                    <Text strong>Khu vực: </Text>
                    <Text>{selectedBooking.bay_name}</Text>
                  </div>
                  <div>
                    <Text strong>Thời gian: </Text>
                    <Text>
                      {dayjs(selectedBooking.scheduled_start_at).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </Text>
                  </div>
                </Space>
              </Card>
            </div>
          )}

          {loadingTracking ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>Đang tải quy trình chăm sóc...</div>
            </div>
          ) : servicesWithTrackings.length === 0 ? (
            <Empty description="Chưa có thông tin quy trình chăm sóc" />
          ) : (
            <div>
              {servicesWithTrackings.map((service, serviceIndex) => {
                const completedCount = service.trackings.filter(
                  (t) => t.status === TrackingStatus.COMPLETED
                ).length;
                const totalCount = service.trackings.length;
                const progressPercent =
                  totalCount > 0
                    ? Math.round((completedCount / totalCount) * 100)
                    : 0;

                return (
                  <Card
                    key={service.serviceId}
                    style={{ marginBottom: 24 }}
                    title={
                      <Space>
                        <Text strong>{service.serviceName}</Text>
                        <Tag color="blue">
                          {completedCount}/{totalCount} bước hoàn thành
                        </Tag>
                      </Space>
                    }
                    extra={
                      <Text type="secondary" style={{ fontSize: 14 }}>
                        {progressPercent}%
                      </Text>
                    }
                  >
                    <Progress
                      percent={progressPercent}
                      status={
                        progressPercent === 100
                          ? "success"
                          : progressPercent > 0
                          ? "active"
                          : "normal"
                      }
                      style={{ marginBottom: 24 }}
                    />

                    <Timeline>
                      {service.trackings.map((tracking, index) => {
                        const statusConfig = getStatusConfig(tracking.status);
                        return (
                          <Timeline.Item
                            key={tracking.trackingId}
                            color={
                              statusConfig.color === "success"
                                ? "green"
                                : statusConfig.color === "processing"
                                ? "blue"
                                : statusConfig.color === "error"
                                ? "red"
                                : "gray"
                            }
                          >
                            <Card size="small" style={{ marginBottom: 16 }}>
                              <Space direction="vertical" style={{ width: "100%" }} size="small">
                                <div>
                                  <Text strong>
                                    Bước {tracking.serviceStepOrder || index + 1}:{" "}
                                    {tracking.serviceStepName || "Chưa có tên"}
                                  </Text>
                                  <Tag
                                    color={statusConfig.color}
                                    style={{ marginLeft: 8 }}
                                  >
                                    {statusConfig.label}
                                  </Tag>
                                  {tracking.isRequired && (
                                    <Tag color="red" style={{ marginLeft: 4 }}>
                                      Bắt buộc
                                    </Tag>
                                  )}
                                  {tracking.estimatedTime && (
                                    <Tag color="blue" style={{ marginLeft: 4 }}>
                                      ~{tracking.estimatedTime} phút
                                    </Tag>
                                  )}
                                </div>
                                {tracking.serviceStepDescription && (
                                  <Text type="secondary">
                                    {tracking.serviceStepDescription}
                                  </Text>
                                )}
                                <Divider style={{ margin: "8px 0" }} />
                                {tracking.technicianName && (
                                  <div>
                                    <Text type="secondary">Kỹ thuật viên: </Text>
                                    <Text strong>{tracking.technicianName}</Text>
                                  </div>
                                )}
                                {tracking.startTime && (
                                  <div>
                                    <Text type="secondary">Bắt đầu: </Text>
                                    <Text>
                                      {dayjs(tracking.startTime).format(
                                        "DD/MM/YYYY HH:mm"
                                      )}
                                    </Text>
                                  </div>
                                )}
                                {tracking.endTime && (
                                  <div>
                                    <Text type="secondary">Kết thúc: </Text>
                                    <Text>
                                      {dayjs(tracking.endTime).format(
                                        "DD/MM/YYYY HH:mm"
                                      )}
                                    </Text>
                                  </div>
                                )}
                                {tracking.notes && (
                                  <div style={{ marginTop: 8 }}>
                                    <Text type="secondary">Ghi chú: </Text>
                                    <div
                                      style={{
                                        marginTop: 4,
                                        padding: 8,
                                        backgroundColor: "#f5f5f5",
                                        borderRadius: 4,
                                      }}
                                    >
                                      <Text>{tracking.notes}</Text>
                                    </div>
                                  </div>
                                )}
                              </Space>
                            </Card>
                          </Timeline.Item>
                        );
                      })}
                    </Timeline>
                  </Card>
                );
              })}
            </div>
          )}
        </Modal>
      </div>
    </App>
  );
};

export default CareTrackingPage;

