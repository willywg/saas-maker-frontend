import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMembers } from '@/hooks/useMembers';
import { toast } from 'sonner';
import type { MemberResponse } from '@/types/api';

const changeRoleSchema = z.object({
  role: z.enum(['owner', 'admin', 'member'], {
    message: 'Por favor selecciona un rol',
  }),
});

type ChangeRoleFormData = z.infer<typeof changeRoleSchema>;

interface ChangeMemberRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberResponse | null;
}

export function ChangeMemberRoleDialog({
  open,
  onOpenChange,
  member,
}: ChangeMemberRoleDialogProps) {
  const { changeRole, isChangingRole } = useMembers();

  const form = useForm<ChangeRoleFormData>({
    resolver: zodResolver(changeRoleSchema),
    defaultValues: {
      role: (member?.role as 'owner' | 'admin' | 'member') || 'member',
    },
  });

  // Reset form when member changes
  useEffect(() => {
    if (member && open) {
      form.reset({
        role: member.role as 'owner' | 'admin' | 'member',
      });
    }
  }, [member, open, form]);

  const handleSubmit = async (data: ChangeRoleFormData) => {
    if (!member) return;

    try {
      await changeRole({ userId: member.id, data: { role: data.role } });
      toast.success('Rol del miembro actualizado exitosamente');
      onOpenChange(false);
    } catch {
      toast.error('Error al actualizar el rol del miembro');
    }
  };

  const selectedRole = form.watch('role');
  const isPromotingToOwner = selectedRole === 'owner' && member?.role !== 'owner';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cambiar Rol del Miembro</DialogTitle>
          <DialogDescription>
            Actualizar el rol de {member?.full_name || member?.email}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nuevo Rol</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="member">
                        <div className="flex flex-col">
                          <span>Miembro</span>
                          <span className="text-xs text-muted-foreground">
                            Puede ver y crear contenido
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex flex-col">
                          <span>Administrador</span>
                          <span className="text-xs text-muted-foreground">
                            Puede gestionar configuración e invitar miembros
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="owner">
                        <div className="flex flex-col">
                          <span>Propietario</span>
                          <span className="text-xs text-muted-foreground">
                            Control total sobre la organización
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isPromotingToOwner && (
              <div className="flex items-start gap-2 rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                <p className="text-yellow-700 dark:text-yellow-400">
                  Promover a este miembro a Propietario le dará control total sobre
                  la organización, incluyendo la capacidad de eliminar a otros propietarios.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isChangingRole || member?.role === selectedRole}
              >
                {isChangingRole ? 'Actualizando...' : 'Actualizar Rol'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
