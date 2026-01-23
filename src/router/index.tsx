import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { AcceptInvitePage } from '@/pages/AcceptInvitePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { OrganizationPage } from '@/pages/OrganizationPage';

export const router = createBrowserRouter([
  // Public routes (auth pages)
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  // Accept invite page (public, standalone layout)
  {
    path: '/invite/:token',
    element: <AcceptInvitePage />,
  },
  // Protected routes with AppLayout
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <DashboardPage /> },
      {
        path: '/organization',
        element: (
          <ProtectedRoute requiredRole="admin">
            <OrganizationPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
