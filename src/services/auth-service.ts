import axios from "axios";
import { API_CONFIG } from "@/config/api";
import {
  type AuthResponse,
  type LoginCredentials,
  type ChangePasswordRequest,
  type ChangePasswordResponse,
  type LogoutAllResponse,
  type VendorRegistrationRequest,
  type VendorRegistrationResponse,
} from "@/types/auth";

class AuthService {
  private baseURL = API_CONFIG.BASE_URL;

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.TOKEN}`,
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle your API's error format: {"error":{"message":"Invalid credentials","code":"unauthorized","extra":null}}
        const apiError = error.response?.data?.error;
        const message =
          apiError?.message ||
          error.response?.data?.message ||
          error.message ||
          "Login failed";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  // Method to get stored tokens (useful for API interceptors)
  getStoredTokens() {
    const stored = localStorage.getItem("auth_tokens");
    return stored ? JSON.parse(stored) : null;
  }

  // Method to get access token
  getAccessToken(): string | null {
    const tokens = this.getStoredTokens();
    return tokens?.access_token || null;
  }

  // Method to refresh token
  async refreshToken(): Promise<AuthResponse> {
    const storedTokens = this.getStoredTokens();
    if (!storedTokens?.refresh_token) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await axios.post(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
        {
          refresh_token: storedTokens.refresh_token,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle your API's error format: {"error":{"message":"Invalid credentials","code":"unauthorized","extra":null}}
        const apiError = error.response?.data?.error;
        const message =
          apiError?.message ||
          error.response?.data?.message ||
          error.message ||
          "Token refresh failed";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred during token refresh");
    }
  }
  // Method to change password
  async changePassword(
    request: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      throw new Error("No access token available");
    }

    try {
      const response = await axios.post(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD}`,
        request,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data?.error;
        const message =
          apiError?.message ||
          error.response?.data?.message ||
          error.message ||
          "Password change failed";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred during password change");
    }
  }

  // Method to logout from all devices
  async logoutAll(): Promise<LogoutAllResponse> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      throw new Error("No access token available");
    }

    try {
      const response = await axios.post(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.LOGOUT_ALL}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data?.error;
        const message =
          apiError?.message ||
          error.response?.data?.message ||
          error.message ||
          "Logout from all devices failed";
        throw new Error(message);
      }
      throw new Error(
        "An unexpected error occurred during logout from all devices"
      );
    }
  }

  // Method to register a new vendor
  async registerVendor(
    registrationData: VendorRegistrationRequest
  ): Promise<VendorRegistrationResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.VENDOR_REGISTRATION}`,
        registrationData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle validation errors from the API
        if (
          error.response?.data?.detail &&
          Array.isArray(error.response.data.detail)
        ) {
          const validationErrors = error.response.data.detail;
          const errorMessages = validationErrors
            .map((err: any) => err.msg)
            .join(", ");
          throw new Error(errorMessages);
        }

        // Handle other API errors
        const apiError = error.response?.data?.error;
        const message =
          apiError?.message ||
          error.response?.data?.message ||
          error.message ||
          "Vendor registration failed";
        throw new Error(message);
      }
      throw new Error(
        "An unexpected error occurred during vendor registration"
      );
    }
  }
}

export const authService = new AuthService();
