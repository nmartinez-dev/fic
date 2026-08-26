import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AuthorizationError, requireArea } from '@/lib/auth/session';
import { syncPrecios } from '@/lib/precios/sync';

export const maxDuration = 60;

export async function POST() {
  try {
    await requireArea('precios');
    const db = createAdminClient();
    const result = await syncPrecios(db);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : 'Error inesperado';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
