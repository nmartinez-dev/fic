'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as facturaService from '@/services/factura-service';

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
    },
  });
}
