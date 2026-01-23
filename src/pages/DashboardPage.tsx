import { Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMembers } from '@/hooks/useMembers';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const roleLabels: Record<string, string> = {
  member: 'Miembro',
  admin: 'Administrador',
  owner: 'Propietario',
};

export function DashboardPage() {
  const { user } = useAuth();
  const { members, isLoading: membersLoading } = useMembers();

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Usuario';
  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel Principal</h1>
        <p className="text-muted-foreground">Bienvenido, {displayName}</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organización</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.organization_name}</div>
            <p className="text-xs text-muted-foreground">
              Tu rol: {roleLabels[user?.role || ''] || user?.role}
            </p>
          </CardContent>
        </Card>

        {isAdminOrOwner && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Miembros del Equipo</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {membersLoading ? '...' : members?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Miembros activos en tu organización
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tu Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium truncate">{user?.email}</div>
            <p className="text-xs text-muted-foreground">
              {user?.full_name || 'Sin nombre configurado'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle>Primeros Pasos</CardTitle>
          <CardDescription>
            Este es tu panel principal donde puedes gestionar tu plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Comienza explorando las funcionalidades disponibles. Si eres administrador o propietario,
            puedes gestionar tu organización y los miembros del equipo desde la página de Organización.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
