import { api } from "@/lib/api";
import type {
  CreateWalletRequest,
  WalletResponse,
  GetWalletsParams,
  UpdateWalletRequest,
} from "@/types/wallet";

export class AdminService {
  // Wallet Management
  static async createWallet(
    walletData: CreateWalletRequest
  ): Promise<WalletResponse> {
    try {
      const response = await api.post("/admin/wallets", walletData);
      return response.data;
    } catch (error) {
      console.error("Create wallet error:", error);
      throw error;
    }
  }

  static async getWallets(params?: GetWalletsParams): Promise<{
    data: WalletResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.vendor_id)
        queryParams.append("vendor_id", params.vendor_id.toString());
      if (params?.is_active !== undefined)
        queryParams.append("is_active", params.is_active.toString());
      if (params?.enable_payment !== undefined)
        queryParams.append("enable_payment", params.enable_payment.toString());
      if (params?.enable_disbursement !== undefined)
        queryParams.append(
          "enable_disbursement",
          params.enable_disbursement.toString()
        );
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const url = `/admin/wallets${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Get wallets error:", error);
      throw error;
    }
  }

  static async getWalletById(id: number): Promise<WalletResponse> {
    try {
      const response = await api.get(`/admin/wallets/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get wallet by ID error:", error);
      throw error;
    }
  }

  static async updateWallet(
    updateData: UpdateWalletRequest
  ): Promise<WalletResponse> {
    try {
      const { id, ...data } = updateData;
      const response = await api.put(`/admin/wallets/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Update wallet error:", error);
      throw error;
    }
  }

  static async deleteWallet(id: number): Promise<void> {
    try {
      await api.delete(`/admin/wallets/${id}`);
    } catch (error) {
      console.error("Delete wallet error:", error);
      throw error;
    }
  }

  // Additional admin functions that might be useful
  static async getWalletBalance(id: number): Promise<{
    wallet_id: number;
    balance: number;
    currency: string;
    last_updated: string;
  }> {
    try {
      const response = await api.get(`/admin/wallets/${id}/balance`);
      return response.data;
    } catch (error) {
      console.error("Get wallet balance error:", error);
      throw error;
    }
  }

  static async getWalletTransactions(
    id: number,
    filters?: {
      start_date?: string;
      end_date?: string;
      transaction_type?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    data: Array<{
      id: number;
      wallet_id: number;
      amount: number;
      type: string;
      status: string;
      reference: string;
      created_at: string;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const queryParams = new URLSearchParams();

      if (filters?.start_date)
        queryParams.append("start_date", filters.start_date);
      if (filters?.end_date) queryParams.append("end_date", filters.end_date);
      if (filters?.transaction_type)
        queryParams.append("transaction_type", filters.transaction_type);
      if (filters?.status) queryParams.append("status", filters.status);
      if (filters?.page) queryParams.append("page", filters.page.toString());
      if (filters?.limit) queryParams.append("limit", filters.limit.toString());

      const url = `/admin/wallets/${id}/transactions${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Get wallet transactions error:", error);
      throw error;
    }
  }

  // Export wallet functionality
  static async exportWallets(
    params?: GetWalletsParams & { format?: "csv" | "xlsx" }
  ) {
    try {
      const queryParams = new URLSearchParams();

      if (params?.vendor_id)
        queryParams.append("vendor_id", params.vendor_id.toString());
      if (params?.is_active !== undefined)
        queryParams.append("is_active", params.is_active.toString());
      if (params?.enable_payment !== undefined)
        queryParams.append("enable_payment", params.enable_payment.toString());
      if (params?.enable_disbursement !== undefined)
        queryParams.append(
          "enable_disbursement",
          params.enable_disbursement.toString()
        );
      if (params?.format) queryParams.append("format", params.format);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const url = `/admin/wallets/export${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Export wallets error:", error);
      throw error;
    }
  }
}
