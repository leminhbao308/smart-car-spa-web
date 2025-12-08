import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAttributeValueService } from '@/lib/api/services/productAttributeValue.service';
import {
  ProductAttributeValue,
  CreateProductAttributeValueRequest,
  UpdateProductAttributeValueRequest,
} from '@/lib/api/types/product.types';
import { ApiResponse } from '@/lib/api/types/common.types';

// Hook để lấy thuộc tính của một sản phẩm
export const useProductAttributeValues = (productId: string | null) => {
  return useQuery<ApiResponse<ProductAttributeValue[]>>({
    queryKey: ['productAttributeValues', productId],
    queryFn: () => productAttributeValueService.getProductAttributeValues(productId!),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook để tạo thuộc tính mới
export const useCreateProductAttributeValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductAttributeValueRequest) =>
      productAttributeValueService.createProductAttributeValue(data),
    onSuccess: (data: ApiResponse<ProductAttributeValue>) => {
      // Invalidate và refetch product attribute values
      queryClient.invalidateQueries({
        queryKey: ['productAttributeValues', data.data.product_id],
      });
      // Invalidate products list để cập nhật dữ liệu
      queryClient.invalidateQueries({
        queryKey: ['products'],
      });
    },
  });
};

// Hook để cập nhật thuộc tính
export const useUpdateProductAttributeValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductAttributeValueRequest }) =>
      productAttributeValueService.updateProductAttributeValue(id, data),
    onSuccess: (data: ApiResponse<ProductAttributeValue>) => {
      // Invalidate và refetch product attribute values
      queryClient.invalidateQueries({
        queryKey: ['productAttributeValues', data.data.product_id],
      });
      // Invalidate products list để cập nhật dữ liệu
      queryClient.invalidateQueries({
        queryKey: ['products'],
      });
    },
  });
};

// Hook để xóa thuộc tính
export const useDeleteProductAttributeValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productAttributeValueService.deleteProductAttributeValue(id),
    onSuccess: () => {
      // Invalidate tất cả product attribute values queries
      queryClient.invalidateQueries({
        queryKey: ['productAttributeValues'],
      });
      // Invalidate products list để cập nhật dữ liệu
      queryClient.invalidateQueries({
        queryKey: ['products'],
      });
    },
  });
};

// Hook để tạo nhiều thuộc tính cùng lúc
export const useCreateMultipleProductAttributeValues = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, attributeValues }: { 
      productId: string; 
      attributeValues: CreateProductAttributeValueRequest[] 
    }) =>
      productAttributeValueService.createMultipleProductAttributeValues(productId, attributeValues),
    onSuccess: (data: ApiResponse<ProductAttributeValue[]>, variables) => {
      // Invalidate và refetch product attribute values
      queryClient.invalidateQueries({
        queryKey: ['productAttributeValues', variables.productId],
      });
      // Invalidate products list để cập nhật dữ liệu
      queryClient.invalidateQueries({
        queryKey: ['products'],
      });
    },
  });
};

// Hook để cập nhật tất cả thuộc tính của sản phẩm (replace all)
export const useUpdateAllProductAttributeValues = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, attributeValues }: { 
      productId: string; 
      attributeValues: CreateProductAttributeValueRequest[] 
    }) =>
      productAttributeValueService.updateAllProductAttributeValues(productId, attributeValues),
    onSuccess: (data: ApiResponse<ProductAttributeValue[]>, variables) => {
      // Invalidate và refetch product attribute values
      queryClient.invalidateQueries({
        queryKey: ['productAttributeValues', variables.productId],
      });
      // Invalidate products list để cập nhật dữ liệu
      queryClient.invalidateQueries({
        queryKey: ['products'],
      });
    },
  });
};
