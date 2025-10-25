"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { productService } from "../services/product.service";
import {
  ProductMedia,
  AddProductImageRequest,
  UpdateProductImageRequest,
  ReorderProductImagesRequest,
} from "../types/product.types";

/**
 * Hook to fetch product images
 */
export const useProductImages = (productId: string | null) => {
  const {
    data: images,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["productImages", productId],
    queryFn: async () => {
      if (!productId) return [];
      return await productService.getProductImages(productId);
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Sort images by sort_order
  const sortedImages = images
    ? [...images].sort((a, b) => a.sort_order - b.sort_order)
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
 * Hook to upload product image file
 */
export const useUploadProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      file,
      altText,
      isMain,
    }: {
      productId: string;
      file: File;
      altText?: string;
      isMain?: boolean;
    }) => {
      return await productService.uploadProductImage(
        productId,
        file,
        altText,
        isMain
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["productImages", variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["products", variables.productId],
      });
      message.success("Upload ảnh thành công!");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi upload ảnh");
    },
  });
};

/**
 * Hook to add product image (via URL)
 */
export const useAddProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      data,
    }: {
      productId: string;
      data: AddProductImageRequest;
    }) => {
      return await productService.addProductImage(productId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["productImages", variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["products", variables.productId],
      });
      message.success("Thêm ảnh thành công!");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi thêm ảnh");
    },
  });
};

/**
 * Hook to update product image
 */
export const useUpdateProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      mediaId,
      data,
    }: {
      productId: string;
      mediaId: string;
      data: UpdateProductImageRequest;
    }) => {
      return await productService.updateProductImage(productId, mediaId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["productImages", variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["products", variables.productId],
      });
      message.success("Cập nhật ảnh thành công!");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi cập nhật ảnh");
    },
  });
};

/**
 * Hook to delete product image
 */
export const useDeleteProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      mediaId,
    }: {
      productId: string;
      mediaId: string;
    }) => {
      return await productService.deleteProductImage(productId, mediaId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["productImages", variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["products", variables.productId],
      });
      message.success("Xóa ảnh thành công!");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi xóa ảnh");
    },
  });
};

/**
 * Hook to set main product image
 */
export const useSetMainProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      mediaId,
    }: {
      productId: string;
      mediaId: string;
    }) => {
      return await productService.setMainProductImage(productId, mediaId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["productImages", variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["products", variables.productId],
      });
      message.success("Đặt ảnh chính thành công!");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi đặt ảnh chính");
    },
  });
};

/**
 * Hook to reorder product images
 */
export const useReorderProductImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      data,
    }: {
      productId: string;
      data: ReorderProductImagesRequest;
    }) => {
      return await productService.reorderProductImages(productId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["productImages", variables.productId],
      });
      message.success("Sắp xếp ảnh thành công!");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi sắp xếp ảnh");
    },
  });
};
