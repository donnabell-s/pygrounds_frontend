// src/context/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { userApi } from "../api/userApi";
import type { User } from "../types/user";

type UserContextType = {
  currentUser: User | null;
  selectedUser: User | null;
  isLoading: boolean;
  error: Error | null;
  fetchProfile: () => Promise<User | null>;
  fetchUserProfile: (userId: number) => Promise<User | null>;
  setSelectedUser: (user: User | null) => void;
  clearSelectedUser: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch current user's profile (moved from AuthContext)
  const fetchProfile = useCallback(async (): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return null;
      }

      const profile = await userApi.getProfile();
      setCurrentUser(profile);
      // Also update localStorage for AuthContext compatibility
      if (profile) {
        localStorage.setItem("user", JSON.stringify(profile));
      }
      return profile;
    } catch (e) {
      const error = e as Error;
      console.error("Failed to fetch profile", error);
      setError(error);
      
      // Clear auth data if unauthorized
      if ((e as any)?.response?.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch another user's profile by ID
  const fetchUserProfile = useCallback(async (userId: number): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const profile = await userApi.getUserProfile(userId);
      setSelectedUser(profile);
      return profile;
    } catch (e) {
      const error = e as Error;
      console.error("Failed to fetch user profile", error);
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSelectedUser = useCallback(() => {
    setSelectedUser(null);
  }, []);

  // Load current user from storage and fetch fresh profile on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    // Only fetch profile if we have a token
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetchProfile();
    }
  }, []);

  const value = useMemo(() => ({
    currentUser,
    selectedUser,
    isLoading,
    error,
    fetchProfile,
    fetchUserProfile,
    setSelectedUser,
    clearSelectedUser,
  }), [currentUser, selectedUser, isLoading, error, fetchProfile, fetchUserProfile, clearSelectedUser]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};