import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "@/lib/query-client";

const AUTH_TOKEN_KEY = "@scireason_auth_token";
const AUTH_USER_KEY = "@scireason_auth_user";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const [savedToken, savedUser] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(AUTH_USER_KEY),
      ]);

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        
        try {
          const response = await fetch(`${getApiUrl()}/api/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          
          if (!response.ok) {
            await clearAuthState();
          }
        } catch {
          console.log("Failed to validate token, keeping local state");
        }
      }
    } catch (error) {
      console.error("Failed to load auth state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthState = async () => {
    await Promise.all([
      AsyncStorage.removeItem(AUTH_TOKEN_KEY),
      AsyncStorage.removeItem(AUTH_USER_KEY),
    ]);
    setToken(null);
    setUser(null);
  };

  const saveAuthState = async (authToken: string, authUser: User) => {
    await Promise.all([
      AsyncStorage.setItem(AUTH_TOKEN_KEY, authToken),
      AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser)),
    ]);
    setToken(authToken);
    setUser(authUser);
  };

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", { email, password });
      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      await saveAuthState(data.token, data.user);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  const register = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiRequest("POST", "/api/auth/register", { email, password });
      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }

      await saveAuthState(data.token, data.user);
      return { success: true };
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await clearAuthState();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function getApiUrl(): string {
  if (process.env.EXPO_PUBLIC_DOMAIN) {
    return `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
  }
  return "http://localhost:5000";
}
