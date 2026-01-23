import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Copy, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  FormDescription,
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
import type { InviteResponse } from '@/types/api';

const inviteMemberSchema = z.object({
  email: z.string().email('Por favor ingresa un correo electrónico válido'),
  role: z.enum(['admin', 'member'], {
    message: 'Por favor selecciona un rol',
  }),
});

type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roleLabels: Record<string, string> = {
  member: 'Miembro',
  admin: 'Administrador',
};

export function InviteMemberDialog({
  open,
  onOpenChange,
}: InviteMemberDialogProps) {
  const { inviteMember, isInviting } = useMembers();
  const [inviteResult, setInviteResult] = useState<InviteResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  const handleSubmit = async (data: InviteMemberFormData) => {
    try {
      const result = await inviteMember(data);
      setInviteResult(result);
      toast.success('Enlace de invitación creado exitosamente');
    } catch {
      toast.error('Error al crear la invitación');
    }
  };

  // Build invite URL using current domain (not backend's hardcoded URL)
  const getInviteUrl = () => {
    if (!inviteResult) return '';
    return `${window.location.origin}/invite/${inviteResult.token}`;
  };

  const handleCopyLink = async () => {
    if (!inviteResult) return;

    try {
      await navigator.clipboard.writeText(getInviteUrl());
      setCopied(true);
      toast.success('Enlace copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Error al copiar el enlace');
    }
  };

  const handleClose = () => {
    form.reset();
    setInviteResult(null);
    setCopied(false);
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    } else {
      onOpenChange(open);
    }
  };

  // Show invite link result
  if (inviteResult) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="h-5 w-5 text-primary" />
              Enlace de Invitación Creado
            </DialogTitle>
            <DialogDescription>
              Comparte este enlace con <span className="font-medium">{inviteResult.email}</span> para invitarlo como {roleLabels[inviteResult.role] || inviteResult.role}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground mb-2">URL de Invitación</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm break-all bg-background rounded px-2 py-1 border">
                  {getInviteUrl()}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Este enlace solo puede usarse una vez</p>
              <p>• Expira: {new Date(inviteResult.expires_at).toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleCopyLink}>
                {copied ? '¡Copiado!' : 'Copiar Enlace'}
              </Button>
              <Button onClick={handleClose}>
                Listo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show invite form
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invitar Miembro</DialogTitle>
          <DialogDescription>
            Crea un enlace de invitación para compartir con un nuevo miembro del equipo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="miembro@ejemplo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    El correo electrónico del nuevo miembro.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
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
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isInviting}>
                {isInviting ? 'Creando...' : 'Crear Enlace de Invitación'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
