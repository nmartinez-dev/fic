import { createClient } from '@/lib/supabase/client';
import type {
  Precio,
  PreciosListado,
  SyncPreciosResponse,
} from '@/types/precio';

export async function listPrecios(): Promise<PreciosListado> {
  const supabase = createClient();

  const { data: latestRow, error: latestErr } = await supabase
    .from('precios')
    .select('fecha_lista')
    .order('fecha_lista', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestErr) throw new Error(latestErr.message);
  if (!latestRow?.fecha_lista) {
    return { precios: [], fechaLista: null };
  }

  const { data, error } = await supabase
    .from('precios')
    .select('*')
    .eq('fecha_lista', latestRow.fecha_lista)
    .order('codigo_producto', { ascending: true });

  if (error) throw new Error(error.message);

  return {
    precios: (data ?? []) as Precio[],
    fechaLista: latestRow.fecha_lista,
  };
}

async function parseJson<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Error en la solicitud');
  return json as T;
}

export async function syncPreciosNow(): Promise<SyncPreciosResponse> {
  const res = await fetch('/api/precios/sync', { method: 'POST' });
  return parseJson<SyncPreciosResponse>(res);
}
