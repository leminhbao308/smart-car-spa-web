"use client";
import React from "react";
import { Card, Statistic, Row, Col, Typography } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Text } = Typography;

interface StatCardProps {
  title: string;
  value: number;
  growth?: number;
  icon: React.ReactNode;
  color: string;
  prefix?: string;
  suffix?: string;
  formatter?: (value: unknown) => React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  growth,
  icon,
  color,
  prefix,
  suffix,
  formatter,
}) => {

  const defaultFormatter = (val: unknown) => {
    const numVal = typeof val === "number" ? val : Number(val);
    if (suffix === "VND" || title.includes("Doanh thu")) {
      return formatCurrency(numVal);
    }
    return numVal.toLocaleString("vi-VN");
  };

  return (
    <Card
      style={{
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        border: "none",
        height: "100%",
        padding: 10,
      }}
      className="stat-card-custom"
    >
      <Row align="middle" justify="space-between">
        <Col>
          <div style={{ marginBottom: 8 }}>
            <Text type="secondary" style={{ fontSize: 14 }}>
              {title}
            </Text>
          </div>
          <Statistic
            value={value}
            formatter={formatter || defaultFormatter}
            prefix={prefix}
            suffix={suffix}
            valueStyle={{
              color: color,
              fontSize: 24,
              fontWeight: 600,
            }}
          />
          {growth !== undefined && (
            <div style={{ marginTop: 8 }}>
              <Text
                style={{
                  color: growth >= 0 ? "#52c41a" : "#ff4d4f",
                  fontSize: 12,
                }}
              >
                {growth >= 0 ? (
                  <ArrowUpOutlined style={{ marginRight: 4 }} />
                ) : (
                  <ArrowDownOutlined style={{ marginRight: 4 }} />
                )}
                {Math.abs(growth)}% so với tháng trước
              </Text>
            </div>
          )}
        </Col>
        <Col>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 12,
              backgroundColor: `${color}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            {icon}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default StatCard;
