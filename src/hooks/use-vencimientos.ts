'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { syncAvisosVencimientos } from '@/lib/vencimientos/sync-avisos';
import { queryKeys } from '@/lib/query-keys';
import * as vencimientoService from '@/services/vencimiento-service';
import * as reciboService from '@/services/recibo-service';
import type { EstadoVencimiento, NuevoVencimiento } from '@/types/vencimiento';

export function useVencimientos() {
  return useQuery({
    queryKey: queryKeys.vencimientosAll,
    queryFn: vencimientoService.listVencimientos,
  });
}

/**
 * Suscripción Realtime al calendario. Cuando otra persona crea, mueve o paga
 * un vencimiento, refrescamos la lista sin que el usuario tenga que recargar.
 * Devuelve `true` mientras el canal está conectado.
 */
export function useVencimientosRealtime(): boolean {
  const qc = useQueryClient();
  const [live, setLive] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('vencimientos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vencimientos' },
        () => {
          qc.invalidateQueries({ queryKey: queryKeys.vencimientosAll });
        }
      )
      .subscribe((status) => {
        setLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return live;
}

export function useSyncAvisosVencimientos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => syncAvisosVencimientos(createClient()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.avisos });
      qc.invalidateQueries({ queryKey: queryKeys.avisosPendientes });
    },
  });
}

function useVencimientoMutation<Args>(fn: (args: Args) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.vencimientosAll }),
  });
}

export function useCreateVencimiento() {
  return useVencimientoMutation<NuevoVencimiento>((input) =>
    vencimientoService.createVencimiento(input)
  );
}

export function useMoverVencimiento() {
  return useVencimientoMutation<{ id: string; fecha: string }>(({ id, fecha }) =>
    vencimientoService.moverVencimiento(id, fecha)
  );
}

export function useSetEstadoVencimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoVencimiento }) =>
      vencimientoService.setEstadoVencimiento(id, estado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.vencimientosAll });
      qc.invalidateQueries({ queryKey: queryKeys.avisos });
      qc.invalidateQueries({ queryKey: queryKeys.avisosPendientes });
    },
  });
}

export function useGenerarRecibo() {
  return useVencimientoMutation<string>((facturaId) =>
    reciboService.generarRecibo(facturaId)
  );
}
