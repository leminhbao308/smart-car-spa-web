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
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined, 
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  BankOutlined,
  FileTextOutlined,
  StarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import SupplierModal from "@/components/ui/Modal/SupplierModal/SupplierModal";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import {
  suppliersData,
  Supplier,
} from "@/components/utils/data/suppliers.data";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import {
  getStatusColor,
  getStatusLabel,
  getContractStatusColor,
  getContractStatusLabel,
  isContractExpired,
} from "@/components/utils/helper/supplier.helper";
import { formatDate } from "@/components/utils/helper/date.format.helper";

const { Text } = Typography;

const SupplierPage = () => {
  const [data, setData] = useState<Supplier[]>(suppliersData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const { showModal } = useConfirmationModalContext();

  const columns = [
    {
      title: "Nhà cung cấp",
      dataIndex: "name",
      key: "name",
      width: 300,
      render: (text: string, record: Supplier) => (
        <div>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
          >
            <BankOutlined style={{ fontSize: 16, marginRight: 8, color: "#1890ff" }} />
            <Text strong style={{ fontSize: 14 }}>
              {text}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Mã: {record.code} | {record.category}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 11, color: "#8c8c8c" }}>
              {record.description}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Liên hệ",
      dataIndex: "contactInfo",
      key: "contactInfo",
      width: 200,
      render: (contactInfo: Supplier['contactInfo']) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <PhoneOutlined style={{ marginRight: 4, color: "#1890ff" }} />
            <Text style={{ fontSize: 12 }}>{contactInfo.phone}</Text>
          </div>
          <div style={{ marginBottom: 4 }}>
            <MailOutlined style={{ marginRight: 4, color: "#52c41a" }} />
            <Text style={{ fontSize: 12 }}>{contactInfo.email}</Text>
          </div>
          <div style={{ marginBottom: 4 }}>
            <EnvironmentOutlined style={{ marginRight: 4, color: "#fa8c16" }} />
            <Text style={{ fontSize: 12 }}>{contactInfo.city}</Text>
          </div>
          {contactInfo.website && (
            <div>
              <GlobalOutlined style={{ marginRight: 4, color: "#722ed1" }} />
              <Text style={{ fontSize: 12 }}>{contactInfo.website}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Hợp đồng",
      dataIndex: "contractInfo",
      key: "contractInfo",
      width: 180,
      render: (contractInfo: Supplier['contractInfo']) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: "bold" }}>
              {contractInfo.contractNumber}
            </Text>
          </div>
          <div style={{ marginBottom: 4 }}>
            <Tag color={getContractStatusColor(contractInfo.status)}>
              {getContractStatusLabel(contractInfo.status)}
            </Tag>
          </div>
          <div style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 11 }}>
              {formatDate(contractInfo.startDate)} -{" "}
              {formatDate(contractInfo.endDate)}
            </Text>
          </div>
          {isContractExpired(contractInfo.endDate) && (
            <Tag color="red">Hết hạn</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      ),
    },
  ];

  const actions = [
    {
      key: "view",
      label: "Xem chi tiết",
      icon: <EyeOutlined />,
      onClick: (record: Supplier) => {
        setViewingSupplier(record);
        setModalMode('view');
        setModalOpen(true);
      },
    },
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <EditOutlined />,
      onClick: (record: Supplier) => {
        setEditingSupplier(record);
        setModalMode('edit');
        setModalOpen(true);
      },
    },
    {
      key: "deactivate",
      label: "Tạm dừng",
      icon: <DeleteOutlined />,
      danger: true,
      condition: (record: Supplier) => record.status === "active",
      onClick: (record: Supplier) => {
        showModal({
          title: "Xác nhận tạm dừng",
          content: `Bạn có chắc chắn muốn tạm dừng nhà cung cấp "${record.name}"?`,
          type: "warning",
          onConfirm: () => {
            setData(
              data.map((item) =>
                item.id === record.id
                  ? { ...item, status: "inactive" as const }
                  : item
              )
            );
          },
        });
      },
    },
    {
      key: "activate",
      label: "Kích hoạt",
      icon: <EditOutlined />,
      condition: (record: Supplier) => record.status === "inactive",
      onClick: (record: Supplier) => {
        showModal({
          title: "Xác nhận kích hoạt",
          content: `Bạn có chắc chắn muốn kích hoạt nhà cung cấp "${record.name}"?`,
          type: "success",
          onConfirm: () => {
            setData(
              data.map((item) =>
                item.id === record.id
                  ? { ...item, status: "active" as const }
                  : item
              )
            );
          },
        });
      },
    },
    {
      key: "blacklist",
      label: "Cấm",
      icon: <DeleteOutlined />,
      danger: true,
      condition: (record: Supplier) =>
        record.status === "active" || record.status === "inactive",
      onClick: (record: Supplier) => {
        showModal({
          title: "Xác nhận cấm nhà cung cấp",
          content: `Bạn có chắc chắn muốn cấm nhà cung cấp "${record.name}"?`,
          type: "error",
          onConfirm: () => {
            setData(
              data.map((item) =>
                item.id === record.id
                  ? { ...item, status: "blacklisted" as const }
                  : item
              )
            );
          },
        });
      },
    },
  ];

  const handleAddNew = () => {
    setEditingSupplier(null);
    setViewingSupplier(null);
    setModalMode('add');
    setModalOpen(true);
  };

  const handleModalOk = (supplierData: Supplier) => {
    if (modalMode === 'edit' && editingSupplier) {
      // Cập nhật nhà cung cấp
      setData(
        data.map((item) =>
          item.id === editingSupplier.id
            ? { ...supplierData, id: editingSupplier.id }
            : item
        )
      );
    } else if (modalMode === 'add') {
      // Thêm nhà cung cấp mới
      setData([...data, supplierData]);
    }
    setModalOpen(false);
    setEditingSupplier(null);
    setViewingSupplier(null);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setEditingSupplier(null);
    setViewingSupplier(null);
  };

  // Thống kê tổng quan
  const totalSuppliers = data.length;
  const activeSuppliers = data.filter(
    (item) => item.status === "active"
  ).length;
  const inactiveSuppliers = data.filter(
    (item) => item.status === "inactive"
  ).length;
  const blacklistedSuppliers = data.filter(
    (item) => item.status === "blacklisted"
  ).length;
  const expiredContracts = data.filter((item) =>
    isContractExpired(item.contractInfo.endDate)
  ).length;
  const totalOrders = data.reduce(
    (sum, item) => sum + item.performance.totalOrders,
    0
  );
  const totalValue = data.reduce(
    (sum, item) => sum + item.performance.totalValue,
    0
  );
  const averageRating =
    data.length > 0
      ? data.reduce((sum, item) => sum + item.performance.rating, 0) /
        data.length
      : 0;

  return (
    <div>
      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng nhà cung cấp"
              value={totalSuppliers}
              valueStyle={{ color: "#1890ff" }}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={activeSuppliers}
              valueStyle={{ color: "#52c41a" }}
              prefix={<StarOutlined />}
            />
            <Progress
              percent={Math.round((activeSuppliers / totalSuppliers) * 100)}
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tạm dừng"
              value={inactiveSuppliers}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cấm"
              value={blacklistedSuppliers}
              valueStyle={{ color: "#f5222d" }}
              prefix={<DeleteOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Thống kê bổ sung */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={totalOrders}
              valueStyle={{ color: "#13c2c2" }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng giá trị"
              value={totalValue}
              valueStyle={{ color: "#eb2f96" }}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đánh giá TB"
              value={averageRating}
              precision={1}
              valueStyle={{ color: "#722ed1" }}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hợp đồng hết hạn"
              value={expiredContracts}
              valueStyle={{ color: "#8c8c8c" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <AdminTable
        title="Quản lý nhà cung cấp"
        dataSource={data}
        columns={columns}
        actions={actions}
        onAdd={handleAddNew}
        addButtonText="Thêm nhà cung cấp mới"
        searchable={true}
        searchPlaceholder="Tìm kiếm nhà cung cấp theo tên, mã, liên hệ..."
        searchFields={["supplierName", "supplierCode", "contactInfo.phone", "contactInfo.email"]}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} nhà cung cấp`,
        }}
      />

      <SupplierModal
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        initialData={modalMode === 'view' ? viewingSupplier : editingSupplier}
        title={
          modalMode === 'view' 
            ? "Chi tiết nhà cung cấp" 
            : modalMode === 'edit' 
            ? "Chỉnh sửa nhà cung cấp" 
            : "Thêm nhà cung cấp mới"
        }
      />
    </div>
  );
};

export default SupplierPage;
