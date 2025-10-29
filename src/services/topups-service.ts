import axios from "axios";
import { API_CONFIG } from "@/config/api";
import type {
  TopupsListParams,
  TopupsListResponse,
  CreateTopupRequest,
  CreateTopupResponse,
  ApproveTopupRequest,
  RejectTopupRequest,
  TopupActionResponse,
  VendorWallet,
  WalletsListParams,
  WalletsListResponse,
  CreateWalletRequest,
  CreateWalletResponse,
  WalletDetails,
  WalletMethodsResponse,
  CreateWalletMethodRequest,
  CreateWalletMethodResponse,
  CurrenciesResponse,
  VendorsResponse,
  PayinBankAccount,
  PayinBankAccountsResponse,
  CreatePayinBankAccountRequest,
  CreatePayinBankAccountResponse,
  UpdatePayinBankAccountRequest,
  PaymentMethodsResponse,
  PaymentsListParams,
  PaymentsListResponse,
  BkashTransactionsListParams,
  BkashTransactionsListResponse,
  PayinBankAccountsReportsParams,
  PayinBankAccountsReportsResponse,
} from "@/types/topups";
import { authService } from "./auth-service";

class TopupsService {
  private baseURL = API_CONFIG.BASE_URL;

  async getTopupsList(
    params: TopupsListParams = {}
  ): Promise<TopupsListResponse> {
    try {
      const tokens = authService.getStoredTokens();
      if (!tokens?.access_token) {
        throw new Error("No access token available");
      }

      const queryParams = new URLSearchParams();

      // Add pagination params
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.per_page)
        queryParams.append("per_page", params.per_page.toString());

      // Add filter params
      if (params.status?.length) {
        params.status.forEach((status) => queryParams.append("status", status));
      }
      if (params.channel?.length) {
        params.channel.forEach((channel) =>
          queryParams.append("channel", channel)
        );
      }

      const response = await axios.get(
        `${this.baseURL}${
          API_CONFIG.ENDPOINTS.ADMIN.TOPUPS_LIST
        }?${queryParams.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle your API's error format
        const apiError = error.response?.data?.error;
        const message =
          apiError?.message ||
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch topups";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async createTopup(data: CreateTopupRequest): Promise<CreateTopupResponse> {
    try {
      const tokens = authService.getStoredTokens();
      if (!tokens?.access_token) {
        throw new Error("No access token available");
      }

      const response = await axios.post(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.ADMIN.TOPUPS_CREATE}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle your API's error format
        const apiError = error.response?.data?.error;
        const message =
          apiError?.message ||
          error.response?.data?.message ||
          error.message ||
          "Failed to create topup";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async approveTopup(
    topupId: number,
    data: ApproveTopupRequest
  ): Promise<TopupActionResponse> {
    try {
      const tokens = authService.getStoredTokens();
      if (!tokens?.access_token) {
        throw new Error("No access token available");
      }

      const response = await axios.post<TopupActionResponse>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.ADMIN.TOPUPS_APPROVE}/${topupId}/approve`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${tokens.access_token}`,
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
          "Failed to approve topup";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async rejectTopup(
    topupId: number,
    data: RejectTopupRequest
  ): Promise<TopupActionResponse> {
    try {
      const tokens = authService.getStoredTokens();
      if (!tokens?.access_token) {
        throw new Error("No access token available");
      }

      const response = await axios.post<TopupActionResponse>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.ADMIN.TOPUPS_REJECT}/${topupId}/reject`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${tokens.access_token}`,
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
          "Failed to reject topup";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async getVendorWallets(): Promise<VendorWallet[]> {
    try {
      const response = await axios.get<VendorWallet[]>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.ADMIN.VENDOR_WALLETS}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${authService.getAccessToken()}`,
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
          "Failed to fetch vendor wallets";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async getWallets(
    params: WalletsListParams = {}
  ): Promise<WalletsListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.offset !== undefined) {
        queryParams.append("offset", params.offset.toString());
      }
      if (params.limit !== undefined) {
        queryParams.append("limit", params.limit.toString());
      }

      const response = await axios.get<WalletsListResponse>(
        `${this.baseURL}${
          API_CONFIG.ENDPOINTS.ADMIN.WALLETS
        }?${queryParams.toString()}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${authService.getAccessToken()}`,
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
          "Failed to fetch wallets";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async createWallet(data: CreateWalletRequest): Promise<CreateWalletResponse> {
    try {
      const response = await axios.post<CreateWalletResponse>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.ADMIN.WALLETS_CREATE}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${authService.getAccessToken()}`,
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
          "Failed to create wallet";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async updateWallet(
    walletId: number,
    data: {
      name: string;
      is_active: boolean;
      enable_payment: boolean;
      enable_disbursement: boolean;
    }
  ): Promise<CreateWalletResponse> {
    try {
      const response = await axios.patch<CreateWalletResponse>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.ADMIN.WALLETS_UPDATE}/${walletId}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${authService.getAccessToken()}`,
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
          "Failed to update wallet";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async getWalletDetails(walletId: number): Promise<WalletDetails> {
    try {
      const response = await axios.get<WalletDetails>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.ADMIN.WALLET_DETAILS}/${walletId}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${authService.getAccessToken()}`,
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
          "Failed to fetch wallet details";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async getWalletMethods(walletId: number): Promise<WalletMethodsResponse> {
    try {
      const response = await axios.get<WalletMethodsResponse>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.ADMIN.WALLET_METHODS}/${walletId}/links`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${authService.getAccessToken()}`,
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
          "Failed to fetch wallet methods";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async createWalletMethod(
    walletId: number,
    data: CreateWalletMethodRequest
  ): Promise<CreateWalletMethodResponse> {
    try {
      const response = await axios.post<CreateWalletMethodResponse>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.ADMIN.WALLET_METHODS_CREATE}/${walletId}/links`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${authService.getAccessToken()}`,
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
          "Failed to create wallet method";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async updateWalletMethod(
    methodId: number,
    data: {
      is_active: boolean;
      enable_payment: boolean;
      enable_disbursement: boolean;
    }
  ): Promise<CreateWalletMethodResponse> {
    try {
      const response = await axios.patch<CreateWalletMethodResponse>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.ADMIN.WALLET_METHODS_UPDATE}/${methodId}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${authService.getAccessToken()}`,
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
          "Failed to update wallet method";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async getCurrencies(): Promise<CurrenciesResponse> {
    try {
      const response = await axios.get<CurrenciesResponse>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.COMMON.CURRENCIES}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${authService.getAccessToken()}`,
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
          "Failed to fetch currencies";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async getVendors(): Promise<VendorsResponse> {
    try {
      const response = await axios.get<VendorsResponse>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.ADMIN.VENDORS}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${authService.getAccessToken()}`,
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
          "Failed to fetch vendors";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async getPayinBankAccounts(): Promise<PayinBankAccountsResponse> {
    try {
      const response = await axios.get<PayinBankAccountsResponse>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.ADMIN.PAYIN_BANK_ACCOUNTS}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${authService.getAccessToken()}`,
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
          "Failed to fetch payin bank accounts";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async createPayinBankAccount(
    data: CreatePayinBankAccountRequest
  ): Promise<CreatePayinBankAccountResponse> {
    try {
      const response = await axios.post<CreatePayinBankAccountResponse>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.ADMIN.PAYIN_BANK_ACCOUNTS_CREATE}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${authService.getAccessToken()}`,
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
          "Failed to create payin bank account";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async getPaymentMethods(): Promise<PaymentMethodsResponse> {
    try {
      const response = await axios.get<PaymentMethodsResponse>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.COMMON.PAYMENT_METHODS}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${authService.getAccessToken()}`,
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
          "Failed to fetch payment methods";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async getPayments(
    params: PaymentsListParams = {}
  ): Promise<PaymentsListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.page_size)
        queryParams.append("page_size", params.page_size.toString());

      // Add filter params
      if (params.order_id) {
        queryParams.append("order_id", params.order_id);
      }
      if (params.status?.length) {
        params.status.forEach((status) => queryParams.append("status", status));
      }
      if (params.payment_method_id) {
        queryParams.append(
          "payment_method_id",
          params.payment_method_id.toString()
        );
      }
      if (params.payin_bank_account_id) {
        queryParams.append(
          "payin_bank_account_id",
          params.payin_bank_account_id.toString()
        );
      }
      if (params.amount_min !== null && params.amount_min !== undefined) {
        queryParams.append("amount_min", params.amount_min.toString());
      }
      if (params.amount_max !== null && params.amount_max !== undefined) {
        queryParams.append("amount_max", params.amount_max.toString());
      }
      if (params.created_from) {
        queryParams.append("created_from", params.created_from);
      }
      if (params.created_to) {
        queryParams.append("created_to", params.created_to);
      }

      const response = await axios.get<PaymentsListResponse>(
        `${this.baseURL}${
          API_CONFIG.ENDPOINTS.ADMIN.PAYMENTS
        }?${queryParams.toString()}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${authService.getAccessToken()}`,
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
          "Failed to fetch payments";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async approvePayinBankAccount(
    bankAccountId: number
  ): Promise<PayinBankAccount> {
    try {
      const tokens = authService.getStoredTokens();
      if (!tokens?.access_token) {
        throw new Error("No access token available");
      }

      const response = await axios.post<PayinBankAccount>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.ADMIN.PAYIN_BANK_ACCOUNTS_APPROVE}/${bankAccountId}/approve`,
        {},
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${tokens.access_token}`,
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
          "Failed to approve payin bank account";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async activatePayinBankAccount(
    bankAccountId: number
  ): Promise<PayinBankAccount> {
    try {
      const tokens = authService.getStoredTokens();
      if (!tokens?.access_token) {
        throw new Error("No access token available");
      }

      const response = await axios.post<PayinBankAccount>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.ADMIN.PAYIN_BANK_ACCOUNTS_ACTIVATE}/${bankAccountId}/activate`,
        {},
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${tokens.access_token}`,
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
          "Failed to activate payin bank account";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async deactivatePayinBankAccount(
    bankAccountId: number
  ): Promise<PayinBankAccount> {
    try {
      const tokens = authService.getStoredTokens();
      if (!tokens?.access_token) {
        throw new Error("No access token available");
      }

      const response = await axios.post<PayinBankAccount>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.ADMIN.PAYIN_BANK_ACCOUNTS_DEACTIVATE}/${bankAccountId}/deactivate`,
        {},
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${tokens.access_token}`,
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
          "Failed to deactivate payin bank account";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async getPayinBankAccount(bankAccountId: number): Promise<PayinBankAccount> {
    try {
      const tokens = authService.getStoredTokens();
      if (!tokens?.access_token) {
        throw new Error("No access token available");
      }

      const response = await axios.get<PayinBankAccount>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.ADMIN.PAYIN_BANK_ACCOUNTS}/${bankAccountId}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${tokens.access_token}`,
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
          "Failed to fetch payin bank account";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async updatePayinBankAccount(
    bankAccountId: number,
    data: UpdatePayinBankAccountRequest
  ): Promise<PayinBankAccount> {
    try {
      const tokens = authService.getStoredTokens();
      if (!tokens?.access_token) {
        throw new Error("No access token available");
      }

      const response = await axios.patch<PayinBankAccount>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.ADMIN.PAYIN_BANK_ACCOUNTS}/${bankAccountId}`,
        data,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens.access_token}`,
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
          "Failed to update payin bank account";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async getBkashTransactions(
    params: BkashTransactionsListParams = {}
  ): Promise<BkashTransactionsListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.page_size)
        queryParams.append("page_size", params.page_size.toString());
      if (params.include_stats !== undefined)
        queryParams.append("include_stats", params.include_stats.toString());

      // Add filter params
      if (params.transaction_id) {
        queryParams.append("transaction_id", params.transaction_id);
      }
      if (params.bank_id) {
        queryParams.append("bank_id", params.bank_id);
      }
      if (params.sender) {
        queryParams.append("sender", params.sender);
      }
      if (params.receiver) {
        queryParams.append("receiver", params.receiver);
      }
      if (params.direction) {
        queryParams.append("direction", params.direction);
      }
      if (params.txn_status?.length) {
        params.txn_status.forEach((status) =>
          queryParams.append("txn_status", status)
        );
      }
      if (params.bkash_status) {
        queryParams.append("bkash_status", params.bkash_status);
      }
      if (params.amount_min !== null && params.amount_min !== undefined) {
        queryParams.append("amount_min", params.amount_min.toString());
      }
      if (params.amount_max !== null && params.amount_max !== undefined) {
        queryParams.append("amount_max", params.amount_max.toString());
      }
      if (params.occurred_from) {
        queryParams.append("occurred_from", params.occurred_from);
      }
      if (params.occurred_to) {
        queryParams.append("occurred_to", params.occurred_to);
      }
      if (params.payment_id !== null && params.payment_id !== undefined) {
        queryParams.append("payment_id", params.payment_id.toString());
      }
      if (
        params.payment_linked !== null &&
        params.payment_linked !== undefined
      ) {
        queryParams.append("payment_linked", params.payment_linked.toString());
      }
      if (params.merchant_identifier) {
        queryParams.append("merchant_identifier", params.merchant_identifier);
      }
      if (params.vendor_id !== null && params.vendor_id !== undefined) {
        queryParams.append("vendor_id", params.vendor_id.toString());
      }

      const response = await axios.get<BkashTransactionsListResponse>(
        `${this.baseURL}${
          API_CONFIG.ENDPOINTS.ADMIN.BKASH_TRANSACTIONS
        }?${queryParams.toString()}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${authService.getAccessToken()}`,
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
          "Failed to fetch bKash transactions";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async getPayinBankAccountsReports(
    params: PayinBankAccountsReportsParams
  ): Promise<PayinBankAccountsReportsResponse> {
    try {
      const tokens = authService.getStoredTokens();
      if (!tokens?.access_token) {
        throw new Error("No access token available");
      }

      // Using POST instead of GET since GET requests with bodies
      // are not reliably supported in browsers/axios
      const response = await axios.post(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.ADMIN.PAYIN_BANK_ACCOUNTS_REPORTS}`,
        {
          from_report_date: params.from_report_date,
          to_report_date: params.to_report_date,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${tokens.access_token}`,
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
          "Failed to fetch payin bank accounts reports";
        throw new Error(message);
      }
      throw new Error("An unexpected error occurred");
    }
  }
}

export const topupsService = new TopupsService();
