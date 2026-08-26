import { createClient } from '@/lib/supabase/client';
import type { RevisionItem } from '@/types/revision';
import * as proveedorService from '@/services/proveedor-service';

export async function listPendientes(): Promise<RevisionItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('revision_queue')
    .select('*')
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as RevisionItem[];
}

async function marcarResuelto(
  itemId: string,
  resolucion: Record<string, unknown>,
  estado: 'resuelto' | 'descartado' = 'resuelto'
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase
    .from('revision_queue')
    .update({
      estado,
      resolucion,
      resuelto_por: user?.id ?? null,
      resuelto_at: new Date().toISOString(),
    })
    .eq('id', itemId);
}

/**
 * Si la factura ya no tiene items de revision pendientes, la damos por
 * confirmada (pasa a impactar en la cuenta corriente).
 */
async function confirmarFacturaSiListo(facturaId: string): Promise<void> {
  const supabase = createClient();
  const { count } = await supabase
    .from('revision_queue')
    .select('id', { count: 'exact', head: true })
    .eq('entidad_id', facturaId)
    .eq('estado', 'pendiente');
  if ((count ?? 0) === 0) {
    await supabase
      .from('facturas')
      .update({ estado: 'confirmada' })
      .eq('id', facturaId);
  }
}

/** Asigna un proveedor existente a la factura en revision. */
export async function asignarProveedor(
  item: RevisionItem,
  proveedorId: string
): Promise<void> {
  const supabase = createClient();
  if (item.entidad_id) {
    await supabase
      .from('facturas')
      .update({ proveedor_id: proveedorId })
      .eq('id', item.entidad_id);
    // Aprendemos la forma de escribir el nombre para la proxima.
    if (item.payload.raw_nombre) {
      await proveedorService.addAlias(proveedorId, item.payload.raw_nombre);
    }
  }
  await marcarResuelto(item.id, { proveedor_id: proveedorId });
  if (item.entidad_id) await confirmarFacturaSiListo(item.entidad_id);
}

/** Crea un proveedor nuevo y lo asigna a la factura. */
export async function crearYAsignarProveedor(
  item: RevisionItem,
  nombre: string
): Promise<void> {
  const proveedor = await proveedorService.createProveedor({ nombre });
  await asignarProveedor(item, proveedor.id);
}

/** Confirma que es un duplicado: elimina la factura duplicada. */
export async function confirmarDuplicado(item: RevisionItem): Promise<void> {
  const supabase = createClient();
  if (item.entidad_id) {
    await supabase.from('facturas').delete().eq('id', item.entidad_id);
  }
  await marcarResuelto(item.id, { es_duplicado: true });
}

/** No era duplicado: se mantiene la factura. */
export async function noEsDuplicado(item: RevisionItem): Promise<void> {
  await marcarResuelto(item.id, { es_duplicado: false });
  if (item.entidad_id) await confirmarFacturaSiListo(item.entidad_id);
}

/** Descarta el item sin accion (ej: dato incompleto que se corrige aparte). */
export async function descartar(item: RevisionItem): Promise<void> {
  await marcarResuelto(item.id, { descartado: true }, 'descartado');
  if (item.entidad_id) await confirmarFacturaSiListo(item.entidad_id);
}
