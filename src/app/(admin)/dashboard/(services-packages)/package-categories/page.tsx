"use client";
import React, { useState } from "react";
import {
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Space,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import { ServicePackageModal, ServicePackageDetailModal } from "@/components/ui/Modal";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import {
  servicePackagesData,
} from "@/components/utils/data/service-packages.data";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import {
  getStatusColor,
  getStatusLabel,
} from "@/components/utils/helper/center.helper";

// Interface cho Service Package
interface ServicePackage {
  id: number;
  packageCode: string;
  packageName: string;
  description: string;
  services: Array<{
    id: number;
    serviceName: string;
    totalPrice: number;
    quantity: number;
  }>;
  totalPrice: number; // Chỉ có totalPrice = tổng giá các dịch vụ
  status: string;
  targetCustomers: string[];
  validityPeriod: number;
  maxUsage: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

const { Text } = Typography;

const { Option } = Select;

const ServicePackagesPage = () => {
  const [data, setData] = useState<ServicePackage[]>(servicePackagesData);
  const [filteredData, setFilteredData] = useState<ServicePackage[]>(servicePackagesData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingPackage, setViewingPackage] = useState<ServicePackage | null>(null);
  const { showModal } = useConfirmationModalContext();

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const columns = [
    {
      title: "Mã gói",
      dataIndex: "packageCode",
      key: "packageCode",
      width: 120,
      render: (text: string) => (
        <Text strong style={{ color: "#1890ff" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Tên gói dịch vụ",
      dataIndex: "packageName",
      key: "packageName",
      width: 250,
      render: (text: string, record: ServicePackage) => (
        <div>
          <Text strong style={{ fontSize: 14 }}>
            {text}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description}
          </Text>
        </div>
      ),
    },
    {
      title: "Giá gói",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 120,
      sorter: (a, b) => a.totalPrice - b.totalPrice,
      render: (price: number) => (
        <Text strong style={{ color: "#52c41a", fontSize: 14 }}>
          {formatCurrency(price)}
        </Text>
      ),
    },
    {
      title: "Hiệu lực",
      dataIndex: "validityPeriod",
      key: "validityPeriod",
      width: 100,
      render: (period: number) => (
        <Text style={{ fontSize: 12 }}>
          {period} ngày
        </Text>
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
      onClick: (record: ServicePackage) => {
        setViewingPackage(record);
        setViewModalOpen(true);
      },
    },
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <EditOutlined />,
      onClick: (record: ServicePackage) => {
        setEditingPackage(record);
        setModalOpen(true);
      },
    },
    {
      key: "delete",
      label: "Xóa",
      icon: <DeleteOutlined />,
      danger: true,
      condition: (record: ServicePackage) => record.status === "inactive",
      onClick: (record: ServicePackage) => {
        showModal({
          title: "Xác nhận xóa gói dịch vụ",
          content: `Bạn có chắc chắn muốn xóa gói dịch vụ "${record.packageName}"?`,
          type: "error",
          onConfirm: () => {
            setData(data.filter((item) => item.id !== record.id));
          },
        });
      },
    },
    {
      key: "deactivate",
      label: "Ngừng hoạt động",
      icon: <DeleteOutlined />,
      danger: true,
      condition: (record: ServicePackage) => record.status === "active",
      onClick: (record: ServicePackage) => {
        showModal({
          title: "Xác nhận ngừng hoạt động",
          content: `Bạn có chắc chắn muốn ngừng hoạt động gói dịch vụ "${record.packageName}"?`,
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
      condition: (record: ServicePackage) => record.status === "inactive",
      onClick: (record: ServicePackage) => {
        showModal({
          title: "Xác nhận kích hoạt",
          content: `Bạn có chắc chắn muốn kích hoạt gói dịch vụ "${record.packageName}"?`,
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
  ];

  const handleAddNew = () => {
    setEditingPackage(null);
    setModalOpen(true);
  };

  const handleModalOk = (packageData: ServicePackage) => {
    if (editingPackage) {
      // Cập nhật gói dịch vụ
      setData(
        data.map((item) =>
          item.id === editingPackage.id
            ? { ...packageData, id: editingPackage.id }
            : item
        )
      );
    } else {
      // Thêm gói dịch vụ mới
      setData([...data, packageData]);
    }
    setModalOpen(false);
    setEditingPackage(null);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setEditingPackage(null);
  };

  const handleViewModalCancel = () => {
    setViewModalOpen(false);
    setViewingPackage(null);
  };

  // Filter functions
  const applyFilters = React.useCallback(() => {
    let filtered = [...data];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(item =>
        item.packageName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.packageCode.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredData(filtered);
  }, [data, searchText, statusFilter]);

  const resetFilters = () => {
    setSearchText("");
    setStatusFilter(undefined);
    setFilteredData(data);
  };

  // Apply filters when any filter changes
  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <div>
      {/* Filter Section */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm kiếm theo mã gói, tên gói, mô tả..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <Button
                type="primary"
                icon={<FilterOutlined />}
                onClick={applyFilters}
              >
                Lọc
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={resetFilters}
              >
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <AdminTable
        title="Quản lý gói dịch vụ"
        dataSource={filteredData}
        columns={columns}
        actions={actions}
        onAdd={handleAddNew}
        addButtonText="Thêm gói dịch vụ mới"
        searchable={false}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} gói dịch vụ`,
        }}
      />

      <ServicePackageModal
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        initialData={editingPackage}
        title={
          editingPackage
            ? "Chỉnh sửa gói dịch vụ"
            : "Thêm gói dịch vụ mới"
        }
      />

      <ServicePackageDetailModal
        open={viewModalOpen}
        onCancel={handleViewModalCancel}
        data={viewingPackage}
      />
    </div>
  );
};

export default ServicePackagesPage;
