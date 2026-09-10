import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useProjects } from '@/hooks/useProjects';
import type { ProjectResponse } from '@/types/api';

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectResponse | null;
}

export function DeleteProjectDialog({ open, onOpenChange, project }: DeleteProjectDialogProps) {
  const { deleteProject, isDeleting } = useProjects();

  const handleConfirm = async () => {
    if (!project) return;
    try {
      await deleteProject(project.id);
      toast.success('Proyecto eliminado');
      onOpenChange(false);
    } catch {
      toast.error('No se pudo eliminar el proyecto');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar proyecto</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará{' '}
            <span className="font-medium text-foreground">{project?.name}</span> para toda la
            organización. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
