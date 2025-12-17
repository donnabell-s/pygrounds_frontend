import axios, { AxiosHeaders } from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  timeout: 10000,
});

client.interceptors.request.use((config) => {
  // NOTE: make sure sakto ni nga key sa inyong login
  // common keys: "accessToken", "access_token", "token"
  const token = localStorage.getItem("accessToken");

  if (token) {
    // Axios v1 uses AxiosHeaders
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    if (config.headers instanceof AxiosHeaders) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      // fallback if headers is still a plain object
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }
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
        if (localStorage.getItem("tokenExpiredHandled")) {
          return Promise.reject(error);
        }
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
