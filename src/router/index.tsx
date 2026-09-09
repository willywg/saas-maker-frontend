import { createBrowserRouter, Navigate } from 'react-router';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { AcceptInvitePage } from '@/pages/AcceptInvitePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { OrganizationPage } from '@/pages/OrganizationPage';
import { AccountPage } from '@/pages/AccountPage';

export const router = createBrowserRouter([
  // Public routes (auth pages)
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password/:token', element: <ResetPasswordPage /> },
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
      { path: '/account', element: <AccountPage /> },
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
