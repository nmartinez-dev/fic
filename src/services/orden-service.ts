import { createClient } from '@/lib/supabase/client';
import type {
  EstadoOrden,
  NuevaOrden,
  OrdenCompra,
  OrdenCompraConProveedor,
} from '@/types/orden';

export async function listOrdenes(): Promise<OrdenCompraConProveedor[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('ordenes_compra')
    .select('*, proveedor:proveedores(id, nombre)')
    .order('fecha', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as OrdenCompraConProveedor[];
}

export async function createOrden(input: NuevaOrden): Promise<OrdenCompra> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('ordenes_compra')
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as OrdenCompra;
}

export async function updateEstadoOrden(
  id: string,
  estado: EstadoOrden
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('ordenes_compra')
    .update({ estado })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
