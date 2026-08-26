'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Bell, CheckCircle2, ChevronRight, Inbox } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useAvisosPendientes, useResolverAviso } from '@/hooks/use-avisos';
import { useNotificationCount } from '@/hooks/use-notification-count';
import { useRevisionPendientes } from '@/hooks/use-revision';
import {
  hrefForAviso,
  TIPO_CLS,
  TIPO_LABEL,
} from '@/lib/notificaciones/aviso-meta';
import { filterAvisosPorRol } from '@/lib/notificaciones/filter-por-rol';
import { formatDate } from '@/lib/format';
import { canAccess } from '@/types/roles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconTooltip } from '@/components/ui/icon-button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Aviso } from '@/types/aviso';

function AvisoItem({
  aviso,
  onResolve,
  resolving,
}: {
  aviso: Aviso;
  onResolve: (id: string) => void;
  resolving: boolean;
}) {
  return (
    <div className="flex gap-3 border-b px-3 py-3 last:border-b-0">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className={cn('text-xs', TIPO_CLS[aviso.tipo])}>
            {TIPO_LABEL[aviso.tipo]}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDate(aviso.fecha)}
          </span>
        </div>
        <p className="text-sm font-medium leading-snug">{aviso.titulo}</p>
        {aviso.cuerpo && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {aviso.cuerpo}
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild size="xs" variant="outline">
            <Link href={hrefForAviso(aviso)}>Ver</Link>
          </Button>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            disabled={resolving}
            onClick={() => onResolve(aviso.id)}
          >
            <CheckCircle2 className="size-3" />
            Resolver
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NotificationsMenu() {
  const { user } = useAuth();
  const role = user?.role;
  const [open, setOpen] = useState(false);
  const { data: avisos, isLoading } = useAvisosPendientes();
  const { data: revisionItems } = useRevisionPendientes();
  const resolver = useResolverAviso();
  const totalCount = useNotificationCount();

  const puedeAvisos = role ? canAccess(role, 'avisos') : false;
  const puedeRevision = role ? canAccess(role, 'revision') : false;

  const avisosFiltrados = useMemo(
    () =>
      role && avisos && puedeAvisos ? filterAvisosPorRol(avisos, role) : [],
    [avisos, role, puedeAvisos]
  );

  const revisionCount = puedeRevision ? (revisionItems?.length ?? 0) : 0;

  if (!puedeAvisos && !puedeRevision) return null;

  const handleResolve = (id: string) => {
    toast.promise(resolver.mutateAsync(id), {
      loading: 'Resolviendo…',
      success: 'Aviso resuelto.',
      error: (e) => (e as Error).message,
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <IconTooltip label="Notificaciones">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="relative"
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
            {totalCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white">
                {totalCount > 9 ? '9+' : totalCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
      </IconTooltip>

      <PopoverContent align="end" className="w-96 p-0">
        <div className="border-b px-4 py-3">
          <p className="font-medium">Notificaciones</p>
          <p className="text-xs text-muted-foreground">
            Pendientes que requieren atención
          </p>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {puedeRevision && revisionCount > 0 && (
            <Link
              href="/dashboard/revision"
              className="flex items-center gap-3 border-b bg-muted/30 px-3 py-3 transition-colors hover:bg-muted/50"
              onClick={() => setOpen(false)}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background">
                <Inbox className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {revisionCount}{' '}
                  {revisionCount === 1 ? 'item en revisión' : 'items en revisión'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Facturas o datos que necesitan una decisión
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          )}

          {puedeAvisos && isLoading && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Cargando…
            </p>
          )}

          {puedeAvisos && !isLoading && avisosFiltrados.length === 0 && revisionCount === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No hay notificaciones pendientes.
            </p>
          )}

          {puedeAvisos &&
            avisosFiltrados.map((aviso) => (
              <AvisoItem
                key={aviso.id}
                aviso={aviso}
                onResolve={handleResolve}
                resolving={resolver.isPending}
              />
            ))}
        </div>

        {puedeAvisos && (
          <div className="border-t p-2">
            <Button asChild variant="ghost" className="w-full justify-center" size="sm">
              <Link href="/dashboard/avisos" onClick={() => setOpen(false)}>
                Ver todos los avisos
              </Link>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
