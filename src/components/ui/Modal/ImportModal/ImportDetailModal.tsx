"use client";
import React from "react";
import { Modal, Descriptions, Table, Tag, Badge, Divider } from "antd";
import { ColumnsType } from "antd/es/table";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

interface ImportItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ImportRecord {
  id: number;
  importCode: string;
  supplierName: string;
  totalAmount: number;
  totalItems: number;
  status: string;
  importDate: string;
  receivedBy: string;
  notes: string;
  items: ImportItem[];
}

interface ImportDetailModalProps {
  visible: boolean;
  onClose: () => void;
  record: ImportRecord | null;
}

const importStatuses = [
  { value: "pending", label: "Chờ xử lý", color: "orange" },
  { value: "processing", label: "Đang xử lý", color: "blue" },
  { value: "completed", label: "Hoàn thành", color: "green" },
  { value: "cancelled", label: "Đã hủy", color: "red" },
];

const ImportDetailModal: React.FC<ImportDetailModalProps> = ({
  visible,
  onClose,
  record,
}) => {
  if (!record) return null;

  const statusConfig = importStatuses.find((s) => s.value === record.status);

  // Columns cho bảng chi tiết sản phẩm
  const itemColumns: ColumnsType<ImportItem> = [
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      width: 120,
      align: "right",
      render: (price: number) => formatCurrency(price),
    },
    {
      title: "Thành tiền",
      dataIndex: "total",
      key: "total",
      width: 120,
      align: "right",
      render: (total: number) => (
        <span style={{ fontWeight: 500, color: "#52c41a" }}>
          {formatCurrency(total)}
        </span>
      ),
    },
  ];

  return (
    <Modal
      title={`Chi tiết phiếu nhập - ${record.importCode}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
        {/* Thông tin cơ bản */}
        <Descriptions
          title="Thông tin phiếu nhập"
          bordered
          column={2}
          size="small"
        >
          <Descriptions.Item label="Mã phiếu nhập" span={1}>
            <strong>{record.importCode}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái" span={1}>
            <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Nhà cung cấp" span={2}>
            {record.supplierName}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày nhập" span={1}>
            {record.importDate}
          </Descriptions.Item>
          <Descriptions.Item label="Người nhận" span={1}>
            {record.receivedBy}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng số sản phẩm" span={1}>
            <Badge
              count={record.totalItems}
              style={{ backgroundColor: "#1890ff" }}
            />
            <span style={{ marginLeft: 8 }}>sản phẩm</span>
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền" span={1}>
            <span style={{ fontWeight: 500, color: "#52c41a", fontSize: 16 }}>
              {formatCurrency(record.totalAmount)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={2}>
            {record.notes || "Không có ghi chú"}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Chi tiết sản phẩm */}
        <div>
          <h4>Chi tiết sản phẩm nhập kho</h4>
          <Table
            dataSource={record.items}
            columns={itemColumns}
            pagination={false}
            size="small"
            rowKey={(item, index) => `${item.productName}-${index}`}
            summary={(pageData) => {
              const totalQuantity = pageData.reduce(
                (sum, item) => sum + item.quantity,
                0
              );
              const totalAmount = pageData.reduce(
                (sum, item) => sum + item.total,
                0
              );

              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    <strong>Tổng cộng</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong>{totalQuantity}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}></Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    <strong style={{ color: "#52c41a", fontSize: 16 }}>
                      {formatCurrency(totalAmount)}
                    </strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ImportDetailModal;
