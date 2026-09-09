import { MailWarning } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

/** Shown on every app page until the user confirms their email address. */
export function EmailVerificationBanner() {
  const { user, resendVerification, isResendingVerification } = useAuth();

  if (!user || user.email_verified) return null;

  const handleResend = async () => {
    try {
      const result = await resendVerification();
      toast.success(result.message);
    } catch {
      toast.error('No se pudo reenviar el correo. Intenta de nuevo en unos minutos.');
    }
  };

  return (
    <div
      role="status"
      className="flex flex-col gap-2 border-b bg-secondary px-4 py-2 text-sm sm:flex-row sm:items-center sm:justify-between lg:px-6"
    >
      <span className="flex items-center gap-2 text-secondary-foreground">
        <MailWarning className="h-4 w-4 shrink-0 text-primary" />
        Confirma tu correo <strong>{user.email}</strong> para activar todas las funciones.
      </span>
      <Button variant="outline" size="sm" onClick={handleResend} disabled={isResendingVerification}>
        {isResendingVerification ? 'Enviando...' : 'Reenviar correo'}
      </Button>
    </div>
  );
}
