"use client";
import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Typography,
  Card,
  Button,
  Select,
  Statistic,
  Progress,
  Alert,
} from "antd";
import {
  CarOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { branchesData, Branch } from "@/components/utils/data/branches.data";
import SlotAvailabilityCard from "@/components/ui/Dashboard/SlotAvailabilityCard";
import BranchDetailModal from "@/components/ui/Modal/BranchModal/BranchDetailModal";

const { Title, Text } = Typography;
const { Option } = Select;

const SlotMonitoringPage = () => {
  const [branches, setBranches] = useState<Branch[]>(branchesData);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdate(new Date());
      // Simulate real-time updates
      setBranches((prevBranches) =>
        prevBranches.map((branch) => ({
          ...branch,
          careSlots: branch.careSlots.map((slot) => {
            // Simulate some slot status changes
            if (Math.random() < 0.1) {
              // 10% chance of status change
              if (slot.status === "occupied" && Math.random() < 0.3) {
                return {
                  ...slot,
                  status: "available" as const,
                  currentVehicle: undefined,
                  estimatedCompletion: undefined,
                };
              } else if (slot.status === "available" && Math.random() < 0.2) {
                return {
                  ...slot,
                  status: "occupied" as const,
                  currentVehicle: `30A-${Math.floor(Math.random() * 10000)}`,
                  estimatedCompletion: dayjs()
                    .add(Math.floor(Math.random() * 120) + 30, "minute")
                    .format("HH:mm"),
                };
              }
            }
            return slot;
          }),
          availableSlots: branch.careSlots.filter(
            (s) => s.status === "available"
          ).length,
        }))
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(timer);
  }, []);

  const filteredBranches = branches.filter((branch) => {
    if (filterStatus === "all") return true;
    return branch.status === filterStatus;
  });

  const totalStats = {
    totalSlots: branches.reduce((sum, branch) => sum + branch.totalSlots, 0),
    availableSlots: branches.reduce(
      (sum, branch) => sum + branch.availableSlots,
      0
    ),
    occupiedSlots: branches.reduce(
      (sum, branch) =>
        sum + branch.careSlots.filter((s) => s.status === "occupied").length,
      0
    ),
    maintenanceSlots: branches.reduce(
      (sum, branch) =>
        sum + branch.careSlots.filter((s) => s.status === "maintenance").length,
      0
    ),
  };

  const overallUtilization =
    totalStats.totalSlots > 0
      ? Math.round((totalStats.occupiedSlots / totalStats.totalSlots) * 100)
      : 0;

  const handleViewBranchDetails = (branch: Branch) => {
    setSelectedBranch(branch);
    setDetailModalOpen(true);
  };

  const handleRefresh = () => {
    setLastUpdate(new Date());
    // Force re-render
    setBranches([...branchesData]);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <CarOutlined /> Giám sát slot chăm sóc xe
        </Title>
        <Text type="secondary">
          Theo dõi tình trạng slot chăm sóc xe theo thời gian thực
        </Text>
      </div>

      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng slot"
              value={totalStats.totalSlots}
              prefix={<CarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Slot trống"
              value={totalStats.availableSlots}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang sử dụng"
              value={totalStats.occupiedSlots}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tỷ lệ sử dụng"
              value={overallUtilization}
              suffix="%"
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{
                color:
                  overallUtilization > 80
                    ? "#f5222d"
                    : overallUtilization > 60
                    ? "#fa8c16"
                    : "#52c41a",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress bar tổng quan */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>Tình trạng sử dụng slot tổng thể</Title>
        <Progress
          percent={overallUtilization}
          strokeColor={{
            "0%": "#52c41a",
            "50%": "#faad14",
            "100%": "#f5222d",
          }}
          format={(percent) => `${percent}% đang sử dụng`}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
            fontSize: 12,
            color: "#8c8c8c",
          }}
        >
          <span>Trống: {totalStats.availableSlots} slot</span>
          <span>Đang dùng: {totalStats.occupiedSlots} slot</span>
          <span>Bảo trì: {totalStats.maintenanceSlots} slot</span>
        </div>
      </Card>

      {/* Bộ lọc và điều khiển */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <Text strong>Bộ lọc:</Text>
          </Col>
          <Col>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 150 }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="maintenance">Bảo trì</Option>
              <Option value="inactive">Ngừng hoạt động</Option>
            </Select>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              type="primary"
            >
              Làm mới
            </Button>
          </Col>
          <Col flex="auto">
            <div style={{ textAlign: "right" }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Cập nhật lần cuối: {lastUpdate.toLocaleTimeString()}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Cảnh báo */}
      {overallUtilization > 90 && (
        <Alert
          message="Cảnh báo: Tỷ lệ sử dụng slot cao"
          description="Tỷ lệ sử dụng slot hiện tại đang ở mức cao. Hãy kiểm tra và điều phối lại nếu cần thiết."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Danh sách chi nhánh */}
      <Row gutter={[16, 16]}>
        {filteredBranches.map((branch) => (
          <Col span={8} key={branch.id}>
            <SlotAvailabilityCard
              branch={branch}
              onViewDetails={() => handleViewBranchDetails(branch)}
            />
          </Col>
        ))}
      </Row>

      {filteredBranches.length === 0 && (
        <Card>
          <div style={{ textAlign: "center", padding: 40 }}>
            <EnvironmentOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">
                Không có chi nhánh nào phù hợp với bộ lọc
              </Text>
            </div>
          </div>
        </Card>
      )}

      <BranchDetailModal
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedBranch(null);
        }}
        branch={selectedBranch}
      />
    </div>
  );
};

export default SlotMonitoringPage;
