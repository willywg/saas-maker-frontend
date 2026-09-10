import type { ProjectStatus } from '@/types/api';

export const projectStatusLabels: Record<ProjectStatus, string> = {
  draft: 'Borrador',
  active: 'Activo',
  done: 'Terminado',
};

export const projectStatuses = Object.keys(projectStatusLabels) as ProjectStatus[];
