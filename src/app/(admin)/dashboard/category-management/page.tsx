"use client";

import React, { useState } from "react";
import { Typography, Breadcrumb, Tabs } from "antd";
import { HomeOutlined, AppstoreOutlined } from "@ant-design/icons";
import {
  CategoryTreeTable,
  CategoryModal,
} from "@/components/ui/CategoryManagement";
import { Category } from "@/lib/api/types/category.types";

const { Title } = Typography;

const CategoryManagementPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [parentCategory, setParentCategory] = useState<Category | null>(null);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setParentCategory(null);
    setModalMode("edit");
    setModalVisible(true);
  };

  const handleAddSubCategory = (parent: Category) => {
    setSelectedCategory(null);
    setParentCategory(parent);
    setModalMode("create");
    setModalVisible(true);
  };

  const handleAddRootCategory = () => {
    setSelectedCategory(null);
    setParentCategory(null);
    setModalMode("create");
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedCategory(null);
    setParentCategory(null);
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title
          level={2}
          style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}
        >
          <AppstoreOutlined />
          Quản lý danh mục hệ thống
        </Title>
        <Typography.Text type="secondary">
          Quản lý danh mục sản phẩm và dịch vụ với cấu trúc phân cấp
        </Typography.Text>
      </div>

      {/* Tabs for different views */}
      <Tabs
        defaultActiveKey="management"
        items={[
          {
            key: "management",
            label: "Quản lý danh mục",
            icon: <AppstoreOutlined />,
            children: (
              <>
                {/* Category Tree Table */}
                <CategoryTreeTable
                  onEdit={handleEdit}
                  onAddSubCategory={handleAddSubCategory}
                  onAddRootCategory={handleAddRootCategory}
                />

                {/* Category Modal */}
                <CategoryModal
                  visible={modalVisible}
                  onCancel={handleModalCancel}
                  category={selectedCategory}
                  parentCategory={parentCategory}
                  mode={modalMode}
                />
              </>
            ),
          },
        ]}
      />
    </div>
  );
};

export default CategoryManagementPage;
