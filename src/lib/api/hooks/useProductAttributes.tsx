import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAttributeService } from '@/lib/api/services/productAttribute.service';
import { ProductAttributeResponse } from '@/lib/api/types/product-attribute.types';
import { useAppMessage } from './useAppMessage';

export const useProductAttributes = (params?: {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
  filters?: {
    dataType?: string;
    isRequired?: boolean;
    is_active?: boolean | "deleted";
    searchText?: string;
  };
}) => {
  return useQuery<ProductAttributeResponse>({
    queryKey: ['productAttributes', params],
    queryFn: () => productAttributeService.getAllProductAttributes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProductAttribute = (attributeId: string | null) => {
  return useQuery({
    queryKey: ['productAttribute', attributeId],
    queryFn: () => productAttributeService.getProductAttributeById(attributeId!),
    enabled: !!attributeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useActiveProductAttributes = () => {
  return useQuery({
    queryKey: ['activeProductAttributes'],
    queryFn: () => productAttributeService.getActiveProductAttributes(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateProductAttribute = () => {
  const queryClient = useQueryClient();
  const message = useAppMessage();

  return useMutation({
    mutationFn: (data: any) => productAttributeService.createProductAttribute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productAttributes'] });
      queryClient.invalidateQueries({ queryKey: ['activeProductAttributes'] });
      message.success('Tạo thuộc tính sản phẩm thành công!');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo thuộc tính sản phẩm');
    },
  });
};

export const useUpdateProductAttribute = () => {
  const queryClient = useQueryClient();
  const message = useAppMessage();

  return useMutation({
    mutationFn: ({ attributeId, data }: { attributeId: string; data: any }) =>
      productAttributeService.updateProductAttribute(attributeId, data),
    onSuccess: (_, { attributeId }) => {
      queryClient.invalidateQueries({ queryKey: ['productAttributes'] });
      queryClient.invalidateQueries({ queryKey: ['productAttribute', attributeId] });
      queryClient.invalidateQueries({ queryKey: ['activeProductAttributes'] });
      message.success('Cập nhật thuộc tính sản phẩm thành công!');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thuộc tính sản phẩm');
    },
  });
};

export const useUpdateProductAttributeStatus = () => {
  const queryClient = useQueryClient();
  const message = useAppMessage();

  return useMutation({
    mutationFn: ({ attributeId, data }: { attributeId: string; data: { is_active: boolean } }) =>
      productAttributeService.updateProductAttributeStatus(attributeId, data.is_active),
    onSuccess: (_, { attributeId }) => {
      queryClient.invalidateQueries({ queryKey: ['productAttributes'] });
      queryClient.invalidateQueries({ queryKey: ['productAttribute', attributeId] });
      queryClient.invalidateQueries({ queryKey: ['activeProductAttributes'] });
      message.success('Cập nhật trạng thái thuộc tính sản phẩm thành công!');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    },
  });
};
