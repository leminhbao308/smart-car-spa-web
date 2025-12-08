"use client";

import React, {useState} from "react";
import {
  Modal,
  Radio,
  Space,
  Typography,
  Input,
  Button,
  Table,
  Form,
} from "antd";
import {SearchOutlined, UserOutlined} from "@ant-design/icons";
import type {UserManagementInfo} from "@/lib/api";

const {Text} = Typography;

interface CustomerSelectionModalProps {
  isVisible: boolean;
  customers: UserManagementInfo[];
  activeUserOnly: boolean;
  isLoading: boolean;
  onSelect: (customer: UserManagementInfo) => void;
  onCancel: () => void;
  onSearch: (searchText: string) => void;
  onCustomerTypeChange: (type: string) => void;
}

const CustomerSelectionModal: React.FC<CustomerSelectionModalProps> = ({
                                                                         isVisible,
                                                                         customers,
                                                                         activeUserOnly,
                                                                         isLoading,
                                                                         onSelect,
                                                                         onCancel,
                                                                         onSearch,
                                                                         onCustomerTypeChange,
                                                                       }) => {
  const [customerType, setCustomerType] = useState("guest");
  const [searchText, setSearchText] = useState("");

  const userDatasource = activeUserOnly
    ? customers.filter((customer) => customer.is_active)
    : customers;

  const handleCustomerTypeChange = (type: string) => {
    setCustomerType(type);
    onCustomerTypeChange(type);
  };

  const handleSearch = () => {
    onSearch(searchText);
  };

  const handleCancel = () => {
    setSearchText("");
    setCustomerType("guest");
    onCancel();
  };

  const columns = [
    {
      title: "Tên",
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: "SĐT",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: unknown, record: UserManagementInfo) => (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            onSelect(record);
            setSearchText("");
          }}
        >
          Chọn
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title="Quản lý khách hàng"
      open={isVisible}
      onCancel={handleCancel}
      footer={null}
      width={700}
    >
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Text strong>Chọn loại khách hàng:</Text>
        <Radio.Group
          value={customerType}
          onChange={(e) => handleCustomerTypeChange(e.target.value)}
          style={{marginTop: "8px"}}
        >
          <Space>
            <Radio value="guest">Khách lẻ</Radio>
            <Radio value="existing">Khách hàng có sẵn</Radio>
          </Space>
        </Radio.Group>
      </div>

      {customerType === "guest" && (
        <div style={{textAlign: "center", padding: "40px"}}>
          <UserOutlined style={{fontSize: "48px", color: "#d9d9d9"}}/>
          <div style={{marginTop: "16px"}}>
            <Text type="secondary">
              Sử dụng thông tin khách lẻ mặc định
            </Text>
          </div>
          <Button
            type="primary"
            onClick={() => {
              handleCustomerTypeChange("guest");
              handleCancel();
            }}
            style={{marginTop: "16px"}}
          >
            Xác nhận
          </Button>
        </div>
      )}

      {customerType === "existing" && (
        <div>
          <Space.Compact style={{width: "100%", marginBottom: "16px"}}>
            <Input
              placeholder="Tìm kiếm theo tên, SĐT hoặc email"
              prefix={<SearchOutlined/>}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
            />
            <Button type="primary" onClick={handleSearch}>
              <SearchOutlined/>
            </Button>
          </Space.Compact>

          <Table
            loading={isLoading}
            dataSource={userDatasource}
            columns={columns}
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
            }}
            rowKey="user_id"
            size="small"
          />
        </div>
      )}
    </Modal>
  );
};

export default CustomerSelectionModal;
