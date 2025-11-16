"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "../services/user.service";
import { BookingService } from "../services/bookingService";
import {
  GetAllUsersRequest,
  CreateUserRequest,
  UpdateUserRequest,
} from "../types";
import { message } from "antd";

/**
 * Hook for customers dropdown data
 * Uses React Query for caching and automatic refetching
 */
export const useCustomersDropdown = () => {
  const {
    data: customersResponse,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["customers", "dropdown"],
    queryFn: async () => {
      const response = await UserService.getAllUsers({
        page: 0,
        size: 1000, // Get all customers for dropdown
        userType: "CUSTOMER", // Only customers
      });
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - dropdown data changes rarely
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    customers: customersResponse?.content || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for all users data with pagination and filtering
 * Migrated to TanStack React Query for better performance and caching
 */
export const useUsers = (params: GetAllUsersRequest = {}) => {
  const {
    data: usersResponse,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users", "list", params],
    queryFn: async () => {
      const response = await UserService.getAllUsers(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    users: usersResponse?.content || [],
    pagination: {
      page: usersResponse?.page || 0,
      size: usersResponse?.size || 10,
      total_elements: usersResponse?.total_elements || 0,
      total_pages: usersResponse?.total_pages || 0,
    },
    loading,
    error,
    refreshUsers: refetch,
  };
};

/**
 * Hook for creating a new user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      return await UserService.createUser(data);
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
      message.success("Tạo người dùng thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (
        error as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi tạo người dùng");
    },
  });
};

/**
 * Hook for updating a user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateUserRequest;
    }) => {
      return await UserService.updateUser(userId, data);
    },
    onSuccess: (updatedUser, variables) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
      // Invalidate specific user detail
      queryClient.invalidateQueries({
        queryKey: ["users", "detail", variables.userId],
      });
      message.success("Cập nhật người dùng thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (
        error as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi cập nhật người dùng");
    },
  });
};

/**
 * Hook for deleting a user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return await UserService.deleteUser(userId);
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
      message.success("Xóa người dùng thành công!");
    },
    onError: (error: Error) => {
      const errorMessage = (
        error as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      message.error(errorMessage || "Có lỗi xảy ra khi xóa người dùng");
    },
  });
};

/**
 * Hook for a single user by ID
 * Migrated to TanStack React Query for better performance and caching
 */
export const useUser = (userId: string | null) => {
  const {
    data: user,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users", "detail", userId],
    queryFn: async () => {
      if (!userId) return null;
      return await UserService.getUserById(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    user,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for customer bookings
 * Gets all bookings for a specific customer
 */
export const useCustomerBookings = (customerId: string | null) => {
  console.log("useCustomerBookings called with customerId:", customerId);
  
  const {
    data: bookings,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["bookings", "customer", customerId],
    queryFn: async () => {
      console.log("Query function called with customerId:", customerId);
      if (!customerId) {
        console.log("No customerId provided, returning empty array");
        return [];
      }
      console.log("Calling BookingService.getBookingsByCustomer...");
      return await BookingService.getBookingsByCustomer(customerId);
    },
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    bookings: bookings || [],
    loading,
    error,
    refetch,
  };
};
