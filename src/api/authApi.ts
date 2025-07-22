import client from "./client";
import type { User, SignupData } from "../types/user";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export const authApi = {
  login: (data: LoginCredentials) =>
    client.post<TokenResponse>("/token/", data),

  getProfile: () => client.get<User>("/user/profile/"),

  register: (data: SignupData) =>
    client.post<User>("/user/register/", data), // returns created user
};