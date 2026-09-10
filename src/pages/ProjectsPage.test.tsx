import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { ProjectsPage } from './ProjectsPage';
import type { ProjectResponse } from '@/types/api';

const mockUser = vi.fn();
const mockProjects = vi.fn();
const createProject = vi.fn().mockResolvedValue({});
const deleteProject = vi.fn().mockResolvedValue(undefined);

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser() }),
}));
vi.mock('@/hooks/useProjects', () => ({
  useProjects: () => ({
    projects: mockProjects(),
    total: mockProjects().length,
    page: 1,
    pageSize: 20,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    createProject,
    isCreating: false,
    updateProject: vi.fn(),
    isUpdating: false,
    deleteProject,
    isDeleting: false,
  }),
}));

const owner = { organization_name: 'Acme Corp', role: 'owner' };
const member = { organization_name: 'Acme Corp', role: 'member' };

const project: ProjectResponse = {
  id: 'p1',
  name: 'Sitio web',
  description: 'Rediseño',
  status: 'active',
  created_by: 'u1',
  created_at: '2026-09-10T10:00:00',
  updated_at: '2026-09-10T10:00:00',
};

describe('ProjectsPage', () => {
  beforeEach(() => {
    mockUser.mockReturnValue(owner);
    mockProjects.mockReturnValue([project]);
    vi.clearAllMocks();
  });

  it('lists projects with their status', () => {
    renderWithProviders(<ProjectsPage />, { route: '/projects' });
    expect(screen.getByRole('heading', { name: 'Proyectos' })).toBeInTheDocument();
    expect(screen.getByText('Sitio web')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('shows the empty state with a call to action for admins', () => {
    mockProjects.mockReturnValue([]);
    renderWithProviders(<ProjectsPage />, { route: '/projects' });
    expect(screen.getByText('Aún no hay proyectos')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /nuevo proyecto/i })).toHaveLength(2);
  });

  it('hides write actions from members', () => {
    mockUser.mockReturnValue(member);
    renderWithProviders(<ProjectsPage />, { route: '/projects' });
    expect(screen.getByText('Sitio web')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /nuevo proyecto/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /acciones de/i })).not.toBeInTheDocument();
  });

  it('creates a project from the dialog', async () => {
    renderWithProviders(<ProjectsPage />, { route: '/projects' });
    await userEvent.click(screen.getByRole('button', { name: /nuevo proyecto/i }));
    await userEvent.type(screen.getByLabelText('Nombre'), 'App móvil');
    await userEvent.click(screen.getByRole('button', { name: 'Crear proyecto' }));
    expect(createProject).toHaveBeenCalledWith({
      name: 'App móvil',
      description: null,
      status: 'draft',
    });
  });

  it('asks for confirmation before deleting', async () => {
    renderWithProviders(<ProjectsPage />, { route: '/projects' });
    await userEvent.click(screen.getByRole('button', { name: 'Acciones de Sitio web' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: /eliminar/i }));
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(deleteProject).toHaveBeenCalledWith('p1');
  });
});
