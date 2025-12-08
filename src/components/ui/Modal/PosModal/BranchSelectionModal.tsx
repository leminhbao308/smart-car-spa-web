"use client";

import React, { useState } from "react";
import { Card, Col, Input, Modal, Row, Space, Tag, Typography } from "antd";
import { CheckCircleOutlined, SearchOutlined } from "@ant-design/icons";
import type { BranchDisplay } from "@/lib/api/types/branch.types";

const { Text } = Typography;

interface BranchSelectionModalProps {
  isVisible: boolean;
  branches: BranchDisplay[];
  selectedBranch: BranchDisplay | null;
  onSelect: (branch: BranchDisplay) => void;
  onCancel: () => void;
}

const BranchSelectionModal: React.FC<BranchSelectionModalProps> = ({
                                                                     isVisible,
                                                                     branches,
                                                                     selectedBranch,
                                                                     onSelect,
                                                                     onCancel,
                                                                   }) => {
  const [searchText, setSearchText] = useState("");

  const filteredBranches = branches.filter((branch) =>
    branch.branch_name.toLowerCase().includes(searchText.toLowerCase()) ||
    branch.branch_code.toLowerCase().includes(searchText.toLowerCase()) ||
    branch.address?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Modal
      title="Chọn chi nhánh"
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Input
        placeholder="Tìm kiếm chi nhánh..."
        prefix={<SearchOutlined />}
        style={{ marginBottom: "16px" }}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        allowClear
      />
      <Row gutter={[16, 16]}>
        {filteredBranches.map((branch) => (
          <Col span={12} key={branch.branch_id}>
            <Card
              hoverable
              onClick={() => onSelect(branch)}
              style={{
                borderColor:
                  selectedBranch?.branch_id === branch.branch_id
                    ? "#1890ff"
                    : undefined,
                borderWidth:
                  selectedBranch?.branch_id === branch.branch_id ? 2 : 1,
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text strong>{branch.branch_name}</Text>
                  {selectedBranch?.branch_id === branch.branch_id && (
                    <CheckCircleOutlined style={{ color: "#1890ff" }} />
                  )}
                </div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {branch.address}
                </Text>
                <div>
                  <Tag color="blue">{branch.branch_code}</Tag>
                  <Tag
                    color={
                      branch.operating_status === "ACTIVE"
                        ? "green"
                        : "orange"
                    }
                  >
                    {branch.operating_status}
                  </Tag>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Modal>
  );
};

export default BranchSelectionModal;
