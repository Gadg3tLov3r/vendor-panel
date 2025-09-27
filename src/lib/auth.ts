import type { LoginRequest, LoginResponse } from "@/types/auth";
import { authAPI } from "./api";

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const data: LoginResponse = await authAPI.login(credentials);
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  static async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const data: LoginResponse = await authAPI.refresh(refreshToken);
      return data;
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  }

  static async getProfile(): Promise<unknown> {
    try {
      const data = await authAPI.getProfile();
      return data;
    } catch (error) {
      console.error("Profile fetch error:", error);
      throw error;
    }
  }
}
