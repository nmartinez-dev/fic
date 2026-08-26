import { createClient } from '@/lib/supabase/client';
import type { GastoPorRubro, RubroConAlias } from '@/types/rubro';

export async function listRubrosConAlias(): Promise<RubroConAlias[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rubros')
    .select('id, nombre, created_at, rubro_alias(id, rubro_id, alias, created_at)')
    .order('nombre');
  if (error) throw new Error(error.message);

  const [facturasMap, ventasMap] = await Promise.all([
    countByRubro('facturas'),
    countByRubro('ventas'),
  ]);

  return ((data ?? []) as unknown as RubroConAlias[]).map((r) => ({
    ...r,
    facturas_count: facturasMap.get(r.id) ?? 0,
    ventas_count: ventasMap.get(r.id) ?? 0,
  }));
}

export async function listGastoPorRubro(): Promise<GastoPorRubro[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('v_gasto_por_rubro')
    .select('*')
    .order('total', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as GastoPorRubro[];
}

export async function createRubro(nombre: string): Promise<{ id: string; nombre: string }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rubros')
    .insert({ nombre })
    .select('id, nombre')
    .single();
  if (error) throw new Error(error.message);
  return data as { id: string; nombre: string };
}

export async function addAliasRubro(
  rubroId: string,
  alias: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('rubro_alias')
    .insert({ rubro_id: rubroId, alias });
  if (error) throw new Error(error.message);
}

/** Fusiona el rubro `origen` dentro de `destino` (RPC atómica). */
export async function mergeRubros(
  origen: string,
  destino: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc('merge_rubros', {
    p_origen: origen,
    p_destino: destino,
  });
  if (error) throw new Error(error.message);
}

export async function updateRubro(id: string, nombre: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('rubros')
    .update({ nombre: nombre.trim() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteRubro(id: string): Promise<void> {
  const supabase = createClient();

  const { count: facturasCount, error: fErr } = await supabase
    .from('facturas')
    .select('id', { count: 'exact', head: true })
    .eq('rubro_id', id);
  if (fErr) throw new Error(fErr.message);

  const { count: ventasCount, error: vErr } = await supabase
    .from('ventas')
    .select('id', { count: 'exact', head: true })
    .eq('rubro_id', id);
  if (vErr) throw new Error(vErr.message);

  if ((facturasCount ?? 0) > 0 || (ventasCount ?? 0) > 0) {
    throw new Error(
      'Este rubro tiene facturas o ventas asociadas. Fusionalo con otro antes de eliminarlo.'
    );
  }

  const { error } = await supabase.from('rubros').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

async function countByRubro(
  table: 'facturas' | 'ventas'
): Promise<Map<string, number>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(table)
    .select('rubro_id')
    .not('rubro_id', 'is', null);
  if (error) throw new Error(error.message);

  const map = new Map<string, number>();
  for (const row of data ?? []) {
    const id = row.rubro_id as string;
    map.set(id, (map.get(id) ?? 0) + 1);
  }
  return map;
}
