"use client";

import {useState, useEffect, useCallback, useRef} from "react";
import {VehicleProfileService} from "../services/vehicle-profile.service";
import {
  VehicleProfile,
  VehicleProfileRequest,
  CreateVehicleProfileRequest,
  UpdateVehicleProfileRequest,
} from "../types/vehicle-profile.types";

export interface UseVehicleProfilesProps {
  ownerId?: string;
  params: VehicleProfileRequest;
}

/**
 * Hook for all vehicle profiles data with pagination and search
 */
export const useVehicleProfiles = ({ownerId, params}: UseVehicleProfilesProps) => {
  const [profiles, setProfiles] = useState<VehicleProfile[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    total_elements: 0,
    total_pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use ref to store current params and ownerId to avoid dependency issues
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const ownerIdRef = useRef(ownerId);
  ownerIdRef.current = ownerId;

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
      console.log("Failed to fetch vehicle profiles:", err);
      setError("Failed to load vehicle profiles.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProfilesByOwnerId = useCallback(async (ownerId: string, currentParams: VehicleProfileRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await VehicleProfileService.getAllVehicleProfilesByOwnerId(ownerId, currentParams);
      setProfiles(response.data.content);
      setPagination({
        page: response.data.page,
        size: response.data.size,
        total_elements: response.data.total_elements,
        total_pages: response.data.total_pages,
      });
    } catch (err) {
      console.log("Failed to fetch vehicle profiles by ownerId:", err);
      setError("Failed to load vehicle profiles by owner id.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ownerId) {
      fetchProfilesByOwnerId(ownerId, paramsRef.current);
    } else {
      fetchProfiles(paramsRef.current);
    }
  }, [fetchProfiles, fetchProfilesByOwnerId, ownerId]);

  const refreshProfiles = useCallback(() => {
    // Use ref to get latest ownerId to avoid stale closure
    const currentOwnerId = ownerIdRef.current;
    if (currentOwnerId) {
      return fetchProfilesByOwnerId(currentOwnerId, paramsRef.current);
    }
    return fetchProfiles(paramsRef.current);
  }, [fetchProfiles, fetchProfilesByOwnerId]);

  const createProfile = useCallback(async (data: CreateVehicleProfileRequest) => {
    try {
      const response = await VehicleProfileService.createVehicleProfile(data);

      // Refresh the list after successful creation
      // Use ref to get latest ownerId to avoid stale closure
      const currentOwnerId = ownerIdRef.current;
      if (currentOwnerId) {
        await fetchProfilesByOwnerId(currentOwnerId, paramsRef.current);
      } else {
        await fetchProfiles(paramsRef.current);
      }

      return response;
    } catch (err) {
      console.log("Failed to create vehicle profile:", err);
      throw err;
    }
  }, [fetchProfiles, fetchProfilesByOwnerId]);

  const updateProfile = useCallback(async (profileId: string, data: UpdateVehicleProfileRequest) => {
    try {
      const response = await VehicleProfileService.updateVehicleProfile(profileId, data);
      // Refresh the list after successful update
      // Use ref to get latest ownerId to avoid stale closure
      const currentOwnerId = ownerIdRef.current;
      if (currentOwnerId) {
        await fetchProfilesByOwnerId(currentOwnerId, paramsRef.current);
      } else {
        await fetchProfiles(paramsRef.current);
      }

      return response;
    } catch (err) {
      console.log("Failed to update vehicle profile:", err);
      throw err;
    }
  }, [fetchProfiles, fetchProfilesByOwnerId]);

  const deleteProfile = useCallback(async (profileId: string) => {
    try {
      await VehicleProfileService.deleteVehicleProfile(profileId);

      // Refresh the list after successful deletion
      // Use ref to get latest ownerId to avoid stale closure
      const currentOwnerId = ownerIdRef.current;
      if (currentOwnerId) {
        await fetchProfilesByOwnerId(currentOwnerId, paramsRef.current);
      } else {
        await fetchProfiles(paramsRef.current);
      }
    } catch (err) {
      console.log("Failed to delete vehicle profile:", err);
      throw err;
    }
  }, [fetchProfiles, fetchProfilesByOwnerId]);

  return {profiles, pagination, loading, error, refreshProfiles, createProfile, updateProfile, deleteProfile};
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
      console.log(`Failed to fetch vehicle profile with ID ${profileId}:`, err);
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

  return {profile, loading, error, refreshProfile};
};
