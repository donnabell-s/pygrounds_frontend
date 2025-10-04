// src/context/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { userApi } from "../api/userApi";
import type { User } from "../types/user";

type UserContextType = {
  currentUser: User | null;
  isLoading: boolean;
  error: Error | null;
  fetchProfile: () => Promise<User | null>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch current user's profile (moved from AuthContext)
  const fetchProfile = async (): Promise<User | null> => {
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
  };

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

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isLoading,
        error,
        fetchProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};