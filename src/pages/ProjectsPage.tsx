import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProjectList } from '@/components/features/projects/ProjectList';
import { ProjectFormDialog } from '@/components/features/projects/ProjectFormDialog';
import { DeleteProjectDialog } from '@/components/features/projects/DeleteProjectDialog';
import { projectStatusLabels, projectStatuses } from '@/components/features/projects/status';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { useProjects } from '@/hooks/useProjects';
import type { ProjectResponse, ProjectStatus } from '@/types/api';

const ALL_STATUSES = 'all';

/**
 * Reference page for a tenant-scoped resource: toolbar (search, filter, primary
 * action for admin+), list with four states, and create/edit/delete dialogs.
 */
export function ProjectsPage() {
  const { user } = useAuth();
  const canWrite = user?.role === 'admin' || user?.role === 'owner';

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProjectStatus | typeof ALL_STATUSES>(ALL_STATUSES);
  const [page, setPage] = useState(1);
  const q = useDebounce(search.trim(), 300);

  const { projects, total, pageSize, isLoading, error, refetch } = useProjects({
    q: q || undefined,
    status: status === ALL_STATUSES ? undefined : status,
    page,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<ProjectResponse | null>(null);

  const openCreate = () => {
    setSelected(null);
    setFormOpen(true);
  };
  const openEdit = (project: ProjectResponse) => {
    setSelected(project);
    setFormOpen(true);
  };
  const openDelete = (project: ProjectResponse) => {
    setSelected(project);
    setDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Proyectos</h1>
          <p className="text-muted-foreground">Los proyectos de {user?.organization_name}</p>
        </div>
        {canWrite && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo proyecto
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre"
            aria-label="Buscar proyectos"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as ProjectStatus | typeof ALL_STATUSES);
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-44" aria-label="Filtrar por estado">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUSES}>Todos los estados</SelectItem>
            {projectStatuses.map((value) => (
              <SelectItem key={value} value={value}>
                {projectStatusLabels[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ProjectList
        projects={projects}
        total={total}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        error={error}
        canWrite={canWrite}
        hasFilters={Boolean(q) || status !== ALL_STATUSES}
        onPageChange={setPage}
        onEdit={openEdit}
        onDelete={openDelete}
        onRetry={() => void refetch()}
        onCreate={openCreate}
      />

      <ProjectFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setSelected(null);
        }}
        project={selected}
      />
      <DeleteProjectDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setSelected(null);
        }}
        project={selected}
      />
    </div>
  );
}
