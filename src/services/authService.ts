// src/services/authService.ts
import { authApi } from "../api/authApi";
import type { User, SignupData } from "../types/user";

export const authService = {
  async login(username: string, password: string): Promise<User> {
    const { access, refresh } = await authApi.login({ username, password });
    // store tokens before fetching profile
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    const user = await authApi.getProfile();
    return { ...user, token: access }; // include token in user object for AuthContext
  },

  async register(data: SignupData): Promise<User> {
    await authApi.register(data);
    // auto-login
    return authService.login(data.username, data.password);
  },

  getProfile: (): Promise<User> => authApi.getProfile(),
};
