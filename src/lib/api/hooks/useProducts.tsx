"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "../services/product.service";
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductSearchParams,
  ProductResponse,
} from "../types/product.types";
import { message } from "antd";

export const useProducts = (params: ProductSearchParams = {}) => {
  const queryClient = useQueryClient();

  const {
    data: productsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products", params],
    queryFn: () => productService.getAllProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    products: productsResponse?.data?.content || [],
    totalElements: productsResponse?.data?.totalElements || 0,
    totalPages: productsResponse?.data?.totalPages || 0,
    currentPage: productsResponse?.data?.number || 0,
    isLoading,
    error,
    refetch,
  };
};

export const useProduct = (productId: string) => {
  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productService.getProductById(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    product,
    isLoading,
    error,
    refetch,
  };
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => productService.createProduct(data),
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success("Tạo sản phẩm thành công!");
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Có lỗi xảy ra khi tạo sản phẩm");
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: UpdateProductRequest }) => 
      productService.updateProduct(productId, data),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", updatedProduct.productId] });
      message.success("Cập nhật sản phẩm thành công!");
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Có lỗi xảy ra khi cập nhật sản phẩm");
    },
  });
};

// Update product status hook
export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: { is_active: boolean } }) => 
      productService.updateProductStatus(productId, data),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", updatedProduct.productId] });
      message.success("Cập nhật trạng thái sản phẩm thành công!");
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái");
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productService.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success("Xóa sản phẩm thành công!");
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Có lỗi xảy ra khi xóa sản phẩm");
    },
  });
};


