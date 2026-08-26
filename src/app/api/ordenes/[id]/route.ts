import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AuthorizationError, requireArea } from '@/lib/auth/session';

const BUCKET = 'ordenes';

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    await requireArea('ordenes');
    const { id } = await context.params;

    const db = await createClient();
    const { data: orden, error: fetchErr } = await db
      .from('ordenes_compra')
      .select('archivo_path')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr) throw new Error(fetchErr.message);
    if (!orden) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const { error: delErr } = await db.from('ordenes_compra').delete().eq('id', id);
    if (delErr) throw new Error(delErr.message);

    if (orden.archivo_path) {
      try {
        const admin = createAdminClient();
        await admin.storage.from(BUCKET).remove([orden.archivo_path as string]);
      } catch {
        // El archivo en storage es secundario; la orden ya se eliminó.
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
