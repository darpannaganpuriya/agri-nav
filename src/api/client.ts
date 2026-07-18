import axios from "axios";

const token = typeof window !== "undefined" ? window.localStorage.getItem("fasalseva.token") : null;

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://fasalseva-backend.onrender.com",
  timeout: 60_000,
  headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const accessToken = window.localStorage.getItem("fasalseva.token");
    if (accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
});

// Small helper for mock services so loading states are actually visible in the UI.
export const mockDelay = <T,>(data: T, ms = 600): Promise<T> =>
  new Promise((r) => setTimeout(() => r(data), ms));

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.detail) {
      error.message = error.response.data.detail;
    }
    return Promise.reject(error);
  }
);
