'use client';

import { useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useAvisosPendientes } from '@/hooks/use-avisos';
import { useRevisionPendientes } from '@/hooks/use-revision';
import { filterAvisosPorRol } from '@/lib/notificaciones/filter-por-rol';
import { canAccess } from '@/types/roles';

/** Total de notificaciones pendientes visibles para el rol actual. */
export function useNotificationCount(): number {
  const { user } = useAuth();
  const role = user?.role;
  const { data: avisos } = useAvisosPendientes();
  const { data: revisionItems } = useRevisionPendientes();

  return useMemo(() => {
    if (!role) return 0;

    let count = 0;

    if (canAccess(role, 'avisos') && avisos) {
      count += filterAvisosPorRol(avisos, role).length;
    }

    if (canAccess(role, 'revision') && revisionItems) {
      count += revisionItems.length;
    }

    return count;
  }, [role, avisos, revisionItems]);
}
