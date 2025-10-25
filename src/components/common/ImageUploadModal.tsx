"use client";

import React from "react";
import { Modal, Form, Input, Upload, Typography, Checkbox } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { FormInstance, UploadFile } from "antd";

export interface ImageUploadFormValues {
  alt_text?: string;
  is_main?: boolean;
}

export interface ImageUploadModalProps {
  open: boolean;
  title: string;
  loading?: boolean;
  fileList: UploadFile[];
  maxFileSize?: number; // in MB
  form: FormInstance<ImageUploadFormValues>;
  showMainCheckbox?: boolean;
  onOk: () => void | Promise<void>;
  onCancel: () => void;
  onFileChange: (info: { fileList: UploadFile[] }) => void;
}

/**
 * Reusable modal component for uploading images
 * Handles file upload, alt text, and main image checkbox
 */
const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  open,
  title,
  loading = false,
  fileList,
  maxFileSize = 10,
  form,
  showMainCheckbox = true,
  onOk,
  onCancel,
  onFileChange,
}) => {
  return (
    <Modal
      title={title}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText="Upload"
      cancelText="Hủy"
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        {/* File Upload - Not in Form.Item to avoid validation issues */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ color: "#ff4d4f" }}>* </span>
            <span>Chọn ảnh</span>
          </div>
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={onFileChange}
            maxCount={1}
            beforeUpload={() => false} // Prevent auto-upload
            accept="image/*"
          >
            {fileList.length === 0 && (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Chọn ảnh</div>
              </div>
            )}
          </Upload>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Kích thước tối đa: {maxFileSize}MB
          </Typography.Text>
        </div>

        {/* Alt Text */}
        <Form.Item name="alt_text" label="Mô tả ảnh (Alt text)">
          <Input.TextArea rows={2} placeholder="Mô tả ngắn gọn về ảnh" />
        </Form.Item>

        {/* Main Image Checkbox */}
        {showMainCheckbox && (
          <Form.Item name="is_main" valuePropName="checked">
            <Checkbox>Đặt làm ảnh chính</Checkbox>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default ImageUploadModal;
