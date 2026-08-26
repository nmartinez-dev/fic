import { createClient } from '@/lib/supabase/client';
import type { Venta } from '@/types/venta';

export async function listVentas(): Promise<Venta[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('ventas')
    .select('*')
    .order('fecha', { ascending: false, nullsFirst: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Venta[];
}
