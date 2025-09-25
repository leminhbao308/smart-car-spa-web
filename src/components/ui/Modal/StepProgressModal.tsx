"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Button,
  Space,
  Divider,
  Typography,
  message,
  Card,
  List,
  Tag,
  Upload,
  Rate,
  Checkbox,
  Progress,
  Image,
  Video,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  CameraOutlined,
  VideoCameraOutlined,
  FileOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { 
  StepProgress,
  VehicleInCare,
  CareStep
} from "@/components/utils/data/care-processes.data";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

interface StepProgressModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (data: StepProgress) => void;
  initialData?: StepProgress | null;
  vehicle: VehicleInCare;
  step: CareStep;
  title?: string;
}

const StepProgressModal: React.FC<StepProgressModalProps> = ({
  open,
  onCancel,
  onOk,
  initialData,
  vehicle,
  step,
  title = "Cập nhật tiến độ bước",
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("progress");
  const [qualityChecklist, setQualityChecklist] = useState<{item: string; checked: boolean; notes?: string}[]>([]);
  const [mediaFiles, setMediaFiles] = useState<{id: number; type: "image" | "video"; url: string; description?: string; uploadedAt: string}[]>([]);
  const [issues, setIssues] = useState<{id: number; description: string; severity: "low" | "medium" | "high"; resolved: boolean; resolution?: string}[]>([]);

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        rating: initialData.rating || 0,
        notes: initialData.notes || "",
      });
      setQualityChecklist(initialData.qualityChecklist || []);
      setMediaFiles(initialData.mediaFiles || []);
      setIssues(initialData.issues || []);
    } else {
      form.resetFields();
      setQualityChecklist(step.qualityChecklist.map(item => ({ item, checked: false })));
      setMediaFiles([]);
      setIssues([]);
    }
  }, [initialData, step, form]);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const stepData: StepProgress = {
        ...values,
        id: initialData?.id || Date.now(),
        vehicleInCareId: vehicle.id,
        stepId: step.id,
        stepName: step.name,
        status: values.status || "completed",
        startTime: initialData?.startTime || new Date().toISOString(),
        endTime: new Date().toISOString(),
        actualDuration: initialData?.actualDuration || 0,
        staffId: 1, // TODO: Get from context
        staffName: "Nhân viên hiện tại", // TODO: Get from context
        qualityChecklist: qualityChecklist,
        mediaFiles: mediaFiles,
        issues: issues,
      };

      onOk(stepData);
      message.success("Cập nhật tiến độ bước thành công!");
      form.resetFields();
      setQualityChecklist([]);
      setMediaFiles([]);
      setIssues([]);
    } catch (error) {
      console.log("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setQualityChecklist([]);
    setMediaFiles([]);
    setIssues([]);
    onCancel();
  };

  const updateQualityChecklist = (index: number, field: string, value: any) => {
    const updatedChecklist = [...qualityChecklist];
    updatedChecklist[index] = { ...updatedChecklist[index], [field]: value };
    setQualityChecklist(updatedChecklist);
  };

  const addMediaFile = (type: "image" | "video", url: string, description?: string) => {
    const newFile = {
      id: Date.now(),
      type,
      url,
      description: description || "",
      uploadedAt: new Date().toISOString(),
    };
    setMediaFiles([...mediaFiles, newFile]);
  };

  const removeMediaFile = (fileId: number) => {
    setMediaFiles(mediaFiles.filter(file => file.id !== fileId));
  };

  const addIssue = () => {
    const newIssue = {
      id: Date.now(),
      description: "",
      severity: "low" as const,
      resolved: false,
    };
    setIssues([...issues, newIssue]);
  };

  const updateIssue = (index: number, field: string, value: any) => {
    const updatedIssues = [...issues];
    updatedIssues[index] = { ...updatedIssues[index], [field]: value };
    setIssues(updatedIssues);
  };

  const removeIssue = (index: number) => {
    setIssues(issues.filter((_, i) => i !== index));
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "green";
      case "medium":
        return "orange";
      case "high":
        return "red";
      default:
        return "default";
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "low":
        return "Thấp";
      case "medium":
        return "Trung bình";
      case "high":
        return "Cao";
      default:
        return severity;
    }
  };

  const tabItems = [
    {
      key: "progress",
      label: "Tiến độ",
      children: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="status"
              label="Trạng thái bước"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="completed">Hoàn thành</Option>
                <Option value="in_progress">Đang thực hiện</Option>
                <Option value="skipped">Bỏ qua</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="actualDuration"
              label="Thời gian thực tế (phút)"
            >
              <InputNumber
                min={0}
                placeholder="Nhập thời gian thực tế"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="rating"
              label="Đánh giá chất lượng"
            >
              <Rate />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="notes"
              label="Ghi chú"
            >
              <TextArea
                rows={3}
                placeholder="Nhập ghi chú về bước này"
              />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: "quality",
      label: "Kiểm tra chất lượng",
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Title level={5}>Danh sách kiểm tra chất lượng</Title>
            <Text type="secondary">
              Đánh dấu các tiêu chí đã hoàn thành và thêm ghi chú nếu cần
            </Text>
          </div>
          
          <List
            dataSource={qualityChecklist}
            renderItem={(item, index) => (
              <List.Item key={index}>
                <Card size="small" style={{ width: "100%" }}>
                  <Row gutter={8} align="middle">
                    <Col span={2}>
                      <Checkbox
                        checked={item.checked}
                        onChange={(e) => updateQualityChecklist(index, "checked", e.target.checked)}
                      />
                    </Col>
                    <Col span={16}>
                      <Text style={{ textDecoration: item.checked ? "line-through" : "none" }}>
                        {item.item}
                      </Text>
                    </Col>
                    <Col span={6}>
                      <Input
                        value={item.notes}
                        onChange={(e) => updateQualityChecklist(index, "notes", e.target.value)}
                        placeholder="Ghi chú"
                        size="small"
                      />
                    </Col>
                  </Row>
                </Card>
              </List.Item>
            )}
          />
          
          {qualityChecklist.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>
              <Text>Không có tiêu chí kiểm tra nào.</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "media",
      label: "Hình ảnh & Video",
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Title level={5}>Upload hình ảnh và video</Title>
            <Text type="secondary">
              Thêm hình ảnh và video để ghi lại quá trình thực hiện
            </Text>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={(file) => {
                // Simulate upload
                const url = URL.createObjectURL(file);
                addMediaFile("image", url, `Hình ảnh ${file.name}`);
                return false;
              }}
            >
              <Button icon={<CameraOutlined />}>
                Upload hình ảnh
              </Button>
            </Upload>
            
            <Upload
              accept="video/*"
              showUploadList={false}
              beforeUpload={(file) => {
                // Simulate upload
                const url = URL.createObjectURL(file);
                addMediaFile("video", url, `Video ${file.name}`);
                return false;
              }}
              style={{ marginLeft: 8 }}
            >
              <Button icon={<VideoCameraOutlined />}>
                Upload video
              </Button>
            </Upload>
          </div>
          
          <List
            dataSource={mediaFiles}
            renderItem={(file) => (
              <List.Item key={file.id}>
                <Card size="small" style={{ width: "100%" }}>
                  <Row gutter={8} align="middle">
                    <Col span={2}>
                      {file.type === "image" ? (
                        <CameraOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                      ) : (
                        <VideoCameraOutlined style={{ fontSize: 20, color: "#52c41a" }} />
                      )}
                    </Col>
                    <Col span={16}>
                      <div>
                        <Text strong>{file.description}</Text>
                        <div>
                          <Text style={{ fontSize: 12, color: "#8c8c8c" }}>
                            Uploaded: {new Date(file.uploadedAt).toLocaleString("vi-VN")}
                          </Text>
                        </div>
                      </div>
                    </Col>
                    <Col span={4}>
                      <Button
                        type="text"
                        size="small"
                        onClick={() => {
                          // Preview media
                          if (file.type === "image") {
                            // Show image preview
                          } else {
                            // Show video preview
                          }
                        }}
                      >
                        Xem
                      </Button>
                    </Col>
                    <Col span={2}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeMediaFile(file.id)}
                      />
                    </Col>
                  </Row>
                </Card>
              </List.Item>
            )}
          />
          
          {mediaFiles.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>
              <Text>Chưa có file nào được upload.</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "issues",
      label: "Vấn đề & Sự cố",
      children: (
        <div>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Title level={5} style={{ margin: 0 }}>Vấn đề và sự cố</Title>
              <Text type="secondary">
                Ghi nhận các vấn đề phát sinh trong quá trình thực hiện
              </Text>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={addIssue}>
              Thêm vấn đề
            </Button>
          </div>
          
          <List
            dataSource={issues}
            renderItem={(issue, index) => (
              <List.Item key={issue.id}>
                <Card size="small" style={{ width: "100%" }}>
                  <Row gutter={8}>
                    <Col span={24}>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>Mô tả vấn đề:</Text>
                        <Input
                          value={issue.description}
                          onChange={(e) => updateIssue(index, "description", e.target.value)}
                          placeholder="Nhập mô tả vấn đề"
                          style={{ marginTop: 4 }}
                        />
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>Mức độ:</Text>
                        <Select
                          value={issue.severity}
                          onChange={(value) => updateIssue(index, "severity", value)}
                          style={{ width: "100%", marginTop: 4 }}
                        >
                          <Option value="low">Thấp</Option>
                          <Option value="medium">Trung bình</Option>
                          <Option value="high">Cao</Option>
                        </Select>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>Trạng thái:</Text>
                        <div style={{ marginTop: 4 }}>
                          <Checkbox
                            checked={issue.resolved}
                            onChange={(e) => updateIssue(index, "resolved", e.target.checked)}
                          >
                            Đã giải quyết
                          </Checkbox>
                        </div>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ marginBottom: 8, textAlign: "right" }}>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeIssue(index)}
                        />
                      </div>
                    </Col>
                    {issue.resolved && (
                      <Col span={24}>
                        <div>
                          <Text strong>Giải pháp:</Text>
                          <Input
                            value={issue.resolution}
                            onChange={(e) => updateIssue(index, "resolution", e.target.value)}
                            placeholder="Nhập giải pháp đã áp dụng"
                            style={{ marginTop: 4 }}
                          />
                        </div>
                      </Col>
                    )}
                  </Row>
                </Card>
              </List.Item>
            )}
          />
          
          {issues.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>
              <Text>Không có vấn đề nào được ghi nhận.</Text>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      width={800}
      confirmLoading={loading}
      okText="Cập nhật"
      cancelText="Hủy"
    >
      <div style={{ marginBottom: 16 }}>
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Xe:</Text>
              <div>{vehicle.vehicleInfo.brand} {vehicle.vehicleInfo.model}</div>
            </Col>
            <Col span={12}>
              <Text strong>Bước:</Text>
              <div>{step.name}</div>
            </Col>
            <Col span={12}>
              <Text strong>Thời gian ước tính:</Text>
              <div>{formatTime(step.estimatedTime)}</div>
            </Col>
            <Col span={12}>
              <Text strong>Dụng cụ cần thiết:</Text>
              <div>{step.requiredTools.join(", ")}</div>
            </Col>
          </Row>
        </Card>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "completed",
          rating: 5,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
            {tabItems.map((tab) => (
              <Button
                key={tab.key}
                type={activeTab === tab.key ? "primary" : "default"}
                onClick={() => setActiveTab(tab.key)}
                size="small"
              >
                {tab.label}
              </Button>
            ))}
          </Space>
        </div>
        
        <Divider />
        
        {tabItems.find(tab => tab.key === activeTab)?.children}
      </Form>
    </Modal>
  );
};

export default StepProgressModal;
