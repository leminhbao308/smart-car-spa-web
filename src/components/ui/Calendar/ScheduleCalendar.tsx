"use client";
import React, { useState } from "react";
import {
  Calendar,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Select,
} from "antd";
import { CarOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { Branch, CareSlot } from "@/components/utils/data/branches.data";

const { Title, Text } = Typography;
const { Option } = Select;

interface ScheduleCalendarProps {
  branch: Branch;
  onDateSelect?: (date: Dayjs, slot: CareSlot) => void;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ branch }) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedSlotType, setSelectedSlotType] = useState<string>("all");

  const filteredSlots =
    selectedSlotType === "all"
      ? branch.careSlots
      : branch.careSlots.filter((slot) => slot.type === selectedSlotType);

  const dateCellRender = (value: Dayjs) => {
    // Simulate slot availability for different dates
    const isToday = value.isSame(dayjs(), "day");
    const isPast = value.isBefore(dayjs(), "day");
    const isWeekend = value.day() === 0 || value.day() === 6;

    if (isPast) {
      return (
        <div style={{ textAlign: "center", padding: 4 }}>
          <Text type="secondary" style={{ fontSize: 10 }}>
            Quá khứ
          </Text>
        </div>
      );
    }

    // Simulate availability based on date
    const availableCount = isWeekend
      ? Math.floor(
          filteredSlots.filter((s) => s.status === "available").length * 0.7
        )
      : filteredSlots.filter((s) => s.status === "available").length;

    const totalCount = filteredSlots.length;
    const utilizationRate =
      totalCount > 0
        ? Math.round(((totalCount - availableCount) / totalCount) * 100)
        : 0;

    return (
      <div style={{ textAlign: "center", padding: 2 }}>
        <div style={{ fontSize: 10, marginBottom: 2 }}>
          <Text type="secondary">
            {availableCount}/{totalCount}
          </Text>
        </div>
        <div
          style={{
            height: 4,
            backgroundColor: "#f0f0f0",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${utilizationRate}%`,
              backgroundColor:
                utilizationRate > 80
                  ? "#f5222d"
                  : utilizationRate > 60
                  ? "#fa8c16"
                  : "#52c41a",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        {isToday && (
          <div style={{ fontSize: 8, color: "#1890ff", marginTop: 1 }}>
            Hôm nay
          </div>
        )}
      </div>
    );
  };

  const onSelect = (date: Dayjs) => {
    setSelectedDate(date);
  };

  const onPanelChange = (value: Dayjs) => {
    setSelectedDate(value);
  };

  return (
    <Card
      title={
        <Space>
          <CarOutlined />
          <span>Lịch slot - {branch.name}</span>
        </Space>
      }
      extra={
        <Select
          value={selectedSlotType}
          onChange={setSelectedSlotType}
          style={{ width: 120 }}
          size="small"
        >
          <Option value="all">Tất cả</Option>
          <Option value="basic">Cơ bản</Option>
          <Option value="premium">Cao cấp</Option>
          <Option value="vip">VIP</Option>
        </Select>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Calendar
          value={selectedDate}
          onSelect={onSelect}
          onPanelChange={onPanelChange}
          cellRender={dateCellRender}
          headerRender={({ value, type, onChange, onTypeChange }) => (
            <div
              style={{
                padding: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Button.Group>
                <Button onClick={() => onChange(value.subtract(1, "month"))}>
                  Tháng trước
                </Button>
                <Button onClick={() => onChange(dayjs())}>Hôm nay</Button>
                <Button onClick={() => onChange(value.add(1, "month"))}>
                  Tháng sau
                </Button>
              </Button.Group>
              <Title level={4} style={{ margin: 0 }}>
                {value.format("MMMM YYYY")}
              </Title>
              <Select
                value={type}
                onChange={onTypeChange}
                style={{ width: 100 }}
              >
                <Option value="month">Tháng</Option>
                <Option value="year">Năm</Option>
              </Select>
            </div>
          )}
        />
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: "#f5f5f5",
          borderRadius: 6,
        }}
      >
        <Text strong style={{ marginBottom: 8, display: "block" }}>
          Chú thích:
        </Text>
        <Row gutter={[16, 8]}>
          <Col span={8}>
            <Space>
              <div
                style={{
                  width: 12,
                  height: 4,
                  backgroundColor: "#52c41a",
                  borderRadius: 2,
                }}
              />
              <Text style={{ fontSize: 12 }}>Nhiều slot trống</Text>
            </Space>
          </Col>
          <Col span={8}>
            <Space>
              <div
                style={{
                  width: 12,
                  height: 4,
                  backgroundColor: "#fa8c16",
                  borderRadius: 2,
                }}
              />
              <Text style={{ fontSize: 12 }}>Trung bình</Text>
            </Space>
          </Col>
          <Col span={8}>
            <Space>
              <div
                style={{
                  width: 12,
                  height: 4,
                  backgroundColor: "#f5222d",
                  borderRadius: 2,
                }}
              />
              <Text style={{ fontSize: 12 }}>Ít slot trống</Text>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Selected date info */}
      {selectedDate && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: "#e6f7ff",
            borderRadius: 6,
          }}
        >
          <Text strong>Ngày đã chọn: {selectedDate.format("DD/MM/YYYY")}</Text>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Dự kiến có{" "}
              {Math.floor(
                filteredSlots.filter((s) => s.status === "available").length *
                  0.8
              )}{" "}
              slot trống
            </Text>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ScheduleCalendar;

