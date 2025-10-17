"use client";

import React from "react";
import {
  Card,
  Space,
  Badge,
  Button,
  Empty,
  Table,
  Divider,
  Row,
  Typography,
  InputNumber,
} from "antd";
import {
  ShoppingCartOutlined,
  ClearOutlined,
  MinusOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type {UserManagementInfo} from "@/lib/api";
import type {BranchDisplay} from "@/lib/api/types/branch.types";

const {Text, Title} = Typography;

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
  categoryName: string;
  availableStock: number;
  maxQuantity: number;
}

interface CartSectionProps {
  cart: CartItem[];
  selectedCustomer: UserManagementInfo | null;
  selectedBranch: BranchDisplay | null;
  isCreatingOrder: boolean;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

const CartSection: React.FC<CartSectionProps> = ({
                                                   cart,
                                                   selectedCustomer,
                                                   selectedBranch,
                                                   isCreatingOrder,
                                                   onUpdateQuantity,
                                                   onRemoveItem,
                                                   onClearCart,
                                                   onCheckout,
                                                 }) => {
  // Calculation Functions
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.total, 0);
  };

  const getTotalAmount = () => {
    return getSubtotal();
  };

  // Cart Table Columns
  const cartColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      ellipsis: true,
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price: number) => (
        <Text strong style={{color: "#1890ff"}}>
          ₫{price.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 150,
      render: (quantity: number, record: CartItem) => (
        <Space>
          <Button
            size="small"
            icon={<MinusOutlined/>}
            onClick={() => onUpdateQuantity(record.productId, quantity - 1)}
            disabled={quantity <= 1}
          />
          <InputNumber
            size="small"
            value={quantity}
            min={1}
            max={record.maxQuantity}
            style={{width: 60}}
            onChange={(value) => onUpdateQuantity(record.productId, value || 1)}
          />
          <Button
            size="small"
            icon={<PlusOutlined/>}
            onClick={() => onUpdateQuantity(record.productId, quantity + 1)}
            disabled={quantity >= record.maxQuantity}
          />
        </Space>
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "total",
      key: "total",
      width: 120,
      render: (total: number) => <Text strong>₫{total.toLocaleString()}</Text>,
    },
    {
      title: "",
      key: "action",
      width: 50,
      render: (_: unknown, record: CartItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined/>}
          onClick={() => onRemoveItem(record.productId)}
        />
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <ShoppingCartOutlined/>
          <span>Giỏ hàng</span>
          <Badge count={getTotalItems()} showZero color="#1890ff"/>
        </Space>
      }
      extra={
        cart.length > 0 && (
          <Button
            size="small"
            danger
            icon={<ClearOutlined/>}
            onClick={onClearCart}
          >
            Xóa tất cả
          </Button>
        )
      }
      style={{height: "100%", borderRadius: "12px"}}
      styles={{
        body: {
          height: "calc(100% - 57px)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {cart.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Giỏ hàng trống"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        />
      ) : (
        <>
          <div style={{flex: 1, overflow: "auto", marginBottom: "16px"}}>
            <Table
              dataSource={cart}
              columns={cartColumns}
              pagination={false}
              size="small"
              rowKey="productId"
            />
          </div>

          <Divider style={{margin: "12px 0"}}/>

          <div style={{marginBottom: "16px"}}>
            <Row justify="space-between" style={{marginBottom: "8px"}}>
              <Text>Tổng sản phẩm:</Text>
              <Text strong>{getTotalItems()}</Text>
            </Row>
            <Row justify="space-between" style={{marginBottom: "8px"}}>
              <Text>Khách hàng:</Text>
              <Text>{selectedCustomer?.full_name || "Khách lẻ"}</Text>
            </Row>
            <Row justify="space-between" style={{marginBottom: "8px"}}>
              <Text>Chi nhánh:</Text>
              <Text>{selectedBranch?.branch_name || "Chưa chọn"}</Text>
            </Row>

            <Divider style={{margin: "8px 0"}}/>

            <Row justify="space-between" style={{marginBottom: "4px"}}>
              <Text>Tạm tính:</Text>
              <Text>₫{getSubtotal().toLocaleString()}</Text>
            </Row>

            <Row justify="space-between">
              <Title level={4} style={{margin: 0}}>
                Tổng cộng:
              </Title>
              <Title level={4} style={{margin: 0, color: "#1890ff"}}>
                ₫{getTotalAmount().toLocaleString()}
              </Title>
            </Row>
          </div>

          <Space direction="vertical" style={{width: "100%"}}>
            <Button
              type="primary"
              size="large"
              icon={<ShoppingCartOutlined/>}
              onClick={onCheckout}
              disabled={cart.length === 0 || !selectedBranch}
              loading={isCreatingOrder}
              style={{width: "100%"}}
            >
              Thanh toán
            </Button>
          </Space>
        </>
      )}
    </Card>
  );
};

export default CartSection;
