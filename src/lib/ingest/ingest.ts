import type { SupabaseClient } from '@supabase/supabase-js';
import type { FacturaExtraida } from '@/types/factura';
import type { ProveedorMatch } from '@/types/proveedor';
import type { RubroMatch } from '@/types/rubro';
import { buildHashDedup } from '@/lib/ingest/dedup';
import { normalizeProveedorNombre, normalizeRubroNombre } from '@/lib/ingest/extract';
import { addDays, formatISO } from 'date-fns';

/** Score minimo de similitud para asignar proveedor o rubro sin intervencion humana. */
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

async function matchRubro(db: Db, nombre: string): Promise<RubroMatch[]> {
  const { data, error } = await db.rpc('match_rubro', { p_nombre: nombre });
  if (error || !data) return [];
  return data as RubroMatch[];
}

/**
 * Orquesta la ingesta de una factura ya extraida:
 *  1. dedupe (misma factura cargada dos veces)
 *  2. entity resolution del proveedor (pg_trgm)
 *  3. entity resolution del rubro (pg_trgm, no bloqueante)
 *  4. chequeo de datos criticos faltantes
 * Lo que no se resuelve con certeza NO se adivina: la factura queda
 * 'en_revision' y se crean items en la cola de revision.
 */
export async function ingestFactura(
  db: Db,
  extraida: FacturaExtraida,
  archivoPath: string | null
): Promise<IngestResultado> {
  const motivosRevision: string[] = [];
  const nombreProveedor = extraida.proveedorNombre
    ? normalizeProveedorNombre(extraida.proveedorNombre)
    : null;
  const nombreRubro = extraida.rubroNombre
    ? normalizeRubroNombre(extraida.rubroNombre)
    : null;

  const hash = buildHashDedup(
    nombreProveedor,
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
  let candidatosProveedor: ProveedorMatch[] = [];

  if (nombreProveedor) {
    candidatosProveedor = await matchProveedor(db, nombreProveedor);
    const mejor = candidatosProveedor[0];
    if (mejor && mejor.score >= AUTO_MATCH_THRESHOLD) {
      proveedorId = mejor.proveedor_id;
    } else {
      motivosRevision.push('proveedor_ambiguo');
    }
  } else {
    motivosRevision.push('proveedor_ambiguo');
  }

  // 3) Entity resolution del rubro (opcional; no bloquea confirmacion).
  let rubroId: string | null = null;
  let candidatosRubro: RubroMatch[] = [];
  let rubroAmbiguoItem: {
    tipo: 'rubro_ambiguo';
    entidad: string;
    entidad_id: string | null;
    titulo: string;
    payload: { raw_rubro: string | null | undefined; rubro_candidatos: RubroMatch[] };
  } | null = null;

  if (nombreRubro) {
    candidatosRubro = await matchRubro(db, nombreRubro);
    const mejorRubro = candidatosRubro[0];
    if (mejorRubro && mejorRubro.score >= AUTO_MATCH_THRESHOLD) {
      rubroId = mejorRubro.rubro_id;
    } else {
      rubroAmbiguoItem = {
        tipo: 'rubro_ambiguo',
        entidad: 'factura',
        entidad_id: null,
        titulo: `No se reconoció el rubro "${extraida.rubroNombre ?? 'desconocido'}"`,
        payload: {
          raw_rubro: extraida.rubroNombre,
          rubro_candidatos: candidatosRubro,
        },
      };
    }
  }

  // 4) Datos criticos faltantes.
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
      raw_proveedor_nombre: nombreProveedor ?? extraida.proveedorNombre,
      rubro_id: rubroId,
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

  // Aprendizaje: si matcheo automatico, guardamos alias para la proxima.
  if (estado === 'confirmada' && proveedorId && nombreProveedor) {
    await db
      .from('proveedor_alias')
      .insert({ proveedor_id: proveedorId, alias: nombreProveedor })
      .then(undefined, () => undefined);
  }
  if (rubroId && nombreRubro) {
    await db
      .from('rubro_alias')
      .insert({ rubro_id: rubroId, alias: nombreRubro })
      .then(undefined, () => undefined);
  }

  // Items de la cola de revision (bloqueantes).
  for (const motivo of motivosRevision) {
    const item = buildRevisionItem(motivo, facturaId, extraida, {
      candidatos: candidatosProveedor,
      duplicadoDe,
    });
    if (item) await db.from('revision_queue').insert(item as never);
  }

  // Rubro ambiguo: revision paralela, no bloquea confirmacion.
  if (rubroAmbiguoItem) {
    await db.from('revision_queue').insert({
      ...rubroAmbiguoItem,
      entidad_id: facturaId,
    } as never);
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
        payload: {
          factura_original: ctx.duplicadoDe,
          motivo: 'mismo número, proveedor y total',
        },
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
