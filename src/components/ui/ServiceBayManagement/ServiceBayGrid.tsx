"use client";

import React from "react";
import { Row, Col, Empty, Spin } from "antd";
import { ServiceBay, BayStatus } from "@/lib/api/types/service-bay.types";
import ServiceBayCard from "./ServiceBayCard";

interface ServiceBayGridProps {
  bays: ServiceBay[];
  loading?: boolean;
  onEdit: (bay: ServiceBay) => void;
  onView: (bay: ServiceBay) => void;
  onStatusChange: (bay: ServiceBay, status: BayStatus) => void;
  emptyMessage?: string;
}

const ServiceBayGrid: React.FC<ServiceBayGridProps> = ({
  bays,
  loading = false,
  onEdit,
  onView,
  onStatusChange,
  emptyMessage = "Không có khu vực dịch vụ nào",
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (bays.length === 0) {
    return (
      <Empty
        description={emptyMessage}
        style={{ padding: "40px" }}
      />
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {bays.map((bay) => (
        <Col
          key={bay.bay_id}
          xs={24}
          sm={12}
          md={8}
          lg={6}
          xl={6}
          xxl={6}
        >
          <ServiceBayCard
            bay={bay}
            onEdit={onEdit}
            onView={onView}
            onStatusChange={onStatusChange}
          />
        </Col>
      ))}
    </Row>
  );
};

export default ServiceBayGrid;
