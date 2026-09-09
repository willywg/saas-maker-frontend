import { screen, waitFor } from '@testing-library/react';
import { Route } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { VerifyEmailPage } from './VerifyEmailPage';

const verifyEmail = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ verifyEmail, isAuthenticated: false }),
}));

function renderAt(path: string) {
  return renderWithProviders(<VerifyEmailPage />, {
    route: path,
    path: '/verify-email/:token',
    extraRoutes: <Route path="/login" element={<div>login page</div>} />,
  });
}

describe('VerifyEmailPage', () => {
  it('confirms the email with the token from the URL', async () => {
    verifyEmail.mockResolvedValueOnce({ message: 'Tu correo quedó confirmado' });
    renderAt('/verify-email/abc123');
    await waitFor(() => expect(screen.getByText('Tu correo quedó confirmado')).toBeInTheDocument());
    expect(screen.getByText('Correo confirmado')).toBeInTheDocument();
    expect(verifyEmail).toHaveBeenCalledWith({ token: 'abc123' });
    expect(screen.getByRole('button', { name: /iniciar sesi/i })).toBeInTheDocument();
  });

  it('shows the backend error when the token is invalid', async () => {
    verifyEmail.mockRejectedValueOnce({
      response: { data: { detail: 'Enlace de verificación inválido o expirado' } },
    });
    renderAt('/verify-email/bad');
    await waitFor(() =>
      expect(screen.getByText('Enlace de verificación inválido o expirado')).toBeInTheDocument()
    );
    expect(screen.getByText('Enlace inválido')).toBeInTheDocument();
  });
});
