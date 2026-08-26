import { createClient } from '@/lib/supabase/client';
import type {
  Proveedor,
  ProveedorCuentaCorriente,
  ProveedorMatch,
} from '@/types/proveedor';

export async function listProveedores(): Promise<Proveedor[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('proveedores')
    .select('*')
    .order('nombre');
  if (error) throw new Error(error.message);
  return (data ?? []) as Proveedor[];
}

export async function listCuentaCorriente(): Promise<ProveedorCuentaCorriente[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('proveedor_cuenta_corriente')
    .select('*')
    .order('saldo', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ProveedorCuentaCorriente[];
}

export async function matchProveedor(
  nombre: string
): Promise<ProveedorMatch[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('match_proveedor', {
    p_nombre: nombre,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as ProveedorMatch[];
}

export async function createProveedor(input: {
  nombre: string;
  cuit?: string;
  email?: string;
  telefono?: string;
  terminos_pago_dias?: number;
}): Promise<Proveedor> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('proveedores')
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Proveedor;
}

/** Guarda una nueva forma de escribir el nombre de un proveedor. */
export async function addAlias(
  proveedorId: string,
  alias: string
): Promise<void> {
  const supabase = createClient();
  await supabase
    .from('proveedor_alias')
    .insert({ proveedor_id: proveedorId, alias });
}
