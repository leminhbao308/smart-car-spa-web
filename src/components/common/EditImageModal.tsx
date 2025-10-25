"use client";

import React from "react";
import { Modal, Form, Input, Upload, Image, Typography, Checkbox } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { FormInstance, UploadFile } from "antd";

export interface EditImageFormValues {
  alt_text?: string;
  is_main?: boolean;
}

export interface EditImageModalProps {
  open: boolean;
  loading?: boolean;
  currentImageUrl?: string;
  currentAltText?: string;
  fileList: UploadFile[];
  maxFileSize?: number; // in MB
  form: FormInstance<EditImageFormValues>;
  onOk: () => void | Promise<void>;
  onCancel: () => void;
  onFileChange: (info: { fileList: UploadFile[] }) => void;
}

/**
 * Modal for editing existing images
 * Shows current image preview and allows optional replacement
 */
const EditImageModal: React.FC<EditImageModalProps> = ({
  open,
  loading = false,
  currentImageUrl,
  currentAltText,
  fileList,
  maxFileSize = 10,
  form,
  onOk,
  onCancel,
  onFileChange,
}) => {
  return (
    <Modal
      title="Chỉnh sửa ảnh"
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={loading}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
      >
        {/* Current Image Preview - only show if no new file uploaded */}
        {currentImageUrl && fileList.length === 0 && (
          <Form.Item label="Ảnh hiện tại">
            <div style={{ marginBottom: 16 }}>
              <Image
                src={currentImageUrl}
                alt={currentAltText || "Current image"}
                style={{
                  maxWidth: "100%",
                  maxHeight: 300,
                  objectFit: "contain",
                }}
              />
            </div>
          </Form.Item>
        )}

        {/* Upload New Image (Optional) */}
        <Form.Item label="Thay thế ảnh (tùy chọn)">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={onFileChange}
            maxCount={1}
            beforeUpload={() => false}
            accept="image/*"
          >
            {fileList.length === 0 && (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Chọn ảnh mới</div>
              </div>
            )}
          </Upload>
          <Typography.Text
            type="secondary"
            style={{ fontSize: 12 }}
          >
            {fileList.length > 0
              ? "Ảnh cũ sẽ bị xóa và thay thế bằng ảnh mới"
              : `Kích thước tối đa: ${maxFileSize}MB`}
          </Typography.Text>
        </Form.Item>

        {/* Alt Text */}
        <Form.Item
          name="alt_text"
          label="Mô tả ảnh (Alt text)"
        >
          <Input.TextArea
            rows={2}
            placeholder="Mô tả ngắn gọn về ảnh"
          />
        </Form.Item>

        {/* Main Image Checkbox */}
        <Form.Item
          name="is_main"
          valuePropName="checked"
        >
          <Checkbox>Đặt làm ảnh chính</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditImageModal;
