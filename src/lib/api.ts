import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";

const API_BASE_URL = "https://vendor-panel-app-wlvyh.ondigitalocean.app/api/v1";

/**
 * Centralized Axios API client with automatic JWT token handling
 *
 * Features:
 * - Automatically adds JWT token to all requests
 * - Automatic token refresh on 401 errors
 * - Automatic logout/redirect on auth failure
 * - Consistent error handling across the app
 *
 * Usage:
 *
 * Direct API calls:
 * - await api.get("/endpoint")
 * - await api.post("/endpoint", data)
 * - await api.put("/endpoint", data)
 * - await api.delete("/endpoint")
 *
 * Service-based calls (recommended):
 * - Create service files in /services for specific API sections
 * - Use VendorService.getData() instead of direct API calls
 */

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
  timeout: 10000,
});

// Request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (config: any) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (response: any) => response,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (error: any) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );

          const { access_token, refresh_token, expires_in } =
            refreshResponse.data;
          const expiresAt = Date.now() + expires_in * 1000;

          // Update tokens in localStorage
          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", refresh_token);
          localStorage.setItem("token_expires_at", expiresAt.toString());

          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;

          // Retry the original request
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear storage and redirect to login
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Specific API methods for authentication
export const authAPI = {
  login: async (credentials: unknown) => {
    const response = await apiClient.post("/auth/token", credentials);
    return response.data;
  },

  refresh: async (refreshToken: string) => {
    const response = await apiClient.post(
      "/auth/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
};

// Generic HTTP methods for other API calls
export const api = {
  get: (url: string, config?: AxiosRequestConfig) => apiClient.get(url, config),

  post: (url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post(url, data, config),

  put: (url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put(url, data, config),

  patch: (url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch(url, data, config),

  delete: (url: string, config?: AxiosRequestConfig) =>
    apiClient.delete(url, config),
};
