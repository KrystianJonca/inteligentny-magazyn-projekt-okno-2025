import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import App from './App.tsx';
import { ProtectedRoute } from './components/router/ProtectedRoute.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import './index.css';
import { AuthPage } from './pages/AuthPage.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<ProtectedRoute />}>
            {/* Nested routes under ProtectedRoute will only be accessible if authenticated */}
            <Route index element={<App />} />{' '}
            {/* App is now the index route of the protected path */}
            {/* Add other protected routes here as needed */}
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
