"use client";
import React, {useState, useEffect} from "react";
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Button,
  Table,
  InputNumber,
  message,
  Divider,
  Spin,
  Input, App,
} from "antd";
import {ColumnsType} from "antd/es/table";
import {PlusOutlined, DeleteOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import formatCurrency from "@/components/utils/helper/currency.format.helper";
import {
  PurchaseOrder,
  CreatePORequest,
  CreatePOLineRequest,
  BranchService,
  ProductService,
  SupplierService,
  BranchDisplay,
  Product,
  Supplier,
} from "@/lib/api";

const {Option} = Select;

interface ImportLineItem extends CreatePOLineRequest {
  id: string;
}

interface ImportEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: CreatePORequest) => void;
  record: PurchaseOrder | null;
  loading?: boolean;
}

const ImportEditModal: React.FC<ImportEditModalProps> = ({
                                                           visible,
                                                           onClose,
                                                           onSave,
                                                           record,
                                                           loading = false,
                                                         }) => {
  const {message} = App.useApp();

  const [form] = Form.useForm();
  const [items, setItems] = useState<ImportLineItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // Data states
  const [branches, setBranches] = useState<BranchDisplay[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Selected branch for warehouse lookup
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (visible) {
      loadInitialData();
    }
  }, [visible]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [branchesRes, productsRes, suppliersRes] = await Promise.all([
        BranchService.getAllBranches(),
        ProductService.getAllProducts({size: 1000}),
        SupplierService.getAllSuppliers({size: 1000}),
      ]);

      setBranches(branchesRes.branches);
      setProducts(productsRes.data.content);
      setSuppliers(suppliersRes.data.content);
    } catch (error: any) {
      message.error("Không thể tải dữ liệu: " + (error?.message || ""));
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (visible && !record) {
      // Create mode only - reset form
      form.resetFields();
      setItems([]);
      setTotalAmount(0);
      setSelectedBranchId(null);
    }
  }, [visible, record, form]);

  // Calculate total amount when items change
  useEffect(() => {
    const total = items.reduce(
      (sum, item) => sum + (item.qty || 0) * (item.unit_cost || 0),
      0
    );
    setTotalAmount(total);
  }, [items]);

  // Update branch_id when branch is loaded
  useEffect(() => {
    if (selectedBranchId) {
      form.setFieldValue("branch_id", selectedBranchId);
    }
  }, [selectedBranchId, form]);

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    form.setFieldValue("branch_id", undefined);
  };

  const handleAddItem = () => {
    const newItem: ImportLineItem = {
      id: `item-${Date.now()}`,
      product_id: "",
      supplier_id: "",
      qty: 1,
      unit_cost: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: keyof ImportLineItem,
    value: any
  ) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return {...item, [field]: value};
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
        (item) =>
          !item.product_id ||
          !item.supplier_id ||
          item.qty <= 0 ||
          item.unit_cost <= 0
      );

      if (hasEmptyItems) {
        message.error("Vui lòng điền đầy đủ thông tin sản phẩm");
        return;
      }

      const data: CreatePORequest = {
        branch_id: values.branch_id,
        lines: items.map(({id, ...item}) => ({
          ...item,
          lot_code: item.lot_code || undefined,
          expiry_date: item.expiry_date || undefined,
        })),
      };

      onSave(data);
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  // Columns cho bảng sản phẩm
  const itemColumns: ColumnsType<ImportLineItem> = [
    {
      title: "Sản phẩm",
      dataIndex: "product_id",
      key: "product_id",
      width: 200,
      render: (value, record) => (
        <Select
          value={value || undefined}
          onChange={(val) => handleItemChange(record.id, "product_id", val)}
          placeholder="Chọn sản phẩm"
          style={{width: "100%"}}
          showSearch
          filterOption={(input, option) =>
            (option?.children as string)
              .toLowerCase()
              .indexOf(input.toLowerCase()) >= 0
          }
        >
          {products.map((product) => (
            <Option key={product.product_id} value={product.product_id}>
              {product.product_name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier_id",
      key: "supplier_id",
      width: 180,
      render: (value, record) => (
        <Select
          value={value || undefined}
          onChange={(val) => handleItemChange(record.id, "supplier_id", val)}
          placeholder="Chọn NCC"
          style={{width: "100%"}}
          showSearch
          filterOption={(input, option) =>
            (option?.children as string)
              .toLowerCase()
              .indexOf(input.toLowerCase()) >= 0
          }
        >
          {suppliers.map((supplier) => (
            <Option key={supplier.supplier_id} value={supplier.supplier_id}>
              {supplier.supplier_name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "qty_ordered",
      key: "qty_ordered",
      width: 100,
      render: (value, record) => (
        <InputNumber
          value={value}
          onChange={(val) =>
            handleItemChange(record.id, "qty", val || 0)
          }
          min={1}
          style={{width: "100%"}}
        />
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "unit_cost",
      key: "unit_cost",
      width: 140,
      render: (value, record) => (
        <InputNumber
          value={value}
          onChange={(val) => handleItemChange(record.id, "unit_cost", val || 0)}
          min={0}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
          style={{width: "100%"}}
        />
      ),
    },
    {
      title: "Thành tiền",
      key: "total",
      width: 140,
      render: (_, record) => {
        const total = (record.qty || 0) * (record.unit_cost || 0);
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
      render: (value, record) => (
        <Input
          value={value}
          onChange={(e) =>
            handleItemChange(record.id, "lot_code", e.target.value)
          }
          placeholder="Mã lô (tùy chọn)"
        />
      ),
    },
    {
      title: "Hạn SD",
      dataIndex: "expiry_date",
      key: "expiry_date",
      width: 140,
      render: (value, record) => (
        <DatePicker
          value={value ? dayjs(value) : null}
          onChange={(date) =>
            handleItemChange(
              record.id,
              "expiry_date",
              date ? date.toDate() : undefined
            )
          }
          format="DD/MM/YYYY"
          placeholder="Hạn SD"
          style={{width: "100%"}}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 80,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined/>}
          onClick={() => handleRemoveItem(record.id)}
        />
      ),
    },
  ];

  return (
    <Modal
      title="Nhập hàng mới"
      open={visible}
      onCancel={onClose}
      width={1400}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={loading}
          onClick={handleSave}
          disabled={loadingData}
        >
          Nhập hàng
        </Button>,
      ]}
    >
      <Spin spinning={loadingData}>
        <div style={{maxHeight: "70vh", overflowY: "auto"}}>
          <Form form={form} layout="vertical">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <Form.Item
                name="branch_id"
                label="Chi nhánh cần nhập hàng"
                rules={[
                  {required: true, message: "Vui lòng chọn chi nhánh"},
                ]}
              >
                <Select
                  placeholder="Chọn chi nhánh"
                  onChange={handleBranchChange}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as string)
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {branches.map((branch) => (
                    <Option key={branch.branch_id} value={branch.branch_id}>
                      {branch.branch_name} - {branch.address}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </Form>

          <Divider/>

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
              <h4>Chi tiết sản phẩm nhập</h4>
              <Button
                type="dashed"
                icon={<PlusOutlined/>}
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
              scroll={{x: 1200}}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <strong>Tổng cộng</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <strong>
                      {items.reduce((sum, item) => sum + (item.qty || 0), 0)}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}></Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>
                    <strong style={{color: "#52c41a", fontSize: 16}}>
                      {formatCurrency(totalAmount)}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5}></Table.Summary.Cell>
                  <Table.Summary.Cell index={6}></Table.Summary.Cell>
                  <Table.Summary.Cell index={7}></Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default ImportEditModal;
