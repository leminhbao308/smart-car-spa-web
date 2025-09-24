"use client";
import React from "react";
import { Tooltip, Card, Row, Col, Tag, Typography, Space } from "antd";
import {
  DollarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Text, Title } = Typography;

interface Service {
  id: number;
  serviceCode: string;
  serviceName: string;
  serviceTypeId: number;
  serviceTypeName: string;
  description: string;
  totalPrice: number;
  duration: number;
  status: string;
  features: string[];
  requirements: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface ServiceDetailTooltipProps {
  service: Service;
  children: React.ReactNode;
}

const ServiceDetailTooltip: React.FC<ServiceDetailTooltipProps> = ({
  service,
  children,
}) => {
  const content = (
    <Card
      style={{ width: 350, maxHeight: 400, overflowY: "auto" }}
      bodyStyle={{ padding: 12 }}
    >
      <div>
        <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
          {service.serviceName}
        </Title>

        <Space style={{ marginBottom: 8 }}>
          <Tag color="blue">{service.serviceTypeName}</Tag>
          <Tag color="green">
            {service.status === "active" ? "Hoạt động" : "Không hoạt động"}
          </Tag>
        </Space>

        <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
          <Col span={12}>
            <Space>
              <DollarOutlined style={{ color: "#52c41a" }} />
              <Text strong style={{ color: "#52c41a" }}>
                {formatCurrency(service.totalPrice)}
              </Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space>
              <ClockCircleOutlined style={{ color: "#1890ff" }} />
              <Text>{service.duration} phút</Text>
            </Space>
          </Col>
        </Row>

        {service.description && (
          <div style={{ marginBottom: 12 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {service.description}
            </Text>
          </div>
        )}

        {service.features && service.features.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <Text strong style={{ fontSize: 12 }}>
              Tính năng:
            </Text>
            <div style={{ marginTop: 4 }}>
              {service.features.slice(0, 3).map((feature, index) => (
                <Tag key={index} style={{ marginBottom: 2 }}>
                  {feature}
                </Tag>
              ))}
              {service.features.length > 3 && (
                <Tag color="blue">+{service.features.length - 3} khác</Tag>
              )}
            </div>
          </div>
        )}

        {service.requirements && service.requirements.length > 0 && (
          <div>
            <Text strong style={{ fontSize: 12 }}>
              Yêu cầu:
            </Text>
            <div style={{ marginTop: 4 }}>
              {service.requirements.slice(0, 2).map((req, index) => (
                <Tag key={index} color="orange" style={{ marginBottom: 2 }}>
                  {req}
                </Tag>
              ))}
              {service.requirements.length > 2 && (
                <Tag color="blue">+{service.requirements.length - 2} khác</Tag>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <Tooltip title={content} placement="left">
      {children}
    </Tooltip>
  );
};

export default ServiceDetailTooltip;
