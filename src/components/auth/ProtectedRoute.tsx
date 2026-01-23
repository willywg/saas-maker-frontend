import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const roleHierarchy: Record<UserRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
};

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user) {
    const userRoleLevel = roleHierarchy[user.role as UserRole] ?? 0;
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      return (
        <div className="flex min-h-svh items-center justify-center">
          <div className="text-destructive">Access Denied - Insufficient permissions</div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
