'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as precioService from '@/services/precio-service';

export function usePrecios() {
  return useQuery({
    queryKey: queryKeys.precios,
    queryFn: precioService.listPrecios,
  });
}

export function useSyncPrecios() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: precioService.syncPreciosNow,
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.precios });
      qc.invalidateQueries({ queryKey: queryKeys.avisos });
      qc.invalidateQueries({ queryKey: queryKeys.avisosPendientes });
    },
  });
}
