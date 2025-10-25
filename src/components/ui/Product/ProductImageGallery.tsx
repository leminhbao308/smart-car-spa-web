"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  Image,
  Button,
  Modal,
  Form,
  Tag,
  Spin,
  Empty,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  EditOutlined,
  DragOutlined,
} from "@ant-design/icons";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useProductImages,
  useUploadProductImage,
  useUpdateProductImage,
  useDeleteProductImage,
  useSetMainProductImage,
  useReorderProductImages,
} from "@/lib/api/hooks/useProductImages";
import { ProductMedia } from "@/lib/api/types/product.types";
import { useImageUpload } from "@/lib/api/hooks/useImageUpload";
import ImageUploadModal from "@/components/common/ImageUploadModal";
import EditImageModal from "@/components/common/EditImageModal";

interface ProductImageGalleryProps {
  productId: string;
  editable?: boolean;
}

interface SortableImageCardProps {
  image: ProductMedia;
  onSetMain: (mediaId: string) => void;
  onEdit: (image: ProductMedia) => void;
  onDelete: (mediaId: string) => void;
  editable: boolean;
}

const SortableImageCard: React.FC<SortableImageCardProps> = ({
  image,
  onSetMain,
  onEdit,
  onDelete,
  editable,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: image.media_id,
      disabled: image.is_main, // Disable drag for main image
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
    >
      <Card
        hoverable
        style={
          image.is_main
            ? {
                border: "2px solid #faad14",
                boxShadow: "0 2px 8px rgba(250, 173, 20, 0.3)",
              }
            : undefined
        }
        cover={
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 200,
              overflow: "hidden",
              backgroundColor: "#f5f5f5",
            }}
          >
            <Image
              src={image.media_url}
              alt={image.alt_text || "Product image"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                cursor: "pointer",
              }}
              preview={true}
            />
            {image.is_main && (
              <Tag
                color="gold"
                icon={<StarFilled />}
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  zIndex: 2,
                }}
              >
                Ảnh chính
              </Tag>
            )}
            {editable && !image.is_main && (
              <div
                {...attributes}
                {...listeners}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  cursor: "move",
                  background: "rgba(0, 0, 0, 0.5)",
                  borderRadius: 4,
                  padding: "4px 8px",
                  color: "white",
                  zIndex: 2,
                }}
              >
                <DragOutlined />
              </div>
            )}
            {editable && image.is_main && (
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "rgba(250, 173, 20, 0.8)",
                  borderRadius: 4,
                  padding: "4px 8px",
                  color: "white",
                  zIndex: 2,
                  cursor: "not-allowed",
                }}
              >
                <Tooltip title="Ảnh chính không thể di chuyển">
                  <DragOutlined style={{ opacity: 0.5 }} />
                </Tooltip>
              </div>
            )}
          </div>
        }
        actions={
          editable
            ? [
                <Tooltip
                  key="main"
                  title="Đặt làm ảnh chính"
                >
                  <Button
                    type="text"
                    icon={image.is_main ? <StarFilled /> : <StarOutlined />}
                    onClick={() => onSetMain(image.media_id)}
                    disabled={image.is_main}
                  />
                </Tooltip>,
                <Tooltip
                  key="edit"
                  title="Chỉnh sửa"
                >
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(image)}
                  />
                </Tooltip>,
                <Tooltip
                  key="delete"
                  title="Xóa ảnh"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete(image.media_id)}
                  />
                </Tooltip>,
              ]
            : []
        }
      >
        <Card.Meta
          description={
            <div
              style={{
                height: 60,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {image.alt_text ? (
                <div
                  style={{
                    fontSize: 12,
                    color: "#8c8c8c",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    lineHeight: "1.5",
                  }}
                  title={image.alt_text}
                >
                  {image.alt_text}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "#d9d9d9" }}>
                  Chưa có mô tả
                </div>
              )}
            </div>
          }
        />
      </Card>
    </div>
  );
};

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  productId,
  editable = true,
}) => {
  const { images, loading } = useProductImages(productId);
  const uploadImageMutation = useUploadProductImage();
  const updateImageMutation = useUpdateProductImage();
  const deleteImageMutation = useDeleteProductImage();
  const setMainMutation = useSetMainProductImage();
  const reorderMutation = useReorderProductImages();

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingImage, setEditingImage] = useState<ProductMedia | null>(null);

  // Memoize upload config to prevent infinite re-renders
  const uploadConfig = useMemo(() => ({ maxSize: 10 * 1024 * 1024 }), []);

  // Use custom hook for upload management
  const addImageUpload = useImageUpload(uploadConfig);
  const editImageUpload = useImageUpload(uploadConfig);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [localImages, setLocalImages] = useState<ProductMedia[]>([]);

  // Memoize sorted images to prevent infinite re-renders
  // Create a stable key based on actual image data
  const imagesKey = useMemo(() => {
    if (!images || images.length === 0) return "empty";
    return images
      .map((img) => `${img.media_id}-${img.is_main}-${img.sort_order}`)
      .join("|");
  }, [images]);

  // Sort images: main first, then by sort_order
  const sortedImages = useMemo(() => {
    if (!images || images.length === 0) return [];

    return [...images].sort((a, b) => {
      if (a.is_main && !b.is_main) return -1;
      if (!a.is_main && b.is_main) return 1;
      return a.sort_order - b.sort_order;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesKey]);

  // Update local images when sorted images change
  React.useEffect(() => {
    setLocalImages(sortedImages);
  }, [sortedImages]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localImages.findIndex(
        (img) => img.media_id === active.id
      );
      const newIndex = localImages.findIndex((img) => img.media_id === over.id);

      // Prevent dragging the main image (should be at index 0)
      const draggedImage = localImages[oldIndex];
      if (draggedImage?.is_main) {
        Modal.warning({ title: "Không thể di chuyển ảnh chính" });
        return;
      }

      // Prevent dropping on the main image position (index 0)
      if (newIndex === 0) {
        Modal.warning({
          title: "Không thể di chuyển ảnh lên vị trí của ảnh chính",
        });
        return;
      }

      const newImages = arrayMove(localImages, oldIndex, newIndex);
      setLocalImages(newImages);

      // Update sort orders
      const mediaOrders = newImages.map((img, index) => ({
        media_id: img.media_id,
        sort_order: index,
      }));

      // Save to backend
      reorderMutation.mutate({
        productId,
        data: { media_orders: mediaOrders },
      });
    }
  };

  const handleAddImage = async () => {
    try {
      // Validate file using hook
      if (!addImageUpload.validateFileList(addImageUpload.fileList)) {
        return;
      }

      if (addImageUpload.fileList.length === 0) {
        Modal.error({ title: "Vui lòng chọn file ảnh" });
        return;
      }

      // Validate form fields
      const values = await addForm.validateFields();
      const file = addImageUpload.fileList[0].originFileObj as File;

      await uploadImageMutation.mutateAsync({
        productId,
        file,
        altText: values.alt_text,
        isMain: values.is_main || false,
      });

      setIsAddModalVisible(false);
      addImageUpload.clearFiles();
      addForm.resetFields();
    } catch (error) {
      console.error("Error adding image:", error);
    }
  };

  const handleEditImage = async () => {
    if (!editingImage) return;

    try {
      const values = await editForm.validateFields();

      // Check if user uploaded a new file
      if (editImageUpload.fileList.length > 0) {
        // Validate new file
        if (!editImageUpload.validateFileList(editImageUpload.fileList)) {
          return;
        }

        // Replace flow: Delete old image then upload new one
        await deleteImageMutation.mutateAsync({
          productId,
          mediaId: editingImage.media_id,
        });

        // Upload new image with updated metadata
        const file = editImageUpload.fileList[0].originFileObj as File;
        await uploadImageMutation.mutateAsync({
          productId,
          file,
          altText: values.alt_text || "",
          isMain: !!values.is_main,
        });
      } else {
        // Just update metadata (no file change)
        await updateImageMutation.mutateAsync({
          productId,
          mediaId: editingImage.media_id,
          data: {
            media_url: editingImage.media_url,
            alt_text: values.alt_text,
            is_main: !!values.is_main,
          },
        });
      }

      setIsEditModalVisible(false);
      setEditingImage(null);
      editImageUpload.clearFiles();
      editForm.resetFields();
    } catch (err) {
      console.error("Error updating image:", err);
    }
  };

  const handleDeleteImage = (mediaId: string) => {
    Modal.confirm({
      title: "Xác nhận xóa ảnh",
      content: "Bạn có chắc chắn muốn xóa ảnh này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        await deleteImageMutation.mutateAsync({ productId, mediaId });
        // Cache invalidation is handled automatically by the mutation
      },
    });
  };

  const handleSetMain = async (mediaId: string) => {
    await setMainMutation.mutateAsync({ productId, mediaId });
    // Cache invalidation is handled automatically by the mutation
  };

  const handleEdit = (image: ProductMedia) => {
    setEditingImage(image);
    editImageUpload.clearFiles();
    editForm.setFieldsValue({
      alt_text: image.alt_text,
      is_main: image.is_main,
    });
    setIsEditModalVisible(true);
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card
        title="Hình ảnh sản phẩm"
        extra={
          editable && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalVisible(true)}
            >
              Thêm ảnh
            </Button>
          )
        }
      >
        {editable && localImages.length > 0 && (
          <div
            style={{
              marginBottom: 16,
              padding: "8px 12px",
              background: "#e6f7ff",
              border: "1px solid #91d5ff",
              borderRadius: 4,
              fontSize: 13,
              color: "#1890ff",
            }}
          >
            💡 <strong>Gợi ý:</strong> Kéo thả để sắp xếp thứ tự ảnh. Ảnh chính
            (viền vàng) luôn hiển thị đầu tiên và không thể di chuyển.
          </div>
        )}
        {localImages.length === 0 ? (
          <Empty description="Chưa có ảnh nào" />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localImages.map((img) => img.media_id)}
              strategy={rectSortingStrategy}
            >
              <Image.PreviewGroup>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 16,
                  }}
                >
                  {localImages.map((image) => (
                    <SortableImageCard
                      key={image.media_id}
                      image={image}
                      onSetMain={handleSetMain}
                      onEdit={handleEdit}
                      onDelete={handleDeleteImage}
                      editable={editable}
                    />
                  ))}
                </div>
              </Image.PreviewGroup>
            </SortableContext>
          </DndContext>
        )}
      </Card>

      {/* Add Image Modal - Using reusable component */}
      <ImageUploadModal
        open={isAddModalVisible}
        title="Thêm ảnh mới"
        loading={uploadImageMutation.isPending}
        fileList={addImageUpload.fileList}
        maxFileSize={10}
        form={addForm}
        showMainCheckbox={true}
        onOk={handleAddImage}
        onCancel={() => {
          setIsAddModalVisible(false);
          addImageUpload.clearFiles();
          addForm.resetFields();
        }}
        onFileChange={addImageUpload.handleChange}
      />

      {/* Edit Image Modal - Using reusable component */}
      <EditImageModal
        open={isEditModalVisible}
        loading={
          updateImageMutation.isPending ||
          deleteImageMutation.isPending ||
          uploadImageMutation.isPending
        }
        currentImageUrl={editingImage?.media_url}
        currentAltText={editingImage?.alt_text}
        fileList={editImageUpload.fileList}
        maxFileSize={10}
        form={editForm}
        onOk={handleEditImage}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingImage(null);
          editImageUpload.clearFiles();
          editForm.resetFields();
        }}
        onFileChange={editImageUpload.handleChange}
      />
    </div>
  );
};

export default ProductImageGallery;
