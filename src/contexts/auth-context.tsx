import { createContext, useReducer, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type {
  AuthState,
  AuthTokens,
  User,
  LoginCredentials,
} from "@/types/auth";
import { authService } from "@/services/auth-service";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshAuthTokens: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; tokens: AuthTokens } }
  | { type: "LOGIN_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "RESTORE_AUTH"; payload: { user: User; tokens: AuthTokens } };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGIN_FAILURE":
      return { ...state, isAuthenticated: false, isLoading: false };
    case "LOGOUT":
      return {
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "RESTORE_AUTH":
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading to check for existing auth
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await authService.login(credentials);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: response.me,
          tokens: {
            access_token: response.access_token,
            refresh_token: response.refresh_token,
            token_type: response.token_type,
            expires_in: response.expires_in,
            sid: response.sid,
          },
        },
      });
      // Store tokens in localStorage with expiration timestamp
      const expirationTime = Date.now() + response.expires_in * 1000;
      localStorage.setItem(
        "auth_tokens",
        JSON.stringify({
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          token_type: response.token_type,
          expires_in: response.expires_in,
          expires_at: expirationTime,
          sid: response.sid,
        })
      );
      localStorage.setItem("user", JSON.stringify(response.me));
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" });
      throw error;
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    localStorage.removeItem("auth_tokens");
    localStorage.removeItem("user");
  };

  const refreshAuthTokens = useCallback(async () => {
    try {
      const response = await authService.refreshToken();
      const expirationTime = Date.now() + response.expires_in * 1000;
      const tokens = {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        token_type: response.token_type,
        expires_in: response.expires_in,
        expires_at: expirationTime,
        sid: response.sid,
      };

      // Update stored tokens
      localStorage.setItem("auth_tokens", JSON.stringify(tokens));

      // Update context state if user is logged in
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user, tokens },
        });
      }
    } catch (error) {
      // If refresh fails, logout user
      logout();
      throw error;
    }
  }, []);

  // Restore authentication state on app load
  useEffect(() => {
    const restoreAuth = async () => {
      const storedTokens = localStorage.getItem("auth_tokens");
      const storedUser = localStorage.getItem("user");

      if (storedTokens && storedUser) {
        try {
          const tokens = JSON.parse(storedTokens);
          const user = JSON.parse(storedUser);

          // Check if token is still valid
          const now = Date.now();
          const isTokenValid = tokens.expires_at && tokens.expires_at > now;

          if (isTokenValid) {
            dispatch({
              type: "RESTORE_AUTH",
              payload: { user, tokens },
            });
          } else {
            // Token expired, try to refresh
            try {
              await refreshAuthTokens();
            } catch {
              // Refresh failed, clear storage and logout
              localStorage.removeItem("auth_tokens");
              localStorage.removeItem("user");
              dispatch({ type: "LOGOUT" });
            }
          }
        } catch {
          // Invalid stored data, clear it
          localStorage.removeItem("auth_tokens");
          localStorage.removeItem("user");
          dispatch({ type: "LOGOUT" });
        }
      } else {
        dispatch({ type: "LOGOUT" });
      }
    };

    restoreAuth();
  }, [refreshAuthTokens]);

  return (
    <AuthContext.Provider
      value={{ ...state, login, logout, refreshAuthTokens }}
    >
      {children}
    </AuthContext.Provider>
  );
}
