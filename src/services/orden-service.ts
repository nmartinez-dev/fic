import { createClient } from '@/lib/supabase/client';
import type {
  EstadoOrden,
  NuevaOrden,
  OrdenCompra,
  OrdenCompraConProveedor,
  UpdateOrdenInput,
} from '@/types/orden';

async function resolverAvisosOrden(ordenId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase
    .from('avisos')
    .update({
      estado: 'resuelto',
      resuelto_por: user?.id ?? null,
      resuelto_at: new Date().toISOString(),
    })
    .eq('orden_id', ordenId)
    .eq('tipo', 'orden')
    .eq('estado', 'pendiente');
}

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

export async function updateOrden(
  id: string,
  input: UpdateOrdenInput
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('ordenes_compra')
    .update(input)
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteOrden(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('ordenes_compra').delete().eq('id', id);
  if (error) throw new Error(error.message);
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

  if (estado === 'recibida' || estado === 'cancelada') {
    await resolverAvisosOrden(id);
  }
}
