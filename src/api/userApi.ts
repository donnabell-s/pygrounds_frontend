import client from "./client";

export const userApi = {
  getProfile: () => client.get("/users/me"),
  updateProfile: (data: any) => client.put("/users/me", data),
  getAll: () => client.get("/users"), // if admin
  delete: (id: string) => client.delete(`/users/${id}`),
};
