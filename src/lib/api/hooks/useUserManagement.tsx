/**
 * useUserManagement Hook
 * React hook for user management state and operations
 */

"use client";

import {
  useState,
  useEffect,
  useCallback,
  useContext,
  createContext,
  ReactNode,
} from "react";
import { UserService } from "../services/user.service";
import {
  UserManagementState,
  UserManagementInfo,
  GetAllUsersRequest,
  UserFilterOptions,
  UserSortOptions,
  UserStatistics,
  UserType,
} from "../types";

// Re-export UserType for convenience
export type { UserType };

// Create User Management Context
const UserManagementContext = createContext<
  UserManagementContextType | undefined
>(undefined);

// Context Type
interface UserManagementContextType extends UserManagementState {
  // Actions
  fetchUsers: (params?: GetAllUsersRequest) => Promise<void>;
  refreshUsers: () => Promise<void>;
  updateUserStatus: (userId: string, isActive: boolean) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  exportUsers: () => Promise<Blob>;
  getUserStatistics: () => Promise<UserStatistics | null>;

  // Filter and Sort
  setFilters: (filters: UserFilterOptions) => void;
  setSort: (sort: UserSortOptions) => void;
  clearFilters: () => void;

  // Pagination
  goToPage: (page: number) => Promise<void>;
  changePageSize: (size: number) => Promise<void>;

  // State management
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

/**
 * User Management Provider Component
 */
export function UserManagementProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserManagementState>({
    users: [],
    pagination: null,
    isLoading: false,
    error: null,
    filters: {},
    sort: {
      field: "createdDate",
      direction: "DESC",
    },
  });

  /**
   * Fetch users with current filters and sort
   */
  const fetchUsers = useCallback(async (params: GetAllUsersRequest = {}) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const requestParams: GetAllUsersRequest = {
        page: params.page ?? 0,
        size: params.size ?? 10,
        direction: params.direction ?? state.sort.direction,
        sort: params.sort ?? state.sort.field,
        userType: params.userType ?? state.filters.userType,
      };

      const response = await UserService.getAllUsers(requestParams);

      setState((prev) => ({
        ...prev,
        users: response.data.content,
        pagination: {
          page: response.data.page,
          size: response.data.size,
          total_elements: response.data.total_elements,
          total_pages: response.data.total_pages,
          first: response.data.first,
          last: response.data.last,
          has_next: response.data.has_next,
          has_previous: response.data.has_previous,
        },
        isLoading: false,
        error: null,
      }));
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Failed to fetch users";

      setState((prev) => ({
        ...prev,
        users: [],
        pagination: null,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, []);

  /**
   * Refresh users (re-fetch current page)
   */
  const refreshUsers = useCallback(async () => {
    if (state.pagination) {
      await fetchUsers({
        page: state.pagination.page,
        size: state.pagination.size,
      });
    } else {
      await fetchUsers();
    }
  }, [fetchUsers, state.pagination]);

  /**
   * Update user status
   */
  const updateUserStatus = useCallback(
    async (userId: string, isActive: boolean) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        await UserService.updateUserStatus(userId, isActive);

        // Update user in local state
        setState((prev) => ({
          ...prev,
          users: prev.users.map((user) =>
            user.user_id === userId ? { ...user, is_active: isActive } : user
          ),
          isLoading: false,
          error: null,
        }));
      } catch (error: unknown) {
        const errorMessage =
          error && typeof error === "object" && "message" in error
            ? (error as { message: string }).message
            : "Failed to update user status";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
    },
    []
  );

  /**
   * Delete user
   */
  const deleteUser = useCallback(
    async (userId: string) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        await UserService.deleteUser(userId);

        // Remove user from local state
        setState((prev) => ({
          ...prev,
          users: prev.users.filter((user) => user.user_id !== userId),
          isLoading: false,
          error: null,
        }));

        // Refresh pagination if needed
        await refreshUsers();
      } catch (error: unknown) {
        const errorMessage =
          error && typeof error === "object" && "message" in error
            ? (error as { message: string }).message
            : "Failed to delete user";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
    },
    [refreshUsers]
  );

  /**
   * Search users
   */
  const searchUsers = useCallback(
    async (query: string) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await UserService.searchUsers(query, {
          page: 0,
          size: state.pagination?.size ?? 10,
          direction: state.sort.direction,
          sort: state.sort.field,
          userType: state.filters.userType,
        });

        setState((prev) => ({
          ...prev,
          users: response.data.content,
          pagination: {
            page: response.data.page,
            size: response.data.size,
            total_elements: response.data.total_elements,
            total_pages: response.data.total_pages,
            first: response.data.first,
            last: response.data.last,
            has_next: response.data.has_next,
            has_previous: response.data.has_previous,
          },
          isLoading: false,
          error: null,
        }));
      } catch (error: unknown) {
        const errorMessage =
          error && typeof error === "object" && "message" in error
            ? (error as { message: string }).message
            : "Failed to search users";

        setState((prev) => ({
          ...prev,
          users: [],
          pagination: null,
          isLoading: false,
          error: errorMessage,
        }));
      }
    },
    [state.sort, state.filters, state.pagination]
  );

  /**
   * Export users
   */
  const exportUsers = useCallback(async (): Promise<Blob> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const blob = await UserService.exportUsers({
        userType: state.filters.userType,
      });

      setState((prev) => ({ ...prev, isLoading: false, error: null }));
      return blob;
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Failed to export users";

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [state.filters]);

  /**
   * Get user statistics
   */
  const getUserStatistics =
    useCallback(async (): Promise<UserStatistics | null> => {
      try {
        const statistics = await UserService.getUserStatistics();
        return statistics;
      } catch (error) {
        console.error("Failed to get user statistics:", error);
        return null;
      }
    }, []);

  /**
   * Set filters
   */
  const setFilters = useCallback((filters: UserFilterOptions) => {
    setState((prev) => ({ ...prev, filters }));
  }, []);

  /**
   * Set sort
   */
  const setSort = useCallback((sort: UserSortOptions) => {
    setState((prev) => ({ ...prev, sort }));
  }, []);

  /**
   * Clear filters
   */
  const clearFilters = useCallback(() => {
    setState((prev) => ({ ...prev, filters: {} }));
  }, []);

  /**
   * Go to specific page
   */
  const goToPage = useCallback(
    async (page: number) => {
      await fetchUsers({ page });
    },
    [fetchUsers]
  );

  /**
   * Change page size
   */
  const changePageSize = useCallback(
    async (size: number) => {
      await fetchUsers({ page: 0, size });
    },
    [fetchUsers]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Set loading state
   */
  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

  // Auto-fetch users when filters or sort change
  useEffect(() => {
    const fetchUsersWithCurrentState = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const requestParams: GetAllUsersRequest = {
          page: 0,
          size: 10,
          direction: state.sort.direction,
          sort: state.sort.field,
          userType: state.filters.userType,
        };

        const response = await UserService.getAllUsers(requestParams);

        setState((prev) => ({
          ...prev,
          users: response.data.content,
          pagination: {
            page: response.data.page,
            size: response.data.size,
            total_elements: response.data.total_elements,
            total_pages: response.data.total_pages,
            first: response.data.first,
            last: response.data.last,
            has_next: response.data.has_next,
            has_previous: response.data.has_previous,
          },
          isLoading: false,
          error: null,
        }));
      } catch (error: unknown) {
        const errorMessage =
          error && typeof error === "object" && "message" in error
            ? (error as { message: string }).message
            : "Failed to fetch users";

        setState((prev) => ({
          ...prev,
          users: [],
          pagination: null,
          isLoading: false,
          error: errorMessage,
        }));
      }
    };

    fetchUsersWithCurrentState();
  }, [state.filters, state.sort]);

  const contextValue: UserManagementContextType = {
    ...state,
    fetchUsers,
    refreshUsers,
    updateUserStatus,
    deleteUser,
    searchUsers,
    exportUsers,
    getUserStatistics,
    setFilters,
    setSort,
    clearFilters,
    goToPage,
    changePageSize,
    clearError,
    setLoading,
  };

  return (
    <UserManagementContext.Provider value={contextValue}>
      {children}
    </UserManagementContext.Provider>
  );
}

/**
 * useUserManagement Hook
 */
export function useUserManagement(): UserManagementContextType {
  const context = useContext(UserManagementContext);

  if (context === undefined) {
    throw new Error(
      "useUserManagement must be used within a UserManagementProvider"
    );
  }

  return context;
}

/**
 * useUserManagementState Hook
 * Hook to get only user management state (without actions)
 */
export function useUserManagementState(): UserManagementState {
  const { users, pagination, isLoading, error, filters, sort } =
    useUserManagement();
  return { users, pagination, isLoading, error, filters, sort };
}

/**
 * useUserManagementActions Hook
 * Hook to get only user management actions
 */
export function useUserManagementActions() {
  const {
    fetchUsers,
    refreshUsers,
    updateUserStatus,
    deleteUser,
    searchUsers,
    exportUsers,
    getUserStatistics,
    setFilters,
    setSort,
    clearFilters,
    goToPage,
    changePageSize,
    clearError,
    setLoading,
  } = useUserManagement();

  return {
    fetchUsers,
    refreshUsers,
    updateUserStatus,
    deleteUser,
    searchUsers,
    exportUsers,
    getUserStatistics,
    setFilters,
    setSort,
    clearFilters,
    goToPage,
    changePageSize,
    clearError,
    setLoading,
  };
}
