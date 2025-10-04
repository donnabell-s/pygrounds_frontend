// src/api/authApi.ts
import client from "./client";
import type { User, SignupData } from "../types/user";

export const authApi = {
  login: async (credentials: { username: string; password: string }): Promise<{ access: string; refresh: string }> => {
    const res = await client.post<{ access: string; refresh: string }>("/token/", credentials);
    return res.data;
  },

  register: async (data: SignupData): Promise<void> => {
    await client.post("/user/register/", data);
  },

  getProfile: async (): Promise<User> => {
    // backend exposes current user's profile at /api/user/profile/
    const res = await client.get<User>("/user/profile/");
    return res.data;
  },
};
