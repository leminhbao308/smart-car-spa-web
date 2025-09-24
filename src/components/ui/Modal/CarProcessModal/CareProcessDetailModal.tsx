"use client";
import React from "react";
import {
  Modal,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Divider,
  Space,
  Descriptions,
  Progress,
} from "antd";
import {
  ClockCircleOutlined,
  DollarOutlined,
  CarOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { CareProcess } from "@/components/utils/data/care-processes.data";
import {
  getCategoryColor,
  getCategoryIcon,
  getCategoryLabel,
  getStepCategoryColor,
  getStepCategoryIcon,
  getStepCategoryLabel,
} from "@/components/utils/helper/care.process.helper";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import { formatTime } from "@/components/utils/helper/duration.format.helper";

const { Title, Text, Paragraph } = Typography;

interface CareProcessDetailModalProps {
  open: boolean;
  onCancel: () => void;
  process: CareProcess | null;
}

const CareProcessDetailModal: React.FC<CareProcessDetailModalProps> = ({
  open,
  onCancel,
  process,
}) => {
  if (!process) return null;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStepStatusColor = (index: number, totalSteps: number) => {
    // Giả sử hiển thị tất cả các bước như đã hoàn thành để demo
    return "green";
  };

  const getStepStatusIcon = (index: number, totalSteps: number) => {
    // Giả sử hiển thị tất cả các bước như đã hoàn thành để demo
    return <CheckCircleOutlined />;
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 24, marginRight: 12 }}>
            {getCategoryIcon(process.category)}
          </span>
          <span>Chi tiết quy trình: {process.name}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1000}
      style={{ top: 20 }}
    >
      <div>
        {/* Thông tin cơ bản */}
        <Card title="Thông tin cơ bản" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Tên quy trình">
                  <Text strong>{process.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Loại quy trình">
                  <Tag
                    color={getCategoryColor(process.category)}
                    icon={getCategoryIcon(process.category)}
                  >
                    {getCategoryLabel(process.category)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả">
                  <Paragraph style={{ margin: 0 }}>
                    {process.description}
                  </Paragraph>
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Thời gian ước tính">
                  <Space>
                    <ClockCircleOutlined style={{ color: "#1890ff" }} />
                    <Text strong>{formatTime(process.estimatedDuration)}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Giá dịch vụ">
                  <Space>
                    <DollarOutlined style={{ color: "#52c41a" }} />
                    <Text strong style={{ color: "#52c41a" }}>
                      {formatCurrency(process.price)}
                    </Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Số bước">
                  <Space>
                    <SettingOutlined style={{ color: "#722ed1" }} />
                    <Text strong>{process.steps.length} bước</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {process.status === "discontinued" ? (
                    <Tag color="red" icon={<DeleteOutlined />}>
                      Ngừng cung cấp
                    </Tag>
                  ) : process.isActive ? (
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                      Đang hoạt động
                    </Tag>
                  ) : (
                    <Tag color="orange" icon={<InfoCircleOutlined />}>
                      Tạm dừng
                    </Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>

          <Divider />

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Text strong>Loại xe áp dụng:</Text>
              <div style={{ marginTop: 8 }}>
                {process.targetVehicleTypes.map((type, index) => (
                  <Tag key={index} style={{ marginBottom: 4 }}>
                    <CarOutlined style={{ marginRight: 4 }} />
                    {type}
                  </Tag>
                ))}
              </div>
            </Col>
          </Row>
        </Card>

        {/* Quy trình step-by-step */}
        <Card title="Quy trình thực hiện" style={{ marginBottom: 16 }}>
          <div>
            {process.steps.map((step, index) => (
              <Card
                key={step.id}
                size="small"
                style={{ 
                  marginBottom: 16, 
                  border: "1px solid #f0f0f0",
                  borderRadius: 8
                }}
                bodyStyle={{ padding: 16 }}
              >
                {/* Header của bước */}
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  marginBottom: 12,
                  paddingBottom: 8,
                  borderBottom: "1px solid #f0f0f0"
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    backgroundColor: "#1890ff",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    fontSize: 14,
                    fontWeight: "bold"
                  }}>
                    {step.order}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 20, marginRight: 8 }}>
                        {getStepCategoryIcon(step.category)}
                      </span>
                      <Text strong style={{ fontSize: 16 }}>
                        {step.name}
                      </Text>
                      <Tag 
                        color={getStepCategoryColor(step.category)}
                        style={{ marginLeft: 8 }}
                      >
                        {getStepCategoryLabel(step.category)}
                      </Tag>
                      {step.isRequired && (
                        <Tag color="red" style={{ marginLeft: 4 }}>
                          Bắt buộc
                        </Tag>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <ClockCircleOutlined style={{ marginRight: 4, color: "#1890ff" }} />
                      <Text style={{ color: "#666" }}>
                        Thời gian: {formatTime(step.estimatedTime)}
                      </Text>
                    </div>
                  </div>
                </div>

                {/* Mô tả bước */}
                <div style={{ marginBottom: 16 }}>
                  <Text style={{ color: "#666", fontSize: 14 }}>
                    {step.description}
                  </Text>
                </div>

                {/* Chi tiết bước - Layout 2 cột */}
                <Row gutter={[16, 12]}>
                  {/* Cột trái - Dụng cụ và Vật liệu */}
                  <Col span={12}>
                    {step.requiredTools.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          marginBottom: 6,
                          color: "#1890ff"
                        }}>
                          <span style={{ marginRight: 6 }}>🔧</span>
                          <Text strong style={{ fontSize: 13 }}>
                            Dụng cụ cần thiết
                          </Text>
                        </div>
                        <div style={{ 
                          backgroundColor: "#f6ffed", 
                          padding: 8, 
                          borderRadius: 4,
                          border: "1px solid #b7eb8f"
                        }}>
                          {step.requiredTools.map((tool, idx) => (
                            <Tag 
                              key={idx} 
                              size="small" 
                              style={{ 
                                marginBottom: 4,
                                backgroundColor: "#f6ffed",
                                border: "1px solid #b7eb8f",
                                color: "#52c41a"
                              }}
                            >
                              {tool}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )}

                    {step.requiredMaterials.length > 0 && (
                      <div>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          marginBottom: 6,
                          color: "#52c41a"
                        }}>
                          <span style={{ marginRight: 6 }}>📦</span>
                          <Text strong style={{ fontSize: 13 }}>
                            Vật liệu cần thiết
                          </Text>
                        </div>
                        <div style={{ 
                          backgroundColor: "#f6ffed", 
                          padding: 8, 
                          borderRadius: 4,
                          border: "1px solid #b7eb8f"
                        }}>
                          {step.requiredMaterials.map((material, idx) => (
                            <Tag 
                              key={idx} 
                              size="small" 
                              style={{ 
                                marginBottom: 4,
                                backgroundColor: "#f6ffed",
                                border: "1px solid #b7eb8f",
                                color: "#52c41a"
                              }}
                            >
                              {material}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )}
                  </Col>

                  {/* Cột phải - Hướng dẫn */}
                  <Col span={12}>
                    {step.instructions.length > 0 && (
                      <div>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          marginBottom: 6,
                          color: "#722ed1"
                        }}>
                          <span style={{ marginRight: 6 }}>📋</span>
                          <Text strong style={{ fontSize: 13 }}>
                            Hướng dẫn thực hiện
                          </Text>
                        </div>
                        <div style={{ 
                          backgroundColor: "#f9f0ff", 
                          padding: 8, 
                          borderRadius: 4,
                          border: "1px solid #d3adf7"
                        }}>
                          {step.instructions.map((instruction, idx) => (
                            <div 
                              key={idx} 
                              style={{ 
                                fontSize: 12, 
                                marginBottom: 4,
                                color: "#722ed1",
                                paddingLeft: 8,
                                position: "relative"
                              }}
                            >
                              <span style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                color: "#722ed1"
                              }}>•</span>
                              {instruction}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Col>
                </Row>

                {/* Kiểm tra chất lượng và Lưu ý an toàn */}
                {(step.qualityChecklist.length > 0 || step.safetyNotes.length > 0) && (
                  <Row gutter={[16, 12]} style={{ marginTop: 12 }}>
                    {step.qualityChecklist.length > 0 && (
                      <Col span={12}>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          marginBottom: 6,
                          color: "#fa8c16"
                        }}>
                          <span style={{ marginRight: 6 }}>✅</span>
                          <Text strong style={{ fontSize: 13 }}>
                            Kiểm tra chất lượng
                          </Text>
                        </div>
                        <div style={{ 
                          backgroundColor: "#fff7e6", 
                          padding: 8, 
                          borderRadius: 4,
                          border: "1px solid #ffd591"
                        }}>
                          {step.qualityChecklist.map((item, idx) => (
                            <div 
                              key={idx} 
                              style={{ 
                                fontSize: 12, 
                                marginBottom: 4,
                                color: "#fa8c16",
                                paddingLeft: 8,
                                position: "relative"
                              }}
                            >
                              <span style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                color: "#fa8c16"
                              }}>•</span>
                              {item}
                            </div>
                          ))}
                        </div>
                      </Col>
                    )}

                    {step.safetyNotes.length > 0 && (
                      <Col span={12}>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          marginBottom: 6,
                          color: "#f5222d"
                        }}>
                          <span style={{ marginRight: 6 }}>⚠️</span>
                          <Text strong style={{ fontSize: 13 }}>
                            Lưu ý an toàn
                          </Text>
                        </div>
                        <div style={{ 
                          backgroundColor: "#fff2f0", 
                          padding: 8, 
                          borderRadius: 4,
                          border: "1px solid #ffccc7"
                        }}>
                          {step.safetyNotes.map((note, idx) => (
                            <div 
                              key={idx} 
                              style={{ 
                                fontSize: 12, 
                                marginBottom: 4,
                                color: "#f5222d",
                                paddingLeft: 8,
                                position: "relative"
                              }}
                            >
                              <span style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                color: "#f5222d"
                              }}>•</span>
                              {note}
                            </div>
                          ))}
                        </div>
                      </Col>
                    )}
                  </Row>
                )}
              </Card>
            ))}
          </div>
        </Card>

      </div>
    </Modal>
  );
};

export default CareProcessDetailModal;
