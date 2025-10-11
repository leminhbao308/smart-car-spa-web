"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  Form,
  Select,
  Switch,
  Button,
  App,
  Row,
  Col,
  Card,
  Upload,
  Image,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { MemoizedInput, MemoizedInputNumber, MemoizedTextArea } from "@/components/ui/MemoizedComponents";
import { CreateServiceRequest, UpdateServiceRequest } from "@/lib/api/types/service.types";
import { Category } from "@/lib/api/types/category.types";
import { useServiceTypes, useServiceProcesses, useBranches, useCreateService, useUpdateService, useCategories } from "@/lib/api/hooks";
import { ServiceService } from "@/lib/api/services/service.service";
import formatCurrency from "@/components/utils/helper/currency.format.helper";

const { Option } = Select;

interface ServiceModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editData?: {
    serviceId: string;
    serviceName: string;
    serviceUrl: string;
    categoryId?: string;
    description?: string;
    standardDuration?: number;
    requiredSkillLevel?: string;
    isPackage?: boolean;
    basePrice?: number;
    laborCost?: number;
    serviceTypeId?: string;
    isFeatured?: boolean;
    serviceProcessId?: string;
    isDefaultProcess?: boolean;
    branchId?: string;
    imageUrls?: string[];
  };
  title?: string;
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editData,
  title = "Thêm dịch vụ mới",
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const { message } = App.useApp();

  // API hooks
  const { data: serviceTypesData, isLoading: serviceTypesLoading } = useServiceTypes({});
  const { data: serviceProcessesData, isLoading: serviceProcessesLoading } = useServiceProcesses({});
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories(0, 1000);
  const { branches, loading: branchesLoading } = useBranches();
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();

  // Initialize form when modal opens or editData changes
  useEffect(() => {
    if (visible) {
      if (editData) {
        // Edit mode - populate form with existing data
        form.setFieldsValue({
          serviceName: editData.serviceName,
          serviceUrl: editData.serviceUrl,
          categoryId: editData.categoryId,
          description: editData.description,
          standardDuration: editData.standardDuration,
          requiredSkillLevel: editData.requiredSkillLevel,
          isPackage: editData.isPackage,
          basePrice: editData.basePrice,
          laborCost: editData.laborCost,
          serviceTypeId: editData.serviceTypeId,
          isFeatured: editData.isFeatured,
          serviceProcessId: editData.serviceProcessId,
          branchId: editData.branchId,
        });
        setImageUrls(editData.imageUrls || []);
      } else {
        // Create mode - reset form
        form.resetFields();
        setImageUrls([]);
      }
    }
  }, [visible, editData, form]);

  // Watch for form field changes
  const serviceProcessId = Form.useWatch('serviceProcessId', form);
  const laborCost = Form.useWatch('laborCost', form) || 0;
  const basePrice = Form.useWatch('basePrice', form) || 0;
  
  const formRef = useRef(form);
  formRef.current = form;

  const updateFormFields = useCallback(() => {
    if (serviceProcessId && serviceProcessesData) {
      const selectedProcess = serviceProcessesData.find(p => p.id === serviceProcessId);
      if (selectedProcess) {
        // Update estimated duration if not set
        const currentDuration = formRef.current.getFieldValue('standardDuration');
        if (!currentDuration && selectedProcess.estimatedDuration) {
          formRef.current.setFieldValue('standardDuration', selectedProcess.estimatedDuration);
        }
      }
    }
  }, [serviceProcessId, serviceProcessesData]);

  useEffect(() => {
    updateFormFields();
  }, [updateFormFields]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (editData) {
        // Update existing service - KHÔNG gửi basePrice và laborCost
        const updateData: UpdateServiceRequest = {
          service_name: values.serviceName,
          service_url: values.serviceUrl,
          category_id: values.categoryId,
          description: values.description,
          standard_duration: values.standardDuration,
          required_skill_level: values.requiredSkillLevel,
          is_package: values.isPackage || false,
          // base_price: values.basePrice, // KHÔNG được cập nhật trực tiếp
          // labor_cost: values.laborCost, // Sử dụng API riêng
          service_type_id: values.serviceTypeId,
          is_featured: values.isFeatured || false,
          is_active: true,
          service_process_id: values.serviceProcessId,
          branch_id: values.branchId,
        };

        await updateServiceMutation.mutateAsync({
          serviceId: editData.serviceId,
          data: updateData,
        });

        // Cập nhật labor cost riêng nếu có thay đổi
        if (values.laborCost !== editData.laborCost) {
          await ServiceService.updateLaborCost(editData.serviceId, {
            labor_cost: values.laborCost
          });
        }

        // Tính lại base price nếu có thay đổi quy trình
        if (values.serviceProcessId !== editData.serviceProcessId) {
          await ServiceService.recalculateBasePrice(editData.serviceId);
        }

        message.success("Cập nhật dịch vụ thành công!");
      } else {
        // Create new service
        const createData: CreateServiceRequest = {
          service_name: values.serviceName,
          service_url: values.serviceUrl,
          category_id: values.categoryId,
          description: values.description,
          standard_duration: values.standardDuration,
          required_skill_level: values.requiredSkillLevel,
          is_package: values.isPackage || false,
          base_price: 0, // Backend sẽ tự tính từ quy trình
          labor_cost: values.laborCost,
          service_type_id: values.serviceTypeId,
          is_featured: values.isFeatured || false,
          service_process_id: values.serviceProcessId,
          branch_id: values.branchId,
        };

        const newService = await createServiceMutation.mutateAsync(createData);

        // Tính lại base price sau khi tạo (chỉ khi có serviceProcessId)
        if (newService && newService.serviceId && values.serviceProcessId) {
          await ServiceService.recalculateBasePrice(newService.serviceId);
        }

        message.success("Tạo dịch vụ thành công!");
      }

      onSuccess();
    } catch (error) {
      console.error("Error submitting service:", error);
      message.error("Có lỗi xảy ra khi lưu dịch vụ!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImageUrls([]);
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading || createServiceMutation.isPending || updateServiceMutation.isPending}
      width={1000}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isPackage: false,
          isFeatured: false,
          basePrice: 0,
          laborCost: 0,
        }}
      >
        {/* Thông tin cơ bản */}
        <Card title="Thông tin cơ bản" size="small">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Tên dịch vụ"
                name="serviceName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên dịch vụ!" },
                  { min: 2, max: 500, message: "Tên dịch vụ phải từ 2-500 ký tự!" },
                ]}
              >
                <MemoizedInput placeholder="Nhập tên dịch vụ" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="URL dịch vụ"
                name="serviceUrl"
                rules={[
                  { required: true, message: "Vui lòng nhập URL dịch vụ!" },
                  { max: 1000, message: "URL không được quá 1000 ký tự!" },
                ]}
              >
                <MemoizedInput placeholder="Nhập URL dịch vụ" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Danh mục"
                name="categoryId"
                rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
              >
                <Select
                  placeholder="Chọn danh mục"
                  allowClear
                  loading={categoriesLoading}
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) => {
                    const label = String(option?.label ?? "");
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {categoriesData?.data?.content && categoriesData.data.content.length > 0 &&
                    categoriesData.data.content.map((category: Category) => (
                      <Option key={category.category_id} value={category.category_id} label={category.category_name}>
                        {category.category_name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Loại dịch vụ"
                name="serviceTypeId"
                rules={[{ required: true, message: "Vui lòng chọn loại dịch vụ!" }]}
              >
                <Select
                  placeholder="Chọn loại dịch vụ"
                  loading={serviceTypesLoading}
                  showSearch
                  optionFilterProp="children"
                   filterOption={(input, option) =>
                     String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                   }
                >
                  {serviceTypesData?.data?.content && serviceTypesData.data.content.length > 0 &&
                    serviceTypesData.data.content.map((serviceType) => (
                      <Option key={serviceType.serviceTypeId} value={serviceType.serviceTypeId}>
                        {serviceType.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item
                label="Thời gian chuẩn (phút)"
                name="standardDuration"
                rules={[
                  { required: true, message: "Vui lòng nhập thời gian chuẩn!" },
                  { type: "number", min: 1, message: "Thời gian phải lớn hơn 0!" },
                ]}
              >
                <MemoizedInputNumber
                  min={1}
                  style={{ width: "100%" }}
                  placeholder="Nhập thời gian"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item
                label="Cấp độ kỹ năng"
                name="requiredSkillLevel"
                rules={[{ required: true, message: "Vui lòng chọn cấp độ kỹ năng!" }]}
              >
                <Select placeholder="Chọn cấp độ">
                  <Option value="BEGINNER">Cơ bản</Option>
                  <Option value="INTERMEDIATE">Trung bình</Option>
                  <Option value="ADVANCED">Nâng cao</Option>
                  <Option value="EXPERT">Chuyên gia</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Chi nhánh"
                name="branchId"
              >
                <Select
                  placeholder="Chọn chi nhánh"
                  allowClear
                  loading={branchesLoading}
                  showSearch
                  optionFilterProp="children"
                   filterOption={(input, option) =>
                     String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                   }
                >
                  {branches && branches.length > 0 &&
                    branches.map((branch) => (
                      <Option key={branch.branch_id} value={branch.branch_id}>
                        {branch.branch_name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item
                label="Chi phí lao động (VNĐ)"
                name="laborCost"
                rules={[
                  { required: true, message: "Vui lòng nhập chi phí lao động!" },
                  { type: "number", min: 0, message: "Chi phí phải lớn hơn hoặc bằng 0!" },
                ]}
              >
                <MemoizedInputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  placeholder="Nhập chi phí lao động"
                />
              </Form.Item>
            </Col>
             <Col xs={24} sm={6}>
               <Form.Item
                 label="Giá cơ bản (VNĐ)"
                 name="basePrice"
                 extra={
                   <div style={{ fontSize: 12, color: '#666' }}>
                     <div>Giá cơ bản được tính tự động từ quy trình dịch vụ</div>
                   </div>
                 }
               >
                 <MemoizedInputNumber
                   min={0}
                   style={{ 
                     width: "100%",
                     backgroundColor: "#f8f9fa",
                     color: "#666",
                     cursor: "not-allowed",
                     border: "1px solid #e9ecef"
                   }}
                   formatter={(value) =>
                     `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                   }
                   parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                   placeholder="Tự động tính từ quy trình"
                   readOnly
                   disabled
                 />
               </Form.Item>
             </Col>
          </Row>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ max: 2000, message: "Mô tả không được quá 2000 ký tự!" }]}
          >
            <MemoizedTextArea
              rows={3}
              placeholder="Nhập mô tả dịch vụ"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Gói dịch vụ"
                name="isPackage"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Dịch vụ nổi bật"
                name="isFeatured"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Thông tin quy trình */}
        <Card title="Thông tin quy trình" size="small" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Quy trình dịch vụ"
                name="serviceProcessId"
                extra="Chọn quy trình dịch vụ để áp dụng cho dịch vụ này (tùy chọn)"
              >
                <Select
                  placeholder="Chọn quy trình dịch vụ"
                  allowClear
                  loading={serviceProcessesLoading}
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) => {
                    const label = String(option?.label ?? "");
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                  size="large"
                >
                  {serviceProcessesData && serviceProcessesData.length > 0 &&
                    serviceProcessesData.map((process) => (
                      <Option key={process.id} value={process.id} label={process.name}>
                        {process.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Thông tin quy trình được chọn"
                extra="Thông tin chi tiết về quy trình đã chọn"
              >
                <div style={{ 
                  padding: 12, 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: 6, 
                  border: '1px solid #e9ecef',
                  minHeight: 40,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {(() => {
                    const selectedProcess = serviceProcessesData?.find(p => p.id === serviceProcessId);
                    
                    if (selectedProcess) {
                      return (
                        <div style={{ width: '100%' }}>
                          <div style={{ fontWeight: 500, color: '#333', marginBottom: 4 }}>
                            {selectedProcess.name}
                          </div>
                          <div style={{ fontSize: 12, color: '#666' }}>
                            {selectedProcess.description || 'Không có mô tả'} • 
                            {selectedProcess.estimatedDuration} phút • 
                            {selectedProcess.stepCount} bước
                            {selectedProcess.isDefault && ' • Mặc định'}
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div style={{ color: '#999', fontSize: 14 }}>
                        Chưa chọn quy trình
                      </div>
                    );
                  })()}
                </div>
              </Form.Item>
            </Col>
          </Row>
          
          <div style={{ marginTop: 16, padding: 16, backgroundColor: "#f8f9fa", borderRadius: 6, border: "1px solid #e9ecef" }}>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                  Chi phí lao động:
                </div>
                <div style={{ fontWeight: 500, color: "#fa8c16", fontSize: 16 }}>
                  {formatCurrency(laborCost)}
                </div>
              </Col>
              <Col span={8}>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                  Giá cơ bản:
                </div>
                <div style={{ fontWeight: 500, color: "#52c41a", fontSize: 16 }}>
                  {formatCurrency(basePrice)}
                </div>
              </Col>
              <Col span={8}>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                  Tổng dự kiến:
                </div>
                <div style={{ fontWeight: 500, color: "#1890ff", fontSize: 18 }}>
                  {formatCurrency(basePrice + laborCost)}
                </div>
              </Col>
            </Row>
          </div>
        </Card>

        {/* Quản lý hình ảnh */}
        <Card
          title="Hình ảnh dịch vụ"
          size="small"
          style={{ marginTop: 16 }}
          extra={
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={() => false}
              onChange={(info) => {
                if (info.file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const newImageUrl = e.target?.result as string;
                    setImageUrls(prev => [...prev, newImageUrl]);
                  };
                   reader.readAsDataURL(info.file as unknown as File);
                }
              }}
            >
              <Button size="small" icon={<UploadOutlined />}>
                Thêm hình ảnh
              </Button>
            </Upload>
          }
        >
          {imageUrls.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {imageUrls.map((url, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <Image
                    src={url}
                    alt={`Service image ${index + 1}`}
                    style={{ width: 100, height: 100, objectFit: "cover" }}
                    preview={{
                      mask: <EyeOutlined />,
                    }}
                  />
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                    }}
                    onClick={() => {
                      setImageUrls(prev => prev.filter((_, i) => i !== index));
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#999", padding: "20px" }}>
              Chưa có hình ảnh nào
            </div>
          )}
        </Card>
      </Form>
    </Modal>
  );
};

export default ServiceModal;
