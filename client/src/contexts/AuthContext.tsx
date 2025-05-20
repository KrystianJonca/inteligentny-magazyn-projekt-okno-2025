import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { loginUser as apiLoginUser, registerUser as apiRegisterUser } from '@/api/auth';
import type { components } from '@/api/types';

const TOKEN_KEY = 'authToken';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (loginData: components['schemas']['Body_login_auth_login_post']) => Promise<void>;
  register: (userData: components['schemas']['UserCreate']) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(false); // For context operations
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  const login = async (loginData: components['schemas']['Body_login_auth_login_post']) => {
    setIsLoading(true);
    setError(null);
    try {
      const tokenData = await apiLoginUser(loginData);
      setToken(tokenData.access_token);
      navigate('/');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred during login.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: components['schemas']['UserCreate']) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiRegisterUser(userData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred during registration.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    navigate('/auth');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        isLoading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
