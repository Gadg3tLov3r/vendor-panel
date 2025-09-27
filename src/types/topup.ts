export interface CreateTopupRequest {
  vendor_wallet_id: number;
  channel: "CASH" | "BANK_TRANSFER" | "ONLINE" | "OTHER";
  requested_amount: number;
  channel_note: string;
  idempotency_key: string;
}

export interface TopupResponse {
  id: number;
  vendor_wallet_id: number;
  channel: string;
  requested_amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PROCESSING";
  channel_note: string;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
}

export const TOPUP_CHANNELS = [
  { value: "CASH", label: "Cash Deposit" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "ONLINE", label: "Online Payment" },
  { value: "OTHER", label: "Other" },
] as const;
