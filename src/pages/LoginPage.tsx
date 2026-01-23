import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
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
import { useAuth } from '@/hooks/useAuth';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types/api';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn, loginError } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  // Extract error message from API error
  const errorMessage = loginError
    ? (loginError as AxiosError<ApiError>).response?.data?.detail || 'Error al iniciar sesión'
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Iniciar Sesión</CardTitle>
        <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {errorMessage}
              </div>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="tu@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
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
                        <span className="sr-only">
                          {showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-6">
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
            <p className="text-sm text-muted-foreground">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Registrarse
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
