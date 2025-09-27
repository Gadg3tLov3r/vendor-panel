// Module exports: CreateWalletRequest, WalletResponse, GetWalletsParams, UpdateWalletRequest
export interface CreateWalletRequest {
  name: string;
  currency_id: number;
  is_active: boolean;
  enable_payment: boolean;
  enable_disbursement: boolean;
  vendor_id: number;
  payment_commission_rate_percent: number;
  disbursement_commission_rate_percent: number;
  settlement_commission_rate_percent: number;
  topup_commission_rate_percent: number;
  payment_commission_rate_fixed: number;
  disbursement_commission_rate_fixed: number;
  settlement_commission_rate_fixed: number;
  topup_commission_rate_fixed: number;
  min_payment_amount: number;
  max_payment_amount: number;
  min_disbursement_amount: number;
  max_disbursement_amount: number;
  can_balance_go_negative: boolean;
}

// Wallet API Response structure
export interface WalletResponse {
  id: number;
  name: string;
  currency_id: number;
  is_active: boolean;
  enable_payment: boolean;
  enable_disbursement: boolean;
  vendor_id: number;
  payment_commission_rate_percent: number;
  disbursement_commission_rate_percent: number;
  settlement_commission_rate_percent: number;
  topup_commission_rate_percent: number;
  payment_commission_rate_fixed: number;
  disbursement_commission_rate_fixed: number;
  settlement_commission_rate_fixed: number;
  topup_commission_rate_fixed: number;
  min_payment_amount: number;
  max_payment_amount: number;
  min_disbursement_amount: number;
  max_disbursement_amount: number;
  can_balance_go_negative: boolean;
  created_at: string;
  updated_at: string;
}

export interface GetWalletsParams {
  vendor_id?: number;
  is_active?: boolean;
  enable_payment?: boolean;
  enable_disbursement?: boolean;
  page?: number;
  limit?: number;
}

export interface UpdateWalletRequest extends Partial<CreateWalletRequest> {
  id: number;
}
