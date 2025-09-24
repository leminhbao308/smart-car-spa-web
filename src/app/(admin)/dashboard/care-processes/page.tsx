"use client";
import React, { useState } from "react";
import { Tag, Typography, Card, Row, Col, Statistic, Progress } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CarOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import CareProcessModal from "@/components/ui/Modal/CarProcessModal/CareProcessModal";
import CareProcessDetailModal from "@/components/ui/Modal/CarProcessModal/CareProcessDetailModal";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import {
  careProcessesData,
  CareProcess,
} from "@/components/utils/data/care-processes.data";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import { formatTime } from "@/components/utils/helper/duration.format.helper";

const { Text } = Typography;

const CareProcessesPage = () => {
  const [data, setData] = useState<CareProcess[]>(careProcessesData);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<CareProcess | null>(
    null
  );
  const [viewingProcess, setViewingProcess] = useState<CareProcess | null>(
    null
  );
  const { showModal } = useConfirmationModalContext();

  const columns = [
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
      title: "Loại xe",
      dataIndex: "targetVehicleTypes",
      key: "targetVehicleTypes",
      width: 150,
      render: (types: string[]) => (
        <div>
          {types.slice(0, 2).map((type, index) => (
            <Tag key={index} style={{ marginBottom: 2 }}>
              {type}
            </Tag>
          ))}
          {types.length > 2 && <Tag color="blue">+{types.length - 2} loại</Tag>}
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "estimatedDuration",
      key: "estimatedDuration",
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
            <Text strong>{formatTime(duration)}</Text>
          </div>
          <Text style={{ fontSize: 11, color: "#8c8c8c" }}>Ước tính</Text>
        </div>
      ),
    },
    {
      title: "Giá dịch vụ",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price: number) => (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 4,
            }}
          >
            <DollarOutlined style={{ marginRight: 4, color: "#52c41a" }} />
            <Text strong style={{ color: "#52c41a" }}>
              {formatCurrency(price)}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 150,
      render: (isActive: boolean, record: CareProcess) => (
        <div style={{ textAlign: "center" }}>
          {record.status === "discontinued" ? (
            <Tag color="red" icon={<DeleteOutlined />}>
              Ngừng cung cấp
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

  const actions = [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: <EyeOutlined />,
      onClick: (record: CareProcess) => {
        setViewingProcess(record);
        setDetailModalOpen(true);
      },
    },
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <EditOutlined />,
      onClick: (record: CareProcess) => {
        setEditingProcess(record);
        setModalOpen(true);
      },
    },
    {
      key: "activate",
      label: "Kích hoạt",
      icon: <PlayCircleOutlined />,
      condition: (record: CareProcess) =>
        !record.isActive && record.status !== "discontinued",
      onClick: (record: CareProcess) => {
        showModal({
          title: "Xác nhận kích hoạt",
          content: `Bạn có chắc chắn muốn kích hoạt quy trình "${record.name}"?`,
          type: "success",
          onConfirm: () => {
            setData(
              data.map((item) =>
                item.id === record.id ? { ...item, isActive: true } : item
              )
            );
          },
        });
      },
    },
    {
      key: "pause",
      label: "Tạm dừng",
      icon: <PauseCircleOutlined />,
      danger: true,
      condition: (record: CareProcess) => record.isActive,
      onClick: (record: CareProcess) => {
        showModal({
          title: "Xác nhận tạm dừng",
          content: `Bạn có chắc chắn muốn tạm dừng quy trình "${record.name}"? Quy trình sẽ được chuyển sang trạng thái tạm dừng.`,
          type: "warning",
          onConfirm: () => {
            setData(
              data.map((item) =>
                item.id === record.id ? { ...item, isActive: false } : item
              )
            );
          },
        });
      },
    },
    {
      key: "deactivate",
      label: "Ngừng cung cấp dịch vụ",
      icon: <DeleteOutlined />,
      danger: true,
      condition: (record: CareProcess) =>
        !record.isActive && record.status !== "discontinued",
      onClick: (record: CareProcess) => {
        showModal({
          title: "Xác nhận ngừng cung cấp dịch vụ",
          content: `Bạn có chắc chắn muốn ngừng cung cấp dịch vụ "${record.name}"? Quy trình sẽ được đánh dấu là ngừng cung cấp dịch vụ.`,
          type: "error",
          onConfirm: () => {
            setData(
              data.map((item) =>
                item.id === record.id
                  ? { ...item, status: "discontinued" }
                  : item
              )
            );
          },
        });
      },
    },
  ];

  const handleAddNew = () => {
    setEditingProcess(null);
    setModalOpen(true);
  };

  const handleModalOk = (processData: CareProcess) => {
    if (editingProcess) {
      // Cập nhật quy trình
      setData(
        data.map((item) =>
          item.id === editingProcess.id
            ? { ...processData, id: editingProcess.id }
            : item
        )
      );
    } else {
      // Thêm quy trình mới
      setData([...data, processData]);
    }
    setModalOpen(false);
    setEditingProcess(null);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setEditingProcess(null);
  };

  // Thống kê tổng quan
  const totalProcesses = data.length;
  const activeProcesses = data.filter(
    (item) => item.isActive && item.status !== "discontinued"
  ).length;
  const inactiveProcesses = data.filter(
    (item) => !item.isActive && item.status !== "discontinued"
  ).length;
  const discontinuedProcesses = data.filter(
    (item) => item.status === "discontinued"
  ).length;
  const totalSteps = data.reduce((sum, item) => sum + item.steps.length, 0);
  const averageDuration =
    data.length > 0
      ? data.reduce((sum, item) => sum + item.estimatedDuration, 0) /
        data.length
      : 0;
  const totalValue = data.reduce((sum, item) => sum + item.price, 0);
  const averagePrice = data.length > 0 ? totalValue / data.length : 0;

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
              title="Ngừng cung cấp"
              value={discontinuedProcesses}
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
              title="Giá TB"
              value={averagePrice}
              valueStyle={{ color: "#eb2f96" }}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng giá trị"
              value={totalValue}
              valueStyle={{ color: "#52c41a" }}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
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
        actions={actions}
        onAdd={handleAddNew}
        addButtonText="Thêm quy trình mới"
        searchable={true}
        searchPlaceholder="Tìm kiếm quy trình theo tên, mô tả..."
        searchFields={["name", "description"]}
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
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        initialData={editingProcess}
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
        process={viewingProcess}
      />
    </div>
  );
};

export default CareProcessesPage;
