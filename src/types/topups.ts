export interface Topup {
  id: number;
  vendor_wallet_id: number;
  channel: "CASH" | "BANK" | "CRYPTO";
  channel_note: string;
  requested_amount: string;
  paid_amount: string | null;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  created_by_vendor_id: number | null;
  created_by_admin_id: number | null;
  approved_by_admin_id: number | null;
  approved_at: string | null;
  rejected_reason: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface TopupsListParams {
  page?: number;
  per_page?: number;
  status?: string[];
  channel?: string[];
}

export interface TopupsListResponse {
  items: Topup[];
  total: number;
  page: number;
  per_page: number;
}

export interface CreateTopupRequest {
  vendor_wallet_id: number;
  channel: "CASH" | "BANK" | "CRYPTO";
  requested_amount: number;
  channel_note: string;
  idempotency_key: string;
}

export interface CreateTopupResponse {
  success: boolean;
  message?: string;
  data?: Topup;
}

export interface ApproveTopupRequest {
  paid_amount: number;
  admin_note: string;
}

export interface RejectTopupRequest {
  reason: string;
}

export interface TopupActionResponse {
  id: number;
  vendor_wallet_id: number;
  channel: "CASH" | "BANK" | "CRYPTO";
  channel_note: string;
  requested_amount: string;
  paid_amount: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  created_by_vendor_id: number | null;
  created_by_admin_id: number | null;
  approved_by_admin_id: number | null;
  approved_at: string | null;
  rejected_reason: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface VendorWallet {
  id: number;
  name: string;
}

export interface Wallet {
  id: number;
  name: string;
  vendor_id: number;
  currency_id: number;
  is_active: boolean;
  enable_payment: boolean;
  enable_disbursement: boolean;
  can_balance_go_negative: boolean;
  total_payment: string;
  payment_commission: string;
  total_disbursement: string;
  disbursement_commission: string;
  total_settlement: string;
  settlement_commission: string;
  total_topup: string;
  topup_commission: string;
  currency_name: string;
  vendor_name: string;
  active_hold_amount: string;
  balance: string;
}

export interface WalletDetails {
  id: number;
  name: string;
  vendor_id: number;
  currency_id: number;
  is_active: boolean;
  enable_payment: boolean;
  enable_disbursement: boolean;
  can_balance_go_negative: boolean;
  total_payment: string;
  payment_commission: string;
  total_disbursement: string;
  disbursement_commission: string;
  total_settlement: string;
  settlement_commission: string;
  total_topup: string;
  topup_commission: string;
}

export interface WalletMethod {
  id: number;
  wallet_id: number;
  payment_method_id: number;
  payment_method_name: string;
  is_active: boolean;
  enable_payment: boolean;
  enable_disbursement: boolean;
  payment_commission_rate_percent: string;
  payment_commission_rate_fixed: string;
  disbursement_commission_rate_percent: string;
  disbursement_commission_rate_fixed: string;
  settlement_commission_rate_percent: string;
  settlement_commission_rate_fixed: string;
  topup_commission_rate_percent: string;
  topup_commission_rate_fixed: string;
  min_payment_amount: string;
  max_payment_amount: string;
  min_disbursement_amount: string;
  max_disbursement_amount: string;
}

export type WalletMethodsResponse = WalletMethod[];

export interface CreateWalletMethodRequest {
  payment_method_id: number;
  is_active: boolean;
  enable_payment: boolean;
  enable_disbursement: boolean;
  payment_commission_rate_percent: number;
  payment_commission_rate_fixed: number;
  disbursement_commission_rate_percent: number;
  disbursement_commission_rate_fixed: number;
  settlement_commission_rate_percent: number;
  settlement_commission_rate_fixed: number;
  topup_commission_rate_percent: number;
  topup_commission_rate_fixed: number;
  min_payment_amount: number;
  max_payment_amount: number;
  min_disbursement_amount: number;
  max_disbursement_amount: number;
}

export interface CreateWalletMethodResponse {
  id: number;
  wallet_id: number;
  payment_method_id: number;
  is_active: boolean;
  enable_payment: boolean;
  enable_disbursement: boolean;
  payment_commission_rate_percent: string;
  payment_commission_rate_fixed: string;
  disbursement_commission_rate_percent: string;
  disbursement_commission_rate_fixed: string;
  settlement_commission_rate_percent: string;
  settlement_commission_rate_fixed: string;
  topup_commission_rate_percent: string;
  topup_commission_rate_fixed: string;
  min_payment_amount: string;
  max_payment_amount: string;
  min_disbursement_amount: string;
  max_disbursement_amount: string;
}

export interface WalletsListParams {
  offset?: number;
  limit?: number;
}

export type WalletsListResponse = Wallet[];

export interface CreateWalletRequest {
  name: string;
  currency_id: number;
  is_active: boolean;
  enable_payment: boolean;
  enable_disbursement: boolean;
  vendor_id: number;
  can_balance_go_negative: boolean;
}

export interface CreateWalletResponse {
  success: boolean;
  message?: string;
  data?: Wallet;
}

export interface Currency {
  id: number;
  name: string;
  sign: string;
}

export type CurrenciesResponse = Currency[];

export interface PaymentMethod {
  id: number;
  name: string;
}

export type PaymentMethodsResponse = PaymentMethod[];

export interface Vendor {
  id: number;
  name: string;
}

export type VendorsResponse = Vendor[];

export interface PayinBankAccount {
  id: number;
  vendor_wallet_id: number;
  payment_method_id: number;
  payment_method_name: string;
  vendor_wallet_name: string;
  active_hold_amount: string;
  note: string;
  start_time: string;
  end_time: string;
  min_amount: string;
  max_amount: string;
  receivable_amount: string;
  received_amount: string;
  daily_receivable_amount: string;
  daily_received_amount: string;
  is_active: boolean;
  is_approved: boolean;
  credentials: Record<string, unknown>;
}

export type PayinBankAccountsResponse = PayinBankAccount[];

export interface CreatePayinBankAccountRequest {
  payment_method_id: number;
  note: string;
  start_time: string;
  end_time: string;
  min_amount: number;
  max_amount: number;
  receivable_amount: number;
  daily_receivable_amount: number;
  credentials: Record<string, unknown>;
  vendor_wallet_id: number;
}

export interface CreatePayinBankAccountResponse {
  success: boolean;
  message?: string;
  data?: PayinBankAccount;
}

export interface UpdatePayinBankAccountRequest {
  note: string;
  start_time: string;
  end_time: string;
  min_amount: number;
  max_amount: number;
  receivable_amount: number;
  daily_receivable_amount: number;
  credentials: Record<string, unknown>;
}

export interface Payment {
  id: number;
  order_id: string;
  order_amount: string;
  paid_amount: string;
  order_status: string;
  merchant_identifier: string;
  payment_method_id: number;
  payin_bank_account_id: number;
  created_at: string;
  updated_at: string;
  vendor_wallet_id: number;
  vendor_id: number;
  vendor_name: string;
  payment_method_name: string;
  bank_hold_amount: string;
  bank_hold_ttl_ms: number;
  wallet_hold_amount: string;
  wallet_hold_ttl_ms: number;
  commission_total: string;
  balance_updated: boolean;
}

export interface PaymentsListParams {
  page?: number;
  page_size?: number;
}

export interface PaymentsListResponse {
  items: Payment[];
  total: number;
  page: number;
  page_size: number;
}
