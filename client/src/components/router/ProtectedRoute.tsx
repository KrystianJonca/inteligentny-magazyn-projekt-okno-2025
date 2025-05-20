import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />; // Render the child route components if authenticated
};
