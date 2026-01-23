import { Calendar, Edit2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';

interface OrganizationDetailsProps {
  onEdit: () => void;
}

export function OrganizationDetails({ onEdit }: OrganizationDetailsProps) {
  const { organization, isLoading } = useOrganization();
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!organization) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Error al cargar los detalles de la organización
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{organization.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="font-mono text-xs">
                  {organization.slug}
                </Badge>
                <Badge variant={organization.is_active ? 'default' : 'destructive'}>
                  {organization.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </CardDescription>
            </div>
          </div>
          {isOwner && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit2 className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Creado: {formatDate(organization.created_at)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Actualizado: {formatDate(organization.updated_at)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
