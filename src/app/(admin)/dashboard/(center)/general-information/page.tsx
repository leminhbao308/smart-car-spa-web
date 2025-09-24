"use client";
import React, { useState } from "react";
import { Button, Space, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { CenterInfoDisplay, CenterInfoForm } from "@/components/ui/CenterInfo";
import {
  centerInfoData,
  CenterInfo,
} from "@/components/utils/data/center-info.data";

const GeneralInformationPage = () => {
  const [centerInfo, setCenterInfo] = useState<CenterInfo>(centerInfoData);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEdit = () => {
    setEditModalOpen(true);
  };

  const handleEditOk = async (updatedCenterInfo: CenterInfo) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCenterInfo(updatedCenterInfo);
      setEditModalOpen(false);
      message.success("Cập nhật thông tin trung tâm thành công!");
    } catch {
      message.error("Có lỗi xảy ra khi cập nhật thông tin!");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
  };

  return (
    <div>
      {/* Header đơn giản */}
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          backgroundColor: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0, marginBottom: 8 }}>
              Thông tin chung trung tâm
            </h2>
            <p style={{ margin: 0, color: "#666" }}>
              Quản lý thông tin cơ bản về trung tâm chăm sóc xe hơi
            </p>
          </div>
          <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
            Chỉnh sửa
          </Button>
        </div>
      </div>

      {/* Hiển thị thông tin trung tâm */}
      <CenterInfoDisplay centerInfo={centerInfo} onEdit={handleEdit} />

      {/* Modal chỉnh sửa thông tin */}
      <CenterInfoForm
        open={editModalOpen}
        onCancel={handleEditCancel}
        onOk={handleEditOk}
        initialData={centerInfo}
        loading={loading}
      />
    </div>
  );
};

export default GeneralInformationPage;
