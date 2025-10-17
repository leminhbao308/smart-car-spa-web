"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Card,
  Tabs,
  TimePicker,
  App,
  Space,
  Typography,
} from "antd";
import type { TabsProps } from "antd";
import {
  SaveOutlined,
  CloseOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  UserOutlined,
  IdcardOutlined,
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import { CenterService } from "@/lib/api/services/center.service";
import {
  CenterDisplay,
  UpdateCenterFormData,
  BusinessHours,
} from "@/lib/api/types/center.types";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface CenterInfoFormProps {
  open: boolean;
  onCancel: () => void;
  onOk: (centerInfo: CenterDisplay) => void;
  initialData?: CenterDisplay | Record<string, unknown>; // Use CenterDisplay from API
  loading?: boolean;
}

const CenterInfoForm: React.FC<CenterInfoFormProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("basic");
  const [submitLoading, setSubmitLoading] = useState(false);
  const { message } = App.useApp();

  // Helper function to get business hours with defaults
  const getBusinessHoursWithDefaults = (
    businessHours: Partial<BusinessHours> | undefined | null
  ) => {
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ] as const;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, { open: any; close: any }> = {};

    // Ensure businessHours is not null/undefined
    const safeBusinessHours = businessHours || {};

    days.forEach((day) => {
      result[day] = {
        open: safeBusinessHours[day]?.open
          ? dayjs(safeBusinessHours[day]?.open, "HH:mm")
          : dayjs(day === "sunday" ? "09:00" : "08:00", "HH:mm"),
        close: safeBusinessHours[day]?.close
          ? dayjs(safeBusinessHours[day]?.close, "HH:mm")
          : dayjs(
              day === "saturday"
                ? "18:00"
                : day === "sunday"
                ? "17:00"
                : "20:00",
              "HH:mm"
            ),
      };
    });

    return result;
  };

  // Helper function to format business hours for API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatBusinessHoursForAPI = (
    businessHours:
      | Record<string, { open?: any; close?: any }>
      | undefined
      | null
  ): BusinessHours => {
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ] as const;
    const result = {} as BusinessHours;

    // Ensure businessHours is not null/undefined
    const safeBusinessHours = businessHours || {};

    days.forEach((day) => {
      result[day] = {
        open:
          safeBusinessHours[day]?.open?.format("HH:mm") ||
          (day === "sunday" ? "09:00" : "08:00"),
        close:
          safeBusinessHours[day]?.close?.format("HH:mm") ||
          (day === "saturday" ? "18:00" : day === "sunday" ? "17:00" : "20:00"),
      };
    });

    return result;
  };

  useEffect(() => {
    if (open) {
      if (initialData) {
        const data = initialData as CenterDisplay;

        // Debug log to check data structure
        console.log("Initial data:", data);
        console.log("Business hours:", data.business_hours);

        // Parse business hours with safe fallback - handle both CenterDisplay and Record types
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const businessHours = (data as any).business_hours || {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const contactInfo = (data as any).contact_info || {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const socialMedia = (data as any).social_media || {};

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const safeData = data as any;

        form.setFieldsValue({
          // Basic information
          center_name: safeData.center_name || "",
          center_code: safeData.center_code || "",
          description: safeData.description || "",
          headquarters_address: safeData.headquarters_address || "",
          headquarters_phone: safeData.headquarters_phone || "",
          headquarters_email: safeData.headquarters_email || "",
          website: safeData.website || "",
          tax_code: safeData.tax_code || "",
          business_license: safeData.business_license || "",
          logo_url: safeData.logo_url || "",
          established_date: safeData.established_date || "",
          operating_status: safeData.operating_status || "ACTIVE",
          is_active:
            safeData.is_active !== undefined ? safeData.is_active : true,
          manager_id: safeData.manager_id || "",

          // Business hours
          business_hours: getBusinessHoursWithDefaults(businessHours),

          // Contact info
          contact_info: {
            emergency_phone: contactInfo.emergency_phone || "",
            support_email: contactInfo.support_email || "",
            marketing_email: contactInfo.marketing_email || "",
            vip_line: contactInfo.vip_line || "",
          },

          // Social media
          social_media: {
            facebook: socialMedia.facebook || "",
            instagram: socialMedia.instagram || "",
            youtube: socialMedia.youtube || "",
            tiktok: socialMedia.tiktok || "",
          },

          // Service areas
          service_areas: safeData.service_areas || [],
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialData, form]);

  const handleSubmit = async () => {
    setSubmitLoading(true);
    try {
      const values = await form.validateFields();

      // Transform form data to UpdateCenterFormData format
      const updateData: UpdateCenterFormData = {
        center_name: values.center_name,
        center_code: values.center_code,
        description: values.description,
        headquarters_address: values.headquarters_address,
        headquarters_phone: values.headquarters_phone,
        headquarters_email: values.headquarters_email,
        website: values.website,
        tax_code: values.tax_code,
        business_license: values.business_license,
        logo_url: values.logo_url || "/images/Main Logo_Light.png",
        established_date: values.established_date || "",
        operating_status: values.operating_status,
        business_hours: formatBusinessHoursForAPI(values.business_hours),
        contact_info: {
          emergency_phone: values.contact_info?.emergency_phone || "",
          support_email: values.contact_info?.support_email || "",
          marketing_email: values.contact_info?.marketing_email || "",
          vip_line: values.contact_info?.vip_line || "",
        },
        social_media: {
          facebook: values.social_media?.facebook || "",
          instagram: values.social_media?.instagram || "",
          youtube: values.social_media?.youtube || "",
          tiktok: values.social_media?.tiktok || "",
        },
        service_areas: values.service_areas || [],
        is_active: values.is_active,
        manager_id: values.manager_id,
      };

      // Call API to update center
      if (initialData && (initialData as CenterDisplay).center_id) {
        const updatedCenter = await CenterService.updateCenterWithFormData(
          (initialData as CenterDisplay).center_id,
          updateData
        );
        onOk(updatedCenter);
      }
    } catch (error) {
      console.error("Update center failed:", error);
      // Show error message to user
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi cập nhật thông tin!";
      message.error(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const tabItems: TabsProps["items"] = [
    {
      key: "basic",
      label: (
        <span>
          <EditOutlined />
          Thông tin cơ bản
        </span>
      ),
      children: (
        <div style={{ padding: "0 8px" }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="operating_status"
                label="Trạng thái hoạt động"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="ACTIVE">
                    <span style={{ color: "#52c41a" }}>●</span> Hoạt động
                  </Option>
                  <Option value="INACTIVE">
                    <span style={{ color: "#ff4d4f" }}>●</span> Tạm dừng
                  </Option>
                  <Option value="MAINTENANCE">
                    <span style={{ color: "#faad14" }}>●</span> Bảo trì
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[24, 24]}>
            {/* Thông tin chung */}
            <Col span={12}>
              <Card
                title={
                  <Space>
                    <EditOutlined style={{ color: "#1890ff" }} />
                    <Text strong>Thông tin chung</Text>
                  </Space>
                }
                style={{ height: "100%" }}
              >
                <Form.Item
                  name="center_name"
                  label={
                    <Space>
                      <UserOutlined />
                      Tên trung tâm
                    </Space>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập tên trung tâm" },
                  ]}
                >
                  <Input placeholder="Nhập tên trung tâm" />
                </Form.Item>

                <Form.Item
                  name="center_code"
                  label={
                    <Space>
                      <IdcardOutlined />
                      Mã trung tâm
                    </Space>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập mã trung tâm" },
                  ]}
                >
                  <Input placeholder="Nhập mã trung tâm" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Mô tả"
                  rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                >
                  <TextArea rows={3} placeholder="Nhập mô tả về trung tâm" />
                </Form.Item>

                <Form.Item
                  name="established_date"
                  label="Ngày thành lập"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày thành lập" },
                  ]}
                >
                  <Input type="date" />
                </Form.Item>
              </Card>
            </Col>

            {/* Thông tin pháp lý */}
            <Col span={12}>
              <Card
                title={
                  <Space>
                    <IdcardOutlined style={{ color: "#52c41a" }} />
                    <Text strong>Thông tin pháp lý</Text>
                  </Space>
                }
                style={{ height: "100%" }}
              >
                <Form.Item
                  name="business_license"
                  label="Số giấy phép kinh doanh"
                  rules={[
                    { required: true, message: "Vui lòng nhập số giấy phép" },
                  ]}
                >
                  <Input placeholder="Nhập số giấy phép kinh doanh" />
                </Form.Item>

                <Form.Item
                  name="tax_code"
                  label="Mã số thuế"
                  rules={[
                    { required: true, message: "Vui lòng nhập mã số thuế" },
                  ]}
                >
                  <Input placeholder="Nhập mã số thuế" />
                </Form.Item>

                <Form.Item
                  name="website"
                  label={
                    <Space>
                      <GlobalOutlined />
                      Website
                    </Space>
                  }
                  rules={[{ type: "url", message: "URL không hợp lệ" }]}
                >
                  <Input placeholder="https://example.com" />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: "contact",
      label: (
        <span>
          <PhoneOutlined />
          Thông tin liên hệ
        </span>
      ),
      children: (
        <div style={{ padding: "0 8px" }}>
          <Row gutter={[24, 24]}>
            {/* Địa chỉ */}
            <Col span={12}>
              <Card
                title={
                  <Space>
                    <EnvironmentOutlined style={{ color: "#52c41a" }} />
                    <Text strong>Địa chỉ trụ sở</Text>
                  </Space>
                }
                style={{ height: "100%" }}
              >
                <Form.Item
                  name="headquarters_address"
                  label="Địa chỉ đầy đủ"
                  rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                >
                  <TextArea rows={3} placeholder="Nhập địa chỉ đầy đủ" />
                </Form.Item>

                <Form.Item
                  name="headquarters_phone"
                  label={
                    <Space>
                      <PhoneOutlined />
                      Số điện thoại
                    </Space>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                    {
                      pattern: /^[0-9+\-\s()]{10,15}$/,
                      message: "Số điện thoại không hợp lệ",
                    },
                  ]}
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>

                <Form.Item
                  name="headquarters_email"
                  label={
                    <Space>
                      <MailOutlined />
                      Email
                    </Space>
                  }
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input placeholder="Nhập email" />
                </Form.Item>
              </Card>
            </Col>

            {/* Thông tin liên hệ bổ sung */}
            <Col span={12}>
              <Card
                title={
                  <Space>
                    <PhoneOutlined style={{ color: "#1890ff" }} />
                    <Text strong>Thông tin liên hệ bổ sung</Text>
                  </Space>
                }
                style={{ height: "100%" }}
              >
                <Form.Item
                  name={["contact_info", "emergency_phone"]}
                  label="Số điện thoại khẩn cấp"
                >
                  <Input placeholder="Nhập số điện thoại khẩn cấp" />
                </Form.Item>

                <Form.Item
                  name={["contact_info", "vip_line"]}
                  label="Hotline VIP"
                >
                  <Input placeholder="Nhập hotline VIP" />
                </Form.Item>

                <Form.Item
                  name={["contact_info", "support_email"]}
                  label="Email hỗ trợ"
                  rules={[{ type: "email", message: "Email không hợp lệ" }]}
                >
                  <Input placeholder="Nhập email hỗ trợ" />
                </Form.Item>

                <Form.Item
                  name={["contact_info", "marketing_email"]}
                  label="Email marketing"
                  rules={[{ type: "email", message: "Email không hợp lệ" }]}
                >
                  <Input placeholder="Nhập email marketing" />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          {/* Giờ làm việc */}
          <Card
            title={
              <Space>
                <ClockCircleOutlined style={{ color: "#fa8c16" }} />
                <Text strong>Giờ làm việc</Text>
              </Space>
            }
            style={{ marginTop: 24 }}
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Title level={5}>Thứ 2</Title>
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item
                      name={["business_hours", "monday", "open"]}
                      label="Mở cửa"
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        format="HH:mm"
                        placeholder="Chọn giờ"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={["business_hours", "monday", "close"]}
                      label="Đóng cửa"
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        format="HH:mm"
                        placeholder="Chọn giờ"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>

              <Col span={8}>
                <Title level={5}>Thứ 3</Title>
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item
                      name={["business_hours", "tuesday", "open"]}
                      label="Mở cửa"
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        format="HH:mm"
                        placeholder="Chọn giờ"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={["business_hours", "tuesday", "close"]}
                      label="Đóng cửa"
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        format="HH:mm"
                        placeholder="Chọn giờ"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>

              <Col span={8}>
                <Title level={5}>Thứ 4</Title>
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item
                      name={["business_hours", "wednesday", "open"]}
                      label="Mở cửa"
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        format="HH:mm"
                        placeholder="Chọn giờ"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={["business_hours", "wednesday", "close"]}
                      label="Đóng cửa"
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        format="HH:mm"
                        placeholder="Chọn giờ"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>

              <Col span={8}>
                <Title level={5}>Thứ 5</Title>
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item
                      name={["business_hours", "thursday", "open"]}
                      label="Mở cửa"
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        format="HH:mm"
                        placeholder="Chọn giờ"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={["business_hours", "thursday", "close"]}
                      label="Đóng cửa"
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        format="HH:mm"
                        placeholder="Chọn giờ"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>

              <Col span={8}>
                <Title level={5}>Thứ 6</Title>
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item
                      name={["business_hours", "friday", "open"]}
                      label="Mở cửa"
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        format="HH:mm"
                        placeholder="Chọn giờ"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={["business_hours", "friday", "close"]}
                      label="Đóng cửa"
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        format="HH:mm"
                        placeholder="Chọn giờ"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>

              <Col span={8}>
                <Title level={5}>Thứ 7</Title>
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item
                      name={["business_hours", "saturday", "open"]}
                      label="Mở cửa"
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        format="HH:mm"
                        placeholder="Chọn giờ"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={["business_hours", "saturday", "close"]}
                      label="Đóng cửa"
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        format="HH:mm"
                        placeholder="Chọn giờ"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>

              <Col span={8}>
                <Title level={5}>Chủ nhật</Title>
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item
                      name={["business_hours", "sunday", "open"]}
                      label="Mở cửa"
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        format="HH:mm"
                        placeholder="Chọn giờ"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={["business_hours", "sunday", "close"]}
                      label="Đóng cửa"
                    >
                      <TimePicker
                        style={{ width: "100%" }}
                        format="HH:mm"
                        placeholder="Chọn giờ"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </div>
      ),
    },
    {
      key: "social",
      label: (
        <span>
          <FacebookOutlined />
          Mạng xã hội & Dịch vụ
        </span>
      ),
      children: (
        <div style={{ padding: "0 8px" }}>
          <Row gutter={[24, 24]}>
            {/* Social Media */}
            <Col span={12}>
              <Card
                title={
                  <Space>
                    <FacebookOutlined style={{ color: "#1890ff" }} />
                    <Text strong>Mạng xã hội</Text>
                  </Space>
                }
                style={{ height: "100%" }}
              >
                <Form.Item
                  name={["social_media", "facebook"]}
                  label={
                    <Space>
                      <FacebookOutlined style={{ color: "#1877f2" }} />
                      Facebook
                    </Space>
                  }
                  rules={[{ type: "url", message: "URL không hợp lệ" }]}
                >
                  <Input placeholder="https://facebook.com/yourpage" />
                </Form.Item>

                <Form.Item
                  name={["social_media", "instagram"]}
                  label={
                    <Space>
                      <InstagramOutlined style={{ color: "#e4405f" }} />
                      Instagram
                    </Space>
                  }
                  rules={[{ type: "url", message: "URL không hợp lệ" }]}
                >
                  <Input placeholder="https://instagram.com/yourpage" />
                </Form.Item>

                <Form.Item
                  name={["social_media", "youtube"]}
                  label={
                    <Space>
                      <YoutubeOutlined style={{ color: "#ff0000" }} />
                      YouTube
                    </Space>
                  }
                  rules={[{ type: "url", message: "URL không hợp lệ" }]}
                >
                  <Input placeholder="https://youtube.com/yourchannel" />
                </Form.Item>

                <Form.Item
                  name={["social_media", "tiktok"]}
                  label="TikTok"
                  rules={[{ type: "url", message: "URL không hợp lệ" }]}
                >
                  <Input placeholder="https://tiktok.com/@yourpage" />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "#1890ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <EditOutlined style={{ fontSize: 18 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
              {initialData
                ? "Cập nhật thông tin trung tâm"
                : "Thêm thông tin trung tâm"}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {initialData
                ? "Chỉnh sửa thông tin chi tiết của trung tâm"
                : "Thêm thông tin mới cho trung tâm"}
            </Text>
          </div>
        </div>
      }
      open={open}
      onCancel={onCancel}
      width={1400}
      style={{ top: 20 }}
      styles={{
        body: {
          padding: "24px 0",
        },
      }}
      footer={[
        <Button
          key="cancel"
          icon={<CloseOutlined />}
          onClick={onCancel}
          size="large"
        >
          Hủy bỏ
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SaveOutlined />}
          loading={submitLoading}
          onClick={handleSubmit}
          size="large"
          style={{ minWidth: 120 }}
        >
          {initialData ? "Cập nhật" : "Thêm mới"}
        </Button>,
      ]}
    >
      <div style={{ padding: "0 24px" }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            operating_status: "ACTIVE",
            is_active: true,
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
            style={{ minHeight: 500 }}
            tabBarStyle={{
              marginBottom: 24,
              borderBottom: "1px solid #f0f0f0",
            }}
          />
        </Form>
      </div>
    </Modal>
  );
};

export default CenterInfoForm;
