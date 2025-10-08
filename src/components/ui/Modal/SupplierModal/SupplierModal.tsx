"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Row,
  Col,
  message,
  Card,
  DatePicker,
  Tabs} from "antd";
import { 
  BankOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  Supplier,
  supplierStatuses,
  contractStatuses,
  cities} from "@/components/utils/data/suppliers.data";
import { MemoizedInput, MemoizedTextArea, MemoizedInputNumber } from "@/components/ui/MemoizedComponents";

const { Option } = Select;

interface SupplierModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (data: Supplier) => void;
  initialData?: Supplier | null;
  title?: string;
}

const SupplierModal: React.FC<SupplierModalProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
  title = "Thêm nhà cung cấp mới"}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setIsViewMode(title.includes("Chi tiết"));
        form.setFieldsValue({
          ...initialData,
          contractStartDate: dayjs(initialData.contractInfo.startDate),
          contractEndDate: dayjs(initialData.contractInfo.endDate)} as any);
      } else {
        setIsViewMode(false);
        form.resetFields();
      }
    }
  }, [open, initialData, form, title]);

  const handleOk = async () => {
    if (isViewMode) {
      onCancel();
      return;
    }

    try {
      setLoading(true);
      const values = await form.validateFields();

      const formattedData: Supplier = {
        ...values,
        id: initialData?.id || Date.now(),
        type: "product", // Default type
        services: {
          productCategories: [],
          serviceTypes: [],
          specialties: [],
          certifications: []},
        tags: [], // Bỏ tags
        performance: {
          rating: 0,
          totalOrders: 0,
          completedOrders: 0,
          onTimeDelivery: 0,
          qualityScore: 0,
          lastOrderDate: "",
          totalValue: 0},
        documents: {
          contracts: [],
          certificates: [],
          invoices: [],
          other: []},
        contractInfo: {
          ...values.contractInfo,
          startDate: values.contractStartDate.format("YYYY-MM-DD"),
          endDate: values.contractEndDate.format("YYYY-MM-DD")},
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()};

      // Remove date fields from the data
      delete (formattedData as any).contractStartDate;
      delete (formattedData as any).contractEndDate;

      onOk(formattedData);
      message.success(
        initialData ? "Cập nhật nhà cung cấp thành công!" : "Thêm nhà cung cấp thành công!"
      );
    } catch (error) {
      console.log("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInfo = () => (
    <Card title="Thông tin cơ bản" size="small" style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Tên nhà cung cấp"
            rules={[{ required: true, message: "Vui lòng nhập tên nhà cung cấp!" }]}
          >
            <MemoizedInput 
              placeholder="Nhập tên nhà cung cấp" 
              disabled={isViewMode}
              prefix={<BankOutlined />}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="code"
            label="Mã nhà cung cấp"
            rules={[{ required: true, message: "Vui lòng nhập mã nhà cung cấp!" }]}
          >
            <MemoizedInput 
              placeholder="Nhập mã nhà cung cấp" 
              disabled={isViewMode}
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item
        name="category"
        label="Danh mục"
        rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
      >
        <MemoizedInput 
          placeholder="Nhập danh mục sản phẩm/dịch vụ" 
          disabled={isViewMode}
        />
      </Form.Item>

      <Form.Item
        name="description"
        label="Mô tả"
      >
        <MemoizedTextArea 
          rows={3} 
          placeholder="Nhập mô tả về nhà cung cấp" 
          disabled={isViewMode}
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select placeholder="Chọn trạng thái" disabled={isViewMode}>
              {supplierStatuses.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <MemoizedTextArea 
              rows={2} 
              placeholder="Nhập ghi chú" 
              disabled={isViewMode}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const renderContactInfo = () => (
    <Card title="Thông tin liên hệ" size="small" style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={["contactInfo", "phone"]}
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
          >
            <MemoizedInput 
              placeholder="Nhập số điện thoại" 
              disabled={isViewMode}
              prefix={<PhoneOutlined />}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={["contactInfo", "email"]}
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" }
            ]}
          >
            <MemoizedInput 
              placeholder="Nhập email" 
              disabled={isViewMode}
              prefix={<MailOutlined />}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={["contactInfo", "website"]}
            label="Website"
          >
            <MemoizedInput 
              placeholder="Nhập website" 
              disabled={isViewMode}
              prefix={<GlobalOutlined />}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={["contactInfo", "city"]}
            label="Thành phố"
            rules={[{ required: true, message: "Vui lòng chọn thành phố!" }]}
          >
            <Select placeholder="Chọn thành phố" disabled={isViewMode}>
              {cities.map((city) => (
                <Option key={city} value={city}>
                  {city}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name={["contactInfo", "address"]}
        label="Địa chỉ"
        rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
      >
        <MemoizedTextArea 
          rows={2} 
          placeholder="Nhập địa chỉ chi tiết" 
          disabled={isViewMode}
        />
      </Form.Item>
    </Card>
  );

  const renderBusinessInfo = () => (
    <Card title="Thông tin doanh nghiệp" size="small" style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={["businessInfo", "taxCode"]}
            label="Mã số thuế"
            rules={[{ required: true, message: "Vui lòng nhập mã số thuế!" }]}
          >
            <MemoizedInput 
              placeholder="Nhập mã số thuế" 
              disabled={isViewMode}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={["businessInfo", "businessLicense"]}
            label="Giấy phép kinh doanh"
            rules={[{ required: true, message: "Vui lòng nhập giấy phép kinh doanh!" }]}
          >
            <MemoizedInput 
              placeholder="Nhập số giấy phép" 
              disabled={isViewMode}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={["businessInfo", "representative"]}
            label="Người đại diện"
            rules={[{ required: true, message: "Vui lòng nhập tên người đại diện!" }]}
          >
            <MemoizedInput 
              placeholder="Nhập tên người đại diện" 
              disabled={isViewMode}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={["businessInfo", "position"]}
            label="Chức vụ"
            rules={[{ required: true, message: "Vui lòng nhập chức vụ!" }]}
          >
            <MemoizedInput 
              placeholder="Nhập chức vụ" 
              disabled={isViewMode}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={["businessInfo", "bankAccount"]}
            label="Số tài khoản"
            rules={[{ required: true, message: "Vui lòng nhập số tài khoản!" }]}
          >
            <MemoizedInput 
              placeholder="Nhập số tài khoản" 
              disabled={isViewMode}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={["businessInfo", "bankName"]}
            label="Tên ngân hàng"
            rules={[{ required: true, message: "Vui lòng nhập tên ngân hàng!" }]}
          >
            <MemoizedInput 
              placeholder="Nhập tên ngân hàng" 
              disabled={isViewMode}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const renderContractInfo = () => (
    <Card title="Thông tin hợp đồng" size="small">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={["contractInfo", "contractNumber"]}
            label="Số hợp đồng"
            rules={[{ required: true, message: "Vui lòng nhập số hợp đồng!" }]}
          >
            <MemoizedInput 
              placeholder="Nhập số hợp đồng" 
              disabled={isViewMode}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={["contractInfo", "status"]}
            label="Trạng thái hợp đồng"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái hợp đồng!" }]}
          >
            <Select placeholder="Chọn trạng thái" disabled={isViewMode}>
              {contractStatuses.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="contractStartDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              disabled={isViewMode}
              placeholder="Chọn ngày bắt đầu"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="contractEndDate"
            label="Ngày kết thúc"
            rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc!" }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              disabled={isViewMode}
              placeholder="Chọn ngày kết thúc"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name={["contractInfo", "paymentTerms"]}
            label="Điều khoản thanh toán"
          >
            <MemoizedInput 
              placeholder="VD: 30 ngày" 
              disabled={isViewMode}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={["contractInfo", "deliveryTerms"]}
            label="Điều khoản giao hàng"
          >
            <MemoizedInput 
              placeholder="VD: FOB" 
              disabled={isViewMode}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name={["contractInfo", "warrantyPeriod"]}
            label="Thời gian bảo hành"
          >
            <MemoizedInput 
              placeholder="VD: 12 tháng" 
              disabled={isViewMode}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      width={1000}
      okText={isViewMode ? "Đóng" : (initialData ? "Cập nhật" : "Thêm mới")}
      cancelText="Hủy"
      confirmLoading={loading}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "active",
          contractInfo: {
            status: "active"}}}
      >
        <Tabs 
          defaultActiveKey="basic" 
          type="card"
          items={[
            {
              key: "basic",
              label: "Thông tin cơ bản",
              children: (
                <>
                  {renderBasicInfo()}
                  {renderContactInfo()}
                </>
              )},
            {
              key: "business",
              label: "Thông tin doanh nghiệp",
              children: renderBusinessInfo()},
            {
              key: "contract",
              label: "Hợp đồng",
              children: renderContractInfo()},
          ]}
        />
      </Form>
    </Modal>
  );
};

export default SupplierModal;
