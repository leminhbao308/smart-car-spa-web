"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Table,
  InputNumber,
  Space,
  message,
  Divider,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Option } = Select;
const { TextArea } = Input;

interface ImportItem {
  id?: string;
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

interface ImportEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  record: ImportRecord | null;
  loading?: boolean;
}

const ImportEditModal: React.FC<ImportEditModalProps> = ({
  visible,
  onClose,
  onSave,
  record,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState<ImportItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (record && visible) {
      form.setFieldsValue({
        importCode: record.importCode,
        supplierName: record.supplierName,
        importDate: dayjs(record.importDate),
        receivedBy: record.receivedBy,
        notes: record.notes,
      });
      setItems(
        record.items.map((item, index) => ({ ...item, id: `item-${index}` }))
      );
      setTotalAmount(record.totalAmount);
    } else if (visible) {
      form.resetFields();
      setItems([]);
      setTotalAmount(0);
    }
  }, [record, visible, form]);

  // Tính tổng tiền khi items thay đổi
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.total, 0);
    setTotalAmount(total);
  }, [items]);

  const handleAddItem = () => {
    const newItem: ImportItem = {
      id: `item-${Date.now()}`,
      productName: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: keyof ImportItem,
    value: any
  ) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (items.length === 0) {
        message.error("Vui lòng thêm ít nhất một sản phẩm");
        return;
      }

      const hasEmptyItems = items.some(
        (item) => !item.productName || item.quantity <= 0 || item.unitPrice <= 0
      );

      if (hasEmptyItems) {
        message.error("Vui lòng điền đầy đủ thông tin sản phẩm");
        return;
      }

      const data = {
        ...values,
        importDate: values.importDate.format("YYYY-MM-DD"),
        items: items.map(({ id, ...item }) => item),
        totalAmount,
        totalItems: items.length,
      };

      onSave(data);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  // Columns cho bảng sản phẩm
  const itemColumns: ColumnsType<ImportItem> = [
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (value, record) => (
        <Input
          value={value}
          onChange={(e) =>
            handleItemChange(record.id!, "productName", e.target.value)
          }
          placeholder="Nhập tên sản phẩm"
        />
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      render: (value, record) => (
        <InputNumber
          value={value}
          onChange={(val) => handleItemChange(record.id!, "quantity", val || 0)}
          min={1}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      width: 150,
      render: (value, record) => (
        <InputNumber
          value={value}
          onChange={(val) =>
            handleItemChange(record.id!, "unitPrice", val || 0)
          }
          min={0}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "total",
      key: "total",
      width: 150,
      render: (total) => (
        <span style={{ fontWeight: 500, color: "#52c41a" }}>
          {formatCurrency(total)}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.id!)}
        />
      ),
    },
  ];

  return (
    <Modal
      title={
        record
          ? `Chỉnh sửa phiếu nhập - ${record.importCode}`
          : "Tạo phiếu nhập mới"
      }
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={loading}
          onClick={handleSave}
        >
          Lưu
        </Button>,
      ]}
    >
      <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <Form form={form} layout="vertical">
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <Form.Item
              name="importCode"
              label="Mã phiếu nhập"
              rules={[
                { required: true, message: "Vui lòng nhập mã phiếu nhập" },
              ]}
            >
              <Input placeholder="Nhập mã phiếu nhập" />
            </Form.Item>

            <Form.Item
              name="supplierName"
              label="Nhà cung cấp"
              rules={[
                { required: true, message: "Vui lòng nhập tên nhà cung cấp" },
              ]}
            >
              <Input placeholder="Nhập tên nhà cung cấp" />
            </Form.Item>

            <Form.Item
              name="importDate"
              label="Ngày nhập"
              rules={[{ required: true, message: "Vui lòng chọn ngày nhập" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="receivedBy"
              label="Người nhận"
              rules={[
                { required: true, message: "Vui lòng nhập tên người nhận" },
              ]}
            >
              <Input placeholder="Nhập tên người nhận" />
            </Form.Item>
          </div>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={3} placeholder="Nhập ghi chú (tùy chọn)" />
          </Form.Item>
        </Form>

        <Divider />

        {/* Bảng sản phẩm */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h4>Chi tiết sản phẩm</h4>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddItem}
            >
              Thêm sản phẩm
            </Button>
          </div>

          <Table
            dataSource={items}
            columns={itemColumns}
            pagination={false}
            size="small"
            rowKey="id"
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <strong>Tổng cộng</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <strong>
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}></Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <strong style={{ color: "#52c41a", fontSize: 16 }}>
                    {formatCurrency(totalAmount)}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}></Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ImportEditModal;
