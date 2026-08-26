'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useAvisosRealtime } from '@/hooks/use-avisos';
import { useSyncAvisosOrdenes } from '@/hooks/use-ordenes';
import { useSyncAvisosVencimientos } from '@/hooks/use-vencimientos';
import { useSyncAvisosVentas } from '@/hooks/use-ventas';
import { canAccess } from '@/types/roles';

/**
 * Sincroniza avisos al usar el dashboard y mantiene Realtime activo.
 * Montado una vez en el shell, no en páginas sueltas.
 */
export function NotificationSyncRunner() {
  const { user } = useAuth();
  const role = user?.role;
  const synced = useRef(false);

  useAvisosRealtime();

  const syncOrdenes = useSyncAvisosOrdenes();
  const syncVencimientos = useSyncAvisosVencimientos();
  const syncVentas = useSyncAvisosVentas();

  useEffect(() => {
    if (!role || synced.current) return;
    synced.current = true;

    if (canAccess(role, 'ordenes')) {
      syncOrdenes.mutate();
    }
    if (canAccess(role, 'vencimientos')) {
      syncVencimientos.mutate();
    }
    if (canAccess(role, 'ventas')) {
      syncVentas.mutate();
    }
  }, [role, syncOrdenes, syncVencimientos, syncVentas]);

  return null;
}
