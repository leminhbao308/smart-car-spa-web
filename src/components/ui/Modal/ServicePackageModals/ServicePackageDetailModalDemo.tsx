"use client";
import React from "react";
import { Button, Space, Card, Typography, Divider } from "antd";
import { EyeOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { ServicePackageDetailModalProvider, useServicePackageDetailModalContext } from "./ServicePackageDetailModalProvider";
import { ServicePackage } from "@/lib/api/types/service-package.types";

const { Title, Text } = Typography;

// Mock data for demo
const mockComboPackage: ServicePackage = {
  package_id: "1",
  package_url: "https://via.placeholder.com/300x200?text=Combo+Package",
  package_name: "Gói chăm sóc toàn diện",
  category_id: "1",
  category_name: "Chăm sóc xe",
  description: "Gói dịch vụ chăm sóc xe toàn diện bao gồm rửa xe, đánh bóng, và bảo dưỡng cơ bản",
  total_duration: 180,
  package_price: 500000,
  service_cost: 500000,
  service_package_type_id: "1",
  service_package_type_name: "COMBO",
  is_active: true,
  package_services: [
    {
      service_package_service_id: "1",
      package_id: "1",
      service_id: "1",
      service_name: "Rửa xe cao cấp",
      service_url: "https://via.placeholder.com/300x200?text=Wash+Service",
      service_description: "Dịch vụ rửa xe cao cấp",
      service_standard_duration: 60,
      service_base_price: 150000,
      quantity: 1,
      unit_price: 150000,
      total_price: 150000,
      is_required: true,
      is_active: true,
    },
    {
      service_package_service_id: "2",
      package_id: "1",
      service_id: "2",
      service_name: "Đánh bóng xe",
      service_url: "https://via.placeholder.com/300x200?text=Polish+Service",
      service_description: "Dịch vụ đánh bóng xe",
      service_standard_duration: 90,
      service_base_price: 200000,
      quantity: 1,
      unit_price: 200000,
      total_price: 200000,
      is_required: true,
      is_active: true,
    },
    {
      service_package_service_id: "3",
      package_id: "1",
      service_id: "3",
      service_name: "Bảo dưỡng cơ bản",
      service_url: "https://via.placeholder.com/300x200?text=Maintenance+Service",
      service_description: "Dịch vụ bảo dưỡng cơ bản",
      service_standard_duration: 30,
      service_base_price: 150000,
      quantity: 1,
      unit_price: 150000,
      total_price: 150000,
      is_required: true,
      is_active: true,
    },
  ],
  service_count: 3,
  audit: {
    created_date: "2024-01-01T00:00:00Z",
    modified_date: "2024-01-01T00:00:00Z",
    created_by: "admin",
    modified_by: "admin",
  },
};

const mockProcessPackage: ServicePackage = {
  package_id: "2",
  package_url: "https://via.placeholder.com/300x200?text=Process+Package",
  package_name: "Gói bảo dưỡng định kỳ",
  category_id: "1",
  category_name: "Chăm sóc xe",
  description: "Gói bảo dưỡng định kỳ theo quy trình chuẩn",
  total_duration: 120,
  package_price: 300000,
  service_cost: 300000,
  service_package_type_id: "2",
  service_package_type_name: "PROCESS",
  is_active: true,
  package_services: [],
  service_process_id: "1",
  service_process_name: "Quy trình bảo dưỡng định kỳ",
  service_process_code: "MAINT-001",
  is_default_process: true,
  service_count: 0,
  audit: {
    created_date: "2024-01-01T00:00:00Z",
    modified_date: "2024-01-01T00:00:00Z",
    created_by: "admin",
    modified_by: "admin",
  },
};

const DemoContent: React.FC = () => {
  const { showDetailModal } = useServicePackageDetailModalContext();

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <ShoppingCartOutlined style={{ marginRight: 8 }} />
        Service Package Detail Modal Demo
      </Title>
      
      <Text type="secondary">
        Demo component để test ServicePackageDetailModal với các loại gói dịch vụ khác nhau.
      </Text>

      <Divider />

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Card
          title="Gói Combo - Nhiều dịch vụ"
          style={{ width: 300 }}
          actions={[
            <Button
              key="view"
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => showDetailModal(mockComboPackage)}
            >
              Xem chi tiết
            </Button>,
          ]}
        >
          <div>
            <Text strong>{mockComboPackage.package_name}</Text>
            <br />
            <Text type="secondary" code>{mockComboPackage.package_id}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {mockComboPackage.description}
            </Text>
            <br />
            <Text style={{ color: "#52c41a", fontWeight: "bold" }}>
              {mockComboPackage.package_price.toLocaleString()} VNĐ
            </Text>
            <br />
            <Text type="secondary">
              {mockComboPackage.total_duration} phút
            </Text>
          </div>
        </Card>

        <Card
          title="Gói theo quy trình"
          style={{ width: 300 }}
          actions={[
            <Button
              key="view"
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => showDetailModal(mockProcessPackage)}
            >
              Xem chi tiết
            </Button>,
          ]}
        >
          <div>
            <Text strong>{mockProcessPackage.package_name}</Text>
            <br />
            <Text type="secondary" code>{mockProcessPackage.package_id}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {mockProcessPackage.description}
            </Text>
            <br />
            <Text style={{ color: "#52c41a", fontWeight: "bold" }}>
              {mockProcessPackage.package_price.toLocaleString()} VNĐ
            </Text>
            <br />
            <Text type="secondary">
              {mockProcessPackage.total_duration} phút
            </Text>
          </div>
        </Card>
      </div>

      <Divider />

      <Card title="Hướng dẫn sử dụng" size="small">
        <div>
          <Title level={5}>Tính năng chính:</Title>
          <ul>
            <li><Text>Xem chi tiết gói dịch vụ với thông tin đầy đủ</Text></li>
            <li><Text>Đối với gói combo: Hiển thị bảng danh sách dịch vụ với khả năng xem chi tiết từng dịch vụ</Text></li>
            <li><Text>Đối với gói theo quy trình: Hiển thị thông tin quy trình với khả năng xem chi tiết quy trình</Text></li>
            <li><Text>Tái sử dụng modal ServiceDetailModal và CareProcessDetailModal có sẵn</Text></li>
            <li><Text>Giao diện responsive và thân thiện với người dùng</Text></li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

const ServicePackageDetailModalDemo: React.FC = () => {
  return (
    <ServicePackageDetailModalProvider>
      <DemoContent />
    </ServicePackageDetailModalProvider>
  );
};

export default ServicePackageDetailModalDemo;
