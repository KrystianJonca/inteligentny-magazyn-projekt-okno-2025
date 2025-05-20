import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import type { components } from '@/api/types';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegistrationForm } from '@/components/auth/RegistrationForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  // Error state local to the page, to display form submission errors
  const [pageError, setPageError] = useState<string | null>(null);
  const {
    login,
    register,
    isLoading: authIsLoading,
    error: authError,
    isAuthenticated,
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Effect to clear pageError if authError changes (e.g. global error from context)
  useEffect(() => {
    if (authError) {
      setPageError(authError);
    }
  }, [authError]);

  const handleLoginSubmit = async (data: components['schemas']['Body_login_auth_login_post']) => {
    setPageError(null); // Clear previous page-specific errors
    try {
      await login(data);
      // Navigation is handled by the AuthContext or the useEffect above
    } catch (err) {
      // AuthContext throws error, so we can catch it here to display in the form
      setPageError(err instanceof Error ? err.message : 'An unknown error occurred during login.');
    }
  };

  const handleRegisterSubmit = async (data: components['schemas']['UserCreate']) => {
    setPageError(null); // Clear previous page-specific errors
    try {
      await register(data);
      // After successful registration, show a message and switch to login view
      setIsLoginView(true);
      setPageError('Registration successful! Please log in.');
    } catch (err) {
      setPageError(
        err instanceof Error ? err.message : 'An unknown error occurred during registration.'
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        {pageError && (
          <Alert
            variant={pageError.startsWith('Registration successful') ? 'default' : 'destructive'}
            className="mb-4"
          >
            <AlertTitle>
              {pageError.startsWith('Registration successful') ? 'Success' : 'Error'}
            </AlertTitle>
            <AlertDescription>{pageError}</AlertDescription>
          </Alert>
        )}
        {isLoginView ? (
          <LoginForm onSubmit={handleLoginSubmit} isLoading={authIsLoading} />
        ) : (
          <RegistrationForm onSubmit={handleRegisterSubmit} isLoading={authIsLoading} />
        )}
        <Card className="mt-4">
          <CardContent>
            <div className="text-center">
              {isLoginView ? "Don't have an account?" : 'Already have an account?'}
              <Button
                variant="link"
                onClick={() => {
                  setIsLoginView(!isLoginView);
                  setPageError(null); // Clear errors when switching views
                }}
                className="ml-1"
                disabled={authIsLoading}
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
