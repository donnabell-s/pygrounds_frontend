// src/api/client.ts
import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8000/api",
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default client;
