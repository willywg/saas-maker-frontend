import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import type { ValidateResetTokenResponse } from '@/types/api';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types/api';

const resetSchema = z
  .object({
    new_password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirm_password: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm_password'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const { resetPassword, isResettingPassword } = useAuth();
  const calledRef = useRef(false);

  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { new_password: '', confirm_password: '' },
  });

  useEffect(() => {
    if (!token || calledRef.current) return;
    calledRef.current = true;

    apiClient
      .get<ValidateResetTokenResponse>(`/auth/reset-password/${token}`)
      .then((res) => {
        setTokenValid(true);
        setMaskedEmail(res.data.email);
      })
      .catch(() => {
        setTokenError('El enlace es inválido o ha expirado');
      })
      .finally(() => setValidating(false));
  }, [token]);

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-center">Enlace inválido</CardTitle>
          <CardDescription className="text-center">
            No se proporcionó un token de recuperación
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3 justify-center">
          <Link to="/forgot-password">
            <Button variant="outline">Solicitar nuevo enlace</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  const onSubmit = async (data: ResetFormData) => {
    if (!token) return;
    setSubmitError('');
    try {
      await resetPassword({ token, new_password: data.new_password });
      navigate('/login', { state: { passwordReset: true } });
    } catch (err) {
      const message =
        (err as AxiosError<ApiError>).response?.data?.detail ||
        'Error al restablecer la contraseña';
      setSubmitError(message);
    }
  };

  if (validating) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Validando enlace...
        </CardContent>
      </Card>
    );
  }

  if (!tokenValid) {
    return (
      <Card>
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-center">Enlace inválido</CardTitle>
          <CardDescription className="text-center">
            {tokenError}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3 justify-center">
          <Link to="/forgot-password">
            <Button variant="outline">Solicitar nuevo enlace</Button>
          </Link>
          <Link to="/login" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Nueva contraseña</CardTitle>
        <CardDescription className="text-center">
          Ingresa una nueva contraseña para <strong>{maskedEmail}</strong>
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {submitError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {submitError}
              </div>
            )}
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
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
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirm(!showConfirm)}
                      >
                        {showConfirm ? (
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-6">
            <Button type="submit" className="w-full" disabled={isResettingPassword}>
              {isResettingPassword ? 'Restableciendo...' : 'Restablecer contraseña'}
            </Button>
            <Link to="/login" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
