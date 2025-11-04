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
  useServiceImages,
  useUploadServiceImage,
  useDeleteServiceImage,
  useSetMainServiceImage,
} from "@/lib/api/hooks/useServiceImages";
import { MediaInfoDto } from "@/lib/api/types/media.types";
import { useImageUpload } from "@/lib/api/hooks/useImageUpload";
import ImageUploadModal from "@/components/common/ImageUploadModal";
import EditImageModal from "@/components/common/EditImageModal";

interface ServiceImageGalleryProps {
  serviceId: string;
  editable?: boolean;
}

interface SortableImageCardProps {
  image: MediaInfoDto;
  onSetMain: (mediaId: string) => void;
  onEdit: (image: MediaInfoDto) => void;
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
  const mediaId = image.media_id;
  const isMain = image.is_main;
  const mediaUrl = image.media_url;
  const altText = image.alt_text || "";

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: mediaId,
      disabled: isMain,
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
          isMain
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
              src={mediaUrl}
              alt={altText || "Service image"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                cursor: "pointer",
              }}
              preview={true}
            />
            {isMain && (
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
            {editable && !isMain && (
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
            {editable && isMain && (
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
                    icon={isMain ? <StarFilled /> : <StarOutlined />}
                    onClick={() => onSetMain(mediaId)}
                    disabled={isMain}
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
                    onClick={() => onDelete(mediaId)}
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
              {altText ? (
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
                  title={altText}
                >
                  {altText}
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

const ServiceImageGallery: React.FC<ServiceImageGalleryProps> = ({
  serviceId,
  editable = true,
}) => {
  const { images, loading } = useServiceImages(serviceId);
  const uploadImageMutation = useUploadServiceImage();
  const deleteImageMutation = useDeleteServiceImage();
  const setMainMutation = useSetMainServiceImage();

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingImage, setEditingImage] = useState<MediaInfoDto | null>(null);

  const uploadConfig = useMemo(() => ({ maxSize: 10 * 1024 * 1024 }), []);

  const addImageUpload = useImageUpload(uploadConfig);
  const editImageUpload = useImageUpload(uploadConfig);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [localImages, setLocalImages] = useState<MediaInfoDto[]>([]);

  const imagesKey = useMemo(() => {
    if (!images || images.length === 0) return "empty";
    return images
      .map((img) => `${img.media_id}-${img.is_main}-${img.sort_order ?? 0}`)
      .join("|");
  }, [images]);

  const sortedImages = useMemo(() => {
    if (!images || images.length === 0) return [];

    return [...images].sort((a, b) => {
      const aIsMain = a.is_main;
      const bIsMain = b.is_main;
      if (aIsMain && !bIsMain) return -1;
      if (!aIsMain && bIsMain) return 1;

      const aSort = a.sort_order ?? 0;
      const bSort = b.sort_order ?? 0;
      return aSort - bSort;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesKey]);

  React.useEffect(() => {
    setLocalImages(sortedImages);
  }, [sortedImages]);

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

      const draggedImage = localImages[oldIndex];
      if (draggedImage?.is_main) {
        Modal.warning({ title: "Không thể di chuyển ảnh chính" });
        return;
      }

      if (newIndex === 0) {
        Modal.warning({
          title: "Không thể di chuyển ảnh lên vị trí của ảnh chính",
        });
        return;
      }

      const newImages = arrayMove(localImages, oldIndex, newIndex);
      setLocalImages(newImages);
    }
  };

  const handleAddImage = async () => {
    try {
      if (!addImageUpload.validateFileList(addImageUpload.fileList)) {
        return;
      }

      if (addImageUpload.fileList.length === 0) {
        Modal.error({ title: "Vui lòng chọn file ảnh" });
        return;
      }

      const values = await addForm.validateFields();
      const file = addImageUpload.fileList[0].originFileObj as File;

      await uploadImageMutation.mutateAsync({
        serviceId,
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
      const mediaId = editingImage.media_id;

      if (editImageUpload.fileList.length > 0) {
        if (!editImageUpload.validateFileList(editImageUpload.fileList)) {
          return;
        }

        // Delete old then upload new
        await deleteImageMutation.mutateAsync({
          serviceId,
          mediaId,
        });

        const file = editImageUpload.fileList[0].originFileObj as File;
        await uploadImageMutation.mutateAsync({
          serviceId,
          file,
          altText: values.alt_text || "",
          isMain: !!values.is_main,
        });
      } else {
        // Just update metadata - would need updateMutation if available
        console.log("Image metadata update not yet implemented in backend");
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
        await deleteImageMutation.mutateAsync({ serviceId, mediaId });
      },
    });
  };

  const handleSetMain = async (mediaId: string) => {
    await setMainMutation.mutateAsync({ serviceId, mediaId });
  };

  const handleEdit = (image: MediaInfoDto) => {
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
        title="Hình ảnh dịch vụ"
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

      <EditImageModal
        open={isEditModalVisible}
        loading={uploadImageMutation.isPending || deleteImageMutation.isPending}
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

export default ServiceImageGallery;
