"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Space,
  Statistic,
  List,
  Divider,
  Button,
  Spin,
} from "antd";
import Image from "next/image";
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  StarOutlined,
  UserOutlined,
  EditOutlined,
  ShopOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { CenterDisplay } from "@/lib/api/types/center.types";
import { useBranchesByCenter } from "@/lib/api/hooks/useBranchesByCenter";
import { useServiceBays } from "@/lib/api/hooks/useServiceBays";
import { useUsers, useCustomersDropdown } from "@/lib/api/hooks/useUsers";

const { Title, Text, Paragraph } = Typography;

interface CenterInfoDisplayProps {
  centerInfo: CenterDisplay | null;
  onEdit?: () => void;
}

const CenterInfoDisplay: React.FC<CenterInfoDisplayProps> = ({
  centerInfo,
  onEdit,
}) => {
  const [statistics, setStatistics] = useState({
    totalBranches: 0,
    totalServiceBays: 0,
    activeBranches: 0,
    activeServiceBays: 0,
    totalEmployees: 0,
    totalCustomers: 0,
  });

  // Fetch branches data
  const { branches, loading: branchesLoading } = useBranchesByCenter(
    centerInfo?.center_id || null
  );

  // Fetch service bays data
  const { data: serviceBaysData, isLoading: serviceBaysLoading } =
    useServiceBays({
      page: 0,
      size: 1000, // Get all service bays
    });

  // Fetch employees data
  const { users: employees, loading: employeesLoading } = useUsers({
    page: 0,
    size: 1000, // Get all employees
    userType: "EMPLOYEE",
  });

  // Fetch customers data
  const { customers, loading: customersLoading } = useCustomersDropdown();

  // Calculate statistics
  useEffect(() => {
    if (branches && serviceBaysData?.data?.content && employees && customers) {
      const totalBranches = branches.length;
      const activeBranches = branches.filter(
        (branch) => branch.is_active
      ).length;
      const totalServiceBays = serviceBaysData.data.content.length;
      const activeServiceBays = serviceBaysData.data.content.filter(
        (bay) => bay.is_active
      ).length;
      const totalEmployees = employees.length;
      const totalCustomers = customers.length;

      setStatistics({
        totalBranches,
        totalServiceBays,
        activeBranches,
        activeServiceBays,
        totalEmployees,
        totalCustomers,
      });
    }
  }, [branches, serviceBaysData, employees, customers]);

  // Null safety check
  if (!centerInfo) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Text type="secondary">Không có dữ liệu trung tâm</Text>
      </div>
    );
  }

  const isLoading =
    branchesLoading ||
    serviceBaysLoading ||
    employeesLoading ||
    customersLoading;

  // Helper function to get safe logo URL
  const getSafeLogoUrl = (logoUrl: string | null | undefined): string => {
    if (!logoUrl) return "/images/Main Logo_Light.png";

    // Check if it's a valid local path or external URL
    if (logoUrl.startsWith("/") || logoUrl.startsWith("./")) {
      return logoUrl;
    }

    // Check if it's a valid external URL (not the problematic one)
    if (logoUrl.startsWith("http")) {
      // Filter out problematic URLs
      if (
        logoUrl.includes("premium.smartcarspa-hn.com") ||
        logoUrl.includes("smartcarspa-hn.com")
      ) {
        return "/images/Main Logo_Light.png";
      }
      return logoUrl;
    }

    // Default fallback
    return "/images/Main Logo_Light.png";
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header với logo và thông tin cơ bản */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col span={4}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                border: "2px solid #f0f0f0",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f5f5f5",
              }}
            >
              <Image
                src={getSafeLogoUrl(centerInfo.logo_url)}
                alt="Smart Car Spa Logo"
                width={96}
                height={96}
                style={{
                  objectFit: "contain",
                  borderRadius: "50%",
                }}
                onError={(e) => {
                  // Fallback to text if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 24px; font-weight: bold; color: #1890ff;">${
                      centerInfo.center_name?.charAt(0) || "C"
                    }</div>`;
                  }
                }}
              />
            </div>
          </Col>
          <Col span={16}>
            <div>
              <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
                {centerInfo.center_name || "Chưa có tên"}
              </Title>
              <Paragraph
                style={{ fontSize: 16, color: "#666", marginBottom: 16 }}
              >
                {centerInfo.description || "Chưa có mô tả"}
              </Paragraph>
              <Space wrap>
                <Tag color="blue" icon={<ClockCircleOutlined />}>
                  Thành lập:{" "}
                  {centerInfo.established_date
                    ? new Date(centerInfo.established_date).getFullYear()
                    : "N/A"}
                </Tag>
                <Tag
                  color={
                    centerInfo.operating_status === "ACTIVE"
                      ? "green"
                      : centerInfo.operating_status === "INACTIVE"
                      ? "red"
                      : "yellow"
                  }
                  icon={<StarOutlined />}
                >
                  {centerInfo.operating_status === "ACTIVE"
                    ? "Hoạt động"
                    : centerInfo.operating_status === "INACTIVE"
                    ? "Tạm dừng"
                    : "Bảo trì"}
                </Tag>
              </Space>
            </div>
          </Col>
          <Col span={4}>
            {onEdit && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={onEdit}
                block
              >
                Chỉnh sửa
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      <Row gutter={24}>
        {/* Thông tin liên hệ */}
        <Col span={12}>
          <Card title="Thông tin liên hệ" style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <div>
                <Text strong>Địa chỉ:</Text>
                <div style={{ marginTop: 4 }}>
                  <EnvironmentOutlined
                    style={{ marginRight: 8, color: "#1890ff" }}
                  />
                  <Text>
                    {centerInfo.headquarters_address || "Chưa có địa chỉ"}
                  </Text>
                </div>
              </div>

              <div>
                <Text strong>Liên hệ:</Text>
                <div style={{ marginTop: 4 }}>
                  <PhoneOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                  <Text>
                    {centerInfo.headquarters_phone || "Chưa có số điện thoại"}
                  </Text>
                </div>
                <div style={{ marginTop: 4 }}>
                  <MailOutlined style={{ marginRight: 8, color: "#722ed1" }} />
                  <Text>
                    {centerInfo.headquarters_email || "Chưa có email"}
                  </Text>
                </div>
                <div style={{ marginTop: 4 }}>
                  <GlobalOutlined
                    style={{ marginRight: 8, color: "#13c2c2" }}
                  />
                  <Text>{centerInfo.website || "Chưa có website"}</Text>
                </div>
              </div>

              <div>
                <Text strong>Giờ làm việc:</Text>
                <div style={{ marginTop: 4 }}>
                  <ClockCircleOutlined
                    style={{ marginRight: 8, color: "#1890ff" }}
                  />
                  <Text>
                    {centerInfo.business_hours?.monday?.open || "N/A"} -{" "}
                    {centerInfo.business_hours?.sunday?.close || "N/A"}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>

          {/* Thông tin pháp lý */}
          <Card title="Thông tin pháp lý">
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <div>
                <Text strong>Giấy phép kinh doanh:</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{centerInfo.business_license || "Chưa có"}</Text>
                </div>
              </div>
              <div>
                <Text strong>Mã số thuế:</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{centerInfo.tax_code || "Chưa có"}</Text>
                </div>
              </div>
              <div>
                <Text strong>Mã trung tâm:</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{centerInfo.center_code || "Chưa có"}</Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Thống kê và dịch vụ */}
        <Col span={12}>
          <Card title="Thống kê hoạt động" style={{ marginBottom: 24 }}>
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Đang tải thống kê...</Text>
                </div>
              </div>
            ) : (
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Tổng chi nhánh"
                    value={statistics.totalBranches}
                    prefix={<ShopOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                  <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4 }}>
                    {statistics.activeBranches} đang hoạt động
                  </div>
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Khu vực dịch vụ"
                    value={statistics.totalServiceBays}
                    prefix={<CarOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                  <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4 }}>
                    {statistics.activeServiceBays} đang hoạt động
                  </div>
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Tổng khách hàng"
                    value={statistics.totalCustomers}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: "#fa8c16" }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Tổng nhân viên"
                    value={statistics.totalEmployees}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: "#722ed1" }}
                  />
                </Col>
              </Row>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CenterInfoDisplay;
