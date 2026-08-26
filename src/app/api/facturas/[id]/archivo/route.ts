import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AuthorizationError, requireArea } from '@/lib/auth/session';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    await requireArea('facturas');
    const { id } = await context.params;

    const db = await createClient();
    const { data: factura, error } = await db
      .from('facturas')
      .select('archivo_path')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!factura?.archivo_path) {
      return NextResponse.json(
        { error: 'Esta factura no tiene archivo original guardado.' },
        { status: 404 }
      );
    }

    const admin = createAdminClient();
    const { data: signed, error: signErr } = await admin.storage
      .from('facturas')
      .createSignedUrl(factura.archivo_path, 3600);

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
