import { FolderKanban, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import type { ProjectResponse } from '@/types/api';

interface ProjectListProps {
  projects: ProjectResponse[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: unknown;
  canWrite: boolean;
  hasFilters: boolean;
  onPageChange: (page: number) => void;
  onEdit: (project: ProjectResponse) => void;
  onDelete: (project: ProjectResponse) => void;
  onRetry: () => void;
  onCreate: () => void;
}

const dateFormatter = new Intl.DateTimeFormat('es', { dateStyle: 'medium' });

/**
 * Reference list view. Implements the four states from DESIGN.md → States:
 * loading (skeleton rows), error (inline + "Reintentar"), empty, populated.
 */
export function ProjectList({
  projects,
  total,
  page,
  pageSize,
  isLoading,
  error,
  canWrite,
  hasFilters,
  onPageChange,
  onEdit,
  onDelete,
  onRetry,
  onCreate,
}: ProjectListProps) {
  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
          <p className="text-sm text-destructive">No se pudieron cargar los proyectos.</p>
          <Button variant="outline" onClick={onRetry}>
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isLoading && projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FolderKanban className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">
            {hasFilters ? 'Sin resultados' : 'Aún no hay proyectos'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFilters
              ? 'Prueba con otro nombre o estado.'
              : 'Crea el primer proyecto de tu organización.'}
          </p>
          {canWrite && !hasFilters && (
            <Button className="mt-4" onClick={onCreate}>
              Nuevo proyecto
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Card className="py-0">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden sm:table-cell">Estado</TableHead>
            <TableHead className="hidden md:table-cell">Creado</TableHead>
            {canWrite && <TableHead className="w-12" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  {canWrite && <TableCell />}
                </TableRow>
              ))
            : projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="font-medium">{project.name}</div>
                    {project.description && (
                      <div className="line-clamp-1 text-sm text-muted-foreground">
                        {project.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <ProjectStatusBadge status={project.status} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {dateFormatter.format(new Date(project.created_at))}
                  </TableCell>
                  {canWrite && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Acciones de ${project.name}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(project)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(project)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 border-t px-4 py-3 text-sm text-muted-foreground">
          <span className="tabular-nums">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </Card>
  );
}
