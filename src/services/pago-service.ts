import { createClient } from '@/lib/supabase/client';
import type { Pago, NuevoPago } from '@/types/pago';

export async function listPagosByFactura(facturaId: string): Promise<Pago[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('pagos')
    .select('*')
    .eq('factura_id', facturaId)
    .order('fecha', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Pago[];
}

/**
 * Registra un pago (total o parcial). El estado_pago de la factura lo
 * recalcula el trigger recompute_factura_estado_pago, no la app.
 */
export async function createPago(input: NuevoPago): Promise<Pago> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('pagos')
    .insert({ ...input, created_by: user?.id ?? null })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Pago;
}
