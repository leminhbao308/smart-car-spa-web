"use client";
import React from "react";
import {
  Modal,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Progress,
  Statistic,
  Timeline,
  Divider,
  Space,
  Button,
  Tooltip,
  Badge,
  Alert,
} from "antd";
import {
  GiftOutlined,
  CalendarOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  FireOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CopyOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  Promotion,
  getPromotionTypeLabel,
  getPromotionTypeIcon,
  getPromotionStatusLabel,
  getPromotionStatusColor,
  isPromotionExpired,
  isPromotionActive,
  formatPromotionValue,
  getUsagePercentage,
  isPromotionAvailable,
} from "@/lib/api/types/promotion.types";
import { formatDate } from "@/components/utils/helper/date.format.helper";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Title, Text, Paragraph } = Typography;

interface PromotionDetailModalProps {
  open: boolean;
  onCancel: () => void;
  promotion: Promotion | null;
  onEdit?: (promotion: Promotion) => void;
  onDuplicate?: (promotion: Promotion) => void;
  onDelete?: (promotion: Promotion) => void;
  onToggleStatus?: (promotion: Promotion) => void;
}

const PromotionDetailModal: React.FC<PromotionDetailModalProps> = ({
  open,
  onCancel,
  promotion,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleStatus,
}) => {
  if (!promotion) return null;

  const isExpired = isPromotionExpired(promotion.endDate);
  const isActive = isPromotionActive(promotion.startDate, promotion.endDate, promotion.status);
  const isAvailable = isPromotionAvailable(promotion);
  const usagePercentage = getUsagePercentage(promotion.usedCount, promotion.usageLimit);
  const customerUsagePercentage = getUsagePercentage(promotion.customerUsedCount, promotion.customerLimit);

  const getStatusInfo = () => {
    if (isExpired && promotion.status === "active") {
      return {
        status: "expired",
        label: "Đã hết hạn",
        color: "gray",
        icon: <ClockCircleOutlined />,
      };
    }
    
    if (isActive) {
      return {
        status: "running",
        label: "Đang chạy",
        color: "green",
        icon: <FireOutlined />,
      };
    }

    return {
      status: promotion.status,
      label: getPromotionStatusLabel(promotion.status),
      color: getPromotionStatusColor(promotion.status),
      icon: promotion.status === "active" ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />,
    };
  };

  const statusInfo = getStatusInfo();

  const renderBasicInfo = () => (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <GiftOutlined style={{ color: "#1890ff" }} />
          <span>Thông tin cơ bản</span>
        </div>
      }
      size="small"
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>
              {getPromotionTypeIcon(promotion.type)}
            </span>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {promotion.name}
              </Title>
              <Text type="secondary">Mã: {promotion.code}</Text>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <Tag color={statusInfo.color} icon={statusInfo.icon}>
                {statusInfo.label}
              </Tag>
              {promotion.isPublic && (
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  Công khai
                </Tag>
              )}
            </div>
          </div>
        </Col>
        
        <Col span={24}>
          <Paragraph>{promotion.description}</Paragraph>
        </Col>

        <Col span={8}>
          <Statistic
            title="Loại khuyến mãi"
            value={getPromotionTypeLabel(promotion.type)}
            prefix={getPromotionTypeIcon(promotion.type)}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Giá trị"
            value={formatPromotionValue(promotion.type, promotion.value)}
            valueStyle={{ color: "#f5222d" }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Độ ưu tiên"
            value={promotion.priority}
            suffix={
              <Tag color={promotion.priority >= 8 ? "red" : promotion.priority >= 6 ? "orange" : "green"}>
                {promotion.priority >= 8 ? "Cao" : promotion.priority >= 6 ? "Trung bình" : "Thấp"}
              </Tag>
            }
          />
        </Col>
      </Row>
    </Card>
  );

  const renderTimeInfo = () => (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CalendarOutlined style={{ color: "#722ed1" }} />
          <span>Thời gian áp dụng</span>
        </div>
      }
      size="small"
    >
      <Timeline
        items={[
          {
            color: "green",
            children: (
              <div>
                <Text strong>Bắt đầu: </Text>
                <Text>{formatDate(promotion.startDate)}</Text>
                <br />
                <Text type="secondary">
                  {dayjs(promotion.startDate).fromNow()}
                </Text>
              </div>
            ),
          },
          {
            color: isExpired ? "red" : isActive ? "green" : "gray",
            children: (
              <div>
                <Text strong>Kết thúc: </Text>
                <Text>{formatDate(promotion.endDate)}</Text>
                <br />
                <Text type="secondary">
                  {dayjs(promotion.endDate).fromNow()}
                </Text>
              </div>
            ),
          },
        ]}
      />
      
      {promotion.notes && (
        <div style={{ marginTop: 16 }}>
          <Text strong>Ghi chú: </Text>
          <Paragraph style={{ margin: 0 }}>{promotion.notes}</Paragraph>
        </div>
      )}
    </Card>
  );

  const renderUsageInfo = () => (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <UserOutlined style={{ color: "#fa8c16" }} />
          <span>Thống kê sử dụng</span>
        </div>
      }
      size="small"
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <Text>Sử dụng tổng</Text>
              <Text strong>
                {promotion.usedCount}/{promotion.usageLimit || "∞"}
              </Text>
            </div>
            {promotion.usageLimit && (
              <Progress
                percent={usagePercentage}
                strokeColor={usagePercentage >= 90 ? "#f5222d" : usagePercentage >= 70 ? "#fa8c16" : "#52c41a"}
                showInfo={false}
              />
            )}
          </div>
        </Col>
        
        <Col span={12}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <Text>Khách hàng</Text>
              <Text strong>
                {promotion.customerUsedCount}/{promotion.customerLimit || "∞"}
              </Text>
            </div>
            {promotion.customerLimit && (
              <Progress
                percent={customerUsagePercentage}
                strokeColor={customerUsagePercentage >= 90 ? "#f5222d" : customerUsagePercentage >= 70 ? "#fa8c16" : "#52c41a"}
                showInfo={false}
              />
            )}
          </div>
        </Col>
      </Row>

      <Alert
        message={isAvailable ? "Chương trình có thể sử dụng" : "Chương trình không khả dụng"}
        type={isAvailable ? "success" : "warning"}
        showIcon
        style={{ marginTop: 16 }}
      />
    </Card>
  );

  const renderTargetAudience = () => (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StarOutlined style={{ color: "#52c41a" }} />
          <span>Đối tượng áp dụng</span>
        </div>
      }
      size="small"
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <div>
            <Text strong>Loại khách hàng:</Text>
            <div style={{ marginTop: 8 }}>
              {promotion.targetAudience.customerTypes.length > 0 ? (
                promotion.targetAudience.customerTypes.map((type) => (
                  <Tag key={type} color="blue" style={{ marginBottom: 4 }}>
                    {type === "all" ? "Tất cả" : type}
                  </Tag>
                ))
              ) : (
                <Text type="secondary">Không giới hạn</Text>
              )}
            </div>
          </div>
        </Col>
        
        <Col span={12}>
          <div>
            <Text strong>Chi nhánh:</Text>
            <div style={{ marginTop: 8 }}>
              {promotion.targetAudience.branches.length > 0 ? (
                promotion.targetAudience.branches.map((branch) => (
                  <Tag key={branch} color="green" style={{ marginBottom: 4 }}>
                    {branch === "all" ? "Tất cả" : branch}
                  </Tag>
                ))
              ) : (
                <Text type="secondary">Không giới hạn</Text>
              )}
            </div>
          </div>
        </Col>
        
        <Col span={12}>
          <div>
            <Text strong>Dịch vụ:</Text>
            <div style={{ marginTop: 8 }}>
              {promotion.targetAudience.services.length > 0 ? (
                promotion.targetAudience.services.map((service) => (
                  <Tag key={service} color="purple" style={{ marginBottom: 4 }}>
                    {service === "all" ? "Tất cả" : service}
                  </Tag>
                ))
              ) : (
                <Text type="secondary">Không giới hạn</Text>
              )}
            </div>
          </div>
        </Col>
        
        <Col span={12}>
          <div>
            <Text strong>Sản phẩm:</Text>
            <div style={{ marginTop: 8 }}>
              {promotion.targetAudience.products.length > 0 ? (
                promotion.targetAudience.products.map((product) => (
                  <Tag key={product} color="orange" style={{ marginBottom: 4 }}>
                    {product === "all" ? "Tất cả" : product}
                  </Tag>
                ))
              ) : (
                <Text type="secondary">Không giới hạn</Text>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );

  const renderConditions = () => (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <InfoCircleOutlined style={{ color: "#13c2c2" }} />
          <span>Điều kiện áp dụng ({promotion.conditions.length})</span>
        </div>
      }
      size="small"
    >
      {promotion.conditions.length === 0 ? (
        <Alert
          message="Không có điều kiện"
          description="Chương trình này không có điều kiện áp dụng đặc biệt."
          type="info"
          showIcon
        />
      ) : (
        <div>
          {promotion.conditions.map((condition, index) => (
            <div key={condition.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Badge
                  count={index + 1}
                  style={{ backgroundColor: condition.isRequired ? "#f5222d" : "#1890ff" }}
                />
                <Tag color={condition.isRequired ? "red" : "blue"}>
                  {condition.isRequired ? "Bắt buộc" : "Tùy chọn"}
                </Tag>
                <Text>{condition.description}</Text>
              </div>
              {index < promotion.conditions.length - 1 && <Divider style={{ margin: "8px 0" }} />}
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  const renderBenefitsAndTerms = () => (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ShoppingCartOutlined style={{ color: "#eb2f96" }} />
          <span>Lợi ích và điều khoản</span>
        </div>
      }
      size="small"
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <div>
            <Text strong>Lợi ích:</Text>
            <div style={{ marginTop: 8 }}>
              {promotion.benefits.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {promotion.benefits.map((benefit, index) => (
                    <li key={index}>
                      <Text>{benefit}</Text>
                    </li>
                  ))}
                </ul>
              ) : (
                <Text type="secondary">Không có lợi ích được liệt kê</Text>
              )}
            </div>
          </div>
        </Col>
        
        <Col span={12}>
          <div>
            <Text strong>Điều khoản:</Text>
            <div style={{ marginTop: 8 }}>
              {promotion.terms.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {promotion.terms.map((term, index) => (
                    <li key={index}>
                      <Text>{term}</Text>
                    </li>
                  ))}
                </ul>
              ) : (
                <Text type="secondary">Không có điều khoản được liệt kê</Text>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <GiftOutlined style={{ color: "#1890ff" }} />
          <span>Chi tiết chương trình khuyến mãi</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
        ...(onEdit ? [
          <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => onEdit(promotion)}>
            Chỉnh sửa
          </Button>
        ] : []),
        ...(onDuplicate ? [
          <Button key="duplicate" icon={<CopyOutlined />} onClick={() => onDuplicate(promotion)}>
            Sao chép
          </Button>
        ] : []),
        ...(onToggleStatus ? [
          <Button 
            key="toggle" 
            type={promotion.isActive ? "default" : "primary"}
            onClick={() => onToggleStatus(promotion)}
          >
            {promotion.isActive ? "Tạm dừng" : "Kích hoạt"}
          </Button>
        ] : []),
        ...(onDelete ? [
          <Button key="delete" danger icon={<DeleteOutlined />} onClick={() => onDelete(promotion)}>
            Xóa
          </Button>
        ] : []),
      ]}
      destroyOnHidden
    >
      <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {renderBasicInfo()}
          {renderTimeInfo()}
          {renderUsageInfo()}
          {renderTargetAudience()}
          {renderConditions()}
          {renderBenefitsAndTerms()}
        </Space>
      </div>
    </Modal>
  );
};

export default PromotionDetailModal;
