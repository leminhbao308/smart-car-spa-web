"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { MediaService } from "../services/media.service";
import type { MediaInfoDto } from "../types/media.types";

/**
 * Hook to fetch service images/media
 */
export const useServiceImages = (serviceId: string | null) => {
  const {
    data: images,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["serviceImages", serviceId],
    queryFn: async () => {
      if (!serviceId) return [];
      try {
        return await MediaService.getMediaByEntity("SERVICE", serviceId);
      } catch (err) {
        console.log("Error fetching service images:", err);
        return [];
      }
    },
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Sort images by sort_order
  const sortedImages = images
    ? [...images].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    : [];

  // Get main image
  const mainImage = sortedImages.find((img) => img.is_main);

  return {
    images: sortedImages,
    mainImage,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook to get the main image URL for a service
 * @param serviceId - The ID of the service
 * @returns The main image URL or null if not found
 */
export const useServiceMainImage = (serviceId: string | undefined) => {
  const { data: images, isLoading } = useQuery({
    queryKey: ["serviceImages", serviceId],
    queryFn: async () => {
      if (!serviceId) return [];
      try {
        return await MediaService.getMediaByEntity("SERVICE", serviceId);
      } catch (err) {
        console.log("Error fetching service main image:", err);
        return [];
      }
    },
    enabled: !!serviceId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Find the main image (is_main === true) or use first image
  const mainImage =
    images?.find((img: MediaInfoDto) => img.is_main) || images?.[0];
  const mainImageUrl = mainImage?.media_url || null;

  return { mainImageUrl, loading: isLoading };
};

/**
 * Hook to upload service image file
 */
export const useUploadServiceImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceId,
      file,
      altText,
      isMain,
    }: {
      serviceId: string;
      file: File;
      altText?: string;
      isMain?: boolean;
    }) => {
      // Create FormData with file - send to backend for processing
      const formData = new FormData();
      formData.append("file", file);
      if (altText) formData.append("alt_text", altText);
      if (isMain !== undefined) formData.append("is_main", isMain.toString());

      // Upload via MediaService which handles file + FormData
      const response = await MediaService.uploadServiceMedia(
        serviceId,
        formData as never
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["serviceImages", variables.serviceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["services"],
      });
      message.success("Upload ảnh dịch vụ thành công!");
    },
    onError: (error: unknown) => {
      let errorMessage = "Có lỗi xảy ra khi upload ảnh";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        const apiError = error as {
          response?: { data?: { message?: string } };
        };
        errorMessage = apiError.response?.data?.message || errorMessage;
      }
      message.error(errorMessage);
    },
  });
};

/**
 * Hook to delete service image
 */
export const useDeleteServiceImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: { serviceId: string; mediaId: string }) => {
      return await MediaService.deleteMedia(variables.mediaId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["serviceImages", variables.serviceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["services"],
      });
      message.success("Xóa ảnh dịch vụ thành công!");
    },
    onError: (error: unknown) => {
      let errorMessage = "Có lỗi xảy ra khi xóa ảnh";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      message.error(errorMessage);
    },
  });
};

/**
 * Hook to set main service image
 */
export const useSetMainServiceImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: { serviceId: string; mediaId: string }) => {
      return await MediaService.updateMediaMainStatus(variables.mediaId, {
        isMain: true, // Frontend type uses camelCase, but backend expects is_main in JSON
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["serviceImages", variables.serviceId],
      });
      message.success("Đặt ảnh chính dịch vụ thành công!");
    },
    onError: (error: unknown) => {
      let errorMessage = "Có lỗi xảy ra khi đặt ảnh chính";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      message.error(errorMessage);
    },
  });
};
