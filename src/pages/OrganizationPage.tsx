import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationDetails } from '@/components/features/organization/OrganizationDetails';
import { OrganizationFormDialog } from '@/components/features/organization/OrganizationFormDialog';
import { MemberList } from '@/components/features/organization/MemberList';
import { InviteMemberDialog } from '@/components/features/organization/InviteMemberDialog';
import { ChangeMemberRoleDialog } from '@/components/features/organization/ChangeMemberRoleDialog';
import { RemoveMemberDialog } from '@/components/features/organization/RemoveMemberDialog';
import { useAuth } from '@/hooks/useAuth';
import type { MemberResponse } from '@/types/api';

export function OrganizationPage() {
  const { user } = useAuth();
  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';

  const [editOrgOpen, setEditOrgOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberResponse | null>(null);
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  const handleChangeRole = (member: MemberResponse) => {
    setSelectedMember(member);
    setChangeRoleOpen(true);
  };

  const handleRemove = (member: MemberResponse) => {
    setSelectedMember(member);
    setRemoveOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Organización</h1>
        <p className="text-muted-foreground">
          Administra la configuración de tu organización y equipo
        </p>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          {isAdminOrOwner && (
            <TabsTrigger value="members">Miembros</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <OrganizationDetails onEdit={() => setEditOrgOpen(true)} />
        </TabsContent>

        {isAdminOrOwner && (
          <TabsContent value="members" className="mt-6 space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setInviteOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invitar Miembro
              </Button>
            </div>
            <MemberList
              onChangeRole={handleChangeRole}
              onRemove={handleRemove}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Dialogs */}
      <OrganizationFormDialog
        open={editOrgOpen}
        onOpenChange={setEditOrgOpen}
      />

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />

      <ChangeMemberRoleDialog
        open={changeRoleOpen}
        onOpenChange={(open) => {
          setChangeRoleOpen(open);
          if (!open) setSelectedMember(null);
        }}
        member={selectedMember}
      />

      <RemoveMemberDialog
        open={removeOpen}
        onOpenChange={(open) => {
          setRemoveOpen(open);
          if (!open) setSelectedMember(null);
        }}
        member={selectedMember}
      />
    </div>
  );
}
