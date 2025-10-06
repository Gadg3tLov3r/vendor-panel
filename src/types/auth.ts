export interface User {
  id: number;
  username: string;
  principal: string;
  is_superuser: boolean;
  roles: Array<{
    id: number;
    name: string;
  }>;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at?: number; // Added for client-side expiration tracking
  sid: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  sid: string;
  me: User;
  permissions: string[];
}

export interface LoginCredentials {
  principal: string;
  username: string;
  password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  logout_everywhere: boolean;
  issue_new_tokens: boolean;
}

export interface ChangePasswordResponse {
  ok: boolean;
  rotated: boolean;
  issued_tokens: AuthResponse;
}

export interface LogoutAllResponse {
  ok: boolean;
  message?: string;
}

export interface VendorRegistrationRequest {
  vendor_name: string;
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  refferal_code?: string;
}

export interface VendorRegistrationResponse {
  message: string;
  vendor_id?: number;
  success: boolean;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
