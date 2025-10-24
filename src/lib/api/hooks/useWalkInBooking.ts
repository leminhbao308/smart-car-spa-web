import { useState, useCallback } from 'react';
import { walkInBookingService } from '../services/walk-in-booking.service';
import {
  WalkInBookingRequest,
  BayRecommendationRequest,
  BayRecommendationResponse,
  BookingQueueItem,
  TransferBookingRequest,
  WalkInBookingState,
  WalkInBookingFormData,
  CustomerType,
  Priority,
} from '../types/walk-in-booking.types';

/**
 * Hook để quản lý walk-in booking
 */
export const useWalkInBooking = () => {
  const [state, setState] = useState<WalkInBookingState>({
    step: 'customer',
    customerType: 'NEW',
    selectedServices: [],
    queueItems: [],
    loading: false,
  });

  // ==================== STATE UPDATERS ====================

  const updateStep = useCallback((step: WalkInBookingState['step']) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  const updateCustomerType = useCallback((customerType: CustomerType) => {
    setState(prev => ({ 
      ...prev, 
      customerType,
      selectedCustomer: undefined,
      selectedVehicle: undefined,
      newCustomerInfo: undefined,
      newVehicleInfo: undefined,
    }));
  }, []);

  const updateSelectedCustomer = useCallback((customer: { user_id: string; full_name: string; phone_number: string; email: string }) => {
    setState(prev => ({ 
      ...prev, 
      selectedCustomer: customer,
      selectedVehicle: undefined,
    }));
  }, []);

  const updateSelectedVehicle = useCallback((vehicle: { vehicle_id: string; license_plate: string; brand_name: string; model_name: string; type_name: string }) => {
    setState(prev => ({ ...prev, selectedVehicle: vehicle }));
  }, []);

  const updateNewCustomerInfo = useCallback((info: { name: string; phone: string; email?: string }) => {
    setState(prev => ({ ...prev, newCustomerInfo: info }));
  }, []);

  const updateNewVehicleInfo = useCallback((info: { licensePlate: string; brand: string; model: string; type: string; color: string; year: number }) => {
    setState(prev => ({ ...prev, newVehicleInfo: info }));
  }, []);

  const updateSelectedServices = useCallback((services: { service_id: string; service_name: string; duration_minutes: number; price: number }[]) => {
    setState(prev => ({ ...prev, selectedServices: services }));
  }, []);

  const updateSelectedBay = useCallback((bayId: string) => {
    setState(prev => ({ ...prev, selectedBay: bayId }));
  }, []);

  const updateBayRecommendation = useCallback((recommendation: BayRecommendationResponse) => {
    setState(prev => ({ ...prev, bayRecommendation: recommendation }));
  }, []);

  const updateQueueItems = useCallback((items: BookingQueueItem[]) => {
    setState(prev => ({ ...prev, queueItems: items }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | undefined) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // ==================== API METHODS ====================

  /**
   * Đề xuất bay tốt nhất
   */
  const recommendBay = useCallback(async (
    branchId: string,
    serviceDuration: number,
    serviceType?: string,
    priority?: Priority
  ) => {
    try {
      setLoading(true);
      setError(undefined);

      const request: BayRecommendationRequest = {
        branch_id: branchId,
        service_duration_minutes: serviceDuration,
        service_type: serviceType,
        priority,
      };

      const response = await walkInBookingService.recommendBay(request);
      updateBayRecommendation(response);
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to recommend bay';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updateBayRecommendation, setLoading, setError]);

  /**
   * Tạo walk-in booking
   */
  const createWalkInBooking = useCallback(async (formData: WalkInBookingFormData, branchId: string) => {
    try {
      setLoading(true);
      setError(undefined);

      const request: WalkInBookingRequest = {
        customer_type: formData.customerType,
        customer_id: formData.customerId,
        vehicle_id: formData.vehicleId,
        customer_name: formData.newCustomer?.name,
        customer_phone: formData.newCustomer?.phone,
        customer_email: formData.newCustomer?.email,
        vehicle_license_plate: formData.newVehicle?.licensePlate,
        vehicle_brand: formData.newVehicle?.brand,
        vehicle_model: formData.newVehicle?.model,
        vehicle_type: formData.newVehicle?.type,
        vehicle_color: formData.newVehicle?.color,
        vehicle_year: formData.newVehicle?.year,
        assigned_bay_id: formData.assignedBayId,
        branch_id: branchId,
        services: formData.services,
        total_price: formData.services.reduce((sum, service) => sum + service.price, 0),
        currency: 'VND',
        notes: formData.notes,
        priority: formData.priority,
        special_requests: formData.specialRequests,
      };

      const response = await walkInBookingService.createWalkInBooking(request);
      
      // Debug log for estimated_wait_time
      console.log('🔍 Walk-in booking response:', {
        estimated_wait_time: response.estimated_wait_time,
        type: typeof response.estimated_wait_time,
        isNumber: typeof response.estimated_wait_time === 'number',
        isNull: response.estimated_wait_time === null,
        isUndefined: response.estimated_wait_time === undefined
      });
      
      // Update state with response
      setState(prev => ({
        ...prev,
        selectedBay: response.assigned_bay_id,
        queueItems: prev.queueItems.concat([{
          booking_id: response.booking_id,
          booking_code: response.booking_code,
          customer_name: formData.customerType === 'EXISTING' 
            ? prev.selectedCustomer?.full_name || ''
            : formData.newCustomer?.name || '',
          customer_phone: formData.customerType === 'EXISTING'
            ? prev.selectedCustomer?.phone_number || ''
            : formData.newCustomer?.phone || '',
          vehicle_license_plate: formData.customerType === 'EXISTING'
            ? prev.selectedVehicle?.license_plate || ''
            : formData.newVehicle?.licensePlate || '',
          service_type: formData.services[0]?.service_name || '',
          queue_position: response.queue_position,
          estimated_start_time: response.estimated_start_time,
          estimated_completion_time: response.estimated_wait_time && typeof response.estimated_wait_time === 'number' 
            ? new Date(Date.now() + response.estimated_wait_time * 60000).toISOString()
            : new Date().toISOString(),
          status: response.status,
        }]),
      }));

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create walk-in booking';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * Lấy hàng chờ của bay
   */
  const getBayQueue = useCallback(async (bayId: string) => {
    try {
      setLoading(true);
      setError(undefined);

      const response = await walkInBookingService.getBayQueue(bayId);
      updateQueueItems(response);
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get bay queue';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updateQueueItems, setLoading, setError]);

  /**
   * Chuyển booking
   */
  const transferBooking = useCallback(async (
    bookingId: string,
    fromBayId: string,
    toBayId: string,
    reason?: string
  ) => {
    try {
      setLoading(true);
      setError(undefined);

      const request: TransferBookingRequest = {
        booking_id: bookingId,
        from_bay_id: fromBayId,
        to_bay_id: toBayId,
        reason,
      };

      const response = await walkInBookingService.transferBooking(request);
      
      // Refresh queue items
      await getBayQueue(fromBayId);
      await getBayQueue(toBayId);
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to transfer booking';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getBayQueue, setLoading, setError]);

  /**
   * Reset state
   */
  const resetState = useCallback(() => {
    setState({
      step: 'customer',
      customerType: 'NEW',
      selectedServices: [],
      queueItems: [],
      loading: false,
    });
  }, []);

  /**
   * Go to next step
   */
  const nextStep = useCallback(() => {
    const steps: WalkInBookingState['step'][] = ['customer', 'services', 'bay-selection', 'confirmation'];
    const currentIndex = steps.indexOf(state.step);
    if (currentIndex < steps.length - 1) {
      updateStep(steps[currentIndex + 1]);
    }
  }, [state.step, updateStep]);

  /**
   * Go to previous step
   */
  const prevStep = useCallback(() => {
    const steps: WalkInBookingState['step'][] = ['customer', 'services', 'bay-selection', 'confirmation'];
    const currentIndex = steps.indexOf(state.step);
    if (currentIndex > 0) {
      updateStep(steps[currentIndex - 1]);
    }
  }, [state.step, updateStep]);

  /**
   * Check if current step is valid
   */
  const isStepValid = useCallback((step: WalkInBookingState['step']) => {
    switch (step) {
      case 'customer':
        return state.customerType === 'EXISTING' 
          ? state.selectedCustomer && state.selectedVehicle
          : state.newCustomerInfo && state.newVehicleInfo;
      case 'services':
        return state.selectedServices.length > 0;
      case 'bay-selection':
        return state.selectedBay !== undefined;
      case 'confirmation':
        return true;
      default:
        return false;
    }
  }, [state]);

  return {
    // State
    state,
    
    // State updaters
    updateStep,
    updateCustomerType,
    updateSelectedCustomer,
    updateSelectedVehicle,
    updateNewCustomerInfo,
    updateNewVehicleInfo,
    updateSelectedServices,
    updateSelectedBay,
    updateBayRecommendation,
    updateQueueItems,
    setLoading,
    setError,
    
    // API methods
    recommendBay,
    createWalkInBooking,
    getBayQueue,
    transferBooking,
    
    // Utility methods
    resetState,
    nextStep,
    prevStep,
    isStepValid,
  };
};

/**
 * Hook để quản lý bay recommendation
 */
export const useBayRecommendation = () => {
  const [state, setState] = useState<{
    recommendation?: BayRecommendationResponse;
    loading: boolean;
    error?: string;
  }>({
    loading: false,
  });

  const recommendBay = useCallback(async (
    branchId: string,
    serviceDuration: number,
    serviceType?: string,
    priority?: Priority
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));

      const request: BayRecommendationRequest = {
        branch_id: branchId,
        service_duration_minutes: serviceDuration,
        service_type: serviceType,
        priority,
      };

      const response = await walkInBookingService.recommendBay(request);
      setState(prev => ({ ...prev, recommendation: response }));
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to recommend bay';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false });
  }, []);

  return {
    ...state,
    recommendBay,
    reset,
  };
};

/**
 * Hook để quản lý bay queue
 */
export const useBayQueue = (bayId?: string) => {
  const [state, setState] = useState<{
    queueItems: BookingQueueItem[];
    loading: boolean;
    error?: string;
  }>({
    queueItems: [],
    loading: false,
  });

  const getBayQueue = useCallback(async (targetBayId?: string) => {
    const id = targetBayId || bayId;
    if (!id) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));

      const response = await walkInBookingService.getBayQueue(id);
      setState(prev => ({ ...prev, queueItems: response }));
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get bay queue';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [bayId]);

  const transferBooking = useCallback(async (
    bookingId: string,
    toBayId: string,
    reason?: string
  ) => {
    if (!bayId) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));

      const request: TransferBookingRequest = {
        booking_id: bookingId,
        from_bay_id: bayId,
        to_bay_id: toBayId,
        reason,
      };

      const response = await walkInBookingService.transferBooking(request);
      
      // Refresh queue
      await getBayQueue();
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to transfer booking';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [bayId, getBayQueue]);

  const refresh = useCallback(() => {
    if (bayId) {
      getBayQueue();
    }
  }, [bayId, getBayQueue]);

  return {
    ...state,
    getBayQueue,
    transferBooking,
    refresh,
  };
};
