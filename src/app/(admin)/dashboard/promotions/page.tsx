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
  Badge,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  GiftOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FireOutlined,
  StarOutlined,
} from "@ant-design/icons";
import AdminTable from "@/components/ui/Table/AdminTable";
import PromotionModal from "@/components/ui/Modal/PromotionModal/PromotionModal";
import { useConfirmationModalContext } from "@/components/ui/Modal";
import {
  promotionsData,
  Promotion,
} from "@/components/utils/data/promotions.data";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import {
  getStatusColor,
  getStatusLabel,
  getTypeIcon,
  getTypeLabel,
  isExpired,
  isActive,
} from "@/components/utils/helper/promotion.helper";
import { formatDate } from "@/components/utils/helper/date.format.helper";

const { Text } = Typography;

const PromotionsPage = () => {
  const [data, setData] = useState<Promotion[]>(promotionsData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null
  );
  const { showModal } = useConfirmationModalContext();

  const columns = [
    {
      title: "Chương trình",
      dataIndex: "name",
      key: "name",
      width: 250,
      render: (text: string, record: Promotion) => (
        <div>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
          >
            <span style={{ fontSize: 20, marginRight: 8 }}>
              {getTypeIcon(record.type)}
            </span>
            <Text strong style={{ fontSize: 14 }}>
              {text}
            </Text>
            {record.isPublic && (
              <Tag color="blue" style={{ marginLeft: 8 }}>
                Công khai
              </Tag>
            )}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 11, color: "#8c8c8c" }}>
              {formatDate(record.startDate)} - {formatDate(record.endDate)}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: string) => (
        <Tag color="purple">
          {getTypeIcon(type)} {getTypeLabel(type)}
        </Tag>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      width: 120,
      render: (value: number, record: Promotion) => (
        <div>
          {record.type === "percentage" ? (
            <Text strong style={{ color: "#f5222d", fontSize: 14 }}>
              -{value}%
            </Text>
          ) : record.type === "fixed" ? (
            <Text strong style={{ color: "#f5222d", fontSize: 14 }}>
              -{formatCurrency(value)}
            </Text>
          ) : (
            <Text strong style={{ color: "#52c41a", fontSize: 14 }}>
              {value}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string, record: Promotion) => {
        const isExpiredPromo = isExpired(record.endDate);
        const isActivePromo = isActive(
          record.startDate,
          record.endDate,
          status
        );

        let displayStatus = status;
        let displayColor = getStatusColor(status);

        if (isExpiredPromo && status === "active") {
          displayStatus = "expired";
          displayColor = "gray";
        }

        return (
          <div>
            <Tag color={displayColor}>{getStatusLabel(displayStatus)}</Tag>
            {isActivePromo && (
              <div style={{ marginTop: 4 }}>
                <Tag color="green">
                  <FireOutlined /> Đang chạy
                </Tag>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Sử dụng",
      dataIndex: "usage",
      key: "usage",
      width: 150,
      render: (_: any, record: Promotion) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 12 }}>
              {record.usedCount}/{record.usageLimit || "∞"} lần
            </Text>
          </div>
          <Progress
            percent={
              record.usageLimit
                ? Math.round((record.usedCount / record.usageLimit) * 100)
                : 0
            }
            strokeColor="#1890ff"
          />
          <div style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 11, color: "#8c8c8c" }}>
              {record.customerUsedCount}/{record.customerLimit || "∞"} khách
              hàng
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Độ ưu tiên",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (priority: number) => (
        <div style={{ textAlign: "center" }}>
          <Badge
            count={priority}
            style={{
              backgroundColor:
                priority >= 8
                  ? "#f5222d"
                  : priority >= 6
                  ? "#fa8c16"
                  : "#52c41a",
            }}
          />
          <div style={{ marginTop: 4 }}>
            {priority >= 8 && <Tag color="red">Cao</Tag>}
            {priority >= 6 && priority < 8 && (
              <Tag color="orange">Trung bình</Tag>
            )}
            {priority < 6 && <Tag color="green">Thấp</Tag>}
          </div>
        </div>
      ),
    },
    {
      title: "Điều kiện",
      dataIndex: "conditions",
      key: "conditions",
      width: 200,
      render: (conditions: any[]) => (
        <div>
          {conditions.slice(0, 2).map((condition, index) => (
            <Tag key={index} style={{ marginBottom: 2 }}>
              {condition.description}
            </Tag>
          ))}
          {conditions.length > 2 && (
            <Tag color="blue">+{conditions.length - 2} điều kiện</Tag>
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
      onClick: (record: Promotion) => {
        const conditionsInfo = record.conditions
          .map((condition) => `• ${condition.description}`)
          .join("\n");

        const benefitsInfo = record.benefits.join("\n• ");
        const termsInfo = record.terms.join("\n• ");

        showModal({
          title: "Chi tiết chương trình khuyến mãi",
          content: `Tên: ${record.name}\nMô tả: ${
            record.description
          }\nLoại: ${getTypeLabel(record.type)}\nGiá trị: ${
            record.type === "percentage"
              ? `${record.value}%`
              : formatCurrency(record.value)
          }\nThời gian: ${formatDate(record.startDate)} - ${formatDate(
            record.endDate
          )}\nTrạng thái: ${getStatusLabel(record.status)}\nSử dụng: ${
            record.usedCount
          }/${record.usageLimit || "∞"} lần\nKhách hàng: ${
            record.customerUsedCount
          }/${record.customerLimit || "∞"} người\nĐộ ưu tiên: ${
            record.priority
          }\nCông khai: ${
            record.isPublic ? "Có" : "Không"
          }\n\nĐiều kiện:\n${conditionsInfo}\n\nLợi ích:\n• ${benefitsInfo}\n\nĐiều khoản:\n• ${termsInfo}`,
          type: "info",
          onConfirm: () => {},
        });
      },
    },
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <EditOutlined />,
      onClick: (record: Promotion) => {
        setEditingPromotion(record);
        setModalOpen(true);
      },
    },
    {
      key: "delete",
      label: "Xóa",
      icon: <DeleteOutlined />,
      danger: true,
      condition: (record: Promotion) =>
        record.status === "inactive" || isExpired(record.endDate),
      onClick: (record: Promotion) => {
        showModal({
          title: "Xác nhận xóa chương trình",
          content: `Bạn có chắc chắn muốn xóa chương trình "${record.name}"?`,
          type: "error",
          onConfirm: () => {
            setData(data.filter((item) => item.id !== record.id));
          },
        });
      },
    },
    {
      key: "deactivate",
      label: "Tạm dừng",
      icon: <DeleteOutlined />,
      danger: true,
      condition: (record: Promotion) => record.status === "active",
      onClick: (record: Promotion) => {
        showModal({
          title: "Xác nhận tạm dừng",
          content: `Bạn có chắc chắn muốn tạm dừng chương trình "${record.name}"?`,
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
      condition: (record: Promotion) => record.status === "inactive",
      onClick: (record: Promotion) => {
        showModal({
          title: "Xác nhận kích hoạt",
          content: `Bạn có chắc chắn muốn kích hoạt chương trình "${record.name}"?`,
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
    setEditingPromotion(null);
    setModalOpen(true);
  };

  const handleModalOk = (promotionData: Promotion) => {
    if (editingPromotion) {
      // Cập nhật chương trình
      setData(
        data.map((item) =>
          item.id === editingPromotion.id
            ? { ...promotionData, id: editingPromotion.id }
            : item
        )
      );
    } else {
      // Thêm chương trình mới
      setData([...data, promotionData]);
    }
    setModalOpen(false);
    setEditingPromotion(null);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setEditingPromotion(null);
  };

  // Thống kê tổng quan
  const totalPromotions = data.length;
  const activePromotions = data.filter(
    (item) => item.status === "active"
  ).length;
  const scheduledPromotions = data.filter(
    (item) => item.status === "scheduled"
  ).length;
  const expiredPromotions = data.filter((item) =>
    isExpired(item.endDate)
  ).length;
  const publicPromotions = data.filter((item) => item.isPublic).length;
  const totalUsage = data.reduce((sum, item) => sum + item.usedCount, 0);
  const totalCustomers = data.reduce(
    (sum, item) => sum + item.customerUsedCount,
    0
  );

  return (
    <div>
      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng chương trình"
              value={totalPromotions}
              valueStyle={{ color: "#1890ff" }}
              prefix={<GiftOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={activePromotions}
              valueStyle={{ color: "#52c41a" }}
              prefix={<FireOutlined />}
            />
            <Progress
              percent={Math.round((activePromotions / totalPromotions) * 100)}
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã lên lịch"
              value={scheduledPromotions}
              valueStyle={{ color: "#722ed1" }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Công khai"
              value={publicPromotions}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<StarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Thống kê bổ sung */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng lượt sử dụng"
              value={totalUsage}
              valueStyle={{ color: "#13c2c2" }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng khách hàng"
              value={totalCustomers}
              valueStyle={{ color: "#eb2f96" }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã hết hạn"
              value={expiredPromotions}
              valueStyle={{ color: "#8c8c8c" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tạm dừng"
              value={data.filter((item) => item.status === "inactive").length}
              valueStyle={{ color: "#f5222d" }}
              prefix={<DeleteOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <AdminTable
        title="Quản lý chương trình khuyến mãi"
        dataSource={data}
        columns={columns}
        actions={actions}
        onAdd={handleAddNew}
        addButtonText="Thêm chương trình mới"
        searchable={true}
        searchPlaceholder="Tìm kiếm khuyến mãi theo tên, mã, mô tả..."
        searchFields={["name", "code", "description"]}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} chương trình`,
        }}
      />

      <PromotionModal
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        initialData={editingPromotion}
        title={
          editingPromotion
            ? "Chỉnh sửa chương trình khuyến mãi"
            : "Thêm chương trình khuyến mãi mới"
        }
      />
    </div>
  );
};

export default PromotionsPage;
