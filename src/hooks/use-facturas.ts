'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as facturaService from '@/services/factura-service';
import type { UpdateFacturaInput } from '@/types/factura';

export function useFacturas() {
  return useQuery({
    queryKey: queryKeys.facturasAll,
    queryFn: facturaService.listFacturas,
  });
}

export function useIngestFactura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => facturaService.ingestFacturaFile(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.facturasAll });
      qc.invalidateQueries({ queryKey: queryKeys.revisionQueue });
      qc.invalidateQueries({ queryKey: queryKeys.proveedores });
    },
  });
}

export function useUpdateFactura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateFacturaInput;
    }) => facturaService.updateFactura(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.facturasAll });
      qc.invalidateQueries({ queryKey: queryKeys.proveedores });
    },
  });
}

export function useDeleteFactura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => facturaService.deleteFactura(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.facturasAll });
      qc.invalidateQueries({ queryKey: queryKeys.revisionQueue });
      qc.invalidateQueries({ queryKey: queryKeys.proveedores });
      qc.invalidateQueries({ queryKey: queryKeys.vencimientosAll });
    },
  });
}
