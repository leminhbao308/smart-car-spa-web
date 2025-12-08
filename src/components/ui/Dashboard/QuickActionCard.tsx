"use client";
import React from "react";
import { Card, Row, Col, Typography, Button } from "antd";
import { useRouter } from "next/navigation";

const { Text, Title } = Typography;

interface QuickAction {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  path: string;
}

interface QuickActionCardProps {
  actions: QuickAction[];
  title?: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  actions,
  title = "Thao tác nhanh",
}) => {
  const router = useRouter();

  const handleActionClick = (path: string) => {
    router.push(path);
  };

  return (
    <Card
      title={
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
      }
      style={{
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        border: "none",
        height: "100%",
      }}
      styles={{
        body: {
          padding: 16,
        },
      }}
    >
      <Row gutter={[16, 16]}>
        {actions.map((action) => (
          <Col span={12} key={action.id}>
            <Card
              hoverable
              style={{
                borderRadius: 8,
                border: "1px solid #f0f0f0",
                height: "100%",
                cursor: "pointer",
              }}
              styles={{
                body: {
                  padding: 16,
                  textAlign: "center",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                },
              }}
              onClick={() => handleActionClick(action.path)}
            >
              <div>
                <div
                  style={{
                    fontSize: 32,
                    marginBottom: 12,
                  }}
                >
                  {action.icon}
                </div>
                <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                  {action.title}
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {action.description}
                </Text>
              </div>
              <Button
                type="primary"
                size="small"
                style={{
                  backgroundColor: action.color,
                  borderColor: action.color,
                  marginTop: 12,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleActionClick(action.path);
                }}
              >
                Thực hiện
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default QuickActionCard;
