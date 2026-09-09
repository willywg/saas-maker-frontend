import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import type { ApiError } from '@/types/api';

type Status = 'verifying' | 'success' | 'error';

export function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const { verifyEmail, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'error');
  const [message, setMessage] = useState(token ? '' : 'No se proporcionó un token de verificación');
  const calledRef = useRef(false);

  useEffect(() => {
    if (!token || calledRef.current) return;
    calledRef.current = true;
    verifyEmail({ token })
      .then((result) => {
        setStatus('success');
        setMessage(result.message);
      })
      .catch((err: AxiosError<ApiError>) => {
        setStatus('error');
        setMessage(err.response?.data?.detail || 'El enlace es inválido o ha expirado');
      });
  }, [token, verifyEmail]);

  if (status === 'verifying') {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Confirmando tu correo...
        </CardContent>
      </Card>
    );
  }

  const isSuccess = status === 'success';

  return (
    <Card>
      <CardHeader>
        <div
          className={
            isSuccess
              ? 'mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'
              : 'mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10'
          }
        >
          {isSuccess ? (
            <CheckCircle2 className="h-6 w-6 text-primary" />
          ) : (
            <AlertCircle className="h-6 w-6 text-destructive" />
          )}
        </div>
        <CardTitle className="text-center">
          {isSuccess ? 'Correo confirmado' : 'Enlace inválido'}
        </CardTitle>
        <CardDescription className="text-center">{message}</CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col gap-3 justify-center">
        {isSuccess ? (
          <Link to={isAuthenticated ? '/dashboard' : '/login'}>
            <Button>{isAuthenticated ? 'Ir al panel' : 'Iniciar sesión'}</Button>
          </Link>
        ) : (
          <>
            <p className="text-center text-sm text-muted-foreground">
              Inicia sesión y usa "Reenviar correo" para recibir un enlace nuevo.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
