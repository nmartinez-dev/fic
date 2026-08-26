'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as ordenService from '@/services/orden-service';
import type { EstadoOrden, NuevaOrden } from '@/types/orden';

export function useOrdenes() {
  return useQuery({
    queryKey: queryKeys.ordenesCompraAll,
    queryFn: ordenService.listOrdenes,
  });
}

export function useCreateOrden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NuevaOrden) => ordenService.createOrden(input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.ordenesCompraAll }),
  });
}

export function useUpdateEstadoOrden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoOrden }) =>
      ordenService.updateEstadoOrden(id, estado),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.ordenesCompraAll }),
  });
}
