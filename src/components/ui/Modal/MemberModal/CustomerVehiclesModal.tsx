"use client";
import React, {useState, useEffect, useMemo} from "react";
import {
  Modal,
  Table,
  Tag,
  Avatar,
  Typography,
  Button,
  Select,
  Card,
  Badge,
  message, App,
} from "antd";
import {CarOutlined, SearchOutlined, PhoneOutlined} from "@ant-design/icons";
import {ColumnsType} from "antd/es/table";
import {MemoizedInput} from "@/components/ui/MemoizedComponents";
import {UserManagementInfo} from "@/lib/api/types";
import {
  useConfirmationModalContext,
  CreateVehicleProfileModal,
  VehicleProfileDetailModal,
  EditVehicleProfileModal,
} from "@/components/ui/Modal";
import {useVehicleProfiles} from "@/lib/api/hooks/useVehicleProfiles";
import {
  VehicleProfileDisplay,
  CreateVehicleProfileRequest,
  UpdateVehicleProfileRequest,
} from "@/lib/api/types/vehicle-profile.types";
import {
  vehicleTypes,
  vehicleStatuses,
} from "@/components/utils/data/car-profiles.data";
import {useVehicleBrandsDropdown} from "@/lib/api/hooks/useVehicleBrands";
import {useVehicleModelsDropdown} from "@/lib/api/hooks/useVehicleModels";
import {useVehicleTypesDropdown} from "@/lib/api/hooks/useVehicleTypes";
import {useVehicleProfileReload} from "@/hooks/useWebSocket";

const {Text} = Typography;
const {Option} = Select;

interface CustomerVehiclesModalProps {
  visible: boolean;
  onCancel: () => void;
  customerData: UserManagementInfo | null;
}

const CustomerVehiclesModal: React.FC<CustomerVehiclesModalProps> = ({
                                                                       visible,
                                                                       onCancel,
                                                                       customerData,
                                                                     }) => {
  // Ant Design props
  const {message} = App.useApp();
  const {showModal} = useConfirmationModalContext();

  // Memoize initial params
  const initialParams = useMemo(
    () => ({
      page: 0,
      size: 10,
      direction: "DESC" as const,
      sort: "createdDate",
      // Filter by customer if needed - add customerId filter to your API hook
      customerId: customerData?.user_id
    }),
    [customerData]
  );

  // Use the same hook as the main page
  const {
    profiles,
    loading,
    pagination,
    refreshProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
  } = useVehicleProfiles({ownerId: customerData?.user_id, params: initialParams});

  // Load dropdown data for filters
  const {dropdownData: brandsDropdown, loading: brandsLoading} = useVehicleBrandsDropdown();
  const {dropdownData: modelsDropdown, loading: modelsLoading} = useVehicleModelsDropdown();
  const {dropdownData: typesDropdown, loading: typesLoading} = useVehicleTypesDropdown();

  // Modal states
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedData, setSelectedData] =
    useState<VehicleProfileDisplay | null>(null);
  const [editData, setEditData] = useState<VehicleProfileDisplay | null>(null);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const refreshData = async () => {
    if (visible && customerData) {
      await refreshProfiles();
    }
  };

  // Refresh data when modal opens
  useEffect(() => {
    refreshData();
  }, [visible, customerData]);

  // WebSocket: Subscribe to vehicle profile reload notifications for realtime updates
  // MỤC ĐÍCH: Tự động reload danh sách xe khi có thay đổi từ backend (tạo/cập nhật/xóa)
  // LÝ DO: Khi admin hoặc member tạo/cập nhật/xóa xe, modal này sẽ tự động cập nhật
  useVehicleProfileReload(() => {
    if (visible && customerData) {
      console.log('[CustomerVehiclesModal] WebSocket: Reloading vehicle profiles due to notification...');
      refreshData();
    }
  });

  // Columns definition
  const columns: ColumnsType<VehicleProfileDisplay> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, record, index) => (
        <span style={{fontSize: "14px", fontWeight: 500, color: "#666"}}>
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
        <Tag
          color="blue"
          style={{fontFamily: "monospace", fontWeight: 600, fontSize: 14}}
        >
          {plate}
        </Tag>
      ),
    },
    {
      title: "Thông tin xe",
      key: "vehicleInfo",
      width: 200,
      render: (_, record) => (
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
          <Avatar
            size="small"
            style={{backgroundColor: "#1890ff"}}
            icon={<CarOutlined/>}
          />
          <div>
            <div style={{fontWeight: 500, fontSize: 14}}>
              {record.brand_name || "Chưa cập nhật"} {record.model_name || ""}
            </div>
            <div style={{fontSize: 12, color: "#666"}}>
              Loại: {record.type_name || "Chưa cập nhật"}
            </div>
            <div style={{fontSize: 12, color: "#666"}}>
              {record.color || "Chưa cập nhật"} • {record.engine_capacity || "Chưa cập nhật"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Loại xe",
      dataIndex: "type_name",
      key: "type_name",
      width: 120,
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
        <span style={{fontWeight: 500}}>
          {distance?.toLocaleString() || 0} km
        </span>
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
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <div style={{display: "flex", gap: 8}}>
          <Button type="link" size="small" onClick={() => handleView(record)}>
            Xem
          </Button>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </div>
      ),
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

  // Filter data
  const filteredVehicles = profiles.filter((vehicle) => {
    const matchesSearch =
      vehicle.license_plate?.toLowerCase().includes(searchText.toLowerCase()) ||
      vehicle.brand_name?.toLowerCase().includes(searchText.toLowerCase()) || // Chỉ có vehicle.vehicle_brand_id
      vehicle.model_name?.toLowerCase().includes(searchText.toLowerCase()) || // Chỉ có vehicle.vehicle_model_id
      vehicle.owner_name?.toLowerCase().includes(searchText.toLowerCase()); // Chỉ có vehicle.owner_id

    const matchesBrand =
      brandFilter === "all" || vehicle.vehicle_brand_id === brandFilter;

    const matchesType =
      typeFilter === "all" || vehicle.vehicle_type_id === typeFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && vehicle.is_active) ||
      (statusFilter === "inactive" && !vehicle.is_active);

    return matchesSearch && matchesBrand && matchesType && matchesStatus;
  });

  if (!customerData) return null;

  return (
    <>
      <Modal
        title={
          <Card size="small" style={{marginBottom: 16}}>
            <div style={{display: "flex", alignItems: "center", gap: 16}}>
              <div style={{display: "flex", alignItems: "center", gap: 8}}>
                <CarOutlined style={{color: "#1890ff"}}/>
                <Text>Khách hàng:</Text>
                <Text strong>{customerData.full_name}</Text>
              </div>
              <div style={{display: "flex", alignItems: "center", gap: 8}}>
                <Text>Tổng số xe:</Text>
                <Badge
                  count={filteredVehicles.length}
                  style={{
                    backgroundColor:
                      filteredVehicles.length > 0 ? "#52c41a" : "#d9d9d9",
                  }}
                />
              </div>
            </div>
          </Card>
        }
        open={visible}
        onCancel={onCancel}
        closable={false}
        width={1600}
        footer={[
          <Button key="close" onClick={onCancel}>
            Đóng
          </Button>,
        ]}
      >
        <div style={{marginBottom: 16}}>
          <div
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <MemoizedInput
              placeholder="Tìm kiếm theo biển số, hãng xe, chủ xe..."
              prefix={<SearchOutlined/>}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{width: 300}}
            />

            <Select
              placeholder="Lọc theo hãng xe"
              value={brandFilter}
              onChange={setBrandFilter}
              style={{width: 150}}
              loading={brandsLoading}
            >
              <Option value="all">Tất cả hãng</Option>
              {brandsDropdown.map((brand) => (
                <Option key={brand.brand_id} value={brand.brand_id}>
                  {brand.brand_name}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Lọc theo loại xe"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{width: 150}}
              loading={typesLoading}
            >
              <Option value="all">Tất cả loại</Option>
              {typesDropdown.map((type) => (
                <Option key={type.type_id} value={type.type_id}>
                  {type.type_name}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Lọc theo trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{width: 150}}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
            </Select>

            <Button type="primary" icon={<CarOutlined/>} onClick={handleAdd}>
              Thêm xe mới
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredVehicles}
          loading={loading || brandsLoading || typesLoading || modelsLoading}
          rowKey="vehicle_id"
          size="small"
          pagination={{
            current: pagination.page + 1,
            pageSize: pagination.size,
            total: pagination.total_elements,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} xe`,
            pageSizeOptions: ["10", "20", "50"],
            onChange: () => {
              refreshProfiles();
            },
            onShowSizeChange: () => {
              refreshProfiles();
            },
          }}
          scroll={{x: 1400}}
        />
      </Modal>

      {/* Sub-modals for CRUD operations */}
      <CreateVehicleProfileModal
        ownerId={customerData.user_id}
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={handleCreateModalSuccess}
        loading={loading}
      />

      <VehicleProfileDetailModal
        visible={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedData(null);
        }}
        onEdit={(record) => {
          setEditData(record);
          setEditModalVisible(true);
        }}
        onEditSuccess={(updatedProfile) => {
          // Cập nhật selectedData với dữ liệu mới
          setSelectedData(updatedProfile);
          // Refresh toàn bộ danh sách
          refreshData();
        }}
        profile={selectedData}
        loading={loading}
        onRefresh={refreshData}
      />

      <EditVehicleProfileModal
        ownerId={customerData.user_id}
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditData(null);
        }}
        onSuccess={async (updatedProfile) => {
          try {
            message.success("Cập nhật hồ sơ xe thành công");

            // Đóng edit modal
            setEditModalVisible(false);
            setEditData(null);

            // Nếu detail modal đang mở và đang xem cùng một xe
            if (detailModalVisible && selectedData?.vehicle_id === updatedProfile.vehicle_id) {
              // Cập nhật selectedData để detail modal hiển thị dữ liệu mới
              setSelectedData(updatedProfile);
            }

            // Refresh danh sách
            await refreshData();
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Có lỗi xảy ra khi cập nhật hồ sơ xe";
            message.error(errorMessage);
          }
        }}
        profile={editData}
        loading={loading}
      />
    </>
  );
};

export default CustomerVehiclesModal;
