'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useAvisosPendientes } from '@/hooks/use-avisos';
import { navItemsForRole } from '@/lib/nav';
import { filterAvisosPorRol } from '@/lib/notificaciones/filter-por-rol';
import { cn } from '@/lib/utils';

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: avisosPendientes } = useAvisosPendientes();

  if (!user?.role) return null;

  const items = navItemsForRole(user.role);
  const avisosCount =
    user.role && avisosPendientes
      ? filterAvisosPorRol(avisosPendientes, user.role).length
      : 0;

  return (
    <nav className="scrollbar-styled flex gap-1 overflow-x-auto px-4 sm:px-6">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const showBadge = item.area === 'avisos' && avisosCount > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors',
              active
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
            {showBadge && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white">
                {avisosCount > 9 ? '9+' : avisosCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
