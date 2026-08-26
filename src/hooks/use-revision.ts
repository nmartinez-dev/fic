'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as revisionService from '@/services/revision-service';
import type { RevisionItem } from '@/types/revision';

export function useRevisionPendientes() {
  return useQuery({
    queryKey: queryKeys.revisionPendientes,
    queryFn: revisionService.listPendientes,
  });
}

function useRevisionMutation<T>(
  fn: (item: RevisionItem, arg: T) => Promise<void>
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ item, arg }: { item: RevisionItem; arg: T }) =>
      fn(item, arg),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.revisionQueue });
      qc.invalidateQueries({ queryKey: queryKeys.facturasAll });
      qc.invalidateQueries({ queryKey: queryKeys.proveedores });
      qc.invalidateQueries({ queryKey: queryKeys.rubros });
    },
  });
}

export function useAsignarProveedor() {
  return useRevisionMutation<string>((item, proveedorId) =>
    revisionService.asignarProveedor(item, proveedorId)
  );
}

export function useCrearYAsignarProveedor() {
  return useRevisionMutation<string>((item, nombre) =>
    revisionService.crearYAsignarProveedor(item, nombre)
  );
}

export function useConfirmarDuplicado() {
  return useRevisionMutation<void>((item) =>
    revisionService.confirmarDuplicado(item)
  );
}

export function useNoEsDuplicado() {
  return useRevisionMutation<void>((item) =>
    revisionService.noEsDuplicado(item)
  );
}

export function useDescartarRevision() {
  return useRevisionMutation<void>((item) => revisionService.descartar(item));
}

export function useAsignarRubro() {
  return useRevisionMutation<string>((item, rubroId) =>
    revisionService.asignarRubro(item, rubroId)
  );
}

export function useCrearYAsignarRubro() {
  return useRevisionMutation<string>((item, nombre) =>
    revisionService.crearYAsignarRubro(item, nombre)
  );
}

export function useDescartarRubro() {
  return useRevisionMutation<void>((item) => revisionService.descartarRubro(item));
}
