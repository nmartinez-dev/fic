import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AuthorizationError, requireArea } from '@/lib/auth/session';

const BUCKET = 'ordenes';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    await requireArea('ordenes');
    const { id } = await context.params;

    const db = await createClient();
    const { data: orden, error } = await db
      .from('ordenes_compra')
      .select('archivo_path')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!orden?.archivo_path) {
      return NextResponse.json(
        { error: 'Esta orden no tiene documento adjunto.' },
        { status: 404 }
      );
    }

    const admin = createAdminClient();
    const { data: signed, error: signErr } = await admin.storage
      .from(BUCKET)
      .createSignedUrl(orden.archivo_path, 3600);

    if (signErr || !signed?.signedUrl) {
      return NextResponse.json(
        { error: signErr?.message ?? 'No se pudo abrir el archivo.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: signed.signedUrl });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : 'Error inesperado';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request, context: RouteContext) {
  try {
    await requireArea('ordenes');
    const { id } = await context.params;

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 });
    }

    const db = await createClient();
    const { data: orden, error: fetchErr } = await db
      .from('ordenes_compra')
      .select('id, archivo_path')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr) throw new Error(fetchErr.message);
    if (!orden) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const buffer = await file.arrayBuffer();
    const admin = createAdminClient();
    const path = `${id}/${crypto.randomUUID()}-${file.name}`;

    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (upErr) {
      return NextResponse.json(
        { error: upErr.message ?? 'No se pudo guardar el archivo.' },
        { status: 500 }
      );
    }

    const { error: updateErr } = await db
      .from('ordenes_compra')
      .update({ archivo_path: path })
      .eq('id', id);

    if (updateErr) {
      await admin.storage.from(BUCKET).remove([path]);
      throw new Error(updateErr.message);
    }

    const oldPath = orden.archivo_path as string | null;
    if (oldPath) {
      await admin.storage.from(BUCKET).remove([oldPath]).then(undefined, () => undefined);
    }

    return NextResponse.json({ archivo_path: path });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : 'Error inesperado';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
