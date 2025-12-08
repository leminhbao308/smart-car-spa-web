"use client";

import React, { useState } from "react";
import { Modal, Upload, Table, Alert, Button, Space, Tag } from "antd";
import {
  UploadOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ExcelImportPreviewResponse,
  ExcelImportPreviewRow,
  ExcelImportError,
  PurchaseOrder,
} from "@/lib/api";

const { Dragger } = Upload;

interface ExcelImportModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (
    previewData: ExcelImportPreviewResponse
  ) => Promise<PurchaseOrder>;
  branchId: string;
  onUpload: (
    file: File,
    branchId: string
  ) => Promise<ExcelImportPreviewResponse>;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  visible,
  onClose,
  onConfirm,
  branchId,
  onUpload,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [previewData, setPreviewData] =
    useState<ExcelImportPreviewResponse | null>(null);

  // Upload props
  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    accept: ".xlsx,.xls",
    fileList,
    beforeUpload: (file) => {
      // Validate file type
      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";

      if (!isExcel) {
        Modal.error({
          title: "File không hợp lệ",
          content: "Vui lòng chọn file Excel (.xlsx hoặc .xls)",
        });
        return Upload.LIST_IGNORE;
      }

      // Validate file size (max 5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        Modal.error({
          title: "File quá lớn",
          content: "Kích thước file không được vượt quá 5MB",
        });
        return Upload.LIST_IGNORE;
      }

      setFileList([file]);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setFileList([]);
      setPreviewData(null);
    },
  };

  // Preview table columns
  const previewColumns: ColumnsType<ExcelImportPreviewRow> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã SP",
      dataIndex: "product_code",
      key: "product_code",
      width: 120,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "product_name",
      key: "product_name",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier_name",
      key: "supplier_name",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "right",
    },
    {
      title: "Đơn giá",
      dataIndex: "unit_cost",
      key: "unit_cost",
      width: 120,
      align: "right",
      render: (value: number) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(value),
    },
    {
      title: "Mã lô",
      dataIndex: "lot_code",
      key: "lot_code",
      width: 100,
      render: (value) => value || "-",
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "expiry_date",
      key: "expiry_date",
      width: 120,
      render: (value) =>
        value ? new Date(value).toLocaleDateString("vi-VN") : "-",
    },
  ];

  // Error columns
  const errorColumns: ColumnsType<ExcelImportError> = [
    {
      title: "Dòng",
      dataIndex: "row",
      key: "row",
      width: 80,
    },
    {
      title: "Trường",
      dataIndex: "field",
      key: "field",
      width: 150,
    },
    {
      title: "Lỗi",
      dataIndex: "message",
      key: "message",
    },
  ];

  // Handle upload and preview
  const handleUploadAndPreview = async () => {
    if (fileList.length === 0) {
      Modal.warning({
        title: "Chưa chọn file",
        content: "Vui lòng chọn file Excel để tải lên",
      });
      return;
    }

    setUploading(true);
    try {
      const file = fileList[0] as any;
      const response = await onUpload(file, branchId);
      setPreviewData(response);
    } catch (error: any) {
      Modal.error({
        title: "Lỗi khi tải file",
        content: error?.message || "Không thể xử lý file Excel",
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle confirm import
  const handleConfirmImport = async () => {
    if (!previewData) return;

    if (previewData.invalid_rows > 0) {
      Modal.warning({
        title: "Có lỗi trong dữ liệu",
        content: "Vui lòng sửa các lỗi trước khi nhập kho",
      });
      return;
    }

    setConfirming(true);
    try {
      await onConfirm(previewData);
      handleClose();
    } catch (error: any) {
      Modal.error({
        title: "Lỗi khi nhập kho",
        content: error?.message || "Không thể thực hiện nhập kho",
      });
    } finally {
      setConfirming(false);
    }
  };

  // Handle close
  const handleClose = () => {
    setFileList([]);
    setPreviewData(null);
    setUploading(false);
    setConfirming(false);
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <UploadOutlined />
          <span>Nhập kho từ file Excel</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      width={1200}
      footer={[
        <Button
          key="cancel"
          onClick={handleClose}
        >
          Hủy
        </Button>,
        !previewData && (
          <Button
            key="upload"
            type="primary"
            icon={<UploadOutlined />}
            loading={uploading}
            onClick={handleUploadAndPreview}
          >
            Tải lên & Xem trước
          </Button>
        ),
        previewData && (
          <Button
            key="confirm"
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={confirming}
            onClick={handleConfirmImport}
            disabled={previewData.invalid_rows > 0}
          >
            Xác nhận nhập kho
          </Button>
        ),
      ]}
    >
      <Space
        direction="vertical"
        style={{ width: "100%" }}
        size="large"
      >
        {/* Upload Section */}
        {!previewData && (
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: "#1890ff" }} />
            </p>
            <p className="ant-upload-text">
              Nhấp hoặc kéo file vào đây để tải lên
            </p>
            <p className="ant-upload-hint">
              Hỗ trợ file Excel (.xlsx, .xls). Kích thước tối đa 5MB
            </p>
          </Dragger>
        )}

        {/* Preview Section */}
        {previewData && (
          <>
            {/* Summary */}
            <Alert
              message={
                <Space>
                  <span>
                    Tổng số dòng: <strong>{previewData.total_rows}</strong>
                  </span>
                  <Tag
                    color="success"
                    icon={<CheckCircleOutlined />}
                  >
                    Hợp lệ: {previewData.valid_rows}
                  </Tag>
                  {previewData.invalid_rows > 0 && (
                    <Tag
                      color="error"
                      icon={<CloseCircleOutlined />}
                    >
                      Lỗi: {previewData.invalid_rows}
                    </Tag>
                  )}
                </Space>
              }
              type={previewData.invalid_rows > 0 ? "warning" : "success"}
              showIcon
              icon={
                previewData.invalid_rows > 0 ? (
                  <WarningOutlined />
                ) : (
                  <CheckCircleOutlined />
                )
              }
            />

            {/* Errors Table */}
            {previewData.errors && previewData.errors.length > 0 && (
              <div>
                <h4 style={{ color: "#ff4d4f", marginBottom: 12 }}>
                  <CloseCircleOutlined /> Danh sách lỗi (
                  {previewData.errors.length})
                </h4>
                <Table
                  dataSource={previewData.errors}
                  columns={errorColumns}
                  pagination={false}
                  size="small"
                  scroll={{ y: 200 }}
                  rowKey={(record) => `${record.row}-${record.field}`}
                />
              </div>
            )}

            {/* Preview Data Table */}
            <div>
              <h4 style={{ marginBottom: 12 }}>
                <CheckCircleOutlined style={{ color: "#52c41a" }} /> Xem trước
                dữ liệu
              </h4>
              <Table
                dataSource={previewData.preview_data}
                columns={previewColumns}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} sản phẩm`,
                }}
                size="small"
                scroll={{ x: 1000, y: 400 }}
                rowKey={(record, index) => `${record.product_code}-${index}`}
              />
            </div>
          </>
        )}

        {/* Instructions */}
        <Alert
          message="Hướng dẫn"
          description={
            <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
              <li>
                Tải file Excel mẫu từ nút "Tải file mẫu" trước khi nhập liệu
              </li>
              <li>
                Đảm bảo các cột bắt buộc: Mã SP, Tên SP, NCC, Số lượng, Đơn giá
              </li>
              <li>Kiểm tra dữ liệu xem trước trước khi xác nhận nhập kho</li>
              <li>Nếu có lỗi, hãy sửa file Excel và tải lên lại</li>
            </ul>
          }
          type="info"
          showIcon
        />
      </Space>
    </Modal>
  );
};
