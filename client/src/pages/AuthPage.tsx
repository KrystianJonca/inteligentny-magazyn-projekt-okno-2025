import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import type { LoginPayload, UserCreate } from '@/api/schema.types';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegistrationForm } from '@/components/auth/RegistrationForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [pageMessage, setPageMessage] = useState<string | null>(null); // For success/error messages
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');

  const {
    login,
    isLoggingIn,
    loginError,
    register,
    isRegistering,
    registerError,
    isAuthenticated,
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (loginError) {
      setPageMessage(loginError.message);
      setMessageType('error');
    }
  }, [loginError]);

  useEffect(() => {
    if (registerError) {
      setPageMessage(registerError.message);
      setMessageType('error');
    }
  }, [registerError]);

  const handleLoginSubmit = async (data: LoginPayload) => {
    setPageMessage(null);
    login(data); // Call the mutation trigger from context
    // Error and loading states are handled by the context and useEffects above
  };

  const handleRegisterSubmit = async (data: UserCreate) => {
    setPageMessage(null);
    register(data, {
      onSuccess: () => {
        setIsLoginView(true);
        setPageMessage('Registration successful! Please log in.');
        setMessageType('success');
      },
      onError: error => {
        setPageMessage(error.message);
        setMessageType('error');
      },
    });
  };

  const isLoading = isLoggingIn || isRegistering;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        {pageMessage && (
          <Alert variant={messageType === 'success' ? 'default' : 'destructive'} className="mb-4">
            <AlertTitle>{messageType === 'success' ? 'Success' : 'Error'}</AlertTitle>
            <AlertDescription>{pageMessage}</AlertDescription>
          </Alert>
        )}
        {isLoginView ? (
          <LoginForm onSubmit={handleLoginSubmit} isLoading={isLoading} />
        ) : (
          <RegistrationForm onSubmit={handleRegisterSubmit} isLoading={isLoading} />
        )}
        <Card className="mt-4">
          <CardContent>
            <div className="text-center">
              {isLoginView ? "Don't have an account?" : 'Already have an account?'}
              <Button
                variant="link"
                onClick={() => {
                  setIsLoginView(!isLoginView);
                  setPageMessage(null); // Clear messages when switching views
                }}
                className="ml-1"
                disabled={isLoading}
              >
                {isLoginView ? 'Register' : 'Login'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
