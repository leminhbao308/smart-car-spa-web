"use client";
import React from "react";
import { Card, Progress, Row, Col, Typography, Statistic } from "antd";
import { BookingStatus } from "@/components/utils/data/dashboard.data";

const { Text, Title } = Typography;

interface BookingStatusCardProps {
  statusData: BookingStatus[];
  title?: string;
}

const BookingStatusCard: React.FC<BookingStatusCardProps> = ({
  statusData,
  title = "Trạng thái đặt lịch",
}) => {
  const totalBookings = statusData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card
      title={<Title level={4} style={{ margin: 0 }}>{title}</Title>}
      style={{
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        border: "none",
        height: "100%",
      }}
      styles={{
        body: {
          padding: 16,
        },
      }}
    >
      <Row gutter={[16, 16]}>
        {statusData.map((status, index) => (
          <Col span={24} key={index}>
            <div style={{ marginBottom: 16 }}>
              <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
                <Col>
                  <Text strong style={{ fontSize: 14 }}>
                    {status.status}
                  </Text>
                </Col>
                <Col>
                  <Statistic
                    value={status.count}
                    valueStyle={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: status.color,
                    }}
                  />
                </Col>
              </Row>
              <Progress
                percent={status.percentage}
                strokeColor={status.color}
                showInfo={false}
                size="small"
              />
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {status.percentage}% ({status.count} lịch đặt)
                </Text>
              </div>
            </div>
          </Col>
        ))}
      </Row>
      <div
        style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: "#f6ffed",
          borderRadius: 8,
          border: "1px solid #b7eb8f",
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Text strong style={{ color: "#52c41a" }}>
              Tổng số lịch đặt
            </Text>
          </Col>
          <Col>
            <Statistic
              value={totalBookings}
              valueStyle={{
                fontSize: 18,
                fontWeight: 600,
                color: "#52c41a",
              }}
            />
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default BookingStatusCard;
