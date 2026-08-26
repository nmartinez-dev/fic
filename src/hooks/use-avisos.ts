'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as avisoService from '@/services/aviso-service';

export function useAvisos() {
  return useQuery({
    queryKey: queryKeys.avisos,
    queryFn: avisoService.listAvisos,
  });
}

function useAvisoMutation(fn: (id: string) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.avisos }),
  });
}

export function useResolverAviso() {
  return useAvisoMutation(avisoService.resolverAviso);
}

export function useReabrirAviso() {
  return useAvisoMutation(avisoService.reabrirAviso);
}
