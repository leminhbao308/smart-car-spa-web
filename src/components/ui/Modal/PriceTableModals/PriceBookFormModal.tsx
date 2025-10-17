// components/ui/Modal/PriceBookFormModal.tsx
import React, {useEffect, useState} from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Button,
  Space,
  Tag,
  Row,
  Col,
  Card,
  Table,
  message,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {BranchDisplay, PriceBookItem, PriceTableUI, Product, Service, ServicePackage} from "@/lib/api";

interface PriceBookFormModalProps {
  visible: boolean;
  loading: boolean;
  mode: "create" | "edit";
  priceBook?: PriceTableUI | null;
  products: Product[];
  services: Service[];
  branches: BranchDisplay[];
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

interface PriceBookFormData {
  code: string;
  name: string;
  currency: string;
  branch_id?: string | null;
  valid_from: dayjs.Dayjs;
  valid_to?: dayjs.Dayjs | null;
  is_active: boolean;
  items: PriceBookItem[];
}

interface ItemFormData {
  item_type: "PRODUCT" | "SERVICE";
  item_id: string;
  policy_type: "FIXED" | "MARKUP_ON_PEAK";
  fixed_price?: number | null;
  markup_percent?: number | null;
}

const PriceBookFormModal: React.FC<PriceBookFormModalProps> = ({
                                                                 visible,
                                                                 loading,
                                                                 mode,
                                                                 priceBook,
                                                                 products,
                                                                 services,
                                                                 branches,
                                                                 onClose,
                                                                 onSubmit,
                                                               }) => {
  const [form] = Form.useForm<PriceBookFormData>();
  const [itemForm] = Form.useForm<ItemFormData>();
  const [items, setItems] = useState<PriceBookItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceBookItem | null>(null);

  useEffect(() => {
    if (visible && priceBook && mode === "edit") {
      form.setFieldsValue({
        code: priceBook.code,
        name: priceBook.name,
        currency: priceBook.currency,
        branch_id: priceBook.branchId,
        valid_from: dayjs(priceBook.valid_from),
        valid_to: priceBook.valid_to ? dayjs(priceBook.valid_to) : null,
        is_active: priceBook.is_active,
      });
      setItems(priceBook.items || []);
    } else if (visible && mode === "create") {
      form.resetFields();
      setItems([]);
    }
  }, [visible, priceBook, mode, form]);

  const handleAddItem = () => {
    setEditingItem(null);
    itemForm.resetFields();
    setItemModalVisible(true);
  };

  const handleEditItem = (item: PriceBookItem) => {
    setEditingItem(item);
    itemForm.setFieldsValue({
      item_type: item.item_type,
      item_id: item.item_id,
      policy_type: item.policy_type,
      fixed_price: item.fixed_price,
      markup_percent: item.markup_percent,
    });
    setItemModalVisible(true);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    message.success("Đã xóa mục giá");
  };

  const handleItemSubmit = async (values: ItemFormData) => {
    try {
      // Get item name
      let itemName = "";
      if (values.item_type === "PRODUCT") {
        const product = products.find((p) => p.product_id === values.item_id);
        itemName = product?.product_name || "";
      } else if (values.item_type === "SERVICE") {
        const service = services.find((s) => s.service_id === values.item_id);
        itemName = service?.service_name || "";
      }

      // Tìm item trùng lặp (ngoại trừ item đang chỉnh sửa)
      const existingItem = items.find(
        (item) =>
          item.item_id === values.item_id &&
          item.item_type === values.item_type &&
          item.id !== editingItem?.id
      );

      const newItem: PriceBookItem = {
        id: existingItem?.id || editingItem?.id || `temp-${Date.now()}`,
        item_type: values.item_type,
        item_id: values.item_id,
        item_name: itemName,
        policy_type: values.policy_type,
        fixed_price: values.policy_type === "FIXED" ? values.fixed_price || null : null,
        markup_percent: values.policy_type === "MARKUP_ON_PEAK" ? values.markup_percent || null : null,
      };

      if (editingItem || existingItem) {
        // Update existing item (từ chỉnh sửa hoặc từ duplicate)
        const targetId = existingItem?.id || editingItem?.id;
        setItems(items.map((item) => (item.id === targetId ? newItem : item)));
        message.success("Đã cập nhật mục giá");
      } else {
        // Add new item
        setItems([...items, newItem]);
        message.success("Đã thêm mục giá");
      }

      setItemModalVisible(false);
      itemForm.resetFields();
      setEditingItem(null);
    } catch (error) {
      message.error("Có lỗi xảy ra");
    }
  };

  const handleSubmit = async (values: PriceBookFormData) => {
    if (items.length === 0) {
      message.error("Vui lòng thêm ít nhất một mục giá");
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        code: values.code,
        name: values.name,
        currency: values.currency,
        branch_id: values.branch_id || null,
        valid_from: values.valid_from.hour(0).minute(0).second(0).format("YYYY-MM-DDTHH:mm:ss"),
        // Đặt giờ mặc định là 23:59:59 cho ngày hết hạn
        valid_to: values.valid_to?.hour(23).minute(59).second(59).format("YYYY-MM-DDTHH:mm:ss") || null,
        is_active: values.is_active,
        items: items.map((item) => ({
          product_id: item.item_type === "PRODUCT" ? item.item_id : undefined,
          service_id: item.item_type === "SERVICE" ? item.item_id : undefined,
          service_package_id: item.item_type === "SERVICE_PACKAGE" ? item.item_id : undefined,
          policy_type: item.policy_type,
          fixed_price: item.fixed_price,
          markup_percent: item.markup_percent,
        })),
      };

      await onSubmit(data);
      form.resetFields();
      setItems([]);
      message.success(mode === "create" ? "Tạo bảng giá thành công" : "Cập nhật bảng giá thành công");
    } catch (error: any) {
      message.error(error?.message || "Có lỗi xảy ra");
      console.error("Error submitting price book:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case "PRODUCT":
        return "Sản phẩm";
      case "SERVICE":
        return "Dịch vụ";
      case "SERVICE_PACKAGE":
        return "Gói dịch vụ";
      default:
        return type;
    }
  };

  const getPolicyTypeLabel = (type: string) => {
    return type === "FIXED" ? "Giá cố định" : "Markup theo giá vốn";
  };

  const getAvailableItems = (itemType: string) => {
    if (itemType === "PRODUCT") return products;
    if (itemType === "SERVICE") return services;
    return [];
  };

  const itemsColumns = [
    {
      title: "Loại",
      dataIndex: "item_type",
      key: "item_type",
      width: 100,
      render: (type: string) => (
        <Tag color={type === "PRODUCT" ? "blue" : type === "SERVICE" ? "green" : "orange"}>
          {getItemTypeLabel(type)}
        </Tag>
      ),
    },
    {
      title: "Tên mục",
      dataIndex: "item_name",
      key: "item_name",
      render: (text: string) => text,
    },
    // {
    //   title: "Chính sách giá",
    //   dataIndex: "policy_type",
    //   key: "policy_type",
    //   width: 150,
    //   render: (policy: string) => (
    //     <Tag color={policy === "FIXED" ? "blue" : "orange"}>
    //       {getPolicyTypeLabel(policy)}
    //     </Tag>
    //   ),
    // },
    {
      title: "Giá",
      key: "price",
      width: 120,
      render: (_: any, record: PriceBookItem) => {
        if (record.policy_type === "FIXED" && record.fixed_price) {
          return <span>{record.fixed_price.toLocaleString("vi-VN")} {priceBook?.currency}</span>;
        } else if (record.markup_percent !== null) {
          return <span>+{record.markup_percent}%</span>;
        }
        return <span>N/A</span>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      render: (_: any, record: PriceBookItem) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined/>}
            onClick={() => handleEditItem(record)}
          >
            Sửa
          </Button>
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined/>}
            onClick={() => handleRemoveItem(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={mode === "create" ? "Thêm bảng giá mới" : "Chỉnh sửa bảng giá"}
        open={visible}
        onCancel={onClose}
        width={1000}
        footer={[
          <Button key="cancel" icon={<CloseOutlined/>} onClick={onClose}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            icon={<SaveOutlined/>}
            onClick={() => form.submit()}
          >
            {mode === "create" ? "Tạo mới" : "Cập nhật"}
          </Button>,
        ]}
      >
        <Form<PriceBookFormData>
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          {/* Basic Information */}
          <Card title="Thông tin cơ bản" size="small" style={{marginBottom: 16}}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Mã bảng giá"
                  name="code"
                  rules={[
                    {required: true, message: "Vui lòng nhập mã bảng giá"},
                  ]}
                >
                  <Input
                    placeholder="VD: PB-001"
                    disabled={mode === "edit"}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Tên bảng giá"
                  name="name"
                  rules={[
                    {required: true, message: "Vui lòng nhập tên bảng giá"},
                  ]}
                >
                  <Input placeholder="VD: Bảng giá tháng 1/2025"/>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Đơn vị tiền tệ"
                  name="currency"
                  rules={[
                    {required: true, message: "Vui lòng chọn đơn vị tiền tệ"},
                  ]}
                  initialValue="VND"
                >
                  <Select>
                    <Select.Option value="VND">VND</Select.Option>
                    <Select.Option value="USD">USD</Select.Option>
                    <Select.Option value="EUR">EUR</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Chi nhánh"
                  name="branch_id"
                >
                  <Select
                    placeholder="Để trống nếu áp dụng toàn hệ thống"
                    allowClear
                  >
                    {branches.map((branch) => (
                      <Select.Option key={branch.branch_id} value={branch.branch_id}>
                        {branch.branch_name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Ngày hiệu lực"
                  name="valid_from"
                  rules={[
                    {required: true, message: "Vui lòng chọn ngày hiệu lực"},
                  ]}
                >
                  <DatePicker style={{width: "100%"}}/>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Ngày hết hạn"
                  name="valid_to"
                >
                  <DatePicker
                    style={{width: "100%"}}
                    placeholder="Để trống nếu vô thời hạn"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Trạng thái"
                  name="is_active"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch
                    checkedChildren="Đang áp dụng"
                    unCheckedChildren="Ngừng áp dụng"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Items Section */}
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Các mục giá ({items.length})</span>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined/>}
                  onClick={handleAddItem}
                >
                  Thêm mục
                </Button>
              </div>
            }
            size="small"
          >
            {items.length > 0 ? (
              <Table
                dataSource={items}
                columns={itemsColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#999",
                }}
              >
                {`Chưa có mục giá nào. Nhấp "Thêm mục" để bắt đầu.`}
              </div>
            )}
          </Card>
        </Form>
      </Modal>

      {/* Item Form Modal */}
      <Modal
        title={editingItem ? "Chỉnh sửa mục giá" : "Thêm mục giá"}
        open={itemModalVisible}
        onCancel={() => {
          setItemModalVisible(false);
          itemForm.resetFields();
          setEditingItem(null);
        }}
        onOk={() => itemForm.submit()}
        okText={editingItem ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form<ItemFormData>
          form={itemForm}
          layout="vertical"
          onFinish={handleItemSubmit}
        >
          <Form.Item
            label="Loại mục"
            name="item_type"
            rules={[{required: true, message: "Vui lòng chọn loại mục"}]}
          >
            <Select
              placeholder="Chọn loại"
              disabled={!!editingItem}
              onChange={() => itemForm.setFieldValue("item_id", undefined)}
            >
              <Select.Option value="PRODUCT">Sản phẩm</Select.Option>
              <Select.Option value="SERVICE">Dịch vụ</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.item_type !== currentValues.item_type
            }
          >
            {({getFieldValue}) => {
              const itemType = getFieldValue("item_type");
              const availableItems = getAvailableItems(itemType);

              return (
                <Form.Item
                  label="Chọn mục"
                  name="item_id"
                  rules={[{required: true, message: "Vui lòng chọn mục"}]}
                >
                  <Select
                    placeholder="Chọn mục"
                    showSearch
                    disabled={!itemType || !!editingItem}
                    filterOption={(input, option) =>
                      (option?.children as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {itemType === "PRODUCT" &&
                      (availableItems as Product[]).map((p) => (
                        <Select.Option key={p.product_id} value={p.product_id}>
                          {p.product_name}
                        </Select.Option>
                      ))}
                    {itemType === "SERVICE" &&
                      (availableItems as Service[]).map((s) => (
                        <Select.Option key={s.service_id} value={s.service_id}>
                          {s.service_name}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              );
            }}
          </Form.Item>

          <Form.Item
            label="Chính sách giá"
            name="policy_type"
            rules={[{required: true, message: "Vui lòng chọn chính sách giá"}]}
            hidden={true} // Hiện tạm ẩn trường này
            initialValue={"FIXED"}
          >
            <Select
              placeholder="Chọn chính sách"
              onChange={() => {
                itemForm.setFieldValue("fixed_price", undefined);
                itemForm.setFieldValue("markup_percent", undefined);
              }}
              defaultValue={"FIXED"}
            >
              <Select.Option value="FIXED">Giá cố định</Select.Option>
              <Select.Option value="MARKUP_ON_PEAK">Markup theo giá vốn (%)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.policy_type !== currentValues.policy_type
            }
          >
            {({getFieldValue}) => {
              const policyType = getFieldValue("policy_type");

              if (policyType === "FIXED") {
                return (
                  <Form.Item
                    label={`Giá cố định (${form.getFieldValue("currency") || "VND"})`}
                    name="fixed_price"
                    rules={[
                      {required: true, message: "Vui lòng nhập giá"},
                      {type: "number", min: 0, message: "Giá phải lớn hơn 0"},
                    ]}
                  >
                    <InputNumber
                      style={{width: "100%"}}
                      placeholder="Nhập giá"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                    />
                  </Form.Item>
                );
              } else if (policyType === "MARKUP_ON_PEAK") {
                return (
                  <Form.Item
                    label="Phần trăm markup (%)"
                    name="markup_percent"
                    rules={[
                      {required: true, message: "Vui lòng nhập % markup"},
                      {type: "number", min: 0, message: "Phải lớn hơn hoặc bằng 0"},
                    ]}
                  >
                    <InputNumber
                      style={{width: "100%"}}
                      placeholder="Nhập % markup"
                      min={0}
                      max={1000}
                    />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default PriceBookFormModal;
