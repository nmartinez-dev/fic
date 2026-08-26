import { createClient } from '@/lib/supabase/client';
import type { FacturaConSaldo, UpdateFacturaInput } from '@/types/factura';
import type { IngestResultado } from '@/lib/ingest/ingest';

function mapFacturaConSaldo(row: Record<string, unknown>): FacturaConSaldo {
  const { rubro_id, ...rest } = row;
  return {
    ...rest,
    categoria_id: (rubro_id as string | null) ?? null,
  } as FacturaConSaldo;
}

export async function listFacturas(): Promise<FacturaConSaldo[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('v_facturas')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) =>
    mapFacturaConSaldo(row as Record<string, unknown>)
  );
}

async function parseJson(res: Response): Promise<Record<string, unknown>> {
  return (await res.json()) as Record<string, unknown>;
}

export async function getFacturaArchivoUrl(id: string): Promise<string> {
  const res = await fetch(`/api/facturas/${id}/archivo`);
  const json = await parseJson(res);
  if (!res.ok) throw new Error((json.error as string) ?? 'No se pudo abrir el archivo');
  return json.url as string;
}

export async function updateFactura(
  id: string,
  input: UpdateFacturaInput
): Promise<void> {
  const res = await fetch(`/api/facturas/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const json = await parseJson(res);
  if (!res.ok) throw new Error((json.error as string) ?? 'Error al guardar');
}

export async function deleteFactura(id: string): Promise<void> {
  const res = await fetch(`/api/facturas/${id}`, { method: 'DELETE' });
  const json = await parseJson(res);
  if (!res.ok) throw new Error((json.error as string) ?? 'Error al eliminar');
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
