"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Spin,
  message,
} from "antd";
import { VehicleType } from "@/lib/api/types";
import { VehicleService } from "@/lib/api/services/vehicle.service";

interface VehicleTypeDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  typeId: string | null;
}

const VehicleTypeDetailModal: React.FC<VehicleTypeDetailModalProps> = ({
  visible,
  onCancel,
  typeId,
}) => {
  const [type, setType] = useState<VehicleType | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTypeDetails = useCallback(async () => {
    if (!typeId) return;

    setLoading(true);
    try {
      const fetchedType = await VehicleService.getVehicleTypeById(typeId);
      setType(fetchedType);
    } catch (error) {
      console.error("Failed to fetch vehicle type details:", error);
      message.error("Không thể tải thông tin loại xe");
    } finally {
      setLoading(false);
    }
  }, [typeId]);

  useEffect(() => {
    if (visible && typeId) {
      fetchTypeDetails();
    }
  }, [visible, typeId, fetchTypeDetails]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  return (
    <Modal
      title="Chi tiết loại xe"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Spin spinning={loading}>
        {type && (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Tên loại xe">
              {type.type_name}
            </Descriptions.Item>
            <Descriptions.Item label="Mã loại xe">
              {type.type_code}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {type.description || "Không có mô tả"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={type.is_active ? "green" : "red"}>
                {type.is_active ? "Hoạt động" : "Không hoạt động"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái xóa">
              <Tag color={type.is_deleted ? "red" : "green"}>
                {type.is_deleted ? "Đã xóa" : "Chưa xóa"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo">
              {type.created_by}
            </Descriptions.Item>
            <Descriptions.Item label="Người sửa">
              {type.modified_by}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {formatDate(type.created_date)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sửa">
              {formatDate(type.modified_date)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Spin>
    </Modal>
  );
};

export default VehicleTypeDetailModal;