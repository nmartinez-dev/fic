'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query-keys';
import * as avisoService from '@/services/aviso-service';

const AVISOS_PENDIENTES_LIMIT = 10;

export function useAvisos() {
  return useQuery({
    queryKey: queryKeys.avisos,
    queryFn: avisoService.listAvisos,
  });
}

export function useAvisosPendientes() {
  return useQuery({
    queryKey: queryKeys.avisosPendientes,
    queryFn: () => avisoService.listAvisosPendientes(AVISOS_PENDIENTES_LIMIT),
  });
}

export function useAvisosRealtime(): boolean {
  const qc = useQueryClient();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('avisos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'avisos' },
        () => {
          qc.invalidateQueries({ queryKey: queryKeys.avisos });
          qc.invalidateQueries({ queryKey: queryKeys.avisosPendientes });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return true;
}

function useAvisoMutation(fn: (id: string) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.avisos });
      qc.invalidateQueries({ queryKey: queryKeys.avisosPendientes });
    },
  });
}

export function useResolverAviso() {
  return useAvisoMutation(avisoService.resolverAviso);
}

export function useReabrirAviso() {
  return useAvisoMutation(avisoService.reabrirAviso);
}
