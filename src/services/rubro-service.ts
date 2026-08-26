import { createClient } from '@/lib/supabase/client';
import type { GastoPorRubro, RubroConAlias } from '@/types/rubro';

export async function listRubrosConAlias(): Promise<RubroConAlias[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rubros')
    .select('id, nombre, created_at, rubro_alias(id, rubro_id, alias, created_at)')
    .order('nombre');
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as RubroConAlias[];
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

export async function createRubro(nombre: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('rubros').insert({ nombre });
  if (error) throw new Error(error.message);
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
