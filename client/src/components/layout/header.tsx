'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Settings, Menu } from 'lucide-react';
import { Role } from '@/types';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './sidebar';

export function Header() {
  const { user, logout, hasRole } = useAuth();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" />}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menú</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar userRole={user?.role} />
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="lg:hidden">
          <span className="text-xl font-bold">CBI</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-9 w-9 rounded-full" />}>
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <div className="flex items-center gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{user?.name || 'Usuario'}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/dashboard/profile" className="flex items-center" />}>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            {hasRole(Role.ADMIN) && (
              <DropdownMenuItem render={<Link href="/dashboard/admin" className="flex items-center" />}>
                <Settings className="mr-2 h-4 w-4" />
                Administración
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="flex items-center text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
