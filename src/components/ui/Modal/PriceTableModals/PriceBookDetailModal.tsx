// components/ui/Modal/PriceBookDetailModal.tsx
import React from "react";
import {
  Modal,
  Space,
  Card,
  Descriptions,
  Tag,
  Row,
  Col,
  Statistic,
  Table,
  Tabs,
  Empty,
  Button,
  Spin,
} from "antd";
import {
  EyeOutlined,
  CloseOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  ToolOutlined,
  InsertRowBelowOutlined,
} from "@ant-design/icons";
import {PriceBookItem, PriceTableUI, Product, Service, ServicePackage} from "@/lib/api";

interface PriceBookDetailModalProps {
  visible: boolean;
  loading: boolean;
  selectedPriceBook: PriceTableUI | null;
  products: Product[];
  services: Service[];
  servicePackages: ServicePackage[];
  onClose: () => void;
}

const PriceBookDetailModal: React.FC<PriceBookDetailModalProps> = ({
                                                                     visible,
                                                                     loading,
                                                                     selectedPriceBook,
                                                                     products,
                                                                     services,
                                                                     servicePackages,
                                                                     onClose,
                                                                   }) => {
  const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined) return "N/A";
    return `${amount.toLocaleString("vi-VN")} ₫`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case "PRODUCT":
        return <ShoppingOutlined style={{color: "#1890ff"}}/>;
      case "SERVICE":
        return <ToolOutlined style={{color: "#52c41a"}}/>;
      case "SERVICE_PACKAGE":
        return <InsertRowBelowOutlined style={{color: "#fa8c16"}}/>;
      default:
        return <AppstoreOutlined/>;
    }
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case "PRODUCT":
        return "Sản phẩm";
      case "SERVICE":
        return "Dịch vụ";
      case "SERVICE_PACKAGE":
        return "Gói dịch vụ";
      default:
        return type;
    }
  };

  const getItemTypeCounts = (items: PriceBookItem[]) => {
    const counts = {
      PRODUCT: 0,
      SERVICE: 0,
      SERVICE_PACKAGE: 0,
    };
    items?.forEach((item) => {
      counts[item.item_type]++;
    });
    return counts;
  };

  const getProductInfo = (productId: string) => {
    return products.find((p) => p.product_id === productId) || null;
  };

  const getServiceInfo = (serviceId: string) => {
    return services.find((s) => s.service_id === serviceId) || null;
  };

  const getServicePackageInfo = (packageId: string) => {
    return servicePackages.find((p) => p.package_id === packageId) || null;
  };

  const itemColumns = [
    {
      title: "Loại",
      dataIndex: "item_type",
      key: "item_type",
      width: 140,
      render: (type: string) => (
        <Tag
          icon={getItemTypeIcon(type)}
          color={
            type === "PRODUCT" ? "blue" : type === "SERVICE" ? "green" : "orange"
          }
        >
          {getItemTypeLabel(type)}
        </Tag>
      ),
    },
    {
      title: "Tên mục",
      dataIndex: "item_name",
      key: "item_name",
      render: (text: string, record: PriceBookItem) => {
        let extraInfo = null;
        let additionalDetails = null;

        if (record.item_type === "PRODUCT" && record.product) {
          const product = getProductInfo(record.product.product_id);
          if (product) {
            extraInfo = (
              <span style={{fontSize: 12, color: "#8c8c8c"}}>
                SKU: {product.sku} | {product.brand}
              </span>
            );
          }
        } else if (record.item_type === "SERVICE" && record.service) {
          const service = getServiceInfo(record.service.service_id);
          if (service) {
            extraInfo = (
              <span style={{fontSize: 12, color: "#8c8c8c"}}>
                Mã: {service.service_id}
              </span>
            );
            additionalDetails = (
              <span style={{fontSize: 11, color: "#8c8c8c", display: "block"}}>
                Giá cơ bản: {formatCurrency(service.base_price)} | Tiền công:{" "}
                {formatCurrency(service.labor_cost)}
              </span>
            );
          }
        } else if (record.item_type === "SERVICE_PACKAGE" && record.servicePackage) {
          const pkg = getServicePackageInfo(record.servicePackage.package_id);
          if (pkg) {
            extraInfo = (
              <span style={{fontSize: 12, color: "#8c8c8c"}}>
                Loại: {pkg.service_package_type_name}
              </span>
            );
            additionalDetails = (
              <span style={{fontSize: 11, color: "#8c8c8c", display: "block"}}>
                Chi phí DV: {formatCurrency(pkg.service_cost)} | Chi phí SP:{" "}
                {formatCurrency(pkg.service_cost)}
              </span>
            );
          }
        }

        return (
          <div>
            <div style={{fontWeight: 600}}>{text}</div>
            {extraInfo}
            {additionalDetails}
          </div>
        );
      },
    },
    // {
    //   title: "Chính sách giá",
    //   dataIndex: "policy_type",
    //   key: "policy_type",
    //   width: 180,
    //   render: (policy: string) => (
    //     <Tag color={policy === "FIXED" ? "blue" : "orange"}>
    //       {policy === "FIXED" ? "Giá cố định" : "Markup theo giá vốn"}
    //     </Tag>
    //   ),
    // },
    {
      title: "Giá",
      key: "price",
      width: 180,
      render: (_: any, record: PriceBookItem) => {
        if (record.policy_type === "FIXED" && record.fixed_price) {
          return (
            <span style={{fontWeight: 600, color: "#52c41a"}}>
              {formatCurrency(record.fixed_price)}
            </span>
          );
        } else if (record.markup_percent !== null) {
          return (
            <span style={{fontWeight: 600, color: "#fa8c16"}}>
              +{record.markup_percent}%
            </span>
          );
        }
        return <span style={{color: "#8c8c8c"}}>N/A</span>;
      },
    },
  ];

  if (!selectedPriceBook) return null;

  const itemCounts = getItemTypeCounts(selectedPriceBook.items || []);

  return (
    <Modal
      title={
        <Space>
          <EyeOutlined/>
          Chi tiết bảng giá
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button
          key="close"
          type="primary"
          icon={<CloseOutlined/>}
          onClick={onClose}
        >
          Đóng
        </Button>,
      ]}
      width={1200}
      style={{top: 20}}
    >
      <Spin spinning={loading}>
        <Space direction="vertical" size={16} style={{width: "100%"}}>
          {/* Price Book Info */}
          <Card size="small" title="Thông tin bảng giá">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Mã">
                <code style={{fontWeight: 600}}>{selectedPriceBook.code}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Tên">
                <span style={{fontWeight: 600}}>{selectedPriceBook.name}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Đơn vị tiền tệ">
                <Tag color="blue">{selectedPriceBook.currency}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedPriceBook.is_active ? "success" : "default"}>
                  {selectedPriceBook.is_active ? "Đang áp dụng" : "Ngừng áp dụng"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày hiệu lực">
                <Space>
                  <CalendarOutlined style={{color: "#52c41a"}}/>
                  {formatDate(selectedPriceBook.valid_from)}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày hết hạn">
                <Space>
                  <CalendarOutlined style={{color: "#ff4d4f"}}/>
                  {selectedPriceBook.valid_to
                    ? formatDate(selectedPriceBook.valid_to)
                    : "Không giới hạn"}
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Statistics */}
          <Card title="Thống kê" size="small">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Tổng mục"
                  value={selectedPriceBook.items?.length || 0}
                  prefix={<AppstoreOutlined/>}
                  valueStyle={{color: "#1890ff"}}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Sản phẩm"
                  value={itemCounts.PRODUCT}
                  prefix={<ShoppingOutlined/>}
                  valueStyle={{color: "#1890ff"}}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Dịch vụ"
                  value={itemCounts.SERVICE}
                  prefix={<ToolOutlined/>}
                  valueStyle={{color: "#52c41a"}}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Gói dịch vụ"
                  value={itemCounts.SERVICE_PACKAGE}
                  prefix={<InsertRowBelowOutlined/>}
                  valueStyle={{color: "#fa8c16"}}
                />
              </Col>
            </Row>
          </Card>

          {/* Items List with Tabs */}
          <Card
            size="small"
            title={
              <Space>
                <span>Danh sách mục giá</span>
                <Tag color="blue">{selectedPriceBook.items?.length || 0}</Tag>
              </Space>
            }
          >
            {selectedPriceBook.items && selectedPriceBook.items.length > 0 ? (
              <Tabs defaultActiveKey="all">
                <Tabs.TabPane
                  tab={`Tất cả (${selectedPriceBook.items.length})`}
                  key="all"
                >
                  <Table
                    dataSource={selectedPriceBook.items}
                    columns={itemColumns}
                    rowKey="id"
                    pagination={{
                      pageSize: 5,
                      showTotal: (total) => `Tổng ${total} mục`,
                    }}
                    size="small"
                  />
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={
                    <span>
                      <ShoppingOutlined/> Sản phẩm ({itemCounts.PRODUCT})
                    </span>
                  }
                  key="products"
                >
                  <Table
                    dataSource={selectedPriceBook.items.filter(
                      (i) => i.item_type === "PRODUCT"
                    )}
                    columns={itemColumns}
                    rowKey="id"
                    pagination={{
                      pageSize: 5,
                      showTotal: (total) => `Tổng ${total} sản phẩm`,
                    }}
                    size="small"
                  />
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={
                    <span>
                      <ToolOutlined/> Dịch vụ ({itemCounts.SERVICE})
                    </span>
                  }
                  key="services"
                >
                  <Table
                    dataSource={selectedPriceBook.items.filter(
                      (i) => i.item_type === "SERVICE"
                    )}
                    columns={itemColumns}
                    rowKey="id"
                    pagination={{
                      pageSize: 5,
                      showTotal: (total) => `Tổng ${total} dịch vụ`,
                    }}
                    size="small"
                  />
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={
                    <span>
                      <InsertRowBelowOutlined/> Gói dịch vụ (
                      {itemCounts.SERVICE_PACKAGE})
                    </span>
                  }
                  key="packages"
                >
                  <Table
                    dataSource={selectedPriceBook.items.filter(
                      (i) => i.item_type === "SERVICE_PACKAGE"
                    )}
                    columns={itemColumns}
                    rowKey="id"
                    pagination={{
                      pageSize: 5,
                      showTotal: (total) => `Tổng ${total} gói`,
                    }}
                    size="small"
                  />
                </Tabs.TabPane>
              </Tabs>
            ) : (
              <Empty
                description="Chưa có mục giá nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Space>
      </Spin>
    </Modal>
  );
};

export default PriceBookDetailModal;
