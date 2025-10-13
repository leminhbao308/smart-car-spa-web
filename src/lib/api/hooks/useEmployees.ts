/**
 * Employee Hooks
 * React Query hooks for employee management
 */

import { useQuery } from '@tanstack/react-query';
import { UserService } from '../services/user.service';
import { UserManagementInfo } from '../types/user.types';

// Query Keys
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters: any) => [...employeeKeys.lists(), filters] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
  dropdown: () => [...employeeKeys.all, 'dropdown'] as const,
};

// Hooks
export const useEmployees = (filters?: any) => {
  return useQuery({
    queryKey: employeeKeys.list(filters || {}),
    queryFn: () => UserService.getAllUsers({ ...filters, userType: 'EMPLOYEE' }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEmployeesDropdown = () => {
  return useQuery({
    queryKey: employeeKeys.dropdown(),
    queryFn: () => UserService.getAllUsers({ userType: 'EMPLOYEE', size: 1000 }),
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => {
      const users = data?.data?.content || data?.data || [];
      return users.map((user: UserManagementInfo) => ({
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        user_type: user.user_type,
      }));
    },
  });
};

export const useEmployee = (employeeId: string) => {
  return useQuery({
    queryKey: employeeKeys.detail(employeeId),
    queryFn: () => UserService.getUserById(employeeId),
    enabled: !!employeeId,
  });
};
