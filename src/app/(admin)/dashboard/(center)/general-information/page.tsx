"use client";
import React, { useState, useEffect } from "react";
import { Button, Space, message, Spin, Alert } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { CenterInfoDisplay, CenterInfoForm } from "@/components/ui/CenterInfo";
import { useCenters } from "@/lib/api/hooks/useCenters";
import { CenterDisplay } from "@/lib/api/types/center.types";

const GeneralInformationPage = () => {
  const { centers, loading, error, refreshCenters, updateCenter } = useCenters({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Get the first center (assuming single center for now)
  const centerInfo = centers.length > 0 ? centers[0] : null;

  const handleEdit = () => {
    setEditModalOpen(true);
  };

  const handleEditOk = async (updatedCenterInfo: CenterDisplay) => {
    if (!centerInfo) return;
    
    setUpdateLoading(true);
    try {
      await updateCenter(centerInfo.center_id, {
        center_name: updatedCenterInfo.center_name,
        description: updatedCenterInfo.description,
        headquarters_address: updatedCenterInfo.headquarters_address,
        headquarters_phone: updatedCenterInfo.headquarters_phone,
        headquarters_email: updatedCenterInfo.headquarters_email,
        website: updatedCenterInfo.website,
        logo_url: updatedCenterInfo.logo_url,
        operating_status: updatedCenterInfo.operating_status,
        business_hours: JSON.stringify(updatedCenterInfo.business_hours),
        contact_info: JSON.stringify(updatedCenterInfo.contact_info),
        social_media: JSON.stringify(updatedCenterInfo.social_media),
        service_areas: JSON.stringify(updatedCenterInfo.service_areas),
        is_active: updatedCenterInfo.is_active,
      });
      
      setEditModalOpen(false);
      message.success("Cập nhật thông tin trung tâm thành công!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật thông tin!";
      message.error(errorMessage);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Đang tải thông tin trung tâm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi tải dữ liệu"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={refreshCenters}>
            Thử lại
          </Button>
        }
      />
    );
  }

  if (!centerInfo) {
    return (
      <Alert
        message="Không có dữ liệu"
        description="Chưa có thông tin trung tâm nào được thiết lập."
        type="info"
        showIcon
      />
    );
  }

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
        loading={updateLoading}
      />
    </div>
  );
};

export default GeneralInformationPage;
