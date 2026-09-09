import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { LoginPage } from './LoginPage';

const login = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ login, isLoggingIn: false, loginError: null }),
}));

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    renderWithProviders(<LoginPage />, { route: '/login' });
    expect(screen.getByPlaceholderText('tu@ejemplo.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('validates before submitting', async () => {
    renderWithProviders(<LoginPage />, { route: '/login' });
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesi/i }));
    expect(login).not.toHaveBeenCalled();
  });

  it('submits credentials', async () => {
    renderWithProviders(<LoginPage />, { route: '/login' });
    await userEvent.type(screen.getByPlaceholderText('tu@ejemplo.com'), 'a@b.co');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesi/i }));
    expect(login).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'a@b.co', password: 'secret123' })
    );
  });
});
