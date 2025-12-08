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
  Tabs,
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
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Promotion,
  isPromotionExpired,
  isPromotionActive,
  formatDiscountValue,
  getUsagePercentage,
  isPromotionAvailable,
  getDiscountTypeLabel,
  getLineTypeLabel,
  LineType,
  DiscountType,
} from "@/lib/api/types/promotion.types";
import {formatDate} from "@/components/utils/helper/date.format.helper";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

dayjs.extend(relativeTime);

const {Title, Text, Paragraph} = Typography;

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

  const isExpired = isPromotionExpired(promotion.end_at);
  const isActive = isPromotionActive(promotion);
  const isAvailable = isPromotionAvailable(promotion);
  const usagePercentage = getUsagePercentage(
    promotion.total_usage_count,
    promotion.usage_limit
  );

  const getStatusInfo = () => {
    if (isExpired && promotion.is_active) {
      return {
        status: "expired",
        label: "Đã hết hạn",
        color: "gray",
        icon: <ClockCircleOutlined/>,
      };
    }

    if (isActive) {
      return {
        status: "running",
        label: "Đang chạy",
        color: "green",
        icon: <FireOutlined/>,
      };
    }

    if (!promotion.is_active) {
      return {
        status: "inactive",
        label: "Không hoạt động",
        color: "default",
        icon: <ExclamationCircleOutlined/>,
      };
    }

    return {
      status: "scheduled",
      label: "Đã lên lịch",
      color: "blue",
      icon: <CheckCircleOutlined/>,
    };
  };

  const statusInfo = getStatusInfo();

  const renderBasicInfo = () => (
    <Card size="small" style={{marginBottom: 16}}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div style={{display: "flex", alignItems: "center", gap: 12, marginBottom: 16}}>
            <span style={{fontSize: 24}}>
              <GiftOutlined style={{color: "#1890ff"}}/>
            </span>
            <div style={{flex: 1}}>
              <Title level={4} style={{margin: 0}}>
                {promotion.name}
              </Title>
              <Text type="secondary">Mã: {promotion.promotion_code || "N/A"}</Text>
            </div>
            <div>
              <Tag color={statusInfo.color} icon={statusInfo.icon}>
                {statusInfo.label}
              </Tag>
            </div>
          </div>
        </Col>

        <Col span={24}>
          <Paragraph>{promotion.description || "Không có mô tả"}</Paragraph>
        </Col>

        <Col span={8}>
          <Statistic
            title="Loại khuyến mãi"
            value={promotion.promotion_type?.typeName || "N/A"}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Độ ưu tiên"
            value={promotion.priority || 0}
            suffix={
              <Tag
                color={
                  (promotion.priority || 0) >= 8
                    ? "red"
                    : (promotion.priority || 0) >= 6
                      ? "orange"
                      : "green"
                }
              >
                {(promotion.priority || 0) >= 8
                  ? "Cao"
                  : (promotion.priority || 0) >= 6
                    ? "Trung bình"
                    : "Thấp"}
              </Tag>
            }
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Có thể xếp chồng"
            value={promotion.is_stackable ? "Có" : "Không"}
            valueStyle={{color: promotion.is_stackable ? "#52c41a" : "#f5222d"}}
          />
        </Col>
      </Row>
    </Card>
  );

  const renderTimeInfo = () => (
    <Card size="small" style={{marginBottom: 16}}>
      <Timeline
        items={[
          {
            color: "green",
            children: (
              <div>
                <Text strong>Bắt đầu: </Text>
                <Text>{promotion.start_at ? formatDate(promotion.start_at) : "Vô thời hạn"}</Text>
                <br/>
                <Text type="secondary">{dayjs(promotion.start_at).fromNow()}</Text>
              </div>
            ),
          },
          {
            color: isExpired ? "red" : isActive ? "green" : "gray",
            children: (
              <div>
                <Text strong>Kết thúc: </Text>
                <Text>{promotion.end_at ? formatDate(promotion?.end_at) : "Vô thời hạn"}</Text>
                <br/>
                <Text type="secondary">{dayjs(promotion.end_at).fromNow()}</Text>
              </div>
            ),
          },
        ]}
      />
    </Card>
  );

  const renderUsageInfo = () => (
    <Card size="small" style={{marginBottom: 16}}>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <div style={{marginBottom: 16}}>
            <div style={{display: "flex", justifyContent: "space-between", marginBottom: 8}}>
              <Text>Sử dụng tổng</Text>
              <Text strong>
                {promotion.total_usage_count || 0}/{promotion.usage_limit || "∞"}
              </Text>
            </div>
            {promotion.usage_limit && (
              <Progress
                percent={usagePercentage}
                strokeColor={
                  usagePercentage >= 90
                    ? "#f5222d"
                    : usagePercentage >= 70
                      ? "#fa8c16"
                      : "#52c41a"
                }
                showInfo={false}
              />
            )}
          </div>
        </Col>

        <Col span={12}>
          <div style={{marginBottom: 16}}>
            <div style={{display: "flex", justifyContent: "space-between", marginBottom: 8}}>
              <Text>Lần sử dụng tối đa/khách hàng</Text>
              <Text strong>
                {promotion.per_customer_limit ? "Có giới hạn" : "Không giới hạn"}
              </Text>
            </div>
            {promotion.per_customer_limit && (
              <Progress percent={100} showInfo={false}/>
            )}
          </div>
        </Col>
      </Row>

      <Alert
        message={isAvailable ? "Chương trình có thể sử dụng" : "Chương trình không khả dụng"}
        type={isAvailable ? "success" : "warning"}
        showIcon
        style={{marginTop: 16}}
      />
    </Card>
  );

  const renderPromotionLines = () => (
    <Card size="small" style={{marginBottom: 16}}>
      {promotion.promotion_lines && promotion.promotion_lines.length > 0 ? (
        <div>
          {promotion.promotion_lines.map((line, index) => (
            <div key={line.promotion_line_id || index} style={{marginBottom: 12}}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 8}}>
                <Badge
                  count={index + 1}
                  style={{backgroundColor: line.is_active ? "#52c41a" : "#d9d9d9"}}
                />
                <Tag color={line.is_active ? "green" : "default"}>
                  {getLineTypeLabel(line.line_type as LineType)}
                </Tag>
                <Text strong>{getDiscountTypeLabel(line.discount_type as DiscountType)}</Text>
                <Text style={{marginLeft: "auto"}}>
                  {formatDiscountValue(line.discount_type as DiscountType, line.discount_value)}
                </Text>
              </div>

              <Row gutter={[8, 8]} style={{marginLeft: 16, marginBottom: 8}}>
                {line.min_order_value && (
                  <Col span={12}>
                    <Text type="secondary" style={{fontSize: 12}}>
                      Đơn tối thiểu: {formatCurrency(line.min_order_value)}
                    </Text>
                  </Col>
                )}
                {line.min_quantity && (
                  <Col span={12}>
                    <Text type="secondary" style={{fontSize: 12}}>
                      Số lượng tối thiểu: {line.min_quantity}
                    </Text>
                  </Col>
                )}
                {line.max_discount_amount && (
                  <Col span={12}>
                    <Text type="secondary" style={{fontSize: 12}}>
                      Tối đa giảm: {formatCurrency(line.max_discount_amount)}
                    </Text>
                  </Col>
                )}
              </Row>

              {index < promotion.promotion_lines!.length - 1 && (
                <Divider style={{margin: "8px 0"}}/>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Alert
          message="Không có dòng khuyến mãi"
          description="Chương trình này không có chi tiết khuyến mãi."
          type="info"
          showIcon
        />
      )}
    </Card>
  );

  const renderBranchInfo = () => (
    <Card size="small" style={{marginBottom: 16}}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div>
            <Text strong>Chi nhánh áp dụng:</Text>
            <div style={{marginTop: 8}}>
              {promotion.branch ? (
                <Tag color="blue">{promotion.branch.branchName}</Tag>
              ) : (
                <Text type="secondary">Tất cả chi nhánh</Text>
              )}
            </div>
          </div>
        </Col>

        <Col span={12}>
          <div>
            <Text strong>Mã khuyến mãi chỉ dùng 1 lần:</Text>
            <div style={{marginTop: 8}}>
              <Tag color={promotion.coupon_redeem_once ? "red" : "green"}>
                {promotion.coupon_redeem_once ? "Có" : "Không"}
              </Tag>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );

  return (
    <Modal
      title={
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
          <GiftOutlined style={{color: "#1890ff"}}/>
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
        ...(onEdit
          ? [
            <Button
              key="edit"
              type="primary"
              icon={<EditOutlined/>}
              onClick={() => onEdit(promotion)}
            >
              Chỉnh sửa
            </Button>,
          ]
          : []),
        ...(onDuplicate
          ? [
            <Button
              key="duplicate"
              icon={<CopyOutlined/>}
              onClick={() => onDuplicate(promotion)}
            >
              Sao chép
            </Button>,
          ]
          : []),
        ...(onToggleStatus
          ? [
            <Button
              key="toggle"
              type={promotion.is_active ? "default" : "primary"}
              onClick={() => onToggleStatus(promotion)}
            >
              {promotion.is_active ? "Tạm dừng" : "Kích hoạt"}
            </Button>,
          ]
          : []),
        ...(onDelete
          ? [
            <Button
              key="delete"
              danger
              icon={<DeleteOutlined/>}
              onClick={() => onDelete(promotion)}
            >
              Xóa
            </Button>,
          ]
          : []),
      ]}
      destroyOnHidden
    >
      <div style={{maxHeight: "70vh", overflowY: "auto"}}>
        <Tabs
          defaultActiveKey="basic"
          type="card"
          items={[
            {
              key: "basic",
              label: (
                <span>
                  <GiftOutlined/> Thông tin cơ bản
                </span>
              ),
              children: (
                <>
                  {renderBasicInfo()}
                  {renderTimeInfo()}
                </>
              ),
            },
            {
              key: "usage",
              label: (
                <span>
                  <UserOutlined/> Thống kê sử dụng
                </span>
              ),
              children: renderUsageInfo(),
            },
            {
              key: "lines",
              label: (
                <span>
                  <ShoppingCartOutlined/> Dòng khuyến mãi ({promotion.promotion_lines?.length || 0})
                </span>
              ),
              children: renderPromotionLines(),
            },
            {
              key: "settings",
              label: (
                <span>
                  <StarOutlined/> Cài đặt
                </span>
              ),
              children: renderBranchInfo(),
            },
          ]}
        />
      </div>
    </Modal>
  );
};

export default PromotionDetailModal;
