"use client";
import React, { useState } from "react";
import { Button, Space, Tag, Popconfirm, Switch } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { AdminTable } from "@/components/ui/Table";
import { ProductTypeModal } from "@/components/ui/Modal/ProductTypeModals";
import { useProductTypes, useUpdateProductTypeStatus, useDeleteProductType } from "@/lib/api/hooks/useProductManagement";
import { ProductType } from "@/lib/api/types/product.types";

const ProductTypesPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProductType, setEditingProductType] = useState<ProductType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: productTypesData, isLoading, refetch } = useProductTypes({
    page: currentPage - 1,
    size: pageSize,
    sort: "createdDate",
    direction: "DESC",
  });

  const updateStatusMutation = useUpdateProductTypeStatus();
  const deleteMutation = useDeleteProductType();

  const handleAdd = () => {
    setEditingProductType(null);
    setModalOpen(true);
  };

  const handleEdit = (record: ProductType) => {
    setEditingProductType(record);
    setModalOpen(true);
  };

  const handleStatusChange = async (record: ProductType, checked: boolean) => {
    try {
      await updateStatusMutation.mutateAsync({
        productTypeId: record.productTypeId,
        isActive: checked,
      });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDelete = async (record: ProductType) => {
    try {
      await deleteMutation.mutateAsync(record.productTypeId);
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const columns = [
    {
      title: "Mã loại",
      dataIndex: "productTypeCode",
      key: "productTypeCode",
      width: 120,
    },
    {
      title: "Tên loại sản phẩm",
      dataIndex: "productTypeName",
      key: "productTypeName",
      ellipsis: true,
    },
    {
      title: "Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
      width: 150,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text: string) => text || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      align: "center" as const,
      render: (isActive: boolean, record: ProductType) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleStatusChange(record, checked)}
          loading={updateStatusMutation.isPending}
        />
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
  ];

  const actions = [
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <EditOutlined />,
      onClick: handleEdit,
    },
    {
      key: "delete",
      label: "Xóa",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: handleDelete,
      confirm: {
        title: "Xác nhận xóa",
        description: "Bạn có chắc chắn muốn xóa loại sản phẩm này?",
      },
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý loại sản phẩm</h1>
            <p className="text-gray-600 mt-1">Quản lý các loại sản phẩm trong hệ thống</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            Thêm loại sản phẩm
          </Button>
        </div>
      </div>

      <AdminTable
        dataSource={productTypesData?.data?.content || []}
        columns={columns}
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: productTypesData?.data?.totalElements || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} loại sản phẩm`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size || 10);
          },
        }}
        actions={actions}
        rowKey="productTypeId"
      />

      <ProductTypeModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingProductType(null);
        }}
        onSuccess={() => {
          setModalOpen(false);
          setEditingProductType(null);
          refetch();
        }}
        initialData={editingProductType}
      />
    </div>
  );
};

export default ProductTypesPage;
