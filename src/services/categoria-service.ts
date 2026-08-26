import { createClient } from '@/lib/supabase/client';
import type { CategoriaConAlias, GastoPorCategoria } from '@/types/categoria';

type RubroAliasRow = {
  id: string;
  rubro_id: string;
  alias: string;
  created_at: string;
};

type RubroRow = {
  id: string;
  nombre: string;
  created_at: string;
  rubro_alias: RubroAliasRow[];
};

function mapCategoria(row: RubroRow): CategoriaConAlias {
  return {
    id: row.id,
    nombre: row.nombre,
    created_at: row.created_at,
    categoria_alias: (row.rubro_alias ?? []).map((a) => ({
      id: a.id,
      categoria_id: a.rubro_id,
      alias: a.alias,
      created_at: a.created_at,
    })),
  };
}

export async function listCategoriasConAlias(): Promise<CategoriaConAlias[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rubros')
    .select('id, nombre, created_at, rubro_alias(id, rubro_id, alias, created_at)')
    .order('nombre');
  if (error) throw new Error(error.message);

  const [facturasMap, ventasMap] = await Promise.all([
    countByCategoria('facturas'),
    countByCategoria('ventas'),
  ]);

  return ((data ?? []) as unknown as RubroRow[]).map((r) => ({
    ...mapCategoria(r),
    facturas_count: facturasMap.get(r.id) ?? 0,
    ventas_count: ventasMap.get(r.id) ?? 0,
  }));
}

export async function listGastoPorCategoria(): Promise<GastoPorCategoria[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('v_gasto_por_rubro')
    .select('*')
    .order('total', { ascending: false });
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    categoria_id: row.rubro_id as string | null,
    categoria: row.rubro as string,
    facturas: row.facturas as number,
    total: row.total as number,
  }));
}

export async function createCategoria(
  nombre: string
): Promise<{ id: string; nombre: string }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rubros')
    .insert({ nombre })
    .select('id, nombre')
    .single();
  if (error) throw new Error(error.message);
  return data as { id: string; nombre: string };
}

export async function addAliasCategoria(
  categoriaId: string,
  alias: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('rubro_alias')
    .insert({ rubro_id: categoriaId, alias });
  if (error) throw new Error(error.message);
}

/** Fusiona la categoría `origen` dentro de `destino` (RPC atómica). */
export async function mergeCategorias(
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

export async function updateCategoria(id: string, nombre: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('rubros')
    .update({ nombre: nombre.trim() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteCategoria(id: string): Promise<void> {
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
      'Esta categoría tiene facturas o ventas asociadas. Fusionala con otra antes de eliminarla.'
    );
  }

  const { error } = await supabase.from('rubros').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

async function countByCategoria(
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
