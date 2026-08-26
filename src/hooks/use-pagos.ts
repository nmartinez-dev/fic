'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as pagoService from '@/services/pago-service';
import type { NuevoPago } from '@/types/pago';

export function usePagosByFactura(facturaId: string | null) {
  return useQuery({
    queryKey: ['pagos', facturaId ?? 'none'],
    queryFn: () => pagoService.listPagosByFactura(facturaId as string),
    enabled: !!facturaId,
  });
}

export function useCreatePago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NuevoPago) => pagoService.createPago(input),
    onSuccess: (_data, input) => {
      qc.invalidateQueries({ queryKey: queryKeys.facturasAll });
      qc.invalidateQueries({ queryKey: ['pagos', input.factura_id] });
      qc.invalidateQueries({ queryKey: queryKeys.proveedorCuentaCorriente('all') });
    },
  });
}
