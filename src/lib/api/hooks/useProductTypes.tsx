import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productTypeService } from '../services/productType.service';
import { ProductTypeResponse, ProductTypeSearchParams, CreateProductTypeRequest, UpdateProductTypeRequest } from '@/lib/api/types/product.types';
import { useAppMessage } from './useAppMessage';

export const useProductTypes = (params?: ProductTypeSearchParams) => {
  return useQuery<ProductTypeResponse>({
    queryKey: ['productTypes', params],
    queryFn: () => productTypeService.getAllProductTypes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProductType = (productTypeId: string | null) => {
  return useQuery({
    queryKey: ['productType', productTypeId],
    queryFn: () => productTypeService.getProductTypeById(productTypeId!),
    enabled: !!productTypeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useActiveProductTypes = () => {
  return useQuery({
    queryKey: ['activeProductTypes'],
    queryFn: () => productTypeService.getActiveProductTypes(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateProductType = () => {
  const queryClient = useQueryClient();
  const message = useAppMessage();

  return useMutation({
    mutationFn: (data: CreateProductTypeRequest) => productTypeService.createProductType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productTypes'] });
      queryClient.invalidateQueries({ queryKey: ['activeProductTypes'] });
      message.success('Tạo loại sản phẩm thành công!');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo loại sản phẩm');
    },
  });
};

export const useUpdateProductType = () => {
  const queryClient = useQueryClient();
  const message = useAppMessage();

  return useMutation({
    mutationFn: ({ productTypeId, data }: { productTypeId: string; data: UpdateProductTypeRequest }) =>
      productTypeService.updateProductType(productTypeId, data),
    onSuccess: (_, { productTypeId }) => {
      queryClient.invalidateQueries({ queryKey: ['productTypes'] });
      queryClient.invalidateQueries({ queryKey: ['productType', productTypeId] });
      queryClient.invalidateQueries({ queryKey: ['activeProductTypes'] });
      message.success('Cập nhật loại sản phẩm thành công!');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật loại sản phẩm');
    },
  });
};

export const useUpdateProductTypeStatus = () => {
  const queryClient = useQueryClient();
  const message = useAppMessage();

  return useMutation({
    mutationFn: ({ productTypeId, isActive }: { productTypeId: string; isActive: boolean }) =>
      productTypeService.updateProductTypeStatus(productTypeId, { is_active: isActive }),
    onSuccess: (_, { productTypeId }) => {
      queryClient.invalidateQueries({ queryKey: ['productTypes'] });
      queryClient.invalidateQueries({ queryKey: ['productType', productTypeId] });
      queryClient.invalidateQueries({ queryKey: ['activeProductTypes'] });
      message.success('Cập nhật trạng thái loại sản phẩm thành công!');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    },
  });
};
