import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { loginUser as apiLoginUser, registerUser as apiRegisterUser } from '@/api/auth';
import type { LoginPayload, UserCreate, Token, UserRead } from '@/api/schema.types';

export const TOKEN_KEY = 'authToken';

// Exported handler for unauthorized access
export const handleUnauthorizedAccess = () => {
  localStorage.removeItem(TOKEN_KEY);
  // Optionally clear other persisted states if any
  window.location.href = '/auth'; // Force reload to auth page
};

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
    queryClient.invalidateQueries();
  }, [token, queryClient]);

  const loginMutation = useMutation<Token, Error, LoginPayload>({
    mutationFn: apiLoginUser,
    onSuccess: data => {
      setToken(data.access_token);
      navigate('/');
      toast.success('Login successful!');
    },
    onError: error => {
      toast.error(`Login failed: ${error.message}`);
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
      toast.success('Registration successful! You can now log in.');
      if (context?.onSuccess) {
        context.onSuccess(data);
      }
    },
    onError: (error, _variables, context) => {
      toast.error(`Registration failed: ${error.message}`);
      if (context?.onError) {
        context.onError(error);
      }
    },
  });

  const logout = () => {
    setToken(null); // This will trigger the useEffect to remove from localStorage
    // navigate('/auth'); // The navigate call is now in handleUnauthorizedAccess or can be called directly if preferred
    handleUnauthorizedAccess(); // Centralize logout logic
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
