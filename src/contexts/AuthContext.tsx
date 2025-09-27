import React, { createContext, useContext, useEffect, useReducer } from "react";
import {
  type User,
  type LoginRequest,
  type AuthContextType,
} from "@/types/auth";
import { AuthService } from "@/lib/auth";

interface AuthState {
  user: User | null;
  tokens: {
    access_token: string | null;
    refresh_token: string | null;
    expires_at: number | null;
  } | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | {
      type: "LOGIN_SUCCESS";
      payload: {
        user: User;
        tokens: {
          access_token: string | null;
          refresh_token: string | null;
          expires_at: number | null;
        };
        permissions: string[];
      };
    }
  | { type: "LOGOUT" }
  | {
      type: "REFRESH_SUCCESS";
      payload: {
        tokens: {
          access_token: string | null;
          refresh_token: string | null;
          expires_at: number | null;
        };
        user: User;
        permissions: string[];
      };
    };

const initialState: AuthState = {
  user: null,
  tokens: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        permissions: action.payload.permissions,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...initialState,
        isLoading: false,
      };
    case "REFRESH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        permissions: action.payload.permissions,
        isAuthenticated: true,
        isLoading: false,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for stored tokens on app mount
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token");
        const storedUser = localStorage.getItem("user");
        const storedPermissions = localStorage.getItem("permissions");

        if (accessToken && refreshToken && storedUser && storedPermissions) {
          const expiresAt = localStorage.getItem("token_expires_at");
          const now = Date.now();

          const user = JSON.parse(storedUser);
          const permissions = JSON.parse(storedPermissions);
          const tokens = {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: expiresAt ? parseInt(expiresAt) : null,
          };

          // Check if token is expired
          if (tokens.expires_at && tokens.expires_at > now) {
            dispatch({
              type: "LOGIN_SUCCESS",
              payload: { user, tokens, permissions },
            });
          } else if (refreshToken) {
            try {
              await refreshTokenFromStorage();
            } catch {
              // Clear invalid tokens and logout
              dispatch({ type: "LOGOUT" });
              localStorage.clear();
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await AuthService.login(credentials);
      const now = Date.now();
      const expiresAt = now + response.expires_in * 1000;

      const tokens = {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        expires_at: expiresAt,
      };

      // Store in localStorage
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);
      localStorage.setItem("token_expires_at", expiresAt.toString());
      localStorage.setItem("user", JSON.stringify(response.me));
      localStorage.setItem("permissions", JSON.stringify(response.permissions));

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: response.me,
          tokens,
          permissions: response.permissions,
        },
      });
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      throw error;
    }
  };

  const refreshTokenFromStorage = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) throw new Error("No refresh token");

    const response = await AuthService.refreshToken(refreshToken);
    const now = Date.now();
    const expiresAt = now + response.expires_in * 1000;

    const tokens = {
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      expires_at: expiresAt,
    };

    localStorage.setItem("access_token", response.access_token);
    localStorage.setItem("refresh_token", response.refresh_token);
    localStorage.setItem("token_expires_at", expiresAt.toString());
    localStorage.setItem("user", JSON.stringify(response.me));
    localStorage.setItem("permissions", JSON.stringify(response.permissions));

    return {
      user: response.me,
      tokens,
      permissions: response.permissions,
    };
  };

  const refreshToken = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const { user, tokens, permissions } = await refreshTokenFromStorage();
      dispatch({
        type: "REFRESH_SUCCESS",
        payload: { user, tokens, permissions },
      });
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      dispatch({ type: "LOGOUT" });
      localStorage.clear();
      throw error;
    }
  };

  const logout = () => {
    localStorage.clear();
    dispatch({ type: "LOGOUT" });
  };

  const contextValue: AuthContextType = {
    user: state.user,
    tokens: state.tokens,
    permissions: state.permissions,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
