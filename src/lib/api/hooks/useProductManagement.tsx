"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productService } from "../services/product.service";
import {
  ProductSearchParams,
  CreateProductRequest,
  UpdateProductRequest,
  ProductTypeSearchParams,
  CreateProductTypeRequest,
  UpdateProductTypeRequest,
  ProductAttributeSearchParams,
  CreateProductAttributeRequest,
  UpdateProductAttributeRequest,
  UpdateProductAttributeStatusRequest,
} from "../types/product.types";
import { message } from "antd";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Product Hooks
export const useProducts = (params: ProductSearchParams = {}) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productService.getAllProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => productService.getProductById(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success("Tạo sản phẩm thành công!");
    },
    onError: (error: unknown) => {
      message.error((error as ApiError)?.response?.data?.message || "Có lỗi xảy ra khi tạo sản phẩm");
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: UpdateProductRequest }) =>
      productService.updateProduct(productId, data),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      message.success("Cập nhật sản phẩm thành công!");
    },
    onError: (error: unknown) => {
      message.error((error as ApiError)?.response?.data?.message || "Có lỗi xảy ra khi cập nhật sản phẩm");
    },
  });
};

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, isActive }: { productId: string; isActive: boolean }) =>
      productService.updateProductStatus(productId, { is_active: isActive }),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      message.success("Cập nhật trạng thái sản phẩm thành công!");
    },
    onError: (error: unknown) => {
      message.error((error as ApiError)?.response?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái sản phẩm");
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
    onError: (error: unknown) => {
      message.error((error as ApiError)?.response?.data?.message || "Có lỗi xảy ra khi xóa sản phẩm");
    },
  });
};

// ProductType Hooks
export const useProductTypes = (params: ProductTypeSearchParams = {}) => {
  return useQuery({
    queryKey: ["productTypes", params],
    queryFn: () => productService.getAllProductTypes(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useProductType = (productTypeId: string) => {
  return useQuery({
    queryKey: ["productType", productTypeId],
    queryFn: () => productService.getProductTypeById(productTypeId),
    enabled: !!productTypeId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useActiveProductTypes = () => {
  return useQuery({
    queryKey: ["activeProductTypes"],
    queryFn: () => productService.getActiveProductTypes(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateProductType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductTypeRequest) => productService.createProductType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productTypes"] });
      queryClient.invalidateQueries({ queryKey: ["activeProductTypes"] });
      message.success("Tạo loại sản phẩm thành công!");
    },
    onError: (error: unknown) => {
      message.error((error as ApiError)?.response?.data?.message || "Có lỗi xảy ra khi tạo loại sản phẩm");
    },
  });
};

export const useUpdateProductType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productTypeId, data }: { productTypeId: string; data: UpdateProductTypeRequest }) =>
      productService.updateProductType(productTypeId, data),
    onSuccess: (_, { productTypeId }) => {
      queryClient.invalidateQueries({ queryKey: ["productTypes"] });
      queryClient.invalidateQueries({ queryKey: ["productType", productTypeId] });
      queryClient.invalidateQueries({ queryKey: ["activeProductTypes"] });
      message.success("Cập nhật loại sản phẩm thành công!");
    },
    onError: (error: unknown) => {
      message.error((error as ApiError)?.response?.data?.message || "Có lỗi xảy ra khi cập nhật loại sản phẩm");
    },
  });
};

export const useUpdateProductTypeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productTypeId, isActive }: { productTypeId: string; isActive: boolean }) =>
      productService.updateProductTypeStatus(productTypeId, { is_active: isActive }),
    onSuccess: (_, { productTypeId }) => {
      queryClient.invalidateQueries({ queryKey: ["productTypes"] });
      queryClient.invalidateQueries({ queryKey: ["productType", productTypeId] });
      queryClient.invalidateQueries({ queryKey: ["activeProductTypes"] });
      message.success("Cập nhật trạng thái loại sản phẩm thành công!");
    },
    onError: (error: unknown) => {
      message.error((error as ApiError)?.response?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái loại sản phẩm");
    },
  });
};

export const useDeleteProductType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productTypeId: string) => productService.deleteProductType(productTypeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productTypes"] });
      queryClient.invalidateQueries({ queryKey: ["activeProductTypes"] });
      message.success("Xóa loại sản phẩm thành công!");
    },
    onError: (error: unknown) => {
      message.error((error as ApiError)?.response?.data?.message || "Có lỗi xảy ra khi xóa loại sản phẩm");
    },
  });
};

// ProductAttribute Hooks
export const useProductAttributes = (params: ProductAttributeSearchParams = {}) => {
  return useQuery({
    queryKey: ["productAttributes", params],
    queryFn: () => productService.getAllProductAttributes(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useProductAttribute = (attributeId: string | null) => {
  return useQuery({
    queryKey: ["productAttribute", attributeId],
    queryFn: () => productService.getProductAttributeById(attributeId!),
    enabled: !!attributeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateProductAttribute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductAttributeRequest) =>
      productService.createProductAttribute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productAttributes"] });
      message.success("Tạo thuộc tính sản phẩm thành công!");
    },
    onError: (error: unknown) => {
      message.error(
        (error as ApiError)?.response?.data?.message || "Có lỗi xảy ra khi tạo thuộc tính sản phẩm"
      );
    },
  });
};

export const useUpdateProductAttribute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attributeId,
      data,
    }: {
      attributeId: string;
      data: UpdateProductAttributeRequest;
    }) => productService.updateProductAttribute(attributeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productAttributes"] });
      queryClient.invalidateQueries({ queryKey: ["productAttribute"] });
      message.success("Cập nhật thuộc tính sản phẩm thành công!");
    },
    onError: (error: unknown) => {
      message.error(
        (error as ApiError)?.response?.data?.message || "Có lỗi xảy ra khi cập nhật thuộc tính sản phẩm"
      );
    },
  });
};

export const useUpdateProductAttributeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attributeId,
      data,
    }: {
      attributeId: string;
      data: UpdateProductAttributeStatusRequest;
    }) => productService.updateProductAttributeStatus(attributeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productAttributes"] });
      queryClient.invalidateQueries({ queryKey: ["productAttribute"] });
      message.success("Cập nhật trạng thái thuộc tính sản phẩm thành công!");
    },
    onError: (error: unknown) => {
      message.error(
        (error as ApiError)?.response?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái"
      );
    },
  });
};

export const useDeleteProductAttribute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attributeId: string) => productService.deleteProductAttribute(attributeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productAttributes"] });
      message.success("Xóa thuộc tính sản phẩm thành công!");
    },
    onError: (error: unknown) => {
      message.error(
        (error as ApiError)?.response?.data?.message || "Có lỗi xảy ra khi xóa thuộc tính sản phẩm"
      );
    },
  });
};

export const useActiveProductAttributes = () => {
  return useQuery({
    queryKey: ["productAttributes", "active"],
    queryFn: () => productService.getActiveProductAttributes(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProductAttributesByDataType = (dataType: string) => {
  return useQuery({
    queryKey: ["productAttributes", "dataType", dataType],
    queryFn: () => productService.getProductAttributesByDataType(dataType),
    enabled: !!dataType,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRequiredProductAttributes = () => {
  return useQuery({
    queryKey: ["productAttributes", "required"],
    queryFn: () => productService.getRequiredProductAttributes(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
