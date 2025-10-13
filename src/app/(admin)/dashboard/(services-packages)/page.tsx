"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Space,
  Typography,
  Divider,
  Tag,
  List,
  Avatar,
  Progress,
} from "antd";
import {
  InboxOutlined,
  TagsOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { ServicePackage } from "@/lib/api/types/service-package.types";
import { ServicePackageType } from "@/lib/api/types/service-package-type.types";
import { servicePackageService } from "@/lib/api/services/service-package.service";
import { servicePackageTypeService } from "@/lib/api/services/service-package-type.service";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Title, Text } = Typography;

const ServicePackagesOverviewPage = () => {
  const router = useRouter();
  const [packageData, setPackageData] = useState<ServicePackage[]>([]);
  const [packageTypes, setPackageTypes] = useState<ServicePackageType[]>([]);
  const [, setLoading] = useState(false);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load service packages
      const packagesResponse = await servicePackageService.getAllServicePackages(0, 100);
      console.log("Packages response:", packagesResponse);
      
      // Handle both array and paginated object responses
      const dataArray = Array.isArray(packagesResponse.data) ? packagesResponse.data : (packagesResponse.data?.content || []);
      console.log("Data array for overview:", dataArray);
      
      const packagesWithPromotion = dataArray.map((pkg: ServicePackage) => ({
        ...pkg,
        promotionId: "promo-001",
        promotionName: "Khuyến mãi mùa hè",
        promotionDiscount: 10,
      }));
      setPackageData(packagesWithPromotion);

      // Load package types
      const typesResponse = await servicePackageTypeService.getActiveServicePackageTypes();
      console.log("Package types response:", typesResponse);
      setPackageTypes(typesResponse);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalPackages = packageData.length;
  const activePackages = packageData.filter(pkg => pkg.isActive).length;
  const totalTypes = packageTypes.length;
  const activeTypes = packageTypes.filter(type => type.isActive).length;

  // Calculate average package price
  const averagePrice = packageData.length > 0 
    ? packageData.reduce((sum, pkg) => {
        const price = pkg.packagePrice || pkg.serviceCost;
        return sum + price;
      }, 0) / packageData.length
    : 0;

  // Calculate total duration
  const totalDuration = packageData.reduce((sum, pkg) => sum + pkg.totalDuration, 0);

  // Get recent packages (last 5)
  const recentPackages = packageData
    .sort((a, b) => new Date(b.audit?.createdDate || 0).getTime() - new Date(a.audit?.createdDate || 0).getTime())
    .slice(0, 5);

  // Get package type distribution
  const typeDistribution = packageTypes.map(type => ({
    type: type.name,
    count: packageData.filter(pkg => pkg.servicePackageTypeId === type.servicePackageTypeId).length,
    color: type.isDefault ? "#faad14" : "#1890ff",
  }));

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <InboxOutlined style={{ marginRight: 8 }} />
          Quản lý gói dịch vụ
        </Title>
        <Text type="secondary">
          Tổng quan và quản lý các loại gói dịch vụ và gói dịch vụ
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số gói dịch vụ"
              value={totalPackages}
              prefix={<InboxOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Hoạt động: {activePackages} / {totalPackages}
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Loại gói dịch vụ"
              value={totalTypes}
              prefix={<TagsOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Hoạt động: {activeTypes} / {totalTypes}
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Giá trung bình"
              value={averagePrice}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng thời gian"
              value={totalDuration}
              prefix={<ClockCircleOutlined />}
              suffix="phút"
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Thao tác nhanh" style={{ marginBottom: 24 }}>
        <Space wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push("/dashboard/services-packages/packages")}
          >
            Thêm gói dịch vụ
          </Button>
          <Button
            icon={<TagsOutlined />}
            onClick={() => router.push("/dashboard/services-packages/package-types")}
          >
            Quản lý loại gói
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={() => router.push("/dashboard/services-packages/packages")}
          >
            Xem tất cả gói
          </Button>
          <Button
            icon={<SettingOutlined />}
            onClick={() => router.push("/dashboard/services-packages/package-types")}
          >
            Cài đặt loại gói
          </Button>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Recent Packages */}
        <Col xs={24} lg={12}>
          <Card
            title="Gói dịch vụ gần đây"
            extra={
              <Button
                type="link"
                onClick={() => router.push("/dashboard/services-packages/packages")}
              >
                Xem tất cả
              </Button>
            }
          >
            <List
              dataSource={recentPackages}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      key="view"
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => router.push(`/dashboard/services-packages/packages?view=${item.packageId}`)}
                    >
                      Xem
                    </Button>,
                    <Button
                      key="edit"
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => router.push(`/dashboard/services-packages/packages?edit=${item.packageId}`)}
                    >
                      Sửa
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor: item.isActive ? "#52c41a" : "#ff4d4f",
                        }}
                        icon={<InboxOutlined />}
                      />
                    }
                    title={
                      <div>
                        <Text strong>{item.packageName}</Text>
                        <Tag
                          color={item.isActive ? "green" : "red"}
                          style={{ marginLeft: 8 }}
                        >
                          {item.isActive ? "Hoạt động" : "Không hoạt động"}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <div>{item.description}</div>
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary">
                            Giá: {formatCurrency(item.packagePrice || item.serviceCost)}
                          </Text>
                          <Text type="secondary" style={{ marginLeft: 16 }}>
                            Thời gian: {item.totalDuration} phút
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Package Type Distribution */}
        <Col xs={24} lg={12}>
          <Card title="Phân bố theo loại gói">
            <div style={{ marginBottom: 16 }}>
              {typeDistribution.map((item, index) => (
                <div key={index} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text>{item.type}</Text>
                    <Text strong>{item.count} gói</Text>
                  </div>
                  <Progress
                    percent={totalPackages > 0 ? (item.count / totalPackages) * 100 : 0}
                    strokeColor={item.color}
                    showInfo={false}
                  />
                </div>
              ))}
            </div>
            <Divider />
            <div style={{ textAlign: "center" }}>
              <Button
                type="primary"
                icon={<TagsOutlined />}
                onClick={() => router.push("/dashboard/services-packages/package-types")}
              >
                Quản lý loại gói
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Package Types Overview */}
      <Card title="Loại gói dịch vụ" style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          {packageTypes.map((type) => (
            <Col xs={24} sm={12} md={8} lg={6} key={type.servicePackageTypeId}>
              <Card
                size="small"
                hoverable
                onClick={() => router.push("/dashboard/services-packages/package-types")}
                style={{ cursor: "pointer" }}
              >
                <div style={{ textAlign: "center" }}>
                  <Avatar
                    size={48}
                    style={{
                      backgroundColor: type.isDefault ? "#faad14" : "#1890ff",
                      marginBottom: 8,
                    }}
                    icon={<TagsOutlined />}
                  />
                  <div>
                    <Text strong>{type.name}</Text>
                    {type.isDefault && (
                      <Tag color="gold" style={{ marginLeft: 4 }}>
                        Mặc định
                      </Tag>
                    )}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Tag color={type.isActive ? "green" : "red"}>
                      {type.isActive ? "Hoạt động" : "Không hoạt động"}
                    </Tag>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {type.description || "Không có mô tả"}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default ServicePackagesOverviewPage;
