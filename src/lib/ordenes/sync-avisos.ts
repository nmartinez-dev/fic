import type { SupabaseClient } from '@supabase/supabase-js';
import { daysBetween, todayISO } from '@/lib/format';

type OrdenPendiente = {
  id: string;
  numero: string | null;
  fecha: string;
  descripcion: string | null;
  proveedor_id: string | null;
  proveedor: { nombre: string } | null;
};

function tituloOrden(numero: string | null): string {
  return numero ? `Pedido ${numero} sin recibir` : 'Pedido sin recibir';
}

function cuerpoOrden(orden: OrdenPendiente, dias: number): string {
  const partes: string[] = [];
  if (orden.proveedor?.nombre) {
    partes.push(`Proveedor: ${orden.proveedor.nombre}`);
  }
  if (orden.descripcion) {
    partes.push(`Descripción: ${orden.descripcion}`);
  }
  partes.push(`Pedido del ${orden.fecha}, lleva ${dias} días sin cerrarse.`);
  return partes.join('\n');
}

/**
 * Crea avisos para órdenes pendientes/parciales que superan el umbral de días
 * configurado, y resuelve avisos de órdenes ya cerradas.
 */
export async function syncAvisosOrdenesPendientes(
  db: SupabaseClient
): Promise<{ creados: number; resueltos: number }> {
  const { data: settings, error: settingsErr } = await db
    .from('settings')
    .select('dias_aviso_orden_pendiente')
    .eq('id', 1)
    .single();

  if (settingsErr) throw new Error(settingsErr.message);

  const umbral = (settings?.dias_aviso_orden_pendiente as number | undefined) ?? 14;
  const hoy = todayISO();

  const { data: ordenes, error: ordenesErr } = await db
    .from('ordenes_compra')
    .select('id, numero, fecha, descripcion, proveedor_id, proveedor:proveedores(nombre)')
    .in('estado', ['pendiente', 'parcial']);

  if (ordenesErr) throw new Error(ordenesErr.message);

  let creados = 0;

  for (const raw of ordenes ?? []) {
    const orden = raw as unknown as OrdenPendiente;
    const dias = daysBetween(orden.fecha, hoy);
    if (dias < umbral) continue;

    const { error: insertErr } = await db.from('avisos').insert({
      tipo: 'orden',
      titulo: tituloOrden(orden.numero),
      cuerpo: cuerpoOrden(orden, dias),
      fecha: hoy,
      estado: 'pendiente',
      orden_id: orden.id,
      proveedor_id: orden.proveedor_id,
    });

    if (!insertErr) {
      creados += 1;
    }
  }

  const { data: avisosPendientes, error: avisosErr } = await db
    .from('avisos')
    .select('id, orden_id')
    .eq('tipo', 'orden')
    .eq('estado', 'pendiente')
    .not('orden_id', 'is', null);

  if (avisosErr) throw new Error(avisosErr.message);

  const ordenesAbiertas = new Set((ordenes ?? []).map((o) => o.id as string));
  let resueltos = 0;

  for (const aviso of avisosPendientes ?? []) {
    const ordenId = aviso.orden_id as string;
    if (ordenesAbiertas.has(ordenId)) continue;

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
