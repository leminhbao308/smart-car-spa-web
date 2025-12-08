"use client";
import React, {useState, useMemo} from "react";
import {AdminTable} from "@/components/ui/Table";
import {
  useConfirmationModalContext,
  CreateVehicleProfileModal,
  VehicleProfileDetailModal,
  EditVehicleProfileModal,
} from "@/components/ui/Modal";
import {ColumnsType} from "antd/es/table";
import {Tag, message} from "antd";
import {PhoneOutlined} from "@ant-design/icons";
import {
  vehicleTypes,
  vehicleStatuses,
} from "@/components/utils/data/car-profiles.data";
import {useVehicleProfiles} from "@/lib/api/hooks/useVehicleProfiles";
import {
  VehicleProfileDisplay,
  CreateVehicleProfileRequest,
  UpdateVehicleProfileRequest,
} from "@/lib/api/types/vehicle-profile.types";
import {useVehicleProfileReload} from "@/hooks/useWebSocket";

const CarProfilesPage = () => {
  const {showModal} = useConfirmationModalContext();

  // Memoize initial params to prevent unnecessary re-renders
  const initialParams = useMemo(
    () => ({
      page: 0,
      size: 10,
      direction: "DESC" as const,
      sort: "createdDate",
    }),
    []
  );

  // Use custom hook for API data management
  const {
    profiles,
    loading,
    pagination,
    refreshProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
  } = useVehicleProfiles({params: initialParams});

  // Modal states
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedData, setSelectedData] =
    useState<VehicleProfileDisplay | null>(null);
  const [editData, setEditData] = useState<VehicleProfileDisplay | null>(null);

  // WebSocket: Subscribe to vehicle profile reload notifications for realtime updates
  // MỤC ĐÍCH: Tự động reload danh sách xe khi có thay đổi từ backend (tạo/cập nhật/xóa)
  // LÝ DO: Khi member hoặc admin khác tạo/cập nhật/xóa xe, page này sẽ tự động cập nhật
  useVehicleProfileReload(() => {
    console.log('[CarProfilesPage] WebSocket: Reloading vehicle profiles due to notification...');
    refreshProfiles();
  });

  // Định nghĩa columns
  const columns: ColumnsType<VehicleProfileDisplay> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, record: VehicleProfileDisplay, index: number) => (
        <span
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#666",
          }}
        >
          {index + 1}
        </span>
      ),
    },
    {
      title: "Biển số",
      dataIndex: "license_plate",
      key: "license_plate",
      width: 120,
      render: (plate: string) => (
        <span
          style={{
            fontFamily: "monospace",
            fontWeight: 600,
            fontSize: 14,
            color: "#1890ff",
          }}
        >
          {plate}
        </span>
      ),
    },
    {
      title: "Thông tin xe",
      key: "vehicleInfo",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{fontWeight: 500, fontSize: 14, marginBottom: 4}}>
            {record.brand_name || "Chưa cập nhật"} {record.model_name || ""}
          </div>
          <div style={{fontSize: 12, color: "#666", marginBottom: 2}}>
            Loại: {record.type_name || "Chưa cập nhật"}
          </div>
          <div style={{fontSize: 12, color: "#666"}}>
            {record.color || "Chưa cập nhật"} •{" "}
            {record.engine_capacity || "Chưa cập nhật"}
          </div>
        </div>
      ),
    },
    {
      title: "Loại xe",
      dataIndex: "type_name",
      key: "type_name",
      width: 100,
      render: (type: string) => {
        const typeConfig = vehicleTypes.find((t) => t.label === type);
        return (
          <Tag color={typeConfig?.color} icon={typeConfig?.icon}>
            {type || "Chưa cập nhật"}
          </Tag>
        );
      },
    },
    {
      title: "Số km",
      dataIndex: "distance_traveled",
      key: "distance_traveled",
      width: 100,
      sorter: (a, b) => a.distance_traveled - b.distance_traveled,
      render: (distance: number) => (
        <span style={{fontWeight: 500}}>{distance.toLocaleString()} km</span>
      ),
    },
    {
      title: "Chủ xe",
      key: "owner",
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{fontWeight: 500, fontSize: 13}}>
            {record.owner_name || "Chưa cập nhật"}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#666",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <PhoneOutlined style={{fontSize: 10}}/>
            {record.owner_phone || "Chưa cập nhật"}
          </div>
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 150,
      render: (description: string) => (
        <div style={{fontSize: 12, color: "#666"}}>
          {description || "Chưa có mô tả"}
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_date",
      key: "created_date",
      width: 120,
      sorter: (a, b) =>
        new Date(a.created_date).getTime() - new Date(b.created_date).getTime(),
      render: (date: string) => (
        <div style={{fontSize: 12}}>
          {new Date(date).toLocaleDateString("vi-VN")}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      width: 100,
      render: (isActive: boolean) => {
        const status = isActive ? "active" : "inactive";
        const statusConfig = vehicleStatuses.find((s) => s.value === status);
        return <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>;
      },
    },
  ];

  // Handlers
  const handleAdd = () => {
    setCreateModalVisible(true);
  };

  const handleEdit = (record: VehicleProfileDisplay) => {
    setEditData(record);
    setEditModalVisible(true);
  };

  const handleView = (record: VehicleProfileDisplay) => {
    setSelectedData(record);
    setDetailModalVisible(true);
  };

  // Modal success handlers
  const handleCreateModalSuccess = async (
    data: CreateVehicleProfileRequest
  ) => {
    try {
      await createProfile(data);
      message.success("Thêm hồ sơ xe thành công");
      setCreateModalVisible(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi thêm hồ sơ xe";
      message.error(errorMessage);
    }
  };

  const handleEditModalSuccess = async (data: UpdateVehicleProfileRequest) => {
    try {
      if (editData) {
        await updateProfile(editData.vehicle_id, data);
        message.success("Cập nhật hồ sơ xe thành công");
        setEditModalVisible(false);
        setEditData(null);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi cập nhật hồ sơ xe";
      message.error(errorMessage);
    }
  };

  const handleDelete = async (record: VehicleProfileDisplay) => {
    showModal({
      title: "Xác nhận xóa hồ sơ xe",
      content: `Bạn có chắc chắn muốn xóa hồ sơ xe "${record.license_plate}"? Hành động này không thể hoàn tác.`,
      type: "confirm",
      confirmText: "Xóa",
      cancelText: "Hủy",
      onConfirm: async () => {
        try {
          await deleteProfile(record.vehicle_id);
          message.success("Xóa hồ sơ xe thành công");
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Có lỗi xảy ra khi xóa hồ sơ xe";
          message.error(errorMessage);
        }
      },
    });
  };

  return (
    <div>
      <AdminTable
        title="Quản lý hồ sơ xe"
        dataSource={profiles}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        addButtonText="Thêm hồ sơ xe"
        pagination={{
          current: pagination.page + 1, // API uses 0-based pagination
          pageSize: pagination.size,
          total: pagination.total_elements,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} hồ sơ xe`,
          onChange: () => {
            refreshProfiles();
          },
          onShowSizeChange: () => {
            refreshProfiles();
          },
        }}
        actions={[
          {
            key: "delete",
            label: "Xóa",
            type: "default",
            danger: true,
            onClick: handleDelete,
          },
        ]}
        searchable={true}
        searchPlaceholder="Tìm kiếm hồ sơ xe theo biển số, chủ xe, hãng xe..."
        searchFields={["license_plate", "description", "vehicle_id"]}
        scroll={{x: 1600}}
      />

      {/* Modals */}
      <CreateVehicleProfileModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={handleCreateModalSuccess}
        loading={loading}
      />

      {/* New Vehicle Profile Modals */}
      <VehicleProfileDetailModal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        onEdit={handleEdit}
        profile={selectedData}
        loading={loading}
      />

      <EditVehicleProfileModal
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditModalSuccess}
        profile={editData}
        loading={loading}
      />
    </div>
  );
};

export default CarProfilesPage;
