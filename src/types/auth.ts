export interface User {
  id: number;
  username: string;
  principal: string;
  is_superuser: boolean;
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  sid: string;
  me: User;
  permissions: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
  principal: string;
  rotate_session: boolean;
}

export interface AuthContextType {
  user: User | null;
  tokens: {
    access_token: string | null;
    refresh_token: string | null;
    expires_at: number | null;
  } | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}
