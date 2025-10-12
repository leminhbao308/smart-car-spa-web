import { useQuery } from '@tanstack/react-query';
import { productAttributeService } from '@/lib/api/services/productAttribute.service';
import { ProductAttributeResponse } from '@/lib/api/types/product-attribute.types';

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
