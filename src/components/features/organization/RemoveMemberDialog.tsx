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
import { useMembers } from '@/hooks/useMembers';
import { toast } from 'sonner';
import type { MemberResponse } from '@/types/api';

interface RemoveMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberResponse | null;
}

export function RemoveMemberDialog({
  open,
  onOpenChange,
  member,
}: RemoveMemberDialogProps) {
  const { removeMember, isRemoving } = useMembers();

  const handleConfirm = async () => {
    if (!member) return;

    try {
      await removeMember(member.id);
      toast.success('Miembro eliminado exitosamente');
      onOpenChange(false);
    } catch {
      toast.error('Error al eliminar el miembro');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Miembro</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar a{' '}
            <span className="font-medium text-foreground">
              {member?.full_name || member?.email}
            </span>{' '}
            de la organización? Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isRemoving}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isRemoving ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
