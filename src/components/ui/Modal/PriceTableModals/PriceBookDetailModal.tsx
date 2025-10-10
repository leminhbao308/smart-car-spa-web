import React, { useState, useEffect } from "react";
import {
  Modal,
  Card,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Typography,
  Timeline,
  Statistic,
  Badge,
  Button,
  Tabs,
  Empty,
  Divider,
} from "antd";
import type { TabsProps } from "antd";
import {
  EyeOutlined,
  HistoryOutlined,
  DollarOutlined,
  ShopOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  TagOutlined,
  CarOutlined,
} from "@ant-design/icons";
import {
  PriceTable,
  PriceHistory,
  Branch,
  PriceRange,
  PriceTableService,
  PRICE_TABLE_STATUSES,
  CHANGE_TYPES,
} from "@/components/utils/data/price-table.data";
import {
  getBranchById,
  getPriceHistoryByTableId,
} from "@/components/utils/data/price-table.data";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Text } = Typography;

interface PriceTableDetailModalProps {
  open: boolean;
  onCancel: () => void;
  priceTable: PriceTable | null;
}

const PriceBookDetailModal: React.FC<PriceTableDetailModalProps> = ({
  open,
  onCancel,
  priceTable,
}) => {
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [branch, setBranch] = useState<Branch | null>(null);

  useEffect(() => {
    if (priceTable) {
      // Load price history
      const history = getPriceHistoryByTableId(priceTable.id);
      setPriceHistory(history);

      // Load branch info
      if (priceTable.branchId) {
        const branchData = getBranchById(priceTable.branchId);
        setBranch(branchData || null);
      } else {
        setBranch(null);
      }
    }
  }, [priceTable]);

  if (!priceTable) return null;

  const statusInfo = PRICE_TABLE_STATUSES.find(
    (s) => s.value === priceTable.status
  );

  // Create price table data structure
  const createPriceTableData = () => {
    const vehicleTypes = priceTable.vehicleTypes || [];
    const allItems = [
      // Services
      ...priceTable.services.map(service => ({
        type: 'service',
        id: service.id,
        name: service.serviceName,
        category: service.serviceCategory,
        basePrice: service.basePrice,
        finalPrice: service.finalPrice,
        discountPercentage: service.discountPercentage,
        status: service.status,
        priceRanges: service.priceRanges || [],
        multiplier: 1 // Default multiplier for services
      })),
      // Products
      ...priceTable.products.map(product => ({
        type: 'product',
        id: product.id,
        name: product.productName,
        category: product.productCategory,
        basePrice: product.basePrice,
        finalPrice: product.finalPrice,
        discountPercentage: product.discountPercentage,
        status: product.status,
        priceRanges: [],
        multiplier: 1 // Default multiplier for products
      })),
      // Service Packages
      ...priceTable.servicePackages.map(pkg => ({
        type: 'package',
        id: pkg.id,
        name: pkg.packageName,
        category: 'Gói dịch vụ',
        basePrice: pkg.basePrice,
        finalPrice: pkg.finalPrice,
        discountPercentage: pkg.discountPercentage,
        status: pkg.status,
        priceRanges: [],
        multiplier: 1 // Default multiplier for packages
      }))
    ];

    return allItems;
  };

  const priceTableData = createPriceTableData();
  const vehicleTypes = priceTable.vehicleTypes || [];

  // Price table columns
  const priceTableColumns = [
    {
      title: 'Sản phẩm / Dịch vụ',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (text: string, record: any) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            {record.type === 'service' && <FileTextOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
            {record.type === 'product' && <TagOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
            {record.type === 'package' && <DollarOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
            <Text strong>{text}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.category}
          </Text>
          {record.discountPercentage > 0 && (
            <div style={{ marginTop: 4 }}>
              <Tag color="red" style={{ fontSize: 10 }}>
                -{record.discountPercentage}%
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    // Vehicle type columns
    ...vehicleTypes.map((vehicleType) => ({
      title: vehicleType.vehicleTypeName,
      dataIndex: `price_${vehicleType.id}`,
      key: `price_${vehicleType.id}`,
      width: 150,
      align: 'center' as const,
      render: (value: any, record: any) => {
        // Calculate price based on vehicle type multiplier
        const basePrice = record.finalPrice || record.basePrice;
        const finalPrice = Math.round(basePrice * vehicleType.multiplier);

        return (
          <Text strong style={{ fontSize: 14 }}>
            {formatCurrency(finalPrice)}
          </Text>
        );
      },
    }))
  ];

  // Price history timeline items
  const timelineItems = priceHistory.map((history) => {
    const changeTypeInfo = CHANGE_TYPES.find(
      (t) => t.value === history.changeType
    );
    return {
      color: changeTypeInfo?.color || "blue",
      children: (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Space>
              <Tag color={changeTypeInfo?.color}>{changeTypeInfo?.label}</Tag>
              <Text strong>
                {formatCurrency(history.oldPrice)} →{" "}
                {formatCurrency(history.newPrice)}
              </Text>
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {history.effectiveDate}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {history.changeReason}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            Bởi: {history.createdBy}
          </Text>
        </div>
      ),
    };
  });

  // Tabs items configuration
  const tabItems: TabsProps["items"] = [
    {
      key: "overview",
      label: (
        <Space>
          <InfoCircleOutlined />
          Tổng quan
        </Space>
      ),
      children: (
        <Row gutter={[16, 16]}>
          {/* Thông tin cơ bản */}
          <Col span={24}>
            <Card title="Thông tin cơ bản" size="small">
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Space direction="vertical" size="small">
                    <div>
                      <Text type="secondary">Tên bảng giá:</Text>
                      <br />
                      <Text strong style={{ fontSize: 16 }}>
                        {priceTable.name}
                      </Text>
                    </div>
                    <div>
                      <Text type="secondary">Mã bảng giá:</Text>
                      <br />
                      <Text code>{priceTable.code}</Text>
                    </div>
                    <div>
                      <Text type="secondary">Mô tả:</Text>
                      <br />
                      <Text>{priceTable.description}</Text>
                    </div>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" size="small">
                    <div>
                      <Text type="secondary">Chi nhánh áp dụng:</Text>
                      <br />
                      {branch ? (
                        <Space>
                          <ShopOutlined />
                          <Text strong>{branch.name}</Text>
                          <Tag color="blue">{branch.code}</Tag>
                        </Space>
                      ) : (
                        <Space>
                          <ShopOutlined />
                          <Text strong>Toàn hệ thống</Text>
                          <Tag color="green">Hệ thống</Tag>
                        </Space>
                      )}
                    </div>
                    <div>
                      <Text type="secondary">Trạng thái:</Text>
                      <br />
                      <Tag
                        color={statusInfo?.color}
                        icon={<InfoCircleOutlined />}
                      >
                        {statusInfo?.label}
                      </Tag>
                      {priceTable.isDefault && (
                        <Tag color="gold" style={{ marginLeft: 8 }}>
                          Mặc định
                        </Tag>
                      )}
                    </div>
                    <div>
                      <Text type="secondary">Ngày hiệu lực:</Text>
                      <br />
                      <Space>
                        <CalendarOutlined />
                        <Text>{priceTable.effectiveDate}</Text>
                      </Space>
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Thống kê */}
          <Col span={24}>
            <Card title="Thống kê" size="small">
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="Tổng dịch vụ"
                    value={priceTable.services.length}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Dịch vụ hoạt động"
                    value={
                      priceTable.services.filter((s) => s.status === "active")
                        .length
                    }
                    prefix={<TagOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Chương trình giảm giá"
                    value={priceTable.discountPrograms.length}
                    prefix={<DollarOutlined />}
                    valueStyle={{ color: "#fa8c16" }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Lịch sử thay đổi"
                    value={priceHistory.length}
                    prefix={<HistoryOutlined />}
                    valueStyle={{ color: "#722ed1" }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Chương trình giảm giá */}
          {priceTable.discountPrograms.length > 0 && (
            <Col span={24}>
              <Card title="Chương trình giảm giá" size="small">
                <Row gutter={[8, 8]}>
                  {priceTable.discountPrograms.map((program) => (
                    <Col span={8} key={program.id}>
                      <Card size="small" style={{ backgroundColor: "#f6ffed" }}>
                        <Space direction="vertical" size="small">
                          <div>
                            <Text strong>{program.name}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {program.type === "percentage"
                                ? `${program.value}%`
                                : formatCurrency(program.value)}
                            </Text>
                          </div>
                          <div>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {program.startDate} - {program.endDate}
                            </Text>
                          </div>
                          <Tag
                            color={
                              program.status === "active" ? "green" : "red"
                            }
                          >
                            {program.status === "active"
                              ? "Hoạt động"
                              : "Ngừng hoạt động"}
                          </Tag>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          )}
        </Row>
      ),
    },
    {
      key: "services",
      label: (
        <Space>
          <CarOutlined />
          Bảng giá chi tiết
          <Badge count={priceTableData.length} showZero color="#1890ff" />
        </Space>
      ),
      children: (
        <div>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarOutlined style={{ color: '#1890ff' }} />
                <span>Bảng giá theo loại xe</span>
              </div>
            }
            style={{ marginBottom: 16 }}
            size="small"
          >
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Bảng giá hiển thị giá tiền của từng sản phẩm/dịch vụ/gói dịch vụ theo từng loại xe.
                Giá được tính dựa trên hệ số nhân của từng loại xe.
              </Text>
            </div>

            {priceTableData.length > 0 ? (
              <Table
                dataSource={priceTableData}
                columns={priceTableColumns}
                pagination={false}
                size="small"
                rowKey={(record) => `${record.type}_${record.id}`}
                scroll={{ x: 'max-content' }}
              />
            ) : (
              <Empty
                description="Chưa có sản phẩm/dịch vụ nào trong bảng giá"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>

          {/* Vehicle Type Information */}
          {vehicleTypes.length > 0 && (
            <Card title="Thông tin hệ số loại xe" size="small" style={{ marginTop: 16 }}>
              <Row gutter={[16, 8]}>
                {vehicleTypes.map(vehicleType => (
                  <Col span={8} key={vehicleType.id}>
                    <div style={{
                      padding: 12,
                      backgroundColor: '#f6ffed',
                      borderRadius: 6,
                      border: '1px solid #b7eb8f'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                        <CarOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        <Text strong style={{ fontSize: 13 }}>
                          {vehicleType.vehicleTypeName}
                        </Text>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Hệ số: {vehicleType.multiplier}x
                      </Text>
                      {vehicleType.description && (
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {vehicleType.description}
                          </Text>
                        </div>
                      )}
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          )}
        </div>
      ),
    },
    {
      key: "history",
      label: (
        <Space>
          <HistoryOutlined />
          Lịch sử thay đổi
          <Badge count={priceHistory.length} showZero color="#722ed1" />
        </Space>
      ),
      children:
        priceHistory.length > 0 ? (
          <Timeline items={timelineItems} />
        ) : (
          <Empty
            description="Chưa có lịch sử thay đổi"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <EyeOutlined />
          Chi tiết bảng giá
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
      width={1200}
      style={{ top: 20 }}
      styles={{
        body: {
          maxHeight: "80vh",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "16px 24px",
        },
      }}
    >
      <Tabs defaultActiveKey="overview" items={tabItems} />
    </Modal>
  );
};

export default PriceBookDetailModal;
