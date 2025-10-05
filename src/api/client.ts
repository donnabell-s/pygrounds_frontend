// src/api/client.ts
import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  timeout: 10000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  // Ensure headers object exists
  if (!config.headers) {
    config.headers = {};
  }

  if (token) {
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);

    const status = error?.response?.status;
    if (status === 401) {
      try {
        // If another tab already handled expiry, don't re-dispatch
        if (localStorage.getItem("tokenExpiredHandled")) {
          return Promise.reject(error);
        }

        // Prevent flooding: set a flag so we only notify once per expiry
        if (!localStorage.getItem("tokenExpired")) {
          localStorage.setItem("tokenExpired", "1");
          window.dispatchEvent(new CustomEvent("auth:expired"));
        }
      } catch (e) {
        console.error("Failed to set tokenExpired flag", e);
      }
    }

    return Promise.reject(error);
  }
);

export default client;
