import { createClient } from '@/lib/supabase/client';
import type { FacturaConSaldo } from '@/types/factura';
import type { IngestResultado } from '@/lib/ingest/ingest';

export async function listFacturas(): Promise<FacturaConSaldo[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('v_facturas')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as FacturaConSaldo[];
}

export type IngestResponse = IngestResultado & {
  extraida: {
    proveedorNombre: string | null;
    numero: string | null;
    total: number | null;
  };
};

/** Sube un archivo de factura al pipeline de ingesta (API server-side). */
export async function ingestFacturaFile(file: File): Promise<IngestResponse> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/facturas/ingest', {
    method: 'POST',
    body: form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Error al procesar la factura');
  return json as IngestResponse;
}
