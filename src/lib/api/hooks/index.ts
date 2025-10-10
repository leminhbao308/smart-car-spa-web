/**
 * Export all API hooks - Migrated to TanStack React Query
 */

export * from './useAuth';
export * from './useUserManagement';
export * from './useUsers';
export * from './useVehicleBrands';
export { 
  useVehicleTypes, 
  useVehicleTypesDropdown,
  convertToSelectOptions as convertVehicleTypesToSelectOptions
} from './useVehicleTypes';
export { 
  useVehicleModels, 
  useVehicleModelsDropdown
} from './useVehicleModels';
export * from './useVehicleProfiles';
export * from './useProducts';
export * from './useSuppliers';
export * from './useCenters';
export * from './useBranches';
export * from './useBranchesByCenter';
export * from './useCatalogForSale';
export * from './useInventoryLevels';
export * from './usePOSCart';
export * from './usePricing';
export * from './useSalesOrder';
export * from './useWarehouseByBranch';
export * from './usePurchaseOrder';
export { 
  useServiceBays,
  convertToSelectOptions as convertServiceBaysToSelectOptions
} from './useServiceBays';
export * from './usePromotions';

// React Query specific exports
export { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
