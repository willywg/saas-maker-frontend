import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const roleLabels: Record<string, string> = {
  member: 'Miembro',
  admin: 'Administrador',
  owner: 'Propietario',
};

const profileSchema = z.object({
  full_name: z.string().min(1, 'El nombre es requerido').max(100),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'La contraseña actual es requerida'),
    new_password: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
    confirm_password: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm_password'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export function AccountPage() {
  const {
    user,
    updateProfile,
    isUpdatingProfile,
    changePassword,
    isChangingPassword,
    logoutAll,
    isLoggingOutAll,
  } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: user?.full_name || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setProfileMessage(null);
    try {
      await updateProfile({ full_name: data.full_name });
      setProfileMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setProfileMessage({ type: 'error', text: msg || 'Error al actualizar el perfil' });
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordMessage(null);
    try {
      await changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      setPasswordMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
      passwordForm.reset();
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setPasswordMessage({ type: 'error', text: msg || 'Error al cambiar la contraseña' });
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Mi Cuenta</h1>
        <p className="text-muted-foreground">Administra tu perfil y seguridad</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Tu información personal</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              {profileMessage && (
                <div className={`rounded-md p-3 text-sm ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-destructive/10 text-destructive'}`}>
                  {profileMessage.text}
                </div>
              )}

              <FormField
                control={profileForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Correo electrónico</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Rol</p>
                  <p className="text-sm text-muted-foreground">
                    {roleLabels[user?.role || ''] || user?.role}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Organización</p>
                  <p className="text-sm text-muted-foreground">{user?.organization_name}</p>
                </div>
              </div>

              <Button type="submit" disabled={isUpdatingProfile || !profileForm.formState.isDirty}>
                {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle>Cambiar Contraseña</CardTitle>
          <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              {passwordMessage && (
                <div className={`rounded-md p-3 text-sm ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-destructive/10 text-destructive'}`}>
                  {passwordMessage.text}
                </div>
              )}

              <FormField
                control={passwordForm.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña actual</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Tu contraseña actual"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Mínimo 8 caracteres"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar nueva contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Repite la nueva contraseña"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cambiar Contraseña
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Sessions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Sesiones</CardTitle>
          <CardDescription>
            Cierra la sesión en todos los dispositivos donde hayas iniciado sesión, incluido este.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => logoutAll().catch(() => undefined)}
            disabled={isLoggingOutAll}
          >
            {isLoggingOutAll && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cerrar sesión en todos los dispositivos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
