import { createClient } from '@/lib/supabase/client';
import type { Aviso } from '@/types/aviso';

export async function listAvisos(): Promise<Aviso[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('avisos')
    .select('*')
    .order('estado', { ascending: true })
    .order('fecha', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Aviso[];
}

export async function resolverAviso(id: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('avisos')
    .update({
      estado: 'resuelto',
      resuelto_por: user?.id ?? null,
      resuelto_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function reabrirAviso(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('avisos')
    .update({ estado: 'pendiente', resuelto_por: null, resuelto_at: null })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
