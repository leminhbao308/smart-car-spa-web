"use client";
import React from "react";
import { Button, Space, Card, Typography, Divider } from "antd";
import { EditOutlined, PlusOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { ServicePackageModalProvider, useServicePackageModal } from "./ServicePackageModalProvider";
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
  ],
  service_count: 2,
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
  const { visible, mode, editData, openCreateModal, openEditModal, closeModal } = useServicePackageModal();

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <ShoppingCartOutlined style={{ marginRight: 8 }} />
        Service Package Modal - Edit Mode Demo
      </Title>
      
      <Text type="secondary">
        Demo để test tính năng chỉnh sửa gói dịch vụ với logic kiểm tra loại gói.
      </Text>

      <Divider />

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Card
          title="Tạo mới gói dịch vụ"
          style={{ width: 300 }}
          actions={[
            <Button
              key="create"
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              Tạo mới
            </Button>,
          ]}
        >
          <div>
            <Text strong>Tạo gói dịch vụ mới</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Cho phép chọn loại gói: Combo hoặc Process
            </Text>
            <br />
            <Text style={{ color: "#52c41a", fontWeight: "bold" }}>
              Có thể chọn loại gói
            </Text>
          </div>
        </Card>

        <Card
          title="Chỉnh sửa gói Combo"
          style={{ width: 300 }}
          actions={[
            <Button
              key="edit"
              type="default"
              icon={<EditOutlined />}
              onClick={() => openEditModal(mockComboPackage)}
            >
              Chỉnh sửa
            </Button>,
          ]}
        >
          <div>
            <Text strong>{mockComboPackage.package_name}</Text>
            <br />
            <Text type="secondary" code>{mockComboPackage.package_id}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Loại: {mockComboPackage.service_package_type_name}
            </Text>
            <br />
            <Text style={{ color: "#faad14", fontWeight: "bold" }}>
              Không thể thay đổi loại gói
            </Text>
          </div>
        </Card>

        <Card
          title="Chỉnh sửa gói Process"
          style={{ width: 300 }}
          actions={[
            <Button
              key="edit"
              type="default"
              icon={<EditOutlined />}
              onClick={() => openEditModal(mockProcessPackage)}
            >
              Chỉnh sửa
            </Button>,
          ]}
        >
          <div>
            <Text strong>{mockProcessPackage.package_name}</Text>
            <br />
            <Text type="secondary" code>{mockProcessPackage.package_id}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Loại: {mockProcessPackage.service_package_type_name}
            </Text>
            <br />
            <Text style={{ color: "#faad14", fontWeight: "bold" }}>
              Không thể thay đổi loại gói
            </Text>
          </div>
        </Card>
      </div>

      <Divider />

      <Card title="Hướng dẫn sử dụng" size="small">
        <div>
          <Title level={5}>Tính năng chính:</Title>
          <ul>
            <li><Text><strong>Tạo mới:</strong> Cho phép chọn loại gói (Combo hoặc Process)</Text></li>
            <li><Text><strong>Chỉnh sửa:</strong> Không cho phép thay đổi loại gói, chỉ cho phép chỉnh sửa theo loại hiện tại</Text></li>
            <li><Text><strong>UI/UX:</strong> Card loại gói không được chọn sẽ bị mờ đi và không thể click</Text></li>
            <li><Text><strong>Thông báo:</strong> Hiển thị thông báo "Không thể thay đổi loại gói khi chỉnh sửa"</Text></li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

const ServicePackageModalEditDemo: React.FC = () => {
  return (
    <ServicePackageModalProvider>
      <DemoContent />
    </ServicePackageModalProvider>
  );
};

export default ServicePackageModalEditDemo;
