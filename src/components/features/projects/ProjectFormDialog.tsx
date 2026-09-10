import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { useProjects } from '@/hooks/useProjects';
import { projectStatusLabels, projectStatuses } from './status';
import type { ProjectResponse } from '@/types/api';

const projectFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  description: z.string().max(2000, 'Máximo 2000 caracteres'),
  status: z.enum(['draft', 'active', 'done']),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the dialog edits this project; otherwise it creates one. */
  project: ProjectResponse | null;
}

const emptyValues: ProjectFormData = { name: '', description: '', status: 'draft' };

export function ProjectFormDialog({ open, onOpenChange, project }: ProjectFormDialogProps) {
  const { createProject, isCreating, updateProject, isUpdating } = useProjects();
  const isEditing = project !== null;
  const isSaving = isCreating || isUpdating;

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      project
        ? { name: project.name, description: project.description ?? '', status: project.status }
        : emptyValues
    );
  }, [open, project, form]);

  const handleSubmit = async (data: ProjectFormData) => {
    const payload = { ...data, description: data.description.trim() || null };
    try {
      if (project) {
        await updateProject({ id: project.id, data: payload });
        toast.success('Proyecto actualizado');
      } else {
        await createProject(payload);
        toast.success('Proyecto creado');
      }
      onOpenChange(false);
    } catch {
      toast.error(isEditing ? 'No se pudo actualizar el proyecto' : 'No se pudo crear el proyecto');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar proyecto' : 'Nuevo proyecto'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Cambia el nombre, la descripción o el estado.'
              : 'Los proyectos solo son visibles para tu organización.'}
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
                    <Input placeholder="Rediseño del sitio web" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Opcional" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projectStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {projectStatusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Guardar cambios' : 'Crear proyecto'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
