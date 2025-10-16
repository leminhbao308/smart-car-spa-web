"use client";
import React from "react";
import { Modal, Descriptions, Tag, Space, Button } from "antd";
import { ProductAttribute } from "@/lib/api/types/product.types";
import { CloseOutlined } from "@ant-design/icons";

interface ProductAttributeDetailModalProps {
  open: boolean;
  onCancel: () => void;
  productAttribute: ProductAttribute | null;
}

const ProductAttributeDetailModal: React.FC<ProductAttributeDetailModalProps> = ({
  open,
  onCancel,
  productAttribute,
}) => {

  if (!productAttribute) {
    return null;
  }

  const getDataTypeColor = (dataType: string) => {
    const colors: Record<string, string> = {
      STRING: "blue",
      NUMBER: "green",
      BOOLEAN: "orange",
      DATE: "purple",
      DECIMAL: "cyan",
      INTEGER: "lime",
      TEXT: "magenta",
    };
    return colors[dataType] || "default";
  };

  const getDataTypeLabel = (dataType: string) => {
    const labels: Record<string, string> = {
      STRING: "Chuỗi",
      NUMBER: "Số",
      BOOLEAN: "Boolean",
      DATE: "Ngày",
      DECIMAL: "Thập phân",
      INTEGER: "Số nguyên",
      TEXT: "Văn bản",
    };
    return labels[dataType] || dataType;
  };

  return (
    <Modal
      title={
        <Space>
          <span>Chi tiết thuộc tính sản phẩm</span>
          <Tag color="blue">{productAttribute.attribute_code}</Tag>
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
        <Descriptions.Item label="Tên thuộc tính" span={2}>
          <strong>{productAttribute.attribute_name}</strong>
        </Descriptions.Item>

        <Descriptions.Item label="Mã thuộc tính">
          <Tag color="blue">{productAttribute.attribute_code}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Trạng thái">
          <Tag color={productAttribute.is_active ? "green" : "red"}>
            {productAttribute.is_active ? "Hoạt động" : "Tạm dừng"}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Loại dữ liệu">
          <Tag color={getDataTypeColor(productAttribute.data_type)}>
            {getDataTypeLabel(productAttribute.data_type)}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Bắt buộc">
          <Tag color={productAttribute.is_required ? "red" : "default"}>
            {productAttribute.is_required ? "Bắt buộc" : "Tùy chọn"}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Đơn vị" span={2}>
          {productAttribute.unit || (
            <span style={{ color: "#999", fontStyle: "italic" }}>
              Không có đơn vị
            </span>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Tên hiển thị" span={2}>
          {productAttribute.display_name || (
            <span style={{ color: "#999", fontStyle: "italic" }}>
              Không có tên hiển thị
            </span>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày tạo">
          {new Date(productAttribute.created_date).toLocaleString("vi-VN")}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày cập nhật">
          {new Date(productAttribute.modified_date).toLocaleString("vi-VN")}
        </Descriptions.Item>

        <Descriptions.Item label="Người tạo">
          {productAttribute.created_by}
        </Descriptions.Item>

        <Descriptions.Item label="Người cập nhật">
          {productAttribute.modified_by}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export { ProductAttributeDetailModal };
