'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { syncAvisosOrdenesPendientes } from '@/lib/ordenes/sync-avisos';
import { queryKeys } from '@/lib/query-keys';
import * as ordenService from '@/services/orden-service';
import type { EstadoOrden, NuevaOrden, UpdateOrdenInput } from '@/types/orden';

export function useOrdenes() {
  return useQuery({
    queryKey: queryKeys.ordenesCompraAll,
    queryFn: ordenService.listOrdenes,
  });
}

export function useSyncAvisosOrdenes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => syncAvisosOrdenesPendientes(createClient()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.avisos });
      qc.invalidateQueries({ queryKey: queryKeys.avisosPendientes });
    },
  });
}

export function useCreateOrden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NuevaOrden) => ordenService.createOrden(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.ordenesCompraAll });
    },
  });
}

export function useUpdateOrden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOrdenInput }) =>
      ordenService.updateOrden(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.ordenesCompraAll });
    },
  });
}

export function useDeleteOrden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordenService.deleteOrden(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.ordenesCompraAll });
      qc.invalidateQueries({ queryKey: queryKeys.avisos });
      qc.invalidateQueries({ queryKey: queryKeys.avisosPendientes });
    },
  });
}

export function useUploadOrdenArchivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      ordenService.uploadOrdenArchivo(id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.ordenesCompraAll });
    },
  });
}

export function useUpdateEstadoOrden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoOrden }) =>
      ordenService.updateEstadoOrden(id, estado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.ordenesCompraAll });
      qc.invalidateQueries({ queryKey: queryKeys.avisos });
      qc.invalidateQueries({ queryKey: queryKeys.avisosPendientes });
    },
  });
}
