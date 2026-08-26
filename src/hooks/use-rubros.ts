'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as rubroService from '@/services/rubro-service';

export function useRubrosConAlias() {
  return useQuery({
    queryKey: queryKeys.rubros,
    queryFn: rubroService.listRubrosConAlias,
  });
}

export function useGastoPorRubro() {
  return useQuery({
    queryKey: [...queryKeys.rubros, 'gasto'],
    queryFn: rubroService.listGastoPorRubro,
  });
}

function useRubroMutation<Args>(fn: (args: Args) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.rubros });
      qc.invalidateQueries({ queryKey: queryKeys.facturasAll });
    },
  });
}

export function useCreateRubro() {
  return useRubroMutation<string>((nombre) =>
    rubroService.createRubro(nombre).then(() => undefined)
  );
}

export function useAddAliasRubro() {
  return useRubroMutation<{ rubroId: string; alias: string }>(({ rubroId, alias }) =>
    rubroService.addAliasRubro(rubroId, alias)
  );
}

export function useMergeRubros() {
  return useRubroMutation<{ origen: string; destino: string }>(({ origen, destino }) =>
    rubroService.mergeRubros(origen, destino)
  );
}

export function useUpdateRubro() {
  return useRubroMutation<{ id: string; nombre: string }>(({ id, nombre }) =>
    rubroService.updateRubro(id, nombre)
  );
}

export function useDeleteRubro() {
  return useRubroMutation<string>((id) => rubroService.deleteRubro(id));
}
