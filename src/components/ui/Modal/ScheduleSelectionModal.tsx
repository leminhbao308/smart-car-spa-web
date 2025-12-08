"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Row,
  Col,
  Card,
  Tag,
  Space,
  Typography,
  Button,
  Badge,
  Tooltip,
  Alert,
  Empty,
  Spin,
} from "antd";
import {
  CarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { Branch, CareSlot } from "@/components/utils/data/branches.data";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface ScheduleSelectionModalProps {
  open: boolean;
  onCancel: () => void;
  onSelectSlot: (
    slot: CareSlot,
    branch: Branch,
    selectedDateTime: string
  ) => void;
  branch: Branch | null;
  selectedDate: string;
  selectedTime: string;
  estimatedDuration: number; // in minutes
}

const ScheduleSelectionModal: React.FC<ScheduleSelectionModalProps> = ({
  open,
  onCancel,
  onSelectSlot,
  branch,
  selectedDate,
  selectedTime,
  estimatedDuration,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<CareSlot | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedSlot(null);
    }
  }, [open]);

  if (!branch) return null;

  const getSlotTypeColor = (type: string) => {
    switch (type) {
      case "basic":
        return "blue";
      case "premium":
        return "gold";
      case "vip":
        return "purple";
      default:
        return "default";
    }
  };

  const getSlotTypeLabel = (type: string) => {
    switch (type) {
      case "basic":
        return "Cơ bản";
      case "premium":
        return "Cao cấp";
      case "vip":
        return "VIP";
      default:
        return type;
    }
  };

  const getSlotStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "occupied":
        return <CarOutlined style={{ color: "#1890ff" }} />;
      case "maintenance":
        return <ToolOutlined style={{ color: "#fa8c16" }} />;
      default:
        return <ExclamationCircleOutlined />;
    }
  };

  const isSlotAvailable = (slot: CareSlot) => {
    if (slot.status !== "available") return false;

    // Kiểm tra thời gian có phù hợp không
    const selectedDateTime = dayjs(`${selectedDate} ${selectedTime}`);
    const endTime = selectedDateTime.add(estimatedDuration, "minute");

    // Giờ hoạt động của chi nhánh
    const isWeekend =
      selectedDateTime.day() === 0 || selectedDateTime.day() === 6;
    const openingHours = isWeekend
      ? branch?.openingHours?.weekends
      : branch?.openingHours?.weekdays;
    const [openTime, closeTime] = openingHours?.split(" - ") || ["08:00", "18:00"];

    const branchOpenTime = dayjs(`${selectedDate} ${openTime}`);
    const branchCloseTime = dayjs(`${selectedDate} ${closeTime}`);

    return (
      selectedDateTime.isAfter(branchOpenTime) &&
      endTime.isBefore(branchCloseTime)
    );
  };

  const availableSlots = branch?.careSlots?.filter(isSlotAvailable) || [];

  const handleSelectSlot = async (slot: CareSlot) => {
    setLoading(true);
    setSelectedSlot(slot);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    onSelectSlot(slot, branch, `${selectedDate} ${selectedTime}`);
    setLoading(false);
  };

  const getSlotRecommendation = (slot: CareSlot) => {
    if (slot.type === "vip") return "Dịch vụ cao cấp nhất";
    if (slot.type === "premium") return "Dịch vụ chất lượng cao";
    return "Dịch vụ cơ bản";
  };

  return (
    <Modal
      title={
        <Space>
          <EnvironmentOutlined />
          <span>Chọn slot chăm sóc - {branch?.name || "Chi nhánh"}</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Alert
          message="Thông tin đặt lịch"
          description={
            <div>
              <Text strong>Ngày: </Text>
              <Text>{dayjs(selectedDate).format("DD/MM/YYYY")}</Text>
              <br />
              <Text strong>Giờ: </Text>
              <Text>{selectedTime}</Text>
              <br />
              <Text strong>Thời gian dự kiến: </Text>
              <Text>{estimatedDuration} phút</Text>
              <br />
              <Text strong>Giờ kết thúc dự kiến: </Text>
              <Text>
                {dayjs(`${selectedDate} ${selectedTime}`)
                  .add(estimatedDuration, "minute")
                  .format("HH:mm")}
              </Text>
            </div>
          }
          type="info"
          showIcon
        />
      </div>

      {availableSlots.length === 0 ? (
        <Empty
          description="Không có slot trống phù hợp"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Text type="secondary">
            Vui lòng chọn thời gian khác hoặc liên hệ chi nhánh để được hỗ trợ.
          </Text>
        </Empty>
      ) : (
        <div>
          <Title level={5}>Slot có sẵn ({availableSlots.length})</Title>
          <Row gutter={[16, 16]}>
            {availableSlots.map((slot) => (
              <Col span={8} key={slot.id}>
                <Card
                  hoverable
                  size="small"
                  style={{
                    border:
                      selectedSlot?.id === slot.id
                        ? "2px solid #1890ff"
                        : "1px solid #d9d9d9",
                    backgroundColor:
                      selectedSlot?.id === slot.id ? "#f0f8ff" : "#fff",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSelectSlot(slot)}
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text strong>{slot.name}</Text>
                      {getSlotStatusIcon(slot.status)}
                    </div>

                    <Tag color={getSlotTypeColor(slot.type)}>
                      {getSlotTypeLabel(slot.type)}
                    </Tag>

                    <Badge status="success" text="Có sẵn" />

                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {getSlotRecommendation(slot)}
                    </Text>

                    {selectedSlot?.id === slot.id && (
                      <Button
                        type="primary"
                        size="small"
                        loading={loading}
                        style={{ width: "100%" }}
                      >
                        Đã chọn
                      </Button>
                    )}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      <div
        style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: "#f5f5f5",
          borderRadius: 6,
        }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>
          <ClockCircleOutlined /> Giờ hoạt động: {branch?.openingHours?.weekdays || "N/A"}{" "}
          (T2-T6), {branch?.openingHours?.weekends || "N/A"} (T7-CN)
        </Text>
      </div>
    </Modal>
  );
};

export default ScheduleSelectionModal;

