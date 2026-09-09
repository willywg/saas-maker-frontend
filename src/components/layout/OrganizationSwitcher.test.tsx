import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { OrganizationSwitcher } from './OrganizationSwitcher';

const switchOrganization = vi.fn().mockResolvedValue({});
const mockOrgs = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { organization_id: 'org-a', organization_name: 'Acme Corp', role: 'owner' },
  }),
}));
vi.mock('@/hooks/useUserOrganizations', () => ({
  useUserOrganizations: () => ({
    organizations: mockOrgs(),
    switchOrganization,
    isSwitching: false,
  }),
}));

describe('OrganizationSwitcher', () => {
  it('renders a static label when the user has a single organization', () => {
    mockOrgs.mockReturnValue([
      { id: 'org-a', name: 'Acme Corp', slug: 'acme', role: 'owner', is_current: true },
    ]);
    renderWithProviders(<OrganizationSwitcher />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('lists organizations and switches to another one', async () => {
    mockOrgs.mockReturnValue([
      { id: 'org-a', name: 'Acme Corp', slug: 'acme', role: 'owner', is_current: true },
      { id: 'org-b', name: 'Globex', slug: 'globex', role: 'admin', is_current: false },
    ]);
    renderWithProviders(<OrganizationSwitcher />);
    await userEvent.click(screen.getByRole('button', { name: /cambiar de organizaci/i }));
    await userEvent.click(await screen.findByText('Globex'));
    expect(switchOrganization).toHaveBeenCalledWith('org-b');
  });
});
