import { api } from "@/lib/api";
import type { CreateTopupRequest, TopupResponse } from "@/types/topup";

// Example vendor-specific API service
export class VendorService {
  static async getVendorData() {
    try {
      const response = await api.get("/vendor/data");
      return response.data;
    } catch (error) {
      console.error("Get vendor data error:", error);
      throw error;
    }
  }

  static async createTopup(
    topupData: CreateTopupRequest,
    topupId: number = 1
  ): Promise<TopupResponse> {
    try {
      const response = await api.post(
        `/admin/topups/create?topup_id=${topupId}`,
        topupData
      );
      return response.data;
    } catch (error) {
      console.error("Create topup error:", error);
      throw error;
    }
  }

  static async getTopups(): Promise<TopupResponse[]> {
    try {
      const response = await api.get("/vendor/topup");
      return response.data;
    } catch (error) {
      console.error("Get topups error:", error);
      throw error;
    }
  }

  static async getVendorStats() {
    try {
      const response = await api.get("/vendor/stats");
      return response.data;
    } catch (error) {
      console.error("Get vendor stats error:", error);
      throw error;
    }
  }

  // Example of a request with custom headers
  static async uploadDocument(file: File, metadata?: unknown) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (metadata) {
        formData.append("metadata", JSON.stringify(metadata));
      }

      const response = await api.post("/vendor/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Document upload error:", error);
      throw error;
    }
  }

  // Example of a request with query parameters
  static async getTransactions(filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append("start_date", filters.startDate);
      if (filters?.endDate) params.append("end_date", filters.endDate);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const response = await api.get(
        `/vendor/transactions?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Get transactions error:", error);
      throw error;
    }
  }
}
