"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Spin,
  Button,
  Row,
  Col,
  Empty,
  App,
} from "antd";
import {
  CarOutlined,
  PlusOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/lib/api/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useVehicleProfiles } from "@/lib/api/hooks/useVehicleProfiles";
import { VehicleProfileDisplay } from "@/lib/api/types/vehicle-profile.types";
import CreateVehicleProfileModal from "@/components/ui/Modal/CarProfileModal/CreateVehicleProfileModal";
import EditVehicleProfileModal from "@/components/ui/Modal/CarProfileModal/EditVehicleProfileModal";

const { Title, Text } = Typography;

const VehiclePage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { message } = App.useApp();
  const [createVehicleModalVisible, setCreateVehicleModalVisible] =
    useState(false);
  const [isCreatingVehicle, setIsCreatingVehicle] = useState(false);
  const [editVehicleModalVisible, setEditVehicleModalVisible] =
    useState(false);
  const [editingVehicle, setEditingVehicle] =
    useState<VehicleProfileDisplay | null>(null);

  // Load vehicles for current user
  const {
    profiles: userVehicles,
    loading: isLoadingVehicles,
    createProfile: createVehicleProfile,
    updateProfile: updateVehicleProfile,
    deleteProfile: deleteVehicleProfile,
    refreshProfiles,
  } = useVehicleProfiles({
    ownerId: user?.user_id,
    params: { size: 1000 },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Handle add vehicle modal
  const handleAddVehicle = () => {
    setCreateVehicleModalVisible(true);
  };

  const handleCreateVehicleSuccess = async (vehicleData: {
    license_plate: string;
    description?: string;
    vehicle_brand_id: string;
    vehicle_type_id: string;
    vehicle_model_id: string;
    owner_id: string;
    distance_traveled: number;
  }) => {
    if (!user?.user_id) return;

    setIsCreatingVehicle(true);
    try {
      const createData = {
        ...vehicleData,
        owner_id: user.user_id,
      };

      await createVehicleProfile(createData);
      message.success("Thêm xe thành công!");
      setCreateVehicleModalVisible(false);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      message.error("Có lỗi xảy ra khi tạo xe mới!");
    } finally {
      setIsCreatingVehicle(false);
    }
  };

  const handleCreateVehicleCancel = () => {
    setCreateVehicleModalVisible(false);
  };

  const handleEditVehicle = (vehicle: VehicleProfileDisplay) => {
    setEditingVehicle(vehicle);
    setEditVehicleModalVisible(true);
  };

  const handleEditVehicleSuccess = async (vehicleData: VehicleProfileDisplay) => {
    try {
      // Refresh the list after successful update
      await refreshProfiles();
      message.success("Cập nhật xe thành công!");
      setEditVehicleModalVisible(false);
      setEditingVehicle(null);
    } catch (error) {
      console.error("Error refreshing vehicle list:", error);
      message.error("Có lỗi xảy ra khi cập nhật danh sách xe!");
    }
  };

  const handleEditVehicleCancel = () => {
    setEditVehicleModalVisible(false);
    setEditingVehicle(null);
  };

  // const handleBookService = (vehicle: VehicleProfileDisplay) => {
  //   // Navigate to booking page with pre-selected vehicle
  //   router.push(`/member/booking?vehicleId=${vehicle.vehicle_id}`);
  // };

  if (authLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải thông tin...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <App>
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        <Card>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <Title level={2}>Quản lý xe của bạn</Title>
            <p>
              Chào mừng {user.full_name}, đây là trang quản lý thông tin xe của
              bạn
            </p>
          </div>

          {/* Thông tin chủ xe */}
          <Card
            size="small"
            title="Thông tin chủ xe"
            style={{
              marginBottom: 16,
              backgroundColor: "#fff",
              border: "1px solid #e8e8e8",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            }}
          >
            <div style={{ color: "#262626" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ color: "#1890ff", fontSize: "24px" }}>👤</span>
                </div>
                <div>
                  <Title level={4} style={{ margin: 0, color: "#262626" }}>
                    {user.full_name}
                  </Title>
                  <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                    Chủ xe
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    border: "1px solid #e8e8e8",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "4px",
                    }}
                  >
                    📞 Số điện thoại
                  </div>
                  <div
                    style={{
                      color: "#262626",
                      fontWeight: "500",
                      fontSize: "16px",
                    }}
                  >
                    {user.phone_number}
                  </div>
                </div>

                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    border: "1px solid #e8e8e8",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "4px",
                    }}
                  >
                    ✉️ Email
                  </div>
                  <div
                    style={{
                      color: "#262626",
                      fontWeight: "500",
                      fontSize: "16px",
                    }}
                  >
                    {user.email}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Danh sách xe */}
          <Card
            size="small"
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <span>Danh sách xe của bạn ({userVehicles.length})</span>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddVehicle}
                  loading={isCreatingVehicle}
                  size="small"
                  style={{ marginLeft: "16px" }}
                >
                  Thêm xe mới
                </Button>
              </div>
            }
            style={{ marginBottom: 16 }}
            styles={{
              header: {
                padding: "16px 24px",
                borderBottom: "1px solid #f0f0f0",
              },
            }}
          >
            {isLoadingVehicles ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Spin size="large" />
                <div style={{ marginTop: "16px" }}>
                  Đang tải danh sách xe...
                </div>
              </div>
            ) : userVehicles.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Bạn chưa có xe nào trong hệ thống"
                style={{ padding: "40px" }}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddVehicle}
                >
                  Thêm xe đầu tiên
                </Button>
              </Empty>
            ) : (
              <Row gutter={[16, 16]}>
                {userVehicles.map((vehicle: VehicleProfileDisplay) => (
                  <Col xs={24} sm={12} lg={8} key={vehicle.vehicle_id}>
                    <Card
                      hoverable
                      style={{
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                      styles={{
                        body: {
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                        },
                      }}
                      actions={[
                        <Button
                          key="edit"
                          icon={<EditOutlined />}
                          onClick={() => handleEditVehicle(vehicle)}
                        >
                          Sửa
                        </Button>,
                      ]}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{ textAlign: "center", marginBottom: "16px" }}
                        >
                          <CarOutlined
                            style={{
                              fontSize: "48px",
                              color: "#1890ff",
                              marginBottom: "12px",
                            }}
                          />
                          <Title
                            level={4}
                            style={{ margin: 0, color: "#262626" }}
                          >
                            {vehicle.license_plate}
                          </Title>
                        </div>

                        <div style={{ marginBottom: "12px" }}>
                          <Row gutter={[8, 8]}>
                            <Col span={12}>
                              <Text type="secondary" style={{ fontSize: "12px" }}>
                                Hãng xe:
                              </Text>
                              <div style={{ fontWeight: 500 }}>
                                {vehicle.brand_name || "Chưa cập nhật"}
                              </div>
                            </Col>
                            <Col span={12}>
                              <Text type="secondary" style={{ fontSize: "12px" }}>
                                Dòng xe:
                              </Text>
                              <div style={{ fontWeight: 500 }}>
                                {vehicle.model_name || "Chưa cập nhật"}
                              </div>
                            </Col>
                            <Col span={12}>
                              <Text type="secondary" style={{ fontSize: "12px" }}>
                                Loại xe:
                              </Text>
                              <div style={{ fontWeight: 500 }}>
                                {vehicle.type_name || "Chưa cập nhật"}
                              </div>
                            </Col>
                            <Col span={12}>
                              <Text type="secondary" style={{ fontSize: "12px" }}>
                                Số km:
                              </Text>
                              <div style={{ fontWeight: 500 }}>
                                {vehicle.distance_traveled?.toLocaleString() || 0}{" "}
                                km
                              </div>
                            </Col>
                          </Row>
                        </div>

                        {vehicle.description && (
                          <div style={{ marginBottom: "12px" }}>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              Mô tả:
                            </Text>
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              {vehicle.description}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </Card>

        {/* Create Vehicle Modal */}
        <CreateVehicleProfileModal
          ownerId={user?.user_id}
          visible={createVehicleModalVisible}
          onCancel={handleCreateVehicleCancel}
          onSuccess={handleCreateVehicleSuccess}
          loading={isCreatingVehicle}
        />

        {/* Edit Vehicle Modal */}
        <EditVehicleProfileModal
          ownerId={user?.user_id}
          visible={editVehicleModalVisible}
          onCancel={handleEditVehicleCancel}
          onSuccess={handleEditVehicleSuccess}
          profile={editingVehicle}
          loading={isCreatingVehicle}
        />
      </div>
    </App>
  );
};

export default VehiclePage;
