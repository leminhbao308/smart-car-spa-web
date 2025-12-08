"use client";
import React, { useEffect, useState } from "react";
import { Row, Col, Typography, Card, Statistic, Spin, message } from "antd";
import {
  UserOutlined,
  CarOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import {
  StatCard,
  ActivityCard,
  QuickActionCard,
  BookingStatusCard,
  UpcomingBookingsCard,
} from "@/components/ui/Dashboard";
import { quickActions } from "@/components/utils/data/dashboard.data";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import { useRouter } from "next/navigation";
import {
  dashboardService,
  DashboardStats,
  BookingStatusStats,
  RecentActivity,
  UpcomingBooking,
  RevenueStats,
} from "@/lib/api";

const { Title, Text } = Typography;

const DashboardPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [bookingStatusData, setBookingStatusData] =
    useState<BookingStatusStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>(
    []
  );
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data in parallel
      const [statsRes, statusRes, activitiesRes, bookingsRes, revenueRes] =
        await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getBookingStatusStats(),
          dashboardService.getRecentActivities(10),
          dashboardService.getUpcomingBookings(5),
          dashboardService.getRevenueStats(),
        ]);

      if (statsRes.success && statsRes.data) {
        setDashboardStats(statsRes.data);
      }

      if (statusRes.success && statusRes.data) {
        setBookingStatusData(statusRes.data);
      }

      if (activitiesRes.success && activitiesRes.data) {
        setRecentActivities(activitiesRes.data);
      }

      if (bookingsRes.success && bookingsRes.data) {
        setUpcomingBookings(bookingsRes.data);
      }

      if (revenueRes.success && revenueRes.data) {
        setRevenueStats(revenueRes.data);
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      message.error(error.message || "Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const salesModules = [
    {
      title: "Bán hàng",
      description: "Giao diện bán hàng tại quầy",
      icon: <ShoppingCartOutlined style={{ fontSize: "24px" }} />,
      path: "/dashboard/pos",
      color: "#1890ff",
    },
    {
      title: "Hóa đơn",
      description: "Quản lý hóa đơn đã bán",
      icon: <FileTextOutlined style={{ fontSize: "24px" }} />,
      path: "/dashboard/sales-management/invoices",
      color: "#52c41a",
    },
    {
      title: "Hóa đơn tạm",
      description: "Quản lý hóa đơn chưa hoàn thành",
      icon: <ClockCircleOutlined style={{ fontSize: "24px" }} />,
      path: "/dashboard/sales-management/draft-invoices",
      color: "#fa8c16",
    },
    {
      title: "Hoàn trả hàng",
      description: "Xử lý hoàn trả sản phẩm",
      icon: <UndoOutlined style={{ fontSize: "24px" }} />,
      path: "/dashboard/sales-management/returns",
      color: "#f5222d",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title
          level={2}
          style={{ margin: 0, marginBottom: 8 }}
        >
          Dashboard
        </Title>
        <Text type="secondary">
          Tổng quan về hoạt động của trung tâm chăm sóc xe hơi
        </Text>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Spin
            size="large"
            tip="Đang tải dữ liệu..."
          />
        </div>
      ) : (
        <>
          {/* Thống kê chính */}
          <Row
            gutter={[24, 24]}
            style={{ marginBottom: 24 }}
          >
            <Col
              xs={24}
              sm={12}
              lg={6}
            >
              <StatCard
                title="Tổng khách hàng"
                value={dashboardStats?.totalCustomers || 0}
                growth={dashboardStats?.monthlyGrowth?.customers || 0}
                icon={<UserOutlined />}
                color="#1890ff"
              />
            </Col>
            <Col
              xs={24}
              sm={12}
              lg={6}
            >
              <StatCard
                title="Tổng xe phục vụ"
                value={dashboardStats?.totalVehicles || 0}
                growth={dashboardStats?.monthlyGrowth?.vehicles || 0}
                icon={<CarOutlined />}
                color="#52c41a"
              />
            </Col>
            <Col
              xs={24}
              sm={12}
              lg={6}
            >
              <StatCard
                title="Tổng lịch đặt"
                value={dashboardStats?.totalBookings || 0}
                growth={dashboardStats?.monthlyGrowth?.bookings || 0}
                icon={<CalendarOutlined />}
                color="#722ed1"
              />
            </Col>
            <Col
              xs={24}
              sm={12}
              lg={6}
            >
              <StatCard
                title="Tổng doanh thu"
                value={dashboardStats?.totalRevenue || 0}
                growth={dashboardStats?.monthlyGrowth?.revenue || 0}
                icon={<DollarOutlined />}
                color="#fa8c16"
                formatter={formatCurrency}
              />
            </Col>
          </Row>

          {/* Thống kê trạng thái booking */}
          <Row
            gutter={[24, 24]}
            style={{ marginBottom: 24 }}
          >
            <Col span={24}>
              <Card
                title="Trạng thái đặt lịch"
                style={{
                  borderRadius: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  border: "none",
                }}
                styles={{
                  body: {
                    padding: 20,
                  },
                }}
              >
                <Row gutter={[24, 24]}>
                  <Col
                    xs={24}
                    sm={12}
                    lg={6}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 12,
                          backgroundColor: "#faad1415",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 24,
                          margin: "0 auto 12px",
                        }}
                      >
                        <ClockCircleOutlined style={{ color: "#faad14" }} />
                      </div>
                      <Statistic
                        title="Chờ xác nhận"
                        value={bookingStatusData?.pending || 0}
                        valueStyle={{ color: "#faad14", fontSize: 20 }}
                      />
                    </div>
                  </Col>
                  <Col
                    xs={24}
                    sm={12}
                    lg={6}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 12,
                          backgroundColor: "#1890ff15",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 24,
                          margin: "0 auto 12px",
                        }}
                      >
                        <CheckCircleOutlined style={{ color: "#1890ff" }} />
                      </div>
                      <Statistic
                        title="Đã xác nhận"
                        value={bookingStatusData?.confirmed || 0}
                        valueStyle={{ color: "#1890ff", fontSize: 20 }}
                      />
                    </div>
                  </Col>
                  <Col
                    xs={24}
                    sm={12}
                    lg={6}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 12,
                          backgroundColor: "#722ed115",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 24,
                          margin: "0 auto 12px",
                        }}
                      >
                        <CheckCircleOutlined style={{ color: "#722ed1" }} />
                      </div>
                      <Statistic
                        title="Đang xử lý"
                        value={bookingStatusData?.inProgress || 0}
                        valueStyle={{ color: "#722ed1", fontSize: 20 }}
                      />
                    </div>
                  </Col>
                  <Col
                    xs={24}
                    sm={12}
                    lg={6}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 12,
                          backgroundColor: "#52c41a15",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 24,
                          margin: "0 auto 12px",
                        }}
                      >
                        <CheckCircleOutlined style={{ color: "#52c41a" }} />
                      </div>
                      <Statistic
                        title="Hoàn thành"
                        value={bookingStatusData?.completed || 0}
                        valueStyle={{ color: "#52c41a", fontSize: 20 }}
                      />
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Thống kê bán hàng */}
          <Row
            gutter={[24, 24]}
            style={{ marginBottom: 24 }}
          >
            <Col span={24}>
              <Card
                title="Thống kê bán hàng hôm nay"
                style={{
                  borderRadius: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  border: "none",
                }}
                styles={{
                  body: {
                    padding: 20,
                  },
                }}
              >
                <Row gutter={[24, 24]}>
                  <Col
                    xs={24}
                    sm={12}
                  >
                    <Card
                      style={{
                        borderRadius: "12px",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                      }}
                      styles={{
                        body: {
                          padding: "20px",
                        },
                      }}
                    >
                      <div style={{ color: "white", textAlign: "center" }}>
                        <Title
                          level={3}
                          style={{ color: "white", margin: 0 }}
                        >
                          {dashboardStats?.totalBookings || 0}
                        </Title>
                        <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                          Tổng số booking
                        </Text>
                      </div>
                    </Card>
                  </Col>
                  <Col
                    xs={24}
                    sm={12}
                  >
                    <Card
                      style={{
                        borderRadius: "12px",
                        background:
                          "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                        border: "none",
                      }}
                      styles={{
                        body: {
                          padding: "20px",
                        },
                      }}
                    >
                      <div style={{ color: "white", textAlign: "center" }}>
                        <Title
                          level={3}
                          style={{ color: "white", margin: 0 }}
                        >
                          {formatCurrency(revenueStats?.dailyRevenue || 0)}
                        </Title>
                        <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                          Doanh thu hôm nay
                        </Text>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Quản lý bán hàng */}
          <Row
            gutter={[24, 24]}
            style={{ marginBottom: 24 }}
          >
            <Col span={24}>
              <Card
                title="Quản lý bán hàng"
                style={{
                  borderRadius: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  border: "none",
                }}
                styles={{
                  body: {
                    padding: 20,
                  },
                }}
              >
                <Row gutter={[24, 24]}>
                  {salesModules.map((module) => (
                    <Col
                      xs={24}
                      sm={12}
                      lg={6}
                      key={module.path}
                    >
                      <Card
                        hoverable
                        style={{
                          height: "160px",
                          borderRadius: "12px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          border: "1px solid rgba(0,0,0,0.06)",
                          transition: "all 0.3s ease",
                        }}
                        styles={{
                          body: {
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            padding: "20px",
                          },
                        }}
                        onClick={() => router.push(module.path)}
                      >
                        <div
                          style={{
                            color: module.color,
                            marginBottom: "12px",
                            padding: "12px",
                            borderRadius: "50%",
                            backgroundColor: `${module.color}15`,
                          }}
                        >
                          {module.icon}
                        </div>
                        <Title
                          level={5}
                          style={{
                            margin: "0 0 8px 0",
                            color: "rgba(0, 0, 0, 0.85)",
                          }}
                        >
                          {module.title}
                        </Title>
                        <Text
                          type="secondary"
                          style={{ fontSize: "12px" }}
                        >
                          {module.description}
                        </Text>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Nội dung chính */}
          <Row gutter={[24, 24]}>
            {/* Cột trái */}
            <Col
              xs={24}
              lg={16}
            >
              <Row gutter={[24, 24]}>
                {/* Hoạt động gần đây */}
                <Col span={24}>
                  <ActivityCard activities={recentActivities} />
                </Col>
                {/* Thao tác nhanh */}
                <Col span={24}>
                  <QuickActionCard actions={quickActions} />
                </Col>
              </Row>
            </Col>

            {/* Cột phải */}
            <Col
              xs={24}
              lg={8}
            >
              <Row gutter={[24, 24]}>
                {/* Trạng thái đặt lịch */}
                <Col span={24}>
                  <BookingStatusCard statusData={bookingStatusData} />
                </Col>
                {/* Lịch đặt sắp tới */}
                <Col span={24}>
                  <UpcomingBookingsCard bookings={upcomingBookings} />
                </Col>
              </Row>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
