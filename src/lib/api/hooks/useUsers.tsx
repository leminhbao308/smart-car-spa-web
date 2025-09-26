"use client";

import { useState, useEffect, useCallback } from "react";
import { UserService } from "../services/user.service";
import {
  GetAllUsersRequest,
  UserManagementInfo,
} from "../types";

/**
 * Hook for all users data with pagination and filtering
 */
export const useUsers = (params: GetAllUsersRequest = {}) => {
  const [users, setUsers] = useState<UserManagementInfo[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    total_elements: 0,
    total_pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (currentParams: GetAllUsersRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await UserService.getAllUsers(currentParams);
      setUsers(response.data.content);
      setPagination({
        page: response.data.page,
        size: response.data.size,
        total_elements: response.data.total_elements,
        total_pages: response.data.total_pages,
      });
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(params);
  }, [fetchUsers, params]);

  const refreshUsers = useCallback(() => {
    fetchUsers(params);
  }, [fetchUsers, params]);

  return { users, pagination, loading, error, refreshUsers };
};

/**
 * Hook for customers dropdown data
 */
export const useCustomersDropdown = () => {
  const [customers, setCustomers] = useState<UserManagementInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await UserService.getAllUsers({
        userType: "CUSTOMER",
        size: 1000, // Get all customers
        page: 0,
      });
      setCustomers(response.data.content);
    } catch (err) {
      console.error("Failed to fetch customers for dropdown:", err);
      setError("Failed to load customers for dropdown.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return { customers, loading, error, refetch: fetchCustomers };
};

/**
 * Hook for a single user by ID
 */
export const useUser = (userId: string | null) => {
  const [user, setUser] = useState<UserManagementInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetchedUser = await UserService.getUserById(userId);
      setUser(fetchedUser);
    } catch (err) {
      console.error(`Failed to fetch user with ID ${userId}:`, err);
      setError("Failed to load user details.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const refreshUser = useCallback(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refreshUser };
};
