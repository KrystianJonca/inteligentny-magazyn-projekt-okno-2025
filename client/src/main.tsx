import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import App from './App.tsx';
import { ProtectedRoute } from './components/router/ProtectedRoute.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import './index.css';
import { AuthPage } from './pages/AuthPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { WarehousesPage } from './pages/WarehousesPage.tsx';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<ProtectedRoute />}>
              {/* App component is now the layout for protected routes */}
              <Route element={<App />}>
                <Route index element={<DashboardPage />} /> {/* Dashboard page for root */}
                <Route path="warehouses" element={<WarehousesPage />} />
                {/* Add other protected routes nested under App layout here */}
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
