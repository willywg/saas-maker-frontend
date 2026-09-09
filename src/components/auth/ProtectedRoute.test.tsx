import { screen } from '@testing-library/react';
import { Route } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { ProtectedRoute } from './ProtectedRoute';

const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => mockUseAuth() }));

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: undefined, isLoading: false, isAuthenticated: false });
    renderWithProviders(
      <ProtectedRoute>
        <div>secret</div>
      </ProtectedRoute>,
      { route: '/dashboard', extraRoutes: <Route path="/login" element={<div>login page</div>} /> }
    );
    expect(screen.getByText('login page')).toBeInTheDocument();
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'member' },
      isLoading: false,
      isAuthenticated: true,
    });
    renderWithProviders(
      <ProtectedRoute>
        <div>secret</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('secret')).toBeInTheDocument();
  });

  it('blocks users below the required role', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'member' },
      isLoading: false,
      isAuthenticated: true,
    });
    renderWithProviders(
      <ProtectedRoute requiredRole="admin">
        <div>admin only</div>
      </ProtectedRoute>
    );
    expect(screen.queryByText('admin only')).not.toBeInTheDocument();
    expect(screen.getByText(/Access Denied/)).toBeInTheDocument();
  });
});
