import { createClient } from '@/lib/supabase/client';
import type {
  EstadoVencimiento,
  NuevoVencimiento,
  Vencimiento,
} from '@/types/vencimiento';

export async function listVencimientos(): Promise<Vencimiento[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('v_vencimientos')
    .select('*')
    .order('fecha', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Vencimiento[];
}

export async function createVencimiento(
  input: NuevoVencimiento
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('vencimientos').insert({
    titulo: input.titulo,
    fecha: input.fecha,
    monto: input.monto,
    proveedor_id: input.proveedor_id ?? null,
    factura_id: input.factura_id ?? null,
  });
  if (error) throw new Error(error.message);
}

/** Mueve un vencimiento a otra fecha (drag & drop del calendario). */
export async function moverVencimiento(
  id: string,
  fecha: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('vencimientos')
    .update({ fecha })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function setEstadoVencimiento(
  id: string,
  estado: EstadoVencimiento
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('vencimientos')
    .update({ estado })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
