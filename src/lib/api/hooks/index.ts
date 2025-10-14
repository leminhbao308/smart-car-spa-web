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
  useVehicleType,
  useCreateVehicleType,
  useUpdateVehicleType,
  useDeleteVehicleType,
  convertToSelectOptions as convertVehicleTypesToSelectOptions,
  findTypeById,
  findTypeByCode
} from './useVehicleTypes';
export {
  useVehicleModels,
  useVehicleModelsDropdown,
  useVehicleModel,
  useCreateVehicleModel,
  useUpdateVehicleModel,
  useDeleteVehicleModel
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
export * from './useServiceBays';
export * from './useServices';
export * from './useServiceTypes';
export * from './useServiceProcesses';
export * from './useTracking';
export * from './useServiceProcessTracking';
export * from './usePromotions';
export * from './useCategory';
export * from './usePromotionType';
export * from './usePayment';

// React Query specific exports
export { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
