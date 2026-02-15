import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { getToken, setToken, removeToken, apiFetch, API_ENDPOINTS } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  upiId: string;
  walletBalance: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setAuthError: (error: string | null) => void;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isAuthenticated = !!token;

  // Check existing token on mount
  useEffect(() => {
    const existingToken = getToken();
    if (existingToken) {
      setTokenState(existingToken);
      // Validate the token by fetching the profile from the backend
      apiFetch(API_ENDPOINTS.auth.me)
        .then((res: any) => {
          setUser({
            id: res._id,
            name: res.name,
            email: res.email,
            upiId: res.upiId,
            walletBalance: res.walletBalance
          });
        })
        .catch(() => {
          removeToken();
          setTokenState(null);
        });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const response = await apiFetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }) as any;

      if (!response || !response.token) throw new Error('Invalid response from server');

      setToken(response.token);
      setTokenState(response.token);
      setUser({
        id: response._id,
        name: response.name,
        email: response.email,
        upiId: response.upiId,
        walletBalance: response.walletBalance
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setAuthError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout, authError, setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
