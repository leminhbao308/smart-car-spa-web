"use client";
import React from "react";
import { Button, Space, message } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import { ServicePackageModal, useServicePackageModal } from "./index";
import { ServicePackage } from "@/lib/api/types/service-package.types";

/**
 * Example component showing how to use ServicePackageModal
 * This can be integrated into your packages page
 */
const ServicePackageModalExample: React.FC = () => {
  const {
    visible,
    mode,
    editData,
    openCreateModal,
    openEditModal,
    closeModal,
  } = useServicePackageModal();

  // Mock data for demonstration
  const mockServicePackage: ServicePackage = {
    package_id: "1",
    package_url: "combo-cham-soc-xe",
    package_name: "Combo chăm sóc xe toàn diện",
    category_id: "1",
    category_name: "Chăm sóc xe",
    description: "Gói dịch vụ chăm sóc xe toàn diện",
    total_duration: 120,
    package_price: 500000,
    service_cost: 400000,
    service_package_type_id: "1",
    service_package_type_name: "VIP",
    is_active: true,
    package_services: [
      {
        service_id: "1",
        service_name: "Rửa xe",
        quantity: 1,
        unit_price: 100000,
        total_price: 100000,
        is_required: true,
        is_active: true,
      },
      {
        service_id: "2",
        service_name: "Đánh bóng",
        quantity: 1,
        unit_price: 200000,
        total_price: 200000,
        is_required: true,
        is_active: true,
      },
    ],
  };

  const handleSuccess = () => {
    message.success("Thao tác thành công!");
    // Here you would typically refresh your data
    console.log("Modal operation completed successfully");
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Service Package Modal Example</h2>
      <p>Đây là ví dụ về cách sử dụng ServicePackageModal</p>

      <Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
        >
          Tạo gói dịch vụ mới
        </Button>

        <Button
          icon={<EditOutlined />}
          onClick={() => openEditModal(mockServicePackage)}
        >
          Chỉnh sửa gói dịch vụ
        </Button>
      </Space>

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

export default ServicePackageModalExample;
