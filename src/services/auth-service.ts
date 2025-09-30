import axios from "axios";
import { API_CONFIG } from "@/config/api";
import { type AuthResponse, type LoginCredentials } from "@/types/auth";

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
}

export const authService = new AuthService();
