import { useQuery } from '@tanstack/react-query';
import { productTypeService } from '@/lib/api/services/productType.service';
import { ProductTypeResponse } from '@/lib/api/types/product.types';

export const useProductTypes = (params?: {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
  filters?: {
    categoryId?: string;
    is_active?: boolean | "deleted";
    searchText?: string;
  };
}) => {
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
