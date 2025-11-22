"use client";
import React from "react";
import { Button, Space, Card, Typography, Divider } from "antd";
import { PlusOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { ServicePackageModal, useServicePackageModal } from "./index";
import { ServicePackage } from "@/lib/api/types/service-package.types";

const { Title, Text, Paragraph } = Typography;

/**
 * Demo component để test ServicePackageModal
 * Có thể sử dụng trong development hoặc testing
 */
const ServicePackageModalDemo: React.FC = () => {
  const {
    visible,
    mode,
    editData,
    openCreateModal,
    openEditModal,
    closeModal,
  } = useServicePackageModal();

  // Mock data cho demo
  const mockComboPackage: ServicePackage = {
    package_id: "combo-001",
    package_url: "combo-cham-soc-xe-toan-dien",
    package_name: "Combo chăm sóc xe toàn diện",
    category_id: "cat-001",
    category_name: "Chăm sóc xe",
    description: "Gói dịch vụ chăm sóc xe toàn diện bao gồm rửa xe, đánh bóng và bảo dưỡng cơ bản",
    total_duration: 180,
    package_price: 800000,
    service_cost: 600000,
    service_package_type_id: "type-001",
    service_package_type_name: "VIP",
    is_active: true,
    package_services: [
      {
        service_id: "svc-001",
        service_name: "Rửa xe cao áp",
        service_url: "rua-xe-cao-ap",
        service_description: "Rửa xe bằng máy cao áp chuyên nghiệp",
        service_standard_duration: 60,
        service_base_price: 150000,
        quantity: 1,
        unit_price: 150000,
        total_price: 150000,
        is_required: true,
        is_active: true,
      },
      {
        service_id: "svc-002",
        service_name: "Đánh bóng sơn xe",
        service_url: "danh-bong-son-xe",
        service_description: "Đánh bóng và bảo vệ lớp sơn xe",
        service_standard_duration: 90,
        service_base_price: 300000,
        quantity: 1,
        unit_price: 300000,
        total_price: 300000,
        is_required: true,
        is_active: true,
      },
      {
        service_id: "svc-003",
        service_name: "Bảo dưỡng cơ bản",
        service_url: "bao-duong-co-ban",
        service_description: "Kiểm tra và bảo dưỡng các bộ phận cơ bản",
        service_standard_duration: 30,
        service_base_price: 150000,
        quantity: 1,
        unit_price: 150000,
        total_price: 150000,
        is_required: false,
        is_active: true,
      },
    ],
    audit: {
      created_date: "2024-01-15T10:00:00Z",
      modified_date: "2024-01-15T10:00:00Z",
      created_by: "admin",
      modified_by: "admin",
      is_active: true,
      is_deleted: false,
    },
  };

  const mockProcessPackage: ServicePackage = {
    package_id: "process-001",
    package_url: "goi-cham-soc-xe-theo-quy-trinh",
    package_name: "Gói chăm sóc xe theo quy trình",
    category_id: "cat-002",
    category_name: "Chăm sóc chuyên sâu",
    description: "Gói dịch vụ chăm sóc xe theo quy trình chuẩn với các bước được định sẵn",
    total_duration: 240,
    package_price: 1200000,
    service_cost: 800000,
    service_package_type_id: "type-002",
    service_package_type_name: "PREMIUM",
    is_active: true,
    package_services: [],
    service_process_id: "process-001",
    service_process_name: "Quy trình chăm sóc xe VIP",
    service_process_code: "VIP_CARE_PROCESS",
    is_default_process: false,
    audit: {
      created_date: "2024-01-16T09:00:00Z",
      modified_date: "2024-01-16T09:00:00Z",
      created_by: "admin",
      modified_by: "admin",
      is_active: true,
      is_deleted: false,
    },
  };

  const handleSuccess = () => {
    console.log(" Modal operation completed successfully!");
    // Ở đây bạn có thể thêm logic refresh data
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Card>
        <Title level={2}> Service Package Modal Demo</Title>
        <Paragraph>
          Đây là demo component để test ServicePackageModal với 2 loại gói dịch vụ:
        </Paragraph>
        
        <ul>
          <li><strong>Gói Combo:</strong> Kết hợp nhiều dịch vụ với giá và thời gian được tính tự động</li>
          <li><strong>Gói theo quy trình:</strong> Sử dụng quy trình chăm sóc xe có sẵn</li>
        </ul>

        <Divider />

        <Title level={4}>🎯 Các thao tác có thể test:</Title>
        
        <Space wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
            size="large"
          >
            Tạo gói dịch vụ mới
          </Button>

          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(mockComboPackage)}
            size="large"
          >
            Chỉnh sửa gói Combo
          </Button>

          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(mockProcessPackage)}
            size="large"
          >
            Chỉnh sửa gói theo quy trình
          </Button>
        </Space>

        <Divider />

        <Title level={4}>📋 Mock Data:</Title>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card title="Gói Combo" size="small">
            <Text strong>Tên:</Text> {mockComboPackage.package_name}<br />
            <Text strong>Loại:</Text> Combo ({mockComboPackage.package_services.length} dịch vụ)<br />
            <Text strong>Thời gian:</Text> {mockComboPackage.total_duration} phút<br />
            <Text strong>Giá:</Text> {mockComboPackage.package_price.toLocaleString()} VND
          </Card>
          
          <Card title="Gói theo quy trình" size="small">
            <Text strong>Tên:</Text> {mockProcessPackage.package_name}<br />
            <Text strong>Loại:</Text> Process ({mockProcessPackage.service_process_name})<br />
            <Text strong>Thời gian:</Text> {mockProcessPackage.total_duration} phút<br />
            <Text strong>Giá:</Text> {mockProcessPackage.package_price.toLocaleString()} VND
          </Card>
        </div>

        <Divider />

        <Title level={4}>🔧 Tính năng cần test:</Title>
        <ul>
          <li>✅ Chuyển đổi giữa 2 loại gói dịch vụ</li>
          <li>✅ Validation form đầy đủ</li>
          <li>✅ Tự động tính giá và thời gian cho gói Combo</li>
          <li>✅ Chọn quy trình cho gói Process</li>
          <li>✅ Load dữ liệu từ API</li>
          <li>✅ Tạo mới và chỉnh sửa</li>
          <li>✅ Responsive design</li>
        </ul>
      </Card>

      <ServicePackageModal
        visible={visible}
        mode={mode}
        editData={editData}
        onCancel={closeModal}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default ServicePackageModalDemo;
