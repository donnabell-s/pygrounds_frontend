// src/api/userApi.ts
import client from "./client";
import type { User } from "../types/user";

export const userApi = {
  /** Fetch the current user’s profile */
  getProfile: async (): Promise<User | null> => {
    try {
      const res = await client.get<User>("/users/me/");
      return res.data;
    } catch (err) {
      console.error("userApi.getProfile error", err);
      return null;
    }
  },

  /** Update the current user’s profile */
  updateProfile: async (data: Partial<User>): Promise<User | null> => {
    try {
      const res = await client.put<User>("/users/me/", data);
      return res.data;
    } catch (err) {
      console.error("userApi.updateProfile error", err);
      return null;
    }
  },

  /** Fetch all users (admin only) */
  getAll: async (): Promise<User[]> => {
    try {
      const res = await client.get<User[]>("/users/");
      return res.data;
    } catch (err) {
      console.error("userApi.getAll error", err);
      return [];
    }
  },

  /** Delete a user by ID (admin only) */
  deleteUser: async (id: string): Promise<boolean> => {
    try {
      await client.delete(`/users/${id}/`);
      return true;
    } catch (err) {
      console.error("userApi.deleteUser error", err);
      return false;
    }
  },
};
