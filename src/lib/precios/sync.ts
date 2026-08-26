import type { SupabaseClient } from '@supabase/supabase-js';
import { todayISO } from '@/lib/format';
import { fetchPreciosFromPortal } from '@/lib/precios/portal';

export type SyncPreciosResult = {
  total: number;
  fecha: string;
};

async function crearAvisoFallo(
  db: SupabaseClient,
  mensaje: string
): Promise<void> {
  const hoy = todayISO();
  await db.from('avisos').insert({
    tipo: 'sistema',
    titulo: 'No se pudieron actualizar los precios',
    cuerpo: mensaje,
    fecha: hoy,
    estado: 'pendiente',
  });
}

/**
 * Descarga precios del portal y los guarda en `precios` (lista del día).
 * Si falla, crea un aviso en la bandeja y relanza el error.
 */
export async function syncPrecios(
  db: SupabaseClient
): Promise<SyncPreciosResult> {
  const fecha = todayISO();

  let rows;
  try {
    rows = await fetchPreciosFromPortal();
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Error desconocido al contactar el portal.';
    await crearAvisoFallo(db, msg);
    throw err;
  }

  const payload = rows.map((r) => ({
    codigo_producto: r.codigo_producto,
    descripcion: r.descripcion,
    categoria: r.categoria,
    subcategoria: r.subcategoria,
    precio: r.precio,
    stock: r.stock,
    fecha_lista: fecha,
    proveedor_id: null,
  }));

  const { error } = await db.from('precios').upsert(payload, {
    onConflict: 'codigo_producto,fecha_lista',
  });

  if (error) {
    const msg = error.message;
    await crearAvisoFallo(db, msg);
    throw new Error(msg);
  }

  return { total: rows.length, fecha };
}
