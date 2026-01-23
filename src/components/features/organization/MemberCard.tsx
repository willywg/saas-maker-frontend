import { MoreHorizontal, UserCog, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { MemberResponse } from '@/types/api';
import { useAuth } from '@/hooks/useAuth';

interface MemberCardProps {
  member: MemberResponse;
  onChangeRole: (member: MemberResponse) => void;
  onRemove: (member: MemberResponse) => void;
}

const roleBadgeVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  owner: 'default',
  admin: 'secondary',
  member: 'outline',
};

const roleLabels: Record<string, string> = {
  owner: 'Propietario',
  admin: 'Administrador',
  member: 'Miembro',
};

export function MemberCard({ member, onChangeRole, onRemove }: MemberCardProps) {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const isCurrentUser = user?.id === member.id;

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(member.full_name, member.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">
                  {member.full_name || member.email.split('@')[0]}
                </p>
                {isCurrentUser && (
                  <Badge variant="outline" className="text-xs">
                    Tú
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {member.email}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Se unió el {formatDate(member.joined_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={roleBadgeVariants[member.role] || 'outline'}>
              {roleLabels[member.role] || member.role}
            </Badge>

            {isOwner && !isCurrentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Abrir menú</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onChangeRole(member)}>
                    <UserCog className="mr-2 h-4 w-4" />
                    Cambiar Rol
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onRemove(member)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {!member.is_active && (
              <Badge variant="destructive" className="ml-2">
                Inactivo
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
