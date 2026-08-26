'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { syncAvisosVentas } from '@/lib/ventas/sync-avisos';
import { queryKeys } from '@/lib/query-keys';
import * as ventaService from '@/services/venta-service';

export function useVentas() {
  return useQuery({
    queryKey: queryKeys.ventasAll,
    queryFn: ventaService.listVentas,
  });
}

export function useSyncAvisosVentas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => syncAvisosVentas(createClient()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.avisos });
      qc.invalidateQueries({ queryKey: queryKeys.avisosPendientes });
    },
  });
}
