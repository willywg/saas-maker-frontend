import { useNavigate } from 'react-router';
import { Building2, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useUserOrganizations } from '@/hooks/useUserOrganizations';
import { cn } from '@/lib/utils';

const roleLabels: Record<string, string> = {
  member: 'Miembro',
  admin: 'Administrador',
  owner: 'Propietario',
};

/**
 * Shows the current organization. When the user belongs to more than one,
 * it becomes a dropdown to switch the session to another organization.
 */
export function OrganizationSwitcher() {
  const { user } = useAuth();
  const { organizations, switchOrganization, isSwitching } = useUserOrganizations();
  const navigate = useNavigate();

  const currentName = user?.organization_name ?? 'Organización';

  if (organizations.length <= 1) {
    return (
      <div className="flex min-w-0 items-center gap-2 px-3 text-sm font-semibold">
        <Building2 className="h-4 w-4 shrink-0 text-primary" />
        <span className="truncate">{currentName}</span>
      </div>
    );
  }

  const handleSwitch = async (organizationId: string, name: string) => {
    if (organizationId === user?.organization_id) return;
    try {
      await switchOrganization(organizationId);
      toast.success(`Ahora estás en ${name}`);
      navigate('/dashboard');
    } catch {
      toast.error('No se pudo cambiar de organización');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-3 font-semibold"
          disabled={isSwitching}
          aria-label="Cambiar de organización"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{currentName}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Organizaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleSwitch(org.id, org.name)}
            className={cn('flex items-center justify-between gap-2', org.is_current && 'bg-accent')}
          >
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm">{org.name}</span>
              <span className="text-xs text-muted-foreground">
                {roleLabels[org.role] ?? org.role}
              </span>
            </span>
            {org.is_current && <Check className="h-4 w-4 shrink-0 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
