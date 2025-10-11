import React, { useState } from "react";
import {
  Modal,
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Descriptions,
  Statistic,
  Space,
  Button,
  Table,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  CarOutlined,
  FileTextOutlined,
  StarOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

interface CareProcessDetailModalProps {
  open: boolean;
  onCancel: () => void;
  process: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const CareProcessDetailModal: React.FC<CareProcessDetailModalProps> = ({
  open,
  onCancel,
  process,
}) => {
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedStepProducts, setSelectedStepProducts] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [selectedStepName, setSelectedStepName] = useState("");

  const handleViewProducts = (
    stepProducts: unknown[],
    stepName: string
  ) => {
    setSelectedStepProducts(stepProducts as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any
    setSelectedStepName(stepName);
    setProductModalOpen(true);
  };

  if (!process) return null;

  // Debug: Log process data to check estimatedDuration
  console.log("Process data:", process);
  console.log("Estimated duration:", process.estimatedDuration);

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "#1890ff",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: "bold",
            }}
          >
            <CarOutlined />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
              {process.name}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {process.code || "N/A"}
            </Text>
          </div>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1000}
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
      <div style={{ padding: "0 4px" }}>
        {/* Overview Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card size="small" style={{ textAlign: "center" }}>
              <Statistic
                title="Tổng số bước"
                value={process.stepCount || process.processSteps?.length || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: "#1890ff", fontSize: 20 }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: "center" }}>
              <Statistic
                title="Thời gian ước tính"
                value={process.estimatedDuration ?? 0}
                suffix="phút"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#52c41a", fontSize: 20 }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: "center" }}>
              <Statistic
                title="Loại quy trình"
                value={process.isDefault ? "Mặc định" : "Tùy chỉnh"}
                prefix={<StarOutlined />}
                valueStyle={{
                  color: process.isDefault ? "#fa8c16" : "#722ed1",
                  fontSize: 16,
                }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{ fontSize: 12, color: "#8c8c8c", marginBottom: 4 }}
                >
                  Trạng thái
                </div>
                {process.isActive ? (
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    Đang hoạt động
                  </Tag>
                ) : (
                  <Tag color="red" icon={<DeleteOutlined />}>
                    Tạm dừng
                  </Tag>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Basic Information */}
        <Card title="Thông tin cơ bản" style={{ marginBottom: 16 }}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Tên quy trình">
              <Text strong>{process.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              <Text>{process.description || "Không có mô tả"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Space wrap>
                {process.isDefault && (
                  <Tag color="gold" icon={<StarOutlined />}>
                    Mặc định
                  </Tag>
                )}
                {process.isActive ? (
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    Đang hoạt động
                  </Tag>
                ) : (
                  <Tag color="red" icon={<DeleteOutlined />}>
                    Tạm dừng
                  </Tag>
                )}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Process Timeline - Vertical with Split Cards */}
        <Card title="Quy trình thực hiện" style={{ marginBottom: 16 }}>
          <div style={{ position: "relative", paddingLeft: 40 }}>
            {(process.processSteps || process.steps || []).map(
              (
                step: any, // eslint-disable-line @typescript-eslint/no-explicit-any
                index: number,
                array: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
              ) => (
                <div
                  key={step.id}
                  style={{ position: "relative", marginBottom: 24 }}
                >
                  {/* Timeline Line */}
                  {index < array.length - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        left: -20,
                        top: 50,
                        width: 3,
                        height: "calc(100% + 24px)",
                        backgroundColor: "#d9d9d9",
                        zIndex: 1,
                      }}
                    />
                  )}

                  {/* Timeline Node */}
                  <div
                    style={{
                      position: "absolute",
                      left: -40,
                      top: -5,
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      backgroundColor: index % 2 === 0 ? "#1890ff" : "#52c41a",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: "bold",
                      border: "4px solid white",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      zIndex: 2,
                    }}
                  >
                    {step.stepOrder || step.order || index + 1}
                  </div>

                  {/* Frame bên ngoài - Bao bọc cả 2 card */}
                  <div
                    style={{
                      backgroundColor: "#fafafa",
                      border: "1px solid #e8e8e8",
                      borderRadius: 12,
                      padding: 16,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      marginLeft: 0,
                    }}
                  >
                    {/* Two Separate Cards Layout */}
                    <Row gutter={[16, 16]}>
                      {/* Card 1 - Thông tin step */}
                      <Col span={16}>
                        <div
                          style={{
                            backgroundColor: "white",
                            border: "1px solid #e8e8e8",
                            borderRadius: 8,
                            padding: 20,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            minHeight: 200,
                          }}
                        >
                          {/* Tên step */}
                          <div style={{ marginBottom: 12 }}>
                            <Text
                              strong
                              style={{
                                fontSize: 18,
                                color: index % 2 === 0 ? "#1890ff" : "#52c41a",
                                display: "block",
                              }}
                            >
                              {step.name}
                            </Text>
                          </div>

                          {/* Thời gian và trạng thái */}
                          <div style={{ marginBottom: 16 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                                marginBottom: 8,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  fontSize: 14,
                                  color: "#8c8c8c",
                                }}
                              >
                                <ClockCircleOutlined
                                  style={{ marginRight: 4 }}
                                />
                                {step.estimatedTime || 0} phút
                              </div>
                              {step.isRequired !== false && (
                                <Tag color="red">Bắt buộc</Tag>
                              )}
                            </div>
                          </div>

                          {/* Mô tả chi tiết */}
                          {step.description && (
                            <div>
                              <Text
                                style={{
                                  fontSize: 16,
                                  lineHeight: 1.6,
                                  color: "#262626",
                                  fontWeight: 500,
                                }}
                              >
                                {step.description}
                              </Text>
                            </div>
                          )}

                          {/* Step Details - Compact Layout */}
                          <Row gutter={[8, 8]}>
                            {/* Dụng cụ cần thiết */}
                            {(step.requiredTools || []).length > 0 && (
                              <Col span={12}>
                                <div
                                  style={{
                                    backgroundColor: "#f6ffed",
                                    border: "1px solid #b7eb8f",
                                    borderRadius: 6,
                                    padding: 8,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 11,
                                      fontWeight: "bold",
                                      color: "#52c41a",
                                      marginBottom: 4,
                                    }}
                                  >
                                    🔧 Dụng cụ
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: 2,
                                    }}
                                  >
                                    {(step.requiredTools || [])
                                      .slice(0, 3)
                                      .map((tool: string, idx: number) => (
                                        <Tag
                                          key={idx}
                                          style={{
                                            backgroundColor: "#f6ffed",
                                            border: "1px solid #b7eb8f",
                                            color: "#52c41a",
                                            fontSize: 10,
                                            margin: 0,
                                            padding: "1px 4px",
                                          }}
                                        >
                                          {tool}
                                        </Tag>
                                      ))}
                                    {(step.requiredTools || []).length > 3 && (
                                      <Tag
                                        style={{
                                          fontSize: 10,
                                          padding: "1px 4px",
                                        }}
                                      >
                                        +{(step.requiredTools || []).length - 3}
                                      </Tag>
                                    )}
                                  </div>
                                </div>
                              </Col>
                            )}

                            {/* Vật liệu cần thiết */}
                            {(step.requiredMaterials || []).length > 0 && (
                              <Col span={12}>
                                <div
                                  style={{
                                    backgroundColor: "#e6f7ff",
                                    border: "1px solid #91d5ff",
                                    borderRadius: 6,
                                    padding: 8,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 11,
                                      fontWeight: "bold",
                                      color: "#1890ff",
                                      marginBottom: 4,
                                    }}
                                  >
                                    🧱 Vật liệu
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: 2,
                                    }}
                                  >
                                    {(step.requiredMaterials || [])
                                      .slice(0, 3)
                                      .map((material: string, idx: number) => (
                                        <Tag
                                          key={idx}
                                          style={{
                                            backgroundColor: "#e6f7ff",
                                            border: "1px solid #91d5ff",
                                            color: "#1890ff",
                                            fontSize: 10,
                                            margin: 0,
                                            padding: "1px 4px",
                                          }}
                                        >
                                          {material}
                                        </Tag>
                                      ))}
                                    {(step.requiredMaterials || []).length >
                                      3 && (
                                      <Tag
                                        style={{
                                          fontSize: 10,
                                          padding: "1px 4px",
                                        }}
                                      >
                                        +
                                        {(step.requiredMaterials || []).length -
                                          3}
                                      </Tag>
                                    )}
                                  </div>
                                </div>
                              </Col>
                            )}

                            {/* Hướng dẫn thực hiện */}
                            {(step.instructions || []).length > 0 && (
                              <Col span={24}>
                                <div
                                  style={{
                                    backgroundColor: "#f9f0ff",
                                    border: "1px solid #d3adf7",
                                    borderRadius: 6,
                                    padding: 8,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 11,
                                      fontWeight: "bold",
                                      color: "#722ed1",
                                      marginBottom: 4,
                                    }}
                                  >
                                    📋 Hướng dẫn
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 2,
                                    }}
                                  >
                                    {(step.instructions || [])
                                      .slice(0, 2)
                                      .map(
                                        (instruction: string, idx: number) => (
                                          <div
                                            key={idx}
                                            style={{
                                              display: "flex",
                                              alignItems: "flex-start",
                                              fontSize: 10,
                                              padding: 4,
                                              backgroundColor: "white",
                                              borderRadius: 4,
                                              border: "1px solid #d3adf7",
                                            }}
                                          >
                                            <div
                                              style={{
                                                width: 16,
                                                height: 16,
                                                borderRadius: "50%",
                                                backgroundColor: "#722ed1",
                                                color: "white",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 8,
                                                fontWeight: "bold",
                                                marginRight: 6,
                                                flexShrink: 0,
                                              }}
                                            >
                                              {idx + 1}
                                            </div>
                                            <Text
                                              style={{
                                                fontSize: 10,
                                                lineHeight: 1.3,
                                              }}
                                            >
                                              {instruction}
                                            </Text>
                                          </div>
                                        )
                                      )}
                                    {(step.instructions || []).length > 2 && (
                                      <div
                                        style={{
                                          fontSize: 10,
                                          color: "#666",
                                          textAlign: "center",
                                        }}
                                      >
                                        +{(step.instructions || []).length - 2}{" "}
                                        hướng dẫn khác
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Col>
                            )}

                            {/* Kiểm tra chất lượng */}
                            {(step.qualityChecklist || []).length > 0 && (
                              <Col span={12}>
                                <div
                                  style={{
                                    backgroundColor: "#fff7e6",
                                    border: "1px solid #ffd591",
                                    borderRadius: 6,
                                    padding: 8,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 11,
                                      fontWeight: "bold",
                                      color: "#fa8c16",
                                      marginBottom: 4,
                                    }}
                                  >
                                    ✅ Kiểm tra
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 2,
                                    }}
                                  >
                                    {(step.qualityChecklist || [])
                                      .slice(0, 2)
                                      .map((item: string, idx: number) => (
                                        <div
                                          key={idx}
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            fontSize: 10,
                                            padding: 3,
                                            backgroundColor: "white",
                                            borderRadius: 3,
                                            border: "1px solid #ffd591",
                                          }}
                                        >
                                          <div
                                            style={{
                                              width: 12,
                                              height: 12,
                                              borderRadius: "50%",
                                              backgroundColor: "#fa8c16",
                                              color: "white",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              fontSize: 8,
                                              marginRight: 6,
                                              flexShrink: 0,
                                            }}
                                          >
                                            ✓
                                          </div>
                                          <Text style={{ fontSize: 10 }}>
                                            {item}
                                          </Text>
                                        </div>
                                      ))}
                                    {(step.qualityChecklist || []).length >
                                      2 && (
                                      <div
                                        style={{
                                          fontSize: 9,
                                          color: "#666",
                                          textAlign: "center",
                                        }}
                                      >
                                        +
                                        {(step.qualityChecklist || []).length -
                                          2}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Col>
                            )}

                            {/* Lưu ý an toàn */}
                            {(step.safetyNotes || []).length > 0 && (
                              <Col span={12}>
                                <div
                                  style={{
                                    backgroundColor: "#fff2f0",
                                    border: "1px solid #ffccc7",
                                    borderRadius: 6,
                                    padding: 8,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 11,
                                      fontWeight: "bold",
                                      color: "#f5222d",
                                      marginBottom: 4,
                                    }}
                                  >
                                    ⚠️ An toàn
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 2,
                                    }}
                                  >
                                    {(step.safetyNotes || [])
                                      .slice(0, 2)
                                      .map((note: string, idx: number) => (
                                        <div
                                          key={idx}
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            fontSize: 10,
                                            padding: 3,
                                            backgroundColor: "white",
                                            borderRadius: 3,
                                            border: "1px solid #ffccc7",
                                          }}
                                        >
                                          <div
                                            style={{
                                              width: 12,
                                              height: 12,
                                              borderRadius: "50%",
                                              backgroundColor: "#f5222d",
                                              color: "white",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              fontSize: 8,
                                              marginRight: 6,
                                              flexShrink: 0,
                                            }}
                                          >
                                            ⚠
                                          </div>
                                          <Text style={{ fontSize: 10 }}>
                                            {note}
                                          </Text>
                                        </div>
                                      ))}
                                    {(step.safetyNotes || []).length > 2 && (
                                      <div
                                        style={{
                                          fontSize: 9,
                                          color: "#666",
                                          textAlign: "center",
                                        }}
                                      >
                                        +{(step.safetyNotes || []).length - 2}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Col>
                            )}
                          </Row>
                        </div>
                      </Col>

                      {/* Card 2 - Sản phẩm */}
                      <Col span={8}>
                        <div
                          style={{
                            backgroundColor: "white",
                            border: "1px solid #e8e8e8",
                            borderRadius: 8,
                            padding: 20,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            minHeight: 200,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                          }}
                        >
                          {(step.stepProducts || []).length > 0 ? (
                            <div
                              style={{
                                backgroundColor: "#f0f9ff",
                                border: "1px solid #0ea5e9",
                                borderRadius: 8,
                                padding: 16,
                                textAlign: "center",
                                height: "fit-content",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <div
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    backgroundColor: "#0ea5e9",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 16,
                                  }}
                                >
                                  <ShoppingCartOutlined />
                                </div>
                                <div>
                                  <Text
                                    strong
                                    style={{
                                      fontSize: 12,
                                      color: "#0ea5e9",
                                      display: "block",
                                      marginBottom: 2,
                                    }}
                                  >
                                    Sản phẩm
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: 11,
                                      color: "#666",
                                    }}
                                  >
                                    {step.stepProducts?.length || 0} sản phẩm
                                  </Text>
                                </div>
                                <Button
                                  type="primary"
                                  size="small"
                                  icon={<EyeOutlined />}
                                 onClick={() =>
                                   handleViewProducts(
                                     step.stepProducts || [],
                                     step.name
                                   )
                                 }
                                  style={{
                                    backgroundColor: "#0ea5e9",
                                    borderColor: "#0ea5e9",
                                    width: "100%",
                                    height: 28,
                                    fontSize: 11,
                                    fontWeight: "bold",
                                  }}
                                >
                                  Xem chi tiết
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div
                              style={{
                                backgroundColor: "#f5f5f5",
                                border: "1px dashed #d9d9d9",
                                borderRadius: 8,
                                padding: 16,
                                textAlign: "center",
                                height: "fit-content",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: 12,
                                }}
                              >
                                <div
                                  style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "50%",
                                    backgroundColor: "#d9d9d9",
                                    color: "#999",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 20,
                                  }}
                                >
                                  <ShoppingCartOutlined />
                                </div>
                                <div>
                                  <Text
                                    style={{
                                      fontSize: 14,
                                      color: "#999",
                                      display: "block",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Không có sản phẩm
                                  </Text>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              )
            )}
          </div>
        </Card>
      </div>

      {/* Modal chi tiết sản phẩm */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShoppingCartOutlined style={{ color: "#0ea5e9" }} />
            <span>Sản phẩm sử dụng - {selectedStepName}</span>
          </div>
        }
        open={productModalOpen}
        onCancel={() => setProductModalOpen(false)}
        footer={null}
        width={600}
        style={{ top: 50 }}
      >
        <Table
          dataSource={selectedStepProducts}
          pagination={false}
          size="small"
          rowKey={(record) =>
            record.id || record.productId || Math.random().toString()
          }
          columns={[
            {
              title: "STT",
              key: "index",
              width: 60,
              align: "center" as const,
              render: (_: any, __: any, index: number) => index + 1, // eslint-disable-line @typescript-eslint/no-explicit-any
            },
            {
              title: "Tên sản phẩm",
              dataIndex: "productName",
              key: "productName",
              render: (
                text: string,
                record: any // eslint-disable-line @typescript-eslint/no-explicit-any
              ) => (
                <div>
                  <Text strong>{text || record.name || "N/A"}</Text>
                  {record.productCode && (
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Mã: {record.productCode}
                      </Text>
                    </div>
                  )}
                </div>
              ),
            },
            {
              title: "Số lượng",
              dataIndex: "quantity",
              key: "quantity",
              width: 100,
              align: "center" as const,
              render: (quantity: number) => (
                <Tag color="green" style={{ fontSize: 12, fontWeight: "bold" }}>
                  {quantity || 0}
                </Tag>
              ),
            },
            {
              title: "Đơn vị",
              dataIndex: "unit",
              key: "unit",
              width: 100,
              align: "center" as const,
              render: (unit: string) => (
                <Tag color="blue" style={{ fontSize: 11 }}>
                  {unit || "cái"}
                </Tag>
              ),
            },
          ]}
        />
      </Modal>
    </Modal>
  );
};

export default CareProcessDetailModal;
