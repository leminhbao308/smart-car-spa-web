"use client";
import React, { useState } from "react";
import { AdminTable } from "@/components/ui/Table";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import BookingModal from "@/components/ui/Modal/BookingModal/BookingModal";
import { ColumnsType } from "antd/es/table";
import { Tag, Modal, Descriptions, Typography, Button } from "antd";
import {
  PhoneOutlined,
  TeamOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  bookingsData,
  bookingStatuses,
  priorityLevels,
  serviceTypes,
} from "@/components/utils/data/bookings.data";
import dayjs from "dayjs";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import { formatDurationVer01 } from "@/components/utils/helper/duration.format.helper";
import { getTimeRemaining } from "@/components/utils/helper/booking.time.helper";

const { Text } = Typography;

const BookingsPage = () => {
  const [data, setData] = useState(bookingsData);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const { showModal } = useConfirmationModalContext();

  // Định nghĩa columns
  const columns: ColumnsType<any> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Mã đặt lịch",
      dataIndex: "bookingCode",
      key: "bookingCode",
      width: 120,
      render: (code: string) => (
        <span
          style={{ fontFamily: "monospace", fontWeight: 500, color: "#1890ff" }}
        >
          {code}
        </span>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>
            {record.customerName}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#666",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <PhoneOutlined style={{ fontSize: 10 }} />
            {record.customerPhone}
          </div>
          <div style={{ fontSize: 11, color: "#999" }}>
            {record.customerEmail}
          </div>
        </div>
      ),
    },
    {
      title: "Xe",
      key: "vehicle",
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>
            {record.vehicleInfo.licensePlate}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {record.vehicleInfo.brand} {record.vehicleInfo.model}
          </div>
          <div style={{ fontSize: 11, color: "#999" }}>
            {record.vehicleInfo.year} • {record.vehicleInfo.color}
          </div>
        </div>
      ),
    },
    {
      title: "Dịch vụ",
      key: "service",
      width: 200,
      render: (_, record) => {
        const serviceType = serviceTypes.find(
          (s) => s.value === record.serviceType
        );
        return (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 16 }}>{serviceType?.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 500 }}>
                {record.serviceName}
              </span>
            </div>
            <div style={{ fontSize: 11, color: "#666" }}>
              {record.services.length} dịch vụ •{" "}
              {formatDurationVer01(record.estimatedDuration)}
            </div>
            <div style={{ fontSize: 11, color: "#52c41a", fontWeight: 500 }}>
              {formatCurrency(record.totalPrice)}
            </div>
          </div>
        );
      },
    },
    {
      title: "Thời gian",
      key: "datetime",
      width: 150,
      sorter: (a, b) =>
        dayjs(a.bookingDate).unix() - dayjs(b.bookingDate).unix(),
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>
            {dayjs(record.bookingDate).format("DD/MM/YYYY")}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {record.bookingTime}
          </div>
          <div
            style={{
              fontSize: 10,
              color:
                record.status === "completed"
                  ? "#52c41a"
                  : record.status === "cancelled"
                  ? "#ff4d4f"
                  : "#1890ff",
            }}
          >
            {getTimeRemaining(record.bookingDate, record.bookingTime)}
          </div>
        </div>
      ),
    },
    {
      title: "Chi nhánh",
      dataIndex: "branchName",
      key: "branchName",
      width: 150,
      render: (name: string, record: any) => (
        <div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: 10, color: "#666" }}>
            {record.branchAddress}
          </div>
        </div>
      ),
    },
    {
      title: "Nhân viên",
      dataIndex: "assignedStaff",
      key: "assignedStaff",
      width: 120,
      render: (staff: any[]) => (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 2,
            }}
          >
            <TeamOutlined style={{ fontSize: 12, color: "#666" }} />
            <span style={{ fontSize: 11 }}>{staff.length} người</span>
          </div>
          {staff.slice(0, 1).map((member, index) => (
            <div key={index} style={{ fontSize: 10, color: "#666" }}>
              {member.name}
            </div>
          ))}
          {staff.length > 1 && (
            <div style={{ fontSize: 10, color: "#999" }}>
              +{staff.length - 1} khác
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Ưu tiên",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (priority: string) => {
        const priorityConfig = priorityLevels.find((p) => p.value === priority);
        return (
          <Tag color={priorityConfig?.color} icon={priorityConfig?.icon}>
            {priorityConfig?.label}
          </Tag>
        );
      },
      filters: priorityLevels.map((priority) => ({
        text: priority.label,
        value: priority.value,
      })),
      onFilter: (value, record) => record.priority === value,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const statusConfig = bookingStatuses.find((s) => s.value === status);
        return (
          <Tag color={statusConfig?.color} icon={statusConfig?.icon}>
            {statusConfig?.label}
          </Tag>
        );
      },
      filters: bookingStatuses.map((status) => ({
        text: status.label,
        value: status.value,
      })),
      onFilter: (value, record) => record.status === value,
    },
  ];

  // Handlers
  const handleAdd = () => {
    setModalMode("create");
    setSelectedBooking(null);
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setModalMode("edit");
    setSelectedBooking(record);
    setModalOpen(true);
  };

  const handleDelete = (record: any) => {
    showModal({
      title: "Hủy lịch đặt",
      content: `Bạn có chắc chắn muốn hủy lịch đặt ${record.bookingCode} của khách hàng ${record.customerName}?`,
      type: "error",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData(
          data.map((item) =>
            item.id === record.id
              ? ({
                  ...item,
                  status: "cancelled",
                  cancelledAt: new Date().toISOString(),
                  cancellationReason: "Hủy bởi admin",
                } as any)
              : item
          )
        );
        setLoading(false);
      },
    });
  };

  const handleView = (record: any) => {
    setSelectedBooking(record);
    setDetailModalOpen(true);
  };

  const handleModalOk = async (bookingData: any) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (modalMode === "create") {
      const newBooking = {
        ...bookingData,
        id: Math.max(...data.map((b) => b.id)) + 1,
        bookingCode: `BK${String(
          Math.max(...data.map((b) => b.id)) + 1
        ).padStart(3, "0")}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setData([...data, newBooking]);
    } else {
      setData(
        data.map((item) =>
          item.id === selectedBooking.id
            ? { ...item, ...bookingData, updatedAt: new Date().toISOString() }
            : item
        )
      );
    }

    setModalOpen(false);
    setLoading(false);
  };

  const handleConfirm = (record: any) => {
    showModal({
      title: "Xác nhận lịch đặt",
      content: `Xác nhận lịch đặt ${record.bookingCode} của khách hàng ${record.customerName}?`,
      type: "info",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData(
          data.map((item) =>
            item.id === record.id
              ? ({
                  ...item,
                  status: "confirmed",
                  confirmedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                } as any)
              : item
          )
        );
        setLoading(false);
      },
    });
  };

  const handleComplete = (record: any) => {
    showModal({
      title: "Hoàn thành lịch đặt",
      content: `Đánh dấu lịch đặt ${record.bookingCode} là hoàn thành?`,
      type: "success",
      onConfirm: async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData(
          data.map((item) =>
            item.id === record.id
              ? ({
                  ...item,
                  status: "completed",
                  completedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                } as any)
              : item
          )
        );
        setLoading(false);
      },
    });
  };

  return (
    <>
      <AdminTable
        title="Quản lý đặt lịch"
        dataSource={data}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        addButtonText="Đặt lịch mới"
        searchable={true}
        searchPlaceholder="Tìm kiếm đặt lịch theo mã, khách hàng, dịch vụ..."
        searchFields={["bookingCode", "customerName", "serviceName", "phone"]}
        actions={[
          {
            key: "confirm",
            label: "Xác nhận",
            type: "primary",
            icon: <CheckCircleOutlined />,
            onClick: handleConfirm,
            condition: (record: any) => record.status === "pending",
          },
          {
            key: "complete",
            label: "Hoàn thành",
            type: "primary",
            icon: <CheckCircleOutlined />,
            onClick: handleComplete,
            condition: (record: any) =>
              record.status === "confirmed" || record.status === "in_progress",
          },
          {
            key: "cancel",
            label: "Hủy lịch",
            type: "default",
            danger: true,
            icon: <CloseCircleOutlined />,
            onClick: handleDelete,
            condition: (record: any) =>
              record.status !== "completed" && record.status !== "cancelled",
          },
        ]}
        scroll={{ x: 1400 }}
      />

      {/* Modal đặt lịch */}
      <BookingModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleModalOk}
        initialData={selectedBooking}
        mode={modalMode}
        loading={loading}
      />

      {/* Modal chi tiết */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <EyeOutlined style={{ color: "#1890ff" }} />
            <span>Chi tiết lịch đặt</span>
          </div>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedBooking && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã đặt lịch" span={2}>
              <span
                style={{
                  fontFamily: "monospace",
                  fontWeight: 500,
                  color: "#1890ff",
                }}
              >
                {selectedBooking.bookingCode}
              </span>
            </Descriptions.Item>

            <Descriptions.Item label="Khách hàng">
              <div>
                <div style={{ fontWeight: 500 }}>
                  {selectedBooking.customerName}
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {selectedBooking.customerPhone}
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {selectedBooking.customerEmail}
                </div>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Xe">
              <div>
                <div style={{ fontWeight: 500 }}>
                  {selectedBooking.vehicleInfo.licensePlate}
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {selectedBooking.vehicleInfo.brand}{" "}
                  {selectedBooking.vehicleInfo.model}
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {selectedBooking.vehicleInfo.year} •{" "}
                  {selectedBooking.vehicleInfo.color}
                </div>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Dịch vụ" span={2}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 8 }}>
                  {selectedBooking.serviceName}
                </div>
                {selectedBooking.services.map((service: any, index: number) => (
                  <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                    {service.name} - {formatCurrency(service.price)}
                  </Tag>
                ))}
                <div style={{ marginTop: 8 }}>
                  <Text strong>
                    Tổng: {formatCurrency(selectedBooking.totalPrice)}
                  </Text>
                  <Text style={{ marginLeft: 16 }}>
                    Thời gian:{" "}
                    {formatDurationVer01(selectedBooking.estimatedDuration)}
                  </Text>
                </div>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Thời gian">
              <div>
                <div style={{ fontWeight: 500 }}>
                  {dayjs(selectedBooking.bookingDate).format("DD/MM/YYYY")}{" "}
                  {selectedBooking.bookingTime}
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {getTimeRemaining(
                    selectedBooking.bookingDate,
                    selectedBooking.bookingTime
                  )}
                </div>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Chi nhánh">
              <div>
                <div style={{ fontWeight: 500 }}>
                  {selectedBooking.branchName}
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {selectedBooking.branchAddress}
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {selectedBooking.branchPhone}
                </div>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Nhân viên" span={2}>
              <div>
                {selectedBooking.assignedStaff.map(
                  (staff: any, index: number) => (
                    <Tag key={index} color="green" style={{ marginBottom: 4 }}>
                      {staff.name} - {staff.role}
                    </Tag>
                  )
                )}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              {(() => {
                const statusConfig = bookingStatuses.find(
                  (s) => s.value === selectedBooking.status
                );
                return (
                  <Tag color={statusConfig?.color} icon={statusConfig?.icon}>
                    {statusConfig?.label}
                  </Tag>
                );
              })()}
            </Descriptions.Item>

            <Descriptions.Item label="Ưu tiên">
              {(() => {
                const priorityConfig = priorityLevels.find(
                  (p) => p.value === selectedBooking.priority
                );
                return (
                  <Tag
                    color={priorityConfig?.color}
                    icon={priorityConfig?.icon}
                  >
                    {priorityConfig?.label}
                  </Tag>
                );
              })()}
            </Descriptions.Item>

            {selectedBooking.notes && (
              <Descriptions.Item label="Ghi chú" span={2}>
                {selectedBooking.notes}
              </Descriptions.Item>
            )}

            {selectedBooking.specialRequests &&
              selectedBooking.specialRequests.length > 0 && (
                <Descriptions.Item label="Yêu cầu đặc biệt" span={2}>
                  {selectedBooking.specialRequests.map(
                    (request: string, index: number) => (
                      <Tag
                        key={index}
                        color="purple"
                        style={{ marginBottom: 4 }}
                      >
                        {request}
                      </Tag>
                    )
                  )}
                </Descriptions.Item>
              )}
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default BookingsPage;
