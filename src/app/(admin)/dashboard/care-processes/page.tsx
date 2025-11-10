"use client";
import React, { useState } from "react";
import {
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  message,
} from "antd";
import {
  DeleteOutlined,
  ClockCircleOutlined,
  CarOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import AdminTable, { AdminTableAction } from "@/components/ui/Table/AdminTable";
import CareProcessModal from "@/components/ui/Modal/CarProcessModal/CareProcessModal";
import CareProcessDetailModal from "@/components/ui/Modal/CarProcessModal/CareProcessDetailModal";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import {
  useServiceProcesses,
  useCreateServiceProcess,
  useUpdateServiceProcess,
} from "@/lib/api/hooks";
import {
  ServiceProcessInfoDto,
  CreateServiceProcessRequest,
  UpdateServiceProcessRequest,
} from "@/lib/api/types";

const { Text } = Typography;

const CareProcessesPage = () => {
  // API hooks
  const {
    data: serviceProcessesData,
    isLoading,
    refetch,
  } = useServiceProcesses();
  const createServiceProcessMutation = useCreateServiceProcess();
  const updateServiceProcessMutation = useUpdateServiceProcess();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] =
    useState<ServiceProcessInfoDto | null>(null);
  const [viewingProcess, setViewingProcess] =
    useState<ServiceProcessInfoDto | null>(null);
  const { showModal } = useConfirmationModalContext();

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center" as const,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Quy trình",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text: string) => (
        <Text strong style={{ fontSize: 14 }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Mã quy trình",
      dataIndex: "code",
      key: "code",
      width: 120,
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: "Thời gian",
      dataIndex: "estimated_duration",
      key: "estimated_duration",
      width: 120,
      render: (duration: number) => (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 4,
            }}
          >
            <ClockCircleOutlined style={{ marginRight: 4, color: "#1890ff" }} />
            <Text strong>{duration || 0} phút</Text>
          </div>
          <Text style={{ fontSize: 11, color: "#8c8c8c" }}>Ước tính</Text>
        </div>
      ),
    },
    {
      title: "Số bước",
      dataIndex: "step_count",
      key: "step_count",
      width: 100,
      render: (stepCount: number) => (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 4,
            }}
          >
            <CarOutlined style={{ marginRight: 4, color: "#722ed1" }} />
            <Text strong>{stepCount || 0}</Text>
          </div>
          <Text style={{ fontSize: 11, color: "#8c8c8c" }}>bước</Text>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      width: 150,
      render: (isActive: boolean, record: ServiceProcessInfoDto) => (
        <div style={{ textAlign: "center" }}>
          {record.is_deleted ? (
            <Tag color="red" icon={<DeleteOutlined />}>
              Đã xóa
            </Tag>
          ) : isActive ? (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              Hoạt động
            </Tag>
          ) : (
            <Tag color="orange" icon={<PauseCircleOutlined />}>
              Tạm dừng
            </Tag>
          )}
        </div>
      ),
    },
  ];

  // Actions cho AdminTable
  const actions: AdminTableAction[] = [
    {
      key: "toggle-status",
      label: (record: ServiceProcessInfoDto) =>
        record.is_active ? "Tạm dừng" : "Kích hoạt",
      type: "default" as const,
      danger: (record: ServiceProcessInfoDto) => !!record.is_active,
      condition: (record: ServiceProcessInfoDto) => !record.is_deleted,
      onClick: (record: ServiceProcessInfoDto) => {
        const isActivating = !record.is_active;
        showModal({
          title: isActivating ? "Xác nhận kích hoạt" : "Xác nhận tạm dừng",
          content: isActivating 
            ? `Bạn có chắc chắn muốn kích hoạt quy trình "${record.name}"?`
            : `Bạn có chắc chắn muốn tạm dừng quy trình "${record.name}"? Quy trình sẽ được chuyển sang trạng thái tạm dừng.`,
          type: isActivating ? "success" : "warning",
          onConfirm: async () => {
            try {
              await updateServiceProcessMutation.mutateAsync({
                serviceProcessId: record.id,
                data: { 
                  is_active: isActivating,
                  // Giữ nguyên các field khác để tránh mất dữ liệu
                  code: record.code,
                  name: record.name,
                  description: record.description,
                  estimated_duration: record.estimated_duration,
                  is_default: record.is_default
                },
              });
              message.success(isActivating ? "Kích hoạt quy trình thành công!" : "Tạm dừng quy trình thành công!");
              refetch();
            } catch (error) {
              console.log("Error updating service process status:", error);
              message.error(isActivating ? "Có lỗi xảy ra khi kích hoạt quy trình" : "Có lỗi xảy ra khi tạm dừng quy trình");
            }
          },
        });
      },
    },
  ];

  const handleAddNew = () => {
    setEditingProcess(null);
    setModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleModalOk = async (processData: any) => {
    try {
      if (editingProcess) {
        // Cập nhật quy trình
        await updateServiceProcessMutation.mutateAsync({
          serviceProcessId: editingProcess.id,
          data: processData as UpdateServiceProcessRequest,
        });
        message.success("Cập nhật quy trình thành công!");
      } else {
        // Thêm quy trình mới
        await createServiceProcessMutation.mutateAsync(
          processData as CreateServiceProcessRequest
        );
        message.success("Tạo quy trình mới thành công!");
      }
      setModalOpen(false);
      setEditingProcess(null);
      refetch();
    } catch {
      message.error("Có lỗi xảy ra khi lưu quy trình");
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setEditingProcess(null);
  };

  const handleEdit = (record: ServiceProcessInfoDto) => {
    setEditingProcess(record);
    setModalOpen(true);
  };

  const handleView = (record: ServiceProcessInfoDto) => {
    setViewingProcess(record);
    setDetailModalOpen(true);
  };

  // Thống kê tổng quan
  const data = serviceProcessesData?.content || serviceProcessesData?.data || serviceProcessesData || [];
  const totalProcesses = data?.length || 0;
  const activeProcesses = data?.filter(
    (item:any) => item?.is_active && !item?.is_deleted
  )?.length || 0;
  const inactiveProcesses = data?.filter(
    (item:any) => !item?.is_active && !item?.is_deleted
  )?.length || 0;
  const deletedProcesses = data?.filter((item:any) => item?.is_deleted)?.length || 0;
  const totalSteps = data?.reduce((sum:any, item:any) => sum + (item?.step_count || 0), 0) || 0;
  const averageDuration =
    data?.length > 0
      ? data.reduce((sum:any, item:any) => sum + (item?.estimated_duration || 0), 0) /
        data.length
      : 0;

  return (
    <div>
      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Tổng quy trình"
              value={totalProcesses}
              valueStyle={{ color: "#1890ff" }}
              prefix={<SettingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={activeProcesses}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
            <Progress
              percent={Math.round((activeProcesses / totalProcesses) * 100)}
              size="small"
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Tạm dừng"
              value={inactiveProcesses}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<PauseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Đã xóa"
              value={deletedProcesses}
              valueStyle={{ color: "#f5222d" }}
              prefix={<DeleteOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Tổng bước"
              value={totalSteps}
              valueStyle={{ color: "#722ed1" }}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Thống kê bổ sung */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Thời gian TB"
              value={averageDuration}
              precision={0}
              valueStyle={{ color: "#13c2c2" }}
              prefix={<ClockCircleOutlined />}
              suffix="phút"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bước TB/quy trình"
              value={
                totalProcesses > 0 ? Math.round(totalSteps / totalProcesses) : 0
              }
              valueStyle={{ color: "#8c8c8c" }}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <AdminTable
        title="Quản lý quy trình chăm sóc xe"
        dataSource={data}
        columns={columns}
        loading={isLoading}
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onView={handleView}
        addButtonText="Thêm quy trình mới"
        searchable={true}
        searchPlaceholder="Tìm kiếm quy trình theo tên, mã..."
        searchFields={["name", "code", "description"]}
        actions={actions}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} quy trình`,
        }}
      />

      <CareProcessModal
        open={modalOpen}
        onSuccess={() => {
          setModalOpen(false);
          setEditingProcess(null);
          refetch();
        }}
        onCancel={handleModalCancel}
        initialData={editingProcess as any} // eslint-disable-line @typescript-eslint/no-explicit-any
        title={
          editingProcess
            ? "Chỉnh sửa quy trình chăm sóc"
            : "Thêm quy trình chăm sóc mới"
        }
      />

      <CareProcessDetailModal
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setViewingProcess(null);
        }}
        process={viewingProcess as any} // eslint-disable-line @typescript-eslint/no-explicit-any
      />
    </div>
  );
};

export default CareProcessesPage;
