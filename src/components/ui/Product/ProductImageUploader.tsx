"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  Button,
  Space,
  Modal,
  Input,
  Form,
  Card,
  Image,
  Tooltip,
  message as antMessage,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  StarFilled,
  StarOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

export interface PendingImage {
  uid: string;
  file: File;
  preview: string;
  altText: string;
  isMain: boolean;
}

interface ProductImageUploaderProps {
  onChange?: (images: PendingImage[]) => void;
  maxCount?: number;
}

const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  onChange,
  maxCount = 10,
}) => {
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Notify parent component when images change
  useEffect(() => {
    onChange?.(pendingImages);
  }, [pendingImages, onChange]);

  const handleAddImage = async () => {
    try {
      const values = await form.validateFields();
      const fileList = values.imageFile as UploadFile[];

      if (!fileList || fileList.length === 0) {
        antMessage.error("Vui lòng chọn file ảnh!");
        return;
      }

      const file = fileList[0].originFileObj;
      if (!file) {
        antMessage.error("File không hợp lệ!");
        return;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);

      // If isMain is checked, unset other main images
      const updatedImages = values.is_main
        ? pendingImages.map((img) => ({ ...img, isMain: false }))
        : pendingImages;

      const newImage: PendingImage = {
        uid: `pending-${Date.now()}`,
        file,
        preview,
        altText: values.alt_text || "",
        isMain: values.is_main || false,
      };

      setPendingImages([...updatedImages, newImage]);
      setAddModalVisible(false);
      form.resetFields();
      antMessage.success("Đã thêm ảnh!");
    } catch (error) {
      console.error("Error adding image:", error);
    }
  };

  const handleDeleteImage = (uid: string) => {
    const image = pendingImages.find((img) => img.uid === uid);
    if (image) {
      // Revoke preview URL to free memory
      URL.revokeObjectURL(image.preview);
    }
    setPendingImages(pendingImages.filter((img) => img.uid !== uid));
  };

  const handleSetMain = (uid: string) => {
    setPendingImages(
      pendingImages.map((img) => ({
        ...img,
        isMain: img.uid === uid,
      }))
    );
  };

  const getValueFromEvent = (e: UploadFile[] | { fileList: UploadFile[] }) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <div>
      <Space
        direction="vertical"
        size="middle"
        style={{ width: "100%" }}
      >
        {/* Image Grid */}
        {pendingImages.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: 16,
            }}
          >
            {pendingImages.map((image) => (
              <Card
                key={image.uid}
                hoverable
                cover={
                  <div style={{ position: "relative", paddingTop: "100%" }}>
                    <Image
                      src={image.preview}
                      alt={image.altText || "Product image"}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      preview={true}
                    />
                    {image.isMain && (
                      <div
                        style={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          background: "rgba(255, 193, 7, 0.95)",
                          borderRadius: 4,
                          padding: "4px 8px",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <StarFilled style={{ color: "#fff", fontSize: 12 }} />
                        <span style={{ color: "#fff", fontSize: 12 }}>
                          Ảnh chính
                        </span>
                      </div>
                    )}
                  </div>
                }
                styles={{
                  body: { padding: 8 },
                }}
              >
                <Space
                  direction="vertical"
                  size={4}
                  style={{ width: "100%" }}
                >
                  {image.altText && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#666",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {image.altText}
                    </div>
                  )}
                  <Space
                    size={4}
                    style={{ width: "100%" }}
                  >
                    {!image.isMain && (
                      <Tooltip title="Đặt làm ảnh chính">
                        <Button
                          type="text"
                          size="small"
                          icon={<StarOutlined />}
                          onClick={() => handleSetMain(image.uid)}
                        />
                      </Tooltip>
                    )}
                    <Tooltip title="Xóa">
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteImage(image.uid)}
                      />
                    </Tooltip>
                  </Space>
                </Space>
              </Card>
            ))}
          </div>
        )}

        {/* Add Button */}
        {pendingImages.length < maxCount && (
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => setAddModalVisible(true)}
            block
          >
            Thêm ảnh sản phẩm ({pendingImages.length}/{maxCount})
          </Button>
        )}
      </Space>

      {/* Add Image Modal */}
      <Modal
        title="Thêm ảnh sản phẩm"
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
        }}
        onOk={handleAddImage}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            label="Chọn ảnh"
            name="imageFile"
            valuePropName="fileList"
            getValueFromEvent={getValueFromEvent}
            rules={[{ required: true, message: "Vui lòng chọn ảnh!" }]}
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
              accept="image/*"
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Chọn ảnh</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Mô tả ảnh (Alt Text)"
            name="alt_text"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả ảnh!" },
              { max: 200, message: "Mô tả không được quá 200 ký tự!" },
            ]}
          >
            <Input.TextArea
              rows={2}
              placeholder="Nhập mô tả cho ảnh (dùng cho SEO)"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="is_main"
            valuePropName="checked"
          >
            <Checkbox>Đặt làm ảnh chính</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductImageUploader;
