import { NavLink } from 'react-router';
import { LayoutDashboard, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/api';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  minRole?: UserRole;
}

const navItems: NavItem[] = [
  { label: 'Panel Principal', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Organización', path: '/organization', icon: Building2, minRole: 'admin' },
];

const roleHierarchy: Record<UserRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
};

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { user } = useAuth();

  const filteredItems = navItems.filter((item) => {
    if (!item.minRole) return true;
    if (!user) return false;
    const userRoleLevel = roleHierarchy[user.role as UserRole] ?? 0;
    return userRoleLevel >= roleHierarchy[item.minRole];
  });

  return (
    <nav className="flex flex-col gap-1 p-4">
      {filteredItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )
          }
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
