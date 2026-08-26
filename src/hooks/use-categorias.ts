'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { queryKeys } from '@/lib/query-keys';
import * as categoriaService from '@/services/categoria-service';

export function useCategoriasConAlias() {
  const { user } = useAuth();
  const soloConsulta = user?.role === 'ventas';

  return useQuery({
    queryKey: [...queryKeys.categorias, soloConsulta ? 'consulta' : 'full'],
    queryFn: () =>
      categoriaService.listCategoriasConAlias({ skipFacturas: soloConsulta }),
  });
}

export function useGastoPorCategoria() {
  const { user } = useAuth();
  const soloConsulta = user?.role === 'ventas';

  return useQuery({
    queryKey: [...queryKeys.categorias, 'gasto'],
    queryFn: categoriaService.listGastoPorCategoria,
    enabled: !soloConsulta,
  });
}

function useCategoriaMutation<Args>(fn: (args: Args) => Promise<void>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.categorias });
      qc.invalidateQueries({ queryKey: queryKeys.facturasAll });
    },
  });
}

export function useCreateCategoria() {
  return useCategoriaMutation<string>((nombre) =>
    categoriaService.createCategoria(nombre).then(() => undefined)
  );
}

export function useAddAliasCategoria() {
  return useCategoriaMutation<{ categoriaId: string; alias: string }>(
    ({ categoriaId, alias }) => categoriaService.addAliasCategoria(categoriaId, alias)
  );
}

export function useDeleteAliasCategoria() {
  return useCategoriaMutation<string>((aliasId) =>
    categoriaService.deleteAliasCategoria(aliasId)
  );
}

export function useMergeCategorias() {
  return useCategoriaMutation<{ origen: string; destino: string }>(
    ({ origen, destino }) => categoriaService.mergeCategorias(origen, destino)
  );
}

export function useUpdateCategoria() {
  return useCategoriaMutation<{ id: string; nombre: string }>(({ id, nombre }) =>
    categoriaService.updateCategoria(id, nombre)
  );
}

export function useDeleteCategoria() {
  return useCategoriaMutation<string>((id) => categoriaService.deleteCategoria(id));
}
