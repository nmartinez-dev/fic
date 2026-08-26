'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as ventaService from '@/services/venta-service';

export function useVentas() {
  return useQuery({
    queryKey: queryKeys.ventasAll,
    queryFn: ventaService.listVentas,
  });
}
