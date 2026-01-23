import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">SaaS Template</h1>
          <p className="text-muted-foreground">Tu plataforma de gestion</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
