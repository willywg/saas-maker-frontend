import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MemberCard } from './MemberCard';
import { useMembers } from '@/hooks/useMembers';
import type { MemberResponse } from '@/types/api';

interface MemberListProps {
  onChangeRole: (member: MemberResponse) => void;
  onRemove: (member: MemberResponse) => void;
}

export function MemberList({ onChangeRole, onRemove }: MemberListProps) {
  const { members, isLoading } = useMembers();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">Aún no hay miembros</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Invita miembros al equipo para colaborar en tu organización.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort members: owners first, then admins, then members
  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { owner: 0, admin: 1, member: 2 };
    const orderA = roleOrder[a.role as keyof typeof roleOrder] ?? 3;
    const orderB = roleOrder[b.role as keyof typeof roleOrder] ?? 3;
    return orderA - orderB;
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sortedMembers.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          onChangeRole={onChangeRole}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
