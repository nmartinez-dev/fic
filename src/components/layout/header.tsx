'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { NotificationsMenu } from '@/components/notificaciones/notifications-menu';
import { ChangePasswordDialog } from '@/components/layout/change-password-dialog';
import { Button } from '@/components/ui/button';
import { IconTooltip } from '@/components/ui/icon-button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROLE_LABEL } from '@/types/roles';
import { KeyRound, LogOut, User as UserIcon } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const confirmLogout = async () => {
    setLogoutOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="text-primary">Cordillera</span>
          <span className="hidden text-muted-foreground sm:inline">
            · Gestión
          </span>
        </div>

        <div className="flex items-center gap-2">
          {user?.role && (
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {ROLE_LABEL[user.role]}
            </Badge>
          )}
          <NotificationsMenu />
          <ThemeToggle />
          <DropdownMenu>
            <IconTooltip label="Cuenta">
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Cuenta">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
            </IconTooltip>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate">
                {user?.email ?? 'Sesión'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setPasswordOpen(true)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Cambiar contraseña
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setLogoutOpen(true);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ChangePasswordDialog
            open={passwordOpen}
            onOpenChange={setPasswordOpen}
          />
          <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
                <AlertDialogDescription>
                  Vas a salir del sistema. Podés volver a entrar cuando quieras
                  con tu email y contraseña.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmLogout}>
                  Cerrar sesión
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </header>
  );
}
