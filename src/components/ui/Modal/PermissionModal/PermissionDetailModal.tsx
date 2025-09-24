"use client";
import React from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Badge,
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Space,
  Button,
} from "antd";
import {
  SafetyOutlined,
  UserOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  allPermissions,
  permissionCategories,
} from "@/components/utils/data/permissions.data";

const { Title, Text } = Typography;

interface PermissionDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  data: any;
}

const PermissionDetailModal: React.FC<PermissionDetailModalProps> = ({
  visible,
  onCancel,
  data,
}) => {
  if (!data) return null;

  const getPermissionInfo = (code: string) => {
    return allPermissions.find((p) => p.code === code);
  };

  const getCategoryColor = (category: string) => {
    const categoryConfig = permissionCategories.find(
      (c) => c.value === category
    );
    return categoryConfig?.color || "default";
  };

  const permissionGroups =
    data.permissions?.reduce((groups: any, permCode: string) => {
      const permInfo = getPermissionInfo(permCode);
      if (permInfo) {
        const category = permInfo.category;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(permInfo);
      }
      return groups;
    }, {}) || {};

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SafetyOutlined style={{ color: "#1890ff" }} />
          <span>Chi tiết vai trò: {data.name}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ]}
    >
      <div style={{ maxHeight: 600, overflowY: "auto" }}>
        {/* Thông tin cơ bản */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            Thông tin cơ bản
          </Title>

          <Descriptions column={2} size="small">
            <Descriptions.Item label="Tên vai trò">
              <Text strong>{data.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Mã vai trò">
              <Text code>{data.code}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={2}>
              <Tag color={data.status === "active" ? "green" : "red"}>
                {data.status === "active" ? "Hoạt động" : "Không hoạt động"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Số người dùng" span={2}>
              <Badge
                count={data.userCount}
                style={{
                  backgroundColor: data.userCount > 0 ? "#52c41a" : "#d9d9d9",
                }}
              />
              <Text style={{ marginLeft: 8 }}>
                {data.userCount > 0
                  ? `${data.userCount} người dùng đang sử dụng vai trò này`
                  : "Chưa có người dùng nào sử dụng vai trò này"}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>
              <Text>{data.description}</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Thông tin thời gian */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            Thông tin thời gian
          </Title>

          <Descriptions column={2} size="small">
            <Descriptions.Item label="Ngày tạo">
              <Text>{new Date(data.createdAt).toLocaleString("vi-VN")}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật cuối">
              <Text>{new Date(data.updatedAt).toLocaleString("vi-VN")}</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Danh sách quyền hạn */}
        <Card size="small">
          <Title level={5} style={{ marginBottom: 16 }}>
            <CheckCircleOutlined style={{ marginRight: 8 }} />
            Quyền hạn ({data.permissions?.length || 0} quyền)
          </Title>

          {Object.keys(permissionGroups).length > 0 ? (
            <Row gutter={[16, 16]}>
              {Object.entries(permissionGroups).map(
                ([category, perms]: [string, any]) => (
                  <Col span={24} key={category}>
                    <Card
                      size="small"
                      title={
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Tag color={getCategoryColor(category)}>
                            {category}
                          </Tag>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            ({perms.length} quyền)
                          </Text>
                        </div>
                      }
                      style={{ marginBottom: 8 }}
                    >
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                      >
                        {perms.map((perm: any) => (
                          <div key={perm.code} style={{ width: "100%" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 4,
                              }}
                            >
                              <CheckCircleOutlined
                                style={{ color: "#52c41a", fontSize: 12 }}
                              />
                              <Text strong style={{ fontSize: 13 }}>
                                {perm.name}
                              </Text>
                            </div>
                            <Text
                              type="secondary"
                              style={{ fontSize: 11, marginLeft: 20 }}
                            >
                              {perm.description}
                            </Text>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </Col>
                )
              )}
            </Row>
          ) : (
            <div style={{ textAlign: "center", padding: 20, color: "#999" }}>
              <Text type="secondary">Vai trò này chưa có quyền hạn nào</Text>
            </div>
          )}
        </Card>
      </div>
    </Modal>
  );
};

export default PermissionDetailModal;
