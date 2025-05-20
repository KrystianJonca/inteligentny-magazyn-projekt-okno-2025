import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { loginUser as apiLoginUser, registerUser as apiRegisterUser } from '@/api/auth';
import type { LoginPayload, UserCreate, Token, UserRead } from '@/api/schema.types';

const TOKEN_KEY = 'authToken';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (loginData: LoginPayload) => void; // Will be a mutation trigger
  register: (
    userData: UserCreate,
    options?: {
      onSuccess?: (data: UserRead) => void;
      onError?: (error: Error) => void;
    }
  ) => void; // Will be a mutation trigger
  logout: () => void;
  // Expose mutation states
  isLoggingIn: boolean;
  loginError: Error | null;
  isRegistering: boolean;
  registerError: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Get QueryClient instance

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    // When token changes, we might want to refetch user-specific queries
    // For now, this is fine.
    queryClient.invalidateQueries(); // Invalidate all queries on auth change
  }, [token, queryClient]);

  const loginMutation = useMutation<Token, Error, LoginPayload>({
    mutationFn: apiLoginUser,
    onSuccess: data => {
      setToken(data.access_token);
      navigate('/');
    },
  });

  const registerMutation = useMutation<
    UserRead,
    Error,
    UserCreate,
    { onSuccess?: (data: UserRead) => void; onError?: (error: Error) => void }
  >({
    mutationFn: apiRegisterUser,
    onSuccess: (data, _variables, context) => {
      if (context?.onSuccess) {
        context.onSuccess(data);
      }
    },
    onError: (error, _variables, context) => {
      if (context?.onError) {
        context.onError(error);
      }
    },
  });

  const logout = () => {
    setToken(null);
    navigate('/auth');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        login: loginMutation.mutate, // Expose the mutate function
        isLoggingIn: loginMutation.isPending,
        loginError: loginMutation.error,
        register: (userData, options) => registerMutation.mutate(userData, options),
        isRegistering: registerMutation.isPending,
        registerError: registerMutation.error,
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
