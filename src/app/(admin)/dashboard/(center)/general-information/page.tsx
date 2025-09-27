"use client";
import React, { useState, useEffect } from "react";
import { Button, Spin, Alert, App } from "antd";
import { CenterInfoDisplay, CenterInfoForm } from "@/components/ui/CenterInfo";
import { useCenters } from "@/lib/api/hooks/useCenters";

const GeneralInformationPage = () => {
  const { centers, loading, error, refreshCenters } = useCenters({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { message } = App.useApp();

  // Get the first center (assuming single center for now)
  const centerInfo = centers.length > 0 ? centers[0] : null;

  // Debug: Log centers data changes
  useEffect(() => {
    console.log("Centers data changed:", centers);
    if (centers.length > 0) {
      console.log("Current center info:", centers[0]);
    }
  }, [centers]);

  const handleEdit = () => {
    setEditModalOpen(true);
  };

  const handleEditOk = async () => {
    if (!centerInfo) return;

    try {
      // The API call is now handled inside the CenterInfoForm component
      // We just need to refresh data first, then close modal and show success message

      // Refresh data from API to get updated information
      console.log("Refreshing centers data...");
      await refreshCenters();
      console.log("Centers data refreshed successfully");

      // Force re-render by updating refresh key
      setRefreshKey((prev) => prev + 1);

      // Close modal after data is refreshed
      setEditModalOpen(false);

      message.success("Cập nhật thông tin trung tâm thành công!");
    } catch (error: unknown) {
      console.error("Error in handleEditOk:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi cập nhật thông tin!";
      message.error(errorMessage);
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
    <App>
      <div key={refreshKey}>
        {/* Hiển thị thông tin trung tâm */}
        <CenterInfoDisplay centerInfo={centerInfo} onEdit={handleEdit} />

        {/* Modal chỉnh sửa thông tin */}
        <CenterInfoForm
          open={editModalOpen}
          onCancel={handleEditCancel}
          onOk={handleEditOk}
          initialData={centerInfo}
        />
      </div>
    </App>
  );
};

export default GeneralInformationPage;
