"use client";
import React, { useState, useMemo } from "react";
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
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  BankOutlined,
  StarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import {
  SupplierDetailModal,
} from "@/components/ui/Modal";
import SupplierModal from "@/components/ui/Modal/SupplierModal/SupplierModal";
import { useSuppliers } from "@/lib/api/hooks/useSuppliers";
import { Supplier } from "@/lib/api/types/supplier.types";
import { formatDate } from "@/components/utils/helper/date.format.helper";

const { Text } = Typography;

const SupplierPage = () => {
  // React Query hooks
  const { data: suppliersData, isLoading } = useSuppliers({});

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<Supplier | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Extract data from query result
  const suppliers = useMemo(
    () => suppliersData?.data?.content || [],
    [suppliersData?.data?.content]
  );
  const pagination = useMemo(
    () =>
      suppliersData?.data
        ? {
            page: suppliersData.data.page,
            size: suppliersData.data.size,
            total_elements: suppliersData.data.total_elements,
            total_pages: suppliersData.data.total_pages,
            first: suppliersData.data.first,
            last: suppliersData.data.last,
            has_next: suppliersData.data.has_next,
            has_previous: suppliersData.data.has_previous,
          }
        : {
            page: 0,
            size: 10,
            total_elements: 0,
            total_pages: 0,
            first: true,
            last: true,
            has_next: false,
            has_previous: false,
          },
    [suppliersData?.data]
  );

  const columns = [
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier_name",
      key: "supplier_name",
      width: 300,
      render: (text: string) => (
        <div>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
          >
            <BankOutlined
              style={{ fontSize: 16, marginRight: 8, color: "#1890ff" }}
            />
            <Text strong style={{ fontSize: 14 }}>
              {text}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Liên hệ",
      key: "contact",
      width: 200,
      render: (record: Supplier) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <PhoneOutlined style={{ marginRight: 4, color: "#1890ff" }} />
            <Text style={{ fontSize: 12 }}>{record.phone}</Text>
          </div>
          <div style={{ marginBottom: 4 }}>
            <MailOutlined style={{ marginRight: 4, color: "#52c41a" }} />
            <Text style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
          <div style={{ marginBottom: 4 }}>
            <EnvironmentOutlined style={{ marginRight: 4, color: "#fa8c16" }} />
            <Text style={{ fontSize: 12 }}>{record.contact_person}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      width: 120,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Tạm dừng"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_date",
      key: "created_date",
      width: 150,
      render: (date: string) => (
        <Text style={{ fontSize: 12 }}>{formatDate(date)}</Text>
      ),
    },
  ];

  // Handlers
  const handleView = (record: Supplier) => {
    setSelectedData(record);
    setDetailModalVisible(true);
  };

  const handleEdit = (record: Supplier) => {
    setEditingSupplier(record);
    setModalVisible(true);
  };


  const handleModalSuccess = () => {
    setModalVisible(false);
    setEditingSupplier(null);
  };

  // Statistics
  const statistics = useMemo(() => {
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter((item) => item.is_active).length;
    const inactiveSuppliers = suppliers.filter(
      (item) => !item.is_active
    ).length;

    return {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
    };
  }, [suppliers]);

  return (
    <div>
      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Tổng nhà cung cấp"
              value={statistics.totalSuppliers}
              valueStyle={{ color: "#1890ff" }}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={statistics.activeSuppliers}
              valueStyle={{ color: "#52c41a" }}
              prefix={<StarOutlined />}
            />
            <Progress
              percent={
                statistics.totalSuppliers > 0
                  ? Math.round(
                      (statistics.activeSuppliers / statistics.totalSuppliers) *
                        100
                    )
                  : 0
              }
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Tạm dừng"
              value={statistics.inactiveSuppliers}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <AdminTable
        title="Quản lý nhà cung cấp"
        dataSource={suppliers}
        columns={columns}
        onAdd={() => {
          setEditingSupplier(null);
          setModalVisible(true);
        }}
        onView={handleView}
        onEdit={handleEdit}
        addButtonText="Thêm nhà cung cấp mới"
        loading={isLoading}
        searchable={true}
        searchPlaceholder="Tìm kiếm nhà cung cấp theo tên, liên hệ..."
        searchFields={["supplier_name", "contact_person", "phone", "email"]}
        pagination={{
          current: pagination.page + 1,
          pageSize: pagination.size,
          total: pagination.total_elements,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} nhà cung cấp`,
        }}
      />

      {/* Modals */}
      <SupplierModal
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingSupplier(null);
        }}
        onSuccess={handleModalSuccess}
        initialData={editingSupplier}
        title={
          editingSupplier ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp mới"
        }
      />

      <SupplierDetailModal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        supplier={selectedData}
      />
    </div>
  );
};

export default SupplierPage;
