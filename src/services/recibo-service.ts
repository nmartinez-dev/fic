import { createClient } from '@/lib/supabase/client';
import type { Recibo } from '@/types/recibo';

/**
 * Genera el comprobante de recepción de una factura. No es un pago: deja
 * constancia de que la factura entró y va a pagarse antes del vencimiento.
 * El número se arma correlativo (R-000N) a partir de los ya emitidos.
 */
export async function generarRecibo(facturaId: string): Promise<Recibo> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count } = await supabase
    .from('recibos')
    .select('id', { count: 'exact', head: true });
  const numero = `R-${String((count ?? 0) + 1).padStart(4, '0')}`;

  const { data, error } = await supabase
    .from('recibos')
    .insert({
      factura_id: facturaId,
      numero,
      generado_por: user?.id ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Recibo;
}
