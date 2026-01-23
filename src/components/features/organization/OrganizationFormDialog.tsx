import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from 'sonner';

const organizationFormSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  slug: z
    .string()
    .min(2, 'El identificador debe tener al menos 2 caracteres')
    .regex(
      /^[a-z0-9-]+$/,
      'El identificador solo puede contener letras minúsculas, números y guiones'
    ),
});

type OrganizationFormData = z.infer<typeof organizationFormSchema>;

interface OrganizationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationFormDialog({
  open,
  onOpenChange,
}: OrganizationFormDialogProps) {
  const { organization, updateOrganization, isUpdating } = useOrganization();

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: organization?.name || '',
      slug: organization?.slug || '',
    },
  });

  // Reset form when organization changes or dialog opens
  useEffect(() => {
    if (organization && open) {
      form.reset({
        name: organization.name,
        slug: organization.slug,
      });
    }
  }, [organization, open, form]);

  const handleSubmit = async (data: OrganizationFormData) => {
    try {
      await updateOrganization(data);
      toast.success('Organización actualizada exitosamente');
      onOpenChange(false);
    } catch {
      toast.error('Error al actualizar la organización');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Organización</DialogTitle>
          <DialogDescription>
            Actualiza los detalles de tu organización. El identificador se usa en las URLs.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Mi Organización" {...field} />
                  </FormControl>
                  <FormDescription>
                    El nombre visible de tu organización.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identificador</FormLabel>
                  <FormControl>
                    <Input placeholder="mi-organizacion" {...field} />
                  </FormControl>
                  <FormDescription>
                    Identificador para URLs. Solo letras minúsculas, números y guiones.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
