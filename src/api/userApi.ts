// src/api/userApi.ts
import client from "./client";
import type { User } from "../types/user";

export const userApi = {
  /** Fetch the current user
'
s profile */
  getProfile: async (): Promise<User | null> => {
    try {
      // backend exposes current user profile at /api/user/profile/
      const res = await client.get<User>("/user/profile/");
      return res.data;
    } catch (err) {
      console.error("userApi.getProfile error", err);
      return null;
    }
  },

  /** Update the current user's profile */
  updateProfile: async (data: Partial<User>): Promise<User | null> => {
    const res = await client.patch<User>("/user/profile/", data);
    return res.data;
  },

  /** Fetch another user
'
s profile by ID */
  getUserProfile: async (userId: number): Promise<User | null> => {
    try {
      // backend public profile endpoint is /api/user/<pk>/profile/
      const res = await client.get<User>(`/user/${userId}/profile/`);
      return res.data;
    } catch (err) {
      console.error("userApi.getUserProfile error", err);
      return null;
    }
  },

  /** Fetch all users (admin only) */
  getAll: async (): Promise<User[]> => {
    try {
      // call to admin users list - use singular `user` to match backend include
      const res = await client.get<User[]>("/user/");
      return res.data;
    } catch (err) {
      console.error("userApi.getAll error", err);
      return [];
    }
  },

  /** Delete a user by ID (admin only) */
  deleteUser: async (id: string): Promise<boolean> => {
    try {
      await client.delete(`/user/${id}/`);
      return true;
    } catch (err) {
      console.error("userApi.deleteUser error", err);
      return false;
    }
  },
};
