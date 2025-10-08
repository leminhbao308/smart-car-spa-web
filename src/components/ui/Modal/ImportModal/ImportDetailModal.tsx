"use client";
import React from "react";
import {Modal, Descriptions, Table, Tag, Badge, Divider} from "antd";
import {ColumnsType} from "antd/es/table";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import {PurchaseOrder, PurchaseOrderLine} from "@/lib/api";

interface ImportDetailModalProps {
  visible: boolean;
  onClose: () => void;
  record: PurchaseOrder | null;
}

const purchaseOrderStatuses = [
  {value: "DRAFT", label: "Nháp", color: "default"},
  {value: "PENDING_DELIVERY", label: "Chờ giao hàng", color: "orange"},
  {value: "RECEIVED", label: "Đã nhận hàng", color: "green"},
  {value: "CANCELLED", label: "Đã hủy", color: "red"},
];

const ImportDetailModal: React.FC<ImportDetailModalProps> = ({
                                                               visible,
                                                               onClose,
                                                               record,
                                                             }) => {
  if (!record) return null;

  const statusConfig = purchaseOrderStatuses.find((s) => s.value === record.status);

  // Columns cho bảng chi tiết sản phẩm
  const itemColumns: ColumnsType<PurchaseOrderLine> = [
    {
      title: "Tên sản phẩm",
      key: "productName",
      render: (_, line) => line.product?.productName || "N/A",
    },
    {
      title: "Nhà cung cấp",
      key: "supplierName",
      render: (_, line) => line.supplier?.supplier_name || "N/A",
    },
    {
      title: "Số lượng",
      dataIndex: "qty_ordered",
      key: "qty_ordered",
      width: 100,
      align: "center",
    },
    {
      title: "Đơn giá",
      dataIndex: "unit_cost",
      key: "unit_cost",
      width: 120,
      align: "right",
      render: (price: number) => formatCurrency(price),
    },
    {
      title: "Thành tiền",
      key: "total",
      width: 140,
      align: "right",
      render: (_, line) => {
        const total = line.qty_ordered * line.unit_cost;
        return (
          <span style={{fontWeight: 500, color: "#52c41a"}}>
            {formatCurrency(total)}
          </span>
        );
      },
    },
    {
      title: "Mã lô",
      dataIndex: "lot_code",
      key: "lot_code",
      width: 120,
      render: (code: string | null) => code || "-",
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "expiry_date",
      key: "expiry_date",
      width: 120,
      render: (date: Date | null) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
  ];

  const totalAmount = record.lines?.reduce(
    (sum, line) => sum + line.qty_ordered * line.unit_cost,
    0
  ) || 0;

  const totalQuantity = record.lines?.reduce(
    (sum, line) => sum + line.qty_ordered,
    0
  ) || 0;

  return (
    <Modal
      title={`Chi tiết phiếu nhập - ${record.id.substring(0, 8)}...`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      destroyOnClose
    >
      <div style={{maxHeight: "70vh", overflowY: "auto"}}>
        {/* Thông tin cơ bản */}
        <Descriptions
          title="Thông tin phiếu nhập"
          bordered
          column={2}
          size="small"
        >
          <Descriptions.Item label="Mã phiếu nhập" span={1}>
            <strong>{record.id}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái" span={1}>
            <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Chi nhánh" span={2}>
            {record.branch?.branch_name || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Kho" span={2}>
            {record.warehouse?.id || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Ngày dự kiến nhận" span={1}>
            {record.expected_at
              ? new Date(record.expected_at).toLocaleDateString("vi-VN")
              : "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Ngày tạo" span={1}>
            {new Date(record.created_date).toLocaleDateString("vi-VN")}
          </Descriptions.Item>

          <Descriptions.Item label="Người tạo" span={1}>
            {record.created_by || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Cập nhật lần cuối" span={1}>
            {new Date(record.modified_date).toLocaleDateString("vi-VN")}
          </Descriptions.Item>

          <Descriptions.Item label="Tổng số sản phẩm" span={1}>
            <Badge
              count={record.lines?.length || 0}
              style={{backgroundColor: "#1890ff"}}
            />
            <span style={{marginLeft: 8}}> sản phẩm</span>
          </Descriptions.Item>

          <Descriptions.Item label="Tổng số lượng" span={1}>
            <span style={{fontWeight: 500}}>{totalQuantity}</span>
          </Descriptions.Item>

          <Descriptions.Item label="Tổng tiền" span={2}>
            <span style={{fontWeight: 600, color: "#52c41a", fontSize: 18}}>
              {formatCurrency(totalAmount)}
            </span>
          </Descriptions.Item>
        </Descriptions>

        <Divider/>

        {/* Chi tiết sản phẩm */}
        <div>
          <h4>Chi tiết sản phẩm nhập kho</h4>
          <Table
            dataSource={record.lines || []}
            columns={itemColumns}
            pagination={false}
            size="small"
            rowKey="id"
            scroll={{x: 900}}
            summary={(pageData) => {
              const totalQty = pageData.reduce(
                (sum, item) => sum + item.qty_ordered,
                0
              );
              const totalAmt = pageData.reduce(
                (sum, item) => sum + item.qty_ordered * item.unit_cost,
                0
              );

              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <strong>Tổng cộng</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <strong style={{display: "block", textAlign: "center"}}>
                      {totalQty}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}></Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>
                    <strong
                      style={{
                        color: "#52c41a",
                        fontSize: 16,
                        display: "block",
                        textAlign: "right",
                      }}
                    >
                      {formatCurrency(totalAmt)}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5}></Table.Summary.Cell>
                  <Table.Summary.Cell index={6}></Table.Summary.Cell>
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
