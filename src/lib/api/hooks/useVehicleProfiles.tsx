"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { VehicleProfileService } from "../services/vehicle-profile.service";
import {
  VehicleProfile,
  VehicleProfileRequest,
  CreateVehicleProfileRequest,
} from "../types/vehicle-profile.types";

/**
 * Hook for all vehicle profiles data with pagination and search
 */
export const useVehicleProfiles = (params: VehicleProfileRequest = {}) => {
  const [profiles, setProfiles] = useState<VehicleProfile[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    total_elements: 0,
    total_pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to store current params to avoid dependency issues
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetchProfiles = useCallback(async (currentParams: VehicleProfileRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await VehicleProfileService.getAllVehicleProfiles(currentParams);
      setProfiles(response.data.content);
      setPagination({ 
        page: response.data.page,
        size: response.data.size,
        total_elements: response.data.total_elements,
        total_pages: response.data.total_pages,
      });
    } catch (err) {
      console.error("Failed to fetch vehicle profiles:", err);
      setError("Failed to load vehicle profiles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles(paramsRef.current);
  }, [fetchProfiles]);

  const refreshProfiles = useCallback(() => {
    fetchProfiles(paramsRef.current);
  }, [fetchProfiles]);

  const createProfile = useCallback(async (data: CreateVehicleProfileRequest) => {
    try {
      const response = await VehicleProfileService.createVehicleProfile(data);
      // Refresh the list after successful creation
      await fetchProfiles(paramsRef.current);
      return response;
    } catch (err) {
      console.error("Failed to create vehicle profile:", err);
      throw err;
    }
  }, [fetchProfiles]);

  const deleteProfile = useCallback(async (profileId: string) => {
    try {
      await VehicleProfileService.deleteVehicleProfile(profileId);
      // Refresh the list after successful deletion
      await fetchProfiles(paramsRef.current);
    } catch (err) {
      console.error("Failed to delete vehicle profile:", err);
      throw err;
    }
  }, [fetchProfiles]);

  return { profiles, pagination, loading, error, refreshProfiles, createProfile, deleteProfile };
};

/**
 * Hook for a single vehicle profile by ID
 */
export const useVehicleProfile = (profileId: string | null) => {
  const [profile, setProfile] = useState<VehicleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!profileId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetchedProfile = await VehicleProfileService.getVehicleProfileById(profileId);
      setProfile(fetchedProfile);
    } catch (err) {
      console.error(`Failed to fetch vehicle profile with ID ${profileId}:`, err);
      setError("Failed to load vehicle profile details.");
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refreshProfile = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refreshProfile };
};
