import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Alert, Spin, Tag, Tooltip, Space } from 'antd';
import { 
  ShopOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  CarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useBayRecommendation } from '@/lib/api/hooks/useWalkInBooking';
import { 
  BayRecommendationProps, 
  BayInfo, 
  BookingQueueItem,
  PRIORITY_LEVELS 
} from '@/lib/api/types/walk-in-booking.types';

/**
 * Component hiển thị đề xuất bay và hàng chờ
 */
const BayRecommendation: React.FC<BayRecommendationProps> = ({
  branchId,
  serviceDuration,
  serviceType,
  onBaySelected,
  onRecommendationReceived,
}) => {
  const { recommendation, loading, error, recommendBay } = useBayRecommendation();
  const [selectedBay, setSelectedBay] = useState<string | null>(null);

  // Tự động đề xuất bay khi component mount
  useEffect(() => {
    if (branchId && serviceDuration > 0) {
      recommendBay(branchId, serviceDuration, serviceType);
    }
  }, [branchId, serviceDuration, serviceType, recommendBay]);

  // Notify parent component when recommendation is received
  useEffect(() => {
    if (recommendation) {
      onRecommendationReceived(recommendation);
    }
  }, [recommendation, onRecommendationReceived]);

  const handleBaySelect = (bayId: string) => {
    setSelectedBay(bayId);
    onBaySelected(bayId);
  };

  const handleRefresh = () => {
    if (branchId && serviceDuration > 0) {
      recommendBay(branchId, serviceDuration, serviceType);
    }
  };

  if (loading) {
    return (
      <Card title="🎯 Hệ thống đang đề xuất bay..." style={{ marginBottom: 16 }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#666' }}>
            Đang phân tích và đề xuất bay tốt nhất...
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="❌ Lỗi đề xuất bay" style={{ marginBottom: 16 }}>
        <Alert
          message="Không thể đề xuất bay"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={handleRefresh}>
              Thử lại
            </Button>
          }
        />
      </Card>
    );
  }

  if (!recommendation) {
    return (
      <Card title="ℹ️ Chưa có đề xuất bay" style={{ marginBottom: 16 }}>
        <Alert
          message="Chưa có đề xuất bay"
          description="Vui lòng chọn chi nhánh và dịch vụ để hệ thống đề xuất bay"
          type="info"
          showIcon
        />
      </Card>
    );
  }

  return (
    <div>
      {/* Recommended Bay */}
      <Card 
        title="🎯 Bay được đề xuất" 
        style={{ marginBottom: 16 }}
        extra={
          <Button size="small" onClick={handleRefresh}>
             Làm mới
          </Button>
        }
      >
        <BayCard
          bay={recommendation.recommended_bay}
          isRecommended={true}
          isSelected={selectedBay === recommendation.recommended_bay.bay_id}
          onSelect={() => handleBaySelect(recommendation.recommended_bay.bay_id)}
          reason={recommendation.reason}
          estimatedWaitTime={recommendation.estimated_wait_time}
        />
      </Card>

      {/* Queue Information */}
      <Card title="📋 Hàng chờ hiện tại" style={{ marginBottom: 16 }}>
        <QueueInfo 
          queue={recommendation.queue}
          estimatedWaitTime={recommendation.estimated_wait_time}
        />
      </Card>

      {/* Alternative Bays */}
      {recommendation.alternative_bays.length > 0 && (
        <Card title=" Bay thay thế" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            {recommendation.alternative_bays.map((bay) => (
              <Col span={8} key={bay.bay_id}>
                <BayCard
                  bay={bay}
                  isRecommended={false}
                  isSelected={selectedBay === bay.bay_id}
                  onSelect={() => handleBaySelect(bay.bay_id)}
                />
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  );
};

/**
 * Component hiển thị thông tin bay
 */
interface BayCardProps {
  bay: BayInfo;
  isRecommended: boolean;
  isSelected: boolean;
  onSelect: () => void;
  reason?: string;
  estimatedWaitTime?: number;
}

const BayCard: React.FC<BayCardProps> = ({
  bay,
  isRecommended,
  isSelected,
  onSelect,
  reason,
  estimatedWaitTime,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#52c41a';
      case 'INACTIVE': return '#8c8c8c';
      case 'MAINTENANCE': return '#faad14';
      case 'UNAVAILABLE': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircleOutlined />;
      case 'INACTIVE': return <ExclamationCircleOutlined />;
      case 'MAINTENANCE': return <ExclamationCircleOutlined />;
      case 'UNAVAILABLE': return <ExclamationCircleOutlined />;
      default: return <ExclamationCircleOutlined />;
    }
  };

  return (
    <Card
      hoverable
      style={{
        border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
        backgroundColor: isSelected ? '#e6f7ff' : '#fff',
        cursor: 'pointer',
      }}
      onClick={onSelect}
    >
      <div style={{ textAlign: 'center' }}>
        <ShopOutlined 
          style={{ 
            fontSize: 32, 
            color: isRecommended ? '#1890ff' : '#52c41a',
            marginBottom: 8 
          }} 
        />
        
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
            {bay.bay_name}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {bay.bay_code}
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <Tag 
            color={getStatusColor(bay.status)}
            icon={getStatusIcon(bay.status)}
          >
            {bay.status}
          </Tag>
          {isRecommended && (
            <Tag color="blue">Đề xuất</Tag>
          )}
        </div>

        {reason && (
          <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
            💡 {reason}
          </div>
        )}

        {estimatedWaitTime !== undefined && (
          <div style={{ fontSize: 12, color: '#1890ff' }}>
            ⏱️ Chờ: {estimatedWaitTime} phút
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Component hiển thị thông tin hàng chờ
 */
interface QueueInfoProps {
  queue: BookingQueueItem[];
  estimatedWaitTime: number;
}

const QueueInfo: React.FC<QueueInfoProps> = ({ queue, estimatedWaitTime }) => {
  if (queue.length === 0) {
    return (
      <Alert
        message="Hàng chờ trống"
        description="Bay này hiện tại không có booking nào trong hàng chờ"
        type="success"
        showIcon
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Tag color="blue">
            <UserOutlined /> {queue.length} booking
          </Tag>
          <Tag color="orange">
            <ClockCircleOutlined /> Chờ: {estimatedWaitTime} phút
          </Tag>
        </Space>
      </div>

      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
        {queue.map((item, index) => (
          <Card
            key={item.booking_id}
            size="small"
            style={{ marginBottom: 8 }}
            title={
              <Space>
                <span>#{item.queue_position}</span>
                <span>{item.customer_name}</span>
                <Tag color="blue">{item.status}</Tag>
              </Space>
            }
          >
            <Row gutter={8}>
              <Col span={12}>
                <div style={{ fontSize: 12, color: '#666' }}>
                  <CarOutlined /> {item.vehicle_license_plate}
                </div>
              </Col>
              <Col span={12}>
                <div style={{ fontSize: 12, color: '#666' }}>
                  <ClockCircleOutlined /> {item.estimated_start_time}
                </div>
              </Col>
            </Row>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BayRecommendation;
