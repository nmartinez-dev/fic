import type { SupabaseClient } from '@supabase/supabase-js';
import { todayISO } from '@/lib/format';
import type { EstadoDato } from '@/types/venta';

const ESTADOS_FLAGGED: EstadoDato[] = ['duplicada', 'rota'];

const ESTADO_LABEL: Record<EstadoDato, string> = {
  valida: 'Válida',
  duplicada: 'Duplicada',
  rota: 'Rota',
};

function tituloVenta(producto: string | null, estado: EstadoDato): string {
  const nombre = producto?.trim() || 'Venta sin producto';
  return `${nombre} (${ESTADO_LABEL[estado].toLowerCase()})`;
}

function cuerpoVenta(estado: EstadoDato, motivo: string | null): string {
  const base =
    estado === 'duplicada'
      ? 'Esta venta parece duplicada y no suma en el dashboard.'
      : 'Esta venta tiene datos inconsistentes.';
  return motivo ? `${base} Motivo: ${motivo}` : base;
}

/**
 * Crea avisos para ventas duplicadas o rotas y resuelve los corregidos.
 */
export async function syncAvisosVentas(
  db: SupabaseClient
): Promise<{ creados: number; resueltos: number }> {
  const hoy = todayISO();

  const { data: ventas, error: ventasErr } = await db
    .from('ventas')
    .select('id, producto, estado_dato, motivo_flag')
    .in('estado_dato', ESTADOS_FLAGGED);

  if (ventasErr) throw new Error(ventasErr.message);

  const flaggedIds = new Set<string>();
  let creados = 0;

  for (const v of ventas ?? []) {
    flaggedIds.add(v.id as string);
    const estado = v.estado_dato as EstadoDato;

    const { error: insertErr } = await db.from('avisos').insert({
      tipo: 'venta',
      titulo: tituloVenta(v.producto as string | null, estado),
      cuerpo: cuerpoVenta(estado, v.motivo_flag as string | null),
      fecha: hoy,
      estado: 'pendiente',
      venta_id: v.id,
    });

    if (!insertErr) {
      creados += 1;
    }
  }

  const { data: avisosPendientes, error: avisosErr } = await db
    .from('avisos')
    .select('id, venta_id')
    .eq('tipo', 'venta')
    .eq('estado', 'pendiente')
    .not('venta_id', 'is', null);

  if (avisosErr) throw new Error(avisosErr.message);

  let resueltos = 0;

  for (const aviso of avisosPendientes ?? []) {
    const ventaId = aviso.venta_id as string;
    if (flaggedIds.has(ventaId)) continue;

    const { error: resolveErr } = await db
      .from('avisos')
      .update({
        estado: 'resuelto',
        resuelto_at: new Date().toISOString(),
      })
      .eq('id', aviso.id);

    if (!resolveErr) resueltos += 1;
  }

  return { creados, resueltos };
}
