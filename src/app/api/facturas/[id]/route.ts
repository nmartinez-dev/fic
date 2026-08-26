import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AuthorizationError, requireArea } from '@/lib/auth/session';
import { buildHashDedup } from '@/lib/ingest/dedup';
import { normalizeProveedorNombre } from '@/lib/ingest/extract';
import { updateFacturaSchema } from '@/types/factura';

type RouteContext = { params: Promise<{ id: string }> };

async function nombreParaHash(
  db: Awaited<ReturnType<typeof createClient>>,
  proveedorId: string | null,
  rawNombre: string | null
): Promise<string | null> {
  if (proveedorId) {
    const { data } = await db
      .from('proveedores')
      .select('nombre')
      .eq('id', proveedorId)
      .maybeSingle();
    if (data?.nombre) return normalizeProveedorNombre(data.nombre as string);
  }
  return rawNombre ? normalizeProveedorNombre(rawNombre) : null;
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    await requireArea('facturas');
    const { id } = await context.params;
    const body = await req.json();
    const parsed = updateFacturaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Datos inválidos' },
        { status: 400 }
      );
    }

    const db = await createClient();
    const { data: actual, error: fetchErr } = await db
      .from('facturas')
      .select('id, proveedor_id, raw_proveedor_nombre, numero, total')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr) throw new Error(fetchErr.message);
    if (!actual) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    const patch = parsed.data;
    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: 'No hay cambios para guardar.' },
        { status: 400 }
      );
    }

    const proveedorId =
      patch.proveedor_id !== undefined
        ? patch.proveedor_id
        : (actual.proveedor_id as string | null);
    const numero =
      patch.numero !== undefined ? patch.numero : (actual.numero as string | null);
    const total =
      patch.total !== undefined ? patch.total : Number(actual.total);

    const nombreHash = await nombreParaHash(
      db,
      proveedorId,
      actual.raw_proveedor_nombre as string | null
    );
    const hash_dedup = buildHashDedup(nombreHash, numero, total);

    const { data, error } = await db
      .from('facturas')
      .update({ ...patch, hash_dedup })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : 'Error inesperado';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    await requireArea('facturas');
    const { id } = await context.params;

    const db = await createClient();
    const { data: factura, error: fetchErr } = await db
      .from('facturas')
      .select('archivo_path')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr) throw new Error(fetchErr.message);
    if (!factura) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    await db
      .from('revision_queue')
      .delete()
      .eq('entidad', 'factura')
      .eq('entidad_id', id);

    const { error: delErr } = await db.from('facturas').delete().eq('id', id);
    if (delErr) throw new Error(delErr.message);

    if (factura.archivo_path) {
      try {
        const admin = createAdminClient();
        await admin.storage.from('facturas').remove([factura.archivo_path as string]);
      } catch {
        // El archivo en storage es secundario; la factura ya se eliminó.
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : 'Error inesperado';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
