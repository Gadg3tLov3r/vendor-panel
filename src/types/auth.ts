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

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
