import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireArea, AuthorizationError } from '@/lib/auth/session';
import { detectKind, parsePdf, parseXlsx } from '@/lib/ingest/parse';
import { extractFromText } from '@/lib/ingest/extract';
import { extractWithAI } from '@/lib/ingest/ocr';
import { ingestFactura } from '@/lib/ingest/ingest';
import type { FacturaExtraida, OrigenFactura } from '@/types/factura';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    await requireArea('facturas');

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const kind = detectKind(file.type, file.name);

    let extraida: FacturaExtraida;

    if (kind === 'pdf') {
      const parsed = await parsePdf(buffer);
      if (parsed.necesitaOcr) {
        const ai = await extractWithAI(
          new Uint8Array(buffer),
          'application/pdf',
          'pdf_escaneado'
        );
        extraida =
          ai ?? emptyExtraida('pdf_escaneado', ['proveedor', 'numero', 'fecha', 'total']);
      } else {
        extraida = extractFromText(parsed.text, 'pdf');
      }
    } else if (kind === 'xlsx') {
      const parsed = parseXlsx(buffer);
      extraida = extractFromText(parsed.text, 'excel');
    } else if (kind === 'image') {
      const ai = await extractWithAI(
        new Uint8Array(buffer),
        file.type,
        'pdf_escaneado'
      );
      extraida =
        ai ?? emptyExtraida('pdf_escaneado', ['proveedor', 'numero', 'fecha', 'total']);
    } else {
      return NextResponse.json(
        { error: 'Formato no soportado (usá PDF, Excel o imagen)' },
        { status: 400 }
      );
    }

    // Guardamos el archivo original (auditoria / recibos) con service role.
    let archivoPath: string | null = null;
    try {
      const admin = createAdminClient();
      const path = `${crypto.randomUUID()}-${file.name}`;
      const { error: upErr } = await admin.storage
        .from('facturas')
        .upload(path, buffer, { contentType: file.type, upsert: false });
      if (!upErr) archivoPath = path;
    } catch {
      // El archivo es opcional; si falla el storage seguimos con los datos.
    }

    const db = await createClient();
    const resultado = await ingestFactura(db, extraida, archivoPath);

    return NextResponse.json({ ...resultado, extraida });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : 'Error inesperado';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function emptyExtraida(
  origen: OrigenFactura,
  camposFaltantes: string[]
): FacturaExtraida {
  return {
    proveedorNombre: null,
    rubroNombre: null,
    numero: null,
    fecha: null,
    total: null,
    origen,
    camposFaltantes,
  };
}
