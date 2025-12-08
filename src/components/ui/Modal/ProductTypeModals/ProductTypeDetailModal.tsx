"use client";
import React from "react";
import { Modal, Descriptions, Tag, Space, Button } from "antd";
import { ProductType } from "@/lib/api/types/product.types";
import { CloseOutlined } from "@ant-design/icons";

interface ProductTypeDetailModalProps {
  open: boolean;
  onCancel: () => void;
  productType: ProductType | null;
}

const ProductTypeDetailModal: React.FC<ProductTypeDetailModalProps> = ({
  open,
  onCancel,
  productType,
}) => {

  if (!productType) {
    return null;
  }

  return (
    <Modal
      title={
        <Space>
          <span>Chi tiết loại sản phẩm</span>
          <Tag color="blue">{productType.product_type_code}</Tag>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="close" icon={<CloseOutlined />} onClick={onCancel}>
          Đóng
        </Button>,
      ]}
    >
      <Descriptions
        bordered
        column={2}
        size="middle"
        styles={{ label: { fontWeight: 600, backgroundColor: "#fafafa" } }}
      >
        <Descriptions.Item label="Tên loại sản phẩm" span={2}>
          <strong>{productType.product_type_name}</strong>
        </Descriptions.Item>

        <Descriptions.Item label="Mã loại sản phẩm">
          <Tag color="blue">{productType.product_type_code}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Trạng thái">
          <Tag color={productType.is_active ? "green" : "red"}>
            {productType.is_active ? "Hoạt động" : "Tạm dừng"}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Danh mục" span={2}>
          <Tag color="purple">{productType.category_name}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Mô tả" span={2}>
          {productType.description || (
            <span style={{ color: "#999", fontStyle: "italic" }}>
              Không có mô tả
            </span>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày tạo">
          {new Date(productType.created_date).toLocaleString("vi-VN")}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày cập nhật">
          {new Date(productType.modified_date).toLocaleString("vi-VN")}
        </Descriptions.Item>

        <Descriptions.Item label="Người tạo">
          {productType.created_by}
        </Descriptions.Item>

        <Descriptions.Item label="Người cập nhật">
          {productType.modified_by}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export { ProductTypeDetailModal };
