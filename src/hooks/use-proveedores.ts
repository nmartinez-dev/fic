'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as proveedorService from '@/services/proveedor-service';

export function useProveedores() {
  return useQuery({
    queryKey: queryKeys.proveedores,
    queryFn: proveedorService.listProveedores,
  });
}

export function useCuentaCorriente() {
  return useQuery({
    queryKey: queryKeys.proveedorCuentaCorriente('all'),
    queryFn: proveedorService.listCuentaCorriente,
  });
}
