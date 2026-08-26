import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { FacturaExtraida } from '@/types/factura';
import type { ProveedorMatch } from '@/types/proveedor';
import { buildHashDedup } from '@/lib/ingest/dedup';
import { addDays, formatISO } from 'date-fns';

/** Score minimo de similitud para asignar proveedor sin intervencion humana. */
export const AUTO_MATCH_THRESHOLD = 0.55;

export type IngestResultado = {
  facturaId: string;
  estado: 'confirmada' | 'en_revision';
  motivosRevision: string[];
};

type Db = SupabaseClient;

async function matchProveedor(
  db: Db,
  nombre: string
): Promise<ProveedorMatch[]> {
  const { data, error } = await db.rpc('match_proveedor', { p_nombre: nombre });
  if (error || !data) return [];
  return data as ProveedorMatch[];
}

/**
 * Orquesta la ingesta de una factura ya extraida:
 *  1. dedupe (misma factura cargada dos veces)
 *  2. entity resolution del proveedor (pg_trgm)
 *  3. chequeo de datos criticos faltantes
 * Lo que no se resuelve con certeza NO se adivina: la factura queda
 * 'en_revision' y se crean items en la cola de revision.
 */
export async function ingestFactura(
  db: Db,
  extraida: FacturaExtraida,
  archivoPath: string | null
): Promise<IngestResultado> {
  const motivosRevision: string[] = [];
  const hash = buildHashDedup(
    extraida.proveedorNombre,
    extraida.numero,
    extraida.total
  );

  // 1) Deduplicacion.
  let duplicadoDe: string | null = null;
  if (hash) {
    const { data: dup } = await db
      .from('facturas')
      .select('id')
      .eq('hash_dedup', hash)
      .eq('estado', 'confirmada')
      .limit(1)
      .maybeSingle();
    if (dup) {
      duplicadoDe = dup.id as string;
      motivosRevision.push('posible_duplicado');
    }
  }

  // 2) Entity resolution del proveedor.
  let proveedorId: string | null = null;
  let candidatos: ProveedorMatch[] = [];
  if (extraida.proveedorNombre) {
    candidatos = await matchProveedor(db, extraida.proveedorNombre);
    const mejor = candidatos[0];
    if (mejor && mejor.score >= AUTO_MATCH_THRESHOLD) {
      proveedorId = mejor.proveedor_id;
    } else {
      motivosRevision.push('proveedor_ambiguo');
    }
  } else {
    motivosRevision.push('proveedor_ambiguo');
  }

  // 3) Datos criticos faltantes.
  const criticos = extraida.camposFaltantes.filter(
    (c) => c === 'total' || c === 'numero'
  );
  if (criticos.length > 0) motivosRevision.push('dato_incompleto');

  const estado = motivosRevision.length === 0 ? 'confirmada' : 'en_revision';

  // Vencimiento estimado = fecha + terminos del proveedor (si se conocen).
  let fechaVencimiento: string | null = null;
  if (extraida.fecha && proveedorId) {
    const { data: prov } = await db
      .from('proveedores')
      .select('terminos_pago_dias')
      .eq('id', proveedorId)
      .maybeSingle();
    const dias = (prov?.terminos_pago_dias as number | undefined) ?? 30;
    fechaVencimiento = formatISO(addDays(new Date(extraida.fecha), dias), {
      representation: 'date',
    });
  }

  const { data: factura, error } = await db
    .from('facturas')
    .insert({
      proveedor_id: proveedorId,
      raw_proveedor_nombre: extraida.proveedorNombre,
      numero: extraida.numero,
      fecha: extraida.fecha,
      fecha_vencimiento: fechaVencimiento,
      total: extraida.total ?? 0,
      estado,
      origen: extraida.origen,
      archivo_path: archivoPath,
      hash_dedup: hash,
    })
    .select('id')
    .single();

  if (error || !factura) {
    throw new Error(`No se pudo guardar la factura: ${error?.message}`);
  }
  const facturaId = factura.id as string;

  // Aprendizaje: si matcheo automatico, guardamos esta forma de escribir el
  // nombre como alias (asi la proxima matchea directo).
  if (estado === 'confirmada' && proveedorId && extraida.proveedorNombre) {
    await db
      .from('proveedor_alias')
      .insert({ proveedor_id: proveedorId, alias: extraida.proveedorNombre })
      .then(undefined, () => undefined);
  }

  // Items de la cola de revision.
  for (const motivo of motivosRevision) {
    const item = buildRevisionItem(motivo, facturaId, extraida, {
      candidatos,
      duplicadoDe,
    });
    if (item) await db.from('revision_queue').insert(item as never);
  }

  return { facturaId, estado, motivosRevision };
}

function buildRevisionItem(
  motivo: string,
  facturaId: string,
  extraida: FacturaExtraida,
  ctx: { candidatos: ProveedorMatch[]; duplicadoDe: string | null }
) {
  switch (motivo) {
    case 'posible_duplicado':
      return {
        tipo: 'posible_duplicado',
        entidad: 'factura',
        entidad_id: facturaId,
        titulo: `Posible duplicado de factura ${extraida.numero ?? ''}`.trim(),
        payload: { factura_original: ctx.duplicadoDe, motivo: 'mismo número, proveedor y total' },
      };
    case 'proveedor_ambiguo':
      return {
        tipo: 'proveedor_ambiguo',
        entidad: 'factura',
        entidad_id: facturaId,
        titulo: `No se reconoció el proveedor "${extraida.proveedorNombre ?? 'desconocido'}"`,
        payload: { raw_nombre: extraida.proveedorNombre, candidatos: ctx.candidatos },
      };
    case 'dato_incompleto':
      return {
        tipo: 'dato_incompleto',
        entidad: 'factura',
        entidad_id: facturaId,
        titulo: 'Faltan datos en la factura',
        payload: { camposFaltantes: extraida.camposFaltantes },
      };
    default:
      return null;
  }
}
