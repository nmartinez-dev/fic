'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { Role } from '@/types/roles';
import {
  fetchDashboardOperativo,
  fetchDashboardVentas,
} from '@/services/dashboard-service';

export function useDashboardOperativo(enabled: boolean) {
  return useQuery({
    queryKey: [...queryKeys.dashboard, 'operativo'],
    queryFn: fetchDashboardOperativo,
    enabled,
  });
}

export function useDashboardVentas(enabled: boolean) {
  return useQuery({
    queryKey: [...queryKeys.dashboard, 'ventas'],
    queryFn: fetchDashboardVentas,
    enabled,
  });
}

export function isDashboardOperativoRole(role: Role | null | undefined): boolean {
  return role === 'admin' || role === 'compras';
}
