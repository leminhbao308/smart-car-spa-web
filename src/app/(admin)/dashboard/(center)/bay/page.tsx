"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Select,
  Input,
  Statistic,
  Divider,
} from "antd";
import {
  FilterOutlined,
  SearchOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  ServiceBay,
  ServiceBayFilterParam,
  BayStatus,
  BAY_STATUS_OPTIONS,
} from "@/lib/api/types/service-bay.types";
import { useServiceBays } from "@/lib/api/hooks/useServiceBays";
import { useBranches } from "@/lib/api/hooks/useBranches";
import {
  ServiceBayModal,
  ServiceBayDetailModal,
} from "@/components/ui/Modal/ServiceBayModals";
import {
  ServiceBayGrid,
} from "@/components/ui/ServiceBayManagement";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const ServiceBayManagementPage = () => {
  // State management
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<BayStatus | undefined>(
    undefined
  );
  const [searchText, setSearchText] = useState("");

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedBay, setSelectedBay] = useState<ServiceBay | null>(null);
  const [editData, setEditData] = useState<ServiceBay | null>(null);

  // Hooks
  const { branches } = useBranches({});

  // Set default branch when branches are loaded
  React.useEffect(() => {
    if (branches && branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0].branch_id);
    }
  }, [branches, selectedBranch]);

  // Filter params - Always filter by selected branch
  const filterParams: ServiceBayFilterParam = useMemo(() => {
    const params: ServiceBayFilterParam = {
      page: 0,
      size: 50,
    };

    // Always require a branch to be selected
    if (selectedBranch) {
      params.branch_id = selectedBranch;
    }
    if (selectedStatus) {
      params.status = selectedStatus;
    }
    if (searchText && searchText.trim()) {
      params.search = searchText.trim();
    }

    return params;
  }, [selectedBranch, selectedStatus, searchText]);

  const {
    data: baysResponse,
    isLoading: loading,
    refetch: refreshBays,
  } = useServiceBays(filterParams);
  const bays = useMemo(() => baysResponse?.data?.content || [], [baysResponse]);

  // Statistics
  const statistics = useMemo(() => {
    const total = bays.length;
    const active = bays.filter((bay) => bay.status === BayStatus.ACTIVE).length;
    const maintenance = bays.filter(
      (bay) => bay.status === BayStatus.MAINTENANCE
    ).length;
    const closed = bays.filter((bay) => bay.status === BayStatus.CLOSED).length;
    const available = bays.filter((bay) => bay.is_available).length;
    const allowBooking = bays.filter((bay) => bay.allow_booking).length;
    const onSiteProcessing = bays.filter((bay) => !bay.allow_booking).length;
    const totalBookings = bays.reduce(
      (sum, bay) => sum + bay.total_bookings,
      0
    );
    const activeBookings = bays.reduce(
      (sum, bay) => sum + bay.active_bookings,
      0
    );

    return {
      total,
      active,
      maintenance,
      closed,
      available,
      allowBooking,
      onSiteProcessing,
      totalBookings,
      activeBookings,
    };
  }, [bays]);

  // Handlers
  const handleEdit = (bay: ServiceBay) => {
    setEditData(bay);
    setModalVisible(true);
  };

  const handleView = (bay: ServiceBay) => {
    setSelectedBay(bay);
    setDetailModalVisible(true);
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    setEditData(null);
    refreshBays();
  };

  const handleFilterReset = () => {
    setSelectedBranch("");
    setSelectedStatus(undefined);
    setSearchText("");
  };

  // Filter options
  const branchOptions = branches.map((branch) => ({
    label: `${branch.branch_name} (${branch.branch_code})`,
    value: branch.branch_id,
  }));

  // bayTypeOptions removed as BayType is no longer used

  const statusOptions = BAY_STATUS_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  }));

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title
              level={2}
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ToolOutlined style={{ color: "#1890ff" }} />
              Quản lý khu vực dịch vụ
            </Title>
            <Text type="secondary">
              Quản lý các khu vực dịch vụ tại chi nhánh
            </Text>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số khu vực"
              value={statistics.total}
              prefix={<ToolOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={statistics.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Có sẵn"
              value={statistics.available}
              prefix={<ToolOutlined />}
              valueStyle={{ color: "#13c2c2" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang bảo trì"
              value={statistics.maintenance}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Statistics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cho đặt lịch"
              value={statistics.allowBooking}
              prefix="📅"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Xử lý tại chỗ"
              value={statistics.onSiteProcessing}
              prefix="🔧"
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng đặt lịch"
              value={statistics.totalBookings}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang sử dụng"
              value={statistics.activeBookings}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="Chọn chi nhánh"
              value={selectedBranch || undefined}
              onChange={setSelectedBranch}
              style={{ width: "100%" }}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children || "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {branchOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="Chọn trạng thái"
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: "100%" }}
              allowClear
            >
              {statusOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Space.Compact style={{ width: "100%" }}>
              <Search
                placeholder="Tìm kiếm khu vực dịch vụ..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={setSearchText}
                enterButton={<SearchOutlined />}
              />
            </Space.Compact>
          </Col>
        </Row>

        <Divider style={{ margin: "16px 0" }} />

        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Text type="secondary">
                Hiển thị {bays.length} khu vực dịch vụ
                {selectedBranch && (
                  <span style={{ marginLeft: "8px", color: "#1890ff" }}>
                    • Chi nhánh:{" "}
                    {branches.find((b) => b.branch_id === selectedBranch)
                      ?.branch_name || selectedBranch}
                  </span>
                )}
                {selectedStatus && (
                  <span style={{ marginLeft: "8px", color: "#faad14" }}>
                    • Trạng thái:{" "}
                    {BAY_STATUS_OPTIONS.find(
                      (bs) => bs.value === selectedStatus
                    )?.label || selectedStatus}
                  </span>
                )}
                {searchText && (
                  <span style={{ marginLeft: "8px", color: "#722ed1" }}>
                    • Tìm kiếm: &quot;{searchText}&quot;
                  </span>
                )}
              </Text>
              {(selectedBranch || selectedStatus || searchText) && (
                <Button
                  size="small"
                  onClick={handleFilterReset}
                  icon={<FilterOutlined />}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Content */}
      <Card>
        <ServiceBayGrid
          bays={bays}
          loading={loading}
          onEdit={handleEdit}
          onView={handleView}
          emptyMessage="Không có khu vực dịch vụ nào phù hợp với bộ lọc"
        />
      </Card>

      {/* Modals */}
      <ServiceBayModal
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditData(null);
        }}
        onSuccess={handleModalSuccess}
        editData={editData}
        branchId={selectedBranch || undefined}
      />

      <ServiceBayDetailModal
        visible={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedBay(null);
        }}
        data={selectedBay}
      />

    </div>
  );
};

export default ServiceBayManagementPage;
