'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Users,
  GraduationCap,
  UserCheck,
  MessageSquare,
  DollarSign,
  Settings,
  BookOpen,
  Footprints,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Eventos',
    href: '/dashboard/eventos',
    icon: Calendar,
  },
  {
    title: 'Profesores',
    href: '/dashboard/profesores',
    icon: GraduationCap,
  },
  {
    title: 'Servicio Social',
    href: '/dashboard/servicio-social',
    icon: Users,
  },
  {
    title: 'Asistencia',
    href: '/dashboard/asistencia',
    icon: UserCheck,
  },
  {
    title: 'Visitantes',
    href: '/dashboard/visitantes',
    icon: Footprints,
  },
  {
    title: 'Foro',
    href: '/dashboard/foro',
    icon: MessageSquare,
  },
  {
    title: 'Finanzas',
    href: '/dashboard/finanzas',
    icon: DollarSign,
  },
  {
    title: 'Biblia',
    href: '/dashboard/biblia',
    icon: BookOpen,
  },
  {
    title: 'Admin',
    href: '/dashboard/admin',
    icon: Settings,
    roles: ['ADMIN'],
  },
];

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole || '');
  });

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold">CBI</span>
          <span className="text-sm text-muted-foreground">Iglesia</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
